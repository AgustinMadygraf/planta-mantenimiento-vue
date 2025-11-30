import { expect, test } from '@playwright/test'
import { setupMockBackend } from './mockBackend'
import type { AuthUser } from '../../src/features/auth/types'

const superAdmin: AuthUser = {
  username: 'super',
  role: 'superadministrador',
  areas: [],
  equipos: [],
}

test.describe('Flujos negativos de autenticación y permisos', () => {
  test('muestra el mensaje de credenciales inválidas al fallar el login', async ({ page }) => {
    await setupMockBackend(page, superAdmin, undefined, {
      credentials: { username: 'super', password: 'demo' },
    })

    await page.goto('/')
    await page.getByLabel('Usuario').fill('super')
    await page.getByLabel('Contraseña').fill('mala')
    await page.getByRole('button', { name: 'Acceder' }).click()

    await expect(page.getByRole('alert')).toHaveText(/Credenciales inválidas/)
  })

  test('alerta cuando el backend marca el token como expirado o inválido', async ({ page }) => {
    await setupMockBackend(page, superAdmin, undefined, {
      token: 'expired-token',
      expectedToken: 'fresh-token',
    })

    await page.goto('/')
    await page.getByLabel('Usuario').fill('super')
    await page.getByLabel('Contraseña').fill('demo')
    await page.getByRole('button', { name: 'Acceder' }).click()

    await expect(page.getByRole('alert')).toHaveText(/Token expirado o inválido/)
  })

  test('propaga un 403 del backend al intentar crear sin permiso', async ({ page }) => {
    await setupMockBackend(page, superAdmin, undefined, {
      deny: [
        { method: 'POST', path: /^\/plantas$/, message: 'Acceso denegado por políticas de rol' },
      ],
    })

    await page.goto('/')
    await page.getByLabel('Usuario').fill('super')
    await page.getByLabel('Contraseña').fill('demo')
    await page.getByRole('button', { name: 'Acceder' }).click()

    await page.locator('#planta-nombre').fill('Planta bloqueada')
    await page.getByRole('button', { name: 'Crear planta' }).click()

    await expect(page.getByRole('alert')).toHaveText(/Acceso denegado por políticas de rol/)
  })
})
