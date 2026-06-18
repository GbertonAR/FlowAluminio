/**
 * @system     FlowAluminio
 * @module     app/comercial/pagos/[id]/editar/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    Edición de pago existente
 */
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PagoForm } from '@/components/forms/pago-form'
import { getPagoById, getMaestrosPago } from '@/app/(comercial)/pagos/actions'

interface Props { params: Promise<{ id: string }> }

export default async function EditarPagoPage({ params }: Props) {
  const { id } = await params
  const [record, { proveedores }] = await Promise.all([
    getPagoById(id),
    getMaestrosPago(),
  ])
  if (!record) redirect('/comercial/pagos')

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Link href="/comercial/pagos" className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-semibold text-lg">Editar pago</h1>
      </header>
      <main className="px-4 py-4 max-w-lg mx-auto pb-8">
        <PagoForm
          proveedores={proveedores}
          editId={id}
          initialData={{
            fecha:         record.fecha ?? undefined,
            proveedor_id:  record.proveedor_id ?? '',
            importe:       record.importe ?? undefined,
            medio_pago_id: record.medio_pago_id ?? '',
            observacion:   record.observacion ?? '',
          }}
        />
      </main>
    </div>
  )
}
