export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  course_count: number;
}

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio?: string;
  avatar_url?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor_id: string;
  instructor_name?: string;
  category_id: string;
  category_name?: string;
  price: number;
  original_price: number;
  rating: number;
  student_count: number;
  duration: string;
  image_url: string;
  badge?: string;
  badge_color?: string;
  updated_date?: string;
  is_featured?: boolean;
}

export interface Testimonial {
  id: string;
  student_name: string;
  student_title: string;
  student_avatar: string;
  rating: number;
  comment: string;
}

export interface Stats {
  courses_available: number;
  happy_students: number;
  expert_instructors: number;
  support_available: string;
}
