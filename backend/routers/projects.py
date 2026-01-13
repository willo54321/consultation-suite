import uuid
import shutil
from typing import List, Optional
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from pydantic import BaseModel

from database import get_db, Project
from utils.auth import verify_admin_api_key
from config import get_settings

settings = get_settings()

# Image upload directory
IMAGES_DIR = Path(settings.local_storage_path) / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB

router = APIRouter(prefix="/api/projects", tags=["projects"])


# Pydantic models
class WidgetConfig(BaseModel):
    primary_color: str = "#1a5c3d"
    position: str = "bottom-right"
    button_size: int = 60
    chat_width: int = 380
    chat_height: int = 520


class ProjectCreate(BaseModel):
    name: str
    client: Optional[str] = None
    site_address: Optional[str] = None
    status: str = "draft"
    persona_prompt: Optional[str] = None
    welcome_message: Optional[str] = None
    disclaimer: Optional[str] = None
    fallback_message: Optional[str] = None
    contact_email: Optional[str] = None
    blocked_topics: Optional[List[str]] = []
    widget_config: Optional[WidgetConfig] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    client: Optional[str] = None
    site_address: Optional[str] = None
    status: Optional[str] = None
    persona_prompt: Optional[str] = None
    welcome_message: Optional[str] = None
    disclaimer: Optional[str] = None
    fallback_message: Optional[str] = None
    contact_email: Optional[str] = None
    blocked_topics: Optional[List[str]] = None
    widget_config: Optional[WidgetConfig] = None


class ProjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    client: Optional[str]
    site_address: Optional[str]
    status: str
    persona_prompt: Optional[str]
    welcome_message: Optional[str]
    disclaimer: Optional[str]
    fallback_message: Optional[str]
    contact_email: Optional[str]
    blocked_topics: List[str]
    widget_config: dict
    created_at: datetime
    updated_at: datetime
    document_count: int = 0
    chunk_count: int = 0

    class Config:
        from_attributes = True


@router.post("", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Create a new consultation project."""
    db_project = Project(
        name=project.name,
        client=project.client,
        site_address=project.site_address,
        status=project.status,
        persona_prompt=project.persona_prompt,
        welcome_message=project.welcome_message,
        disclaimer=project.disclaimer,
        fallback_message=project.fallback_message,
        contact_email=project.contact_email,
        blocked_topics=project.blocked_topics or [],
        widget_config=project.widget_config.model_dump() if project.widget_config else {},
    )

    db.add(db_project)
    db.commit()
    db.refresh(db_project)

    return ProjectResponse(
        **{
            **db_project.__dict__,
            "document_count": 0,
            "chunk_count": 0,
        }
    )


@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """List all projects, optionally filtered by status."""
    query = db.query(Project)

    if status:
        query = query.filter(Project.status == status)

    projects = query.order_by(Project.created_at.desc()).all()

    result = []
    for p in projects:
        doc_count = len(p.documents)
        chunk_count = len(p.chunks)
        result.append(
            ProjectResponse(
                **{
                    **p.__dict__,
                    "document_count": doc_count,
                    "chunk_count": chunk_count,
                }
            )
        )

    return result


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Get a specific project by ID."""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return ProjectResponse(
        **{
            **project.__dict__,
            "document_count": len(project.documents),
            "chunk_count": len(project.chunks),
        }
    )


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    updates: ProjectUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Update a project."""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = updates.model_dump(exclude_unset=True)

    if "widget_config" in update_data and update_data["widget_config"]:
        update_data["widget_config"] = update_data["widget_config"].model_dump()

    for key, value in update_data.items():
        setattr(project, key, value)

    project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(project)

    return ProjectResponse(
        **{
            **project.__dict__,
            "document_count": len(project.documents),
            "chunk_count": len(project.chunks),
        }
    )


@router.delete("/{project_id}")
async def archive_project(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Archive a project (soft delete by setting status to 'closed')."""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.status = "closed"
    project.updated_at = datetime.utcnow()
    db.commit()

    return {"message": "Project archived successfully"}


@router.get("/{project_id}/embed-code")
async def get_embed_code(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Get the embed code for a project's widget."""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    widget_config = project.widget_config or {}
    primary_color = widget_config.get("primary_color", "#1a5c3d")
    position = widget_config.get("position", "bottom-right")

    embed_code = f'''<script src="https://your-domain.com/widget.js"
        data-project-id="{project_id}"
        data-position="{position}"
        data-primary-color="{primary_color}">
</script>'''

    return {
        "embed_code": embed_code,
        "project_id": str(project_id),
    }


# Interactive Map Configuration
@router.get("/{project_id}/interactive-map")
async def get_interactive_map_config(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Get interactive map configuration for a project."""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get map config from widget_config or return default
    widget_config = project.widget_config or {}
    map_config = widget_config.get("interactive_map", None)

    return {"config": map_config}


@router.put("/{project_id}/interactive-map")
async def update_interactive_map_config(
    project_id: uuid.UUID,
    data: dict,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Update interactive map configuration for a project."""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Update map config in widget_config
    widget_config = dict(project.widget_config or {})
    widget_config["interactive_map"] = data.get("config", {})
    project.widget_config = widget_config
    flag_modified(project, "widget_config")
    project.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(project)

    return {"message": "Map configuration saved successfully"}


# Feedback Form Configuration
@router.get("/{project_id}/feedback-form")
async def get_feedback_form_config(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Get feedback form configuration for a project."""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    widget_config = project.widget_config or {}
    form_config = widget_config.get("feedback_form", None)

    return {"config": form_config}


@router.put("/{project_id}/feedback-form")
async def update_feedback_form_config(
    project_id: uuid.UUID,
    data: dict,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Update feedback form configuration for a project."""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    widget_config = project.widget_config or {}
    widget_config["feedback_form"] = data.get("config", {})
    project.widget_config = widget_config
    project.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(project)

    return {"message": "Form configuration saved successfully"}


# Image Upload
@router.post("/{project_id}/images")
async def upload_image(
    project_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Upload an image for a project (overlays, pins, etc.)."""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Validate file type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: jpeg, png, gif, webp"
        )

    # Read file to check size
    content = await file.read()
    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Maximum size: 10MB"
        )

    # Generate unique filename
    extension = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else "jpg"
    stored_filename = f"{uuid.uuid4()}.{extension}"

    # Create project image directory
    project_images_dir = IMAGES_DIR / str(project_id)
    project_images_dir.mkdir(parents=True, exist_ok=True)

    # Save file
    file_path = project_images_dir / stored_filename
    with open(file_path, "wb") as f:
        f.write(content)

    # Return URL to access the image
    image_url = f"/api/uploads/images/{project_id}/{stored_filename}"

    return {
        "url": image_url,
        "filename": stored_filename,
        "original_filename": file.filename,
        "size": len(content)
    }


@router.get("/{project_id}/images")
async def list_images(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """List all uploaded images for a project."""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project_images_dir = IMAGES_DIR / str(project_id)

    if not project_images_dir.exists():
        return {"images": []}

    images = []
    for file_path in project_images_dir.iterdir():
        if file_path.is_file():
            images.append({
                "filename": file_path.name,
                "url": f"/api/uploads/images/{project_id}/{file_path.name}",
                "size": file_path.stat().st_size
            })

    return {"images": images}


@router.delete("/{project_id}/images/{filename}")
async def delete_image(
    project_id: uuid.UUID,
    filename: str,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Delete an uploaded image."""
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    file_path = IMAGES_DIR / str(project_id) / filename

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")

    file_path.unlink()

    return {"message": "Image deleted successfully"}
