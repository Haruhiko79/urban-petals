-- ==============================================================================
-- Urban Petals — GCash Payment Reference
-- Run once in the Supabase SQL Editor.
-- Stores the GCash reference number the customer submits as proof of payment.
-- The store team confirms it before moving the order out of "pending".
-- Safe to re-run: the column is only added when missing.
-- ==============================================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_reference text;

COMMENT ON COLUMN public.orders.payment_reference IS
  'GCash reference number submitted by the customer (blank for cash on delivery).';

-- The update below is optional: it keeps the column clean for cash orders.
-- UPDATE public.orders
--   SET payment_reference = NULL
--   WHERE payment_method NOT ILIKE 'gcash';
