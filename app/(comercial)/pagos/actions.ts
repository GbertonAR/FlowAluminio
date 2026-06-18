/**
 * @system     FlowAluminio
 * @module     app/(comercial)/pagos/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    Pagos de chatarra a proveedores — CRUD + anulación auditada (PRD §8.19)
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { pagoSchema } from '@/lib/validations/pago'
import { anularRegistro } from '@/lib/auditoria'
import type { ActionResult } from '@/types'

export async function getPagos(mes?: string) {
  const supabase = await createClient()
  let q = supabase
    .from('pagos')
    .select('id, fecha, importe, medio_pago_id, observacion, estado, proveedores(nombre), clientes(nombre)')
    .neq('estado', 'anulado')
    .order('fecha', { ascending: false })
    .limit(50)

  if (mes) q = q.gte('fecha', `${mes}-01`).lte('fecha', `${mes}-31`)

  const { data, error } = await q
  if (error) return []
  return data
}

export async function getMaestrosPago() {
  const supabase = await createClient()
  const { data: proveedores } = await supabase
    .from('proveedores')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre')

  return { proveedores: proveedores ?? [] }
}

export async function crearPago(values: {
  fecha: string
  proveedor_id: string
  importe: number
  medio_pago_id: string
  observacion?: string
}): Promise<ActionResult> {
  const parsed = pagoSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Sin sesión' }

  const { data: perfil } = await supabase.from('perfiles').select('empresa_id').eq('id', user.id).single()
  if (!perfil) return { success: false, error: 'Perfil no encontrado' }

  const { error } = await supabase.from('pagos').insert({
    empresa_id:    perfil.empresa_id,
    fecha:         parsed.data.fecha,
    proveedor_id:  parsed.data.proveedor_id,
    importe:       parsed.data.importe,
    medio_pago_id: parsed.data.medio_pago_id,
    observacion:   parsed.data.observacion || null,
    created_by:    user.id,
    estado:        'confirmado',
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/comercial/pagos')
  return { success: true }
}

export async function getPagoById(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('pagos')
    .select('id, fecha, proveedor_id, importe, medio_pago_id, observacion')
    .eq('id', id)
    .single()
  return data
}

export async function actualizarPago(id: string, values: {
  fecha: string; proveedor_id: string; importe: number; medio_pago_id: string; observacion?: string
}): Promise<ActionResult> {
  const parsed = pagoSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Sin sesión' }

  const { error } = await supabase.from('pagos').update({
    fecha:         parsed.data.fecha,
    proveedor_id:  parsed.data.proveedor_id,
    importe:       parsed.data.importe,
    medio_pago_id: parsed.data.medio_pago_id,
    observacion:   parsed.data.observacion || null,
    updated_at:    new Date().toISOString(),
  }).eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/comercial/pagos')
  return { success: true }
}

export async function anularPago(id: string, motivo: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: perfil } = await supabase.from('perfiles').select('empresa_id').eq('id', user.id).single()
  if (!perfil?.empresa_id) return { success: false, error: 'Perfil sin empresa' }

  const { data: registro } = await supabase.from('pagos').select('*').eq('id', id).single()

  const { error } = await anularRegistro({
    supabase, empresaId: perfil.empresa_id, usuarioId: user.id,
    tabla: 'pagos', registroId: id, motivo,
    valorAnterior: registro ?? undefined,
  })

  if (error) return { success: false, error }

  revalidatePath('/comercial/pagos')
  revalidatePath('/dashboard/comercial')
  return { success: true }
}
