import uuid
import os
import shutil
from typing import List, Optional
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db, Project, Document, Chunk
from services.ingestion import process_document, process_raw_text
from services.scraper import scrape_url, crawl_site
from utils.auth import verify_admin_api_key
from config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api", tags=["documents"])

# Ensure upload directory exists
UPLOAD_DIR = Path(settings.local_storage_path)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


class DocumentResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    filename: str
    original_filename: Optional[str]
    file_type: Optional[str]
    content_type: str
    upload_date: datetime
    processed: bool
    processing_error: Optional[str]
    page_count: Optional[int]
    tags: List[str]
    chunk_count: int = 0

    class Config:
        from_attributes = True


class TextContentCreate(BaseModel):
    content: str
    source_name: str = "Manual Entry"
    content_type: str = "public"
    tags: Optional[List[str]] = []


class ScrapeRequest(BaseModel):
    url: str
    content_type: str = "public"
    tags: Optional[List[str]] = []


class CrawlSiteRequest(BaseModel):
    url: str
    content_type: str = "public"
    tags: Optional[List[str]] = []
    max_pages: int = 50


def process_document_background(
    document_id: uuid.UUID, file_path: str
):
    """Background task to process uploaded document."""
    from database import SessionLocal
    import sys

    print(f"[BACKGROUND] Starting processing for document {document_id}", flush=True)
    print(f"[BACKGROUND] File path: {file_path}", flush=True)
    sys.stdout.flush()

    db = SessionLocal()
    document = None
    try:
        document = db.query(Document).filter(Document.id == document_id).first()
        if document:
            print(f"[BACKGROUND] Found document, starting process_document", flush=True)
            process_document(db, document, file_path)
            print(f"[BACKGROUND] Completed processing document {document_id}", flush=True)
        else:
            print(f"[BACKGROUND] Document {document_id} not found!", flush=True)
    except Exception as e:
        print(f"[BACKGROUND] Error processing document {document_id}: {e}", flush=True)
        import traceback
        traceback.print_exc()
        if document:
            document.processing_error = str(e)
            db.commit()
    finally:
        db.close()


@router.post("/projects/{project_id}/documents", response_model=DocumentResponse)
async def upload_document(
    project_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    content_type: str = Form("public"),
    tags: str = Form(""),
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Upload a document to a project's knowledge base."""
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Validate file type
    filename = file.filename or "document"
    file_extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

    if file_extension not in ["pdf", "docx", "txt"]:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Supported: pdf, docx, txt",
        )

    # Generate unique filename
    stored_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / str(project_id)
    file_path.mkdir(parents=True, exist_ok=True)
    full_path = file_path / stored_filename

    # Save file
    with open(full_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Parse tags
    tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else []

    # Create document record
    document = Document(
        project_id=project_id,
        filename=stored_filename,
        original_filename=filename,
        file_type=file_extension,
        content_type=content_type,
        tags=tag_list,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    # Process document in background
    background_tasks.add_task(
        process_document_background, document.id, str(full_path)
    )

    return DocumentResponse(
        **{
            **document.__dict__,
            "chunk_count": 0,
        }
    )


@router.get("/projects/{project_id}/documents", response_model=List[DocumentResponse])
async def list_documents(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """List all documents for a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    documents = (
        db.query(Document)
        .filter(Document.project_id == project_id)
        .order_by(Document.upload_date.desc())
        .all()
    )

    result = []
    for doc in documents:
        chunk_count = db.query(Chunk).filter(Chunk.document_id == doc.id).count()
        result.append(
            DocumentResponse(
                **{
                    **doc.__dict__,
                    "chunk_count": chunk_count,
                }
            )
        )

    return result


@router.get("/documents/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Get a specific document."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    chunk_count = db.query(Chunk).filter(Chunk.document_id == document_id).count()

    return DocumentResponse(
        **{
            **document.__dict__,
            "chunk_count": chunk_count,
        }
    )


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Delete a document and its chunks."""
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete file from storage
    file_path = UPLOAD_DIR / str(document.project_id) / document.filename
    if file_path.exists():
        file_path.unlink()

    # Delete document (cascades to chunks)
    db.delete(document)
    db.commit()

    return {"message": "Document deleted successfully"}


@router.post("/projects/{project_id}/documents/reprocess/{document_id}")
async def reprocess_document(
    project_id: uuid.UUID,
    document_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Reprocess a document (delete chunks and regenerate)."""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.project_id == project_id,
    ).first()

    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    # Delete existing chunks
    db.query(Chunk).filter(Chunk.document_id == document_id).delete()

    # Reset processing status
    document.processed = False
    document.processing_error = None
    db.commit()

    # Reprocess in background
    file_path = UPLOAD_DIR / str(project_id) / document.filename
    background_tasks.add_task(
        process_document_background, document.id, str(file_path)
    )

    return {"message": "Document queued for reprocessing"}


@router.post("/projects/{project_id}/text")
async def add_text_content(
    project_id: uuid.UUID,
    content: TextContentCreate,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Add raw text content to the knowledge base."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    success, error = await process_raw_text(
        db,
        project_id,
        content.content,
        content.source_name,
        content.content_type,
        content.tags,
    )

    if not success:
        raise HTTPException(status_code=400, detail=error)

    return {"message": "Text content added successfully"}


@router.post("/projects/{project_id}/scrape")
async def scrape_url_endpoint(
    project_id: uuid.UUID,
    request: ScrapeRequest,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Scrape content from a URL and add to knowledge base."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    success, error, chunk_count = await scrape_url(
        db,
        project_id,
        request.url,
        request.content_type,
        request.tags,
    )

    if not success:
        raise HTTPException(status_code=400, detail=error)

    return {
        "message": "URL content scraped successfully",
        "chunks_created": chunk_count,
    }


@router.post("/projects/{project_id}/crawl")
async def crawl_site_endpoint(
    project_id: uuid.UUID,
    request: CrawlSiteRequest,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """
    Crawl an entire website and add all pages to knowledge base.

    This will:
    - Start from the given URL
    - Discover all internal links
    - Scrape up to max_pages pages
    - Create embeddings for all content
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Limit max_pages to prevent abuse
    max_pages = min(request.max_pages, 100)

    success, error, pages_scraped, total_chunks = await crawl_site(
        db,
        project_id,
        request.url,
        request.content_type,
        request.tags,
        max_pages,
    )

    if not success and pages_scraped == 0:
        raise HTTPException(status_code=400, detail=error or "Crawl failed")

    return {
        "message": f"Site crawl complete",
        "pages_scraped": pages_scraped,
        "chunks_created": total_chunks,
        "errors": error,
    }
