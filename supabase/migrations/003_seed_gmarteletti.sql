-- ============================================================
-- FlowAluminio — Seed Datos Maestros: GMarteletti
-- Sprint 6 · 2026-06-06
-- Autor: ARKO · Ejecutar en Supabase SQL Editor
-- empresa_id: 52414f04-e91b-49df-b5d3-f5127cd1905c
-- ============================================================

DO $$
DECLARE
  v_empresa   uuid := '52414f04-e91b-49df-b5d3-f5127cd1905c';
  v_admin_id  uuid := 'ab99ade6-3b62-4f7e-8426-d05a0eb351d0';

  -- plantas
  v_planta    uuid;

  -- tipos chatarra
  v_tc_prensa  uuid;
  v_tc_offset  uuid;
  v_tc_comun   uuid;
  v_tc_perfil  uuid;
  v_tc_nueva   uuid;
  v_tc_viruta  uuid;

  -- calidades
  v_cal_1ra    uuid;
  v_cal_2da    uuid;

  -- productos
  v_prod_tocho   uuid;
  v_prod_lingote uuid;

  -- clientes
  v_cli_metalsan  uuid;
  v_cli_perfsur   uuid;
  v_cli_recicbona uuid;
  v_cli_indnorte  uuid;

  -- empleados
  v_emp_gonzalez  uuid;
  v_emp_rodriguez uuid;
  v_emp_perez     uuid;
  v_emp_martinez  uuid;
  v_emp_lopez     uuid;

  -- categorías
  v_cat_comb uuid;
  v_cat_mant uuid;
  v_cat_serv uuid;
  v_cat_insu uuid;
  v_cat_otro uuid;

