/**
 * @system     FlowAluminio
 * @module     lib/supabase/admin.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Supabase admin client con service_role — solo para Server Actions privilegiadas
 */
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'createAdminClient: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configuradas. ' +
      'Agregá la variable en Vercel → Settings → Environment Variables.'
    )
  }
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}
