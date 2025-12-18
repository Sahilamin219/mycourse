# Deployment Guide

## Prerequisites

- Docker & Docker Compose installed
- PostgreSQL 15+ (if not using Docker)
- Domain name (for production)
- SSL certificate (for production)

## Quick Start with Docker

```bash
# Clone repository
git clone <repo-url>
cd debatehub

# Start all services
cd backend
docker-compose up -d

# Run migrations
docker-compose exec backend alembic upgrade head

# View logs
docker-compose logs -f
```

## Production Deployment

### Using Docker

1. Update environment variables in docker-compose.yml
2. Set strong JWT_SECRET_KEY
3. Configure production DATABASE_URL
4. Set DEBUG=false
5. Deploy with docker-compose

### Manual Deployment

#### Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://..."
export JWT_SECRET_KEY="..."

# Run migrations
alembic upgrade head

# Start with Gunicorn
gunicorn app.main:app \
  --workers 4 \
  --worker-class uvicorn.workers.UvicornWorker \
  --bind 0.0.0.0:8000
```

#### Frontend

```bash
npm install
npm run build
# Deploy dist/ folder
```

## Environment Variables

See .env.example for all required variables.

## Monitoring

- Set up logging
- Configure error tracking (Sentry)
- Monitor database performance
- Set up uptime monitoring

## Backups

- Regular database backups
- Backup environment variables
- Document recovery procedures
