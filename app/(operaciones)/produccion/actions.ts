/**
 * @system     FlowAluminio
 * @module     app/(operaciones)/produccion/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Server Actions para producción / colada — incluye cálculos de rendimiento
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { produccionSchema, type ProduccionFormData } from '@/lib/validations/produccion'
import { calcularColada } from '@/lib/calculations/produccion'
import { anularRegistro } from '@/lib/auditoria'
import type { ActionResult } from '@/types'

export async function crearProduccion(
  data: ProduccionFormData
): Promise<ActionResult<{ id: string }>> {
  const parsed = produccionSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('empresa_id, planta_id')
    .eq('id', user.id)
    .single()

  if (!perfil?.empresa_id) return { success: false, error: 'Perfil sin empresa asignada' }

  const d = parsed.data
  const calc = calcularColada({
    kg1ra: d.kg_1ra,
    kg2da: d.kg_2da,
    kgTocho: d.kg_tocho,
    kgEscoria: d.kg_escoria,
    kgRemanenteRecibido: d.kg_remanente_recibido,
    kgRemanenteEntregado: d.kg_remanente_dejado,
  })

  const { data: produccion, error } = await supabase
    .from('producciones_coladas')
    .insert({
      empresa_id: perfil.empresa_id,
      planta_id: perfil.planta_id,
      fecha: d.fecha,
      numero_colada: d.numero_colada,
      cliente_destino_id: d.cliente_destino_id,
      propietario_1ra_id: d.propietario_1ra_id || d.cliente_destino_id,
      propietario_2da_id: d.propietario_2da_id || d.cliente_destino_id,
      kg_1ra: d.kg_1ra,
      kg_2da: d.kg_2da,
      kg_tocho: d.kg_tocho,
      kg_escoria: d.kg_escoria,
      kg_remanente_recibido: d.kg_remanente_recibido,
      kg_remanente_dejado: d.kg_remanente_dejado,
      kg_chatarra_total: calc.kgChatarraTotal,
      kg_metal_disponible: calc.kgMetalDisponible,
      kg_volatilizado: calc.kgVolatilizado,
      escoria_pct: calc.escoriaPct,
      volatilizacion_pct: calc.volatilizacionPct,
      rendimiento_pct: calc.rendimientoPct,
      merma_productiva_pct: calc.mermaProductivaPct,
      mix_1ra_pct: calc.mix1raPct,
      mix_2da_pct: calc.mix2daPct,
      producto_id: d.producto_id || null,
      observaciones: d.observaciones || null,
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  revalidatePath('/operaciones/produccion')
  revalidatePath('/dashboard/operaciones')
  revalidatePath('/dashboard/comercial')

  return { success: true, data: { id: produccion.id } }
}

export async function getProduccionesDelDia(fecha: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: perfil } = await supabase
    .from('perfiles').select('empresa_id').eq('id', user.id).single()

  if (!perfil?.empresa_id) return []

  const { data } = await supabase
    .from('producciones_coladas')
    .select(`
      id, fecha, numero_colada,
      kg_tocho, kg_escoria, kg_volatilizado,
      rendimiento_pct, merma_productiva_pct,
      mix_1ra_pct, mix_2da_pct,
      clientes!cliente_destino_id(nombre)
    `)
    .eq('empresa_id', perfil.empresa_id)
    .eq('fecha', fecha)
    .neq('estado', 'anulado')
    .order('numero_colada')

  return data ?? []
}

export async function getMaestrosProduccion() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { clientes: [], productos: [], recetaVigente: null }

  const { data: perfil } = await supabase
    .from('perfiles').select('empresa_id').eq('id', user.id).single()

  if (!perfil?.empresa_id) return { clientes: [], productos: [], recetaVigente: null }

  const eid = perfil.empresa_id
  const hoy = new Date().toISOString().split('T')[0]

  const [clientes, productos, receta] = await Promise.all([
    supabase.from('clientes').select('id, nombre').eq('empresa_id', eid).eq('activo', true).order('nombre'),
    supabase.from('productos').select('id, nombre').eq('empresa_id', eid).eq('activo', true).order('nombre'),
    supabase.from('recetas_produccion')
      .select('mix_1ra_pct, mix_2da_pct')
      .eq('empresa_id', eid)
      .lte('vigencia_desde', hoy)
      .or(`vigencia_hasta.is.null,vigencia_hasta.gte.${hoy}`)
      .eq('activo', true)
      .order('vigencia_desde', { ascending: false })
      .limit(1)
      .single(),
  ])

  return {
    clientes: clientes.data ?? [],
    productos: productos.data ?? [],
    recetaVigente: receta.data ?? null,
  }
}

export async function anularProduccion(id: string, motivo: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'No autenticado' }

  const { data: perfil } = await supabase.from('perfiles').select('empresa_id').eq('id', user.id).single()
  if (!perfil?.empresa_id) return { success: false, error: 'Perfil sin empresa' }

  const { data: registro } = await supabase.from('producciones_coladas').select('*').eq('id', id).single()

  const { error } = await anularRegistro({
    supabase, empresaId: perfil.empresa_id, usuarioId: user.id,
    tabla: 'producciones_coladas', registroId: id, motivo,
    valorAnterior: registro ?? undefined,
  })

  if (error) return { success: false, error }

  revalidatePath('/operaciones/produccion')
  revalidatePath('/dashboard/operaciones')
  return { success: true }
}
