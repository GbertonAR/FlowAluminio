/**
 * @system     FlowAluminio
 * @module     app/(admin)/comprobantes/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    Gestión documental de comprobantes — validar, observar, rechazar (PRD §8.17, §4.3)
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getComprobantes(filtros?: { estado?: string }) {
  const supabase = await createClient()
  let q = supabase
    .from('comprobantes')
    .select('id, tipo, entidad_tipo, entidad_id, estado, observacion, storage_path, created_at, perfiles!uploaded_by(nombre)')
    .order('created_at', { ascending: false })
    .limit(80)

  if (filtros?.estado) q = q.eq('estado', filtros.estado)

  const { data, error } = await q
  if (error) return []
  return data
}

export async function contarComprobantes() {
  const supabase = await createClient()
  const [{ count: pendientes }, { count: observados }] = await Promise.all([
    supabase.from('comprobantes').select('*', { count: 'exact', head: true }).eq('estado', 'pendiente'),
    supabase.from('comprobantes').select('*', { count: 'exact', head: true }).eq('estado', 'observado'),
  ])
  return { pendientes: pendientes ?? 0, observados: observados ?? 0 }
}

export async function validarComprobante(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('comprobantes')
    .update({ estado: 'validado', observacion: null })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/comprobantes')
  return { success: true }
}

export async function observarComprobante(id: string, observacion: string): Promise<{ success: boolean; error?: string }> {
  if (!observacion.trim()) return { success: false, error: 'La observación es requerida' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('comprobantes')
    .update({ estado: 'observado', observacion })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/comprobantes')
  return { success: true }
}

export async function rechazarComprobante(id: string, observacion: string): Promise<{ success: boolean; error?: string }> {
  if (!observacion.trim()) return { success: false, error: 'El motivo de rechazo es requerido' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('comprobantes')
    .update({ estado: 'rechazado', observacion })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/comprobantes')
  return { success: true }
}
