/**
 * @system     FlowAluminio
 * @module     e2e/auth.spec.ts
 * @copyright  © 2026 Gustavo Berton
 * @author     Gustavo Berton · VERA
 * @created    2026-06-06
 * @summary    E2E: login por rol → redirección al dashboard correcto
 */
import { test, expect } from '@playwright/test'

const USUARIOS = [
  {
    email:     'operaciones@gmarteletti.test',
    password:  'Test1234!',
    dashboard: '/dashboard/operaciones',
    heading:   'Operaciones',
  },
  {
    email:     'comercial@gmarteletti.test',
    password:  'Test1234!',
    dashboard: '/dashboard/comercial',
    heading:   'Comercial',
  },
  {
    email:     'admin@gmarteletti.test',
    password:  'Test1234!',
    dashboard: '/dashboard/administracion',
    heading:   'Administración',
  },
]

for (const { email, password, dashboard, heading } of USUARIOS) {
  test(`login ${email} → ${dashboard}`, async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/contraseña|password/i).fill(password)
    await page.getByRole('button', { name: /ingresar|entrar|login/i }).click()

    await page.waitForURL(`**${dashboard}`, { timeout: 30_000 })
    await expect(page).toHaveURL(new RegExp(dashboard))
    await expect(page.getByRole('heading', { name: heading })).toBeVisible()
  })

  test(`logout desde ${dashboard}`, async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/contraseña|password/i).fill(password)
    await page.getByRole('button', { name: /ingresar|entrar|login/i }).click()
    await page.waitForURL(`**${dashboard}`, { timeout: 30_000 })

    await page.getByRole('button', { name: /cerrar sesión/i }).click()
    await page.waitForURL('**/login', { timeout: 15_000 })
    await expect(page).toHaveURL(/login/)
  })
}
