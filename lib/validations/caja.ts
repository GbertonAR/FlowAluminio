/**
 * @system     FlowAluminio
 * @module     lib/validations/caja.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Validación Zod para apertura y cierre de caja chica
 */
import { z } from 'zod'

export const aperturaCajaSchema = z.object({
  fecha_apertura:  z.string().min(1, 'La fecha es requerida'),
  monto_inicial:   z.coerce.number().positive('El monto debe ser mayor a 0').max(9999999),
})

export type AperturaCajaFormData = z.infer<typeof aperturaCajaSchema>

export const cierreCajaSchema = z.object({
  efectivo_devuelto: z.coerce.number().min(0, 'No puede ser negativo'),
})

export type CierreCajaFormData = z.infer<typeof cierreCajaSchema>
