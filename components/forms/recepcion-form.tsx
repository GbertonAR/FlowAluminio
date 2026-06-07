/**
 * @system     FlowAluminio
 * @module     components/forms/recepcion-form.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Formulario mobile-first de recepción de chatarra — ≤6 campos obligatorios
 */
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { recepcionSchema, type RecepcionFormData } from '@/lib/validations/recepcion'
import { calcularKgReconocidos } from '@/lib/calculations/recepcion'
import { crearRecepcion } from '@/app/(operaciones)/recepcion/actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

interface Maestro { id: string; nombre: string }

interface RecepcionFormProps {
  clientes: Maestro[]
  proveedores: Maestro[]
  tiposChatarra: Maestro[]
  calidades: Maestro[]
  // merma ya cargada desde el servidor para el par cliente+tipo
  mermasPorClienteTipo: Record<string, number>
}

export function RecepcionForm({
  clientes,
  proveedores,
  tiposChatarra,
  calidades,
  mermasPorClienteTipo,
}: RecepcionFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const form = useForm<RecepcionFormData>({
    resolver: zodResolver(recepcionSchema),
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
      cliente_id: '',
      proveedor_id: '',
      tipo_chatarra_id: '',
      calidad_id: '',
      kg_fisicos: undefined,
      remito: '',
      observacion: '',
    },
  })

  const watchCliente = form.watch('cliente_id')
  const watchTipo = form.watch('tipo_chatarra_id')
  const watchKg = form.watch('kg_fisicos')

  const mermaKey = `${watchCliente}-${watchTipo}`
  const mermaPct = mermasPorClienteTipo[mermaKey] ?? 0
  const preview = watchKg && watchKg > 0
    ? calcularKgReconocidos(watchKg, mermaPct)
    : null

  function onSubmit(values: RecepcionFormData) {
    startTransition(async () => {
      const result = await crearRecepcion(values)
      if (result.success) {
        toast.success('Recepción registrada')
        router.push('/operaciones/recepcion')
      } else {
        toast.error(result.error ?? 'Error al guardar')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* CAMPOS OBLIGATORIOS */}
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
          name="cliente_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente / Cuenta <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Seleccioná un cliente" />
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

        <FormField
          control={form.control}
          name="tipo_chatarra_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de chatarra <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Tipo de chatarra" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tiposChatarra.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="calidad_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calidad <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Calidad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {calidades.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="kg_fisicos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kg físicos recibidos <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  step="0.01"
                  className="h-12 text-base text-right"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PREVIEW CALCULADO — visible antes de guardar */}
        {preview && (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="py-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Merma comercial ({(mermaPct * 100).toFixed(1)}%)</span>
                <span className="font-medium">−{preview.kgMermaComercial.toFixed(1)} kg</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="font-semibold">Kg reconocidos</span>
                <Badge variant="secondary" className="text-base px-3">
                  {preview.kgReconocidos.toFixed(1)} kg
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CAMPOS OPCIONALES */}
        <FormField
          control={form.control}
          name="proveedor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proveedor <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Proveedor (opcional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {proveedores.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="remito"
          render={({ field }) => (
            <FormItem>
              <FormLabel>N° Remito <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <FormControl>
                <Input placeholder="Ej: R-00123" className="h-12 text-base" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="observacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observación <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Observaciones sobre esta recepción..."
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
          {pending ? 'Guardando...' : 'Registrar recepción'}
        </Button>

      </form>
    </Form>
  )
}
