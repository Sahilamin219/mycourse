import type { DebateTopic, Resource, Testimonial, Stats } from './types';
import { apiLogger } from './utils/logger';

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
  apiLogger.info('Signing up user', { email, hasFullName: !!fullName });

  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password, full_name: fullName }),
    });

    if (!response.ok) {
      const error = await response.json();
      apiLogger.error('Sign up failed', error, { email, status: response.status });
      throw new Error(error.detail || 'Failed to sign up');
    }

    const data = await response.json();
    apiLogger.info('User signed up successfully', { email, userId: data.user?.id });
    return data;
  } catch (error) {
    apiLogger.error('Sign up request failed', error, { email });
    throw error;
  }
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  apiLogger.info('Signing in user', { email });

  try {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      apiLogger.error('Sign in failed', error, { email, status: response.status });
      throw new Error(error.detail || 'Failed to sign in');
    }

    const data = await response.json();
    apiLogger.info('User signed in successfully', { email, userId: data.user?.id });
    return data;
  } catch (error) {
    apiLogger.error('Sign in request failed', error, { email });
    throw error;
  }
}

export async function signInWithGoogle(userInfo: { email: string; name?: string; picture?: string; id: string }): Promise<AuthResponse> {
  apiLogger.info('Signing in user with Google', { email: userInfo.email });

  try {
    const response = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ 
        email: userInfo.email,
        full_name: userInfo.name,
        google_id: userInfo.id,
        picture: userInfo.picture,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      apiLogger.error('Google sign in failed', error, { status: response.status });
      throw new Error(error.detail || 'Failed to sign in with Google');
    }

    const data = await response.json();
    apiLogger.info('User signed in with Google successfully', { userId: data.user?.id });
    return data;
  } catch (error) {
    apiLogger.error('Google sign in request failed', error);
    throw error;
  }
}

export async function getCurrentUser(token: string): Promise<User> {
  apiLogger.debug('Fetching current user');

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      apiLogger.error('Failed to get current user', null, { status: response.status });
      throw new Error('Failed to get current user');
    }

    const data = await response.json();
    apiLogger.debug('Current user fetched successfully', { userId: data.id });
    return data;
  } catch (error) {
    apiLogger.error('Get current user request failed', error);
    throw error;
  }
}

export async function createDebateSession(
  token: string,
  topic: string,
  stance: string
): Promise<DebateSession> {
  apiLogger.info('Creating debate session', { topic, stance });

  try {
    const response = await fetch(`${API_URL}/debates/sessions`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ topic, stance }),
    });

    if (!response.ok) {
      const error = await response.json();
      apiLogger.error('Failed to create debate session', error, { topic, stance, status: response.status });
      throw new Error(error.detail || 'Failed to create debate session');
    }

    const data = await response.json();
    apiLogger.info('Debate session created successfully', { sessionId: data.id, topic });
    return data;
  } catch (error) {
    apiLogger.error('Create debate session request failed', error, { topic, stance });
    throw error;
  }
}

export async function getDebateSessions(token: string): Promise<DebateSession[]> {
  apiLogger.debug('Fetching debate sessions');

  try {
    const response = await fetch(`${API_URL}/debates/sessions`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      apiLogger.error('Failed to fetch debate sessions', null, { status: response.status });
      throw new Error('Failed to fetch debate sessions');
    }

    const data = await response.json();
    apiLogger.info('Debate sessions fetched successfully', { count: data.length });
    return data;
  } catch (error) {
    apiLogger.error('Get debate sessions request failed', error);
    throw error;
  }
}

export async function getDebateSession(token: string, sessionId: string): Promise<DebateSession> {
  apiLogger.debug('Fetching debate session', { sessionId });

  try {
    const response = await fetch(`${API_URL}/debates/sessions/${sessionId}`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      apiLogger.error('Failed to fetch debate session', null, { sessionId, status: response.status });
      throw new Error('Failed to fetch debate session');
    }

    const data = await response.json();
    apiLogger.debug('Debate session fetched successfully', { sessionId });
    return data;
  } catch (error) {
    apiLogger.error('Get debate session request failed', error, { sessionId });
    throw error;
  }
}

export async function updateDebateSession(
  token: string,
  sessionId: string,
  duration: number
): Promise<DebateSession> {
  apiLogger.info('Updating debate session', { sessionId, duration });

  try {
    const response = await fetch(`${API_URL}/debates/sessions/${sessionId}`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ duration }),
    });

    if (!response.ok) {
      const error = await response.json();
      apiLogger.error('Failed to update debate session', error, { sessionId, duration, status: response.status });
      throw new Error(error.detail || 'Failed to update debate session');
    }

    const data = await response.json();
    apiLogger.info('Debate session updated successfully', { sessionId });
    return data;
  } catch (error) {
    apiLogger.error('Update debate session request failed', error, { sessionId, duration });
    throw error;
  }
}

