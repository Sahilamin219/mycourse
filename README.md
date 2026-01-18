# DebateHub - PostgreSQL Version

A debate platform application now powered by PostgreSQL database instead of Supabase.

## Quick Start

### Prerequisites
- Python 3.8+
- PostgreSQL 12+
- Node.js 16+

### Setup

1. **Install and start PostgreSQL**

2. **Create database:**
   ```bash
   psql postgres
   CREATE DATABASE debatehub;
   CREATE USER debateuser WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE debatehub TO debateuser;
   \q
   ```

3. **Configure environment variables:**
   Edit `.env` file:
   ```env
   DATABASE_URL=postgresql://debateuser:your_password@localhost:5432/debatehub
   VITE_API_URL=http://localhost:8000
   JWT_SECRET_KEY=your-secure-secret-key
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```
   
   **Google OAuth Setup (Optional):**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth client ID"
   - Choose "Web application"
   - Add authorized JavaScript origins: `http://localhost:3000`, `http://localhost:5173`
   - Add authorized redirect URIs: `http://localhost:3000`, `http://localhost:5173`
   - Copy the Client ID and add it to `.env` as `VITE_GOOGLE_CLIENT_ID`

4. **Install backend dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

5. **Initialize database:**
   ```bash
   cd backend
   python init_db.py
   ```

6. **Start backend server:**
   ```bash
   cd backend
   python main.py
   ```

7. **Install frontend dependencies:**
   ```bash
   npm install
   ```

8. **Build frontend:**
   ```bash
   npm run build
   ```

## Migration from Supabase

This application has been completely migrated from Supabase to PostgreSQL. See `POSTGRESQL_MIGRATION.md` for detailed migration information.

### Key Changes:
- No more Supabase dependencies
- Custom JWT authentication
- All data operations through FastAPI backend
- PostgreSQL database with SQLAlchemy ORM

## Architecture

### Backend (FastAPI + PostgreSQL)
- `/backend/main.py` - API endpoints
- `/backend/models.py` - Database models
- `/backend/database.py` - Database connection
- `/backend/auth.py` - Authentication logic
- `/backend/ai_analysis.py` - AI debate analysis

### Frontend (React + TypeScript)
- Authentication with JWT tokens
- All API calls to backend endpoints
- No direct database access

## Development

```bash
# Backend
cd backend
python main.py

# Frontend (runs automatically)
```

## Production Deployment

1. Set up PostgreSQL database on your hosting provider
2. Update DATABASE_URL with production credentials
3. Set a strong JWT_SECRET_KEY
4. Deploy backend FastAPI application
5. Build and deploy frontend
6. Update VITE_API_URL to production backend URL

## Database Schema

- **users** - User accounts and profiles
- **debate_sessions** - Debate session records
- **debate_transcripts** - Session transcripts
- **payments** - Payment records
- **notifications** - User notifications
- **improve_yourself_resources** - Learning resources

See `POSTGRESQL_MIGRATION.md` for full schema details.

## API Documentation

When backend is running, visit:
- API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

## License

MIT
