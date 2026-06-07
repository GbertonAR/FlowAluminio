/**
 * @system     FlowAluminio
 * @module     app/admin/caja/[id]/cerrar/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Cierre de caja chica con reconciliación de efectivo físico
 */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { CierreCajaForm } from '@/components/forms/cierre-caja-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CerrarCajaPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: caja } = await supabase
    .from('caja_chica')
    .select('id, estado, monto_inicial, total_gastado, fecha_apertura')
    .eq('id', id)
    .single()

  if (!caja || caja.estado !== 'abierta') notFound()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button render={<Link href="/admin/caja" />} variant="ghost" size="sm" className="h-9 w-9 p-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-semibold text-lg">Cerrar caja</h1>
          <p className="text-xs text-muted-foreground">Apertura: {caja.fecha_apertura as string}</p>
        </div>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto">
        <CierreCajaForm
          cajaId={id}
          montoInicial={caja.monto_inicial as number}
          totalGastado={caja.total_gastado as number}
        />
      </main>
    </div>
  )
}
