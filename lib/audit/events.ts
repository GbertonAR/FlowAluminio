/**
 * @system     FlowAluminio
 * @module     lib/audit/events.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Tipos y helper para registro de eventos de auditoría
 *             Los triggers PostgreSQL registran automáticamente en auditoria_eventos.
 *             Este módulo define las constantes de acciones sensibles.
 */

export const ACCIONES_SENSIBLES = [
  'cambiar_merma',
  'cambiar_precio',
  'valorizar_despacho',
  'anular_recepcion',
  'ajustar_stock',
  'modificar_liquidacion',
  'modificar_premio',
  'cerrar_caja_chica',
  'cerrar_conciliacion',
  'cambiar_permisos',
  'reabrir_cierre',
  'anular_produccion',
] as const

export type AccionSensible = typeof ACCIONES_SENSIBLES[number]

export interface EventoAuditoria {
  usuarioId: string
  accion: AccionSensible | string
  tabla: string
  registroId: string
  valorAnterior?: Record<string, unknown>
  valorNuevo?: Record<string, unknown>
  motivo?: string
}
