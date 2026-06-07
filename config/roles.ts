/**
 * @system     FlowAluminio
 * @module     config/roles.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Configuración de roles: rutas permitidas y dashboard de redirección
 */
import type { UserRole } from '@/types'

export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  operaciones:    '/dashboard/operaciones',
  comercial:      '/dashboard/comercial',
  administracion: '/dashboard/administracion',
  superadmin:     '/dashboard/superadmin',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  operaciones:    'Operaciones',
  comercial:      'Comercial / Dueño',
  administracion: 'Administración',
  superadmin:     'Superadministrador',
}

export const ROLES_ORDEN: UserRole[] = [
  'operaciones',
  'comercial',
  'administracion',
  'superadmin',
]
