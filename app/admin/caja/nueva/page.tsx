/**
 * @system     FlowAluminio
 * @module     app/admin/caja/nueva/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Apertura de nueva caja chica
 */
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CajaForm } from '@/components/forms/caja-form'

export default function NuevaCajaPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button render={<Link href="/admin/caja" />} variant="ghost" size="sm" className="h-9 w-9 p-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">Abrir caja</h1>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto">
        <CajaForm />
      </main>
    </div>
  )
}
