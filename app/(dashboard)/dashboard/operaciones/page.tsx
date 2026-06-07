/**
 * @system     FlowAluminio
 * @module     app/(dashboard)/dashboard/operaciones/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Dashboard del rol Operaciones — KPIs del día
 */
import Link from 'next/link'
import { Package, Flame, Truck, Users, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserChip } from '@/components/user-chip'
import { getRecepciones } from '@/app/(operaciones)/recepcion/actions'
import { getProduccionesDelDia } from '@/app/(operaciones)/produccion/actions'
import { getDespachosDelDia } from '@/app/(operaciones)/despacho/actions'
import { getPresentismoDelDia, getEmpleados } from '@/app/(operaciones)/presentismo/actions'

export default async function DashboardOperacionesPage() {
  const hoy = new Date().toISOString().split('T')[0]

  const [recepciones, producciones, despachos, presentismo, empleados] = await Promise.all([
    getRecepciones(hoy),
    getProduccionesDelDia(hoy),
    getDespachosDelDia(hoy),
    getPresentismoDelDia(hoy),
    getEmpleados(),
  ])

  const kgFisicos   = recepciones.reduce((s, r) => s + (r.kg_fisicos ?? 0), 0)
  const kgTocho     = producciones.reduce((s, p) => s + (p.kg_tocho ?? 0), 0)
  const kgDespachos = despachos.reduce((s, d) => s + (d.kg_despachados ?? 0), 0)
  const avgRendimiento =
    producciones.length > 0
      ? producciones.reduce((s, p) => s + (p.rendimiento_pct ?? 0), 0) / producciones.length
      : null

  const presentes = presentismo.filter((p) => p.estado === 'presente' || p.estado === 'medio_dia').length
  const empleadosTotal = empleados.length

  const fechaDisplay = new Date(hoy + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-semibold text-lg">Operaciones</h1>
            <p className="text-xs text-muted-foreground capitalize">{fechaDisplay}</p>
          </div>
          <UserChip />
        </div>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">

        {/* Recepción */}
        <Link href="/operaciones/recepcion" className="block">
          <Card className="hover:bg-muted/30 transition-colors">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                Recepción de chatarra
                <ChevronRight className="h-4 w-4 ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="flex items-end gap-3">
                <div>
                  <p className="text-2xl font-bold">{kgFisicos.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">kg recibidos</p>
                </div>
                <Badge variant="outline" className="mb-0.5">
                  {recepciones.length} {recepciones.length === 1 ? 'recepción' : 'recepciones'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Producción */}
        <Link href="/operaciones/produccion" className="block">
          <Card className="hover:bg-muted/30 transition-colors">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <Flame className="h-4 w-4" />
                Producción / Coladas
                <ChevronRight className="h-4 w-4 ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="flex items-end gap-3">
                <div>
                  <p className="text-2xl font-bold">{kgTocho.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">kg tocho</p>
                </div>
                {avgRendimiento !== null && (
                  <Badge
                    variant={avgRendimiento >= 0.75 ? 'secondary' : 'destructive'}
                    className="mb-0.5"
                  >
                    {(avgRendimiento * 100).toFixed(1)}% rend.
                  </Badge>
                )}
                <Badge variant="outline" className="mb-0.5">
                  {producciones.length} {producciones.length === 1 ? 'colada' : 'coladas'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Despacho */}
        <Link href="/operaciones/despacho" className="block">
          <Card className="hover:bg-muted/30 transition-colors">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <Truck className="h-4 w-4" />
                Despacho
                <ChevronRight className="h-4 w-4 ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="flex items-end gap-3">
                <div>
                  <p className="text-2xl font-bold">{kgDespachos.toFixed(0)}</p>
                  <p className="text-xs text-muted-foreground">kg despachados</p>
                </div>
                <Badge variant="outline" className="mb-0.5">
                  {despachos.length} {despachos.length === 1 ? 'despacho' : 'despachos'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Presentismo */}
        <Link href="/operaciones/presentismo" className="block">
          <Card className="hover:bg-muted/30 transition-colors">
            <CardHeader className="pb-1 pt-3 px-3">
              <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                Personal
                <ChevronRight className="h-4 w-4 ml-auto" />
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <div className="flex items-end gap-3">
                <div>
                  <p className="text-2xl font-bold">{presentes}/{empleadosTotal}</p>
                  <p className="text-xs text-muted-foreground">presentes hoy</p>
                </div>
                {empleadosTotal - presentismo.length > 0 && (
                  <Badge variant="destructive" className="mb-0.5">
                    {empleadosTotal - presentismo.length} sin registrar
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>

        <div className="pt-2">
          <Button render={<Link href="/operaciones/inventario" />} variant="outline" className="w-full h-11">
            Ver stock teórico
          </Button>
        </div>

      </main>
    </div>
  )
}
