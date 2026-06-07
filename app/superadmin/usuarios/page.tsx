/**
 * @system     FlowAluminio
 * @module     app/superadmin/usuarios/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Gestión de usuarios del sistema — listado, invitación y cambio de rol
 */
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { getUsuarios } from '@/app/(superadmin)/usuarios/actions'
import { UsuarioActions } from '@/components/superadmin/usuario-actions'

const ROL_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  superadmin:     'destructive',
  administracion: 'default',
  comercial:      'secondary',
  operaciones:    'outline',
}

export default async function UsuariosPage() {
  const usuarios = await getUsuarios()

  const activos   = usuarios.filter((u) => u.activo)
  const inactivos = usuarios.filter((u) => !u.activo)

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg">Usuarios</h1>
        <Button render={<Link href="/superadmin/usuarios/invitar" />} size="sm" className="h-9">
          <Plus className="h-4 w-4 mr-1" />
          Invitar
        </Button>
      </header>

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">

        <p className="text-xs text-muted-foreground px-1">
          {activos.length} activo{activos.length !== 1 ? 's' : ''} · {inactivos.length} inactivo{inactivos.length !== 1 ? 's' : ''}
        </p>

        {activos.length === 0 && inactivos.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Sin usuarios registrados</p>
            <Button render={<Link href="/superadmin/usuarios/invitar" />} variant="outline" className="mt-4">
              Invitar primer usuario
            </Button>
          </div>
        )}

        {activos.length > 0 && (
          <div className="space-y-2">
            {activos.map((u) => (
              <Card key={u.id}>
                <CardContent className="py-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{u.nombre}</p>
                      {(u.plantas as unknown as { nombre: string } | null)?.nombre && (
                        <p className="text-xs text-muted-foreground">
                          {(u.plantas as unknown as { nombre: string }).nombre}
                        </p>
                      )}
                    </div>
                    <Badge variant={ROL_VARIANT[u.rol] ?? 'outline'} className="text-[10px] shrink-0">
                      {u.rol}
                    </Badge>
                  </div>
                  <UsuarioActions usuarioId={u.id} rolActual={u.rol} activo={u.activo ?? true} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {inactivos.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide px-1">Inactivos</p>
            {inactivos.map((u) => (
              <Card key={u.id} className="opacity-60">
                <CardContent className="py-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm line-through text-muted-foreground">{u.nombre}</p>
                    <Badge variant="outline" className="text-[10px]">{u.rol}</Badge>
                  </div>
                  <UsuarioActions usuarioId={u.id} rolActual={u.rol} activo={false} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}
