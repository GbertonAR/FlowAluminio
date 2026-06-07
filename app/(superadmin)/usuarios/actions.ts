/**
 * @system     FlowAluminio
 * @module     app/(superadmin)/usuarios/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Gestión de usuarios — solo superadmin — vía Supabase Admin API
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/types'

export async function getUsuarios() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('perfiles')
    .select('id, nombre, rol, activo, created_at, plantas(nombre)')
    .order('nombre')

  if (error) return []
  return data
}

export async function invitarUsuario(
  email: string,
  nombre: string,
  rol: string,
  plantaId?: string
): Promise<ActionResult> {
  const supabase      = await createClient()
  const adminClient   = createAdminClient()

  const { data: { user: caller } } = await supabase.auth.getUser()
  if (!caller) return { success: false, error: 'No autenticado' }

  const { data: callerPerfil } = await supabase
    .from('perfiles')
    .select('empresa_id, rol')
    .eq('id', caller.id)
    .single()

  if (callerPerfil?.rol !== 'superadmin') return { success: false, error: 'Sin permisos' }

  // Invitar vía Supabase Auth Admin
  const { data: invited, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { nombre, rol },
  })

  if (inviteError) return { success: false, error: inviteError.message }

  // Crear perfil en la tabla perfiles
  const { error: perfilError } = await adminClient
    .from('perfiles')
    .insert({
      id:         invited.user.id,
      empresa_id: callerPerfil.empresa_id,
      planta_id:  plantaId || null,
      rol,
      nombre,
      activo:     true,
    })

  if (perfilError) return { success: false, error: perfilError.message }

  revalidatePath('/superadmin/usuarios')
  return { success: true }
}

export async function actualizarUsuario(
  id: string,
  cambios: { rol?: string; activo?: boolean; plantaId?: string | null }
): Promise<ActionResult> {
  const supabase    = await createClient()
  const adminClient = createAdminClient()

  const { data: { user: caller } } = await supabase.auth.getUser()
  if (!caller) return { success: false, error: 'No autenticado' }

  const update: Record<string, unknown> = {}
  if (cambios.rol    !== undefined) update.rol     = cambios.rol
  if (cambios.activo !== undefined) update.activo  = cambios.activo
  if ('plantaId' in cambios)        update.planta_id = cambios.plantaId ?? null

  const { error } = await adminClient
    .from('perfiles')
    .update(update)
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/superadmin/usuarios')
  return { success: true }
}

export async function getPlantas() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('plantas')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre')
  return data ?? []
}
