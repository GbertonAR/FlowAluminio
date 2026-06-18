-- ============================================================
-- FlowAluminio — estado en cobros + RLS básico para pagos
-- Sprint UAT · 2026-06-18
-- Autor: KAI (ARKO · CYRA)
-- Ejecutar en: Supabase SQL Editor
-- ============================================================

-- ─── cobros: columna estado para anulación suave ─────────────
-- anularRegistro() hace update({ estado: 'anulado' }) — requiere la columna

alter table cobros add column if not exists
  estado text not null default 'confirmado';

-- ─── RLS: pagos (sin políticas activas hasta ahora) ──────────

create policy "pago_select" on pagos
  for select using (empresa_id = get_user_empresa_id());

create policy "pago_insert" on pagos
  for insert with check (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('comercial', 'administracion', 'superadmin')
  );

create policy "pago_update" on pagos
  for update using (
    empresa_id = get_user_empresa_id()
    and get_user_rol() in ('comercial', 'superadmin')
  );
