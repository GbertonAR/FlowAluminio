/**
 * @system     FlowAluminio
 * @module     app/(auth)/reset-password/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Server Action para actualizar contraseña tras invitación o recuperación
 */
'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROLE_DASHBOARDS } from '@/lib/roles'

export async function actualizarPasswordAction(_prev: unknown, formData: FormData) {
  const password        = formData.get('password') as string
  const passwordConfirm = formData.get('password_confirm') as string

  if (!password || password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres' }
  }
  if (password !== passwordConfirm) {
    return { error: 'Las contraseñas no coinciden' }
  }

  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.updateUser({ password })

  if (authError || !user) {
    return { error: authError?.message ?? 'Error al actualizar la contraseña' }
  }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  redirect(ROLE_DASHBOARDS[perfil?.rol ?? ''] ?? '/dashboard')
}
