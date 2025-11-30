import type {
  Area,
  AreaPayload,
  Equipo,
  EquipoPayload,
  Planta,
  PlantaPayload,
  Sistema,
  SistemaPayload,
} from '../types/assets'
import type { AuthUser } from '../features/auth/types'
import { getAuthToken } from './session'
import { logger } from './logger'

const baseUrl = import.meta.env.VITE_API_BASE_URL

if (!baseUrl) {
  throw new Error('VITE_API_BASE_URL no está definido. Verifica el archivo .env.')
}

type RequestOptions = RequestInit & { auth?: boolean; parseResponse?: boolean }

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, parseResponse = true, ...requestOptions } = options
  const token = auth ? getAuthToken() : null
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(requestOptions.headers || {}),
    },
    ...requestOptions,
  }).catch((error) => {
    logger.error('Error de red', error)
    throw new Error(
      'No se pudo conectar con el servidor. Verifica tu conexión o que el backend esté disponible.',
    )
  })

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  if (!response.ok) {
    let message = response.statusText
    try {
      if (isJson) {
        const errorBody = await response.json()
        message = errorBody.message || message
      } else {
        const errorText = await response.text()
        if (errorText.trim()) {
          message = errorText
        }
      }
    } catch (error) {
      logger.warn('No se pudo parsear el cuerpo de error', error)
    }

    throw new Error(message)
  }

  if (!parseResponse || response.status === 204) {
    return undefined as T
  }

  if (!isJson) {
    throw new Error('La respuesta del servidor no tiene un formato JSON válido.')
  }

  return (await response.json()) as T
}

interface RawLoginResponse {
  token?: string
  access_token?: string
  user?: AuthUser
}

export interface LoginSuccess {
  token: string
  user: AuthUser
}

export async function login({
  username,
  password,
}: {
  username: string
  password: string
}): Promise<LoginSuccess> {
  const response = await request<RawLoginResponse>('/auth/login', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ username, password }),
  })

  const token = response.token || response.access_token

  if (!token) {
    throw new Error('La respuesta de autenticación no incluye un token.')
  }

  if (!response.user) {
    throw new Error('La respuesta de autenticación no incluye la información de usuario.')
  }

  return { token, user: response.user }
}

export function getPlantas(): Promise<Planta[]> {
  return request<Planta[]>('/plantas')
}

export function createPlanta(payload: PlantaPayload): Promise<Planta> {
  return request<Planta>('/plantas', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updatePlanta(id: number, payload: PlantaPayload): Promise<Planta> {
  return request<Planta>(`/plantas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deletePlanta(id: number): Promise<void> {
  return request<void>(`/plantas/${id}`, {
    method: 'DELETE',
    parseResponse: false,
  })
}

export function getAreas(plantaId: number): Promise<Area[]> {
  return request<Area[]>(`/plantas/${plantaId}/areas`)
}

export function createArea(plantaId: number, payload: AreaPayload): Promise<Area> {
  return request<Area>(`/plantas/${plantaId}/areas`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateArea(id: number, payload: AreaPayload): Promise<Area> {
  return request<Area>(`/areas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteArea(id: number): Promise<void> {
  return request<void>(`/areas/${id}`, {
    method: 'DELETE',
    parseResponse: false,
  })
}

export function getEquipos(areaId: number): Promise<Equipo[]> {
  return request<Equipo[]>(`/areas/${areaId}/equipos`)
}

export function createEquipo(areaId: number, payload: EquipoPayload): Promise<Equipo> {
  return request<Equipo>(`/areas/${areaId}/equipos`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateEquipo(id: number, payload: EquipoPayload): Promise<Equipo> {
  return request<Equipo>(`/equipos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteEquipo(id: number): Promise<void> {
  return request<void>(`/equipos/${id}`, {
    method: 'DELETE',
    parseResponse: false,
  })
}

export function getSistemas(equipoId: number): Promise<Sistema[]> {
  return request<Sistema[]>(`/equipos/${equipoId}/sistemas`)
}

export function createSistema(equipoId: number, payload: SistemaPayload): Promise<Sistema> {
  return request<Sistema>(`/equipos/${equipoId}/sistemas`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateSistema(id: number, payload: SistemaPayload): Promise<Sistema> {
  return request<Sistema>(`/sistemas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteSistema(id: number): Promise<void> {
  return request<void>(`/sistemas/${id}`, {
    method: 'DELETE',
    parseResponse: false,
  })
}
