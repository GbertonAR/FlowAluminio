/**
 * @system     FlowAluminio
 * @module     components/forms/merma-form.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Formulario mobile-first de merma consensuada con vigencia
 */
'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { mermaSchema, type MermaFormData } from '@/lib/validations/merma'
import { crearMerma } from '@/app/(comercial)/mermas/actions'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'

interface Maestro { id: string; nombre: string }

interface MermaFormProps {
  clientes: Maestro[]
  tiposChatarra: Maestro[]
}

export function MermaForm({ clientes, tiposChatarra }: MermaFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const form = useForm<MermaFormData>({
    resolver: zodResolver(mermaSchema) as Resolver<MermaFormData>,
    defaultValues: {
      cliente_id:       '',
      tipo_chatarra_id: '',
      merma_pct:        undefined,
      vigencia_desde:   new Date().toISOString().split('T')[0],
      vigencia_hasta:   '',
      observacion:      '',
    },
  })

  function onSubmit(values: MermaFormData) {
    startTransition(async () => {
      const result = await crearMerma(values)
      if (result.success) {
        toast.success('Merma registrada')
        router.push('/comercial/mermas')
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
          name="merma_pct"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Merma % <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    max="99.99"
                    className="h-12 text-base text-right pr-10"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="vigencia_desde"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desde <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-12 text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="vigencia_hasta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hasta <span className="text-muted-foreground text-xs">(sin fin si vacío)</span></FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-12 text-base" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="observacion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observación <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <FormControl>
                <Textarea placeholder="Ej: acordado en reunión del 01/06" className="min-h-[80px] text-base" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={pending} className="w-full h-14 text-base font-semibold">
          {pending ? 'Guardando...' : 'Registrar merma'}
        </Button>

      </form>
    </Form>
  )
}
