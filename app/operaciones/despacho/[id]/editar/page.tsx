/**
 * @system     FlowAluminio
 * @module     app/operaciones/despacho/[id]/editar/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    Edición de despacho existente
 */
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { DespachoForm } from '@/components/forms/despacho-form'
import { getDespachoById, getMaestrosDespacho } from '@/app/(operaciones)/despacho/actions'

interface Props { params: Promise<{ id: string }> }

export default async function EditarDespachoPage({ params }: Props) {
  const { id } = await params
  const [record, { clientes, productos }] = await Promise.all([
    getDespachoById(id),
    getMaestrosDespacho(),
  ])
  if (!record) redirect('/operaciones/despacho')

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Link href="/operaciones/despacho" className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-semibold text-lg">Editar despacho</h1>
      </header>
      <main className="px-4 py-4 max-w-lg mx-auto pb-8">
        <DespachoForm
          clientes={clientes}
          productos={productos}
          editId={id}
          initialData={{
            fecha:          record.fecha ?? undefined,
            cliente_id:     record.cliente_id ?? undefined,
            kg_despachados: record.kg_despachados ?? undefined,
            producto_id:    record.producto_id ?? '',
            remito:         record.remito ?? '',
            observacion:    record.observacion ?? '',
          }}
        />
      </main>
    </div>
  )
}
