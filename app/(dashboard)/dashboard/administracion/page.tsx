/**
 * @system     FlowAluminio
 * @module     app/(dashboard)/dashboard/administracion/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Dashboard Administración — KPIs del mes: gastos, cobros, caja, liquidaciones
 */
import Link from 'next/link'
import { Receipt, DollarSign, Wallet, Users, AlertCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserChip } from '@/components/user-chip'
import { Card, CardContent } from '@/components/ui/card'
import { getGastos } from '@/app/(admin)/gastos/actions'
import { getCobros } from '@/app/(admin)/cobros/actions'
import { getCajaAbierta } from '@/app/(admin)/caja/actions'
import { getLiquidaciones } from '@/app/(admin)/liquidaciones/actions'
import { contarComprobantes } from '@/app/(admin)/comprobantes/actions'

function fmtPeso(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })
}

export default async function DashboardAdminPage() {
  const hoy = new Date().toISOString().split('T')[0]
  const mes  = hoy.slice(0, 7)

  const [gastosHoy, cobrosMes, cajaAbierta, liquidaciones, conteoComp] = await Promise.all([
    getGastos(hoy),
    getCobros(mes),
    getCajaAbierta(),
    getLiquidaciones(),
    contarComprobantes(),
  ])

  const totalGastosHoy   = gastosHoy.reduce((s, g) => s + (g.importe ?? 0), 0)
  const totalCobrosMes   = cobrosMes.reduce((s, c) => s + (c.importe ?? 0), 0)
  const liquidPendientes = liquidaciones.filter((l) => l.estado === 'borrador').length

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg">Administración</h1>
          <UserChip />
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">

        {conteoComp.pendientes > 0 && (
          <Link
            href="/admin/comprobantes?estado=pendiente"
            className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 px-4 py-3"
          >
            <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                {conteoComp.pendientes} comprobante{conteoComp.pendientes === 1 ? '' : 's'} sin validar
                {conteoComp.observados > 0 ? ` · ${conteoComp.observados} observado${conteoComp.observados === 1 ? '' : 's'}` : ''}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500">Tocar para revisar</p>
            </div>
            <ChevronRight className="h-4 w-4 text-amber-500 shrink-0" />
          </Link>
        )}

        {liquidPendientes > 0 && (
          <Link
            href="/admin/liquidaciones"
            className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/20 px-4 py-3"
          >
            <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                {liquidPendientes} liquidaci{liquidPendientes === 1 ? 'ón pendiente' : 'ones pendientes'}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-500">Tocar para revisar</p>
            </div>
            <ChevronRight className="h-4 w-4 text-orange-500 shrink-0" />
          </Link>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Gastos hoy</p>
              <p className="text-xl font-bold text-destructive">{fmtPeso(totalGastosHoy)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Cobros {mes}</p>
              <p className="text-xl font-bold text-green-600">{fmtPeso(totalCobrosMes)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Caja disponible</p>
              <p className="text-xl font-bold">
                {cajaAbierta
                  ? fmtPeso((cajaAbierta.monto_inicial as number) - (cajaAbierta.total_gastado as number))
                  : '—'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Liquid. pendientes</p>
              <p className={`text-2xl font-bold ${liquidPendientes > 0 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                {liquidPendientes}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button render={<Link href="/admin/gastos/nueva" />} variant="outline" className="h-16 flex-col gap-1">
            <Receipt className="h-5 w-5" />
            <span className="text-xs">Nuevo gasto</span>
          </Button>
          <Button render={<Link href="/admin/cobros/nueva" />} variant="outline" className="h-16 flex-col gap-1">
            <DollarSign className="h-5 w-5" />
            <span className="text-xs">Nuevo cobro</span>
          </Button>
          <Button render={<Link href="/admin/caja" />} variant="outline" className="h-16 flex-col gap-1">
            <Wallet className="h-5 w-5" />
            <span className="text-xs">Caja chica</span>
          </Button>
          <Button render={<Link href="/admin/liquidaciones/nueva" />} variant="outline" className="h-16 flex-col gap-1">
            <Users className="h-5 w-5" />
            <span className="text-xs">Liquidar</span>
          </Button>
        </div>
      </main>
    </div>
  )
}
