/**
 * @system     FlowAluminio
 * @module     app/(auth)/reset-password/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Pantalla para establecer/cambiar contraseña — post-invitación y recuperación
 */
import { ResetPasswordForm } from '@/components/forms/reset-password-form'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Establecer contraseña</h1>
          <p className="text-sm text-muted-foreground">Elegí una contraseña segura para tu cuenta</p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
