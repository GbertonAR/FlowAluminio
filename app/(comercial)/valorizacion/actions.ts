/**
 * @system     FlowAluminio
 * @module     app/(comercial)/valorizacion/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Valorización de despachos: fasón / pleno / mixto
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { valorizacionSchema } from '@/lib/validations/valorizacion'

export async function getDespachosPendientes(mes: string) {
  const supabase = await createClient()
  const desde = `${mes}-01`
  const hasta = `${mes}-31`

  const { data, error } = await supabase
    .from('despachos')
    .select('*, clientes(nombre), productos(nombre)')
    .eq('estado', 'confirmado')
    .gte('fecha', desde)
    .lte('fecha', hasta)
    .order('fecha', { ascending: false })

  if (error) return []

  const ids = (data ?? []).map((d) => d.id)
  const { data: vals } = await supabase
    .from('valorizaciones_despacho')
    .select('despacho_id')
    .in('despacho_id', ids)

  const valorizados = new Set((vals ?? []).map((v) => v.despacho_id))

  return (data ?? []).map((d) => ({
    ...d,
    valorizado: valorizados.has(d.id),
  }))
}

export async function getDespachoConValorizacion(despachoId: string) {
  const supabase = await createClient()

  const [{ data: despacho }, { data: valorizacion }] = await Promise.all([
    supabase.from('despachos').select('*, clientes(nombre), productos(nombre)').eq('id', despachoId).single(),
    supabase.from('valorizaciones_despacho').select('*').eq('despacho_id', despachoId).maybeSingle(),
  ])

  return { despacho, valorizacion }
}

export async function crearValorizacion(values: {
  despacho_id: string
  tipo_operacion: 'fason' | 'pleno' | 'mixto'
  precio: number
  condicion_comercial?: string
  observacion?: string
}) {
  const parsed = valorizacionSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Sin sesión' }

  const { data: perfil } = await supabase.from('perfiles').select('empresa_id').eq('id', user.id).single()
  if (!perfil) return { success: false, error: 'Perfil no encontrado' }

  const { data: despacho } = await supabase
    .from('despachos')
    .select('kg_despachados')
    .eq('id', parsed.data.despacho_id)
    .single()

  if (!despacho) return { success: false, error: 'Despacho no encontrado' }

  const importe = parsed.data.precio * despacho.kg_despachados

  const { error } = await supabase.from('valorizaciones_despacho').insert({
    empresa_id:          perfil.empresa_id,
    despacho_id:         parsed.data.despacho_id,
    tipo_operacion:      parsed.data.tipo_operacion,
    precio:              parsed.data.precio,
    importe,
    condicion_comercial: parsed.data.condicion_comercial || null,
    observacion:         parsed.data.observacion || null,
    created_by:          user.id,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/comercial/despachos')
  return { success: true }
}
