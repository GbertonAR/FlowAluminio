/**
 * @system     FlowAluminio
 * @module     app/(comercial)/margenes/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Costos y márgenes estimados por período — agrega valorizaciones, gastos y liquidaciones
 */
'use server'

import { createClient } from '@/lib/supabase/server'

export interface MargenCliente {
  clienteId:      string
  clienteNombre:  string
  kgDespachados:  number
  ingresos:       number
  tipoOperacion:  string
}

export interface MargenPeriodo {
  mes:              string
  totalIngresos:    number
  totalGastos:      number
  totalLiquidaciones: number
  margenBruto:      number
  margenPct:        number | null
  kgProducidos:     number
  kgDespachados:    number
  costoPorKg:       number | null
  detallePorCliente: MargenCliente[]
}

export async function getMargenesPeriodo(mes: string): Promise<MargenPeriodo> {
  const supabase  = await createClient()
  const mesInicio = mes + '-01'
  const mesFin    = new Date(
    parseInt(mes.slice(0, 4)),
    parseInt(mes.slice(5, 7)),
    0
  ).toISOString().split('T')[0]

  const [
    { data: valorizaciones },
    { data: gastos },
    { data: liquidaciones },
    { data: producciones },
  ] = await Promise.all([
    supabase
      .from('valorizaciones_despacho')
      .select('importe, tipo_operacion, despacho_id, despachos(kg_despachados, cliente_id, clientes(nombre))')
      .gte('created_at', mesInicio)
      .lte('created_at', mesFin + 'T23:59:59Z'),
    supabase
      .from('gastos')
      .select('importe')
      .gte('fecha', mesInicio)
      .lte('fecha', mesFin)
      .neq('estado', 'anulado'),
    supabase
      .from('liquidaciones')
      .select('total_pagado')
      .gte('periodo_desde', mesInicio)
      .lte('periodo_hasta', mesFin)
      .in('estado', ['confirmado', 'pagado']),
    supabase
      .from('producciones_coladas')
      .select('kg_tocho')
      .gte('fecha', mesInicio)
      .lte('fecha', mesFin)
      .neq('estado', 'anulado'),
  ])

  const totalIngresos = (valorizaciones ?? []).reduce((s, v) => s + (v.importe ?? 0), 0)
  const totalGastos   = (gastos ?? []).reduce((s, g) => s + (g.importe ?? 0), 0)
  const totalLiquidaciones = (liquidaciones ?? []).reduce((s, l) => s + (l.total_pagado ?? 0), 0)
  const kgProducidos  = (producciones ?? []).reduce((s, p) => s + (p.kg_tocho ?? 0), 0)
  const margenBruto   = totalIngresos - totalGastos - totalLiquidaciones

  // Agrupar ingresos y kg por cliente
  const mapaClientes = new Map<string, MargenCliente>()
  for (const v of valorizaciones ?? []) {
    const d = v.despachos as unknown as {
      kg_despachados: number
      cliente_id: string
      clientes: { nombre: string } | null
    } | null
    if (!d) continue
    const cid = d.cliente_id
    const existing = mapaClientes.get(cid)
    if (existing) {
      existing.ingresos      += v.importe ?? 0
      existing.kgDespachados += d.kg_despachados ?? 0
    } else {
      mapaClientes.set(cid, {
        clienteId:     cid,
        clienteNombre: d.clientes?.nombre ?? '—',
        kgDespachados: d.kg_despachados ?? 0,
        ingresos:      v.importe ?? 0,
        tipoOperacion: v.tipo_operacion,
      })
    }
  }

  const kgDespachados = Array.from(mapaClientes.values()).reduce((s, c) => s + c.kgDespachados, 0)

  return {
    mes,
    totalIngresos,
    totalGastos,
    totalLiquidaciones,
    margenBruto,
    margenPct:     totalIngresos > 0 ? margenBruto / totalIngresos : null,
    kgProducidos,
    kgDespachados,
    costoPorKg:    kgProducidos > 0 ? (totalGastos + totalLiquidaciones) / kgProducidos : null,
    detallePorCliente: Array.from(mapaClientes.values()).sort((a, b) => b.ingresos - a.ingresos),
  }
}