export async function createTranscript(
  token: string,
  sessionId: string,
  speaker: string,
  text: string
): Promise<{ id: string; message: string }> {
  apiLogger.debug('Creating transcript', { sessionId, speaker, textLength: text.length });

  try {
    const response = await fetch(`${API_URL}/debates/transcripts`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ session_id: sessionId, speaker, text }),
    });

    if (!response.ok) {
      const error = await response.json();
      apiLogger.error('Failed to create transcript', error, { sessionId, speaker, status: response.status });
      throw new Error(error.detail || 'Failed to create transcript');
    }

    const data = await response.json();
    apiLogger.debug('Transcript created successfully', { sessionId, transcriptId: data.id });
    return data;
  } catch (error) {
    apiLogger.error('Create transcript request failed', error, { sessionId, speaker });
    throw error;
  }
}

export async function getTranscripts(token: string, sessionId: string): Promise<any[]> {
  apiLogger.debug('Fetching transcripts', { sessionId });

  try {
    const response = await fetch(`${API_URL}/debates/sessions/${sessionId}/transcripts`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      apiLogger.error('Failed to fetch transcripts', null, { sessionId, status: response.status });
      throw new Error('Failed to fetch transcripts');
    }

    const data = await response.json();
    apiLogger.debug('Transcripts fetched successfully', { sessionId, count: data.length });
    return data;
  } catch (error) {
    apiLogger.error('Get transcripts request failed', error, { sessionId });
    throw error;
  }
}

export async function analyzeDebate(
  token: string,
  sessionId: string,
  transcripts: any[]
): Promise<{ analysis: any; message: string }> {
  apiLogger.info('Analyzing debate', { sessionId, transcriptCount: transcripts.length });

  try {
    const response = await fetch(`${API_URL}/debates/analyze`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ session_id: sessionId, transcripts }),
    });

    if (!response.ok) {
      const error = await response.json();
      apiLogger.error('Failed to analyze debate', error, { sessionId, status: response.status });
      throw new Error(error.detail || 'Failed to analyze debate');
    }

    const data = await response.json();
    apiLogger.info('Debate analyzed successfully', { sessionId });
    return data;
  } catch (error) {
    apiLogger.error('Analyze debate request failed', error, { sessionId });
    throw error;
  }
}

export async function getResources(): Promise<Resource[]> {
  apiLogger.debug('Fetching resources');

  try {
    const response = await fetch(`${API_URL}/resources`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      apiLogger.error('Failed to fetch resources', null, { status: response.status });
      throw new Error('Failed to fetch resources');
    }

    const data = await response.json();
    apiLogger.info('Resources fetched successfully', { count: data.length });
    return data;
  } catch (error) {
    apiLogger.error('Get resources request failed', error);
    throw error;
  }
}

export const fetchResources = getResources;

export async function getNotifications(token: string): Promise<any[]> {
  apiLogger.debug('Fetching notifications');

  try {
    const response = await fetch(`${API_URL}/notifications`, {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      apiLogger.error('Failed to fetch notifications', null, { status: response.status });
      throw new Error('Failed to fetch notifications');
    }

    const data = await response.json();
    apiLogger.info('Notifications fetched successfully', { count: data.length });
    return data;
  } catch (error) {
    apiLogger.error('Get notifications request failed', error);
    throw error;
  }
}

export async function markNotificationAsRead(token: string, notificationId: string): Promise<void> {
  apiLogger.debug('Marking notification as read', { notificationId });

  try {
    const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      apiLogger.error('Failed to mark notification as read', null, { notificationId, status: response.status });
      throw new Error('Failed to mark notification as read');
    }

    apiLogger.debug('Notification marked as read successfully', { notificationId });
  } catch (error) {
    apiLogger.error('Mark notification as read request failed', error, { notificationId });
    throw error;
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
  apiLogger.info('Generating debate analysis', { sessionId });

  try {
    const transcripts = await getTranscripts(accessToken, sessionId);
    apiLogger.info('Fetched transcripts for analysis', { sessionId, count: transcripts.length });
    
    if (transcripts.length === 0) {
      throw new Error('No transcripts found for this debate session');
    }
    
    // Format transcripts for analysis (ensure they match backend expectations)
    const formattedTranscripts = transcripts.map(t => ({
      speaker: t.speaker,
      text: t.text,
      timestamp: t.timestamp
    }));
    
    const result = await analyzeDebate(accessToken, sessionId, formattedTranscripts);
    apiLogger.info('Debate analysis generated successfully', { sessionId });
    return result;
  } catch (error) {
    apiLogger.error('Failed to generate debate analysis', error, { sessionId });
    throw error;
  }
}
