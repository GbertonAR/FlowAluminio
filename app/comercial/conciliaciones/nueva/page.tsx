/**
 * @system     FlowAluminio
 * @module     app/comercial/conciliaciones/nueva/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Formulario para crear una nueva conciliación de período
 */
import { getClientesActivos } from '@/app/(comercial)/conciliaciones/actions'
import { NuevaConciliacionForm } from '@/components/forms/nueva-conciliacion-form'

export default async function NuevaConciliacionPage() {
  const clientes = await getClientesActivos()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <h1 className="font-semibold text-lg">Nueva conciliación</h1>
      </header>
      <main className="px-4 py-4 max-w-lg mx-auto">
        <NuevaConciliacionForm clientes={clientes} />
      </main>
    </div>
  )
}
