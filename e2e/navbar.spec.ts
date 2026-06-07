/**
 * @system     FlowAluminio
 * @module     e2e/navbar.spec.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton · VERA
 * @created    2026-06-06
 * @summary    E2E: NavBar — ítem activo resaltado al navegar
 */
import { test, expect } from '@playwright/test'

async function loginAs(page: any, email: string, password: string) {
  await page.goto('/login')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/contraseña|password/i).fill(password)
  await page.getByRole('button', { name: /ingresar|entrar|login/i }).click()
  await page.waitForURL((url: URL) => !url.pathname.includes('/login'), { timeout: 30_000 })
}

test('navbar operaciones — resalta ítem activo', async ({ page }) => {
  await loginAs(page, 'operaciones@gmarteletti.test', 'Test1234!')
  await page.goto('/operaciones/recepcion')
  const link = page.getByRole('link', { name: /recepción/i })
  await expect(link).toHaveClass(/text-primary/)
})

test('navbar admin — resalta ítem activo', async ({ page }) => {
  await loginAs(page, 'admin@gmarteletti.test', 'Test1234!')
  await page.goto('/admin/gastos')
  const link = page.getByRole('link', { name: /gastos/i })
  await expect(link).toHaveClass(/text-primary/)
})

test('navbar superadmin — resalta ítem activo', async ({ page }) => {
  await loginAs(page, 'admin@flowaluminio.ai', 'NuevaClave123!')
  await page.goto('/superadmin/usuarios')
  const link = page.getByRole('link', { name: /usuarios/i })
  await expect(link).toHaveClass(/text-primary/)
})
