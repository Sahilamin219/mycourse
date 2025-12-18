# DebateHub Backend API

Enterprise-grade FastAPI backend with PostgreSQL, following clean architecture principles and industry best practices.

## Architecture

```
backend/
├── app/
│   ├── config/          # Configuration and settings
│   ├── models/          # SQLAlchemy ORM models
│   ├── schemas/         # Pydantic schemas/DTOs
│   ├── repositories/    # Data access layer
│   ├── services/        # Business logic layer
│   ├── routes/          # API endpoints/controllers
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   └── main.py          # Application entry point
├── alembic/             # Database migrations
├── tests/               # Test suite
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

## Quick Start with Docker

```bash
docker-compose up -d
docker-compose exec backend alembic upgrade head
```

## Local Development

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
source env.sh
alembic upgrade head
uvicorn app.main:app --reload
```

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

See `.env.example` for all configuration options.
