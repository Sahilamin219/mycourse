import type { DebateTopic, Resource, Testimonial, Stats } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  subscription_tier: string;
  subscription_status: string;
  points: number;
  level: number;
  badges: string[];
  streak_days: number;
  debates_completed: number;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface DebateSession {
  id: string;
  user_id: string;
  topic: string;
  stance: string;
  duration: number;
  status: string;
  overall_score?: number;
  clarity_score?: number;
  logic_score?: number;
  evidence_score?: number;
  rebuttal_score?: number;
  persuasiveness_score?: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  weak_portions: any[];
  created_at: string;
  completed_at?: string;
}

const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export async function signUp(email: string, password: string, fullName?: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, password, full_name: fullName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to sign up');
  }

  return response.json();
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/signin`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to sign in');
  }

  return response.json();
}

export async function getCurrentUser(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/auth/me`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Failed to get current user');
  }

  return response.json();
}

export async function createDebateSession(
  token: string,
  topic: string,
  stance: string
): Promise<DebateSession> {
  const response = await fetch(`${API_URL}/debates/sessions`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ topic, stance }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create debate session');
  }

  return response.json();
}

export async function getDebateSessions(token: string): Promise<DebateSession[]> {
  const response = await fetch(`${API_URL}/debates/sessions`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch debate sessions');
  }

  return response.json();
}

export async function getDebateSession(token: string, sessionId: string): Promise<DebateSession> {
  const response = await fetch(`${API_URL}/debates/sessions/${sessionId}`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch debate session');
  }

  return response.json();
}

export async function createTranscript(
  token: string,
  sessionId: string,
  speaker: string,
  text: string
): Promise<{ id: string; message: string }> {
  const response = await fetch(`${API_URL}/debates/transcripts`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ session_id: sessionId, speaker, text }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to create transcript');
  }

  return response.json();
}

export async function getTranscripts(token: string, sessionId: string): Promise<any[]> {
  const response = await fetch(`${API_URL}/debates/sessions/${sessionId}/transcripts`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transcripts');
  }

  return response.json();
}

export async function analyzeDebate(
  token: string,
  sessionId: string,
  transcripts: any[]
): Promise<{ analysis: any; message: string }> {
  const response = await fetch(`${API_URL}/debates/analyze`, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({ session_id: sessionId, transcripts }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to analyze debate');
  }

  return response.json();
}

export async function getResources(): Promise<Resource[]> {
  const response = await fetch(`${API_URL}/resources`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch resources');
  }

  return response.json();
}

export const fetchResources = getResources;

export async function getNotifications(token: string): Promise<any[]> {
  const response = await fetch(`${API_URL}/notifications`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }

  return response.json();
}

export async function markNotificationAsRead(token: string, notificationId: string): Promise<void> {
  const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }
}

export async function fetchDebateTopics(): Promise<DebateTopic[]> {
  return [];
}

export async function fetchResource(id: string): Promise<Resource> {
  const resources = await getResources();
  const resource = resources.find(r => r.id === id);
  if (!resource) {
    throw new Error('Resource not found');
  }
  return resource;
}

export async function fetchTestimonials(): Promise<Testimonial[]> {
  return [];
}

export async function fetchStats(): Promise<Stats> {
  return {
    courses_available: 0,
    happy_students: 0,
    expert_instructors: 0,
    support_available: '24/7'
  };
}

export async function generateDebateAnalysis(sessionId: string, accessToken: string) {
  const transcripts = await getTranscripts(accessToken, sessionId);
  return analyzeDebate(accessToken, sessionId, transcripts);
}
