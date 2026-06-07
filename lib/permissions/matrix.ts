/**
 * @system     FlowAluminio
 * @module     lib/permissions/matrix.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Matriz de permisos por rol — fuente de verdad para visibilidad de módulos y campos
 */
import type { UserRole } from '@/types'

type Permission = 'crear' | 'ver' | 'editar' | 'anular' | 'todo'

interface ModulePermission {
  roles: Partial<Record<UserRole, Permission[]>>
}

export const PERMISSIONS: Record<string, ModulePermission> = {
  recepcion_chatarra: {
    roles: {
      operaciones:    ['crear', 'ver'],
      comercial:      ['ver'],
      administracion: ['ver'],
      superadmin:     ['todo'],
    },
  },
  produccion_colada: {
    roles: {
      operaciones:    ['crear', 'ver'],
      comercial:      ['ver'],
      administracion: ['ver'],
      superadmin:     ['todo'],
    },
  },
  despacho_fisico: {
    roles: {
      operaciones:    ['crear', 'ver'],
      comercial:      ['ver'],
      administracion: ['ver'],
      superadmin:     ['todo'],
    },
  },
  valorizacion_despacho: {
    roles: {
      comercial:      ['crear', 'ver', 'editar'],
      administracion: ['ver'],
      superadmin:     ['todo'],
    },
  },
  precios_comerciales: {
    roles: {
      comercial:      ['crear', 'editar', 'ver'],
      superadmin:     ['todo'],
    },
  },
  mermas_consensuadas: {
    roles: {
      comercial:      ['crear', 'editar', 'ver'],
      administracion: ['ver'],
      superadmin:     ['todo'],
    },
  },
  inventario: {
    roles: {
      operaciones:    ['crear', 'ver'],
      comercial:      ['ver'],
      administracion: ['ver'],
      superadmin:     ['todo'],
    },
  },
  caja_chica: {
    roles: {
      operaciones:    ['crear', 'ver'],
      comercial:      ['crear', 'ver', 'editar'],
      administracion: ['ver'],
      superadmin:     ['todo'],
    },
  },
  gastos: {
    roles: {
      operaciones:    ['crear', 'ver'],
      comercial:      ['ver', 'editar'],
      administracion: ['ver', 'editar'],
      superadmin:     ['todo'],
    },
  },
  cobros_pagos: {
    roles: {
      comercial:      ['crear', 'ver', 'editar'],
      administracion: ['crear', 'ver'],
      superadmin:     ['todo'],
    },
  },
  presentismo: {
    roles: {
      operaciones:    ['crear', 'ver'],
      comercial:      ['ver'],
      superadmin:     ['todo'],
    },
  },
  liquidaciones: {
    roles: {
      comercial:      ['crear', 'ver', 'editar'],
      administracion: ['ver'],
      superadmin:     ['todo'],
    },
  },
  conciliaciones: {
    roles: {
      comercial:      ['crear', 'ver', 'editar'],
      administracion: ['ver'],
      superadmin:     ['todo'],
    },
  },
  costos_margenes: {
    roles: {
      comercial:      ['ver'],
      superadmin:     ['todo'],
    },
  },
  usuarios: {
    roles: {
      superadmin: ['todo'],
    },
  },
  auditoria: {
    roles: {
      comercial:      ['ver'],
      administracion: ['ver'],
      superadmin:     ['todo'],
    },
  },
}

export function hasPermission(
  role: UserRole,
  module: string,
  action: Permission
): boolean {
  const mod = PERMISSIONS[module]
  if (!mod) return false
  const rolePerms = mod.roles[role]
  if (!rolePerms) return false
  return rolePerms.includes('todo') || rolePerms.includes(action)
}

// Campos sensibles que Operaciones NO debe ver
export const HIDDEN_FIELDS_OPERACIONES = [
  'precio',
  'importe',
  'margen',
  'condicion_comercial',
  'costo',
  'rentabilidad',
] as const
