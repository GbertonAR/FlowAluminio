/**
 * @system     FlowAluminio
 * @module     app/(admin)/caja/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Caja chica: apertura, cierre y consulta
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { aperturaCajaSchema, cierreCajaSchema } from '@/lib/validations/caja'

export async function getCajas() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('caja_chica')
    .select('*')
    .order('fecha_apertura', { ascending: false })
    .limit(20)

  if (error) return []
  return data
}

export async function getCajaAbierta() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('caja_chica')
    .select('*')
    .eq('estado', 'abierta')
    .maybeSingle()

  return data
}

export async function abrirCaja(values: { fecha_apertura: string; monto_inicial: number }) {
  const parsed = aperturaCajaSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Sin sesión' }

  const { data: perfil } = await supabase.from('perfiles').select('empresa_id').eq('id', user.id).single()
  if (!perfil) return { success: false, error: 'Perfil no encontrado' }

  const yaAbierta = await getCajaAbierta()
  if (yaAbierta) return { success: false, error: 'Ya hay una caja abierta' }

  const { error } = await supabase.from('caja_chica').insert({
    empresa_id:    perfil.empresa_id,
    fecha_apertura: parsed.data.fecha_apertura,
    monto_inicial:  parsed.data.monto_inicial,
    created_by:     user.id,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/caja')
  return { success: true }
}

export async function cerrarCaja(cajaId: string, efectivo_devuelto: number) {
  const parsed = cierreCajaSchema.safeParse({ efectivo_devuelto })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Sin sesión' }

  const { data: caja } = await supabase.from('caja_chica').select('*').eq('id', cajaId).single()
  if (!caja) return { success: false, error: 'Caja no encontrada' }

  const diferencia = caja.monto_inicial - caja.total_gastado - parsed.data.efectivo_devuelto

  const { error } = await supabase.from('caja_chica').update({
    estado:            'cerrada',
    efectivo_devuelto: parsed.data.efectivo_devuelto,
    diferencia,
    cerrada_at:        new Date().toISOString(),
    cerrada_by:        user.id,
  }).eq('id', cajaId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/caja')
  return { success: true }
}
