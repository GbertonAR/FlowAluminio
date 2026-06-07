/**
 * @system     FlowAluminio
 * @module     app/operaciones/presentismo/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Listado de presentismo del día — mobile-first
 */
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import { EmptyState } from '@/components/empty-state'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { SelectorFecha } from '@/components/selector-fecha'
import { getPresentismoDelDia, getEmpleados } from '@/app/(operaciones)/presentismo/actions'

const ESTADO_BADGE: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  presente:   'secondary',
  medio_dia:  'secondary',
  ausente:    'destructive',
  franco:     'outline',
  feriado:    'outline',
  licencia:   'outline',
  vacaciones: 'outline',
}

const ESTADO_LABEL: Record<string, string> = {
  presente:   'Presente',
  medio_dia:  'Medio día',
  ausente:    'Ausente',
  franco:     'Franco',
  feriado:    'Feriado',
  licencia:   'Licencia',
  vacaciones: 'Vacaciones',
}

interface Props { searchParams: Promise<{ fecha?: string }> }

export default async function PresentismoListPage({ searchParams }: Props) {
  const hoy    = new Date().toISOString().split('T')[0]
  const params = await searchParams
  const fecha  = params.fecha ?? hoy
  const [registros, empleados] = await Promise.all([
    getPresentismoDelDia(fecha),
    getEmpleados(),
  ])

  const registradosIds = new Set(registros.map((r) => (r as { empleado_id: string }).empleado_id))
  const sinRegistrar = empleados.filter((e) => !registradosIds.has(e.id))

  const presentes = registros.filter((r) => r.estado === 'presente' || r.estado === 'medio_dia').length
  const ausentes  = registros.filter((r) => r.estado === 'ausente').length

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg">Presentismo</h1>
          <Button render={<Link href={`/operaciones/presentismo/nueva`} />} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            Registrar
          </Button>
        </div>
        <SelectorFecha fecha={fecha} />
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <div className="grid grid-cols-3 gap-2">
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Presentes</p>
              <p className="text-2xl font-bold text-green-600">{presentes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Ausentes</p>
              <p className="text-2xl font-bold text-destructive">{ausentes}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Sin registrar</p>
              <p className="text-2xl font-bold text-muted-foreground">{sinRegistrar.length}</p>
            </CardContent>
          </Card>
        </div>

        {registros.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
              Registrados hoy
            </p>
            {registros.map((r) => (
              <Card key={r.id}>
                <CardContent className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {(r.empleados as unknown as { nombre: string } | null)?.nombre ?? '—'}
                    </p>
                    {r.horas_extra ? (
                      <p className="text-xs text-muted-foreground">+{r.horas_extra}h extra</p>
                    ) : null}
                  </div>
                  <Badge variant={ESTADO_BADGE[r.estado] ?? 'outline'}>
                    {ESTADO_LABEL[r.estado] ?? r.estado}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {sinRegistrar.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
              Sin registrar
            </p>
            {sinRegistrar.map((e) => (
              <Card key={e.id} className="border-dashed">
                <CardContent className="py-3 flex items-center justify-between gap-2">
                  <p className="text-muted-foreground">{e.nombre}</p>
                  <Button
                    render={<Link href={`/operaciones/presentismo/nueva?empleado_id=${e.id}`} />}
                    size="sm" variant="outline" className="h-8 text-xs"
                  >
                    Registrar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {registros.length === 0 && sinRegistrar.length === 0 && (
          <EmptyState
            icon={Users}
            title="Sin empleados activos"
            message="No hay empleados configurados en el sistema"
          />
        )}
      </main>
    </div>
  )
}
