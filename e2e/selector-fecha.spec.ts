/**
 * @system     FlowAluminio
 * @module     e2e/selector-fecha.spec.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton · VERA
 * @created    2026-06-06
 * @summary    E2E: SelectorFecha — prev/next actualizan ?fecha= en URL
 */
import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill('operaciones@gmarteletti.test')
  await page.getByLabel(/contraseña|password/i).fill('Test1234!')
  await page.getByRole('button', { name: /ingresar|entrar|login/i }).click()
  await page.waitForURL('**/dashboard/operaciones', { timeout: 30_000 })
})

test('SelectorFecha — botón prev retrocede un día', async ({ page }) => {
  await page.goto('/operaciones/recepcion')

  const urlAntes = new URL(page.url())
  const fechaAntes = urlAntes.searchParams.get('fecha') ?? new Date().toISOString().slice(0, 10)

  await page.getByRole('button', { name: /anterior|prev|◀|←/i }).first().click()
  await page.waitForURL(/fecha=/, { timeout: 5_000 })

  const urlDespues = new URL(page.url())
  const fechaDespues = urlDespues.searchParams.get('fecha')

  expect(fechaDespues).toBeTruthy()
  expect(fechaDespues! < fechaAntes).toBeTruthy()
})

test('SelectorFecha — botón next no supera hoy', async ({ page }) => {
  const hoy = new Date().toISOString().slice(0, 10)
  await page.goto(`/operaciones/recepcion?fecha=${hoy}`)

  const btnNext = page.getByRole('button', { name: /siguiente|next|▶|→/i }).first()
  await expect(btnNext).toBeDisabled()
})
