/**
 * @system     FlowAluminio
 * @module     lib/validations/merma.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Validación Zod para mermas consensuadas con vigencia
 */
import { z } from 'zod'

export const mermaSchema = z.object({
  cliente_id:       z.string().uuid('Seleccioná el cliente'),
  tipo_chatarra_id: z.string().uuid().optional().or(z.literal('')),
  merma_pct:        z.coerce.number().min(0, 'No puede ser negativa').max(99.99, 'Máximo 99.99%'),
  vigencia_desde:   z.string().min(1, 'La fecha de inicio es requerida'),
  vigencia_hasta:   z.string().optional(),
  observacion:      z.string().optional(),
})

export type MermaFormData = z.infer<typeof mermaSchema>
