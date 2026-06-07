/**
 * @system     FlowAluminio
 * @module     app/(auth)/login/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Página de login — acceso al sistema FlowAluminio
 */
import { LoginForm } from '@/components/forms/login-form'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">FlowAluminio</h1>
          <p className="text-sm text-muted-foreground">Ingresá con tu cuenta de empresa</p>
        </div>

        <LoginForm />
      </div>
    </main>
  )
}
