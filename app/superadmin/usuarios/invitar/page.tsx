/**
 * @system     FlowAluminio
 * @module     app/superadmin/usuarios/invitar/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Formulario para invitar un nuevo usuario al sistema
 */
import { getPlantas } from '@/app/(superadmin)/usuarios/actions'
import { InvitarUsuarioForm } from '@/components/superadmin/invitar-usuario-form'

export default async function InvitarUsuarioPage() {
  const plantas = await getPlantas()

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3">
        <h1 className="font-semibold text-lg">Invitar usuario</h1>
      </header>
      <main className="px-4 py-4 max-w-lg mx-auto">
        <InvitarUsuarioForm plantas={plantas} />
      </main>
    </div>
  )
}
