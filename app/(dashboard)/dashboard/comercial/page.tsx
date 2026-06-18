/**
 * @system     FlowAluminio
 * @module     app/(dashboard)/dashboard/comercial/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Dashboard Comercial — KPIs del mes: saldos, despachos pendientes de valorizar, cobros
 */
import Link from 'next/link'
import { Scale, Truck, DollarSign, RefreshCcw, AlertCircle, ChevronRight, ArrowDownLeft, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserChip } from '@/components/user-chip'
import { Card, CardContent } from '@/components/ui/card'
import { getSaldosClientes } from '@/app/(comercial)/saldos/actions'
import { getDespachosPendientes } from '@/app/(comercial)/valorizacion/actions'
import { getCobros } from '@/app/(admin)/cobros/actions'
import { getPagos } from '@/app/(comercial)/pagos/actions'
import { getConciliaciones } from '@/app/(comercial)/conciliaciones/actions'

function fmtPeso(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })
}

export default async function DashboardComercialPage() {
  const mes = new Date().toISOString().slice(0, 7)

  const [saldos, despachos, cobros, pagos, conciliaciones] = await Promise.all([
    getSaldosClientes(),
    getDespachosPendientes(mes),
    getCobros(mes),
    getPagos(mes),
    getConciliaciones(),
  ])

  const pendientesValorizar     = despachos.filter((d) => !d.valorizado).length
  const totalKgSaldo            = saldos.reduce((s, c) => s + c.kgSaldo, 0)
  const totalACobrar            = saldos.reduce((s, c) => s + c.saldoFinanciero, 0)
  const totalCobradoMes         = cobros.reduce((s, c) => s + (c.importe ?? 0), 0)
  const totalPagadoMes          = pagos.reduce((s, p) => s + (p.importe ?? 0), 0)
  const conciliacionesPendientes = conciliaciones.filter((c) => c.estado !== 'cerrada' && c.estado !== 'anulada').length

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg">Comercial</h1>
          <UserChip />
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">

        {pendientesValorizar > 0 && (
          <Link
            href="/comercial/despachos"
            className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900/40 dark:bg-orange-950/20 px-4 py-3"
          >
            <AlertCircle className="h-4 w-4 text-orange-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                {pendientesValorizar} despacho{pendientesValorizar === 1 ? '' : 's'} sin valorizar
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-500">Tocar para valorizar</p>
            </div>
            <ChevronRight className="h-4 w-4 text-orange-500 shrink-0" />
          </Link>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Saldo físico total</p>
              <p className="text-2xl font-bold">{totalKgSaldo.toFixed(0)} kg</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">A cobrar</p>
              <p className="text-xl font-bold text-green-600">{fmtPeso(totalACobrar)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Sin valorizar ({mes})</p>
              <p className={`text-2xl font-bold ${pendientesValorizar > 0 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                {pendientesValorizar}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Cobrado este mes</p>
              <p className="text-xl font-bold">{fmtPeso(totalCobradoMes)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Pagado este mes</p>
              <p className="text-xl font-bold text-destructive">{fmtPeso(totalPagadoMes)}</p>
            </CardContent>
          </Card>
          <Card className={conciliacionesPendientes > 0 ? 'border-amber-500/50' : ''}>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Concil. pendientes</p>
              <p className={`text-2xl font-bold ${conciliacionesPendientes > 0 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                {conciliacionesPendientes}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button render={<Link href="/comercial/saldos" />} variant="outline" className="h-16 flex-col gap-1">
            <Scale className="h-5 w-5" />
            <span className="text-xs">Saldos</span>
          </Button>
          <Button render={<Link href="/comercial/despachos" />} variant="outline" className="h-16 flex-col gap-1">
            <Truck className="h-5 w-5" />
            <span className="text-xs">Valorizar</span>
          </Button>
          <Button render={<Link href="/admin/cobros/nueva" />} variant="outline" className="h-16 flex-col gap-1">
            <DollarSign className="h-5 w-5" />
            <span className="text-xs">Registrar cobro</span>
          </Button>
          <Button render={<Link href="/comercial/pagos/nueva" />} variant="outline" className="h-16 flex-col gap-1">
            <ArrowDownLeft className="h-5 w-5" />
            <span className="text-xs">Registrar pago</span>
          </Button>
          <Button render={<Link href="/comercial/conciliaciones" />} variant="outline" className="h-16 flex-col gap-1">
            <RefreshCcw className="h-5 w-5" />
            <span className="text-xs">Conciliar</span>
          </Button>
          <Button render={<Link href="/comercial/margenes" />} variant="outline" className="h-16 flex-col gap-1">
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs">Márgenes</span>
          </Button>
        </div>
      </main>
    </div>
  )
}
