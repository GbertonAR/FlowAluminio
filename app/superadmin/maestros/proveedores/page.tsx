/**
 * @system     FlowAluminio
 * @module     app/superadmin/maestros/proveedores/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    ABM Proveedores — chatarra, insumos y servicios (PRD §3.2)
 */
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MaestroABM } from '@/components/superadmin/maestro-abm'
import type { FieldDef } from '@/components/superadmin/maestro-abm'
import {
  getProveedores, crearProveedor, actualizarProveedor, toggleProveedor,
} from '@/app/(superadmin)/maestros/actions'

const CAMPOS: FieldDef[] = [
  { key: 'nombre',   label: 'Nombre',   type: 'text',   required: true,  placeholder: 'Razón social o nombre' },
  { key: 'tipo',     label: 'Tipo',     type: 'text',   required: false, placeholder: 'chatarra / servicio / insumo' },
  { key: 'cuit',     label: 'CUIT',     type: 'text',   required: false, placeholder: '20-12345678-9' },
  { key: 'telefono', label: 'Teléfono', type: 'text',   required: false, placeholder: '+54 9 ...' },
]

export default async function ProveedoresPage() {
  const proveedores = await getProveedores()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button render={<Link href="/superadmin/maestros" />} variant="ghost" size="sm" className="h-9 w-9 p-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-semibold text-lg leading-none">Proveedores</h1>
          <p className="text-[11px] text-muted-foreground">{proveedores.filter((p) => p.activo !== false).length} activos</p>
        </div>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto">
        <MaestroABM
          items={proveedores.map((p) => {
            const parts: string[] = []
            if (p.tipo)     parts.push(p.tipo as string)
            if (p.cuit)     parts.push(`CUIT: ${p.cuit}`)
            if (p.telefono) parts.push(p.telefono as string)
            return { ...p, _nombre: p.nombre as string, _subtitulo: parts.join(' · ') || undefined }
          })}
          campos={CAMPOS}
          onCrear={crearProveedor}
          onActualizar={actualizarProveedor}
          onToggle={toggleProveedor}
          labelNuevo="Nuevo proveedor"
        />
      </main>
    </div>
  )
}
