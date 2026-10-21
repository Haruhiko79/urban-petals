-- ==============================================================================
-- Urban Petals — Admin Account Provisioner
-- Run in Supabase SQL Editor (Dashboard -> SQL Editor).
-- Creates a fully confirmed admin auth user + matching public.users profile.
-- Customize the email / password / names below before running.
-- ==============================================================================

-- 0) Clear any previous/pending user with the same email (makes script re-runnable)
DELETE FROM auth.identities
WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'admin@urbanpetals.ph');

DELETE FROM auth.users WHERE email = 'admin@urbanpetals.ph';

DELETE FROM public.users
WHERE email = 'admin@urbanpetals.ph';

-- 1) Create the confirmed auth user (can sign in immediately, no email click)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@urbanpetals.ph',
    crypt('UrbanPetals#2026', gen_salt('bf', 10)),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Urban Petals Admin"}'::jsonb,
    now(),
    now(),
    '',
    ''
  );

-- 2) Create the matching identity row (required for password sign-in)
INSERT INTO auth.identities (
  provider_id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  jsonb_build_object(
    'sub', u.id::text,
    'email', u.email,
    'email_verified', true,
    'name', u.raw_user_meta_data ->> 'name'
  ),
  'email',
  now(),
  now(),
  now()
FROM auth.users u
WHERE u.email = 'admin@urbanpetals.ph'
  AND NOT EXISTS (SELECT 1 FROM auth.identities i WHERE i.user_id = u.id AND i.provider = 'email');

-- 3) Create the public.users profile row (what the admin pages read)
INSERT INTO public.users (
  id,
  email,
  first_name,
  last_name,
  phone,
  avatar,
  role,
  department,
  employee_id,
  status,
  created_at,
  updated_at
)
SELECT
  u.id,
  u.email,
  'Urban Petals',
  'Admin',
  '',
  '',
  'super_admin',
  'Management',
  'UPE-001',
  'online',
  now(),
  now()
FROM auth.users u
WHERE u.email = 'admin@urbanpetals.ph'
  AND NOT EXISTS (SELECT 1 FROM public.users p WHERE p.id = u.id);

-- 3b) The handle_new_user trigger auto-creates profile rows with
-- (role='customer', status='offline', NULL department/employee_id),
-- so enforce the admin values with an update as well.
UPDATE public.users
SET role        = 'super_admin',
    department  = 'Management',
    employee_id = 'UPE-001',
    status      = 'online',
    first_name  = 'Urban Petals',
    last_name   = 'Admin'
WHERE email = 'admin@urbanpetals.ph';

-- 4) Show the result for verification
SELECT id, email, role, department, employee_id, status FROM public.users ORDER BY email;
