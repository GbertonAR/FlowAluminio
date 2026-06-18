/**
 * @system     FlowAluminio
 * @module     app/superadmin/maestros/empleados/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    ABM Empleados — personal activo de la planta (PRD §6.1)
 */
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MaestroABM } from '@/components/superadmin/maestro-abm'
import type { FieldDef } from '@/components/superadmin/maestro-abm'
import {
  getEmpleadosMaestros, crearEmpleado, actualizarEmpleado, toggleEmpleado,
} from '@/app/(superadmin)/maestros/actions'

const CAMPOS: FieldDef[] = [
  { key: 'nombre',     label: 'Nombre completo', type: 'text', required: true,  placeholder: 'Apellido, Nombre' },
  { key: 'fecha_alta', label: 'Fecha de alta',   type: 'date', required: true },
]

function fmtFecha(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function EmpleadosPage() {
  const empleados = await getEmpleadosMaestros()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button render={<Link href="/superadmin/maestros" />} variant="ghost" size="sm" className="h-9 w-9 p-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-semibold text-lg leading-none">Empleados</h1>
          <p className="text-[11px] text-muted-foreground">{empleados.filter((e) => e.activo !== false).length} activos</p>
        </div>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto">
        <MaestroABM
          items={empleados}
          campos={CAMPOS}
          getNombre={(item) => item.nombre as string}
          getSubtitulo={(item) => item.fecha_alta ? `Alta: ${fmtFecha(item.fecha_alta as string)}` : undefined}
          onCrear={crearEmpleado}
          onActualizar={actualizarEmpleado}
          onToggle={toggleEmpleado}
          labelNuevo="Nuevo empleado"
        />
      </main>
    </div>
  )
}
