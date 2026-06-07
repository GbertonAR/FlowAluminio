/**
 * @system     FlowAluminio
 * @module     app/dashboard/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Fallback /dashboard — redirige al dashboard del rol del usuario
 */
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ROLE_DASHBOARDS } from '@/lib/roles'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', user.id)
    .single()

  redirect(ROLE_DASHBOARDS[perfil?.rol ?? ''] ?? '/login')
}
