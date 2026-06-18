/**
 * @system     FlowAluminio
 * @module     app/admin/comprobantes/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    Gestión documental — validar y observar comprobantes (PRD §4.3, §8.17)
 */
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/empty-state'
import { getComprobantes, validarComprobante, observarComprobante } from '@/app/(admin)/comprobantes/actions'
import { ComprobanteBtns } from '@/components/forms/comprobante-btns'

interface Props { searchParams: Promise<{ estado?: string }> }

const ESTADO_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  validado:  'Validado',
  observado: 'Observado',
  rechazado: 'Rechazado',
}

const ESTADO_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pendiente: 'outline',
  validado:  'secondary',
  observado: 'default',
  rechazado: 'destructive',
}

function fmtFecha(d: string) {
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

const FILTROS = [
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'observado', label: 'Observados' },
  { value: '',          label: 'Todos' },
]

export default async function ComprobantesPage({ searchParams }: Props) {
  const params = await searchParams
  const estadoFiltro = params.estado ?? 'pendiente'

  const comprobantes = await getComprobantes(estadoFiltro ? { estado: estadoFiltro } : undefined)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 space-y-2">
        <h1 className="font-semibold text-lg">Comprobantes</h1>
        <div className="flex gap-2">
          {FILTROS.map((f) => (
            <Button
              key={f.value}
              render={<Link href={`/admin/comprobantes${f.value ? `?estado=${f.value}` : ''}`} />}
              size="sm"
              variant={estadoFiltro === f.value ? 'default' : 'outline'}
              className="h-8 text-xs"
            >
              {f.label}
            </Button>
          ))}
        </div>
      </header>

      <main className="px-4 py-4 space-y-3 max-w-lg mx-auto">
        {comprobantes.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="Sin comprobantes"
            message={estadoFiltro ? `No hay comprobantes con estado "${ESTADO_LABEL[estadoFiltro]}"` : 'No hay comprobantes registrados'}
          />
        ) : (
          comprobantes.map((c) => {
            const activo = c.estado === 'pendiente' || c.estado === 'observado'

            return (
              <Card key={c.id}>
                <CardContent className="py-3 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium capitalize text-sm">{c.tipo?.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.entidad_tipo ?? 'sin entidad'} · {fmtFecha(c.created_at as string)}
                      </p>
                      {(c.perfiles as unknown as { nombre: string } | null)?.nombre && (
                        <p className="text-xs text-muted-foreground">
                          por {(c.perfiles as unknown as { nombre: string }).nombre}
                        </p>
                      )}
                    </div>
                    <Badge variant={ESTADO_VARIANT[c.estado ?? 'pendiente'] ?? 'outline'} className="shrink-0 text-[10px]">
                      {ESTADO_LABEL[c.estado ?? 'pendiente'] ?? c.estado}
                    </Badge>
                  </div>
                  {c.observacion && (
                    <p className="text-xs text-amber-600">{c.observacion as string}</p>
                  )}
                  {activo && (
                    <ComprobanteBtns
                      id={c.id}
                      onValidar={validarComprobante}
                      onObservar={observarComprobante}
                    />
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </main>
    </div>
  )
}
