/**
 * @system     FlowAluminio
 * @module     app/admin/cierres/nuevo/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Formulario para crear un nuevo cierre de período
 */
import { NuevoCierreForm } from '@/components/forms/nuevo-cierre-form'

export default function NuevoCierrePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <h1 className="font-semibold text-lg">Nuevo cierre</h1>
      </header>
      <main className="px-4 py-4 max-w-lg mx-auto">
        <NuevoCierreForm />
      </main>
    </div>
  )
}
