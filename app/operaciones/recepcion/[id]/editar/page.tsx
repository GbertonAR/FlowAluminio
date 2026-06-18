/**
 * @system     FlowAluminio
 * @module     app/operaciones/recepcion/[id]/editar/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    Edición de recepción existente
 */
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { RecepcionForm } from '@/components/forms/recepcion-form'
import {
  getRecepcionById,
  getMaestrosRecepcion,
} from '@/app/(operaciones)/recepcion/actions'
import { createClient } from '@/lib/supabase/server'

interface Props { params: Promise<{ id: string }> }

export default async function EditarRecepcionPage({ params }: Props) {
  const { id } = await params
  const [record, { clientes, proveedores, tiposChatarra, calidades }] = await Promise.all([
    getRecepcionById(id),
    getMaestrosRecepcion(),
  ])
  if (!record) redirect('/operaciones/recepcion')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = await supabase
    .from('perfiles').select('empresa_id').eq('id', user!.id).single()

  const hoy = new Date().toISOString().split('T')[0]
  const { data: mermas } = await supabase
    .from('mermas_consensuadas')
    .select('cliente_id, tipo_chatarra_id, merma_pct')
    .eq('empresa_id', perfil?.empresa_id ?? '')
    .lte('vigencia_desde', hoy)
    .or(`vigencia_hasta.is.null,vigencia_hasta.gte.${hoy}`)
    .eq('activo', true)

  const mermasPorClienteTipo: Record<string, number> = {}
  for (const m of mermas ?? []) {
    mermasPorClienteTipo[`${m.cliente_id}-${m.tipo_chatarra_id}`] = m.merma_pct
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Link href="/operaciones/recepcion" className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-semibold text-lg">Editar recepción</h1>
      </header>
      <main className="px-4 py-4 max-w-lg mx-auto pb-8">
        <RecepcionForm
          clientes={clientes}
          proveedores={proveedores}
          tiposChatarra={tiposChatarra}
          calidades={calidades}
          mermasPorClienteTipo={mermasPorClienteTipo}
          editId={id}
          initialData={{
            fecha:            record.fecha ?? undefined,
            cliente_id:       record.cliente_id ?? undefined,
            proveedor_id:     record.proveedor_id ?? '',
            tipo_chatarra_id: record.tipo_chatarra_id ?? undefined,
            calidad_id:       record.calidad_id ?? undefined,
            kg_fisicos:       record.kg_fisicos ?? undefined,
            remito:           record.remito ?? '',
            observacion:      record.observacion ?? '',
          }}
        />
      </main>
    </div>
  )
}
