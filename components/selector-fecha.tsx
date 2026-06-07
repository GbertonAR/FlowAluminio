/**
 * @system     FlowAluminio
 * @module     components/selector-fecha.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Selector de fecha diaria que actualiza el parámetro de URL — reutilizable
 */
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  fecha: string   // YYYY-MM-DD
  paramKey?: string
}

export function SelectorFecha({ fecha, paramKey = 'fecha' }: Props) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const touchStartX  = useRef<number | null>(null)

  const navegar = useCallback((nuevaFecha: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(paramKey, nuevaFecha)
    router.push(pathname + '?' + params.toString())
  }, [router, pathname, searchParams, paramKey])

  const mover = useCallback((dias: number) => {
    const d = new Date(fecha + 'T12:00:00')
    d.setDate(d.getDate() + dias)
    navegar(d.toISOString().split('T')[0])
  }, [fecha, navegar])

  const hoy = new Date().toISOString().split('T')[0]
  const esHoy = fecha === hoy

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) < 60) return
    if (diff > 0 && !esHoy) mover(1)
    if (diff < 0) mover(-1)
    touchStartX.current = null
  }

  return (
    <div className="flex items-center gap-1" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <button
        onClick={() => mover(-1)}
        className="h-9 w-9 flex items-center justify-center rounded-md border hover:bg-muted transition-colors"
        aria-label="Día anterior"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <input
        type="date"
        value={fecha}
        max={hoy}
        onChange={(e) => navegar(e.target.value)}
        className="h-9 rounded-md border bg-background px-2 text-sm text-center"
      />
      <button
        onClick={() => mover(1)}
        disabled={esHoy}
        className="h-9 w-9 flex items-center justify-center rounded-md border hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Día siguiente"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
