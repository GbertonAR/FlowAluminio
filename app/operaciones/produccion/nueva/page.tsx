/**
 * @system     FlowAluminio
 * @module     app/operaciones/produccion/nueva/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Página nueva colada — mobile-first
 */
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ProduccionForm } from '@/components/forms/produccion-form'
import { getMaestrosProduccion } from '@/app/(operaciones)/produccion/actions'

export default async function NuevaProduccionPage() {
  const { clientes, productos, recetaVigente } = await getMaestrosProduccion()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Link href="/operaciones/produccion" className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-semibold text-lg">Nueva colada</h1>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto pb-8">
        <ProduccionForm
          clientes={clientes}
          productos={productos}
          recetaVigente={recetaVigente}
        />
      </main>
    </div>
  )
}
