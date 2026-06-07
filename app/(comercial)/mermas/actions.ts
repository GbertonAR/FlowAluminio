/**
 * @system     FlowAluminio
 * @module     app/(comercial)/mermas/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    CRUD de mermas consensuadas con vigencia por cliente/tipo chatarra
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { mermaSchema } from '@/lib/validations/merma'

export async function getMermasVigentes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mermas_consensuadas')
    .select('*, clientes(nombre), tipos_chatarra(nombre)')
    .eq('activo', true)
    .order('vigencia_desde', { ascending: false })

  if (error) return []
  return data
}

export async function getMaestrosMerma() {
  const supabase = await createClient()
  const [{ data: clientes }, { data: tiposChatarra }] = await Promise.all([
    supabase.from('clientes').select('id, nombre').eq('activo', true).order('nombre'),
    supabase.from('tipos_chatarra').select('id, nombre').eq('activo', true).order('nombre'),
  ])
  return {
    clientes:    clientes ?? [],
    tiposChatarra: tiposChatarra ?? [],
  }
}

export async function crearMerma(values: {
  cliente_id: string
  tipo_chatarra_id?: string
  merma_pct: number
  vigencia_desde: string
  vigencia_hasta?: string
  observacion?: string
}) {
  const parsed = mermaSchema.safeParse(values)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Sin sesión' }

  const { data: perfil } = await supabase.from('perfiles').select('empresa_id').eq('id', user.id).single()
  if (!perfil) return { success: false, error: 'Perfil no encontrado' }

  const { error } = await supabase.from('mermas_consensuadas').insert({
    empresa_id:       perfil.empresa_id,
    cliente_id:       parsed.data.cliente_id,
    tipo_chatarra_id: parsed.data.tipo_chatarra_id || null,
    merma_pct:        parsed.data.merma_pct / 100,
    vigencia_desde:   parsed.data.vigencia_desde,
    vigencia_hasta:   parsed.data.vigencia_hasta || null,
    observacion:      parsed.data.observacion || null,
    created_by:       user.id,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/comercial/mermas')
  return { success: true }
}

export async function desactivarMerma(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('mermas_consensuadas')
    .update({ activo: false })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  revalidatePath('/comercial/mermas')
  return { success: true }
}
