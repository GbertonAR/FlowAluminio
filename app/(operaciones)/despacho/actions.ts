/**
 * @system     FlowAluminio
 * @module     app/(operaciones)/despacho/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Server Actions para despacho físico de producto
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { despachoSchema, type DespachoFormData } from '@/lib/validations/despacho'
import { anularRegistro } from '@/lib/auditoria'
import type { ActionResult } from '@/types'

export async function crearDespacho(
  data: DespachoFormData
): Promise<ActionResult<{ id: string }>> {
  const parsed = despachoSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: perfil } = await supabase
    .from('perfiles').select('empresa_id').eq('id', user.id).single()

  if (!perfil?.empresa_id) return { success: false, error: 'Sin empresa' }

  const d = parsed.data
  const { data: despacho, error } = await supabase
    .from('despachos')
    .insert({
      empresa_id:     perfil.empresa_id,
      fecha:          d.fecha,
      cliente_id:     d.cliente_id,
      kg_despachados: d.kg_despachados,
      producto_id:    d.producto_id || null,
      remito:         d.remito || null,
      observacion:    d.observacion || null,
      created_by:     user.id,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/operaciones/despacho')
  return { success: true, data: { id: despacho.id } }
}

export async function getDespachosDelDia(fecha: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: perfil } = await supabase
    .from('perfiles').select('empresa_id').eq('id', user.id).single()

  if (!perfil?.empresa_id) return []

  const { data } = await supabase
    .from('despachos')
    .select('id, kg_despachados, remito, clientes(nombre), productos(nombre)')
    .eq('empresa_id', perfil.empresa_id)
    .eq('fecha', fecha)
    .neq('estado', 'anulado')
    .order('created_at')

  return data ?? []
}

export async function getMaestrosDespacho() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { clientes: [], productos: [] }

  const { data: perfil } = await supabase
    .from('perfiles').select('empresa_id').eq('id', user.id).single()

  if (!perfil?.empresa_id) return { clientes: [], productos: [] }

  const eid = perfil.empresa_id
  const [clientes, productos] = await Promise.all([
    supabase.from('clientes').select('id, nombre').eq('empresa_id', eid).eq('activo', true).order('nombre'),
    supabase.from('productos').select('id, nombre').eq('empresa_id', eid).eq('activo', true).order('nombre'),
  ])

  return {
    clientes: clientes.data ?? [],
    productos: productos.data ?? [],
  }
}

export async function anularDespacho(id: string, motivo: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: perfil } = await supabase.from('perfiles').select('empresa_id').eq('id', user.id).single()
  if (!perfil?.empresa_id) return { success: false, error: 'Perfil sin empresa' }

  const { data: registro } = await supabase.from('despachos').select('*').eq('id', id).single()

  const { error } = await anularRegistro({
    supabase, empresaId: perfil.empresa_id, usuarioId: user.id,
    tabla: 'despachos', registroId: id, motivo,
    valorAnterior: registro ?? undefined,
  })

  if (error) return { success: false, error }

  revalidatePath('/operaciones/despacho')
  revalidatePath('/comercial/despachos')
  revalidatePath('/dashboard/operaciones')
  return { success: true }
}
