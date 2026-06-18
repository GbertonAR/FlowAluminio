/**
 * @system     FlowAluminio
 * @module     app/admin/cobros/[id]/editar/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    Edición de cobro existente
 */
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CobroForm } from '@/components/forms/cobro-form'
import { getCobroById, getMaestrosCobro } from '@/app/(admin)/cobros/actions'

interface Props { params: Promise<{ id: string }> }

export default async function EditarCobroPage({ params }: Props) {
  const { id } = await params
  const [record, { clientes }] = await Promise.all([
    getCobroById(id),
    getMaestrosCobro(),
  ])
  if (!record) redirect('/admin/cobros')

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Link href="/admin/cobros" className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-semibold text-lg">Editar cobro</h1>
      </header>
      <main className="px-4 py-4 max-w-lg mx-auto pb-8">
        <CobroForm
          clientes={clientes}
          editId={id}
          initialData={{
            fecha:         record.fecha ?? undefined,
            cliente_id:    record.cliente_id ?? '',
            importe:       record.importe ?? undefined,
            medio_pago_id: record.medio_pago_id ?? '',
            observacion:   record.observacion ?? '',
          }}
        />
      </main>
    </div>
  )
}
