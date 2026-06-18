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
    { data: usuariosData },
  ] = await Promise.all([
    supabase.from('perfiles').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('auditoria_eventos').select('*', { count: 'exact', head: true }).gte('created_at', hoy),
    supabase.from('auditoria_eventos').select('*', { count: 'exact', head: true })
      .eq('accion', 'ANULACION')
      .gte('created_at', hoy.slice(0, 7) + '-01'),
    supabase.from('auditoria_eventos').select('tabla').gte('created_at', hoy.slice(0, 7) + '-01'),
    supabase.from('perfiles').select('rol').eq('activo', true),
  ])

  const conteoTablas = (tablasMasActivas ?? []).reduce<Record<string, number>>((acc, e) => {
    acc[e.tabla] = (acc[e.tabla] ?? 0) + 1
    return acc
  }, {})

  const tablaTop = Object.entries(conteoTablas)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tabla, count]) => ({ tabla, count }))

  const usuariosPorRol = (usuariosData ?? []).reduce<Record<string, number>>((acc, p) => {
    acc[p.rol] = (acc[p.rol] ?? 0) + 1
    return acc
  }, {})

  return {
    totalUsuarios:   totalUsuarios ?? 0,
    eventosHoy:      eventosHoy ?? 0,
    anulacionesMes:  anulacionesMes ?? 0,
    tablaTop,
    usuariosPorRol,
  }
}

const TABLAS_SENSIBLES = [
  'mermas_consensuadas', 'precios_comerciales', 'liquidaciones',
  'caja_chica', 'conciliaciones_cliente', 'recepciones',
]

export async function getCambiosSensibles() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('auditoria_eventos')
    .select('id, accion, tabla, motivo, created_at, perfiles(nombre)')
    .in('tabla', TABLAS_SENSIBLES)
    .in('accion', ['MODIFICACION', 'ANULACION', 'CIERRE', 'APROBACION'])
    .order('created_at', { ascending: false })
    .limit(6)
  return data ?? []
}

export async function getAlertasSistema() {
  const supabase = await createClient()
  const [
    { count: comprobantesPendientes },
    { count: cajaObservada },
    { count: conciliacionesPendientes },
  ] = await Promise.all([
    supabase.from('comprobantes').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
    supabase.from('caja_chica').select('*', { count: 'exact', head: true }).eq('estado', 'observada'),
    supabase.from('conciliaciones_cliente').select('*', { count: 'exact', head: true })
      .in('estado', ['observada', 'en_revision']),
  ])
  return {
    comprobantesPendientes: comprobantesPendientes ?? 0,
    cajaObservada:          cajaObservada ?? 0,
    conciliacionesPendientes: conciliacionesPendientes ?? 0,
  }
}
