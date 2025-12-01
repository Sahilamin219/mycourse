/*
  # Improve Yourself Resources System

  ## New Tables

  ### `learning_resources`
  - `id` (uuid, PK)
  - `title` (text) - Resource title
  - `description` (text) - Brief description
  - `url` (text) - External link to resource
  - `category` (text) - Category: 'vocal_health', 'public_speaking', 'debate_skills', 'body_language', 'storytelling', 'communication'
  - `source` (text) - Source name (e.g., 'TED', 'Vinh Giang', 'Dale Carnegie')
  - `resource_type` (text) - Type: 'article', 'video', 'course', 'book', 'podcast'
  - `difficulty` (text) - Difficulty level: 'beginner', 'intermediate', 'advanced'
  - `estimated_time` (text) - Estimated time to complete (e.g., '10 min', '1 hour', '4 weeks')
  - `is_free` (boolean) - Whether resource is free
  - `rating` (numeric) - User rating (1-5)
  - `view_count` (integer) - Number of views
  - `featured` (boolean) - Whether to feature on homepage
  - `tags` (text[]) - Array of tags
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `user_saved_resources`
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to auth.users)
  - `resource_id` (uuid, FK to learning_resources)
  - `saved_at` (timestamptz)
  - `completed` (boolean)
  - `notes` (text)
  - Unique constraint on (user_id, resource_id)

  ### `resource_ratings`
  - `id` (uuid, PK)
  - `user_id` (uuid, FK to auth.users)
  - `resource_id` (uuid, FK to learning_resources)
  - `rating` (integer) - Rating 1-5
  - `review` (text)
  - `created_at` (timestamptz)
  - Unique constraint on (user_id, resource_id)

  ## Security
  - Enable RLS on all tables
  - Resources viewable by all authenticated users
  - Users can only manage their own saved resources and ratings
*/

CREATE TABLE IF NOT EXISTS learning_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  url text NOT NULL,
  category text NOT NULL CHECK (category IN ('vocal_health', 'public_speaking', 'debate_skills', 'body_language', 'storytelling', 'communication')),
  source text NOT NULL,
  resource_type text NOT NULL CHECK (resource_type IN ('article', 'video', 'course', 'book', 'podcast', 'workshop')),
  difficulty text DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time text,
  is_free boolean DEFAULT true,
  rating numeric DEFAULT 0,
  view_count integer DEFAULT 0,
  featured boolean DEFAULT false,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_saved_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resource_id uuid REFERENCES learning_resources(id) ON DELETE CASCADE NOT NULL,
  saved_at timestamptz DEFAULT now(),
  completed boolean DEFAULT false,
  notes text,
  UNIQUE(user_id, resource_id)
);

CREATE TABLE IF NOT EXISTS resource_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resource_id uuid REFERENCES learning_resources(id) ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_learning_resources_category ON learning_resources(category);
CREATE INDEX IF NOT EXISTS idx_learning_resources_featured ON learning_resources(featured);
CREATE INDEX IF NOT EXISTS idx_user_saved_resources_user ON user_saved_resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_ratings_resource ON resource_ratings(resource_id);

