/**
 * @system     FlowAluminio
 * @module     app/(comercial)/saldos/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Cálculo de saldos físicos y financieros por cliente (ledger físico + comercial)
 */
'use server'

import { createClient } from '@/lib/supabase/server'

export async function getSaldosClientes() {
  const supabase = await createClient()

  const [
    { data: recepciones },
    { data: despachos },
    { data: valorizaciones },
    { data: cobros },
  ] = await Promise.all([
    supabase.from('recepciones').select('cliente_id, kg_reconocidos, clientes(nombre)').eq('estado', 'confirmado'),
    supabase.from('despachos').select('cliente_id, kg_despachados').eq('estado', 'confirmado'),
    supabase.from('valorizaciones_despacho').select('importe, despachos(cliente_id)'),
    supabase.from('cobros').select('cliente_id, importe'),
  ])

  type SaldoEntry = {
    clienteId: string
    clienteNombre: string
    kgRecibidos: number
    kgDespachados: number
    importeValorizado: number
    importeCobrado: number
  }

  const map = new Map<string, SaldoEntry>()

  const ensure = (id: string, nombre: string): SaldoEntry => {
    if (!map.has(id)) map.set(id, { clienteId: id, clienteNombre: nombre, kgRecibidos: 0, kgDespachados: 0, importeValorizado: 0, importeCobrado: 0 })
    return map.get(id)!
  }

  for (const r of recepciones ?? []) {
    const nombre = (r.clientes as unknown as { nombre: string } | null)?.nombre ?? r.cliente_id
    ensure(r.cliente_id, nombre).kgRecibidos += r.kg_reconocidos ?? 0
  }

  for (const d of despachos ?? []) {
    ensure(d.cliente_id, d.cliente_id).kgDespachados += d.kg_despachados ?? 0
  }

  for (const v of valorizaciones ?? []) {
    const clienteId = (v.despachos as unknown as { cliente_id: string } | null)?.cliente_id
    if (clienteId) ensure(clienteId, clienteId).importeValorizado += v.importe ?? 0
  }

  for (const c of cobros ?? []) {
    ensure(c.cliente_id, c.cliente_id).importeCobrado += c.importe ?? 0
  }

  return Array.from(map.values())
    .map((v) => ({
      ...v,
      kgSaldo:          v.kgRecibidos - v.kgDespachados,
      saldoFinanciero:  v.importeValorizado - v.importeCobrado,
    }))
    .sort((a, b) => a.clienteNombre.localeCompare(b.clienteNombre))
}
