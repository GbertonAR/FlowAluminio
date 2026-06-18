/**
 * @system     FlowAluminio
 * @module     app/superadmin/maestros/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    Hub ABM maestros — acceso centralizado a clientes, proveedores, empleados y precios
 */
import Link from 'next/link'
import { Users, Truck, HardHat, DollarSign, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { getClientes, getProveedores, getEmpleadosMaestros, getPrecios } from '@/app/(superadmin)/maestros/actions'

const SECCIONES = [
  { href: '/superadmin/maestros/clientes',   label: 'Clientes',             desc: 'Alta, baja y modificación de clientes activos',        Icon: Users },
  { href: '/superadmin/maestros/proveedores',label: 'Proveedores',          desc: 'Gestión de proveedores de chatarra y servicios',        Icon: Truck },
  { href: '/superadmin/maestros/empleados',  label: 'Empleados',            desc: 'Personal activo e inactivo de la planta',               Icon: HardHat },
  { href: '/superadmin/maestros/precios',    label: 'Precios comerciales',  desc: 'Precios de fasson / pleno por cliente y vigencia',      Icon: DollarSign },
]

export default async function MaestrosHubPage() {
  const [clientes, proveedores, empleados, precios] = await Promise.all([
    getClientes(),
    getProveedores(),
    getEmpleadosMaestros(),
    getPrecios(),
  ])

  const counts: Record<string, number> = {
    clientes:    clientes.filter((i) => i.activo !== false).length,
    proveedores: proveedores.filter((i) => i.activo !== false).length,
    empleados:   empleados.filter((i) => i.activo !== false).length,
    precios:     precios.filter((i) => i.activo !== false).length,
  }

  const keys = ['clientes', 'proveedores', 'empleados', 'precios']

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <h1 className="font-semibold text-lg">Maestros</h1>
        <p className="text-xs text-muted-foreground">Alta, Baja y Modificación de datos maestros</p>
      </header>

      <main className="px-4 py-4 space-y-3 max-w-lg mx-auto">
        {SECCIONES.map((s, idx) => (
          <Link key={s.href} href={s.href} className="block">
            <Card className="hover:bg-muted/30 transition-colors">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <s.Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">{s.label}</p>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {counts[keys[idx]]} activos
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{s.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </main>
    </div>
  )
}
