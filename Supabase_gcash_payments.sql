-- ==============================================================================
-- Urban Petals — Real GCash payments via PayMongo
-- Run once in the Supabase SQL Editor (safe to re-run).
-- Adds payment tracking columns to public.orders:
--   payment_status      'gcash-pending' | 'paid' | 'failed' | 'unpaid'
--                       ('unpaid' = Cash on Delivery or pre-this-script orders)
--   paymongo_source_id  PayMongo source id created at checkout
--   paymongo_payment_id PayMongo payment id confirmed by webhook
-- Customers can never flip payment_status from the app client — only the
-- PayMongo webhook Edge Function (service role / SECURITY DEFINER) can.
-- ==============================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS paymongo_source_id TEXT,
  ADD COLUMN IF NOT EXISTS paymongo_payment_id TEXT;

CREATE INDEX IF NOT EXISTS orders_paymongo_source_idx
  ON public.orders (paymongo_source_id)
  WHERE paymongo_source_id IS NOT NULL;

-- Stamp historical Manual-GCash rows for readability (does not touch money state).
UPDATE public.orders
SET payment_status = 'unpaid'
WHERE payment_method = 'Cash on Delivery' AND payment_status = 'unpaid';

-- Backfill: any GCash-order made before this script keeps 'unpaid' (manual QR flow).
-- Code comment: keep as-is; the store still verifies those manually.

-- Guard: customers must not be able to mark their own orders as paid through
-- the client API. This trigger stops any direct client update that changes
-- payment_status but does not come from the service role.
CREATE OR REPLACE FUNCTION public.prevent_client_payment_flip()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.payment_status IS DISTINCT FROM OLD.payment_status
     AND current_setting('request.jwt.claim.sub', true) IS NOT NULL
     AND auth.role() = 'authenticated' THEN
    RAISE EXCEPTION 'Payment status can only be changed by the payment provider webhook.';
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS guard_payment_status ON public.orders;
CREATE TRIGGER guard_payment_status
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.prevent_client_payment_flip();

-- Show the resulting shape for verification
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'orders'
  AND column_name IN ('payment_status', 'paymongo_source_id', 'paymongo_payment_id');
