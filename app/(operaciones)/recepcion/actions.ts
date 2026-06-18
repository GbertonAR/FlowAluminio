/**
 * @system     FlowAluminio
 * @module     app/(operaciones)/recepcion/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Server Actions para recepción de chatarra — ledger físico + comercial
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { recepcionSchema, type RecepcionFormData } from '@/lib/validations/recepcion'
import { calcularKgReconocidos } from '@/lib/calculations/recepcion'
import { anularRegistro } from '@/lib/auditoria'
import type { ActionResult } from '@/types'

export async function crearRecepcion(
  data: RecepcionFormData
): Promise<ActionResult<{ id: string }>> {
  const parsed = recepcionSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('empresa_id, planta_id')
    .eq('id', user.id)
    .single()

  if (!perfil?.empresa_id) return { success: false, error: 'Perfil sin empresa asignada' }

  // Buscar merma vigente para este cliente + tipo chatarra
  const { data: mermaRow } = await supabase
    .from('mermas_consensuadas')
    .select('merma_pct')
    .eq('empresa_id', perfil.empresa_id)
    .eq('cliente_id', parsed.data.cliente_id)
    .eq('tipo_chatarra_id', parsed.data.tipo_chatarra_id)
    .lte('vigencia_desde', parsed.data.fecha)
    .or('vigencia_hasta.is.null,vigencia_hasta.gte.' + parsed.data.fecha)
    .eq('activo', true)
    .order('vigencia_desde', { ascending: false })
    .limit(1)
    .single()

  const mermaPct = mermaRow?.merma_pct ?? 0
  const { kgMermaComercial, kgReconocidos } = calcularKgReconocidos(
    parsed.data.kg_fisicos,
    mermaPct
  )

  const { data: recepcion, error } = await supabase
    .from('recepciones')
    .insert({
      empresa_id: perfil.empresa_id,
      planta_id: perfil.planta_id,
      fecha: parsed.data.fecha,
      cliente_id: parsed.data.cliente_id,
      proveedor_id: parsed.data.proveedor_id || null,
      tipo_chatarra_id: parsed.data.tipo_chatarra_id,
      calidad_id: parsed.data.calidad_id,
      kg_fisicos: parsed.data.kg_fisicos,
      merma_pct: mermaPct,
      kg_merma_comercial: kgMermaComercial,
      kg_reconocidos: kgReconocidos,
      remito: parsed.data.remito || null,
      observacion: parsed.data.observacion || null,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: `${error.message} [${error.code}]` }

  revalidatePath('/operaciones/recepcion')
  revalidatePath('/dashboard/operaciones')

  return { success: true, data: { id: recepcion.id } }
}

export async function getRecepciones(fecha?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  if (!perfil?.empresa_id) return []

  let query = supabase
    .from('recepciones')
    .select(`
      id, fecha, kg_fisicos, merma_pct, kg_reconocidos, remito, estado, created_at,
      clientes(nombre),
      tipos_chatarra(nombre),
      calidades_chatarra(nombre)
    `)
    .eq('empresa_id', perfil.empresa_id)
    .neq('estado', 'anulado')
    .order('fecha', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(50)

  if (fecha) query = query.eq('fecha', fecha)

  const { data } = await query
  return data ?? []
}

export async function getMaestrosRecepcion() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { clientes: [], proveedores: [], tiposChatarra: [], calidades: [] }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  if (!perfil?.empresa_id) return { clientes: [], proveedores: [], tiposChatarra: [], calidades: [] }

  const eid = perfil.empresa_id

  const [clientes, proveedores, tiposChatarra, calidades] = await Promise.all([
    supabase.from('clientes').select('id, nombre').eq('empresa_id', eid).eq('activo', true).order('nombre'),
    supabase.from('proveedores').select('id, nombre').eq('empresa_id', eid).eq('activo', true).order('nombre'),
    supabase.from('tipos_chatarra').select('id, nombre').eq('empresa_id', eid).eq('activo', true).order('nombre'),
    supabase.from('calidades_chatarra').select('id, nombre').eq('empresa_id', eid).eq('activo', true).order('orden'),
  ])

  return {
    clientes: clientes.data ?? [],
    proveedores: proveedores.data ?? [],
    tiposChatarra: tiposChatarra.data ?? [],
    calidades: calidades.data ?? [],
  }
}

export async function anularRecepcion(id: string, motivo: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: perfil } = await supabase.from('perfiles').select('empresa_id').eq('id', user.id).single()
  if (!perfil?.empresa_id) return { success: false, error: 'Perfil sin empresa' }

  const { data: registro } = await supabase.from('recepciones').select('*').eq('id', id).single()

  const { error } = await anularRegistro({
    supabase, empresaId: perfil.empresa_id, usuarioId: user.id,
    tabla: 'recepciones', registroId: id, motivo,
    valorAnterior: registro ?? undefined,
  })

  if (error) return { success: false, error }

  revalidatePath('/operaciones/recepcion')
  revalidatePath('/dashboard/operaciones')
  return { success: true }
}
