/**
 * @system     FlowAluminio
 * @module     lib/calculations/recepcion.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Cálculo de kg reconocidos en recepción de chatarra
 */

export interface ResultadoRecepcion {
  kgMermaComercial: number
  kgReconocidos: number
}

export function calcularKgReconocidos(
  kgFisicos: number,
  mermaPct: number
): ResultadoRecepcion {
  const kgMermaComercial = kgFisicos * mermaPct
  const kgReconocidos = kgFisicos - kgMermaComercial
  return { kgMermaComercial, kgReconocidos }
}
