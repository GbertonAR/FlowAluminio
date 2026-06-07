/**
 * @system     FlowAluminio
 * @module     components/forms/caja-form.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Formulario de apertura de caja chica
 */
'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { aperturaCajaSchema, type AperturaCajaFormData } from '@/lib/validations/caja'
import { abrirCaja } from '@/app/(admin)/caja/actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'

export function CajaForm() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const form = useForm<AperturaCajaFormData>({
    resolver: zodResolver(aperturaCajaSchema) as Resolver<AperturaCajaFormData>,
    defaultValues: {
      fecha_apertura: new Date().toISOString().split('T')[0],
      monto_inicial:  undefined,
    },
  })

  function onSubmit(values: AperturaCajaFormData) {
    startTransition(async () => {
      const result = await abrirCaja(values)
      if (result.success) {
        toast.success('Caja abierta')
        router.push('/admin/caja')
      } else {
        toast.error(result.error ?? 'Error al abrir caja')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <FormField
          control={form.control}
          name="fecha_apertura"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha de apertura</FormLabel>
              <FormControl>
                <Input type="date" {...field} className="h-12 text-base" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="monto_inicial"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto inicial <span className="text-destructive">*</span></FormLabel>
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

        <Button type="submit" disabled={pending} className="w-full h-14 text-base font-semibold">
          {pending ? 'Abriendo...' : 'Abrir caja'}
        </Button>

      </form>
    </Form>
  )
}
