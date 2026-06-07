/**
 * @system     FlowAluminio
 * @module     app/comercial/despachos/[id]/valorizar/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Valorización de un despacho específico
 */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getDespachoConValorizacion } from '@/app/(comercial)/valorizacion/actions'
import { ValorizacionForm } from '@/components/forms/valorizacion-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ValorizarDespachoPage({ params }: Props) {
  const { id } = await params
  const { despacho, valorizacion } = await getDespachoConValorizacion(id)

  if (!despacho) notFound()

  const clienteNombre = (despacho.clientes as unknown as { nombre: string } | null)?.nombre ?? '—'

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <Button render={<Link href="/comercial/despachos" />} variant="ghost" size="sm" className="h-9 w-9 p-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">Valorizar despacho</h1>
      </header>

      <main className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {valorizacion ? (
          <Card className="bg-muted/50">
            <CardContent className="py-3 space-y-2">
              <p className="text-sm font-medium">Ya valorizado</p>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tipo: <strong>{valorizacion.tipo_operacion}</strong></span>
                <span className="text-muted-foreground">Precio: <strong>${(valorizacion.precio as number).toFixed(2)}/kg</strong></span>
              </div>
              <p className="text-2xl font-bold">
                ${(valorizacion.importe as number).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
              {valorizacion.condicion_comercial && (
                <p className="text-xs text-muted-foreground">{valorizacion.condicion_comercial as string}</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <ValorizacionForm
            despachoId={id}
            kgDespachados={despacho.kg_despachados ?? 0}
            clienteNombre={clienteNombre}
            fecha={despacho.fecha ?? ''}
          />
        )}
      </main>
    </div>
  )
}
