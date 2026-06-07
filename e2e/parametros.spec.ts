/**
 * @system     FlowAluminio
 * @module     e2e/parametros.spec.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton · VERA
 * @created    2026-06-06
 * @summary    E2E: /superadmin/parametros — editar empresa, crear planta, toggle activo
 */
import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill('admin@flowaluminio.ai')
  await page.getByLabel(/contraseña|password/i).fill('NuevaClave123!')
  await page.getByRole('button', { name: /ingresar|entrar|login/i }).click()
  await page.waitForURL('**/dashboard/superadmin', { timeout: 30_000 })
  await page.goto('/superadmin/parametros')
})

test('crear nueva planta', async ({ page }) => {
  const nombre = `Planta E2E ${Date.now()}`

  const input = page.locator('input[placeholder="Nueva planta..."]')
  await input.fill(nombre)
  await input.press('Enter')
  // Esperar confirmación de éxito (input se vacía) luego recargar para ver el dato nuevo
  await expect(input).toHaveValue('', { timeout: 15_000 })
  await page.reload()
  await expect(page.getByText(nombre)).toBeVisible({ timeout: 10_000 })
})

test('crear nueva categoría de gasto', async ({ page }) => {
  const nombre = `Cat E2E ${Date.now()}`

  const input = page.locator('input[placeholder="Nueva categoría..."]')
  await input.fill(nombre)
  await input.press('Enter')
  await expect(input).toHaveValue('', { timeout: 15_000 })
  await page.reload()
  await expect(page.getByText(nombre)).toBeVisible({ timeout: 10_000 })
})
