/**
 * @system     FlowAluminio
 * @module     lib/validations/pago.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    Esquema Zod para registro de pagos de chatarra (PRD §8.19)
 */
import { z } from 'zod'

export const pagoSchema = z.object({
  fecha:         z.string().min(1, 'Requerido'),
  proveedor_id:  z.string().min(1, 'Requerido'),
  importe:       z.coerce.number().positive('Debe ser mayor a 0'),
  medio_pago_id: z.string().min(1, 'Requerido'),
  observacion:   z.string().optional(),
})

export type PagoFormData = z.infer<typeof pagoSchema>
