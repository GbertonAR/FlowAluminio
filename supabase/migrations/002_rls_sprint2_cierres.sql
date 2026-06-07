-- ============================================================
-- FlowAluminio — RLS Sprint 2 + Cierres de Período
-- Sprint 3 P2 · 2026-06-06
-- Autor: ARKO / CHARLES (generado bajo supervisión de KAI)
-- ============================================================

-- ─── TABLA: cierres_periodo ──────────────────────────────────────────────────

create table if not exists cierres_periodo (
  id              uuid primary key default uuid_generate_v4(),
  empresa_id      uuid not null references empresas(id),
  tipo            text not null check (tipo in ('semanal', 'mensual')),
  periodo_desde   date not null,
  periodo_hasta   date not null,
  estado          text not null default 'cerrado' check (estado in ('cerrado', 'anulado')),
  observacion     text,
  created_by      uuid references perfiles(id),
  created_at      timestamptz not null default now(),
  constraint ck_cierres_rango check (periodo_hasta >= periodo_desde),
  unique (empresa_id, tipo, periodo_desde)
);

create index if not exists idx_cierres_empresa_tipo on cierres_periodo(empresa_id, tipo, periodo_desde desc);

alter table cierres_periodo enable row level security;

-- ─── FUNCIÓN: verificar si una fecha está en un período cerrado ──────────────

create or replace function fecha_en_periodo_cerrado(
  p_empresa_id  uuid,
  p_fecha       date
)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from cierres_periodo
    where empresa_id  = p_empresa_id
      and estado      = 'cerrado'
      and p_fecha between periodo_desde and periodo_hasta
  )
$$;

-- ─── RLS: gastos ────────────────────────────────────────────────────────────

create policy "gasto_select" on gastos
  for select using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'comercial', 'superadmin')
  );

create policy "gasto_insert" on gastos
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'superadmin')
  );

create policy "gasto_update" on gastos
  for update using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'superadmin')
  );

-- ─── RLS: cobros ────────────────────────────────────────────────────────────

create policy "cobro_select" on cobros
  for select using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'comercial', 'superadmin')
  );

create policy "cobro_insert" on cobros
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'comercial', 'superadmin')
  );

create policy "cobro_update" on cobros
  for update using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'comercial', 'superadmin')
  );

-- ─── RLS: caja_chica ────────────────────────────────────────────────────────

create policy "caja_select" on caja_chica
  for select using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'comercial', 'superadmin')
  );

create policy "caja_insert" on caja_chica
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'superadmin')
  );

create policy "caja_update" on caja_chica
  for update using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'superadmin')
  );

-- ─── RLS: liquidaciones (SELECT ya existe — agregar INSERT/UPDATE) ───────────

-- Reemplazar la política existente para incluir administracion en SELECT
drop policy if exists "solo_comercial_ve_liquidaciones" on liquidaciones;

create policy "liquidacion_select" on liquidaciones
  for select using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'comercial', 'superadmin')
  );

create policy "liquidacion_insert" on liquidaciones
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'superadmin')
  );

create policy "liquidacion_update" on liquidaciones
  for update using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'superadmin')
  );

-- ─── RLS: mermas_consensuadas ────────────────────────────────────────────────

create policy "merma_select" on mermas_consensuadas
  for select using (empresa_id = get_user_empresa_id());

create policy "merma_insert" on mermas_consensuadas
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('comercial', 'superadmin')
  );

create policy "merma_update" on mermas_consensuadas
  for update using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('comercial', 'superadmin')
  );

-- ─── RLS: presentismo ───────────────────────────────────────────────────────

create policy "presentismo_select" on presentismo
  for select using (empresa_id = get_user_empresa_id());

create policy "presentismo_insert" on presentismo
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('operaciones', 'administracion', 'superadmin')
  );

create policy "presentismo_update" on presentismo
  for update using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('operaciones', 'administracion', 'superadmin')
  );

-- ─── RLS: comprobantes ──────────────────────────────────────────────────────

create policy "comprobante_select" on comprobantes
  for select using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'comercial', 'superadmin')
  );

create policy "comprobante_insert" on comprobantes
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'superadmin')
  );

-- ─── RLS: cierres_periodo ────────────────────────────────────────────────────

create policy "cierre_select" on cierres_periodo
  for select using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'comercial', 'superadmin')
  );

create policy "cierre_insert" on cierres_periodo
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'superadmin')
  );

create policy "cierre_update" on cierres_periodo
  for update using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('administracion', 'superadmin')
  );

-- ─── RLS: valorizaciones_despacho (agregar UPDATE) ───────────────────────────

create policy "valorizacion_update" on valorizaciones_despacho
  for update using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('comercial', 'superadmin')
  );

-- ─── RLS: auditoria_eventos (solo INSERT para todos los roles autenticados) ──

create policy "auditoria_insert" on auditoria_eventos
  for insert with check (
    empresa_id = get_user_empresa_id()
  );
