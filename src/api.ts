import type { Category, Course, Instructor, Testimonial, Stats } from './types';

const API_URL = 'http://localhost:8000/api';

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return response.json();
}

export async function fetchCourses(): Promise<Course[]> {
  const response = await fetch(`${API_URL}/courses`);
  if (!response.ok) throw new Error('Failed to fetch courses');
  return response.json();
}

export async function fetchCourse(id: string): Promise<Course> {
  const response = await fetch(`${API_URL}/courses/${id}`);
  if (!response.ok) throw new Error('Failed to fetch course');
  return response.json();
}

export async function fetchInstructors(): Promise<Instructor[]> {
  const response = await fetch(`${API_URL}/instructors`);
  if (!response.ok) throw new Error('Failed to fetch instructors');
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
