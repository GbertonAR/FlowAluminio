-- ============================================================
-- FlowAluminio — estado en pagos + tabla ajustes_conciliacion
-- Sprint MVP Fase 1 Completo · 2026-06-18
-- Autor: KAI (ARKO · CYRA)
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- ─── pagos: columna estado ───────────────────────────────────

alter table pagos add column if not exists
  estado text not null default 'confirmado';

-- ─── ajustes_conciliacion ────────────────────────────────────
-- Registra ajustes dentro de una conciliación sin modificar el histórico
-- PRD §8.14: "Los movimientos originales no se editan. Se crea un ajuste nuevo."

create table if not exists ajustes_conciliacion (
  id                uuid primary key default uuid_generate_v4(),
  empresa_id        uuid not null references empresas(id),
  conciliacion_id   uuid not null references conciliaciones_cliente(id),
  tipo              text not null check (tipo in ('fisico', 'comercial')),
  kg_ajuste         numeric(12,2) not null,
  motivo            text not null,
  created_by        uuid references perfiles(id),
  created_at        timestamptz not null default now()
);

alter table ajustes_conciliacion enable row level security;

create policy "ajuste_conciliacion_select" on ajustes_conciliacion
  for select using (empresa_id = get_user_empresa_id());

create policy "ajuste_conciliacion_insert" on ajustes_conciliacion
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('comercial', 'superadmin')
  );
