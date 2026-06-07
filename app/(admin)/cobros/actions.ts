/**
 * @system     FlowAluminio
 * @module     app/(admin)/cobros/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Cobros a clientes — registro y consulta
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cobroSchema } from '@/lib/validations/cobro'

export async function getCobros(mes?: string) {
  const supabase = await createClient()
  let q = supabase
    .from('cobros')
    .select('*, clientes(nombre)')
    .order('fecha', { ascending: false })
    .limit(50)

  if (mes) {
    q = q.gte('fecha', `${mes}-01`).lte('fecha', `${mes}-31`)
  }

  const { data, error } = await q
  if (error) return []
  return data
}

export async function getMaestrosCobro() {
  const supabase = await createClient()
  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre')

  return { clientes: clientes ?? [] }
}

export async function crearCobro(values: {
  fecha: string
  cliente_id: string
  importe: number
  medio_pago_id: string
  observacion?: string
}) {
  const parsed = cobroSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Sin sesión' }

  const { data: perfil } = await supabase.from('perfiles').select('empresa_id').eq('id', user.id).single()
  if (!perfil) return { success: false, error: 'Perfil no encontrado' }

  const { error } = await supabase.from('cobros').insert({
    empresa_id:    perfil.empresa_id,
    fecha:         parsed.data.fecha,
    cliente_id:    parsed.data.cliente_id,
    importe:       parsed.data.importe,
    medio_pago_id: parsed.data.medio_pago_id,
    observacion:   parsed.data.observacion || null,
    created_by:    user.id,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/cobros')
  return { success: true }
}
