/*
  # Setup Weekly Email Cron Job

  1. Description
    - Creates a cron job to send weekly digest emails every Monday at 10:00 AM UTC
    - Calls the send-weekly-digest edge function automatically
    - Requires pg_cron extension (already enabled in Supabase)

  2. Schedule
    - Runs every Monday at 10:00 AM UTC
    - Cron syntax: '0 10 * * 1' (minute hour day month day_of_week)
    
  3. Notes
    - The edge function will handle user filtering and email sending
    - Logs are stored in notification_logs table
    - Users can manage preferences via notification_preferences table
    - Cron job configuration needs to be done via Supabase Dashboard
*/

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a table to store cron job configuration
CREATE TABLE IF NOT EXISTS cron_job_config (
  id serial PRIMARY KEY,
  job_name text UNIQUE NOT NULL,
  schedule text NOT NULL,
  endpoint text NOT NULL,
  enabled boolean DEFAULT true,
  last_run timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert cron job configuration
INSERT INTO cron_job_config (job_name, schedule, endpoint)
VALUES (
  'send-weekly-digest-emails',
  '0 10 * * 1',
  '/functions/v1/send-weekly-digest'
)
ON CONFLICT (job_name) DO UPDATE
SET schedule = EXCLUDED.schedule,
    endpoint = EXCLUDED.endpoint,
    updated_at = now();

-- Note: The actual cron job needs to be configured in Supabase Dashboard:
-- 1. Go to Database > Cron Jobs
-- 2. Create a new cron job with schedule: 0 10 * * 1
-- 3. SQL command:
--    SELECT net.http_post(
--      url := 'https://YOUR_PROJECT.supabase.co/functions/v1/send-weekly-digest',
--      headers := '{"Content-Type": "application/json"}'::jsonb
--    );
