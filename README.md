# Consultation Suite

A comprehensive SaaS platform for managing planning consultation engagement, featuring embeddable widgets, AI-powered chatbot, stakeholder query tracking, and approval workflows.

## Features

### Embeddable Widgets
- **AI Chatbot** - RAG-powered consultation assistant
- **FAQ Accordion** - Searchable Q&A sections
- **Document Library** - Categorised documents with download tracking
- **Image Comparison** - Before/after slider
- **Timeline** - Project milestones and status
- **Feedback Forms** - Customisable submission forms
- **Gallery** - Image/video galleries (coming soon)
- **Statistics** - Animated key stats display (coming soon)

### Backend Dashboard
- Project management with branding
- Widget configuration and embed code generation
- Document upload and processing
- Analytics and reporting

### Stakeholder Query Tracker
- Unified inbox for all submissions
- Status workflow (New → In Progress → Awaiting Approval → Sent)
- Assignment and categorisation
- Response templates
- Internal notes

### Approval Workflows
- Configurable approval stages
- Email notifications
- Audit trail
- Escalation rules

## Tech Stack

- **Backend**: Python FastAPI, SQLAlchemy, PostgreSQL + pgvector
- **Frontend**: Next.js 14, React, Tailwind CSS
- **Widgets**: Vanilla JavaScript, Shadow DOM
- **AI**: OpenAI (embeddings + chat), hybrid search
- **Infrastructure**: Docker, Redis

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for local development)
- Python 3.11+ (for local development)

### Using Docker

```bash
# Clone and setup
cp .env.example .env
# Edit .env with your API keys

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

Services:
- Backend API: http://localhost:8000
- Admin Dashboard: http://localhost:3001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Local Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r ../requirements.txt
uvicorn main:app --reload

# Admin Frontend
cd admin-frontend
npm install
npm run dev

# Widgets
cd widgets
npm install
npm run dev
```

## Embedding Widgets

### Script Tag Method
```html
<div data-consultation-widget="chatbot" data-widget-id="YOUR_WIDGET_ID"></div>
<script src="https://cdn.consultationsuite.com/widgets.js" async></script>
```

### iFrame Method
```html
<iframe
  src="https://app.consultationsuite.com/embed/YOUR_WIDGET_ID"
  width="100%"
  height="500"
  frameborder="0"
></iframe>
```

## API Documentation

Once running, visit http://localhost:8000/docs for interactive API documentation.

### Key Endpoints

**Authentication**
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Current user

**Projects**
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project

**Widgets**
- `GET /api/projects/{id}/widgets` - List widgets
- `POST /api/projects/{id}/widgets` - Create widget
- `GET /api/widgets/{id}/embed-code` - Get embed code

**Queries**
- `GET /api/projects/{id}/queries` - List queries
- `GET /api/queries/{id}` - Get query details
- `POST /api/queries/{id}/responses` - Create response

**Public (No Auth)**
- `GET /api/embed/{widget_id}/config` - Widget config
- `POST /api/submit/{widget_id}` - Form submission
- `POST /api/widget/{project_id}/chat` - Chat message

## Project Structure

```
consultation-suite/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── database.py          # SQLAlchemy models
│   ├── config.py            # Settings
│   ├── routers/
│   │   ├── auth.py          # Authentication
│   │   ├── projects.py      # Project CRUD
│   │   ├── widgets.py       # Widget management
│   │   ├── queries.py       # Query tracker
│   │   ├── chat.py          # AI chatbot
│   │   └── ...
│   └── services/
│       ├── llm.py           # LLM integration
│       ├── retrieval.py     # Vector search
│       └── ...
├── admin-frontend/          # Next.js dashboard
├── widgets/
│   └── src/
│       ├── loader/          # Widget loader
│       └── widgets/         # Individual widgets
├── docker-compose.yml
└── requirements.txt
```

## Environment Variables

See `.env.example` for all configuration options.

Required:
- `DATABASE_URL` - PostgreSQL connection
- `OPENAI_API_KEY` - For embeddings and chat
- `SECRET_KEY` - JWT signing key

Optional:
- `SENDGRID_API_KEY` - Email sending
- `S3_BUCKET` - File storage

## License

Proprietary - All rights reserved
