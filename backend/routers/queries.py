"""
Stakeholder Queries Router
Handles query inbox, responses, and workflow management
"""

from datetime import datetime
from typing import List, Optional
import uuid
import hashlib

from fastapi import APIRouter, Depends, HTTPException, Query as QueryParam, Request
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_

from database import (
    get_db, Query, QueryCategory, QueryResponse, QueryNote,
    ResponseTemplate, ApprovalWorkflow, Approval, Project, Widget, User
)
from routers.auth import get_current_user
from utils.auth import verify_admin_api_key

router = APIRouter(prefix="/api", tags=["Queries"])


# ============================================================================
# Pydantic Models
# ============================================================================

class QuerySubmission(BaseModel):
    """Public form submission"""
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    subject: Optional[str] = None
    content: str
    extra_fields: dict = {}


class QueryUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    category_id: Optional[str] = None
    assigned_to: Optional[str] = None
    tags: Optional[List[str]] = None


class QueryResponseCreate(BaseModel):
    content: str


class QueryNoteCreate(BaseModel):
    content: str


class CategoryCreate(BaseModel):
    name: str
    color: str = "#6b7280"


class TemplateCreate(BaseModel):
    name: str
    content: str
    category: Optional[str] = None
    variables: List[str] = []


class ApprovalAction(BaseModel):
    action: str  # approve, request_changes, reject
    comments: Optional[str] = None


# ============================================================================
# Response Models
# ============================================================================

class QueryListResponse(BaseModel):
    id: str
    submitter_name: Optional[str]
    submitter_email: Optional[str]
    subject: Optional[str]
    content: str
    status: str
    priority: str
    category: Optional[dict]
    assigned_to: Optional[dict]
    created_at: datetime
    updated_at: datetime


class QueryDetailResponse(QueryListResponse):
    submitter_phone: Optional[str]
    submitter_address: Optional[str]
    submission_data: dict
    tags: List[str]
    source: str
    responses: List[dict]
    notes: List[dict]


# ============================================================================
# Public Submission Endpoint
# ============================================================================

