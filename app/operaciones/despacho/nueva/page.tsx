/**
 * @system     FlowAluminio
 * @module     app/operaciones/despacho/nueva/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Página nuevo despacho — mobile-first
 */
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { DespachoForm } from '@/components/forms/despacho-form'
import { getMaestrosDespacho } from '@/app/(operaciones)/despacho/actions'

export default async function NuevoDespachoPage() {
  const { clientes, productos } = await getMaestrosDespacho()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Link href="/operaciones/despacho" className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-semibold text-lg">Nuevo despacho</h1>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto pb-8">
        <DespachoForm clientes={clientes} productos={productos} />
      </main>
    </div>
  )
}
