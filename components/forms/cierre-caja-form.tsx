/**
 * @system     FlowAluminio
 * @module     components/forms/cierre-caja-form.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Formulario de cierre de caja chica con reconciliación de efectivo
 */
'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { cierreCajaSchema, type CierreCajaFormData } from '@/lib/validations/caja'
import { cerrarCaja } from '@/app/(admin)/caja/actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'

interface CierreCajaFormProps {
  cajaId: string
  montoInicial: number
  totalGastado: number
}

export function CierreCajaForm({ cajaId, montoInicial, totalGastado }: CierreCajaFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const form = useForm<CierreCajaFormData>({
    resolver: zodResolver(cierreCajaSchema) as Resolver<CierreCajaFormData>,
    defaultValues: { efectivo_devuelto: 0 },
  })

  const efectivoDevuelto = form.watch('efectivo_devuelto') ?? 0
  const diferencia       = montoInicial - totalGastado - efectivoDevuelto

  function onSubmit(values: CierreCajaFormData) {
    startTransition(async () => {
      const result = await cerrarCaja(cajaId, values.efectivo_devuelto)
      if (result.success) {
        toast.success('Caja cerrada')
        router.push('/admin/caja')
      } else {
        toast.error(result.error ?? 'Error al cerrar caja')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        <Card className="bg-muted/50">
          <CardContent className="py-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monto inicial</span>
              <span className="font-medium">${montoInicial.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total gastado</span>
              <span className="font-medium text-destructive">−${totalGastado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="text-muted-foreground">Esperado en caja</span>
              <span className="font-bold">${(montoInicial - totalGastado).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
          </CardContent>
        </Card>

        <FormField
          control={form.control}
          name="efectivo_devuelto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Efectivo devuelto (conteo físico) <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="h-12 text-base text-right pl-7"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card className={Math.abs(diferencia) < 0.01 ? 'border-green-500' : 'border-orange-400'}>
          <CardContent className="py-3 flex items-center justify-between">
            <p className="font-medium">Diferencia</p>
            <p className={`text-2xl font-bold ${Math.abs(diferencia) < 0.01 ? 'text-green-600' : 'text-orange-500'}`}>
              {diferencia >= 0 ? '+' : ''}${diferencia.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={pending}
          className="w-full h-14 text-base font-semibold"
        >
          {pending ? 'Cerrando...' : 'Cerrar caja'}
        </Button>

      </form>
    </Form>
  )
}
