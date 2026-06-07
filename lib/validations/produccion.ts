/**
 * @system     FlowAluminio
 * @module     lib/validations/produccion.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Schema Zod para producción / colada
 */
import { z } from 'zod'

export const produccionSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  numero_colada: z.coerce.number().int().min(1).max(3),
  cliente_destino_id: z.string().uuid('Seleccioná el cliente destino'),
  propietario_1ra_id: z.string().uuid().optional().or(z.literal('')),
  propietario_2da_id: z.string().uuid().optional().or(z.literal('')),
  kg_1ra: z.coerce.number().min(0),
  kg_2da: z.coerce.number().min(0),
  kg_tocho: z.coerce.number().positive('Los kg de tocho deben ser mayores a 0'),
  kg_escoria: z.coerce.number().min(0),
  kg_remanente_recibido: z.coerce.number().min(0).default(0),
  kg_remanente_dejado: z.coerce.number().min(0).default(0),
  producto_id: z.string().uuid().optional().or(z.literal('')),
  observaciones: z.string().optional(),
}).refine(
  (d) => d.kg_1ra + d.kg_2da > 0,
  { message: 'La chatarra total debe ser mayor a 0', path: ['kg_1ra'] }
)

export type ProduccionFormData = z.infer<typeof produccionSchema>
