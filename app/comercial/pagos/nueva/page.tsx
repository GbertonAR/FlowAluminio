/**
 * @system     FlowAluminio
 * @module     app/comercial/pagos/nueva/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    Registro de nuevo pago de chatarra a proveedor (PRD §8.19)
 */
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getMaestrosPago } from '@/app/(comercial)/pagos/actions'
import { PagoForm } from '@/components/forms/pago-form'

export default async function NuevoPagoPage() {
  const { proveedores } = await getMaestrosPago()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button render={<Link href="/comercial/pagos" />} variant="ghost" size="sm" className="h-9 w-9 p-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">Nuevo pago</h1>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto">
        <PagoForm proveedores={proveedores} />
      </main>
    </div>
  )
}
