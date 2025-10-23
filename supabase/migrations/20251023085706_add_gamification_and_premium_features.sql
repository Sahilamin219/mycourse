/*
  # Gamification and Premium Features

  1. New Tables
    - `user_profiles` - Extended user profiles with stats
    - `achievements` - Achievement definitions
    - `user_achievements` - User's unlocked achievements
    - `debate_recordings` - Video recordings of debates
    - `skill_assessments` - AI-powered skill assessments
    - `learning_paths` - Personalized learning journeys
    - `debate_challenges` - Daily challenges and quests
    - `leaderboard_entries` - Global and category rankings
    - `user_connections` - Follow/friend system
    - `debate_notes` - Notes and highlights from debates

  2. Features
    - XP and leveling system
    - Achievement badges
    - Skill ratings (communication, logic, persuasion)
    - Debate streaks and consistency rewards
    - Video replay system
    - AI feedback and insights
    - Social networking
    - Personalized improvement plans
*/

-- User Profiles with Stats
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name text,
  avatar_url text,
  bio text,
  total_xp integer DEFAULT 0,
  level integer DEFAULT 1,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  total_debates integer DEFAULT 0,
  total_wins integer DEFAULT 0,
  win_rate numeric(5,2) DEFAULT 0.00,
  communication_rating numeric(3,2) DEFAULT 0.00,
  logic_rating numeric(3,2) DEFAULT 0.00,
  persuasion_rating numeric(3,2) DEFAULT 0.00,
  favorite_topics text[] DEFAULT '{}',
  last_debate_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Achievements System
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  xp_reward integer DEFAULT 0,
  tier text DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  category text DEFAULT 'general' CHECK (category IN ('general', 'skill', 'social', 'consistency', 'mastery')),
  is_premium_only boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Debate Recordings
CREATE TABLE IF NOT EXISTS debate_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES debate_sessions_tracking(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  video_url text,
  thumbnail_url text,
  duration_seconds integer DEFAULT 0,
  transcript text,
  ai_summary text,
  key_moments jsonb DEFAULT '[]',
  views integer DEFAULT 0,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- AI Skill Assessments
CREATE TABLE IF NOT EXISTS skill_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES debate_sessions_tracking(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  overall_score integer CHECK (overall_score >= 1 AND overall_score <= 100),
  communication_score integer CHECK (communication_score >= 1 AND communication_score <= 100),
  logic_score integer CHECK (logic_score >= 1 AND logic_score <= 100),
  persuasion_score integer CHECK (persuasion_score >= 1 AND persuasion_score <= 100),
  body_language_score integer CHECK (body_language_score >= 1 AND body_language_score <= 100),
  speaking_pace_score integer CHECK (speaking_pace_score >= 1 AND speaking_pace_score <= 100),
  strengths text[],
  weaknesses text[],
  improvement_tips text[],
  detailed_feedback text,
  ai_insights jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Learning Paths
CREATE TABLE IF NOT EXISTS learning_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  current_module integer DEFAULT 1,
  total_modules integer DEFAULT 10,
  progress_percentage integer DEFAULT 0,
  target_skills text[] DEFAULT '{}',
  estimated_completion_days integer DEFAULT 30,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  modules jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Daily Challenges
CREATE TABLE IF NOT EXISTS debate_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_type text NOT NULL,
  title text NOT NULL,
  description text,
  target_value integer DEFAULT 1,
  current_value integer DEFAULT 0,
  xp_reward integer DEFAULT 100,
  challenge_date date DEFAULT CURRENT_DATE,
  is_completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_date, challenge_type)
);

-- Leaderboard
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category text NOT NULL CHECK (category IN ('global', 'weekly', 'monthly', 'topic_specific')),
  topic text,
  rank integer NOT NULL,
  score integer NOT NULL,
  period_start date,
  period_end date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Social Connections
CREATE TABLE IF NOT EXISTS user_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'following' CHECK (status IN ('following', 'blocked')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Debate Notes
CREATE TABLE IF NOT EXISTS debate_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES debate_sessions_tracking(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  note_text text NOT NULL,
  timestamp_seconds integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON user_profiles(level DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_xp ON user_profiles(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_debate_recordings_user_id ON debate_recordings(user_id);
CREATE INDEX IF NOT EXISTS idx_debate_recordings_session_id ON debate_recordings(session_id);
CREATE INDEX IF NOT EXISTS idx_skill_assessments_user_id ON skill_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_debate_challenges_user_date ON debate_challenges(user_id, challenge_date);
CREATE INDEX IF NOT EXISTS idx_leaderboard_category_rank ON leaderboard_entries(category, rank);
CREATE INDEX IF NOT EXISTS idx_user_connections_follower ON user_connections(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_connections_following ON user_connections(following_id);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view any public profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public recordings"
  ON debate_recordings FOR SELECT
  TO authenticated
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage own recordings"
  ON debate_recordings FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own assessments"
  ON skill_assessments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own learning paths"
  ON learning_paths FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own challenges"
  ON debate_challenges FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own connections"
  ON user_connections FOR ALL
  TO authenticated
  USING (auth.uid() = follower_id)
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can view connections"
  ON user_connections FOR SELECT
  TO authenticated
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can manage own notes"
  ON debate_notes FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to create default profile
CREATE OR REPLACE FUNCTION create_default_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.email, 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for profile creation
DROP TRIGGER IF EXISTS on_user_profile_created ON auth.users;
CREATE TRIGGER on_user_profile_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_profile();

-- Insert default achievements
INSERT INTO achievements (code, title, description, icon, xp_reward, tier, category) VALUES
('first_debate', 'First Debate', 'Complete your first debate', '🎤', 100, 'bronze', 'general'),
('debate_master_10', 'Rising Star', 'Complete 10 debates', '⭐', 500, 'silver', 'consistency'),
('debate_master_50', 'Debate Veteran', 'Complete 50 debates', '🏆', 2000, 'gold', 'consistency'),
('debate_master_100', 'Debate Legend', 'Complete 100 debates', '👑', 5000, 'platinum', 'consistency'),
('streak_7', 'Week Warrior', 'Maintain a 7-day streak', '🔥', 300, 'silver', 'consistency'),
('streak_30', 'Monthly Master', 'Maintain a 30-day streak', '💫', 1500, 'gold', 'consistency'),
('perfect_score', 'Flawless Victory', 'Score 100% in a debate', '💯', 1000, 'gold', 'skill'),
('topic_expert', 'Topic Expert', 'Win 10 debates in same topic', '🎓', 800, 'gold', 'mastery'),
('social_butterfly', 'Social Butterfly', 'Connect with 25 debaters', '🦋', 400, 'silver', 'social'),
('teacher', 'Teacher', 'Help 10 beginners improve', '👨‍🏫', 600, 'gold', 'social'),
('quick_thinker', 'Quick Thinker', 'Win a debate in under 5 minutes', '⚡', 500, 'silver', 'skill'),
('persuasion_master', 'Master Persuader', 'Score 90+ in persuasion 5 times', '🎯', 1200, 'platinum', 'mastery')
ON CONFLICT (code) DO NOTHING;
