# LearnHub Backend API

FastAPI backend for the LearnHub course selling platform.

## Setup

1. Create a virtual environment:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Make sure the environment variables are set (they should already be in the .env file in the project root):
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

4. Run the server:
```bash
python main.py
```

The API will be available at http://localhost:8000

## API Endpoints

- `GET /` - Welcome message
- `GET /api/categories` - Get all categories
- `GET /api/courses` - Get all courses
- `GET /api/courses/{course_id}` - Get a specific course
- `GET /api/instructors` - Get all instructors
- `GET /api/testimonials` - Get all testimonials
- `GET /api/stats` - Get platform statistics

## Documentation

Once the server is running, visit http://localhost:8000/docs for interactive API documentation.
