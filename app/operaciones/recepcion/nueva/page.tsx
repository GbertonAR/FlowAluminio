/**
 * @system     FlowAluminio
 * @module     app/operaciones/recepcion/nueva/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Página nueva recepción — mobile-first, ≤6 campos obligatorios
 */
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { RecepcionForm } from '@/components/forms/recepcion-form'
import { getMaestrosRecepcion } from '@/app/(operaciones)/recepcion/actions'
import { createClient } from '@/lib/supabase/server'

export default async function NuevaRecepcionPage() {
  const { clientes, proveedores, tiposChatarra, calidades } = await getMaestrosRecepcion()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = await supabase
    .from('perfiles').select('empresa_id').eq('id', user!.id).single()

  const hoy = new Date().toISOString().split('T')[0]
  const { data: mermas } = await supabase
    .from('mermas_consensuadas')
    .select('cliente_id, tipo_chatarra_id, merma_pct')
    .eq('empresa_id', perfil?.empresa_id ?? '')
    .lte('vigencia_desde', hoy)
    .or(`vigencia_hasta.is.null,vigencia_hasta.gte.${hoy}`)
    .eq('activo', true)

  const mermasPorClienteTipo: Record<string, number> = {}
  for (const m of mermas ?? []) {
    mermasPorClienteTipo[`${m.cliente_id}-${m.tipo_chatarra_id}`] = m.merma_pct
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Link href="/operaciones/recepcion" className="p-2 -ml-2 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-semibold text-lg">Nueva recepción</h1>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto pb-8">
        <RecepcionForm
          clientes={clientes}
          proveedores={proveedores}
          tiposChatarra={tiposChatarra}
          calidades={calidades}
          mermasPorClienteTipo={mermasPorClienteTipo}
        />
      </main>
    </div>
  )
}
