/**
 * @system     FlowAluminio
 * @module     app/(operaciones)/inventario/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Server Actions para inventario físico y conteos
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { conteoSchema, type ConteoFormData } from '@/lib/validations/conteo'
import type { ActionResult } from '@/types'

async function getEmpresaId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from('perfiles').select('empresa_id').eq('id', userId).single()
  return data?.empresa_id ?? null
}

export async function registrarConteo(
  data: ConteoFormData
): Promise<ActionResult<{ id: string }>> {
  const parsed = conteoSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const eid = await getEmpresaId(supabase, user.id)
  if (!eid) return { success: false, error: 'Sin empresa' }

  const d = parsed.data

  // kg_teorico: suma kg_reconocidos del cliente, opcionalmente filtrado por tipo_chatarra
  let recepcionesQuery = supabase
    .from('recepciones')
    .select('kg_reconocidos')
    .eq('empresa_id', eid)
    .eq('cliente_id', d.cliente_id)
    .neq('estado', 'anulado')
  if (d.tipo_chatarra_id) {
    recepcionesQuery = recepcionesQuery.eq('tipo_chatarra_id', d.tipo_chatarra_id)
  }

  const [{ data: recs }, { data: desps }] = await Promise.all([
    recepcionesQuery,
    supabase
      .from('despachos')
      .select('kg_despachados')
      .eq('empresa_id', eid)
      .eq('cliente_id', d.cliente_id)
      .neq('estado', 'anulado'),
  ])

  const kgTeoricoCalc =
    (recs ?? []).reduce((s, r) => s + (r.kg_reconocidos ?? 0), 0) -
    (desps ?? []).reduce((s, r) => s + (r.kg_despachados ?? 0), 0)

  const desvioPct = kgTeoricoCalc !== 0
    ? (d.kg_real - kgTeoricoCalc) / Math.abs(kgTeoricoCalc)
    : 0

  const { data: conteo, error } = await supabase
    .from('conteos_inventario')
    .insert({
      empresa_id:       eid,
      fecha:            d.fecha,
      cliente_id:       d.cliente_id,
      tipo_chatarra_id: d.tipo_chatarra_id || null,
      calidad_id:       d.calidad_id || null,
      kg_real:          d.kg_real,
      kg_teorico:       kgTeoricoCalc,
      desvio_kg:        d.kg_real - kgTeoricoCalc,
      desvio_pct:       desvioPct,
      observacion:      d.observacion || null,
      created_by:       user.id,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/operaciones/inventario')
  return { success: true, data: { id: conteo.id } }
}

export async function getInventarioTeorico() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const eid = await getEmpresaId(supabase, user.id)
  if (!eid) return []

  const [{ data: recs }, { data: desps }] = await Promise.all([
    supabase
      .from('recepciones')
      .select('cliente_id, tipo_chatarra_id, kg_reconocidos, clientes(nombre), tipos_chatarra(nombre)')
      .eq('empresa_id', eid)
      .neq('estado', 'anulado'),
    supabase
      .from('despachos')
      .select('cliente_id, kg_despachados')
      .eq('empresa_id', eid)
      .neq('estado', 'anulado'),
  ])

  // Agrupar recepciones por cliente + tipo
  const entradas = new Map<string, { clienteNombre: string; tipoNombre: string | null; kgRecibidos: number }>()
  for (const r of recs ?? []) {
    const key = `${r.cliente_id}::${r.tipo_chatarra_id ?? '__'}`
    const prev = entradas.get(key)
    entradas.set(key, {
      clienteNombre: (r.clientes as unknown as { nombre: string } | null)?.nombre ?? r.cliente_id,
      tipoNombre: (r.tipos_chatarra as unknown as { nombre: string } | null)?.nombre ?? null,
      kgRecibidos: (prev?.kgRecibidos ?? 0) + (r.kg_reconocidos ?? 0),
    })
  }

  // Agrupar despachos por cliente (sin tipo)
  const salidas = new Map<string, number>()
  for (const d of desps ?? []) {
    salidas.set(d.cliente_id, (salidas.get(d.cliente_id) ?? 0) + (d.kg_despachados ?? 0))
  }

  // Combinar: distribuir salidas proporcionalmente al stock de cada tipo del cliente
  // Para Sprint 1: mostrar stock por cliente (suma de tipos) menos despachos
  const porCliente = new Map<string, { clienteNombre: string; kgRecibidos: number; kgDespachados: number }>()
  for (const [key, val] of entradas) {
    const clienteId = key.split('::')[0]
    const prev = porCliente.get(clienteId)
    porCliente.set(clienteId, {
      clienteNombre: val.clienteNombre,
      kgRecibidos: (prev?.kgRecibidos ?? 0) + val.kgRecibidos,
      kgDespachados: salidas.get(clienteId) ?? 0,
    })
  }

  return Array.from(porCliente.entries()).map(([clienteId, v]) => ({
    clienteId,
    clienteNombre: v.clienteNombre,
    kgRecibidos: v.kgRecibidos,
    kgDespachados: v.kgDespachados,
    kgSaldo: v.kgRecibidos - v.kgDespachados,
  }))
}

export async function getMaestrosInventario() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { clientes: [], tiposChatarra: [], calidades: [] }

  const eid = await getEmpresaId(supabase, user.id)
  if (!eid) return { clientes: [], tiposChatarra: [], calidades: [] }

  const [clientes, tiposChatarra, calidades] = await Promise.all([
    supabase.from('clientes').select('id, nombre').eq('empresa_id', eid).eq('activo', true).order('nombre'),
    supabase.from('tipos_chatarra').select('id, nombre').eq('empresa_id', eid).eq('activo', true).order('nombre'),
    supabase.from('calidades_chatarra').select('id, nombre').eq('activo', true).order('nombre'),
  ])

  return {
    clientes: clientes.data ?? [],
    tiposChatarra: tiposChatarra.data ?? [],
    calidades: calidades.data ?? [],
  }
}
