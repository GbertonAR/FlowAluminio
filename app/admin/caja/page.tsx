/**
 * @system     FlowAluminio
 * @module     app/admin/caja/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Caja chica — estado actual y historial de cajas
 */
import Link from 'next/link'
import { Plus, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EmptyState } from '@/components/empty-state'
import { getCajas, getCajaAbierta } from '@/app/(admin)/caja/actions'

export default async function CajaPage() {
  const [cajas, cajaAbierta] = await Promise.all([getCajas(), getCajaAbierta()])

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Caja chica</h1>
        {!cajaAbierta && (
          <Button render={<Link href="/admin/caja/nueva" />} size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            Abrir
          </Button>
        )}
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        {cajaAbierta && (
          <Card className="border-green-500">
            <CardContent className="py-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">Caja abierta</p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Activa</Badge>
                  <Button
                    render={<Link href={`/admin/caja/${cajaAbierta.id}/cerrar`} />}
                    size="sm" variant="outline" className="h-8 text-xs"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-sm">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Inicial</p>
                  <p className="font-medium">${(cajaAbierta.monto_inicial as number).toLocaleString('es-AR', { minimumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Gastado</p>
                  <p className="font-medium text-destructive">${(cajaAbierta.total_gastado as number).toLocaleString('es-AR', { minimumFractionDigits: 0 })}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Disponible</p>
                  <p className="font-bold">${((cajaAbierta.monto_inicial as number) - (cajaAbierta.total_gastado as number)).toLocaleString('es-AR', { minimumFractionDigits: 0 })}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Apertura: {cajaAbierta.fecha_apertura as string}</p>
            </CardContent>
          </Card>
        )}

        {!cajaAbierta && cajas.length === 0 && (
          <EmptyState
            icon={Wallet}
            title="Sin cajas registradas"
            message="Abrí la primera caja para comenzar a registrar movimientos"
            action={<Button render={<Link href="/admin/caja/nueva" />} variant="outline">Abrir primera caja</Button>}
          />
        )}

        {cajas.filter((c) => c.estado !== 'abierta').length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Historial</p>
            {cajas.filter((c) => c.estado !== 'abierta').map((c) => (
              <Card key={c.id}>
                <CardContent className="py-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{c.fecha_apertura as string}</p>
                    <p className="text-xs text-muted-foreground">
                      Inicial: ${(c.monto_inicial as number).toLocaleString('es-AR')} ·
                      Gastado: ${(c.total_gastado as number).toLocaleString('es-AR')}
                      {c.diferencia != null && ` · Dif: ${(c.diferencia as number) > 0 ? '+' : ''}$${(c.diferencia as number).toLocaleString('es-AR')}`}
                    </p>
                  </div>
                  <Badge variant="outline">{c.estado as string}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
