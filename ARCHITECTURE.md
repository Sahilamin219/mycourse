# DebateHub Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Schema](#database-schema)
5. [API Design](#api-design)
6. [Security](#security)
7. [Deployment](#deployment)

## Overview

DebateHub is a modern web application built with a clear separation between frontend and backend, following industry best practices and clean architecture principles.

### Technology Stack

**Backend:**
- FastAPI (Python web framework)
- PostgreSQL (Relational database)
- SQLAlchemy (ORM)
- Alembic (Database migrations)
- JWT (Authentication)
- Pydantic (Data validation)

**Frontend:**
- React 18+ with TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- Lucide React (Icons)

**DevOps:**
- Docker & Docker Compose
- Alembic migrations
- Environment-based configuration

## System Architecture

```
┌─────────────────┐
│   Web Browser   │
└────────┬────────┘
         │ HTTP/HTTPS
         ↓
┌─────────────────┐
│  React Frontend │  (Port 3000/5173)
│   (Vite/TS)     │
└────────┬────────┘
         │ REST API
         ↓
┌─────────────────┐
│  FastAPI Backend│  (Port 8000)
│   (Python 3.11) │
└────────┬────────┘
         │ SQLAlchemy
         ↓
┌─────────────────┐
│   PostgreSQL    │  (Port 5432)
│    Database     │
└─────────────────┘

Optional:
┌─────────────────┐
│     Redis       │  (Port 6379)
│   (Caching)     │
└─────────────────┘
```

## Backend Architecture

### Layered Architecture

```
┌───────────────────────────────────────┐
│         Routes Layer (API)            │  ← HTTP Request Handlers
├───────────────────────────────────────┤
│        Services Layer (Business)      │  ← Business Logic
├───────────────────────────────────────┤
│    Repositories Layer (Data Access)   │  ← Data Access Abstraction
├───────────────────────────────────────┤
│       Models Layer (Entities)         │  ← Database Entities
├───────────────────────────────────────┤
│         Database (PostgreSQL)         │  ← Data Storage
└───────────────────────────────────────┘
```

### Directory Structure

```
backend/app/
├── config/              # Configuration & settings
│   ├── settings.py      # Environment variables
│   └── database.py      # DB connection pooling
├── models/              # SQLAlchemy ORM models
│   ├── user.py          # User entity
│   ├── debate.py        # Debate entities
│   ├── payment.py       # Payment entity
│   ├── notification.py  # Notification entity
│   └── resource.py      # Resource entity
├── schemas/             # Pydantic DTOs
│   ├── user.py          # User DTOs
│   ├── debate.py        # Debate DTOs
│   ├── resource.py      # Resource DTOs
│   └── notification.py  # Notification DTOs
├── repositories/        # Data access layer
│   ├── user_repository.py
│   ├── debate_repository.py
│   ├── resource_repository.py
│   └── notification_repository.py
├── services/            # Business logic layer
│   ├── auth_service.py
│   ├── debate_service.py
│   ├── ai_service.py
│   └── resource_service.py
├── routes/              # API endpoints
│   ├── auth.py
│   ├── debates.py
│   ├── resources.py
│   └── notifications.py
├── middleware/          # Custom middleware
├── utils/               # Utilities
│   ├── security.py      # JWT, hashing
│   └── dependencies.py  # FastAPI dependencies
└── main.py              # Application entry point
```

### Request Flow

```
1. HTTP Request
   ↓
2. FastAPI Route Handler (routes/)
   ↓
3. Request Validation (Pydantic schemas/)
   ↓
4. Authentication Middleware (utils/dependencies.py)
   ↓
5. Service Layer (services/)
   ↓
6. Repository Layer (repositories/)
   ↓
7. Database Query (SQLAlchemy models/)
   ↓
8. PostgreSQL Database
   ↓
9. Response Serialization (Pydantic schemas/)
   ↓
10. HTTP Response
```

### Design Patterns

**1. Repository Pattern**
- Abstracts data access logic
- Provides clean interface for data operations
- Easy to mock for testing
- Centralizes database queries

**2. Service Layer Pattern**
- Encapsulates business logic
- Coordinates between repositories
- Handles transactions
- Reusable business operations

**3. Dependency Injection**
- FastAPI's built-in DI system
- Loose coupling between components
- Easy testing with mock dependencies
- Database session management

**4. DTO Pattern (Data Transfer Objects)**
- Pydantic models for request/response
- Input validation
- Type safety
- Auto-generated documentation

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│     Users       │
├─────────────────┤
│ id (PK)         │
│ email           │
│ password_hash   │
│ full_name       │
│ subscription    │
│ points          │
│ level           │
└────────┬────────┘
         │ 1:N
         ↓
┌─────────────────┐
│ DebateSessions  │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ topic           │
│ stance          │
│ scores          │
│ analysis        │
└────────┬────────┘
         │ 1:N
         ↓
┌─────────────────┐
│    Transcripts  │
├─────────────────┤
│ id (PK)         │
│ session_id (FK) │
│ speaker         │
│ text            │
│ timestamp       │
└─────────────────┘

┌─────────────────┐
│   Payments      │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ amount          │
│ status          │
└─────────────────┘

┌─────────────────┐
│ Notifications   │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ type            │
│ message         │
│ read            │
└─────────────────┘

┌─────────────────┐
│   Resources     │
├─────────────────┤
│ id (PK)         │
│ title           │
│ content         │
│ category        │
│ difficulty      │
└─────────────────┘
```

### Indexes

- `users.email` - UNIQUE INDEX
- `debate_sessions.user_id` - INDEX
- `debate_sessions.status` - INDEX
- `debate_sessions.created_at` - INDEX
- `debate_transcripts.session_id` - INDEX
- `notifications.user_id` - INDEX
- `notifications.read` - INDEX
- `resources.category` - INDEX
- `resources.difficulty` - INDEX

## API Design

### RESTful Principles

- Resources represented as nouns
- HTTP verbs for actions
- Stateless communication
- JSON responses
- Proper HTTP status codes

### API Versioning

All endpoints prefixed with `/api/v1/`

### Authentication

- JWT Bearer token authentication
- Token in Authorization header
- Format: `Authorization: Bearer <token>`

### Response Format

**Success Response:**
```json
{
  "id": "uuid",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

**Error Response:**
```json
{
  "detail": "Error message",
  "status_code": 400
}
```

### Rate Limiting

- Implement rate limiting per user/IP
- Use Redis for distributed rate limiting
- Different limits for authenticated vs anonymous

## Security

### Authentication & Authorization

1. **Password Security**
   - Bcrypt hashing
   - Minimum 6 characters
   - Salt rounds: 12

2. **JWT Tokens**
   - HS256 algorithm
   - 30-day expiration
   - Payload: user_id only
   - Secret key from environment

3. **Authorization**
   - Resource ownership validation
   - Role-based access control (future)
   - Per-endpoint authentication

### API Security

1. **Input Validation**
   - Pydantic models
   - Type checking
   - Length validation
   - Format validation

2. **SQL Injection Prevention**
   - SQLAlchemy ORM
   - Parameterized queries
   - No raw SQL

3. **CORS Configuration**
   - Whitelist origins
   - Credentials support
   - Specific methods only

4. **HTTPS**
   - TLS 1.2+ only
   - Secure headers
   - HSTS enabled

### Data Protection

- Sensitive data encryption
- No secrets in code
- Environment variables
- Secure secret management

## Deployment

### Development Environment

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
source env.sh
uvicorn app.main:app --reload

# Frontend
npm install
npm run dev
```

### Docker Deployment

```bash
cd backend
docker-compose up -d
docker-compose exec backend alembic upgrade head
```

### Production Deployment

**Backend:**
- Gunicorn with Uvicorn workers
- 4+ workers (CPU cores * 2 + 1)
- Reverse proxy (Nginx)
- SSL/TLS termination
- Load balancer

**Database:**
- Managed PostgreSQL (RDS, Cloud SQL)
- Connection pooling
- Regular backups
- Read replicas for scaling

**Monitoring:**
- Application logs
- Error tracking (Sentry)
- Performance monitoring
- Database query monitoring
- Uptime monitoring

### Scaling Strategy

**Horizontal Scaling:**
- Multiple backend instances
- Load balancer distribution
- Stateless application design
- Shared database/cache

**Vertical Scaling:**
- Increase server resources
- Database optimization
- Query optimization
- Connection pooling

**Caching:**
- Redis for session data
- Query result caching
- API response caching
- CDN for static assets

## Best Practices

### Code Quality

- Type hints throughout
- Docstrings for functions
- Consistent naming conventions
- Code formatting (Black)
- Linting (Flake8)
- Type checking (MyPy)

### Testing

- Unit tests for services
- Integration tests for APIs
- Repository tests with test DB
- >80% code coverage
- Automated CI/CD testing

### Database

- Migrations for all changes
- Index commonly queried fields
- Avoid N+1 queries
- Use connection pooling
- Regular maintenance

### Security

- Regular dependency updates
- Security audits
- Penetration testing
- Input validation
- Output encoding
- Error handling

## Future Enhancements

1. **Caching Layer**
   - Redis integration
   - Query result caching
   - Session management

2. **Task Queue**
   - Celery for async tasks
   - Background job processing
   - Scheduled tasks

3. **Microservices**
   - Separate AI service
   - Separate notification service
   - Event-driven architecture

4. **Real-time Features**
   - WebSocket support
   - Live debate updates
   - Real-time notifications

5. **Analytics**
   - User behavior tracking
   - Performance metrics
   - Business intelligence

6. **Advanced Security**
   - Two-factor authentication
   - OAuth2 providers
   - API key management
   - Rate limiting per user
