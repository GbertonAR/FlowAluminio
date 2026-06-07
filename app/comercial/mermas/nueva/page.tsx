/**
 * @system     FlowAluminio
 * @module     app/comercial/mermas/nueva/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Registro de nueva merma consensuada
 */
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getMaestrosMerma } from '@/app/(comercial)/mermas/actions'
import { MermaForm } from '@/components/forms/merma-form'

export default async function NuevaMermaPage() {
  const { clientes, tiposChatarra } = await getMaestrosMerma()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button render={<Link href="/comercial/mermas" />} variant="ghost" size="sm" className="h-9 w-9 p-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">Nueva merma</h1>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto">
        <MermaForm clientes={clientes} tiposChatarra={tiposChatarra} />
      </main>
    </div>
  )
}
