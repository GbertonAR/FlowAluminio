/**
 * @system     FlowAluminio
 * @module     app/comercial/margenes/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Dashboard de costos y márgenes estimados por período
 */
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getMargenesPeriodo } from '@/app/(comercial)/margenes/actions'
import { SelectorMes } from '@/components/selector-mes'

interface Props {
  searchParams: Promise<{ mes?: string }>
}

function fmtPeso(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function fmtKg(n: number) {
  return n.toFixed(0) + ' kg'
}

function pctStr(n: number | null) {
  if (n == null) return '—'
  return (n * 100).toFixed(1) + '%'
}

export default async function MargenesPage({ searchParams }: Props) {
  const { mes: mesParam } = await searchParams
  const mesActual = new Date().toISOString().slice(0, 7)
  const mes = mesParam ?? mesActual

  const datos = await getMargenesPeriodo(mes)

  const margenPositivo = datos.margenBruto >= 0
  const margenPctVal   = datos.margenPct ?? 0

  // Barra de progreso acotada a [0, 100]
  const barWidth = Math.max(0, Math.min(100, margenPctVal * 100))

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Márgenes</h1>
        <Badge variant="outline" className="text-xs">Estimado</Badge>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">

        <SelectorMes mes={mes} paramKey="mes" />

        {/* Margen bruto destacado */}
        <Card className={margenPositivo ? 'border-green-500/50' : 'border-destructive/50'}>
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground mb-1">Margen bruto estimado</p>
            <p className={`text-3xl font-bold ${margenPositivo ? 'text-green-600' : 'text-destructive'}`}>
              {fmtPeso(datos.margenBruto)}
            </p>
            <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${margenPositivo ? 'bg-green-500' : 'bg-destructive'}`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pctStr(datos.margenPct)} sobre ingresos
            </p>
          </CardContent>
        </Card>

        {/* KPIs secundarios */}
        <div className="grid grid-cols-2 gap-2">
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Ingresos</p>
              <p className="text-lg font-bold text-green-600">{fmtPeso(datos.totalIngresos)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Gastos</p>
              <p className="text-lg font-bold text-destructive">{fmtPeso(datos.totalGastos)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Liquidaciones</p>
              <p className="text-lg font-bold text-destructive">{fmtPeso(datos.totalLiquidaciones)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Costo / kg prod.</p>
              <p className="text-lg font-bold">
                {datos.costoPorKg != null ? fmtPeso(datos.costoPorKg) : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Volúmenes */}
        <Card>
          <CardContent className="py-3 flex justify-around text-center">
            <div>
              <p className="text-xs text-muted-foreground">Kg producidos</p>
              <p className="text-xl font-bold">{fmtKg(datos.kgProducidos)}</p>
            </div>
            <div className="w-px bg-border" />
            <div>
              <p className="text-xs text-muted-foreground">Kg despachados</p>
              <p className="text-xl font-bold">{fmtKg(datos.kgDespachados)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Detalle por cliente */}
        {datos.detallePorCliente.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
              Ingresos por cliente
            </p>
            {datos.detallePorCliente.map((c) => (
              <Card key={c.clienteId}>
                <CardContent className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{c.clienteNombre}</p>
                      <p className="text-xs text-muted-foreground">{fmtKg(c.kgDespachados)} · {c.tipoOperacion}</p>
                    </div>
                    <p className="font-bold text-sm shrink-0 text-green-600">{fmtPeso(c.ingresos)}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {datos.totalIngresos === 0 && datos.totalGastos === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Sin datos para {mes}</p>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground text-center px-4 pb-2">
          Los valores son estimados. Incluye valorizaciones confirmadas, gastos registrados y liquidaciones aprobadas del período.
        </p>

      </main>
    </div>
  )
}
