/**
 * @system     FlowAluminio
 * @module     components/forms/gasto-form.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Formulario mobile-first de gasto operativo con comprobante fotográfico opcional
 */
'use client'

import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useRef, useTransition } from 'react'
import { toast } from 'sonner'
import { Camera } from 'lucide-react'

import { gastoSchema, type GastoFormData } from '@/lib/validations/gasto'
import { crearGasto, actualizarGasto } from '@/app/(admin)/gastos/actions'

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
interface CajaAbierta { id: string; fecha_apertura: string }

interface GastoFormProps {
  categorias:  Maestro[]
  proveedores: Maestro[]
  cajaAbierta: CajaAbierta | null
  editId?: string
  initialData?: Partial<GastoFormData>
}

export function GastoForm({ categorias, proveedores, cajaAbierta, editId, initialData }: GastoFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const archivoRef = useRef<File | null>(null)

  const form = useForm<GastoFormData>({
    resolver: zodResolver(gastoSchema) as Resolver<GastoFormData>,
    defaultValues: {
      fecha:         initialData?.fecha         ?? new Date().toISOString().split('T')[0],
      categoria_id:  initialData?.categoria_id  ?? '',
      concepto:      initialData?.concepto      ?? '',
      proveedor_id:  initialData?.proveedor_id  ?? '',
      importe:       initialData?.importe       ?? undefined,
      medio_pago_id: initialData?.medio_pago_id ?? '',
      caja_chica_id: initialData?.caja_chica_id ?? cajaAbierta?.id ?? '',
      observacion:   initialData?.observacion   ?? '',
    },
  })

  function onSubmit(values: GastoFormData) {
    startTransition(async () => {
      let result
      if (editId) {
        result = await actualizarGasto(editId, values)
      } else {
        const fd = new FormData()
        Object.entries(values).forEach(([k, v]) => {
          if (v != null && v !== '') fd.append(k, String(v))
        })
        if (archivoRef.current) fd.append('comprobante', archivoRef.current)
        result = await crearGasto(fd)
      }
      if (result.success) {
        toast.success(editId ? 'Gasto actualizado' : 'Gasto registrado')
        router.push('/admin/gastos')
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
          name="concepto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Concepto <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Ej: Combustible camión" className="h-12 text-base" {...field} />
              </FormControl>
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
          name="categoria_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <Select items={Object.fromEntries(categorias.map(c => [c.id, c.nombre]))} onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Sin categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categorias.map((c) => (
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
          name="proveedor_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proveedor <span className="text-muted-foreground text-xs">(opcional)</span></FormLabel>
              <Select items={Object.fromEntries(proveedores.map(p => [p.id, p.nombre]))} onValueChange={field.onChange} value={field.value || undefined}>
                <FormControl>
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue placeholder="Sin proveedor" />
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

        {cajaAbierta && (
          <p className="text-xs text-muted-foreground px-1">
            Caja abierta: {cajaAbierta.fecha_apertura} — este gasto se imputará automáticamente.
          </p>
        )}

        {/* Comprobante (foto) */}
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Comprobante <span className="text-muted-foreground text-xs">(foto/PDF, opcional)</span>
          </label>
          <label className="flex items-center gap-3 h-12 px-3 border rounded-md cursor-pointer hover:bg-muted transition-colors">
            <Camera className="h-5 w-5 text-muted-foreground" />
            <span className="text-base text-muted-foreground" id="archivo-label">Adjuntar foto</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              capture="environment"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null
                archivoRef.current = file
                const label = document.getElementById('archivo-label')
                if (label) label.textContent = file ? file.name : 'Adjuntar foto'
              }}
            />
          </label>
        </div>

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
          {pending ? 'Guardando...' : editId ? 'Actualizar gasto' : 'Registrar gasto'}
        </Button>

      </form>
    </Form>
  )
}
