/**
 * @system     FlowAluminio
 * @module     app/(admin)/liquidaciones/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Liquidaciones de personal: generación, revisión y confirmación
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { calcularLiquidacion } from '@/lib/calculations/liquidacion'
import type { EstadoPresentismo } from '@/types'

export async function getLiquidaciones(mes?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('liquidaciones')
    .select('*, empleados(nombre)')
    .order('periodo_desde', { ascending: false })
    .limit(60)

  if (mes) {
    const desde = `${mes}-01`
    const hasta = `${mes}-31`
    query = query.gte('periodo_desde', desde).lte('periodo_desde', hasta)
  }

  const { data, error } = await query
  if (error) return []
  return data
}

export async function getEmpleadosActivos() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('empleados')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre')

  return data ?? []
}

export async function generarSugerenciaLiquidacion(
  empleadoId: string,
  periodoDesde: string,
  periodoHasta: string,
) {
  const supabase = await createClient()

  const [
    { data: presentismo },
    { data: condicion },
    { data: producciones },
  ] = await Promise.all([
    supabase.from('presentismo').select('fecha, estado').eq('empleado_id', empleadoId).gte('fecha', periodoDesde).lte('fecha', periodoHasta),
    supabase.from('condiciones_pago_empleado').select('*').eq('empleado_id', empleadoId).eq('activo', true).lte('vigencia_desde', periodoHasta).or(`vigencia_hasta.is.null,vigencia_hasta.gte.${periodoDesde}`).order('vigencia_desde', { ascending: false }).limit(1).maybeSingle(),
    supabase.from('producciones_coladas').select('fecha, kg_tocho').gte('fecha', periodoDesde).lte('fecha', periodoHasta),
  ])

  if (!condicion) return { success: false, error: 'No hay condición de pago vigente para este empleado' }

  const prod = (producciones ?? []).map((p) => ({ fecha: p.fecha, kgTocho: p.kg_tocho }))
  const pres = (presentismo ?? []).map((p) => ({ fecha: p.fecha, estado: p.estado as EstadoPresentismo }))

  const totalHorasExtra = (presentismo ?? []).reduce((s, p) => s + 0, 0)

  const resultado = calcularLiquidacion(prod, pres, 5)

  let totalSugerido = 0
  if (condicion.modalidad === 'por_kilo') {
    totalSugerido = resultado.kgSugeridosALiquidar * condicion.valor
  } else if (condicion.modalidad === 'mensual') {
    const fraccion = resultado.diasPresentes / Math.max(resultado.diasHabiles, 1)
    totalSugerido = condicion.valor * fraccion
  } else {
    totalSugerido = condicion.valor * resultado.diasPresentes
  }

  const viaticos = condicion.viatico * resultado.diasPresentes
  totalSugerido += viaticos

  const premioSugerido = resultado.correspondePremio
  const montoPremio = premioSugerido ? condicion.premio_presentismo : 0

  return {
    success: true,
    sugerencia: {
      empleadoId,
      periodoDesde,
      periodoHasta,
      modalidad: condicion.modalidad,
      valorAplicado: condicion.valor,
      diasHabiles: resultado.diasHabiles,
      diasPresentes: resultado.diasPresentes,
      diasAusentes: resultado.diasAusentes,
      horasExtra: totalHorasExtra,
      kgProducidosDiasPresentes: resultado.kgProducidosEnDiasPresentes,
      kgSugeridosLiquidar: resultado.kgSugeridosALiquidar,
      valorPorKg: condicion.modalidad === 'por_kilo' ? condicion.valor : null,
      viaticos,
      premioSugerido,
      montoPremio,
      totalSugerido: totalSugerido + montoPremio,
    },
  }
}

export async function confirmarLiquidacion(values: {
  empleadoId: string
  periodoDesde: string
  periodoHasta: string
  modalidad: string
  valorAplicado: number
  diasHabiles: number
  diasPresentes: number
  diasAusentes: number
  horasExtra: number
  kgProducidosDiasPresentes: number
  kgLiquidados: number
  valorPorKg?: number | null
  motivoAjusteKg?: string
  viaticos: number
  extras: number
  premioAprobado: boolean
  montoPremio: number
  motivoCambioPremio?: string
  descuentos: number
  adelantos: number
  totalPagado: number
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Sin sesión' }

  const { data: perfil } = await supabase.from('perfiles').select('empresa_id').eq('id', user.id).single()
  if (!perfil) return { success: false, error: 'Perfil no encontrado' }

  const subtotalPorKg = values.valorPorKg != null ? values.kgLiquidados * values.valorPorKg : null

  const { error } = await supabase.from('liquidaciones').insert({
    empresa_id:                      perfil.empresa_id,
    empleado_id:                     values.empleadoId,
    periodo_desde:                   values.periodoDesde,
    periodo_hasta:                   values.periodoHasta,
    modalidad:                       values.modalidad,
    valor_aplicado:                  values.valorAplicado,
    dias_habiles:                    values.diasHabiles,
    dias_presentes:                  values.diasPresentes,
    dias_ausentes:                   values.diasAusentes,
    horas_extra:                     values.horasExtra,
    kg_producidos_dias_presentes:    values.kgProducidosDiasPresentes,
    kg_sugeridos_liquidar:           values.kgLiquidados,
    kg_liquidados:                   values.kgLiquidados,
    valor_por_kg:                    values.valorPorKg ?? null,
    subtotal_por_kg:                 subtotalPorKg,
    motivo_ajuste_kg:                values.motivoAjusteKg || null,
    viaticos:                        values.viaticos,
    extras:                          values.extras,
    premio_sugerido:                 values.premioAprobado,
    premio_aprobado:                 values.premioAprobado,
    monto_premio:                    values.montoPremio,
    motivo_cambio_premio:            values.motivoCambioPremio || null,
    descuentos:                      values.descuentos,
    adelantos:                       values.adelantos,
    total_sugerido:                  values.totalPagado,
    total_pagado:                    values.totalPagado,
    estado:                          'confirmada',
    created_by:                      user.id,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/liquidaciones')
  return { success: true }
}
