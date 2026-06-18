/**
 * @system     FlowAluminio
 * @module     app/admin/cierres/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Cierres de período semanales y mensuales — listado y creación
 */
import Link from 'next/link'
import { Plus, LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/empty-state'
import { getCierres, anularCierre } from '@/app/(admin)/cierres/actions'
import { AnularButton } from '@/components/anular-button'

interface Props {
  searchParams: Promise<{ tipo?: string }>
}

const TIPO_LABEL: Record<string, string> = {
  semanal: 'Semanal',
  mensual: 'Mensual',
}

function fmtFecha(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default async function CierresPage({ searchParams }: Props) {
  const { tipo } = await searchParams
  const tipoFiltro = (tipo === 'semanal' || tipo === 'mensual') ? tipo : undefined
  const cierres = await getCierres(tipoFiltro)

  const activos  = cierres.filter((c) => c.estado === 'cerrado')
  const anulados = cierres.filter((c) => c.estado === 'anulado')

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Cierres de período</h1>
        <Button render={<Link href="/admin/cierres/nuevo" />} size="sm" className="h-9">
          <Plus className="h-4 w-4 mr-1" />
          Nuevo
        </Button>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">

        {/* Filtro tipo */}
        <div className="flex gap-2 text-sm">
          <Link
            href="/admin/cierres"
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${!tipoFiltro ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >
            Todos
          </Link>
          <Link
            href="/admin/cierres?tipo=semanal"
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${tipoFiltro === 'semanal' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >
            Semanales
          </Link>
          <Link
            href="/admin/cierres?tipo=mensual"
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${tipoFiltro === 'mensual' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}
          >
            Mensuales
          </Link>
        </div>

        {cierres.length === 0 ? (
          <EmptyState
            icon={LockKeyhole}
            title="Sin cierres"
            message="No hay cierres de período registrados"
            action={<Button render={<Link href="/admin/cierres/nuevo" />} variant="outline">Crear cierre</Button>}
          />
        ) : (
          <div className="space-y-3">
            {activos.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Activos</p>
                {activos.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="py-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-[10px]">
                            {TIPO_LABEL[c.tipo] ?? c.tipo}
                          </Badge>
                          <span className="text-sm font-medium">
                            {fmtFecha(c.periodo_desde as string)} — {fmtFecha(c.periodo_hasta as string)}
                          </span>
                        </div>
                      </div>
                      {c.observacion && (
                        <p className="text-xs text-muted-foreground">{c.observacion as string}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{(c.perfiles as unknown as { nombre: string } | null)?.nombre ?? 'Sistema'}</span>
                        <AnularButton
                          onAnular={anularCierre.bind(null, c.id)}
                          label="Reabrir"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {anulados.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Anulados</p>
                {anulados.map((c) => (
                  <Card key={c.id} className="opacity-60">
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {TIPO_LABEL[c.tipo] ?? c.tipo}
                          </Badge>
                          <span className="text-sm line-through text-muted-foreground">
                            {fmtFecha(c.periodo_desde as string)} — {fmtFecha(c.periodo_hasta as string)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
