/**
 * @system     FlowAluminio
 * @module     app/(comercial)/conciliaciones/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Conciliaciones periódicas por cliente — crear, ver detalle y cerrar
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

export async function getConciliaciones() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('conciliaciones_cliente')
    .select('*, clientes(nombre), perfiles!cerrada_by(nombre)')
    .order('created_at', { ascending: false })
    .limit(50)
  return data ?? []
}

export async function getClientesActivos() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('clientes')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre')
  return data ?? []
}

export async function crearConciliacion(
  clienteId: string,
  periodoDesde: string,
  periodoHasta: string
): Promise<ActionResult<string>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  if (!perfil) return { success: false, error: 'Perfil no encontrado' }

  // Verificar que no exista conciliación solapada para el mismo cliente
  const { data: solapada } = await supabase
    .from('conciliaciones_cliente')
    .select('id')
    .eq('empresa_id', perfil.empresa_id)
    .eq('cliente_id', clienteId)
    .neq('estado', 'anulada')
    .lte('periodo_desde', periodoHasta)
    .gte('periodo_hasta', periodoDesde)
    .limit(1)

  if (solapada && solapada.length > 0) {
    return { success: false, error: 'Ya existe una conciliación que se superpone con ese período para este cliente' }
  }

  const { data, error } = await supabase
    .from('conciliaciones_cliente')
    .insert({
      empresa_id:    perfil.empresa_id,
      cliente_id:    clienteId,
      periodo_desde: periodoDesde,
      periodo_hasta: periodoHasta,
      estado:        'borrador',
      created_by:    user.id,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/comercial/conciliaciones')
  return { success: true, data: data.id }
}

export interface DetalleConciliacion {
  conciliacion: {
    id: string
    cliente_id: string
    clienteNombre: string
    periodo_desde: string
    periodo_hasta: string
    estado: string
    observacion: string | null
  }
  recepciones: {
    id: string
    fecha: string
    kg_fisicos: number
    kg_reconocidos: number
    remito: string | null
    estado: string
  }[]
  despachos: {
    id: string
    fecha: string
    kg_despachados: number
    remito: string | null
    importe: number
    estado: string
  }[]
  cobros: {
    id: string
    fecha: string
    importe: number
    medio_pago_id: string | null
  }[]
  resumen: {
    kgFisico: number
    kgReconocido: number
    kgDespachado: number
    saldoKg: number
    importeFacturado: number
    importeCobrado: number
    saldoFinanciero: number
  }
}

export async function getConciliacionDetalle(id: string): Promise<DetalleConciliacion | null> {
  const supabase = await createClient()

  const { data: conc } = await supabase
    .from('conciliaciones_cliente')
    .select('*, clientes(nombre)')
    .eq('id', id)
    .single()

  if (!conc) return null

  const desde = conc.periodo_desde as string
  const hasta = conc.periodo_hasta as string
  const cid   = conc.cliente_id as string

  const [
    { data: recepciones },
    { data: despachos },
    { data: cobros },
  ] = await Promise.all([
    supabase
      .from('recepciones')
      .select('id, fecha, kg_fisicos, kg_reconocidos, remito, estado')
      .eq('cliente_id', cid)
      .gte('fecha', desde)
      .lte('fecha', hasta)
      .order('fecha'),
    supabase
      .from('despachos')
      .select('id, fecha, kg_despachados, remito, estado, valorizaciones_despacho(importe)')
      .eq('cliente_id', cid)
      .gte('fecha', desde)
      .lte('fecha', hasta)
      .order('fecha'),
    supabase
      .from('cobros')
      .select('id, fecha, importe, medio_pago_id')
      .eq('cliente_id', cid)
      .gte('fecha', desde)
      .lte('fecha', hasta)
      .order('fecha'),
  ])

  const recepcionesActivas = (recepciones ?? []).filter((r) => r.estado !== 'anulado')
  const despachosActivos   = (despachos   ?? []).filter((d) => d.estado !== 'anulado')

  const despachosConImporte = despachosActivos.map((d) => ({
    ...d,
    importe: ((d.valorizaciones_despacho as unknown as { importe: number }[] | null) ?? [])
      .reduce((s, v) => s + (v.importe ?? 0), 0),
  }))

  const kgFisico         = recepcionesActivas.reduce((s, r) => s + (r.kg_fisicos    ?? 0), 0)
  const kgReconocido     = recepcionesActivas.reduce((s, r) => s + (r.kg_reconocidos ?? 0), 0)
  const kgDespachado     = despachosConImporte.reduce((s, d) => s + (d.kg_despachados ?? 0), 0)
  const importeFacturado = despachosConImporte.reduce((s, d) => s + d.importe, 0)
  const importeCobrado   = (cobros ?? []).reduce((s, c) => s + (c.importe ?? 0), 0)

  return {
    conciliacion: {
      id:            conc.id,
      cliente_id:    cid,
      clienteNombre: (conc.clientes as unknown as { nombre: string } | null)?.nombre ?? '—',
      periodo_desde: desde,
      periodo_hasta: hasta,
      estado:        conc.estado as string,
      observacion:   conc.observacion as string | null,
    },
    recepciones: recepcionesActivas.map((r) => ({
      id:             r.id,
      fecha:          r.fecha as string,
      kg_fisicos:     r.kg_fisicos    ?? 0,
      kg_reconocidos: r.kg_reconocidos ?? 0,
      remito:         r.remito as string | null,
      estado:         r.estado as string,
    })),
    despachos: despachosConImporte.map((d) => ({
      id:             d.id,
      fecha:          d.fecha as string,
      kg_despachados: d.kg_despachados ?? 0,
      remito:         d.remito as string | null,
      importe:        d.importe,
      estado:         d.estado as string,
    })),
    cobros: (cobros ?? []).map((c) => ({
      id:           c.id,
      fecha:        c.fecha as string,
      importe:      c.importe ?? 0,
      medio_pago_id: c.medio_pago_id as string | null,
    })),
    resumen: {
      kgFisico,
      kgReconocido,
      kgDespachado,
      saldoKg:          kgReconocido - kgDespachado,
      importeFacturado,
      importeCobrado,
      saldoFinanciero:  importeFacturado - importeCobrado,
    },
  }
}

export async function cerrarConciliacion(id: string, observacion?: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { error } = await supabase
    .from('conciliaciones_cliente')
    .update({
      estado:      'cerrada',
      observacion: observacion || null,
      cerrada_at:  new Date().toISOString(),
      cerrada_by:  user.id,
    })
    .eq('id', id)
    .not('estado', 'in', '("cerrada","anulada")')

  if (error) return { success: false, error: error.message }

  revalidatePath('/comercial/conciliaciones')
  revalidatePath(`/comercial/conciliaciones/${id}`)
  return { success: true }
}

export async function observarConciliacion(id: string, motivo: string): Promise<ActionResult> {
  if (!motivo.trim()) return { success: false, error: 'El motivo es requerido' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('conciliaciones_cliente')
    .update({ estado: 'observada', observacion: motivo })
    .eq('id', id)
    .not('estado', 'in', '("cerrada","anulada")')

  if (error) return { success: false, error: error.message }

  revalidatePath('/comercial/conciliaciones')
  revalidatePath(`/comercial/conciliaciones/${id}`)
  return { success: true }
}

export async function registrarAjuste(
  conciliacionId: string,
  tipo: 'fisico' | 'comercial',
  kgAjuste: number,
  motivo: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: perfil } = await supabase.from('perfiles').select('empresa_id').eq('id', user.id).single()
  if (!perfil?.empresa_id) return { success: false, error: 'Perfil sin empresa' }

  const { error } = await supabase.from('ajustes_conciliacion').insert({
    empresa_id:     perfil.empresa_id,
    conciliacion_id: conciliacionId,
    tipo,
    kg_ajuste:      kgAjuste,
    motivo,
    created_by:     user.id,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath(`/comercial/conciliaciones/${conciliacionId}`)
  return { success: true }
}

export async function getAjustesConciliacion(conciliacionId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ajustes_conciliacion')
    .select('id, tipo, kg_ajuste, motivo, created_at')
    .eq('conciliacion_id', conciliacionId)
    .order('created_at')
  // Devuelve [] si la tabla no existe aún (migration 008 pendiente)
  if (error) return []
  return data ?? []
}
