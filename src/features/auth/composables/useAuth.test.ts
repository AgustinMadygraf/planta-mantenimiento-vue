// @ts-nocheck
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const STORAGE_KEY = 'planta-mantenimiento.session'

vi.mock('../../../services/auth', () => ({
  login: vi.fn(),
}))

function createStorage() {
  const store = new Map<string, string>()

  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    clear: () => store.clear(),
  }
}

function mockLoginResponse(overrides: Partial<Awaited<ReturnType<typeof import('../../../services/auth').login>>> = {}) {
  return {
    token: 'token-123',
    expires_in: 60,
    user: {
      username: 'demo',
      role: 'administrador',
      areas: [],
      equipos: [],
    },
    ...overrides,
  }
}

describe('useAuth', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T00:00:00Z'))
    const storage = createStorage()
    // @ts-expect-error minimal window mock for browser-only APIs
    globalThis.window = {
      localStorage: storage,
      setTimeout,
      clearTimeout,
    }
    // Vitest references localStorage directly in the session helper
    // @ts-expect-error provide global localStorage shim
    globalThis.localStorage = storage
    vi.resetModules()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
    // @ts-expect-error cleanup window mock
    delete globalThis.window
    // @ts-expect-error cleanup storage shim
    delete globalThis.localStorage
  })

  it('logs in, persists the session, and schedules logout on expiry', async () => {
    const { login: loginRequest } = await import('../../../services/auth')
    vi.mocked(loginRequest).mockResolvedValue(mockLoginResponse())

    const { useAuth } = await import('./useAuth')
    const { login, user, token, expiresAt } = useAuth()

    await login(' demo ', ' secret ')

    expect(loginRequest).toHaveBeenCalledWith('demo', 'secret')
    expect(user.value?.username).toBe('demo')
    expect(token.value).toBe('token-123')
    expect(expiresAt.value).toBe(Date.now() + 60_000)

    const stored = localStorage.getItem(STORAGE_KEY)
    expect(stored).not.toBeNull()

    vi.advanceTimersByTime(60_000)

    expect(user.value).toBeNull()
    expect(token.value).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('hydrates an existing valid session on start', async () => {
    const persisted = mockLoginResponse({ expires_in: 120 })
    const expiresAt = Date.now() + persisted.expires_in * 1000
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: persisted.token,
        expiresAt,
        user: persisted.user,
      }),
    )

    const { useAuth } = await import('./useAuth')
    const { token, user, expiresAt: expiresAtRef } = useAuth()

    expect(token.value).toBe(persisted.token)
    expect(user.value?.role).toBe('administrador')
    expect(expiresAtRef.value).toBe(expiresAt)
  })

  it('clears expired sessions during hydration and on logout', async () => {
    const expiredAt = Date.now() - 1_000
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token: 'stale',
        expiresAt: expiredAt,
        user: mockLoginResponse().user,
      }),
    )

    const { useAuth } = await import('./useAuth')
    const { token, user, logout } = useAuth()

    expect(token.value).toBeNull()
    expect(user.value).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

    // repopulate and verify logout clears persisted state
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: 'active', expiresAt: Date.now() + 1_000, user: mockLoginResponse().user }),
    )

    await logout()

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
