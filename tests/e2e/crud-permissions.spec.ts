import { test, expect } from '@playwright/test'
import { setupMockBackend } from './mockBackend'
import type { AuthUser } from '../../src/features/auth/types'

const superAdminUser: AuthUser = {
  username: 'super',
  role: 'superadministrador',
  areas: [],
  equipos: [],
}

const adminUser: AuthUser = {
  username: 'admin',
  role: 'administrador',
  areas: [1],
  equipos: [2],
}

test.describe('Gestión de activos con permisos', () => {
  test('el superadministrador puede recorrer el CRUD completo', async ({ page }) => {
    await setupMockBackend(page, superAdminUser)

    await page.goto('/')
    await page.getByLabel('Usuario').fill('super')
    await page.getByLabel('Contraseña').fill('demo')
    await page.getByRole('button', { name: 'Acceder' }).click()

    await expect(page.getByText('Acceso total para crear, editar y eliminar en toda la planta.')).toBeVisible()

    await page.locator('#planta-nombre').fill('Planta Norte')
    await page.getByRole('button', { name: 'Crear planta' }).click()
    await expect(page.getByRole('button', { name: 'Planta Norte' })).toBeVisible()

    await page.getByRole('button', { name: 'Planta Norte' }).click()
    await page.locator('#area-nombre').fill('Área A1')
    await page.getByRole('button', { name: 'Crear área' }).click()
    await expect(page.getByRole('button', { name: 'Área A1' })).toBeVisible()

    await page.getByRole('button', { name: 'Área A1' }).click()
    await page.locator('#equipo-nombre').fill('Equipo E1')
    await page.getByRole('button', { name: 'Crear equipo' }).click()
    await expect(page.getByRole('button', { name: 'Equipo E1' })).toBeVisible()

    await page.getByRole('button', { name: 'Equipo E1' }).click()
    await page.locator('#sistema-nombre').fill('Sistema S1')
    await page.getByRole('button', { name: 'Crear sistema' }).click()
    await expect(page.getByRole('button', { name: 'Sistema S1' })).toBeVisible()

    await page.once('dialog', (dialog) => dialog.accept())
    await page.locator('.list-group-item', { hasText: 'Sistema S1' }).getByRole('button', { name: 'Eliminar' }).click()
    await expect(page.getByRole('button', { name: 'Sistema S1' })).toHaveCount(0)
  })

  test('un administrador solo gestiona áreas asignadas y no puede crear plantas', async ({ page }) => {
    await setupMockBackend(page, adminUser, {
      plantas: [
        { id: 1, nombre: 'Planta Central' },
      ],
      areas: [
        { id: 1, nombre: 'Área Autorizada', plantaId: 1 },
        { id: 2, nombre: 'Área Restringida', plantaId: 1 },
      ],
      equipos: [
        { id: 2, nombre: 'Equipo Propio', areaId: 1 },
      ],
      sistemas: [],
    })

    await page.goto('/')
    await page.getByLabel('Usuario').fill('admin')
    await page.getByLabel('Contraseña').fill('demo')
    await page.getByRole('button', { name: 'Acceder' }).click()

    await expect(page.getByText('Gestión limitada a su área asignada (IDs: 1).')).toBeVisible()
    await expect(page.locator('#planta-nombre')).toBeDisabled()
    await expect(page.getByRole('button', { name: 'Crear planta' })).toBeDisabled()

    await page.getByRole('button', { name: 'Planta Central' }).click()
    await expect(page.getByRole('button', { name: 'Área Autorizada' })).toBeVisible()

    const autorizado = page.locator('.list-group-item', { hasText: 'Área Autorizada' })
    await expect(autorizado.getByRole('button', { name: 'Editar' })).toBeEnabled()

    const restringido = page.locator('.list-group-item', { hasText: 'Área Restringida' })
    await expect(restringido.getByRole('button', { name: 'Editar' })).toBeDisabled()
    await expect(restringido.getByRole('button', { name: 'Eliminar' })).toBeDisabled()
  })
})
