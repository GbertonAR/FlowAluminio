/**
 * @system     FlowAluminio
 * @module     components/selector-mes.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Selector de mes que actualiza el parámetro de URL — reutilizable
 */
'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

interface Props {
  mes: string
  paramKey?: string
}

export function SelectorMes({ mes, paramKey = 'mes' }: Props) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(paramKey, e.target.value)
    router.push(pathname + '?' + params.toString())
  }, [router, pathname, searchParams, paramKey])

  return (
    <input
      type="month"
      value={mes}
      onChange={onChange}
      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
    />
  )
}
