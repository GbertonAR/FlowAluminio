/**
 * @system     FlowAluminio
 * @module     lib/validations/conteo.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Schema Zod para conteo físico de inventario
 */
import { z } from 'zod'

export const conteoSchema = z.object({
  fecha:           z.string().min(1, 'La fecha es requerida'),
  cliente_id:      z.string().uuid('Seleccioná el cliente'),
  tipo_chatarra_id: z.string().uuid().optional().or(z.literal('')),
  calidad_id:      z.string().uuid().optional().or(z.literal('')),
  kg_real:         z.coerce.number().min(0, 'Los kg no pueden ser negativos'),
  observacion:     z.string().optional(),
})

export type ConteoFormData = z.infer<typeof conteoSchema>
