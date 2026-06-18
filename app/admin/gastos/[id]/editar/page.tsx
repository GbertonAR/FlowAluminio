/**
 * @system     FlowAluminio
 * @module     app/admin/gastos/[id]/editar/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    Edición de gasto existente (sin re-subida de comprobante)
 */
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { GastoForm } from '@/components/forms/gasto-form'
import { getGastoById, getMaestrosGasto } from '@/app/(admin)/gastos/actions'

interface Props { params: Promise<{ id: string }> }

export default async function EditarGastoPage({ params }: Props) {
  const { id } = await params
  const [record, { categorias, proveedores, cajaAbierta }] = await Promise.all([
    getGastoById(id),
    getMaestrosGasto(),
  ])
  if (!record) redirect('/admin/gastos')

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Link href="/admin/gastos" className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-semibold text-lg">Editar gasto</h1>
      </header>
      <main className="px-4 py-4 max-w-lg mx-auto pb-8">
        <GastoForm
          categorias={categorias}
          proveedores={proveedores}
          cajaAbierta={cajaAbierta}
          editId={id}
          initialData={{
            fecha:         record.fecha ?? undefined,
            categoria_id:  record.categoria_id ?? '',
            concepto:      record.concepto ?? '',
            proveedor_id:  record.proveedor_id ?? '',
            importe:       record.importe ?? undefined,
            medio_pago_id: record.medio_pago_id ?? '',
            caja_chica_id: record.caja_chica_id ?? '',
            observacion:   record.observacion ?? '',
          }}
        />
      </main>
    </div>
  )
}
