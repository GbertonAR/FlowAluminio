/**
 * @system     FlowAluminio
 * @module     lib/validations/despacho.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Schema Zod para despacho físico de producto
 */
import { z } from 'zod'

export const despachoSchema = z.object({
  fecha:       z.string().min(1, 'La fecha es requerida'),
  cliente_id:  z.string().uuid('Seleccioná el cliente'),
  kg_despachados: z.coerce.number().positive('Los kg deben ser mayores a 0').max(99999),
  producto_id: z.string().uuid().optional().or(z.literal('')),
  remito:      z.string().optional(),
  observacion: z.string().optional(),
})

export type DespachoFormData = z.infer<typeof despachoSchema>
