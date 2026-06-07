/**
 * @system     FlowAluminio
 * @module     components/forms/login-form.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Formulario de login mobile-first con email + contraseña
 */
'use client'

import { useActionState } from 'react'
import { loginAction } from '@/app/(auth)/login/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type State = { error?: string } | null

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null)

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="usuario@empresa.com"
          className="h-12 text-base"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="h-12 text-base"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
          {state.error === 'Invalid login credentials'
            ? 'Email o contraseña incorrectos'
            : state.error}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="w-full h-14 text-base font-semibold"
      >
        {pending ? 'Ingresando...' : 'Ingresar'}
      </Button>
    </form>
  )
}
