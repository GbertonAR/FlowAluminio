/**
 * @system     FlowAluminio
 * @module     components/forms/conteo-form.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Formulario mobile-first de conteo físico de inventario
 */
'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { conteoSchema, type ConteoFormData } from '@/lib/validations/conteo'
import { registrarConteo } from '@/app/(operaciones)/inventario/actions'

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

interface Maestro { id: string; nombre: string }

interface ConteoFormProps {
  clientes: Maestro[]
  tiposChatarra: Maestro[]
  calidades: Maestro[]
}

export function ConteoForm({ clientes, tiposChatarra, calidades }: ConteoFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const form = useForm<ConteoFormData>({
    resolver: zodResolver(conteoSchema) as Resolver<ConteoFormData>,
    defaultValues: {
      fecha:            new Date().toISOString().split('T')[0],
      cliente_id:       '',
      tipo_chatarra_id: '',
      calidad_id:       '',
      kg_real:          0,
      observacion:      '',
    },
  })

  function onSubmit(values: ConteoFormData) {
    startTransition(async () => {
      const result = await registrarConteo(values)
      if (result.success) {
        toast.success('Conteo registrado')
        router.push('/operaciones/inventario')
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
          name="cliente_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cliente <span className="text-destructive">*</span></FormLabel>
              <Select items={Object.fromEntries(clientes.map(c => [c.id, c.nombre]))} onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Seleccioná el cliente" />
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
          name="kg_real"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kg físicos contados <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  step="0.01"
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
          name="tipo_chatarra_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de chatarra <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <Select items={Object.fromEntries(tiposChatarra.map(t => [t.id, t.nombre]))} onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Todos los tipos" />
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
              <FormLabel>Calidad <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <Select items={Object.fromEntries(calidades.map(c => [c.id, c.nombre]))} onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Todas las calidades" />
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
          name="observacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observación <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Diferencias detectadas, condiciones del inventario..."
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
          {pending ? 'Guardando...' : 'Registrar conteo'}
        </Button>

      </form>
    </Form>
  )
}