-- Insert curated learning resources
INSERT INTO learning_resources (title, description, url, category, source, resource_type, difficulty, estimated_time, is_free, featured, tags) VALUES
  
  -- Vocal Health
  ('Healthy Vocal Technique', 'Master your voice with professional vocal training from Victoria Rapanan. Learn Old Italian School principles combined with Swedish techniques.', 'https://www.healthyvocaltechnique.com/', 'vocal_health', 'Victoria Rapanan', 'course', 'beginner', '8 weeks', false, true, ARRAY['vocal training', 'breathing', 'vocal health']),
  
  ('Voice Care for Public Speakers', 'Essential tips for maintaining vocal health as a professional speaker. Learn about hydration, warm-ups, and recovery techniques.', 'https://speakerhub.com/skillcamp/how-maintain-healthy-voice-public-speaker', 'vocal_health', 'SpeakerHub', 'article', 'beginner', '15 min', true, true, ARRAY['vocal health', 'speaking tips', 'voice care']),
  
  ('12 Vocal Warm Ups For Speakers', 'Science-backed vocal exercises for meetings, speeches, and presentations. Prepare your voice for optimal performance.', 'https://www.scienceofpeople.com/vocal-warm-ups/', 'vocal_health', 'Science of People', 'article', 'beginner', '10 min', true, false, ARRAY['warm-ups', 'exercises', 'preparation']),
  
  -- Public Speaking (Vinh Giang & Others)
  ('Vinh Giang Communication Mastery', 'Learn from one of the world''s top communication coaches. Master the art of impactful speaking and audience engagement.', 'https://www.vinhgiang.com/', 'public_speaking', 'Vinh Giang', 'course', 'intermediate', '12 weeks', false, true, ARRAY['communication', 'charisma', 'presentation']),
  
  ('STAGE Academy by Vinh Giang', 'Comprehensive 7-module course with 120+ videos teaching the foundations that all great speakers master.', 'https://stageacademy.mykajabi.com/', 'public_speaking', 'Vinh Giang', 'course', 'intermediate', '11 hours', false, true, ARRAY['public speaking', 'presentation', 'confidence']),
  
  ('10 Tips for Improving Public Speaking', 'Harvard''s guide to becoming a better public speaker. Evidence-based techniques for effective communication.', 'https://professional.dce.harvard.edu/blog/10-tips-for-improving-your-public-speaking-skills/', 'public_speaking', 'Harvard DCE', 'article', 'beginner', '20 min', true, true, ARRAY['speaking tips', 'harvard', 'fundamentals']),
  
  -- Dale Carnegie & TED
  ('Talk Like TED Workshop', 'Learn the most engaging ways to open a speech and structure presentations that captivate audiences, taught by Dale Carnegie.', 'https://www.dalecarnegie.com/en/courses/3795', 'public_speaking', 'Dale Carnegie', 'workshop', 'intermediate', '2 hours', false, true, ARRAY['TED', 'presentation', 'storytelling']),
  
  ('Dale Carnegie Public Speaking Course', 'Develop leadership and communication skills through interactive training. Overcome fear and speak with confidence.', 'https://www.dalecarnegie.com/en/courses/201', 'public_speaking', 'Dale Carnegie', 'course', 'beginner', '8 weeks', false, false, ARRAY['confidence', 'leadership', 'communication']),
  
  ('TED-Ed Public Speaking 101', 'Learn from past TED speakers about what makes a talk meaningful. Free educational resources for developing speaking skills.', 'https://ed.ted.com/', 'public_speaking', 'TED-Ed', 'course', 'beginner', '4 weeks', true, true, ARRAY['TED', 'storytelling', 'ideas worth spreading']),
  
  -- Toastmasters
  ('Toastmasters International', 'Join the world''s largest organization dedicated to communication and leadership development. Practice in a supportive environment.', 'https://www.toastmasters.org/', 'public_speaking', 'Toastmasters International', 'course', 'beginner', 'Ongoing', false, true, ARRAY['practice', 'leadership', 'community']),
  
  ('Become a Performer to Enhance Speeches', 'Toastmasters guide to adopting a performance mindset. Transform from speaker to confident performer.', 'https://www.toastmasters.org/magazine/magazine-issues/2025/feb/become-a-performer-to-enhance-your-speeches', 'public_speaking', 'Toastmasters', 'article', 'intermediate', '15 min', true, false, ARRAY['performance', 'stage presence', 'confidence']),
  
  -- Debate Skills
  ('How Debate Enhances Critical Thinking', 'Comprehensive guide on using debate to develop critical thinking, analysis, and communication skills.', 'https://www.americandebateleague.org/how-debate-enhances-learning-critical-thinking.html', 'debate_skills', 'American Debate League', 'article', 'beginner', '20 min', true, true, ARRAY['critical thinking', 'argumentation', 'logic']),
  
  ('Oxford Summer Courses: Debating Skills', 'Learn advanced debating techniques from Oxford instructors. Develop argumentation and persuasion skills.', 'https://oxfordsummercourses.com/articles/how-to-improve-your-debating-skills', 'debate_skills', 'Oxford Summer Courses', 'article', 'advanced', '30 min', true, false, ARRAY['oxford', 'advanced', 'argumentation']),
  
  ('Using Debate to Build Critical Thinking', 'European Academy course on leveraging debate for developing analytical and communication skills.', 'https://academy.europa.eu/courses/using-debate-to-build-critical-thinking-and-communication-skills', 'debate_skills', 'European Academy', 'course', 'intermediate', '6 weeks', true, false, ARRAY['critical thinking', 'EU', 'analysis']),
  
  -- Body Language
  ('Amy Cuddy: Your Body Language Shapes Who You Are', 'Groundbreaking TED talk on how body language influences confidence and success. Learn about power poses and presence.', 'https://www.ted.com/talks/amy_cuddy_your_body_language_may_shape_who_you_are', 'body_language', 'TED', 'video', 'beginner', '21 min', true, true, ARRAY['power poses', 'confidence', 'body language']),
  
  ('Power Posing for Confidence', 'Practical guide to using expansive postures to boost confidence before high-stakes situations.', 'https://www.sevensundaysyoga.com/yoga/amy-cuddy-power-poses-to-create-confidence', 'body_language', 'Seven Sundays Yoga', 'article', 'beginner', '10 min', true, false, ARRAY['power poses', 'Amy Cuddy', 'confidence']),
  
  ('Vanessa Van Edwards: Body Language Secrets', 'Science-backed body language techniques from a leading communication expert. Learn to read and use nonverbal cues.', 'https://www.scienceofpeople.com/', 'body_language', 'Science of People', 'course', 'intermediate', '8 weeks', false, true, ARRAY['nonverbal', 'charisma', 'reading people']),
  
  -- Storytelling
  ('Storytelling for Persuasive Presentations', 'CIM training on communicating in stories, not catalogues. Make your presentations simpler and more persuasive.', 'https://www.cim.co.uk/learn-develop/training-development/training-courses/storytelling-for-persuasive-presentations/', 'storytelling', 'Chartered Institute of Marketing', 'workshop', 'intermediate', '1 day', false, true, ARRAY['persuasion', 'narrative', 'presentations']),
  
  ('IESE Persuasive Communication', 'Business school course exploring storytelling, credibility, emotional connections, and logical arguments.', 'https://www.coursera.org/learn/persuasive-communication-iese', 'storytelling', 'IESE Business School', 'course', 'advanced', '6 weeks', true, false, ARRAY['business', 'persuasion', 'storytelling']),
  
  ('MIT: Communicating Data Through Storytelling', 'Executive education on transforming complex data into compelling narratives that drive decision-making.', 'https://executive.mit.edu/course/communicating-data-through-storytelling/', 'storytelling', 'MIT Sloan', 'course', 'advanced', '2 days', false, true, ARRAY['data', 'MIT', 'business storytelling']),
  
  -- General Communication
  ('Coursera: Storytelling and Influencing', 'Learn to communicate with impact through storytelling techniques and influence strategies.', 'https://www.coursera.org/learn/communicate-with-impact', 'communication', 'Coursera', 'course', 'intermediate', '4 weeks', true, false, ARRAY['influence', 'impact', 'storytelling']),
  
  ('10 Best Public Speaking Groups 2025', 'Comprehensive guide to the top public speaking communities and practice groups for skill development.', 'https://bigmoneyspeaker.net/public-speaking-groups/', 'communication', 'Big Money Speaker', 'article', 'beginner', '15 min', true, false, ARRAY['community', 'practice', 'networking'])

ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_saved_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_resources
CREATE POLICY "Learning resources are viewable by everyone"
  ON learning_resources FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_saved_resources
CREATE POLICY "Users can view own saved resources"
  ON user_saved_resources FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save resources"
  ON user_saved_resources FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved resources"
  ON user_saved_resources FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved resources"
  ON user_saved_resources FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for resource_ratings
CREATE POLICY "Resource ratings are viewable by everyone"
  ON resource_ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can rate resources"
  ON resource_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON resource_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to update resource rating
CREATE OR REPLACE FUNCTION update_resource_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE learning_resources SET
    rating = (
      SELECT AVG(rating)::numeric(3,2)
      FROM resource_ratings
      WHERE resource_id = NEW.resource_id
    )
  WHERE id = NEW.resource_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_resource_rating_change ON resource_ratings;
CREATE TRIGGER on_resource_rating_change
  AFTER INSERT OR UPDATE ON resource_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_resource_rating();