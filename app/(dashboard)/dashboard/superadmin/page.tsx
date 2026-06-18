/**
 * @system     FlowAluminio
 * @module     app/(dashboard)/dashboard/superadmin/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Dashboard Superadmin — KPIs del sistema y accesos rápidos
 */
import Link from 'next/link'
import { ScrollText, Users, Settings, AlertTriangle, Bell, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserChip } from '@/components/user-chip'
import { getEstadisticasSistema, getCambiosSensibles, getAlertasSistema } from '@/app/(superadmin)/auditoria/actions'

export default async function SuperadminDashboardPage() {
  const [stats, cambiosSensibles, alertas] = await Promise.all([
    getEstadisticasSistema(),
    getCambiosSensibles(),
    getAlertasSistema(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg">Superadmin</h1>
          <UserChip />
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-xs text-muted-foreground">Usuarios activos</p>
              <p className="text-3xl font-bold">{stats.totalUsuarios}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <p className="text-xs text-muted-foreground">Eventos hoy</p>
              <p className="text-3xl font-bold">{stats.eventosHoy}</p>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardContent className="py-3 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Anulaciones este mes</p>
                <p className="text-xl font-bold">{stats.anulacionesMes}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tablas más activas */}
        {stats.tablaTop.length > 0 && (
          <Card>
            <CardContent className="py-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tablas más activas este mes</p>
              {stats.tablaTop.map(({ tabla, count }) => (
                <div key={tabla} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-xs">{tabla}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Usuarios por rol */}
        {Object.keys(stats.usuariosPorRol).length > 0 && (
          <Card>
            <CardContent className="py-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Users className="h-3 w-3" />
                Usuarios activos por rol
              </p>
              {Object.entries(stats.usuariosPorRol).map(([rol, count]) => (
                <div key={rol} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{rol.replace('_', ' ')}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Alertas del sistema */}
        {(alertas.comprobantesPendientes > 0 || alertas.cajaObservada > 0 || alertas.conciliacionesPendientes > 0) && (
          <Card className="border-amber-500/50">
            <CardContent className="py-3 space-y-2">
              <p className="text-xs font-medium text-amber-600 uppercase tracking-wide flex items-center gap-1">
                <Bell className="h-3 w-3" />
                Alertas del sistema
              </p>
              {alertas.comprobantesPendientes > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Comprobantes pendientes</span>
                  <span className="font-medium text-amber-600">{alertas.comprobantesPendientes}</span>
                </div>
              )}
              {alertas.cajaObservada > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cajas observadas</span>
                  <span className="font-medium text-amber-600">{alertas.cajaObservada}</span>
                </div>
              )}
              {alertas.conciliacionesPendientes > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Conciliaciones en revisión</span>
                  <span className="font-medium text-amber-600">{alertas.conciliacionesPendientes}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Cambios sensibles recientes */}
        {cambiosSensibles.length > 0 && (
          <Card>
            <CardContent className="py-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Cambios sensibles recientes
              </p>
              {cambiosSensibles.map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-2 text-xs">
                  <div className="min-w-0">
                    <span className="font-medium">{e.accion}</span>
                    <span className="text-muted-foreground"> · {e.tabla}</span>
                    {e.motivo && (
                      <p className="text-muted-foreground truncate">
                        {(e.perfiles as unknown as { nombre: string } | null)?.nombre ?? 'Sistema'} — {e.motivo as string}
                      </p>
                    )}
                  </div>
                  <span className="text-muted-foreground shrink-0">
                    {new Date(e.created_at as string).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Accesos rápidos */}
        <div className="grid grid-cols-1 gap-2">
          <Button
            render={<Link href="/superadmin/auditoria" />}
            nativeButton={false}
            variant="outline"
            className="h-12 justify-start gap-3"
          >
            <ScrollText className="h-5 w-5" />
            Ver registro de auditoría
          </Button>
          <Button
            render={<Link href="/superadmin/usuarios" />}
            nativeButton={false}
            variant="outline"
            className="h-12 justify-start gap-3"
          >
            <Users className="h-5 w-5" />
            Gestionar usuarios
          </Button>
          <Button
            render={<Link href="/superadmin/parametros" />}
            nativeButton={false}
            variant="outline"
            className="h-12 justify-start gap-3"
          >
            <Settings className="h-5 w-5" />
            Parámetros del sistema
          </Button>
        </div>

      </main>
    </div>
  )
}
