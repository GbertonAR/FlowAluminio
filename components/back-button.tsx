/**
 * @system     FlowAluminio
 * @module     components/back-button.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-06
 * @summary    Botón de navegación hacia atrás — client component
 */
'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-muted transition-colors"
      aria-label="Volver"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  )
}