@router.post("/submit/{widget_id}")
async def submit_form(
    widget_id: str,
    data: QuerySubmission,
    request: Request,
    db: Session = Depends(get_db)
):
    """Public endpoint for form submissions."""
    # Get widget and verify it's active
    widget = db.query(Widget).filter(
        Widget.id == widget_id,
        Widget.is_active == True,
        Widget.type == "form"
    ).first()

    if not widget:
        raise HTTPException(status_code=404, detail="Form not found")

    # Verify project is live
    project = db.query(Project).filter(
        Project.id == widget.project_id,
        Project.status == "live"
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not available")

    # Hash IP for privacy
    client_ip = request.client.host if request.client else "unknown"
    ip_hash = hashlib.sha256(client_ip.encode()).hexdigest()[:16]

    # Create query
    query = Query(
        id=uuid.uuid4(),
        project_id=widget.project_id,
        widget_id=widget_id,
        submitter_name=data.name,
        submitter_email=data.email,
        submitter_phone=data.phone,
        submitter_address=data.address,
        subject=data.subject,
        content=data.content,
        submission_data=data.extra_fields,
        source="form",
        ip_hash=ip_hash,
        user_agent=request.headers.get("user-agent", "")
    )

    db.add(query)
    db.commit()

    return {"success": True, "message": "Thank you for your submission"}


# ============================================================================
# Admin Query Endpoints
# ============================================================================

@router.get("/projects/{project_id}/queries")
async def list_queries(
    project_id: str,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category_id: Optional[str] = None,
    assigned_to: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """List queries for a project with filters."""
    query = db.query(Query).filter(Query.project_id == project_id)

    if status:
        query = query.filter(Query.status == status)
    if priority:
        query = query.filter(Query.priority == priority)
    if category_id:
        query = query.filter(Query.category_id == category_id)
    if assigned_to:
        query = query.filter(Query.assigned_to == assigned_to)
    if search:
        query = query.filter(or_(
            Query.submitter_name.ilike(f"%{search}%"),
            Query.submitter_email.ilike(f"%{search}%"),
            Query.subject.ilike(f"%{search}%"),
            Query.content.ilike(f"%{search}%")
        ))

    total = query.count()
    queries = query.order_by(Query.created_at.desc()).offset(skip).limit(limit).all()

    # Get categories and users for display
    categories = {str(c.id): {"id": str(c.id), "name": c.name, "color": c.color}
                  for c in db.query(QueryCategory).filter(QueryCategory.project_id == project_id).all()}
    users = {str(u.id): {"id": str(u.id), "name": u.name, "email": u.email}
             for u in db.query(User).all()}

    return {
        "queries": [{
            "id": str(q.id),
            "submitter_name": q.submitter_name,
            "submitter_email": q.submitter_email,
            "subject": q.subject,
            "content": q.content[:200] + "..." if len(q.content) > 200 else q.content,
            "status": q.status,
            "priority": q.priority,
            "category": categories.get(str(q.category_id)) if q.category_id else None,
            "assigned_to": users.get(str(q.assigned_to)) if q.assigned_to else None,
            "created_at": q.created_at.isoformat(),
            "updated_at": q.updated_at.isoformat()
        } for q in queries],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/queries/{query_id}")
async def get_query(
    query_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """Get a specific query with all details."""
    q = db.query(Query).filter(Query.id == query_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Query not found")

    # Get category
    category = None
    if q.category_id:
        cat = db.query(QueryCategory).filter(QueryCategory.id == q.category_id).first()
        if cat:
            category = {"id": str(cat.id), "name": cat.name, "color": cat.color}

    # Get assigned user
    assigned_user = None
    if q.assigned_to:
        user = db.query(User).filter(User.id == q.assigned_to).first()
        if user:
            assigned_user = {"id": str(user.id), "name": user.name, "email": user.email}

    # Get responses
    responses = [{
        "id": str(r.id),
        "content": r.content,
        "version": r.version,
        "status": r.status,
        "created_at": r.created_at.isoformat(),
        "sent_at": r.sent_at.isoformat() if r.sent_at else None
    } for r in q.responses]

    # Get notes
    notes = [{
        "id": str(n.id),
        "content": n.content,
        "created_at": n.created_at.isoformat()
    } for n in q.notes]

    return {
        "id": str(q.id),
        "submitter_name": q.submitter_name,
        "submitter_email": q.submitter_email,
        "submitter_phone": q.submitter_phone,
        "submitter_address": q.submitter_address,
        "subject": q.subject,
        "content": q.content,
        "submission_data": q.submission_data or {},
        "status": q.status,
        "priority": q.priority,
        "category": category,
        "assigned_to": assigned_user,
        "tags": q.tags or [],
        "source": q.source,
        "created_at": q.created_at.isoformat(),
        "updated_at": q.updated_at.isoformat(),
        "responses": responses,
        "notes": notes
    }


@router.put("/queries/{query_id}")
async def update_query(
    query_id: str,
    data: QueryUpdate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """Update a query's status, assignment, etc."""
    q = db.query(Query).filter(Query.id == query_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Query not found")

    if data.status is not None:
        q.status = data.status
    if data.priority is not None:
        q.priority = data.priority
    if data.category_id is not None:
        q.category_id = data.category_id if data.category_id else None
    if data.assigned_to is not None:
        q.assigned_to = data.assigned_to if data.assigned_to else None
    if data.tags is not None:
        q.tags = data.tags

    db.commit()
    db.refresh(q)

    return {"message": "Query updated"}


@router.post("/queries/{query_id}/responses")
async def create_response(
    query_id: str,
    data: QueryResponseCreate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """Create a draft response for a query."""
    q = db.query(Query).filter(Query.id == query_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Query not found")

    # Get current version
    existing = db.query(QueryResponse).filter(QueryResponse.query_id == query_id).count()

    response = QueryResponse(
        id=uuid.uuid4(),
        query_id=query_id,
        content=data.content,
        version=existing + 1,
        status="draft"
    )
    db.add(response)

    # Update query status
    q.status = "in_progress"

    db.commit()
    db.refresh(response)

    return {
        "id": str(response.id),
        "content": response.content,
        "version": response.version,
        "status": response.status
    }


@router.post("/queries/{query_id}/notes")
async def create_note(
    query_id: str,
    data: QueryNoteCreate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """Add an internal note to a query."""
    q = db.query(Query).filter(Query.id == query_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Query not found")

    note = QueryNote(
        id=uuid.uuid4(),
        query_id=query_id,
        content=data.content
    )
    db.add(note)
    db.commit()

    return {"id": str(note.id), "message": "Note added"}


# ============================================================================
# Category Management
# ============================================================================

@router.get("/projects/{project_id}/categories")
async def list_categories(
    project_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """List query categories for a project."""
    categories = db.query(QueryCategory).filter(
        QueryCategory.project_id == project_id
    ).order_by(QueryCategory.sort_order).all()

    return [{
        "id": str(c.id),
        "name": c.name,
        "color": c.color
    } for c in categories]


@router.post("/projects/{project_id}/categories")
async def create_category(
    project_id: str,
    data: CategoryCreate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """Create a query category."""
    category = QueryCategory(
        id=uuid.uuid4(),
        project_id=project_id,
        name=data.name,
        color=data.color
    )
    db.add(category)
    db.commit()
    db.refresh(category)

    return {"id": str(category.id), "name": category.name, "color": category.color}


# ============================================================================
# Response Templates
# ============================================================================

@router.get("/projects/{project_id}/templates")
async def list_templates(
    project_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """List response templates for a project."""
    templates = db.query(ResponseTemplate).filter(
        ResponseTemplate.project_id == project_id
    ).all()

    return [{
        "id": str(t.id),
        "name": t.name,
        "category": t.category,
        "content": t.content,
        "variables": t.variables or [],
        "usage_count": t.usage_count
    } for t in templates]


@router.post("/projects/{project_id}/templates")
async def create_template(
    project_id: str,
    data: TemplateCreate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """Create a response template."""
    template = ResponseTemplate(
        id=uuid.uuid4(),
        project_id=project_id,
        name=data.name,
        content=data.content,
        category=data.category,
        variables=data.variables
    )
    db.add(template)
    db.commit()
    db.refresh(template)

    return {"id": str(template.id), "name": template.name}


# ============================================================================
# Approval Workflow
# ============================================================================

@router.post("/responses/{response_id}/submit-for-approval")
async def submit_for_approval(
    response_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """Submit a response for approval."""
    response = db.query(QueryResponse).filter(QueryResponse.id == response_id).first()
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")

    # Get query and project
    query = db.query(Query).filter(Query.id == response.query_id).first()
    project = db.query(Project).filter(Project.id == query.project_id).first()

    # Get default workflow
    workflow = db.query(ApprovalWorkflow).filter(
        ApprovalWorkflow.project_id == project.id,
        ApprovalWorkflow.is_default == True,
        ApprovalWorkflow.is_active == True
    ).first()

    if workflow:
        # Create approval record
        approval = Approval(
            id=uuid.uuid4(),
            response_id=response_id,
            workflow_id=workflow.id,
            stage_index=0,
            status="pending"
        )
        db.add(approval)
        response.status = "pending_approval"
        query.status = "awaiting_approval"
    else:
        # No workflow - auto approve
        response.status = "approved"

    db.commit()

    return {"message": "Submitted for approval", "status": response.status}


@router.get("/approvals/pending")
async def get_pending_approvals(
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """Get pending approvals."""
    approvals = db.query(Approval).filter(Approval.status == "pending").all()

    results = []
    for a in approvals:
        response = db.query(QueryResponse).filter(QueryResponse.id == a.response_id).first()
        query = db.query(Query).filter(Query.id == response.query_id).first() if response else None

        if query:
            results.append({
                "id": str(a.id),
                "response_id": str(a.response_id),
                "query": {
                    "id": str(query.id),
                    "subject": query.subject,
                    "submitter_name": query.submitter_name,
                    "content": query.content[:100]
                },
                "response_content": response.content,
                "created_at": a.created_at.isoformat()
            })

    return results


@router.post("/approvals/{approval_id}/decide")
async def decide_approval(
    approval_id: str,
    data: ApprovalAction,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """Approve, request changes, or reject a response."""
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")

    response = db.query(QueryResponse).filter(QueryResponse.id == approval.response_id).first()
    query = db.query(Query).filter(Query.id == response.query_id).first()

    if data.action == "approve":
        approval.status = "approved"
        response.status = "approved"
        query.status = "approved"
    elif data.action == "request_changes":
        approval.status = "changes_requested"
        response.status = "draft"
        query.status = "in_progress"
    elif data.action == "reject":
        approval.status = "rejected"
        response.status = "draft"
        query.status = "in_progress"

    approval.comments = data.comments
    approval.decided_at = datetime.utcnow()

    db.commit()

    return {"message": f"Response {data.action}"}


# ============================================================================
# Send Response to Submitter
# ============================================================================

@router.post("/responses/{response_id}/send")
async def send_response(
    response_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """Send an approved response to the original submitter."""
    from services.email import email_service

    response = db.query(QueryResponse).filter(QueryResponse.id == response_id).first()
    if not response:
        raise HTTPException(status_code=404, detail="Response not found")

    if response.status != "approved":
        raise HTTPException(status_code=400, detail="Response must be approved before sending")

    query = db.query(Query).filter(Query.id == response.query_id).first()
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")

    if not query.submitter_email:
        raise HTTPException(status_code=400, detail="No email address for submitter")

    project = db.query(Project).filter(Project.id == query.project_id).first()

    # Send email
    success = await email_service.send_response_to_submitter(
        submitter_email=query.submitter_email,
        submitter_name=query.submitter_name,
        query_subject=query.subject or "Your feedback",
        response_content=response.content,
        project_name=project.name,
        contact_email=project.contact_email
    )

    if success:
        response.status = "sent"
        response.sent_at = datetime.utcnow()
        query.status = "closed"
        db.commit()
        return {"message": "Response sent successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send email")


# ============================================================================
# Dashboard Stats
# ============================================================================

@router.get("/projects/{project_id}/queries/stats")
async def get_query_stats(
    project_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """Get query statistics for a project."""
    queries = db.query(Query).filter(Query.project_id == project_id)

    total = queries.count()
    by_status = {}
    for status in ['new', 'in_progress', 'awaiting_approval', 'approved', 'sent', 'closed']:
        by_status[status] = queries.filter(Query.status == status).count()

    by_priority = {}
    for priority in ['low', 'medium', 'high', 'urgent']:
        by_priority[priority] = queries.filter(Query.priority == priority).count()

    # Recent queries
    recent = queries.order_by(Query.created_at.desc()).limit(5).all()

    return {
        "total": total,
        "by_status": by_status,
        "by_priority": by_priority,
        "recent": [{
            "id": str(q.id),
            "subject": q.subject,
            "submitter_name": q.submitter_name,
            "status": q.status,
            "created_at": q.created_at.isoformat()
        } for q in recent]
    }
