/**
 * @system     FlowAluminio
 * @module     app/comercial/conciliaciones/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @updated    2026-06-06
 * @summary    Listado de conciliaciones periódicas con clientes
 */
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getConciliaciones } from '@/app/(comercial)/conciliaciones/actions'

const ESTADO_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  borrador: 'outline',
  cerrada:  'secondary',
  anulada:  'default',
}

function fmtFecha(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default async function ConciliacionesPage() {
  const conciliaciones = await getConciliaciones()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Conciliaciones</h1>
        <Button render={<Link href="/comercial/conciliaciones/nueva" />} size="sm" className="h-9">
          <Plus className="h-4 w-4 mr-1" />
          Nueva
        </Button>
      </header>

      <main className="px-4 py-4 space-y-3 max-w-lg mx-auto">
        {conciliaciones.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Sin conciliaciones registradas</p>
            <Button render={<Link href="/comercial/conciliaciones/nueva" />} variant="outline" className="mt-4">
              Crear primera conciliación
            </Button>
          </div>
        ) : (
          conciliaciones.map((c) => (
            <Link key={c.id} href={`/comercial/conciliaciones/${c.id}`} className="block">
              <Card className="hover:bg-muted/30 transition-colors">
                <CardContent className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">
                      {(c.clientes as unknown as { nombre: string } | null)?.nombre ?? '—'}
                    </p>
                    <Badge variant={ESTADO_VARIANT[c.estado as string] ?? 'outline'} className="text-[10px]">
                      {c.estado as string}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {fmtFecha(c.periodo_desde as string)} — {fmtFecha(c.periodo_hasta as string)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </main>
    </div>
  )
}
