/**
 * @system     FlowAluminio
 * @module     app/(dashboard)/dashboard/superadmin/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Dashboard Superadmin — KPIs del sistema y accesos rápidos
 */
import Link from 'next/link'
import { ScrollText, Users, Settings, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserChip } from '@/components/user-chip'
import { getEstadisticasSistema } from '@/app/(superadmin)/auditoria/actions'

export default async function SuperadminDashboardPage() {
  const stats = await getEstadisticasSistema()

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
