"""
Widgets Router
CRUD operations for embeddable widgets and their content
"""

from datetime import datetime
from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query as QueryParam
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified

from database import (
    get_db, Widget, FAQ, TimelineItem, GalleryItem,
    Project, Document
)
from routers.auth import get_current_user, get_optional_user
from utils.auth import verify_admin_api_key

router = APIRouter(prefix="/api", tags=["Widgets"])


# ============================================================================
# Pydantic Models
# ============================================================================

class WidgetCreate(BaseModel):
    type: str
    name: str
    config: dict = {}


class WidgetUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[dict] = None
    is_active: Optional[bool] = None


class WidgetResponse(BaseModel):
    id: str
    project_id: str
    type: str
    name: str
    config: dict
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class FAQCreate(BaseModel):
    question: str
    answer: str
    category: Optional[str] = None
    sort_order: int = 0


class FAQResponse(BaseModel):
    id: str
    question: str
    answer: str
    category: Optional[str]
    sort_order: int
    is_active: bool
    view_count: int

    class Config:
        from_attributes = True


class TimelineItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    details: Optional[str] = None
    date: datetime
    end_date: Optional[datetime] = None
    status: str = "upcoming"
    sort_order: int = 0


class TimelineItemResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    details: Optional[str]
    date: datetime
    end_date: Optional[datetime]
    status: str
    sort_order: int

    class Config:
        from_attributes = True


class GalleryItemCreate(BaseModel):
    type: str = "image"
    url: str
    thumbnail_url: Optional[str] = None
    title: Optional[str] = None
    caption: Optional[str] = None
    category: Optional[str] = None
    sort_order: int = 0


class DocumentPublicResponse(BaseModel):
    id: str
    name: str
    category: Optional[str]
    file_type: str
    size: int = 0
    date: datetime
    url: str

    class Config:
        from_attributes = True


# ============================================================================
# Admin Widget Routes (Authenticated)
# ============================================================================

