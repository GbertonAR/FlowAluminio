/**
 * @system     FlowAluminio
 * @module     lib/roles.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Mapeos de rol → dashboard y prefijos de ruta permitidos
 */

export const ROLE_DASHBOARDS: Record<string, string> = {
  operaciones:    '/dashboard/operaciones',
  comercial:      '/dashboard/comercial',
  administracion: '/dashboard/administracion',
  superadmin:     '/dashboard/superadmin',
}

// Prefijos de ruta accesibles para cada rol.
// superadmin accede a todo; administracion ve operaciones para contexto de liquidaciones.
export const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  operaciones: [
    '/operaciones',
    '/dashboard/operaciones',
  ],
  comercial: [
    '/comercial',
    '/dashboard/comercial',
  ],
  administracion: [
    '/admin',
    '/operaciones',
    '/dashboard/administracion',
    '/dashboard/operaciones',
  ],
  superadmin: [
    '/superadmin',
    '/admin',
    '/comercial',
    '/operaciones',
    '/dashboard',
  ],
}
