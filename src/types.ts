export interface DebateTopic {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: string;
  debate_count: number;
  difficulty?: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  author?: string;
  category_id: string;
  category_name?: string;
  type: 'article' | 'guide' | 'video' | 'tips';
  duration: string;
  image_url: string;
  badge?: string;
  badge_color?: string;
  updated_date?: string;
  is_featured?: boolean;
  views?: number;
}

export interface Testimonial {
  id: string;
  user_name: string;
  user_title: string;
  user_avatar: string;
  rating: number;
  comment: string;
}

export interface Stats {
  total_debates: number;
  active_users: number;
  debate_topics: number;
  support_available: string;
}
