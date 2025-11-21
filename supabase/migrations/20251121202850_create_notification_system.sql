/*
  # Create Notification System

  1. New Tables
    - `notification_preferences`
      - `user_id` (uuid, foreign key to auth.users)
      - `email_enabled` (boolean) - Whether user wants to receive emails
      - `email_frequency` (text) - 'weekly', 'biweekly', 'monthly'
      - `last_email_sent` (timestamptz) - Track when last email was sent
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `notification_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `type` (text) - 'email' or 'whatsapp'
      - `template` (text) - 'weekly_digest', 'promotional', etc.
      - `subject` (text) - Email subject line
      - `status` (text) - 'sent', 'failed', 'bounced'
      - `error_message` (text) - Error details if failed
      - `sent_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can read and update their own notification preferences
    - Users can read their own notification logs
    - Only service role can insert notification logs

  3. Notes
    - Notification preferences are auto-created for new users via trigger
    - Default: email enabled, weekly frequency
    - Logs help track delivery issues and user engagement
*/

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled boolean DEFAULT true,
  email_frequency text DEFAULT 'weekly' CHECK (email_frequency IN ('weekly', 'biweekly', 'monthly', 'never')),
  last_email_sent timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create notification_logs table
CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('email', 'whatsapp')),
  template text NOT NULL,
  subject text,
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'bounced', 'pending')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Policies for notification_preferences
CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can insert notification preferences"
  ON notification_preferences FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policies for notification_logs
CREATE POLICY "Users can view own notification logs"
  ON notification_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert notification logs"
  ON notification_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update notification logs"
  ON notification_logs FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to auto-create notification preferences for new users
CREATE OR REPLACE FUNCTION create_notification_preferences_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id, email_enabled, email_frequency)
  VALUES (NEW.id, true, 'weekly')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create notification preferences
DROP TRIGGER IF EXISTS on_auth_user_created_notification_prefs ON auth.users;
CREATE TRIGGER on_auth_user_created_notification_prefs
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_preferences_for_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_last_email_sent ON notification_preferences(last_email_sent);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
