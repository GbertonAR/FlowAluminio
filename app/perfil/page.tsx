/**
 * @system     FlowAluminio
 * @module     app/perfil/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Perfil del usuario — nombre, rol, empresa, acceso a cambiar contraseña
 */
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, MapPin, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { BackButton } from '@/components/back-button'
import { LogoutButton } from '@/components/logout-button'
import { createClient } from '@/lib/supabase/server'

const ROL_LABEL: Record<string, string> = {
  operaciones:    'Operaciones',
  comercial:      'Comercial / Dueño',
  administracion: 'Administración',
  superadmin:     'Superadministrador',
}

const ROL_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  superadmin:     'default',
  administracion: 'secondary',
  comercial:      'secondary',
  operaciones:    'outline',
}

function iniciales(nombre: string) {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('')
}

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, rol, activo, created_at, empresas(nombre), plantas(nombre)')
    .eq('id', user.id)
    .single()

  const nombre   = perfil?.nombre ?? user.email ?? '—'
  const empresa  = (perfil?.empresas as unknown as { nombre: string } | null)?.nombre ?? '—'
  const planta   = (perfil?.plantas  as unknown as { nombre: string } | null)?.nombre ?? null
  const fechaAlta = perfil?.created_at
    ? new Date(perfil.created_at as string).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
        <BackButton />
        <h1 className="font-semibold text-lg">Mi perfil</h1>
      </header>

      <main className="px-4 py-6 space-y-4 max-w-lg mx-auto">

        {/* Avatar + nombre */}
        <div className="flex flex-col items-center gap-3 py-4">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
            {iniciales(nombre)}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">{nombre}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <Badge variant={ROL_VARIANT[perfil?.rol ?? ''] ?? 'outline'}>
            {ROL_LABEL[perfil?.rol ?? ''] ?? perfil?.rol ?? '—'}
          </Badge>
        </div>

        {/* Info */}
        <Card>
          <CardContent className="py-4 space-y-3">
            <div className="flex items-center gap-3">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Empresa</p>
                <p className="text-sm font-medium">{empresa}</p>
              </div>
            </div>
            {planta && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Planta</p>
                  <p className="text-sm font-medium">{planta}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Usuario desde</p>
                <p className="text-sm font-medium capitalize">{fechaAlta}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="space-y-2">
          <Button
            render={<Link href="/reset-password" />}
            nativeButton={false}
            variant="outline"
            className="w-full h-12"
          >
            Cambiar contraseña
          </Button>
          <div className="flex justify-center pt-2">
            <LogoutButton />
          </div>
        </div>

      </main>
    </div>
  )
}
