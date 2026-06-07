/**
 * @system     FlowAluminio
 * @module     lib/calculations/produccion.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Fórmulas de producción / colada — auditadas por CHARLES
 */

export interface InputsColada {
  kg1ra: number
  kg2da: number
  kgTocho: number
  kgEscoria: number
  kgRemanenteRecibido?: number
  kgRemanenteEntregado?: number
}

export interface ResultadosColada {
  kgChatarraTotal: number
  kgMetalDisponible: number
  kgVolatilizado: number
  escoriaPct: number
  volatilizacionPct: number
  rendimientoPct: number
  mermaProductivaPct: number
  mix1raPct: number
  mix2daPct: number
}

export function calcularColada(inputs: InputsColada): ResultadosColada {
  const {
    kg1ra,
    kg2da,
    kgTocho,
    kgEscoria,
    kgRemanenteRecibido = 0,
    kgRemanenteEntregado = 0,
  } = inputs

  const kgChatarraTotal = kg1ra + kg2da
  const kgMetalDisponible = kgChatarraTotal + kgRemanenteRecibido
  const kgVolatilizado =
    kgMetalDisponible - kgTocho - kgEscoria - kgRemanenteEntregado

  const escoriaPct = kgMetalDisponible > 0 ? kgEscoria / kgMetalDisponible : 0
  const volatilizacionPct =
    kgMetalDisponible > 0 ? kgVolatilizado / kgMetalDisponible : 0
  const rendimientoPct =
    kgMetalDisponible > 0 ? kgTocho / kgMetalDisponible : 0
  const mermaProductivaPct = 1 - rendimientoPct

  const mix1raPct = kgChatarraTotal > 0 ? kg1ra / kgChatarraTotal : 0
  const mix2daPct = kgChatarraTotal > 0 ? kg2da / kgChatarraTotal : 0

  return {
    kgChatarraTotal,
    kgMetalDisponible,
    kgVolatilizado,
    escoriaPct,
    volatilizacionPct,
    rendimientoPct,
    mermaProductivaPct,
    mix1raPct,
    mix2daPct,
  }
}

export function calcularDesvioMezcla(
  mix1raReal: number,
  mix1raObjetivo: number
): { desvio1ra: number; desvio2da: number } {
  return {
    desvio1ra: mix1raReal - mix1raObjetivo,
    desvio2da: (1 - mix1raReal) - (1 - mix1raObjetivo),
  }
}
