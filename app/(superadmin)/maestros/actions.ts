/**
 * @system     FlowAluminio
 * @module     app/(superadmin)/maestros/actions.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    CRUD tablas maestras: clientes, proveedores, empleados, precios comerciales
 */
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { registrarEvento } from '@/lib/auditoria'
import type { ActionResult } from '@/types'

async function getEmpresaId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data } = await admin.from('perfiles').select('empresa_id').eq('id', user.id).single()
  return data?.empresa_id ?? null
}

async function getContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data } = await admin.from('perfiles').select('empresa_id').eq('id', user.id).single()
  if (!data?.empresa_id) return null
  return { admin, userId: user.id, empresaId: data.empresa_id }
}

// ─── CLIENTES ────────────────────────────────────────────────────────────────

export async function getClientes() {
  const admin = createAdminClient()
  const empresaId = await getEmpresaId()
  if (!empresaId) return []
  const { data } = await admin
    .from('clientes')
    .select('id, nombre, tipo, observaciones, activo')
    .eq('empresa_id', empresaId)
    .order('nombre')
  return data ?? []
}

export async function crearCliente(values: Record<string, string>): Promise<ActionResult> {
  const ctx = await getContext()
  if (!ctx) return { success: false, error: 'No autenticado' }
  const { admin, userId, empresaId } = ctx
  const { data, error } = await admin.from('clientes').insert({
    empresa_id:    empresaId,
    nombre:        values.nombre.trim(),
    tipo:          values.tipo || 'cliente',
    observaciones: values.observaciones?.trim() || null,
  }).select('id').single()
  if (error) return { success: false, error: error.message }
  await registrarEvento({ supabase: admin, empresaId, usuarioId: userId, accion: 'CREACION', tabla: 'clientes', registroId: data.id, valorNuevo: values })
  revalidatePath('/superadmin/maestros/clientes')
  return { success: true }
}

export async function actualizarCliente(id: string, values: Record<string, string>): Promise<ActionResult> {
  const ctx = await getContext()
  if (!ctx) return { success: false, error: 'No autenticado' }
  const { admin, userId, empresaId } = ctx
  const { error } = await admin.from('clientes').update({
    nombre:        values.nombre.trim(),
    tipo:          values.tipo,
    observaciones: values.observaciones?.trim() || null,
    updated_at:    new Date().toISOString(),
  }).eq('id', id)
  if (error) return { success: false, error: error.message }
  await registrarEvento({ supabase: admin, empresaId, usuarioId: userId, accion: 'MODIFICACION', tabla: 'clientes', registroId: id, valorNuevo: values })
  revalidatePath('/superadmin/maestros/clientes')
  return { success: true }
}

export async function toggleCliente(id: string, activo: boolean): Promise<ActionResult> {
  const ctx = await getContext()
  if (!ctx) return { success: false, error: 'No autenticado' }
  const { admin, userId, empresaId } = ctx
  const { error } = await admin.from('clientes').update({ activo }).eq('id', id)
  if (error) return { success: false, error: error.message }
  await registrarEvento({ supabase: admin, empresaId, usuarioId: userId, accion: 'MODIFICACION', tabla: 'clientes', registroId: id, motivo: activo ? 'Alta' : 'Baja', valorNuevo: { activo } })
  revalidatePath('/superadmin/maestros/clientes')
  return { success: true }
}

// ─── PROVEEDORES ─────────────────────────────────────────────────────────────

export async function getProveedores() {
  const admin = createAdminClient()
  const empresaId = await getEmpresaId()
  if (!empresaId) return []
  const { data } = await admin
    .from('proveedores')
    .select('id, nombre, tipo, cuit, telefono, activo')
    .eq('empresa_id', empresaId)
    .order('nombre')
  return data ?? []
}

export async function crearProveedor(values: Record<string, string>): Promise<ActionResult> {
  const ctx = await getContext()
  if (!ctx) return { success: false, error: 'No autenticado' }
  const { admin, userId, empresaId } = ctx
  const { data, error } = await admin.from('proveedores').insert({
    empresa_id: empresaId,
    nombre:     values.nombre.trim(),
    tipo:       values.tipo?.trim() || null,
    cuit:       values.cuit?.trim() || null,
    telefono:   values.telefono?.trim() || null,
  }).select('id').single()
  if (error) return { success: false, error: error.message }
  await registrarEvento({ supabase: admin, empresaId, usuarioId: userId, accion: 'CREACION', tabla: 'proveedores', registroId: data.id, valorNuevo: values })
  revalidatePath('/superadmin/maestros/proveedores')
  return { success: true }
}

