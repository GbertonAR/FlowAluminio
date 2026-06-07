/**
 * @system     FlowAluminio
 * @module     app/admin/cobros/nueva/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Registro de nuevo cobro a cliente
 */
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getMaestrosCobro } from '@/app/(admin)/cobros/actions'
import { CobroForm } from '@/components/forms/cobro-form'

export default async function NuevoCobroPage() {
  const { clientes } = await getMaestrosCobro()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button render={<Link href="/admin/cobros" />} variant="ghost" size="sm" className="h-9 w-9 p-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">Nuevo cobro</h1>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto">
        <CobroForm clientes={clientes} />
      </main>
    </div>
  )
}
