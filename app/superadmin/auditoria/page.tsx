/**
 * @system     FlowAluminio
 * @module     app/superadmin/auditoria/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Registro de auditoría con filtros por tabla, acción y fecha — solo superadmin
 */
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getEventosAuditoria } from '@/app/(superadmin)/auditoria/actions'

const ACCION_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  CREACION:    'secondary',
  MODIFICACION: 'outline',
  ANULACION:   'destructive',
  CIERRE:      'default',
  APROBACION:  'secondary',
}

interface Props {
  searchParams: Promise<{ tabla?: string; accion?: string; desde?: string; hasta?: string }>
}

const TABLAS = ['recepciones', 'despachos', 'producciones_coladas', 'presentismo', 'gastos', 'cobros', 'caja_chica', 'liquidaciones']
const ACCIONES = ['CREACION', 'MODIFICACION', 'ANULACION', 'CIERRE', 'APROBACION']

export default async function AuditoriaPage({ searchParams }: Props) {
  const params = await searchParams

  const hoy         = new Date()
  const primeroMes  = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  const defaultDesde = params.desde ?? primeroMes.toISOString().split('T')[0]
  const defaultHasta = params.hasta ?? hoy.toISOString().split('T')[0]

  const eventos = await getEventosAuditoria({
    tabla:  params.tabla,
    accion: params.accion,
    desde:  defaultDesde,
    hasta:  defaultHasta,
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <h1 className="font-semibold text-lg">Auditoría</h1>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">

        {/* Filtros */}
        <form className="grid grid-cols-2 gap-2 text-sm">
          <select
            name="tabla"
            defaultValue={params.tabla ?? ''}
            className="h-10 rounded-md border bg-background px-2 text-sm"
          >
            <option value="">Todas las tablas</option>
            {TABLAS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            name="accion"
            defaultValue={params.accion ?? ''}
            className="h-10 rounded-md border bg-background px-2 text-sm"
          >
            <option value="">Todas las acciones</option>
            {ACCIONES.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <input
            name="desde"
            type="date"
            defaultValue={defaultDesde}
            className="h-10 rounded-md border bg-background px-2 text-sm col-span-1"
          />
          <input
            name="hasta"
            type="date"
            defaultValue={defaultHasta}
            className="h-10 rounded-md border bg-background px-2 text-sm col-span-1"
          />
          <button
            type="submit"
            className="col-span-2 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium"
          >
            Filtrar
          </button>
        </form>

        <p className="text-xs text-muted-foreground px-1">{eventos.length} evento{eventos.length !== 1 ? 's' : ''}</p>

        {eventos.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Sin eventos para los filtros seleccionados</p>
          </div>
        ) : (
          <div className="space-y-2">
            {eventos.map((e) => (
              <Card key={e.id}>
                <CardContent className="py-3 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant={ACCION_VARIANT[e.accion] ?? 'outline'} className="text-[10px] shrink-0">
                        {e.accion}
                      </Badge>
                      <span className="text-sm font-medium truncate">{e.tabla}</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(e.created_at as string).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <span>
                      {(e.perfiles as unknown as { nombre: string } | null)?.nombre ?? 'Sistema'}
                    </span>
                    {e.motivo && <span className="truncate">· {e.motivo as string}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    ID: {(e.registro_id as string)?.slice(0, 8)}…
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
