/**
 * @system     FlowAluminio
 * @module     app/page.tsx
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton
 * @created    2026-06-05
 * @summary    Raíz — redirige a dashboard (el proxy maneja auth)
 */
import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/dashboard')
}
