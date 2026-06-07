/**
 * @system     FlowAluminio
 * @module     app/(superadmin)/auditoria/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Consulta de eventos de auditoría y estadísticas del sistema para superadmin
 */
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getEventosAuditoria(filters?: {
  tabla?:   string
  accion?:  string
  desde?:   string
  hasta?:   string
  limite?:  number
}) {
  const supabase = await createClient()

  let q = supabase
    .from('auditoria_eventos')
    .select('*, perfiles(nombre)')
    .order('created_at', { ascending: false })
    .limit(filters?.limite ?? 100)

  if (filters?.tabla)  q = q.eq('tabla',  filters.tabla)
  if (filters?.accion) q = q.eq('accion', filters.accion)
  if (filters?.desde)  q = q.gte('created_at', filters.desde)
  if (filters?.hasta)  q = q.lte('created_at', filters.hasta + 'T23:59:59Z')

  const { data, error } = await q
  if (error) return []
  return data
}

export async function getEstadisticasSistema() {
  const supabase = await createClient()

  const hoy = new Date().toISOString().split('T')[0]

  const [
    { count: totalUsuarios },
    { count: eventosHoy },
    { count: anulacionesMes },
    { data: tablasMasActivas },
  ] = await Promise.all([
    supabase.from('perfiles').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('auditoria_eventos').select('*', { count: 'exact', head: true }).gte('created_at', hoy),
    supabase.from('auditoria_eventos').select('*', { count: 'exact', head: true })
      .eq('accion', 'ANULACION')
      .gte('created_at', hoy.slice(0, 7) + '-01'),
    supabase.from('auditoria_eventos').select('tabla').gte('created_at', hoy.slice(0, 7) + '-01'),
  ])

  const conteoTablas = (tablasMasActivas ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.tabla] = (acc[e.tabla] ?? 0) + 1
    return acc
  }, {})

  const tablaTop = Object.entries(conteoTablas)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tabla, count]) => ({ tabla, count }))

  return {
    totalUsuarios:   totalUsuarios ?? 0,
    eventosHoy:      eventosHoy ?? 0,
    anulacionesMes:  anulacionesMes ?? 0,
    tablaTop,
  }
}
