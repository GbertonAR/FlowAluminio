/**
 * @system     FlowAluminio
 * @module     app/(operaciones)/presentismo/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Server Actions para registro de presentismo
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { presentismoSchema, type PresentismoFormData } from '@/lib/validations/presentismo'
import type { ActionResult } from '@/types'

export async function registrarPresentismo(
  data: PresentismoFormData
): Promise<ActionResult<{ id: string }>> {
  const parsed = presentismoSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: perfil } = await supabase
    .from('perfiles').select('empresa_id').eq('id', user.id).single()

  if (!perfil?.empresa_id) return { success: false, error: 'Sin empresa' }

  const { data: registro, error } = await supabase
    .from('presentismo')
    .upsert(
      {
        empresa_id: perfil.empresa_id,
        fecha: parsed.data.fecha,
        empleado_id: parsed.data.empleado_id,
        estado: parsed.data.estado,
        horas_extra: parsed.data.horas_extra,
        observacion: parsed.data.observacion || null,
        created_by: user.id,
      },
      { onConflict: 'empresa_id,fecha,empleado_id' }
    )
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/operaciones/presentismo')
  return { success: true, data: { id: registro.id } }
}

export async function getPresentismoDelDia(fecha: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: perfil } = await supabase
    .from('perfiles').select('empresa_id').eq('id', user.id).single()

  if (!perfil?.empresa_id) return []

  const { data } = await supabase
    .from('presentismo')
    .select('id, empleado_id, estado, horas_extra, empleados(nombre)')
    .eq('empresa_id', perfil.empresa_id)
    .eq('fecha', fecha)
    .order('empleados(nombre)')

  return data ?? []
}

export async function getEmpleados() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: perfil } = await supabase
    .from('perfiles').select('empresa_id').eq('id', user.id).single()

  if (!perfil?.empresa_id) return []

  const { data } = await supabase
    .from('empleados')
    .select('id, nombre')
    .eq('empresa_id', perfil.empresa_id)
    .eq('activo', true)
    .order('nombre')

  return data ?? []
}
