-- ============================================================
-- FlowAluminio — Fix: perfil superadmin para gberton1967@gmail.com
-- Sprint 9 · 2026-06-06
-- Autor: KAI · Ejecutar en Supabase SQL Editor (DEV)
-- ============================================================

DO $$
DECLARE
  v_user_id   uuid;
  v_empresa   uuid := '52414f04-e91b-49df-b5d3-f5127cd1905c';
  v_planta_id uuid;
BEGIN
  -- Buscar UUID real del usuario superadmin
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'gberton1967@gmail.com';

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario gberton1967@gmail.com no encontrado en auth.users';
  END IF;

  -- Planta de referencia
  SELECT id INTO v_planta_id
  FROM plantas
  WHERE empresa_id = v_empresa
  LIMIT 1;

  -- Insertar o corregir el perfil superadmin
  INSERT INTO perfiles (id, empresa_id, planta_id, rol, nombre, activo)
  VALUES (v_user_id, v_empresa, v_planta_id, 'superadmin', 'Gustavo Berton', true)
  ON CONFLICT (id) DO UPDATE
    SET rol     = 'superadmin',
        nombre  = 'Gustavo Berton',
        activo  = true;

  RAISE NOTICE '✅ Perfil superadmin OK. UUID: %', v_user_id;
END $$;
