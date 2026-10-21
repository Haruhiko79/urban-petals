-- ==============================================================================
-- Urban Petals — Staff Management Policies (write access)
-- Run once in the Supabase SQL Editor AFTER Supabase_admin_policies.sql.
-- Lets admin/super_admin staff members manage the store from the admin pages:
--   Orders   → change status (pending / in-transit / delivered / cancelled)
--   Products → add, edit, activate and deactivate products
--   Accounts → update roles, status, department and employee IDs
-- Safe to re-run, and super_admin cannot be demoted from the web UI by mistake.
-- ==============================================================================

-- Safety: recreate the staff-check helper in case it is missing.
CREATE OR REPLACE FUNCTION public.is_urban_petals_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = auth.uid()
      AND u.role IN ('super_admin', 'admin')
  );
$$;

-- 1) Orders: staff can change status (and correct payment references).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders'
      AND policyname = 'Staff can update orders'
  ) THEN
    CREATE POLICY "Staff can update orders"
      ON public.orders
      FOR UPDATE
      TO authenticated
      USING (public.is_urban_petals_staff())
      WITH CHECK (public.is_urban_petals_staff());
  END IF;
END $$;

-- 2) Products: staff can add new products and edit existing ones.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'products'
      AND policyname = 'Staff can add products'
  ) THEN
    CREATE POLICY "Staff can add products"
      ON public.products
      FOR INSERT
      TO authenticated
      WITH CHECK (public.is_urban_petals_staff());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'products'
      AND policyname = 'Staff can update products'
  ) THEN
    CREATE POLICY "Staff can update products"
      ON public.products
      FOR UPDATE
      TO authenticated
      USING (public.is_urban_petals_staff())
      WITH CHECK (public.is_urban_petals_staff());
  END IF;
END $$;

-- 3) Accounts: staff can manage other users (roles, status, department).
--    Self-updates are already neutralised by the protect_profile_privileged
--    trigger from Supabase_profile_policies.sql, so nobody can grant
--    themselves a higher role through the app.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users'
      AND policyname = 'Staff can update users'
  ) THEN
    CREATE POLICY "Staff can update users"
      ON public.users
      FOR UPDATE
      TO authenticated
      USING (public.is_urban_petals_staff())
      WITH CHECK (public.is_urban_petals_staff());
  END IF;
END $$;

-- 4) Sanity guard (optional but recommended): the last super_admin cannot be
--    demoted through the app, so the store never loses its owner.
CREATE OR REPLACE FUNCTION public.protect_last_super_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role = 'super_admin' AND NEW.role <> 'super_admin' THEN
    IF (SELECT COUNT(*) FROM public.users WHERE role = 'super_admin' AND id <> OLD.id) = 0 THEN
      RAISE EXCEPTION 'The store needs at least one super admin.';
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS guard_last_super_admin ON public.users;
CREATE TRIGGER guard_last_super_admin
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.protect_last_super_admin();

-- 5) Show the result for verification
SELECT tablename, policyname, cmd FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('users', 'orders', 'products')
ORDER BY tablename, policyname;
