-- ==============================================================================
-- Urban Petals — Admin (Staff) Read Policies
-- Run in Supabase SQL Editor after the admin account exists.
-- Adds SELECT access for staff roles (super_admin / admin) so the admin pages
-- (Dashboard / Orders / Products / Accounts) can list every row.
-- Safe to re-run: policies are created only if missing.
-- ==============================================================================

-- 1) Helper: is the signed-in user a staff member? SECURITY DEFINER so the
--    users-table lookup below does not recurse through the same RLS policies.
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

-- 2) Staff can list all users (Accounts page)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'users'
      AND policyname = 'Staff can view all users'
  ) THEN
    CREATE POLICY "Staff can view all users"
      ON public.users
      FOR SELECT
      TO authenticated
      USING (public.is_urban_petals_staff());
  END IF;
END $$;

-- 3) Staff can list all orders (Dashboard + Orders pages)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'orders'
      AND policyname = 'Staff can view all orders'
  ) THEN
    CREATE POLICY "Staff can view all orders"
      ON public.orders
      FOR SELECT
      TO authenticated
      USING (public.is_urban_petals_staff());
  END IF;
END $$;

-- 4) Staff can read order items (order details for the Orders page)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'order_items'
      AND policyname = 'Staff can view all order items'
  ) THEN
    CREATE POLICY "Staff can view all order items"
      ON public.order_items
      FOR SELECT
      TO authenticated
      USING (public.is_urban_petals_staff());
  END IF;
END $$;

-- 5) Verify: staff-relevant policies now present
SELECT tablename, policyname, cmd AS for_action
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'orders', 'order_items')
ORDER BY tablename, policyname;
