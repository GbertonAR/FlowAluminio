/**
 * @system     FlowAluminio
 * @module     app/comercial/conciliaciones/[id]/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Detalle de conciliación — movimientos del período y cierre
 */
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getConciliacionDetalle, cerrarConciliacion } from '@/app/(comercial)/conciliaciones/actions'
import { CerrarConciliacionButton } from '@/components/forms/cerrar-conciliacion-button'

interface Props { params: Promise<{ id: string }> }

function fmtPeso(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

function fmtFecha(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
}

export default async function ConciliacionDetallePage({ params }: Props) {
  const { id } = await params
  const det = await getConciliacionDetalle(id)

  if (!det) notFound()

  const { conciliacion: c, recepciones, despachos, cobros, resumen } = det
  const esBorrador = c.estado === 'borrador'

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="font-semibold text-lg leading-tight">{c.clienteNombre}</h1>
            <p className="text-xs text-muted-foreground">
              {c.periodo_desde} — {c.periodo_hasta}
            </p>
          </div>
          <Badge variant={c.estado === 'cerrada' ? 'secondary' : 'outline'} className="text-[10px]">
            {c.estado}
          </Badge>
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">

        {/* Resumen */}
        <div className="grid grid-cols-2 gap-2">
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Saldo kg</p>
              <p className={`text-xl font-bold ${resumen.saldoKg >= 0 ? '' : 'text-destructive'}`}>
                {resumen.saldoKg.toFixed(0)} kg
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Saldo financiero</p>
              <p className={`text-xl font-bold ${resumen.saldoFinanciero >= 0 ? '' : 'text-destructive'}`}>
                {fmtPeso(resumen.saldoFinanciero)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Recibido</p>
              <p className="text-sm font-semibold">{resumen.kgReconocido.toFixed(0)} kg</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-3 text-center">
              <p className="text-xs text-muted-foreground">Facturado</p>
              <p className="text-sm font-semibold">{fmtPeso(resumen.importeFacturado)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recepciones */}
        {recepciones.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
              Recepciones ({recepciones.length})
            </p>
            {recepciones.map((r) => (
              <Card key={r.id}>
                <CardContent className="py-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{fmtFecha(r.fecha)}</span>
                    <span>{r.kg_fisicos.toFixed(0)} kg físicos · <strong>{r.kg_reconocidos.toFixed(0)} reconoc.</strong></span>
                  </div>
                  {r.remito && <p className="text-xs text-muted-foreground">Rem: {r.remito}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Despachos */}
        {despachos.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
              Despachos ({despachos.length})
            </p>
            {despachos.map((d) => (
              <Card key={d.id}>
                <CardContent className="py-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{fmtFecha(d.fecha)}</span>
                    <span>{d.kg_despachados.toFixed(0)} kg</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{d.remito ? `Rem: ${d.remito}` : ''}</span>
                    <span className={d.importe > 0 ? 'text-green-600 font-medium' : ''}>
                      {d.importe > 0 ? fmtPeso(d.importe) : 'Sin valorizar'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Cobros */}
        {cobros.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">
              Cobros ({cobros.length})
            </p>
            {cobros.map((c) => (
              <Card key={c.id}>
                <CardContent className="py-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{fmtFecha(c.fecha)}</span>
                    <span className="font-medium text-green-600">{fmtPeso(c.importe)}</span>
                  </div>
                  {c.medio_pago_id && <p className="text-xs text-muted-foreground">{c.medio_pago_id}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {recepciones.length === 0 && despachos.length === 0 && cobros.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              Sin movimientos en el período seleccionado
            </CardContent>
          </Card>
        )}

        {/* Cerrar */}
        {esBorrador && (
          <CerrarConciliacionButton
            conciliacionId={c.id}
            onCerrar={(obs) => cerrarConciliacion(c.id, obs)}
          />
        )}

      </main>
    </div>
  )
}
