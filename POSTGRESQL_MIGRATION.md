# PostgreSQL Migration Guide

Your application has been successfully migrated from Supabase to PostgreSQL. All Supabase dependencies and code have been removed.

## What Changed

### Backend Changes
1. **Database**: Now uses raw PostgreSQL with SQLAlchemy ORM
2. **Authentication**: Custom JWT-based authentication (no more Supabase Auth)
3. **API Structure**: All database operations go through FastAPI backend endpoints
4. **Dependencies**: Replaced Supabase client with PostgreSQL drivers

### Frontend Changes
1. **Removed**: `@supabase/supabase-js` package
2. **Auth**: Custom auth context using JWT tokens stored in localStorage
3. **API Calls**: All requests now go to the backend API instead of Supabase directly

### Removed
- All Supabase edge functions
- All Supabase migrations
- Supabase client libraries from both frontend and backend

## Setup Instructions

### 1. Install PostgreSQL

**MacOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
psql postgres
CREATE DATABASE debatehub;
CREATE USER debateuser WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE debatehub TO debateuser;
\q
```

### 3. Update Environment Variables

Edit `.env` file in the project root:

```env
DATABASE_URL=postgresql://debateuser:your_secure_password@localhost:5432/debatehub
VITE_API_URL=http://localhost:8000
JWT_SECRET_KEY=your-very-secure-secret-key-change-this
```

### 4. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 5. Start the Backend Server

```bash
cd backend
python main.py
```

The backend will:
- Connect to PostgreSQL
- Automatically create all database tables
- Start the API server on port 8000

### 6. Install Frontend Dependencies

```bash
npm install
```

### 7. Start the Frontend

The development server starts automatically.

## API Endpoints

### Authentication
- `POST /auth/signup` - Create new user account
- `POST /auth/signin` - Sign in with email/password
- `GET /auth/me` - Get current user info (requires auth token)

### Debates
- `POST /debates/sessions` - Create new debate session
- `GET /debates/sessions` - Get all user debate sessions
- `GET /debates/sessions/{id}` - Get specific debate session
- `POST /debates/transcripts` - Create debate transcript
- `GET /debates/sessions/{id}/transcripts` - Get session transcripts
- `POST /debates/analyze` - Analyze debate and generate scores

### Resources
- `GET /resources` - Get all learning resources

### Notifications
- `GET /notifications` - Get user notifications
- `PUT /notifications/{id}/read` - Mark notification as read

## Database Schema

### Users Table
- id, email, password_hash, full_name
- subscription_tier, subscription_status
- points, level, badges
- streak_days, debates_completed
- created_at, updated_at

### Debate Sessions Table
- id, user_id, topic, stance, duration, status
- Scoring: overall_score, clarity_score, logic_score, evidence_score, rebuttal_score, persuasiveness_score
- Analysis: strengths, weaknesses, recommendations, weak_portions
- created_at, completed_at

### Debate Transcripts Table
- id, session_id, speaker, text, timestamp

### Payments Table
- id, user_id, amount, currency, status
- payment_id, order_id, subscription_tier
- created_at

### Notifications Table
- id, user_id, type, title, message, read
- created_at

### Resources Table
- id, title, description, content, category
- difficulty, estimated_time, icon, gradient
- created_at

## Authentication Flow

1. User signs up or signs in
2. Backend returns JWT access token
3. Frontend stores token in localStorage
4. All subsequent API requests include token in Authorization header
5. Backend validates token and returns user data

## Important Notes

- Payment functionality is not yet implemented (previously used Razorpay with Supabase edge functions)
- Email notifications and scheduled tasks need to be reimplemented
- No OAuth providers (Google sign-in) currently implemented
- Session data persists in PostgreSQL database

## Troubleshooting

**Database Connection Error:**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env file
- Ensure database and user exist

**Authentication Error:**
- Clear browser localStorage
- Check JWT_SECRET_KEY is set in .env

**API Connection Error:**
- Ensure backend is running on port 8000
- Check VITE_API_URL in .env matches backend URL

## Next Steps

To fully complete the migration, you may want to:
1. Implement payment processing with a new provider
2. Set up email notifications using SendGrid or similar
3. Add OAuth providers if needed
4. Implement scheduled tasks using Celery or similar
5. Set up database backups
6. Configure production environment variables
