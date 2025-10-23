/*
  # Payment and Subscription System

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `plan_type` (text: 'free' or 'premium')
      - `status` (text: 'active', 'cancelled', 'expired')
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `auto_renew` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `subscription_id` (uuid, references subscriptions)
      - `amount` (numeric)
      - `currency` (text)
      - `payment_method` (text)
      - `razorpay_order_id` (text)
      - `razorpay_payment_id` (text)
      - `razorpay_signature` (text)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `debate_sessions_tracking`
      - `id` (uuid, primary key) 
      - `user_id` (uuid, references auth.users)
      - `partner_id` (uuid, references auth.users, nullable)
      - `topic` (text)
      - `duration_seconds` (integer)
      - `session_date` (date)
      - `created_at` (timestamptz)
      - `ended_at` (timestamptz)

    - `user_feedback`
      - `id` (uuid, primary key)
      - `session_id` (uuid, references debate_sessions_tracking)
      - `user_id` (uuid, references auth.users)
      - `overall_score` (integer, 1-10)
      - `communication_score` (integer, 1-10)
      - `argument_quality_score` (integer, 1-10)
      - `listening_score` (integer, 1-10)
      - `feedback_text` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated users to manage their own data
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_type text NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'premium')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  auto_renew boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  amount numeric(10, 2) NOT NULL,
  currency text DEFAULT 'INR',
  payment_method text CHECK (payment_method IN ('razorpay', 'phonepe', 'googlepay', 'paytm', 'card', 'upi')),
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create debate_sessions_tracking table
CREATE TABLE IF NOT EXISTS debate_sessions_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  partner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  topic text NOT NULL,
  duration_seconds integer DEFAULT 0,
  session_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  ended_at timestamptz
);

-- Create user_feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES debate_sessions_tracking(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  overall_score integer CHECK (overall_score >= 1 AND overall_score <= 10),
  communication_score integer CHECK (communication_score >= 1 AND communication_score <= 10),
  argument_quality_score integer CHECK (argument_quality_score >= 1 AND argument_quality_score <= 10),
  listening_score integer CHECK (listening_score >= 1 AND listening_score <= 10),
  feedback_text text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_debate_sessions_tracking_user_id ON debate_sessions_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_debate_sessions_tracking_session_date ON debate_sessions_tracking(session_date);
CREATE INDEX IF NOT EXISTS idx_user_feedback_session_id ON user_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON user_feedback(user_id);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_sessions_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Debate sessions tracking policies
CREATE POLICY "Users can view own debate sessions"
  ON debate_sessions_tracking FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can insert own debate sessions"
  ON debate_sessions_tracking FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own debate sessions"
  ON debate_sessions_tracking FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User feedback policies
CREATE POLICY "Users can view own feedback"
  ON user_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON user_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to create default free subscription for new users
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan_type, status, start_date)
  VALUES (NEW.id, 'free', 'active', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create subscription when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();

-- Function to count daily debate sessions
CREATE OR REPLACE FUNCTION get_daily_session_count(p_user_id uuid, p_date date)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM debate_sessions_tracking
    WHERE user_id = p_user_id
    AND session_date = p_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is premium
CREATE OR REPLACE FUNCTION is_premium_user(p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM subscriptions
    WHERE user_id = p_user_id
    AND plan_type = 'premium'
    AND status = 'active'
    AND (end_date IS NULL OR end_date > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
