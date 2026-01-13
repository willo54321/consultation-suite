import uuid
import csv
import io
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel

from database import get_db, Project, Conversation, Message, FlaggedQuestion
from utils.auth import verify_admin_api_key

router = APIRouter(prefix="/api", tags=["analytics"])


class ConversationSummary(BaseModel):
    id: uuid.UUID
    session_id: str
    started_at: datetime
    message_count: int
    has_flagged: bool

    class Config:
        from_attributes = True


class MessageDetail(BaseModel):
    id: uuid.UUID
    role: str
    content: str
    confidence_score: Optional[float]
    feedback: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationDetail(BaseModel):
    id: uuid.UUID
    session_id: str
    started_at: datetime
    user_agent: Optional[str]
    messages: List[MessageDetail]


class AnalyticsSummary(BaseModel):
    total_conversations: int
    total_messages: int
    user_messages: int
    avg_messages_per_conversation: float
    flagged_questions: int
    resolved_flagged: int
    helpful_feedback: int
    not_helpful_feedback: int
    avg_confidence: float
    conversations_last_7_days: int
    conversations_last_30_days: int


class FlaggedQuestionDetail(BaseModel):
    id: uuid.UUID
    question: str
    ai_response: str
    reason: str
    resolved: bool
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/projects/{project_id}/conversations", response_model=List[ConversationSummary])
async def list_conversations(
    project_id: uuid.UUID,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """List conversations for a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    conversations = (
        db.query(Conversation)
        .filter(Conversation.project_id == project_id)
        .order_by(Conversation.started_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    result = []
    for conv in conversations:
        message_count = db.query(Message).filter(Message.conversation_id == conv.id).count()
        has_flagged = (
            db.query(FlaggedQuestion)
            .join(Message)
            .filter(Message.conversation_id == conv.id)
            .count() > 0
        )
        result.append(
            ConversationSummary(
                id=conv.id,
                session_id=conv.session_id,
                started_at=conv.started_at,
                message_count=message_count,
                has_flagged=has_flagged,
            )
        )

    return result


@router.get("/conversations/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(
    conversation_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Get full conversation details."""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
        .all()
    )

    return ConversationDetail(
        id=conversation.id,
        session_id=conversation.session_id,
        started_at=conversation.started_at,
        user_agent=conversation.user_agent,
        messages=[
            MessageDetail(
                id=m.id,
                role=m.role,
                content=m.content,
                confidence_score=m.confidence_score,
                feedback=m.feedback,
                created_at=m.created_at,
            )
            for m in messages
        ],
    )


@router.get("/projects/{project_id}/analytics", response_model=AnalyticsSummary)
async def get_analytics(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Get analytics summary for a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Total counts
    total_conversations = (
        db.query(Conversation)
        .filter(Conversation.project_id == project_id)
        .count()
    )

    total_messages = (
        db.query(Message)
        .join(Conversation)
        .filter(Conversation.project_id == project_id)
        .count()
    )

    user_messages = (
        db.query(Message)
        .join(Conversation)
        .filter(Conversation.project_id == project_id, Message.role == "user")
        .count()
    )

    # Flagged questions
    flagged_questions = (
        db.query(FlaggedQuestion)
        .filter(FlaggedQuestion.project_id == project_id)
        .count()
    )

    resolved_flagged = (
        db.query(FlaggedQuestion)
        .filter(FlaggedQuestion.project_id == project_id, FlaggedQuestion.resolved == True)
        .count()
    )

    # Feedback
    helpful_feedback = (
        db.query(Message)
        .join(Conversation)
        .filter(Conversation.project_id == project_id, Message.feedback == "helpful")
        .count()
    )

    not_helpful_feedback = (
        db.query(Message)
        .join(Conversation)
        .filter(Conversation.project_id == project_id, Message.feedback == "not_helpful")
        .count()
    )

    # Average confidence
    avg_confidence_result = (
        db.query(func.avg(Message.confidence_score))
        .join(Conversation)
        .filter(
            Conversation.project_id == project_id,
            Message.role == "assistant",
            Message.confidence_score.isnot(None),
        )
        .scalar()
    )
    avg_confidence = float(avg_confidence_result or 0)

    # Time-based metrics
    now = datetime.utcnow()
    conversations_7d = (
        db.query(Conversation)
        .filter(
            Conversation.project_id == project_id,
            Conversation.started_at >= now - timedelta(days=7),
        )
        .count()
    )

    conversations_30d = (
        db.query(Conversation)
        .filter(
            Conversation.project_id == project_id,
            Conversation.started_at >= now - timedelta(days=30),
        )
        .count()
    )

    return AnalyticsSummary(
        total_conversations=total_conversations,
        total_messages=total_messages,
        user_messages=user_messages,
        avg_messages_per_conversation=(
            total_messages / total_conversations if total_conversations > 0 else 0
        ),
        flagged_questions=flagged_questions,
        resolved_flagged=resolved_flagged,
        helpful_feedback=helpful_feedback,
        not_helpful_feedback=not_helpful_feedback,
        avg_confidence=round(avg_confidence, 2),
        conversations_last_7_days=conversations_7d,
        conversations_last_30_days=conversations_30d,
    )


@router.get("/projects/{project_id}/flagged", response_model=List[FlaggedQuestionDetail])
async def list_flagged_questions(
    project_id: uuid.UUID,
    resolved: Optional[bool] = None,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """List flagged questions for review."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    query = db.query(FlaggedQuestion).filter(FlaggedQuestion.project_id == project_id)

    if resolved is not None:
        query = query.filter(FlaggedQuestion.resolved == resolved)

    flagged = query.order_by(FlaggedQuestion.created_at.desc()).all()

    result = []
    for f in flagged:
        message = db.query(Message).filter(Message.id == f.message_id).first()
        if message:
            # Get the AI response (next message in conversation)
            ai_response = (
                db.query(Message)
                .filter(
                    Message.conversation_id == message.conversation_id,
                    Message.role == "assistant",
                    Message.created_at > message.created_at,
                )
                .first()
            )

            result.append(
                FlaggedQuestionDetail(
                    id=f.id,
                    question=message.content,
                    ai_response=ai_response.content if ai_response else "",
                    reason=f.reason or "",
                    resolved=f.resolved,
                    notes=f.notes,
                    created_at=f.created_at,
                )
            )

    return result


@router.put("/flagged/{flagged_id}/resolve")
async def resolve_flagged_question(
    flagged_id: uuid.UUID,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Mark a flagged question as resolved."""
    flagged = db.query(FlaggedQuestion).filter(FlaggedQuestion.id == flagged_id).first()
    if not flagged:
        raise HTTPException(status_code=404, detail="Flagged question not found")

    flagged.resolved = True
    flagged.notes = notes
    db.commit()

    return {"message": "Flagged question resolved"}


@router.get("/projects/{project_id}/export")
async def export_conversations(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
    _: str = Depends(verify_admin_api_key),
):
    """Export all conversations as CSV."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get all messages with conversation info
    messages = (
        db.query(Message, Conversation)
        .join(Conversation)
        .filter(Conversation.project_id == project_id)
        .order_by(Conversation.started_at, Message.created_at)
        .all()
    )

    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "conversation_id",
        "session_id",
        "conversation_started",
        "message_role",
        "message_content",
        "confidence_score",
        "feedback",
        "message_timestamp",
    ])

    for message, conversation in messages:
        writer.writerow([
            str(conversation.id),
            conversation.session_id,
            conversation.started_at.isoformat(),
            message.role,
            message.content,
            message.confidence_score,
            message.feedback,
            message.created_at.isoformat(),
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=conversations_{project_id}.csv"
        },
    )
