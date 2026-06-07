/**
 * @system     FlowAluminio
 * @module     app/admin/gastos/nueva/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Registro de nuevo gasto con comprobante fotográfico
 */
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getMaestrosGasto } from '@/app/(admin)/gastos/actions'
import { GastoForm } from '@/components/forms/gasto-form'

export default async function NuevoGastoPage() {
  const { categorias, proveedores, cajaAbierta } = await getMaestrosGasto()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button render={<Link href="/admin/gastos" />} variant="ghost" size="sm" className="h-9 w-9 p-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">Nuevo gasto</h1>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto">
        <GastoForm
          categorias={categorias}
          proveedores={proveedores}
          cajaAbierta={cajaAbierta}
        />
      </main>
    </div>
  )
}