export async function actualizarProveedor(id: string, values: Record<string, string>): Promise<ActionResult> {
  const ctx = await getContext()
  if (!ctx) return { success: false, error: 'No autenticado' }
  const { admin, userId, empresaId } = ctx
  const { error } = await admin.from('proveedores').update({
    nombre:   values.nombre.trim(),
    tipo:     values.tipo?.trim() || null,
    cuit:     values.cuit?.trim() || null,
    telefono: values.telefono?.trim() || null,
  }).eq('id', id)
  if (error) return { success: false, error: error.message }
  await registrarEvento({ supabase: admin, empresaId, usuarioId: userId, accion: 'MODIFICACION', tabla: 'proveedores', registroId: id, valorNuevo: values })
  revalidatePath('/superadmin/maestros/proveedores')
  return { success: true }
}

export async function toggleProveedor(id: string, activo: boolean): Promise<ActionResult> {
  const ctx = await getContext()
  if (!ctx) return { success: false, error: 'No autenticado' }
  const { admin, userId, empresaId } = ctx
  const { error } = await admin.from('proveedores').update({ activo }).eq('id', id)
  if (error) return { success: false, error: error.message }
  await registrarEvento({ supabase: admin, empresaId, usuarioId: userId, accion: 'MODIFICACION', tabla: 'proveedores', registroId: id, motivo: activo ? 'Alta' : 'Baja', valorNuevo: { activo } })
  revalidatePath('/superadmin/maestros/proveedores')
  return { success: true }
}

// ─── EMPLEADOS ────────────────────────────────────────────────────────────────

export async function getEmpleadosMaestros() {
  const admin = createAdminClient()
  const empresaId = await getEmpresaId()
  if (!empresaId) return []
  const { data } = await admin
    .from('empleados')
    .select('id, nombre, fecha_alta, activo')
    .eq('empresa_id', empresaId)
    .order('nombre')
  return data ?? []
}

export async function crearEmpleado(values: Record<string, string>): Promise<ActionResult> {
  const admin = createAdminClient()
  const empresaId = await getEmpresaId()
  if (!empresaId) return { success: false, error: 'No autenticado' }
  const { error } = await admin.from('empleados').insert({
    empresa_id: empresaId,
    nombre:     values.nombre.trim(),
    fecha_alta: values.fecha_alta,
  })
  if (error) return { success: false, error: error.message }
  revalidatePath('/superadmin/maestros/empleados')
  return { success: true }
}

export async function actualizarEmpleado(id: string, values: Record<string, string>): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin.from('empleados').update({
    nombre:     values.nombre.trim(),
    fecha_alta: values.fecha_alta,
  }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/superadmin/maestros/empleados')
  return { success: true }
}

export async function toggleEmpleado(id: string, activo: boolean): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin.from('empleados').update({ activo }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/superadmin/maestros/empleados')
  return { success: true }
}

// ─── PRECIOS COMERCIALES ──────────────────────────────────────────────────────

export async function getPrecios() {
  const admin = createAdminClient()
  const empresaId = await getEmpresaId()
  if (!empresaId) return []
  const { data } = await admin
    .from('precios_comerciales')
    .select('id, cliente_id, tipo_operacion, precio, vigencia_desde, vigencia_hasta, activo, clientes(nombre)')
    .eq('empresa_id', empresaId)
    .order('vigencia_desde', { ascending: false })
  return data ?? []
}

