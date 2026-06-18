/**
 * @system     FlowAluminio
 * @module     app/superadmin/maestros/clientes/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    ABM Clientes — alta, baja y modificación de clientes (PRD §3.1)
 */
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MaestroABM } from '@/components/superadmin/maestro-abm'
import type { FieldDef } from '@/components/superadmin/maestro-abm'
import {
  getClientes, crearCliente, actualizarCliente, toggleCliente,
} from '@/app/(superadmin)/maestros/actions'

const TIPOS_CLIENTE: { value: string; label: string }[] = [
  { value: 'cliente',            label: 'Cliente' },
  { value: 'proveedor_cliente',  label: 'Proveedor / Cliente' },
  { value: 'interno',            label: 'Interno' },
]

const CAMPOS: FieldDef[] = [
  { key: 'nombre',        label: 'Nombre',         type: 'text',   required: true,  placeholder: 'Ej: Metalsan SA' },
  { key: 'tipo',          label: 'Tipo',            type: 'select', required: true,  options: TIPOS_CLIENTE },
  { key: 'observaciones', label: 'Observaciones',   type: 'text',   required: false, placeholder: 'Opcional' },
]

export default async function ClientesPage() {
  const clientes = await getClientes()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button render={<Link href="/superadmin/maestros" />} variant="ghost" size="sm" className="h-9 w-9 p-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-semibold text-lg leading-none">Clientes</h1>
          <p className="text-[11px] text-muted-foreground">{clientes.filter((c) => c.activo !== false).length} activos</p>
        </div>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto">
        <MaestroABM
          items={clientes}
          campos={CAMPOS}
          getNombre={(item) => item.nombre as string}
          getSubtitulo={(item) => {
            const tipo = item.tipo as string
            return TIPOS_CLIENTE.find((t) => t.value === tipo)?.label ?? tipo
          }}
          onCrear={crearCliente}
          onActualizar={actualizarCliente}
          onToggle={toggleCliente}
          labelNuevo="Nuevo cliente"
        />
      </main>
    </div>
  )
}
