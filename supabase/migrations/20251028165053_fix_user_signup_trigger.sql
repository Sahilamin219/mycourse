/*
  # Fix User Signup Trigger

  1. Changes
    - Update the create_default_subscription function to handle errors gracefully
    - Add better error handling and logging
    - Ensure the function has proper permissions

  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS for system operations
*/

-- Drop and recreate the function with better error handling
CREATE OR REPLACE FUNCTION create_default_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default subscription with error handling
  INSERT INTO public.subscriptions (user_id, plan_type, status, start_date)
  VALUES (NEW.id, 'free', 'active', now())
  ON CONFLICT DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create default subscription for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger is properly set up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_subscription();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.subscriptions TO postgres, service_role;
GRANT INSERT ON public.subscriptions TO authenticated;