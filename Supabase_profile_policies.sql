-- ==============================================================================
-- Urban Petals — Lasting Customer Profiles
-- Run once in the Supabase SQL Editor.
-- 1) Guarantees every new signup gets a public.users profile row (trigger).
-- 2) Lets customers see and update their OWN profile permanently
--    (name, phone, photo) — row-level security for the Account page.
-- 3) Backfills profile rows for any account created before this ran.
-- Safe to re-run.
-- ==============================================================================

-- 1) Auto-create a profile row whenever an auth user is created.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name, phone, role, status, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    'customer',
    'offline',
    now()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
      AND tgrelid = 'auth.users'::regclass
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- 3) Backfill: create a profile row for any auth user who has none.
INSERT INTO public.users (id, email, first_name, last_name, role, status, updated_at)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'first_name', ''),
  COALESCE(u.raw_user_meta_data->>'last_name', ''),
  'customer',
  'offline',
  now()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.users p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- 2) Row-level security so each customer can view and update their own profile.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Guard: a customer updating their own profile cannot touch role/status/employee
-- fields (prevents escalating to admin through the app's client key). Gives
-- each save a fresh updated_at timestamp. Staff/team edits (service role or
-- another user's row) pass through untouched.
CREATE OR REPLACE FUNCTION public.protect_profile_privileged()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT DISTINCT FROM NEW.id THEN
    NEW.role := OLD.role;
    NEW.status := OLD.status;
    NEW.department := OLD.department;
    NEW.employee_id := OLD.employee_id;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS protect_profile_update ON public.users;
CREATE TRIGGER protect_profile_update
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileged();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users'
      AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile"
      ON public.users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users'
      AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users'
      AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.users
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 4) Show current setup for verification
SELECT policyname, cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users';
