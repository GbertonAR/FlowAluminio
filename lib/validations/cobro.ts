/**
 * @system     FlowAluminio
 * @module     lib/validations/cobro.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Validación Zod para cobros a clientes
 */
import { z } from 'zod'

export const cobroSchema = z.object({
  fecha:          z.string().min(1, 'La fecha es requerida'),
  cliente_id:     z.string().uuid('Seleccioná el cliente'),
  importe:        z.coerce.number().positive('El importe debe ser mayor a 0').max(99999999),
  medio_pago_id:  z.string().min(1, 'Seleccioná el medio de pago'),
  observacion:    z.string().optional(),
})

export type CobroFormData = z.infer<typeof cobroSchema>
