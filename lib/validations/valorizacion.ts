/**
 * @system     FlowAluminio
 * @module     lib/validations/valorizacion.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Validación Zod para valorización de despachos (comercial)
 */
import { z } from 'zod'

export const valorizacionSchema = z.object({
  despacho_id:          z.string().uuid('Despacho requerido'),
  tipo_operacion:       z.enum(['fason', 'pleno', 'mixto'], { error: 'Seleccioná el tipo de operación' }),
  precio:               z.coerce.number().positive('El precio debe ser mayor a 0').max(999999),
  condicion_comercial:  z.string().optional(),
  observacion:          z.string().optional(),
})

export type ValorizacionFormData = z.infer<typeof valorizacionSchema>
