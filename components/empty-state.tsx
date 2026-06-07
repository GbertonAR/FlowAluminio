/**
 * @system     FlowAluminio
 * @module     components/empty-state.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton · NORMAN
 * @created    2026-06-06
 * @summary    Estado vacío reutilizable con ícono, mensaje y CTA opcional
 */
import type { LucideIcon } from 'lucide-react'

interface Props {
  icon:     LucideIcon
  title:    string
  message?: string
  action?:  React.ReactNode
}

export function EmptyState({ icon: Icon, title, message, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
      <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
        <Icon className="h-7 w-7 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
