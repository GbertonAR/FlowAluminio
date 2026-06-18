/**
 * @system     FlowAluminio
 * @module     components/forms/despacho-form.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Formulario mobile-first de despacho físico de producto
 */
'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { despachoSchema, type DespachoFormData } from '@/lib/validations/despacho'
import { crearDespacho, actualizarDespacho } from '@/app/(operaciones)/despacho/actions'

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

interface DespachoFormProps {
  clientes: Maestro[]
  productos: Maestro[]
  editId?: string
  initialData?: Partial<DespachoFormData>
}

export function DespachoForm({ clientes, productos, editId, initialData }: DespachoFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const form = useForm<DespachoFormData>({
    resolver: zodResolver(despachoSchema) as Resolver<DespachoFormData>,
    defaultValues: {
      fecha:          initialData?.fecha          ?? new Date().toISOString().split('T')[0],
      cliente_id:     initialData?.cliente_id     ?? '',
      kg_despachados: initialData?.kg_despachados ?? undefined,
      producto_id:    initialData?.producto_id    ?? '',
      remito:         initialData?.remito         ?? '',
      observacion:    initialData?.observacion    ?? '',
    },
  })

  function onSubmit(values: DespachoFormData) {
    startTransition(async () => {
      const result = editId
        ? await actualizarDespacho(editId, values)
        : await crearDespacho(values)
      if (result.success) {
        toast.success(editId ? 'Despacho actualizado' : 'Despacho registrado')
        router.push('/operaciones/despacho')
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
          name="kg_despachados"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kg despachados <span className="text-destructive">*</span></FormLabel>
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

        <FormField
          control={form.control}
          name="producto_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Producto <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <Select items={Object.fromEntries(productos.map(p => [p.id, p.nombre]))} onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Tipo de producto" />
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
                  placeholder="Observaciones del despacho..."
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
          {pending ? 'Guardando...' : editId ? 'Actualizar despacho' : 'Registrar despacho'}
        </Button>

      </form>
    </Form>
  )
}
