/**
 * @system     FlowAluminio
 * @module     components/forms/presentismo-form.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Formulario mobile-first de registro de presentismo (upsert por empleado/día)
 */
'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { presentismoSchema, type PresentismoFormData } from '@/lib/validations/presentismo'
import { registrarPresentismo } from '@/app/(operaciones)/presentismo/actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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

interface Empleado { id: string; nombre: string }

const ESTADOS = [
  { value: 'presente',  label: 'Presente' },
  { value: 'ausente',   label: 'Ausente' },
  { value: 'medio_dia', label: 'Medio día' },
  { value: 'franco',    label: 'Franco' },
  { value: 'feriado',   label: 'Feriado' },
  { value: 'licencia',  label: 'Licencia' },
  { value: 'vacaciones',label: 'Vacaciones' },
] as const

interface PresentismoFormProps {
  empleados: Empleado[]
  fecha?: string
  empleadoPreseleccionado?: string
}

export function PresentismoForm({ empleados, fecha, empleadoPreseleccionado }: PresentismoFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const form = useForm<PresentismoFormData>({
    resolver: zodResolver(presentismoSchema) as Resolver<PresentismoFormData>,
    defaultValues: {
      fecha: fecha ?? new Date().toISOString().split('T')[0],
      empleado_id: empleadoPreseleccionado ?? '',
      estado: 'presente',
      horas_extra: 0,
      observacion: '',
    },
  })

  const watchEstado = form.watch('estado')
  const showHorasExtra = watchEstado === 'presente' || watchEstado === 'medio_dia'

  function onSubmit(values: PresentismoFormData) {
    startTransition(async () => {
      const result = await registrarPresentismo(values)
      if (result.success) {
        toast.success('Presentismo registrado')
        router.push('/operaciones/presentismo')
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
          name="empleado_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Empleado <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Seleccioná un empleado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {empleados.map((e) => (
                    <SelectItem key={e.id} value={e.id}>{e.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estado"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estado <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {ESTADOS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showHorasExtra && (
          <FormField
            control={form.control}
            name="horas_extra"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horas extra <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    step="0.5"
                    min="0"
                    max="12"
                    className="h-12 text-base text-right"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="observacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observación <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ej: llegó tarde, certificado médico..."
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
          {pending ? 'Guardando...' : 'Registrar'}
        </Button>

      </form>
    </Form>
  )
}
