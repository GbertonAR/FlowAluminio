/**
 * @system     FlowAluminio
 * @module     components/forms/valorizacion-form.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Formulario de valorización de despacho (fasón / pleno / mixto) con preview de importe
 */
'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { valorizacionSchema, type ValorizacionFormData } from '@/lib/validations/valorizacion'
import { crearValorizacion } from '@/app/(comercial)/valorizacion/actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'

const TIPOS = [
  { value: 'fason',  label: 'Fasón' },
  { value: 'pleno',  label: 'Pleno' },
  { value: 'mixto',  label: 'Mixto' },
] as const

interface ValorizacionFormProps {
  despachoId: string
  kgDespachados: number
  clienteNombre: string
  fecha: string
}

export function ValorizacionForm({ despachoId, kgDespachados, clienteNombre, fecha }: ValorizacionFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const form = useForm<ValorizacionFormData>({
    resolver: zodResolver(valorizacionSchema) as Resolver<ValorizacionFormData>,
    defaultValues: {
      despacho_id:         despachoId,
      tipo_operacion:      'fason',
      precio:              undefined,
      condicion_comercial: '',
      observacion:         '',
    },
  })

  const precio = form.watch('precio') ?? 0
  const importe = precio * kgDespachados

  function onSubmit(values: ValorizacionFormData) {
    startTransition(async () => {
      const result = await crearValorizacion(values)
      if (result.success) {
        toast.success('Valorización registrada')
        router.push('/comercial/despachos')
      } else {
        toast.error(result.error ?? 'Error al guardar')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <Card>
          <CardContent className="py-3 space-y-1">
            <p className="text-sm text-muted-foreground">{fecha} · {clienteNombre}</p>
            <p className="text-lg font-semibold">{kgDespachados.toFixed(1)} kg despachados</p>
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="tipo_operacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de operación <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="precio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Precio por kg <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    step="0.01"
                    className="h-12 text-base text-right pl-7"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {importe > 0 && (
          <Card className="bg-muted/50">
            <CardContent className="py-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Importe total</p>
              <p className="text-2xl font-bold">
                ${importe.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>
        )}

        <FormField
          control={form.control}
          name="condicion_comercial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condición comercial <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <FormControl>
                <Input placeholder="Ej: 30 días" className="h-12 text-base" {...field} />
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
                <Textarea placeholder="Observaciones..." className="min-h-[80px] text-base" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={pending} className="w-full h-14 text-base font-semibold">
          {pending ? 'Guardando...' : 'Confirmar valorización'}
        </Button>

      </form>
    </Form>
  )
}
