/**
 * @system     FlowAluminio
 * @module     lib/auditoria.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Helper servidor para registrar eventos en auditoria_eventos — inmutable por diseño
 */
import type { SupabaseClient } from '@supabase/supabase-js'

interface RegistrarEventoParams {
  supabase:     SupabaseClient
  empresaId:    string
  usuarioId:    string
  accion:       'CREACION' | 'MODIFICACION' | 'ANULACION' | 'CIERRE' | 'APROBACION'
  tabla:        string
  registroId:   string
  motivo?:      string
  valorAnterior?: Record<string, unknown>
  valorNuevo?:    Record<string, unknown>
}

export async function registrarEvento({
  supabase, empresaId, usuarioId, accion, tabla, registroId, motivo, valorAnterior, valorNuevo,
}: RegistrarEventoParams): Promise<void> {
  await supabase.from('auditoria_eventos').insert({
    empresa_id:      empresaId,
    usuario_id:      usuarioId,
    accion,
    tabla,
    registro_id:     registroId,
    motivo:          motivo ?? null,
    valor_anterior:  valorAnterior ?? null,
    valor_nuevo:     valorNuevo ?? null,
  })
}

export async function anularRegistro({
  supabase, empresaId, usuarioId, tabla, registroId, motivo,
  valorAnterior,
}: Omit<RegistrarEventoParams, 'accion' | 'valorNuevo'>): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from(tabla)
    .update({ estado: 'anulado' })
    .eq('id', registroId)

  if (error) return { error: error.message }

  await registrarEvento({
    supabase, empresaId, usuarioId,
    accion: 'ANULACION',
    tabla, registroId, motivo,
    valorAnterior,
    valorNuevo: { estado: 'anulado' },
  })

  return { error: null }
}
