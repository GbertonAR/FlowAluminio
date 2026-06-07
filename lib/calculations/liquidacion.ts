/**
 * @system     FlowAluminio
 * @module     lib/calculations/liquidacion.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Cálculo de liquidaciones de personal — cruce producción × presentismo
 */

import type { EstadoPresentismo } from '@/types'

const ESTADOS_COMPUTABLES: EstadoPresentismo[] = ['presente']
const ESTADOS_PARCIALES: EstadoPresentismo[] = ['medio_dia']

export function esAsistenciaComputable(estado: EstadoPresentismo): boolean {
  return ESTADOS_COMPUTABLES.includes(estado)
}

export function esAsistenciaParcial(estado: EstadoPresentismo): boolean {
  return ESTADOS_PARCIALES.includes(estado)
}

export interface ProduccionDia {
  fecha: string
  kgTocho: number
}

export interface PresentismoDia {
  fecha: string
  estado: EstadoPresentismo
}

export interface ResultadoLiquidacion {
  kgProducidosEnDiasPresentes: number
  kgSugeridosALiquidar: number
  diasPresentes: number
  diasAusentes: number
  diasHabiles: number
  correspondePremio: boolean
}

export function calcularLiquidacion(
  produccion: ProduccionDia[],
  presentismo: PresentismoDia[],
  diasHabilesExigidos: number
): ResultadoLiquidacion {
  const mapPresentismo = new Map(presentismo.map((p) => [p.fecha, p.estado]))

  let kgProducidosEnDiasPresentes = 0
  let diasPresentes = 0
  let diasAusentes = 0

  for (const dia of produccion) {
    const estado = mapPresentismo.get(dia.fecha)
    if (!estado) continue

    if (esAsistenciaComputable(estado)) {
      kgProducidosEnDiasPresentes += dia.kgTocho
      diasPresentes++
    } else if (!['franco', 'feriado'].includes(estado)) {
      diasAusentes++
    }
  }

  const correspondePremio = diasPresentes >= diasHabilesExigidos

  return {
    kgProducidosEnDiasPresentes,
    kgSugeridosALiquidar: kgProducidosEnDiasPresentes,
    diasPresentes,
    diasAusentes,
    diasHabiles: diasHabilesExigidos,
    correspondePremio,
  }
}
