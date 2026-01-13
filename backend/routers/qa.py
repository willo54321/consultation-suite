import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db, Project, ManualQA
from utils.auth import verify_admin_api_key

router = APIRouter(prefix="/api", tags=["qa"])


class QACreate(BaseModel):
    question: str
    answer: str
    keywords: Optional[List[str]] = []
    priority: int = 0


class QAUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    keywords: Optional[List[str]] = None
    priority: Optional[int] = None
    active: Optional[bool] = None


class QAResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    question: str
    answer: str
    keywords: List[str]
    priority: int
    active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


@router.post("/projects/{project_id}/qa", response_model=QAResponse)
async def create_qa(
    project_id: uuid.UUID,
    qa: QACreate,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Create a manual Q&A entry."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db_qa = ManualQA(
        project_id=project_id,
        question=qa.question,
        answer=qa.answer,
        keywords=qa.keywords or [],
        priority=qa.priority,
    )

    db.add(db_qa)
    db.commit()
    db.refresh(db_qa)

    return QAResponse.model_validate(db_qa)


@router.get("/projects/{project_id}/qa", response_model=List[QAResponse])
async def list_qas(
    project_id: uuid.UUID,
    active_only: bool = False,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """List all Q&A entries for a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = db.query(ManualQA).filter(ManualQA.project_id == project_id)

    if active_only:
        query = query.filter(ManualQA.active == True)

    qas = query.order_by(ManualQA.priority.desc(), ManualQA.created_at.desc()).all()

    return [QAResponse.model_validate(qa) for qa in qas]


@router.get("/qa/{qa_id}", response_model=QAResponse)
async def get_qa(
    qa_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Get a specific Q&A entry."""
    qa = db.query(ManualQA).filter(ManualQA.id == qa_id).first()
    if not qa:
        raise HTTPException(status_code=404, detail="Q&A not found")

    return QAResponse.model_validate(qa)


@router.put("/qa/{qa_id}", response_model=QAResponse)
async def update_qa(
    qa_id: uuid.UUID,
    updates: QAUpdate,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Update a Q&A entry."""
    qa = db.query(ManualQA).filter(ManualQA.id == qa_id).first()
    if not qa:
        raise HTTPException(status_code=404, detail="Q&A not found")

    update_data = updates.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(qa, key, value)

    qa.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(qa)

    return QAResponse.model_validate(qa)


@router.delete("/qa/{qa_id}")
async def delete_qa(
    qa_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Delete a Q&A entry."""
    qa = db.query(ManualQA).filter(ManualQA.id == qa_id).first()
    if not qa:
        raise HTTPException(status_code=404, detail="Q&A not found")

    db.delete(qa)
    db.commit()

    return {"message": "Q&A deleted successfully"}
