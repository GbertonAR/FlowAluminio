-- ============================================================
-- FlowAluminio — Usuarios de Prueba: GMarteletti
-- Sprint 9 · 2026-06-06
-- Autor: KAI · Ejecutar en Supabase SQL Editor (solo DEV)
-- Crea 3 usuarios con contraseña: Test1234!
--   operaciones@gmarteletti.test  → rol: operaciones
--   comercial@gmarteletti.test    → rol: comercial
--   admin@gmarteletti.test        → rol: administracion
-- ============================================================

DO $$
DECLARE
  v_empresa   uuid := '52414f04-e91b-49df-b5d3-f5127cd1905c';
  v_planta_id uuid;

  v_op_id     uuid := gen_random_uuid();
  v_com_id    uuid := gen_random_uuid();
  v_adm_id    uuid := gen_random_uuid();

BEGIN

  -- Planta de referencia
  SELECT id INTO v_planta_id
  FROM plantas WHERE empresa_id = v_empresa LIMIT 1;

  -- ─── AUTH USERS ──────────────────────────────────────────────────────────
  INSERT INTO auth.users (
    id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, aud, role,
    confirmation_token, recovery_token, email_change_token_new, email_change
  ) VALUES
  (
    v_op_id,
    'operaciones@gmarteletti.test',
    crypt('Test1234!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('nombre', 'Operario Test', 'rol', 'operaciones'),
    now(), now(), 'authenticated', 'authenticated',
    '', '', '', ''
  ),
  (
    v_com_id,
    'comercial@gmarteletti.test',
    crypt('Test1234!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('nombre', 'Comercial Test', 'rol', 'comercial'),
    now(), now(), 'authenticated', 'authenticated',
    '', '', '', ''
  ),
  (
    v_adm_id,
    'admin@gmarteletti.test',
    crypt('Test1234!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('nombre', 'Admin Test', 'rol', 'administracion'),
    now(), now(), 'authenticated', 'authenticated',
    '', '', '', ''
  );

  -- ─── AUTH IDENTITIES (necesario para login email/password) ───────────────
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES
  (
    gen_random_uuid(), v_op_id,
    'operaciones@gmarteletti.test',
    jsonb_build_object('sub', v_op_id::text, 'email', 'operaciones@gmarteletti.test'),
    'email', now(), now(), now()
  ),
  (
    gen_random_uuid(), v_com_id,
    'comercial@gmarteletti.test',
    jsonb_build_object('sub', v_com_id::text, 'email', 'comercial@gmarteletti.test'),
    'email', now(), now(), now()
  ),
  (
    gen_random_uuid(), v_adm_id,
    'admin@gmarteletti.test',
    jsonb_build_object('sub', v_adm_id::text, 'email', 'admin@gmarteletti.test'),
    'email', now(), now(), now()
  );

  -- ─── PERFILES ─────────────────────────────────────────────────────────────
  INSERT INTO perfiles (id, empresa_id, planta_id, rol, nombre, activo)
  VALUES
    (v_op_id,  v_empresa, v_planta_id, 'operaciones',    'Operario Test',  true),
    (v_com_id, v_empresa, v_planta_id, 'comercial',      'Comercial Test', true),
    (v_adm_id, v_empresa, v_planta_id, 'administracion', 'Admin Test',     true);

  RAISE NOTICE 'Usuarios test creados. op=% com=% adm=%', v_op_id, v_com_id, v_adm_id;

END $$;
