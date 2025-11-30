import type { Page, Route } from '@playwright/test'
import type { AuthUser } from '../../src/features/auth/types'
import type { Area, Equipo, Planta, Sistema } from '../../src/types/assets'

export type MockUser = AuthUser

export type MockData = {
  plantas: Planta[]
  areas: Area[]
  equipos: Equipo[]
  sistemas: Sistema[]
}

export type MockBackendOptions = {
  credentials?: { username: string; password: string }
  token?: string
  expiresIn?: number
  expectedToken?: string
  deny?: Array<{ method: string; path: RegExp; status?: number; message?: string }>
}

function createInitialData(overrides?: Partial<MockData>): MockData {
  return {
    plantas: [],
    areas: [],
    equipos: [],
    sistemas: [],
    ...overrides,
  }
}

function nextId(list: { id: number }[]): number {
  const max = list.reduce((acc, item) => Math.max(acc, item.id), 0)
  return max + 1
}

export async function setupMockBackend(
  page: Page,
  user: MockUser,
  seed?: Partial<MockData>,
  options?: MockBackendOptions,
) {
  const data = createInitialData(seed)
  const credentials = options?.credentials || { username: user.username, password: 'demo' }
  const token = options?.token || 'fake-token'
  const expiresIn = options?.expiresIn ?? 3600
  const denyRules = options?.deny || []

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname.replace('/api', '')
    const method = route.request().method()
    const forcedDeny = denyRules.find((rule) => rule.method === method && rule.path.test(path))

    if (path === '/auth/login' && method === 'POST') {
      const body = (await route.request().postDataJSON()) as { username: string; password: string }
      if (body.username !== credentials.username || body.password !== credentials.password) {
        return route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Credenciales inválidas' }),
        })
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token, expires_in: expiresIn, user }),
      })
    }

    if (forcedDeny) {
      return route.fulfill({
        status: forcedDeny.status || 403,
        contentType: 'application/json',
        body: JSON.stringify({ message: forcedDeny.message || 'Acceso denegado' }),
      })
    }

    const authorization = route.request().headers()['authorization']

    if (!authorization) {
      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Token requerido' }),
      })
    }

    if (options?.expectedToken && authorization !== `Bearer ${options.expectedToken}`) {
      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Token expirado o inválido' }),
      })
    }

    if (path === '/plantas' && method === 'GET') {
      return fulfillJson(route, data.plantas)
    }

    if (path === '/plantas' && method === 'POST') {
      const body = (await route.request().postDataJSON()) as { nombre: string }
      const planta: Planta = { id: nextId(data.plantas), nombre: body.nombre }
      data.plantas.push(planta)
      return fulfillJson(route, planta)
    }

    const plantaMatch = path.match(/^\/plantas\/(\d+)$/)
    if (plantaMatch && method === 'PUT') {
      const plantaId = Number(plantaMatch[1])
      const body = (await route.request().postDataJSON()) as { nombre: string }
      const planta = data.plantas.find((item) => item.id === plantaId)
      if (!planta) return missing(route, 'Planta no encontrada')
      planta.nombre = body.nombre
      return fulfillJson(route, planta)
    }

    if (plantaMatch && method === 'DELETE') {
      const plantaId = Number(plantaMatch[1])
      const exists = data.plantas.some((item) => item.id === plantaId)
      if (!exists) return missing(route, 'Planta no encontrada')
      data.plantas = data.plantas.filter((item) => item.id !== plantaId)
      data.areas = data.areas.filter((item) => item.plantaId !== plantaId)
      data.equipos = data.equipos.filter((item) => data.areas.some((area) => area.id === item.areaId))
      data.sistemas = data.sistemas.filter((item) => data.equipos.some((equipo) => equipo.id === item.equipoId))
      return route.fulfill({ status: 204, body: '' })
    }

    const areaIndex = path.match(/^\/plantas\/(\d+)\/areas$/)
    if (areaIndex && method === 'GET') {
      const plantaId = Number(areaIndex[1])
      return fulfillJson(route, data.areas.filter((item) => item.plantaId === plantaId))
    }

    if (areaIndex && method === 'POST') {
      const plantaId = Number(areaIndex[1])
      const body = (await route.request().postDataJSON()) as { nombre: string }
      const area: Area = { id: nextId(data.areas), nombre: body.nombre, plantaId }
      data.areas.push(area)
      return fulfillJson(route, area)
    }

    const areaMatch = path.match(/^\/areas\/(\d+)$/)
    if (areaMatch && method === 'PUT') {
      const areaId = Number(areaMatch[1])
      const body = (await route.request().postDataJSON()) as { nombre: string }
      const area = data.areas.find((item) => item.id === areaId)
      if (!area) return missing(route, 'Área no encontrada')
      area.nombre = body.nombre
      return fulfillJson(route, area)
    }

    if (areaMatch && method === 'DELETE') {
      const areaId = Number(areaMatch[1])
      const exists = data.areas.some((item) => item.id === areaId)
      if (!exists) return missing(route, 'Área no encontrada')
      data.areas = data.areas.filter((item) => item.id !== areaId)
      data.equipos = data.equipos.filter((item) => item.areaId !== areaId)
      data.sistemas = data.sistemas.filter((item) => data.equipos.some((equipo) => equipo.id === item.equipoId))
      return route.fulfill({ status: 204, body: '' })
    }

    const equiposIndex = path.match(/^\/areas\/(\d+)\/equipos$/)
    if (equiposIndex && method === 'GET') {
      const areaId = Number(equiposIndex[1])
      return fulfillJson(route, data.equipos.filter((item) => item.areaId === areaId))
    }

    if (equiposIndex && method === 'POST') {
      const areaId = Number(equiposIndex[1])
      const body = (await route.request().postDataJSON()) as { nombre: string }
      const equipo: Equipo = { id: nextId(data.equipos), nombre: body.nombre, areaId }
      data.equipos.push(equipo)
      return fulfillJson(route, equipo)
    }

    const equipoMatch = path.match(/^\/equipos\/(\d+)$/)
    if (equipoMatch && method === 'PUT') {
      const equipoId = Number(equipoMatch[1])
      const body = (await route.request().postDataJSON()) as { nombre: string }
      const equipo = data.equipos.find((item) => item.id === equipoId)
      if (!equipo) return missing(route, 'Equipo no encontrado')
      equipo.nombre = body.nombre
      return fulfillJson(route, equipo)
    }

    if (equipoMatch && method === 'DELETE') {
      const equipoId = Number(equipoMatch[1])
      const exists = data.equipos.some((item) => item.id === equipoId)
      if (!exists) return missing(route, 'Equipo no encontrado')
      data.equipos = data.equipos.filter((item) => item.id !== equipoId)
      data.sistemas = data.sistemas.filter((item) => item.equipoId !== equipoId)
      return route.fulfill({ status: 204, body: '' })
    }

    const sistemaIndex = path.match(/^\/equipos\/(\d+)\/sistemas$/)
    if (sistemaIndex && method === 'GET') {
      const equipoId = Number(sistemaIndex[1])
      return fulfillJson(route, data.sistemas.filter((item) => item.equipoId === equipoId))
    }

    if (sistemaIndex && method === 'POST') {
      const equipoId = Number(sistemaIndex[1])
      const body = (await route.request().postDataJSON()) as { nombre: string }
      const sistema: Sistema = { id: nextId(data.sistemas), nombre: body.nombre, equipoId }
      data.sistemas.push(sistema)
      return fulfillJson(route, sistema)
    }

    const sistemaMatch = path.match(/^\/sistemas\/(\d+)$/)
    if (sistemaMatch && method === 'PUT') {
      const sistemaId = Number(sistemaMatch[1])
      const body = (await route.request().postDataJSON()) as { nombre: string }
      const sistema = data.sistemas.find((item) => item.id === sistemaId)
      if (!sistema) return missing(route, 'Sistema no encontrado')
      sistema.nombre = body.nombre
      return fulfillJson(route, sistema)
    }

    if (sistemaMatch && method === 'DELETE') {
      const sistemaId = Number(sistemaMatch[1])
      const exists = data.sistemas.some((item) => item.id === sistemaId)
      if (!exists) return missing(route, 'Sistema no encontrado')
      data.sistemas = data.sistemas.filter((item) => item.id !== sistemaId)
      return route.fulfill({ status: 204, body: '' })
    }

    return route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Ruta no mockeada', path }),
    })
  })
}

function missing(route: Route, message: string) {
  return route.fulfill({
    status: 404,
    contentType: 'application/json',
    body: JSON.stringify({ message }),
  })
}

function fulfillJson(route: Route, payload: unknown) {
  return route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(payload),
  })
}
