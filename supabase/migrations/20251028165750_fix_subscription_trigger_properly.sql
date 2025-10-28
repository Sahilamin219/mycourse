/*
  # Fix Subscription Trigger Properly

  1. Changes
    - Add unique constraint on user_id to prevent duplicate subscriptions
    - Simplify trigger function to remove ON CONFLICT clause
    - Add proper error handling that won't block user creation

  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Maintains all existing RLS policies
*/

-- Add unique constraint to prevent duplicate subscriptions per user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscriptions_user_id_key'
  ) THEN
    ALTER TABLE public.subscriptions 
    ADD CONSTRAINT subscriptions_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Recreate function with simpler logic
CREATE OR REPLACE FUNCTION public.create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if subscription doesn't exist for this user
  IF NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = NEW.id) THEN
    INSERT INTO public.subscriptions (user_id, plan_type, status, start_date)
    VALUES (NEW.id, 'free', 'active', now());
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Catch all errors and allow user creation to proceed
    RAISE WARNING 'Could not create subscription for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_subscription();