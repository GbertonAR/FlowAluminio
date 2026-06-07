/**
 * @system     FlowAluminio
 * @module     components/forms/reset-password-form.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Formulario para establecer nueva contraseña
 */
'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { actualizarPasswordAction } from '@/app/(auth)/reset-password/actions'

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState(actualizarPasswordAction, null)

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="password">Nueva contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Mínimo 8 caracteres"
          className="w-full h-12 rounded-md border bg-background px-3 text-sm"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium" htmlFor="password_confirm">Confirmar contraseña</label>
        <input
          id="password_confirm"
          name="password_confirm"
          type="password"
          placeholder="Repetí la contraseña"
          className="w-full h-12 rounded-md border bg-background px-3 text-sm"
          required
          autoComplete="new-password"
        />
      </div>

      {state && typeof state === 'object' && 'error' in state && state.error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
          {state.error as string}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full h-14 text-base font-semibold">
        {pending ? 'Guardando...' : 'Guardar contraseña'}
      </Button>
    </form>
  )
}