@router.get("/projects/{project_id}/widgets", response_model=List[WidgetResponse])
async def list_project_widgets(
    project_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """List all widgets for a project."""
    widgets = db.query(Widget).filter(Widget.project_id == project_id).all()
    return [WidgetResponse(
        id=str(w.id),
        project_id=str(w.project_id),
        type=w.type,
        name=w.name,
        config=w.config or {},
        is_active=w.is_active,
        created_at=w.created_at
    ) for w in widgets]


@router.post("/projects/{project_id}/widgets", response_model=WidgetResponse)
async def create_widget(
    project_id: str,
    data: WidgetCreate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """Create a new widget for a project."""
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    widget = Widget(
        id=uuid.uuid4(),
        project_id=project_id,
        type=data.type,
        name=data.name,
        config=data.config
    )
    db.add(widget)
    db.commit()
    db.refresh(widget)

    return WidgetResponse(
        id=str(widget.id),
        project_id=str(widget.project_id),
        type=widget.type,
        name=widget.name,
        config=widget.config or {},
        is_active=widget.is_active,
        created_at=widget.created_at
    )


@router.get("/widgets/{widget_id}", response_model=WidgetResponse)
async def get_widget(
    widget_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """Get a specific widget."""
    widget = db.query(Widget).filter(Widget.id == widget_id).first()
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")

    return WidgetResponse(
        id=str(widget.id),
        project_id=str(widget.project_id),
        type=widget.type,
        name=widget.name,
        config=widget.config or {},
        is_active=widget.is_active,
        created_at=widget.created_at
    )


@router.put("/widgets/{widget_id}", response_model=WidgetResponse)
async def update_widget(
    widget_id: str,
    data: WidgetUpdate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """Update a widget."""
    widget = db.query(Widget).filter(Widget.id == widget_id).first()
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")

    if data.name is not None:
        widget.name = data.name
    if data.config is not None:
        widget.config = data.config
    if data.is_active is not None:
        widget.is_active = data.is_active

    db.commit()
    db.refresh(widget)

    return WidgetResponse(
        id=str(widget.id),
        project_id=str(widget.project_id),
        type=widget.type,
        name=widget.name,
        config=widget.config or {},
        is_active=widget.is_active,
        created_at=widget.created_at
    )


@router.delete("/widgets/{widget_id}")
async def delete_widget(
    widget_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """Delete a widget."""
    widget = db.query(Widget).filter(Widget.id == widget_id).first()
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")

    db.delete(widget)
    db.commit()

    return {"message": "Widget deleted"}


@router.get("/widgets/{widget_id}/embed-code")
async def get_embed_code(
    widget_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """Generate embed code for a widget."""
    widget = db.query(Widget).filter(Widget.id == widget_id).first()
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")

    # Generate embed codes
    script_embed = f'''<div data-consultation-widget="{widget.type}" data-widget-id="{widget_id}"></div>
<script src="https://cdn.consultationsuite.com/widgets.js" async></script>'''

    iframe_embed = f'''<iframe
  src="https://app.consultationsuite.com/embed/{widget_id}"
  width="100%"
  height="500"
  frameborder="0"
  title="{widget.name}"
></iframe>'''

    return {
        "script": script_embed,
        "iframe": iframe_embed,
        "widget_id": str(widget_id)
    }


# ============================================================================
# FAQ Management
# ============================================================================

@router.get("/widgets/{widget_id}/faqs", response_model=List[FAQResponse])
async def list_widget_faqs(
    widget_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """List all FAQs for a widget."""
    faqs = db.query(FAQ).filter(
        FAQ.widget_id == widget_id,
        FAQ.is_active == True
    ).order_by(FAQ.sort_order).all()

    return [FAQResponse(
        id=str(f.id),
        question=f.question,
        answer=f.answer,
        category=f.category,
        sort_order=f.sort_order,
        is_active=f.is_active,
        view_count=f.view_count
    ) for f in faqs]


@router.post("/widgets/{widget_id}/faqs", response_model=FAQResponse)
async def create_faq(
    widget_id: str,
    data: FAQCreate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """Create a new FAQ."""
    widget = db.query(Widget).filter(Widget.id == widget_id).first()
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")

    faq = FAQ(
        id=uuid.uuid4(),
        widget_id=widget_id,
        project_id=widget.project_id,
        question=data.question,
        answer=data.answer,
        category=data.category,
        sort_order=data.sort_order
    )
    db.add(faq)
    db.commit()
    db.refresh(faq)

    return FAQResponse(
        id=str(faq.id),
        question=faq.question,
        answer=faq.answer,
        category=faq.category,
        sort_order=faq.sort_order,
        is_active=faq.is_active,
        view_count=faq.view_count
    )


# ============================================================================
# Timeline Management
# ============================================================================

@router.get("/widgets/{widget_id}/timeline", response_model=List[TimelineItemResponse])
async def list_widget_timeline(
    widget_id: str,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """List all timeline items for a widget."""
    items = db.query(TimelineItem).filter(
        TimelineItem.widget_id == widget_id
    ).order_by(TimelineItem.date).all()

    return [TimelineItemResponse(
        id=str(i.id),
        title=i.title,
        description=i.description,
        details=i.details,
        date=i.date,
        end_date=i.end_date,
        status=i.status,
        sort_order=i.sort_order
    ) for i in items]


@router.post("/widgets/{widget_id}/timeline", response_model=TimelineItemResponse)
async def create_timeline_item(
    widget_id: str,
    data: TimelineItemCreate,
    db: Session = Depends(get_db),
    api_key: str = Depends(verify_admin_api_key)
):
    """Create a new timeline item."""
    widget = db.query(Widget).filter(Widget.id == widget_id).first()
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")

    item = TimelineItem(
        id=uuid.uuid4(),
        widget_id=widget_id,
        project_id=widget.project_id,
        title=data.title,
        description=data.description,
        details=data.details,
        date=data.date,
        end_date=data.end_date,
        status=data.status,
        sort_order=data.sort_order
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return TimelineItemResponse(
        id=str(item.id),
        title=item.title,
        description=item.description,
        details=item.details,
        date=item.date,
        end_date=item.end_date,
        status=item.status,
        sort_order=item.sort_order
    )


# ============================================================================
# Public Widget Endpoints (No Auth Required)
# ============================================================================

@router.get("/embed/{widget_id}/config")
async def get_widget_config_public(
    widget_id: str,
    db: Session = Depends(get_db)
):
    """Get widget configuration for embedding (public)."""
    widget = db.query(Widget).filter(
        Widget.id == widget_id,
        Widget.is_active == True
    ).first()

    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")

    # Verify project is live
    project = db.query(Project).filter(
        Project.id == widget.project_id,
        Project.status == "live"
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not available")

    return {
        "id": str(widget.id),
        "type": widget.type,
        "name": widget.name,
        "config": widget.config or {},
        "project": {
            "name": project.name,
            "branding": project.widget_config or {}
        }
    }


@router.get("/embed/{widget_id}/faqs")
async def get_widget_faqs_public(
    widget_id: str,
    db: Session = Depends(get_db)
):
    """Get FAQs for a widget (public)."""
    widget = db.query(Widget).filter(
        Widget.id == widget_id,
        Widget.is_active == True
    ).first()

    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")

    faqs = db.query(FAQ).filter(
        FAQ.widget_id == widget_id,
        FAQ.is_active == True
    ).order_by(FAQ.sort_order).all()

    return {
        "faqs": [{
            "id": str(f.id),
            "question": f.question,
            "answer": f.answer,
            "category": f.category
        } for f in faqs]
    }


@router.get("/embed/{widget_id}/timeline")
async def get_widget_timeline_public(
    widget_id: str,
    db: Session = Depends(get_db)
):
    """Get timeline for a widget (public)."""
    widget = db.query(Widget).filter(
        Widget.id == widget_id,
        Widget.is_active == True
    ).first()

    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")

    items = db.query(TimelineItem).filter(
        TimelineItem.widget_id == widget_id
    ).order_by(TimelineItem.date).all()

    return {
        "milestones": [{
            "id": str(i.id),
            "title": i.title,
            "description": i.description,
            "details": i.details,
            "date": i.date.isoformat() if i.date else None,
            "endDate": i.end_date.isoformat() if i.end_date else None,
            "status": i.status
        } for i in items]
    }


@router.get("/embed/{widget_id}/documents")
async def get_widget_documents_public(
    widget_id: str,
    db: Session = Depends(get_db)
):
    """Get public documents for a widget (public)."""
    widget = db.query(Widget).filter(
        Widget.id == widget_id,
        Widget.is_active == True
    ).first()

    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")

    # Get public documents for this project
    docs = db.query(Document).filter(
        Document.project_id == widget.project_id,
        Document.content_type == "public"
    ).order_by(Document.upload_date.desc()).all()

    return {
        "documents": [{
            "id": str(d.id),
            "name": d.original_filename or d.filename,
            "category": d.tags[0] if d.tags else None,
            "type": d.file_type,
            "size": 0,  # Would need to store file size
            "date": d.upload_date.isoformat() if d.upload_date else None,
            "url": f"/api/documents/{d.id}/download"
        } for d in docs]
    }


@router.get("/embed/{widget_id}/comparison")
async def get_widget_comparison_public(
    widget_id: str,
    db: Session = Depends(get_db)
):
    """Get comparison slider config for a widget (public)."""
    widget = db.query(Widget).filter(
        Widget.id == widget_id,
        Widget.is_active == True
    ).first()

    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")

    config = widget.config or {}
    return {
        "beforeImage": config.get("beforeImage", ""),
        "afterImage": config.get("afterImage", ""),
        "beforeLabel": config.get("beforeLabel", "Before"),
        "afterLabel": config.get("afterLabel", "After"),
        "caption": config.get("caption", "")
    }


@router.post("/embed/{widget_id}/analytics")
async def track_widget_analytics(
    widget_id: str,
    data: dict,
    db: Session = Depends(get_db)
):
    """Track widget analytics (public)."""
    # Simple analytics tracking - could expand to store in ActivityLog
    widget = db.query(Widget).filter(Widget.id == widget_id).first()
    if not widget:
        return {"success": False}

    # Track FAQ views
    if data.get("action") == "view" and data.get("data", {}).get("faqId"):
        faq_id = data["data"]["faqId"]
        faq = db.query(FAQ).filter(FAQ.id == faq_id).first()
        if faq:
            faq.view_count = (faq.view_count or 0) + 1
            db.commit()

    return {"success": True}


# ============================================================================
# Interactive Map Public Endpoint
# ============================================================================

@router.get("/embed/project/{project_id}/interactive-map")
async def get_interactive_map_public(
    project_id: str,
    db: Session = Depends(get_db)
):
    """Get interactive map configuration for embedding (public)."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.status == "live"
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not available")

    # Get map config from widget_config
    widget_config = project.widget_config or {}
    map_config = widget_config.get("interactive_map", {})

    # Return config with project info
    return {
        "config": map_config,
        "project": {
            "id": str(project.id),
            "name": project.name,
            "branding": {
                "primary_color": widget_config.get("primary_color", "#7c3aed"),
                "position": widget_config.get("position", "bottom-right")
            }
        }
    }


@router.post("/embed/project/{project_id}/interactive-map/pin")
async def submit_map_pin(
    project_id: str,
    data: dict,
    db: Session = Depends(get_db)
):
    """Submit a new pin from the public widget."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.status == "live"
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not available")

    # Get current map config
    widget_config = project.widget_config or {}
    map_config = widget_config.get("interactive_map", {})

    # Add the new pin
    pins = map_config.get("pins", [])
    new_pin = {
        "id": str(uuid.uuid4()),
        "lat": data.get("lat"),
        "lng": data.get("lng"),
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "category": data.get("category", "info"),
        "votes": 0,
        "votedBy": [],
        "responses": [],
        "createdAt": datetime.utcnow().isoformat(),
        "createdBy": "public",
        "status": "pending" if map_config.get("requireApproval", False) else "approved"
    }
    pins.append(new_pin)
    map_config["pins"] = pins

    # Save back to project
    widget_config["interactive_map"] = map_config
    project.widget_config = widget_config
    flag_modified(project, "widget_config")
    db.commit()

    return {"success": True, "pin": new_pin}


@router.post("/embed/project/{project_id}/interactive-map/drawing")
async def submit_map_drawing(
    project_id: str,
    data: dict,
    db: Session = Depends(get_db)
):
    """Submit a new drawing from the public widget."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.status == "live"
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not available")

    # Get current map config
    widget_config = project.widget_config or {}
    map_config = widget_config.get("interactive_map", {})

    # Add the new drawing
    drawings = map_config.get("drawings", [])
    new_drawing = {
        "id": str(uuid.uuid4()),
        "type": data.get("type", "polygon"),
        "geometry": data.get("geometry"),
        "title": data.get("title", ""),
        "description": data.get("description", ""),
        "category": data.get("category", "improvement"),
        "votes": 0,
        "createdAt": datetime.utcnow().isoformat(),
        "status": "pending" if map_config.get("requireApproval", False) else "approved",
        "area": data.get("area"),
        "length": data.get("length")
    }
    drawings.append(new_drawing)
    map_config["drawings"] = drawings

    # Save back to project
    widget_config["interactive_map"] = map_config
    project.widget_config = widget_config
    flag_modified(project, "widget_config")
    db.commit()

    return {"success": True, "drawing": new_drawing}


@router.post("/embed/project/{project_id}/interactive-map/vote")
async def vote_on_pin(
    project_id: str,
    data: dict,
    db: Session = Depends(get_db)
):
    """Vote on a pin from the public widget."""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.status == "live"
    ).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not available")

    pin_id = data.get("pinId")
    voter_id = data.get("voterId", "anonymous")

    # Get current map config
    widget_config = project.widget_config or {}
    map_config = widget_config.get("interactive_map", {})

    # Find and update the pin
    pins = map_config.get("pins", [])
    for pin in pins:
        if pin.get("id") == pin_id:
            voted_by = pin.get("votedBy", [])
            if voter_id not in voted_by:
                voted_by.append(voter_id)
                pin["votedBy"] = voted_by
                pin["votes"] = len(voted_by)
            break

    map_config["pins"] = pins
    widget_config["interactive_map"] = map_config
    project.widget_config = widget_config
    flag_modified(project, "widget_config")
    db.commit()

    return {"success": True}
