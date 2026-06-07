/**
 * @system     FlowAluminio
 * @module     types/index.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Tipos globales del dominio — roles, permisos, entidades base
 */

// ─── ROLES ───────────────────────────────────────────────────────────────────

export type UserRole =
  | 'operaciones'
  | 'comercial'
  | 'administracion'
  | 'superadmin'

// ─── CALIDADES ───────────────────────────────────────────────────────────────

export type CalidadChatarra = 'primera' | 'segunda'

// ─── MODALIDADES DE OPERACIÓN ─────────────────────────────────────────────────

export type TipoOperacion = 'fason' | 'pleno' | 'mixto'

// ─── ESTADOS GENÉRICOS ────────────────────────────────────────────────────────

export type EstadoRegistro = 'borrador' | 'confirmado' | 'anulado' | 'cerrado' | 'observado'

export type EstadoDocumental = 'pendiente' | 'validado' | 'observado' | 'rechazado'

// ─── ESTADOS DE PRESENTISMO ──────────────────────────────────────────────────

export type EstadoPresentismo =
  | 'presente'
  | 'ausente'
  | 'medio_dia'
  | 'franco'
  | 'feriado'
  | 'licencia'
  | 'vacaciones'

// ─── MODALIDADES DE PAGO EMPLEADO ────────────────────────────────────────────

export type ModalidadPago =
  | 'mensual'
  | 'semanal'
  | 'diario'
  | 'por_kilo'
  | 'por_colada'
  | 'mixto'

// ─── TIPO DE COLADA ──────────────────────────────────────────────────────────

export type NumerocoladaDia = 1 | 2 | 3

// ─── MEDIOS DE PAGO ──────────────────────────────────────────────────────────

export type MedioPago =
  | 'efectivo'
  | 'transferencia'
  | 'cheque'
  | 'otro'

// ─── TIPOS DE COMPROBANTE ────────────────────────────────────────────────────

export type TipoComprobante =
  | 'factura'
  | 'remito'
  | 'recibo'
  | 'transferencia'
  | 'ticket'
  | 'captura_whatsapp'
  | 'foto_manuscrita'
  | 'otro'

// ─── RESPUESTA GENÉRICA DE SERVER ACTION ─────────────────────────────────────

export interface ActionResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

// ─── PAGINACIÓN ──────────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
