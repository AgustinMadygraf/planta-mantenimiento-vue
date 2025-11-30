import { getActiveSession } from '../features/auth/session'

export const baseUrl = import.meta.env.VITE_API_BASE_URL

if (!baseUrl) {
  throw new Error('VITE_API_BASE_URL no está definido. Verifica el archivo .env.')
}

type RequestOptions = RequestInit & { parseResponse?: boolean; skipAuth?: boolean }

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { parseResponse = true, skipAuth = false, ...requestOptions } = options
  const session = !skipAuth ? getActiveSession() : null

  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(requestOptions.headers || {}),
    },
    ...requestOptions,
  }).catch((error) => {
    console.error('Error de red', error)
    throw new Error('No se pudo conectar con el servidor. Verifica tu conexión o que el backend esté disponible.')
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
      console.warn('No se pudo parsear el cuerpo de error', error)
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
