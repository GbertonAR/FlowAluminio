/**
 * @system     FlowAluminio
 * @module     lib/validations/gasto.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Validación Zod para gastos operativos (con comprobante opcional)
 */
import { z } from 'zod'

export const gastoSchema = z.object({
  fecha:          z.string().min(1, 'La fecha es requerida'),
  categoria_id:   z.string().uuid().optional().or(z.literal('')),
  concepto:       z.string().min(2, 'Describí el concepto'),
  proveedor_id:   z.string().uuid().optional().or(z.literal('')),
  importe:        z.coerce.number().positive('El importe debe ser mayor a 0').max(9999999),
  medio_pago_id:  z.string().min(1, 'Seleccioná el medio de pago'),
  caja_chica_id:  z.string().uuid().optional().or(z.literal('')),
  observacion:    z.string().optional(),
})

export type GastoFormData = z.infer<typeof gastoSchema>
