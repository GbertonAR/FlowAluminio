-- ============================================================
-- FlowAluminio — RLS: Políticas para tablas maestras
-- Sprint 9 · 2026-06-07
-- Autor: KAI · Ejecutar en Supabase SQL Editor
-- Tablas afectadas: empresas, plantas, tipos_chatarra,
--   calidades_chatarra, productos, categorias_gasto,
--   empleados, condiciones_pago_empleado, precios_comerciales,
--   recetas_produccion
-- ============================================================

-- ─── EMPRESAS ────────────────────────────────────────────────────────────────
create policy "empresa_select" on empresas
  for select using (id = get_user_empresa_id());

create policy "empresa_update" on empresas
  for update using (
    id = get_user_empresa_id()
    and get_user_rol() in ('superadmin')
  );

-- ─── PLANTAS ─────────────────────────────────────────────────────────────────
create policy "planta_select" on plantas
  for select using (empresa_id = get_user_empresa_id());

create policy "planta_insert" on plantas
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('superadmin')
  );

create policy "planta_update" on plantas
  for update using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('superadmin')
  );

-- ─── TIPOS DE CHATARRA ───────────────────────────────────────────────────────
create policy "tipo_chatarra_select" on tipos_chatarra
  for select using (empresa_id = get_user_empresa_id());

create policy "tipo_chatarra_insert" on tipos_chatarra
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('superadmin')
  );

create policy "tipo_chatarra_update" on tipos_chatarra
  for update using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('superadmin')
  );

-- ─── CALIDADES DE CHATARRA ───────────────────────────────────────────────────
create policy "calidad_select" on calidades_chatarra
  for select using (empresa_id = get_user_empresa_id());

create policy "calidad_insert" on calidades_chatarra
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('superadmin')
  );

create policy "calidad_update" on calidades_chatarra
  for update using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('superadmin')
  );

-- ─── PRODUCTOS ───────────────────────────────────────────────────────────────
create policy "producto_select" on productos
  for select using (empresa_id = get_user_empresa_id());

create policy "producto_insert" on productos
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('superadmin')
  );

create policy "producto_update" on productos
  for update using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('superadmin')
  );

-- ─── CATEGORÍAS DE GASTO ────────────────────────────────────────────────────
create policy "categoria_gasto_select" on categorias_gasto
  for select using (empresa_id = get_user_empresa_id());

create policy "categoria_gasto_insert" on categorias_gasto
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('superadmin')
  );

create policy "categoria_gasto_update" on categorias_gasto
  for update using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('superadmin')
  );

-- ─── EMPLEADOS ───────────────────────────────────────────────────────────────
create policy "empleado_select" on empleados
  for select using (empresa_id = get_user_empresa_id());

create policy "empleado_insert" on empleados
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('operaciones', 'administracion', 'superadmin')
  );

create policy "empleado_update" on empleados
  for update using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'superadmin')
  );

-- ─── CONDICIONES DE PAGO EMPLEADO ────────────────────────────────────────────
create policy "condicion_pago_select" on condiciones_pago_empleado
  for select using (empresa_id = get_user_empresa_id());

create policy "condicion_pago_insert" on condiciones_pago_empleado
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'superadmin')
  );

-- ─── PRECIOS COMERCIALES ─────────────────────────────────────────────────────
create policy "precio_select" on precios_comerciales
  for select using (empresa_id = get_user_empresa_id());

create policy "precio_insert" on precios_comerciales
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('comercial', 'superadmin')
  );

create policy "precio_update" on precios_comerciales
  for update using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('comercial', 'superadmin')
  );

-- ─── RECETAS DE PRODUCCIÓN ───────────────────────────────────────────────────
create policy "receta_select" on recetas_produccion
  for select using (empresa_id = get_user_empresa_id());

create policy "receta_insert" on recetas_produccion
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('superadmin')
  );
