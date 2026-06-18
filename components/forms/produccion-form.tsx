/**
 * @system     FlowAluminio
 * @module     components/forms/produccion-form.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Formulario mobile-first de producción / colada con preview de rendimiento en tiempo real
 */
'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { produccionSchema, type ProduccionFormData } from '@/lib/validations/produccion'
import { calcularColada, calcularDesvioMezcla } from '@/lib/calculations/produccion'
import { crearProduccion } from '@/app/(operaciones)/produccion/actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface Maestro { id: string; nombre: string }
interface RecetaVigente { mix_1ra_pct: number; mix_2da_pct: number }

interface ProduccionFormProps {
  clientes: Maestro[]
  productos: Maestro[]
  recetaVigente: RecetaVigente | null
}

function pct(n: number) { return (n * 100).toFixed(1) + '%' }

export function ProduccionForm({ clientes, productos, recetaVigente }: ProduccionFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const form = useForm<ProduccionFormData>({
    resolver: zodResolver(produccionSchema) as Resolver<ProduccionFormData>,
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
      numero_colada: 1,
      cliente_destino_id: '',
      propietario_1ra_id: '',
      propietario_2da_id: '',
      kg_1ra: 0,
      kg_2da: 0,
      kg_tocho: 0,
      kg_escoria: 0,
      kg_remanente_recibido: 0,
      kg_remanente_dejado: 0,
      producto_id: '',
      observaciones: '',
    },
  })

  const w = form.watch()
  const kg1ra = w.kg_1ra ?? 0
  const kg2da = w.kg_2da ?? 0
  const kgTocho = w.kg_tocho ?? 0
  const kgEscoria = w.kg_escoria ?? 0
  const kgRemRecibido = w.kg_remanente_recibido ?? 0
  const kgRemDejado = w.kg_remanente_dejado ?? 0

  const showPreview = (kg1ra + kg2da > 0) && kgTocho > 0
  const calc = showPreview
    ? calcularColada({
        kg1ra,
        kg2da,
        kgTocho,
        kgEscoria,
        kgRemanenteRecibido: kgRemRecibido,
        kgRemanenteEntregado: kgRemDejado,
      })
    : null

  const desvio = calc && recetaVigente
    ? calcularDesvioMezcla(calc.mix1raPct, recetaVigente.mix_1ra_pct)
    : null

  function onSubmit(values: ProduccionFormData) {
    startTransition(async () => {
      const result = await crearProduccion(values)
      if (result.success) {
        toast.success('Colada registrada')
        router.push('/operaciones/produccion')
      } else {
        toast.error(result.error ?? 'Error al guardar')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Fecha + N° Colada */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-12 text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="numero_colada"
            render={({ field }) => (
              <FormItem>
                <FormLabel>N° Colada <span className="text-destructive">*</span></FormLabel>
                <Select
                  onValueChange={(v) => field.onChange(parseInt(v ?? '1'))}
                  value={String(field.value)}
                >
                  <FormControl>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Colada" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1ª colada</SelectItem>
                    <SelectItem value="2">2ª colada</SelectItem>
                    <SelectItem value="3">3ª colada</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="cliente_destino_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente destino <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Seleccioná el cliente">
                      {field.value ? clientes.find((c) => c.id === field.value)?.nombre : undefined}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Chatarra */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chatarra cargada</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="kg_1ra"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kg 1ª <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number" inputMode="decimal" placeholder="0" step="0.1"
                        className="h-12 text-base text-right"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kg_2da"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kg 2ª</FormLabel>
                    <FormControl>
                      <Input
                        type="number" inputMode="decimal" placeholder="0" step="0.1"
                        className="h-12 text-base text-right"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="kg_remanente_recibido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Remanente recibido</FormLabel>
                    <FormControl>
                      <Input
                        type="number" inputMode="decimal" placeholder="0" step="0.1"
                        className="h-11 text-sm text-right"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kg_remanente_dejado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Remanente dejado</FormLabel>
                    <FormControl>
                      <Input
                        type="number" inputMode="decimal" placeholder="0" step="0.1"
                        className="h-11 text-sm text-right"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Salidas */}
        <Card>
          <CardHeader className="pb-2 pt-3 px-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Salidas de horno</CardTitle>
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="kg_tocho"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kg tocho <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number" inputMode="decimal" placeholder="0" step="0.1"
                        className="h-12 text-base text-right"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kg_escoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kg escoria <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input
                        type="number" inputMode="decimal" placeholder="0" step="0.1"
                        className="h-12 text-base text-right"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* PREVIEW DE RENDIMIENTO */}
        {calc && (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="py-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Resultado estimado</p>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Metal disponible</span>
                <span className="font-medium">{calc.kgMetalDisponible.toFixed(1)} kg</span>
              </div>

              <Separator />

              <div className="flex justify-between">
                <span className="font-semibold">Rendimiento</span>
                <Badge
                  variant={calc.rendimientoPct >= 0.75 ? 'secondary' : 'destructive'}
                  className="text-base px-3"
                >
                  {pct(calc.rendimientoPct)}
                </Badge>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Escoria</span>
                <span>{pct(calc.escoriaPct)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Volatilización</span>
                <span>{pct(calc.volatilizacionPct)}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Mix 1ª real
                  {recetaVigente && (
                    <span className="ml-1 text-xs">(obj. {pct(recetaVigente.mix_1ra_pct)})</span>
                  )}
                </span>
                <span className={desvio && Math.abs(desvio.desvio1ra) > 0.05 ? 'text-destructive font-medium' : ''}>
                  {pct(calc.mix1raPct)}
                  {desvio && (
                    <span className="ml-1 text-xs">
                      ({desvio.desvio1ra >= 0 ? '+' : ''}{pct(desvio.desvio1ra)})
                    </span>
                  )}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Producto (opcional) */}
        <FormField
          control={form.control}
          name="producto_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Producto <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <Select onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Tipo de producto">
                      {field.value ? productos.find((p) => p.id === field.value)?.nombre : undefined}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {productos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Propietarios opcionales */}
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="propietario_1ra_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Propietario 1ª <span className="text-muted-foreground">(opc.)</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger className="h-11 text-sm">
                      <SelectValue placeholder="Cliente...">
                        {field.value ? clientes.find((c) => c.id === field.value)?.nombre : undefined}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="propietario_2da_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Propietario 2ª <span className="text-muted-foreground">(opc.)</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger className="h-11 text-sm">
                      <SelectValue placeholder="Cliente...">
                        {field.value ? clientes.find((c) => c.id === field.value)?.nombre : undefined}
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clientes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="observaciones"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Novedades de la colada..."
                  className="min-h-[80px] text-base"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={pending}
          className="w-full h-14 text-base font-semibold"
        >
          {pending ? 'Guardando...' : 'Registrar colada'}
        </Button>

      </form>
    </Form>
  )
}
