/**
 * @system     FlowAluminio
 * @module     app/(admin)/gastos/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Gastos operativos: CRUD + upload de comprobante a Supabase Storage
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { gastoSchema } from '@/lib/validations/gasto'

export async function getGastos(fecha?: string) {
  const supabase = await createClient()
  let q = supabase
    .from('gastos')
    .select('*, categorias_gasto(nombre), proveedores(nombre)')
    .order('fecha', { ascending: false })
    .limit(50)

  if (fecha) q = q.eq('fecha', fecha)

  const { data, error } = await q
  if (error) return []
  return data
}

export async function getMaestrosGasto() {
  const supabase = await createClient()
  const [{ data: categorias }, { data: proveedores }, { data: cajaAbierta }] = await Promise.all([
    supabase.from('categorias_gasto').select('id, nombre').eq('activo', true).order('nombre'),
    supabase.from('proveedores').select('id, nombre').eq('activo', true).order('nombre'),
    supabase.from('caja_chica').select('id, fecha_apertura').eq('estado', 'abierta').maybeSingle(),
  ])
  return {
    categorias:  categorias ?? [],
    proveedores: proveedores ?? [],
    cajaAbierta,
  }
}

export async function crearGasto(formData: FormData) {
  const raw = {
    fecha:         formData.get('fecha') as string,
    categoria_id:  formData.get('categoria_id') as string,
    concepto:      formData.get('concepto') as string,
    proveedor_id:  formData.get('proveedor_id') as string,
    importe:       formData.get('importe') as string,
    medio_pago_id: formData.get('medio_pago_id') as string,
    caja_chica_id: formData.get('caja_chica_id') as string,
    observacion:   formData.get('observacion') as string,
  }

  const parsed = gastoSchema.safeParse(raw)
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Sin sesión' }

  const { data: perfil } = await supabase.from('perfiles').select('empresa_id').eq('id', user.id).single()
  if (!perfil) return { success: false, error: 'Perfil no encontrado' }

  const { data: gasto, error: errGasto } = await supabase.from('gastos').insert({
    empresa_id:    perfil.empresa_id,
    fecha:         parsed.data.fecha,
    categoria_id:  parsed.data.categoria_id || null,
    concepto:      parsed.data.concepto,
    proveedor_id:  parsed.data.proveedor_id || null,
    importe:       parsed.data.importe,
    medio_pago_id: parsed.data.medio_pago_id,
    caja_chica_id: parsed.data.caja_chica_id || null,
    observacion:   parsed.data.observacion || null,
    created_by:    user.id,
    estado:        'pendiente',
  }).select('id').single()

  if (errGasto) return { success: false, error: errGasto.message }

  // Si hay caja chica, actualizar total_gastado
  if (parsed.data.caja_chica_id) {
    const { data: caja } = await supabase.from('caja_chica').select('total_gastado').eq('id', parsed.data.caja_chica_id).single()
    if (caja) {
      await supabase.from('caja_chica').update({
        total_gastado: (caja.total_gastado ?? 0) + parsed.data.importe,
      }).eq('id', parsed.data.caja_chica_id)
    }
  }

  // Comprobante (foto)
  const archivo = formData.get('comprobante') as File | null
  if (archivo && archivo.size > 0 && gasto) {
    const ext = archivo.name.split('.').pop() ?? 'jpg'
    const path = `${perfil.empresa_id}/gastos/${gasto.id}.${ext}`
    const arrayBuffer = await archivo.arrayBuffer()

    const { error: errStorage } = await supabase.storage
      .from('comprobantes')
      .upload(path, arrayBuffer, { contentType: archivo.type, upsert: true })

    if (!errStorage) {
      await supabase.from('comprobantes').insert({
        empresa_id:   perfil.empresa_id,
        tipo:         ext === 'pdf' ? 'factura' : 'foto_manuscrita',
        storage_path: path,
        entidad_tipo: 'gasto',
        entidad_id:   gasto.id,
        uploaded_by:  user.id,
      })
    }
  }

  revalidatePath('/admin/gastos')
  return { success: true }
}
