import type { DebateTopic, Resource, Testimonial, Stats } from './types';

const API_URL = 'http://localhost:8000/api';

export async function fetchDebateTopics(): Promise<DebateTopic[]> {
  // Assuming categories map to debate topics for now
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) throw new Error('Failed to fetch debate topics');
  return response.json();
}

export async function fetchResources(): Promise<Resource[]> {
  const response = await fetch(`${API_URL}/courses`);
  if (!response.ok) throw new Error('Failed to fetch resources');
  return response.json();
}

export async function fetchResource(id: string): Promise<Resource> {
  const response = await fetch(`${API_URL}/courses/${id}`);
  if (!response.ok) throw new Error('Failed to fetch resource');
  return response.json();
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  const response = await fetch(`${API_URL}/testimonials`);
  if (!response.ok) throw new Error('Failed to fetch testimonials');
  return response.json();
}

export async function fetchStats(): Promise<Stats> {
  const response = await fetch(`${API_URL}/stats`);
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

export async function generateDebateAnalysis(sessionId: string, accessToken: string) {
  const response = await fetch(`${API_URL}/debate-analysis/${sessionId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    // user_id is extracted from token in backend, but we might need to pass it if the endpoint expects it in body or query
    // The current backend implementation expects user_id as query param or body? 
    // Let's check backend: @app.post("/api/debate-analysis/{session_id}") async def create_debate_analysis(session_id: str, user_id: str, ...
    // It expects user_id as query param. We should fix backend to get it from token, but for now let's pass it if we can, 
    // or rely on the backend change I should make. 
    // Actually, looking at my backend code: 
    // @app.post("/api/debate-analysis/{session_id}")
    // async def create_debate_analysis(session_id: str, user_id: str, db: Session = Depends(get_db)):
    // It requires user_id as a query param.
    // I will update this function to fetch the user ID from the token in the backend later or pass it here.
    // For now, let's assume the backend will be updated to use the token's user_id, or we pass it.
    // Since I can't easily get user_id here without decoding token, I'll update the backend to use current_user.
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to generate analysis');
  }

  return response.json();
}
