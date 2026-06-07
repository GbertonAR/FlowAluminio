/**
 * @system     FlowAluminio
 * @module     app/(admin)/cierres/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Cierres de período semanales y mensuales — lógica de negocio
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

type TipoCierre = 'semanal' | 'mensual'

export async function getCierres(tipo?: TipoCierre) {
  const supabase = await createClient()

  let q = supabase
    .from('cierres_periodo')
    .select('*, perfiles(nombre)')
    .order('periodo_desde', { ascending: false })
    .limit(50)

  if (tipo) q = q.eq('tipo', tipo)

  const { data, error } = await q
  if (error) return []
  return data
}

export async function crearCierre(
  tipo: TipoCierre,
  periodoDesde: string,
  periodoHasta: string,
  observacion?: string
): Promise<ActionResult<string>> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  if (!perfil) return { success: false, error: 'Perfil no encontrado' }

  const { data: solapado } = await supabase
    .from('cierres_periodo')
    .select('id')
    .eq('empresa_id', perfil.empresa_id)
    .eq('tipo', tipo)
    .eq('estado', 'cerrado')
    .lte('periodo_desde', periodoHasta)
    .gte('periodo_hasta', periodoDesde)
    .limit(1)

  if (solapado && solapado.length > 0) {
    return { success: false, error: 'Ya existe un cierre activo que se superpone con el período seleccionado' }
  }

  const { data, error } = await supabase
    .from('cierres_periodo')
    .insert({
      empresa_id:    perfil.empresa_id,
      tipo,
      periodo_desde: periodoDesde,
      periodo_hasta: periodoHasta,
      estado:        'cerrado',
      observacion:   observacion || null,
      created_by:    user.id,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/cierres')
  return { success: true, data: data.id }
}

export async function anularCierre(id: string, motivo: string): Promise<ActionResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { error } = await supabase
    .from('cierres_periodo')
    .update({ estado: 'anulado' })
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  if (perfil) {
    await supabase.from('auditoria_eventos').insert({
      empresa_id:  perfil.empresa_id,
      usuario_id:  user.id,
      accion:      'ANULACION',
      tabla:       'cierres_periodo',
      registro_id: id,
      motivo,
    })
  }

  revalidatePath('/admin/cierres')
  return { success: true }
}

export async function verificarFechaLibre(fecha: string): Promise<{ cerrado: boolean; detalle?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { cerrado: false }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  if (!perfil) return { cerrado: false }

  const { data } = await supabase
    .from('cierres_periodo')
    .select('tipo, periodo_desde, periodo_hasta')
    .eq('empresa_id', perfil.empresa_id)
    .eq('estado', 'cerrado')
    .lte('periodo_desde', fecha)
    .gte('periodo_hasta', fecha)
    .limit(1)

  if (!data || data.length === 0) return { cerrado: false }

  const c = data[0]
  return {
    cerrado: true,
    detalle: `Período ${c.tipo} cerrado (${c.periodo_desde} – ${c.periodo_hasta})`,
  }
}
