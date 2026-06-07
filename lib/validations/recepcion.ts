/**
 * @system     FlowAluminio
 * @module     lib/validations/recepcion.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Schema Zod para recepción de chatarra — valida el formulario mobile-first
 */
import { z } from 'zod'

export const recepcionSchema = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  cliente_id: z.string().uuid('Seleccioná un cliente'),
  proveedor_id: z.string().uuid('Seleccioná un proveedor').optional().or(z.literal('')),
  tipo_chatarra_id: z.string().uuid('Seleccioná el tipo de chatarra'),
  calidad_id: z.string().uuid('Seleccioná la calidad'),
  kg_fisicos: z
    .number()
    .positive('Ingresá los kg físicos')
    .max(99999, 'Valor fuera de rango'),
  remito: z.string().optional(),
  observacion: z.string().optional(),
})

export type RecepcionFormData = z.infer<typeof recepcionSchema>
