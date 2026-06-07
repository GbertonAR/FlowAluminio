/**
 * @system     FlowAluminio
 * @module     app/(superadmin)/parametros/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Parámetros del sistema — empresa, plantas, categorías de gasto, tipos de chatarra
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ActionResult } from '@/types'

async function getEmpresaId() {
  const supabase    = await createClient()
  const adminClient = createAdminClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await adminClient.from('perfiles').select('empresa_id').eq('id', user.id).single()
  return data?.empresa_id as string | null
}

// ─── Empresa ─────────────────────────────────────────────────────────────────

export async function getEmpresa() {
  const adminClient = createAdminClient()
  const empresaId   = await getEmpresaId()
  if (!empresaId) return null
  const { data } = await adminClient
    .from('empresas')
    .select('id, nombre, activo')
    .eq('id', empresaId)
    .single()
  return data
}

export async function actualizarEmpresa(nombre: string): Promise<ActionResult> {
  const adminClient = createAdminClient()
  const empresaId   = await getEmpresaId()
  if (!empresaId) return { success: false, error: 'No autenticado' }

  const { error } = await adminClient
    .from('empresas')
    .update({ nombre: nombre.trim() })
    .eq('id', empresaId)

  if (error) return { success: false, error: error.message }
  revalidatePath('/superadmin/parametros')
  return { success: true }
}

// ─── Plantas ──────────────────────────────────────────────────────────────────

export async function getPlantas() {
  const adminClient = createAdminClient()
  const empresaId   = await getEmpresaId()
  if (!empresaId) return []
  const { data } = await adminClient
    .from('plantas')
    .select('id, nombre, activo')
    .eq('empresa_id', empresaId)
    .order('nombre')
  return data ?? []
}

export async function crearPlanta(nombre: string): Promise<ActionResult> {
  const adminClient = createAdminClient()
  const empresaId   = await getEmpresaId()
  if (!empresaId) return { success: false, error: 'No autenticado' }

  const { error } = await adminClient
    .from('plantas')
    .insert({ empresa_id: empresaId, nombre: nombre.trim() })

  if (error) return { success: false, error: error.message }
  revalidatePath('/superadmin/parametros')
  return { success: true }
}

export async function togglePlanta(id: string, activo: boolean): Promise<ActionResult> {
  const adminClient = createAdminClient()
  const { error } = await adminClient.from('plantas').update({ activo }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/superadmin/parametros')
  return { success: true }
}

// ─── Categorías de gasto ─────────────────────────────────────────────────────

export async function getCategoriasGasto() {
  const adminClient = createAdminClient()
  const empresaId   = await getEmpresaId()
  if (!empresaId) return []
  const { data } = await adminClient
    .from('categorias_gasto')
    .select('id, nombre, activo')
    .eq('empresa_id', empresaId)
    .order('nombre')
  return data ?? []
}

export async function crearCategoriaGasto(nombre: string): Promise<ActionResult> {
  const adminClient = createAdminClient()
  const empresaId   = await getEmpresaId()
  if (!empresaId) return { success: false, error: 'No autenticado' }

  const { error } = await adminClient
    .from('categorias_gasto')
    .insert({ empresa_id: empresaId, nombre: nombre.trim() })

  if (error) return { success: false, error: error.message }
  revalidatePath('/superadmin/parametros')
  return { success: true }
}

export async function toggleCategoriaGasto(id: string, activo: boolean): Promise<ActionResult> {
  const adminClient = createAdminClient()
  const { error } = await adminClient.from('categorias_gasto').update({ activo }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/superadmin/parametros')
  return { success: true }
}

// ─── Tipos de chatarra ────────────────────────────────────────────────────────

export async function getTiposChatarra() {
  const adminClient = createAdminClient()
  const empresaId   = await getEmpresaId()
  if (!empresaId) return []
  const { data } = await adminClient
    .from('tipos_chatarra')
    .select('id, nombre, activo')
    .eq('empresa_id', empresaId)
    .order('nombre')
  return data ?? []
}

export async function crearTipoChatarra(nombre: string): Promise<ActionResult> {
  const adminClient = createAdminClient()
  const empresaId   = await getEmpresaId()
  if (!empresaId) return { success: false, error: 'No autenticado' }

  const { error } = await adminClient
    .from('tipos_chatarra')
    .insert({ empresa_id: empresaId, nombre: nombre.trim() })

  if (error) return { success: false, error: error.message }
  revalidatePath('/superadmin/parametros')
  return { success: true }
}

export async function toggleTipoChatarra(id: string, activo: boolean): Promise<ActionResult> {
  const adminClient = createAdminClient()
  const { error } = await adminClient.from('tipos_chatarra').update({ activo }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/superadmin/parametros')
  return { success: true }
}