BEGIN

  -- ─── PLANTA ──────────────────────────────────────────────────────────────
  INSERT INTO plantas (empresa_id, nombre)
  VALUES (v_empresa, 'Planta Central')
  RETURNING id INTO v_planta;

  -- Actualizar perfil admin con planta
  UPDATE perfiles SET planta_id = v_planta WHERE id = v_admin_id;

  -- ─── TIPOS DE CHATARRA ────────────────────────────────────────────────────
  INSERT INTO tipos_chatarra (empresa_id, nombre) VALUES (v_empresa, 'Prensa')  RETURNING id INTO v_tc_prensa;
  INSERT INTO tipos_chatarra (empresa_id, nombre) VALUES (v_empresa, 'Offset')  RETURNING id INTO v_tc_offset;
  INSERT INTO tipos_chatarra (empresa_id, nombre) VALUES (v_empresa, 'Común')   RETURNING id INTO v_tc_comun;
  INSERT INTO tipos_chatarra (empresa_id, nombre) VALUES (v_empresa, 'Perfil')  RETURNING id INTO v_tc_perfil;
  INSERT INTO tipos_chatarra (empresa_id, nombre) VALUES (v_empresa, 'Nueva')   RETURNING id INTO v_tc_nueva;
  INSERT INTO tipos_chatarra (empresa_id, nombre) VALUES (v_empresa, 'Viruta')  RETURNING id INTO v_tc_viruta;

  -- ─── CALIDADES DE CHATARRA ────────────────────────────────────────────────
  INSERT INTO calidades_chatarra (empresa_id, nombre, orden) VALUES (v_empresa, 'Primera', 1) RETURNING id INTO v_cal_1ra;
  INSERT INTO calidades_chatarra (empresa_id, nombre, orden) VALUES (v_empresa, 'Segunda', 2) RETURNING id INTO v_cal_2da;

  -- ─── PRODUCTOS ────────────────────────────────────────────────────────────
  INSERT INTO productos (empresa_id, nombre) VALUES (v_empresa, 'Tocho 6063')  RETURNING id INTO v_prod_tocho;
  INSERT INTO productos (empresa_id, nombre) VALUES (v_empresa, 'Lingote')     RETURNING id INTO v_prod_lingote;

  -- ─── CATEGORÍAS DE GASTO ─────────────────────────────────────────────────
  INSERT INTO categorias_gasto (empresa_id, nombre) VALUES (v_empresa, 'Combustible')    RETURNING id INTO v_cat_comb;
  INSERT INTO categorias_gasto (empresa_id, nombre) VALUES (v_empresa, 'Mantenimiento')  RETURNING id INTO v_cat_mant;
  INSERT INTO categorias_gasto (empresa_id, nombre) VALUES (v_empresa, 'Servicios')      RETURNING id INTO v_cat_serv;
  INSERT INTO categorias_gasto (empresa_id, nombre) VALUES (v_empresa, 'Insumos')        RETURNING id INTO v_cat_insu;
  INSERT INTO categorias_gasto (empresa_id, nombre) VALUES (v_empresa, 'Otros')          RETURNING id INTO v_cat_otro;

  -- ─── CLIENTES ─────────────────────────────────────────────────────────────
  -- tipo: 'proveedor_cliente' = envía chatarra Y recibe material
  --        'cliente'          = solo recibe material terminado
  INSERT INTO clientes (empresa_id, nombre, tipo)
    VALUES (v_empresa, 'Metalúrgica Sánchez',     'proveedor_cliente') RETURNING id INTO v_cli_metalsan;
  INSERT INTO clientes (empresa_id, nombre, tipo)
    VALUES (v_empresa, 'Perfiles del Sur',         'cliente')          RETURNING id INTO v_cli_perfsur;
  INSERT INTO clientes (empresa_id, nombre, tipo)
    VALUES (v_empresa, 'Reciclados Bonaerense',    'proveedor_cliente') RETURNING id INTO v_cli_recicbona;
  INSERT INTO clientes (empresa_id, nombre, tipo)
    VALUES (v_empresa, 'Industrias del Norte',     'cliente')          RETURNING id INTO v_cli_indnorte;

  -- ─── EMPLEADOS ───────────────────────────────────────────────────────────
  INSERT INTO empleados (empresa_id, nombre) VALUES (v_empresa, 'Juan González')    RETURNING id INTO v_emp_gonzalez;
  INSERT INTO empleados (empresa_id, nombre) VALUES (v_empresa, 'Carlos Rodríguez') RETURNING id INTO v_emp_rodriguez;
  INSERT INTO empleados (empresa_id, nombre) VALUES (v_empresa, 'Miguel Pérez')     RETURNING id INTO v_emp_perez;
  INSERT INTO empleados (empresa_id, nombre) VALUES (v_empresa, 'Ana Martínez')     RETURNING id INTO v_emp_martinez;
  INSERT INTO empleados (empresa_id, nombre) VALUES (v_empresa, 'Pedro López')      RETURNING id INTO v_emp_lopez;

  -- ─── CONDICIONES DE PAGO EMPLEADOS ───────────────────────────────────────
  -- Modalidades: mensual | semanal | diario | por_kilo | por_colada | mixto
  -- Valores en ARS (referenciales — ajustar con cliente)
  INSERT INTO condiciones_pago_empleado
    (empresa_id, empleado_id, modalidad, valor, viatico, premio_presentismo, vigencia_desde)
  VALUES
    (v_empresa, v_emp_gonzalez,  'mensual',    420000, 10000, 30000, current_date),
    (v_empresa, v_emp_rodriguez, 'mensual',    390000, 10000, 30000, current_date),
    (v_empresa, v_emp_perez,     'mensual',    350000,  8000, 25000, current_date),
    (v_empresa, v_emp_martinez,  'mensual',    450000,     0, 30000, current_date),
    (v_empresa, v_emp_lopez,     'por_colada', 15000,   8000, 20000, current_date);

  -- ─── RECETA DE PRODUCCIÓN VIGENTE ────────────────────────────────────────
  -- 30% chatarra 1ra + 70% chatarra 2da (mezcla estándar de fundición)
  INSERT INTO recetas_produccion (empresa_id, mix_1ra_pct, mix_2da_pct, vigencia_desde)
  VALUES (v_empresa, 0.30, 0.70, current_date);

  -- ─── MERMAS CONSENSUADAS BASE ────────────────────────────────────────────
  -- merma_pct: porcentaje que se descuenta del peso físico para reconocer kg
  -- Valores típicos sector aluminio Argentina: 3-8%
  INSERT INTO mermas_consensuadas
    (empresa_id, cliente_id, tipo_chatarra_id, merma_pct, vigencia_desde, observacion)
  VALUES
    (v_empresa, v_cli_metalsan,  v_tc_prensa, 0.04, current_date, 'Prensa seleccionada'),
    (v_empresa, v_cli_metalsan,  v_tc_comun,  0.07, current_date, 'Chatarra común mixta'),
    (v_empresa, v_cli_metalsan,  v_tc_perfil, 0.03, current_date, 'Perfil extrusionado limpio'),
    (v_empresa, v_cli_recicbona, v_tc_prensa, 0.05, current_date, 'Acuerdo comercial estándar'),
    (v_empresa, v_cli_recicbona, v_tc_comun,  0.08, current_date, 'Mezcla con impurezas'),
    (v_empresa, v_cli_recicbona, v_tc_viruta, 0.12, current_date, 'Viruta con aceite de corte');

  -- ─── MERMA GENÉRICA (sin tipo específico) ────────────────────────────────
  -- Para clientes sin acuerdo específico por tipo de chatarra
  INSERT INTO mermas_consensuadas
    (empresa_id, cliente_id, tipo_chatarra_id, merma_pct, vigencia_desde, observacion)
  VALUES
    (v_empresa, v_cli_perfsur,  null, 0.05, current_date, 'Acuerdo general'),
    (v_empresa, v_cli_indnorte, null, 0.05, current_date, 'Acuerdo general');

  -- ─── PRECIOS COMERCIALES ─────────────────────────────────────────────────
  -- tipo_operacion: 'fason' = solo se cobra el trabajo (el cliente pone la chatarra)
  --                 'pleno' = GMarteletti compra la chatarra y vende el tocho
  --                 'mixto' = combinación
  -- Valores en ARS/kg (referenciales — actualizar con el cliente)
  INSERT INTO precios_comerciales
    (empresa_id, cliente_id, tipo_operacion, precio, vigencia_desde)
  VALUES
    (v_empresa, v_cli_metalsan,  'fason',  850,  current_date),
    (v_empresa, v_cli_metalsan,  'pleno',  2200, current_date),
    (v_empresa, v_cli_recicbona, 'fason',  800,  current_date),
    (v_empresa, v_cli_recicbona, 'pleno',  2100, current_date),
    (v_empresa, v_cli_perfsur,   'fason',  900,  current_date),
    (v_empresa, v_cli_indnorte,  'pleno',  2300, current_date);

  RAISE NOTICE 'Seed GMarteletti completado. Planta ID: %', v_planta;

END $$;
