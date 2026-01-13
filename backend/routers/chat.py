import uuid
import hashlib
from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db, Project, Conversation, Message, FlaggedQuestion
from services.llm import generate_response
from utils.auth import hash_ip
from config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api/widget", tags=["widget"])


class WidgetConfigResponse(BaseModel):
    project_name: str
    welcome_message: str
    disclaimer: str
    contact_email: Optional[str]
    primary_color: str
    position: str
    button_size: int
    chat_width: int
    chat_height: int


class ChatRequest(BaseModel):
    message: str
    session_id: str
    conversation_history: Optional[List[dict]] = None


class ChatResponse(BaseModel):
    response: str
    disclaimer: str
    session_id: str
    message_id: uuid.UUID


class FeedbackRequest(BaseModel):
    message_id: uuid.UUID
    feedback: str  # "helpful" or "not_helpful"


@router.get("/{project_id}/config", response_model=WidgetConfigResponse)
async def get_widget_config(
    project_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """Get widget configuration for a project (public endpoint)."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.status == "live",
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found or not live")

    widget_config = project.widget_config or {}

    return WidgetConfigResponse(
        project_name=project.name,
        welcome_message=project.welcome_message or "Hello! How can I help you today?",
        disclaimer=project.disclaimer or "",
        contact_email=project.contact_email,
        primary_color=widget_config.get("primary_color", "#1a5c3d"),
        position=widget_config.get("position", "bottom-right"),
        button_size=widget_config.get("button_size", 60),
        chat_width=widget_config.get("chat_width", 380),
        chat_height=widget_config.get("chat_height", 520),
    )


@router.post("/{project_id}/chat", response_model=ChatResponse)
async def chat(
    project_id: uuid.UUID,
    request: ChatRequest,
    http_request: Request,
    db: Session = Depends(get_db),
):
    """Send a message and get an AI response (public endpoint)."""
    # Verify project is live
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.status == "live",
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found or not live")

    # Validate message
    if not request.message or len(request.message.strip()) == 0:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if len(request.message) > 2000:
        raise HTTPException(status_code=400, detail="Message too long")

    # Get or create conversation
    conversation = db.query(Conversation).filter(
        Conversation.project_id == project_id,
        Conversation.session_id == request.session_id,
    ).first()

    if not conversation:
        # Hash IP for privacy
        client_ip = http_request.client.host if http_request.client else "unknown"
        ip_hashed = hash_ip(client_ip)

        conversation = Conversation(
            project_id=project_id,
            session_id=request.session_id,
            user_agent=http_request.headers.get("user-agent", ""),
            ip_hash=ip_hashed,
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    # Store user message
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=request.message,
    )
    db.add(user_message)
    db.commit()

    # Generate AI response
    response_text, chunk_ids, confidence, flag_reason = generate_response(
        db,
        project,
        request.message,
        request.conversation_history,
    )

    # Store assistant message
    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=response_text,
        retrieved_chunk_ids=chunk_ids,
        confidence_score=confidence,
    )
    db.add(assistant_message)
    db.commit()
    db.refresh(assistant_message)

    # Flag if necessary
    if flag_reason:
        flagged = FlaggedQuestion(
            message_id=user_message.id,
            project_id=project_id,
            reason=flag_reason,
        )
        db.add(flagged)
        db.commit()

    return ChatResponse(
        response=response_text,
        disclaimer=project.disclaimer or "",
        session_id=request.session_id,
        message_id=assistant_message.id,
    )


@router.post("/{project_id}/feedback")
async def submit_feedback(
    project_id: uuid.UUID,
    feedback: FeedbackRequest,
    db: Session = Depends(get_db),
):
    """Submit feedback on a response (public endpoint)."""
    # Validate feedback value
    if feedback.feedback not in ["helpful", "not_helpful"]:
        raise HTTPException(status_code=400, detail="Invalid feedback value")

    # Find the message
    message = db.query(Message).filter(Message.id == feedback.message_id).first()

    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    # Verify message belongs to a conversation in this project
    conversation = db.query(Conversation).filter(
        Conversation.id == message.conversation_id,
        Conversation.project_id == project_id,
    ).first()

    if not conversation:
        raise HTTPException(status_code=404, detail="Message not found")

    # Update feedback
    message.feedback = feedback.feedback
    db.commit()

    return {"message": "Feedback submitted successfully"}
