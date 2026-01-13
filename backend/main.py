import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import get_settings
from database import init_db
from routers import projects, documents, qa, chat, analytics, auth, widgets, queries

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # Initialize database on startup
    try:
        init_db()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database initialization error: {e}")
        print("Make sure PostgreSQL is running with pgvector extension")

    yield

    # Cleanup on shutdown
    print("Shutting down...")


app = FastAPI(
    title="Consultation Suite",
    description="Consultation Engagement Suite - SaaS platform for planning consultation engagement",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(documents.router)
app.include_router(qa.router)
app.include_router(chat.router)
app.include_router(analytics.router)
app.include_router(widgets.router)
app.include_router(queries.router)

# Serve widget static files if directory exists (legacy chat widget)
widget_path = os.path.join(os.path.dirname(__file__), "..", "widget", "build")
if os.path.exists(widget_path):
    app.mount("/widget", StaticFiles(directory=widget_path), name="widget")

# Serve new widgets (consultation-widgets.js)
widgets_path = os.path.join(os.path.dirname(__file__), "widgets", "dist")
if os.path.exists(widgets_path):
    app.mount("/widgets", StaticFiles(directory=widgets_path), name="widgets")

# Serve uploaded images
images_path = os.path.join(settings.local_storage_path, "images")
os.makedirs(images_path, exist_ok=True)
app.mount("/api/uploads/images", StaticFiles(directory=images_path), name="uploaded_images")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": "Consultation Suite",
        "version": "1.0.0",
        "status": "running",
        "modules": ["chatbot", "widgets", "queries", "approvals"]
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