export async function crearPrecio(values: Record<string, string>): Promise<ActionResult> {
  const admin = createAdminClient()
  const empresaId = await getEmpresaId()
  if (!empresaId) return { success: false, error: 'No autenticado' }
  const precio = parseFloat(values.precio)
  if (isNaN(precio) || precio <= 0) return { success: false, error: 'El precio debe ser mayor a 0' }
  const { error } = await admin.from('precios_comerciales').insert({
    empresa_id:     empresaId,
    cliente_id:     values.cliente_id,
    tipo_operacion: values.tipo_operacion,
    precio,
    vigencia_desde: values.vigencia_desde,
    vigencia_hasta: values.vigencia_hasta?.trim() || null,
  })
  if (error) return { success: false, error: error.message }
  revalidatePath('/superadmin/maestros/precios')
  return { success: true }
}

export async function actualizarPrecio(id: string, values: Record<string, string>): Promise<ActionResult> {
  const admin = createAdminClient()
  const precio = parseFloat(values.precio)
  if (isNaN(precio) || precio <= 0) return { success: false, error: 'El precio debe ser mayor a 0' }
  const { error } = await admin.from('precios_comerciales').update({
    cliente_id:     values.cliente_id,
    tipo_operacion: values.tipo_operacion,
    precio,
    vigencia_desde: values.vigencia_desde,
    vigencia_hasta: values.vigencia_hasta?.trim() || null,
    updated_at:     new Date().toISOString(),
  }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/superadmin/maestros/precios')
  return { success: true }
}

export async function eliminarPrecio(id: string): Promise<ActionResult> {
  const ctx = await getContext()
  if (!ctx) return { success: false, error: 'No autenticado' }
  const { admin, userId, empresaId } = ctx
  const { error } = await admin.from('precios_comerciales').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  await registrarEvento({ supabase: admin, empresaId, usuarioId: userId, accion: 'ANULACION', tabla: 'precios_comerciales', registroId: id, motivo: 'Eliminado definitivamente' })
  revalidatePath('/superadmin/maestros/precios')
  return { success: true }
}

export async function togglePrecio(id: string, activo: boolean): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin.from('precios_comerciales').update({ activo }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/superadmin/maestros/precios')
  return { success: true }
}

// ─── CALIDADES CHATARRA (para parametros) ────────────────────────────────────

export async function getCalidades() {
  const admin = createAdminClient()
  const empresaId = await getEmpresaId()
  if (!empresaId) return []
  const { data } = await admin
    .from('calidades_chatarra')
    .select('id, nombre, orden, activo')
    .eq('empresa_id', empresaId)
    .order('orden')
  return data ?? []
}

export async function crearCalidad(nombre: string): Promise<ActionResult> {
  const admin = createAdminClient()
  const empresaId = await getEmpresaId()
  if (!empresaId) return { success: false, error: 'No autenticado' }
  const { data: last } = await admin
    .from('calidades_chatarra')
    .select('orden')
    .eq('empresa_id', empresaId)
    .order('orden', { ascending: false })
    .limit(1)
    .maybeSingle()
  const { error } = await admin.from('calidades_chatarra').insert({
    empresa_id: empresaId,
    nombre:     nombre.trim(),
    orden:      (last?.orden ?? 0) + 1,
  })
  if (error) return { success: false, error: error.message }
  revalidatePath('/superadmin/parametros')
  return { success: true }
}

export async function toggleCalidad(id: string, activo: boolean): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin.from('calidades_chatarra').update({ activo }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/superadmin/parametros')
  return { success: true }
}

// ─── PRODUCTOS (para parametros) ─────────────────────────────────────────────

export async function getProductos() {
  const admin = createAdminClient()
  const empresaId = await getEmpresaId()
  if (!empresaId) return []
  const { data } = await admin
    .from('productos')
    .select('id, nombre, activo')
    .eq('empresa_id', empresaId)
    .order('nombre')
  return data ?? []
}

export async function crearProducto(nombre: string): Promise<ActionResult> {
  const admin = createAdminClient()
  const empresaId = await getEmpresaId()
  if (!empresaId) return { success: false, error: 'No autenticado' }
  const { error } = await admin.from('productos').insert({ empresa_id: empresaId, nombre: nombre.trim() })
  if (error) return { success: false, error: error.message }
  revalidatePath('/superadmin/parametros')
  return { success: true }
}

export async function toggleProducto(id: string, activo: boolean): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin.from('productos').update({ activo }).eq('id', id)
  if (error) return { success: false, error: error.message }
  revalidatePath('/superadmin/parametros')
  return { success: true }
}
