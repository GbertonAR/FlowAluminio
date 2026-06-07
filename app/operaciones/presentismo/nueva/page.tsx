/**
 * @system     FlowAluminio
 * @module     app/operaciones/presentismo/nueva/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Página registro de presentismo — mobile-first
 */
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { PresentismoForm } from '@/components/forms/presentismo-form'
import { getEmpleados } from '@/app/(operaciones)/presentismo/actions'

interface Props {
  searchParams: Promise<{ empleado_id?: string }>
}

export default async function NuevoPresentismoPage({ searchParams }: Props) {
  const [empleados, params] = await Promise.all([getEmpleados(), searchParams])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Link href="/operaciones/presentismo" className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-semibold text-lg">Registrar presentismo</h1>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto pb-8">
        <PresentismoForm
          empleados={empleados}
          empleadoPreseleccionado={params.empleado_id}
        />
      </main>
    </div>
  )
}
