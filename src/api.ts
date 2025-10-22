import type { DebateTopic, Resource, Testimonial, Stats } from './types';

const API_URL = 'http://localhost:8000/api';

export async function fetchDebateTopics(): Promise<DebateTopic[]> {
  const response = await fetch(`${API_URL}/debate-topics`);
  if (!response.ok) throw new Error('Failed to fetch debate topics');
  return response.json();
}

export async function fetchResources(): Promise<Resource[]> {
  const response = await fetch(`${API_URL}/resources`);
  if (!response.ok) throw new Error('Failed to fetch resources');
  return response.json();
}

export async function fetchResource(id: string): Promise<Resource> {
  const response = await fetch(`${API_URL}/resources/${id}`);
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
