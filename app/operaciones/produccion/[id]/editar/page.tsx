/**
 * @system     FlowAluminio
 * @module     app/operaciones/produccion/[id]/editar/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    Edición de colada existente
 */
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ProduccionForm } from '@/components/forms/produccion-form'
import { getProduccionById, getMaestrosProduccion } from '@/app/(operaciones)/produccion/actions'

interface Props { params: Promise<{ id: string }> }

export default async function EditarProduccionPage({ params }: Props) {
  const { id } = await params
  const [record, { clientes, productos, recetaVigente }] = await Promise.all([
    getProduccionById(id),
    getMaestrosProduccion(),
  ])
  if (!record) redirect('/operaciones/produccion')

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Link href="/operaciones/produccion" className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-semibold text-lg">Editar colada</h1>
      </header>
      <main className="px-4 py-4 max-w-lg mx-auto pb-8">
        <ProduccionForm
          clientes={clientes}
          productos={productos}
          recetaVigente={recetaVigente}
          editId={id}
          initialData={{
            fecha:                 record.fecha ?? undefined,
            numero_colada:         record.numero_colada ?? 1,
            cliente_destino_id:    record.cliente_destino_id ?? '',
            propietario_1ra_id:    record.propietario_1ra_id ?? '',
            propietario_2da_id:    record.propietario_2da_id ?? '',
            kg_1ra:                record.kg_1ra ?? 0,
            kg_2da:                record.kg_2da ?? 0,
            kg_tocho:              record.kg_tocho ?? 0,
            kg_escoria:            record.kg_escoria ?? 0,
            kg_remanente_recibido: record.kg_remanente_recibido ?? 0,
            kg_remanente_dejado:   record.kg_remanente_dejado ?? 0,
            producto_id:           record.producto_id ?? '',
            observaciones:         record.observaciones ?? '',
          }}
        />
      </main>
    </div>
  )
}
