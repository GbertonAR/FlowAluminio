/**
 * @system     FlowAluminio
 * @module     components/forms/pago-form.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-18
 * @summary    Formulario mobile-first para registro de pagos de chatarra (PRD §8.19)
 */
'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { pagoSchema, type PagoFormData } from '@/lib/validations/pago'
import { crearPago, actualizarPago } from '@/app/(comercial)/pagos/actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'

const MEDIOS_PAGO = [
  { value: 'efectivo',      label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'cheque',        label: 'Cheque' },
  { value: 'otro',          label: 'Otro' },
] as const

interface Maestro { id: string; nombre: string }

interface PagoFormProps {
  proveedores: Maestro[]
  editId?: string
  initialData?: Partial<PagoFormData>
}

export function PagoForm({ proveedores, editId, initialData }: PagoFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const form = useForm<PagoFormData>({
    resolver: zodResolver(pagoSchema) as Resolver<PagoFormData>,
    defaultValues: {
      fecha:         initialData?.fecha         ?? new Date().toISOString().split('T')[0],
      proveedor_id:  initialData?.proveedor_id  ?? '',
      importe:       initialData?.importe       ?? undefined,
      medio_pago_id: initialData?.medio_pago_id ?? '',
      observacion:   initialData?.observacion   ?? '',
    },
  })

  function onSubmit(values: PagoFormData) {
    startTransition(async () => {
      const result = editId
        ? await actualizarPago(editId, values)
        : await crearPago(values)
      if (result.success) {
        toast.success(editId ? 'Pago actualizado' : 'Pago registrado')
        router.push('/comercial/pagos')
      } else {
        toast.error(result.error ?? 'Error al guardar')
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

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
          name="proveedor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proveedor <span className="text-destructive">*</span></FormLabel>
              <Select items={Object.fromEntries(proveedores.map(p => [p.id, p.nombre]))} onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Seleccioná el proveedor" />
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
          name="importe"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Importe <span className="text-destructive">*</span></FormLabel>
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

        <FormField
          control={form.control}
          name="medio_pago_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medio de pago <span className="text-destructive">*</span></FormLabel>
              <Select items={MEDIOS_PAGO} onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Seleccioná el medio" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MEDIOS_PAGO.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Textarea placeholder="Observaciones del pago..." className="min-h-[80px] text-base" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={pending} className="w-full h-14 text-base font-semibold">
          {pending ? 'Guardando...' : editId ? 'Actualizar pago' : 'Registrar pago'}
        </Button>

      </form>
    </Form>
  )
}
