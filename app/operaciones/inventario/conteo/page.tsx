/**
 * @system     FlowAluminio
 * @module     app/operaciones/inventario/conteo/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Página conteo físico de inventario — mobile-first
 */
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { ConteoForm } from '@/components/forms/conteo-form'
import { getMaestrosInventario } from '@/app/(operaciones)/inventario/actions'

export default async function ConteoInventarioPage() {
  const { clientes, tiposChatarra, calidades } = await getMaestrosInventario()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Link href="/operaciones/inventario" className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-semibold text-lg">Conteo físico</h1>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto pb-8">
        <ConteoForm
          clientes={clientes}
          tiposChatarra={tiposChatarra}
          calidades={calidades}
        />
      </main>
    </div>
  )
}
