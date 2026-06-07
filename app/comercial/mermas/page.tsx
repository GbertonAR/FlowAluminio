/**
 * @system     FlowAluminio
 * @module     app/comercial/mermas/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Listado de mermas consensuadas vigentes por cliente
 */
import Link from 'next/link'
import { Plus, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/empty-state'
import { getMermasVigentes } from '@/app/(comercial)/mermas/actions'

export default async function MermasPage() {
  const mermas = await getMermasVigentes()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Mermas consensuadas</h1>
        <Button render={<Link href="/comercial/mermas/nueva" />} size="sm" className="h-9">
          <Plus className="h-4 w-4 mr-1" />
          Nueva
        </Button>
      </header>

      <main className="px-4 py-4 space-y-3 max-w-lg mx-auto">
        {mermas.length === 0 ? (
          <EmptyState
            icon={BarChart2}
            title="Sin mermas consensuadas"
            message="Registrá los acuerdos de merma por cliente y tipo de chatarra"
            action={<Button render={<Link href="/comercial/mermas/nueva" />} variant="outline">Registrar merma</Button>}
          />
        ) : (
          mermas.map((m) => (
            <Card key={m.id}>
              <CardContent className="py-3 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">
                    {(m.clientes as unknown as { nombre: string } | null)?.nombre ?? '—'}
                  </p>
                  <Badge variant="secondary" className="text-sm font-bold">
                    {((m.merma_pct as number) * 100).toFixed(2)}%
                  </Badge>
                </div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  {(m.tipos_chatarra as unknown as { nombre: string } | null)?.nombre && (
                    <span>{(m.tipos_chatarra as unknown as { nombre: string }).nombre}</span>
                  )}
                  <span>Desde: {m.vigencia_desde as string}</span>
                  {m.vigencia_hasta && <span>Hasta: {m.vigencia_hasta as string}</span>}
                </div>
                {m.observacion && (
                  <p className="text-xs text-muted-foreground">{m.observacion as string}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  )
}
