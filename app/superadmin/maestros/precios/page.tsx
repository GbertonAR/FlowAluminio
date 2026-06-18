/**
 * @system     FlowAluminio
 * @module     app/superadmin/maestros/precios/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    ABM Precios comerciales — tarifas por cliente y vigencia (PRD §5.2)
 */
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MaestroABM } from '@/components/superadmin/maestro-abm'
import type { FieldDef } from '@/components/superadmin/maestro-abm'
import { getPrecios, crearPrecio, actualizarPrecio, eliminarPrecio, togglePrecio, getClientes } from '@/app/(superadmin)/maestros/actions'

const TIPOS_OP = [
  { value: 'fason',  label: 'Fassón' },
  { value: 'pleno',  label: 'Pleno' },
  { value: 'mixto',  label: 'Mixto' },
]

function fmtPeso(n: unknown) {
  return Number(n).toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })
}

export default async function PreciosPage() {
  const [precios, clientes] = await Promise.all([getPrecios(), getClientes()])

  const clienteOptions = clientes
    .filter((c) => c.activo !== false)
    .map((c) => ({ value: c.id, label: c.nombre as string }))

  const CAMPOS: FieldDef[] = [
    { key: 'cliente_id',     label: 'Cliente',        type: 'select', required: true,  options: clienteOptions },
    { key: 'tipo_operacion', label: 'Tipo operación',  type: 'select', required: true,  options: TIPOS_OP },
    { key: 'precio',         label: 'Precio ($/kg)',   type: 'number', required: true,  placeholder: '0.00' },
    { key: 'vigencia_desde', label: 'Vigencia desde',  type: 'date',   required: true },
    { key: 'vigencia_hasta', label: 'Vigencia hasta',  type: 'date',   required: false, placeholder: 'Indefinido' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button render={<Link href="/superadmin/maestros" />} variant="ghost" size="sm" className="h-9 w-9 p-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-semibold text-lg leading-none">Precios comerciales</h1>
          <p className="text-[11px] text-muted-foreground">{precios.filter((p) => p.activo !== false).length} vigentes</p>
        </div>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto">
        <MaestroABM
          items={precios.map((p) => {
            const cli  = p.clientes as unknown as { nombre: string } | null
            const tipo = TIPOS_OP.find((t) => t.value === p.tipo_operacion)?.label ?? p.tipo_operacion as string
            return {
              ...p,
              _nombre:    cli?.nombre ?? '—',
              _subtitulo: `${tipo} · ${fmtPeso(p.precio)}/kg · desde ${p.vigencia_desde as string}`,
            }
          })}
          campos={CAMPOS}
          onCrear={crearPrecio}
          onActualizar={actualizarPrecio}
          onToggle={togglePrecio}
          onEliminar={eliminarPrecio}
          labelNuevo="Nuevo precio"
        />
      </main>
    </div>
  )
}
