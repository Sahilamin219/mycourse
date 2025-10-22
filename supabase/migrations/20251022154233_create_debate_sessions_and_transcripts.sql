/*
  # Create Debate Sessions and Transcripts Schema

  1. New Tables
    - `debate_sessions`
      - `id` (uuid, primary key) - Unique session identifier
      - `user_id` (uuid) - User who participated
      - `partner_id` (text, nullable) - Anonymous partner identifier
      - `topic` (text) - Debate topic
      - `started_at` (timestamptz) - When debate started
      - `ended_at` (timestamptz, nullable) - When debate ended
      - `duration_seconds` (integer, nullable) - Total debate duration
      - `created_at` (timestamptz) - Record creation time

    - `debate_transcripts`
      - `id` (uuid, primary key) - Unique transcript entry identifier
      - `session_id` (uuid, foreign key) - References debate_sessions
      - `speaker` (text) - 'user' or 'partner'
      - `text` (text) - Transcribed text
      - `timestamp` (timestamptz) - When this was spoken
      - `created_at` (timestamptz) - Record creation time

    - `debate_analysis`
      - `id` (uuid, primary key) - Unique analysis identifier
      - `session_id` (uuid, foreign key) - References debate_sessions
      - `user_id` (uuid) - User this analysis is for
      - `overall_score` (integer) - Score out of 100
      - `communication_score` (integer) - Communication skills score
      - `argumentation_score` (integer) - Argumentation quality score
      - `clarity_score` (integer) - Clarity and coherence score
      - `strengths` (text[]) - Array of identified strengths
      - `weaknesses` (text[]) - Array of areas for improvement
      - `key_insights` (text) - Overall insights and feedback
      - `created_at` (timestamptz) - When analysis was generated

  2. Security
    - Enable RLS on all tables
    - Users can only read their own debate sessions
    - Users can only read transcripts from their sessions
    - Users can only read their own analysis
*/

-- Create debate_sessions table
CREATE TABLE IF NOT EXISTS debate_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id text,
  topic text NOT NULL,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  duration_seconds integer,
  created_at timestamptz DEFAULT now()
);

-- Create debate_transcripts table
CREATE TABLE IF NOT EXISTS debate_transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES debate_sessions(id) ON DELETE CASCADE NOT NULL,
  speaker text NOT NULL CHECK (speaker IN ('user', 'partner')),
  text text NOT NULL,
  timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create debate_analysis table
CREATE TABLE IF NOT EXISTS debate_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES debate_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  overall_score integer CHECK (overall_score >= 0 AND overall_score <= 100),
  communication_score integer CHECK (communication_score >= 0 AND communication_score <= 100),
  argumentation_score integer CHECK (argumentation_score >= 0 AND argumentation_score <= 100),
  clarity_score integer CHECK (clarity_score >= 0 AND clarity_score <= 100),
  strengths text[],
  weaknesses text[],
  key_insights text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE debate_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_analysis ENABLE ROW LEVEL SECURITY;

-- RLS Policies for debate_sessions
CREATE POLICY "Users can view own debate sessions"
  ON debate_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own debate sessions"
  ON debate_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debate sessions"
  ON debate_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for debate_transcripts
CREATE POLICY "Users can view transcripts from their sessions"
  ON debate_transcripts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM debate_sessions
      WHERE debate_sessions.id = debate_transcripts.session_id
      AND debate_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert transcripts to their sessions"
  ON debate_transcripts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM debate_sessions
      WHERE debate_sessions.id = debate_transcripts.session_id
      AND debate_sessions.user_id = auth.uid()
    )
  );

-- RLS Policies for debate_analysis
CREATE POLICY "Users can view own analysis"
  ON debate_analysis FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis"
  ON debate_analysis FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_debate_sessions_user_id ON debate_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_debate_transcripts_session_id ON debate_transcripts(session_id);
CREATE INDEX IF NOT EXISTS idx_debate_analysis_session_id ON debate_analysis(session_id);
CREATE INDEX IF NOT EXISTS idx_debate_analysis_user_id ON debate_analysis(user_id);
