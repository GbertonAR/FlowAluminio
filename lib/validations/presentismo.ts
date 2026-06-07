/**
 * @system     FlowAluminio
 * @module     lib/validations/presentismo.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Schema Zod para registro de presentismo
 */
import { z } from 'zod'

export const presentismoSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  empleado_id: z.string().uuid('Seleccioná un empleado'),
  estado: z.enum(['presente', 'ausente', 'medio_dia', 'franco', 'feriado', 'licencia', 'vacaciones']),
  horas_extra: z.coerce.number().min(0).max(12).default(0),
  observacion: z.string().optional(),
})

export type PresentismoFormData = z.infer<typeof presentismoSchema>
