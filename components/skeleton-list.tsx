/**
 * @system     FlowAluminio
 * @module     components/skeleton-list.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton · NORMAN
 * @created    2026-06-06
 * @summary    Skeleton de lista de cards — usado en loading.tsx de cada módulo
 */
import { Skeleton } from '@/components/ui/skeleton'

interface Props { rows?: number; showHeader?: boolean }

export function SkeletonList({ rows = 4, showHeader = true }: Props) {
  return (
    <div className="min-h-screen bg-background">
      {showHeader && (
        <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-9 w-20 rounded-md" />
          </div>
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      )}
      <div className="px-4 py-4 space-y-3 max-w-lg mx-auto">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
