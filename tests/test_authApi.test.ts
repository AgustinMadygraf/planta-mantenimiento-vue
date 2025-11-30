import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it, mock } from 'node:test'

// @ts-ignore - resolves to the emitted JS build during tests
import { __resetAuthRequest, __setAuthRequest, login } from '../src/features/auth/services/authApi.js'

const requestMock = mock.fn()

beforeEach(() => {
  requestMock.mock.resetCalls()
  requestMock.mock.mockImplementation(() => Promise.resolve(null))
})

afterEach(() => {
  __resetAuthRequest()
})

describe('login', () => {
  it('maps root-level fields into LoginSuccess', async () => {
    requestMock.mock.mockImplementation(async () => ({
      token: 'root-token',
      user: { username: 'sam', role: 'maquinista' },
    }))

    __setAuthRequest(requestMock as any)

    const result = await login({ username: 'sam', password: 'pw' })

    assert.equal(result.token, 'root-token')
    assert.equal(result.refreshToken, null)
    assert.equal(result.user.username, 'sam')
    assert.equal(result.user.role, 'maquinista')
    assert.ok(!result.expiresAt)
    assert.equal(requestMock.mock.callCount(), 1)
  })

  it('reads nested payloads and alternate user fields', async () => {
    requestMock.mock.mockImplementation(async () => ({
      data: {
        access_token: 'nested-token',
        refresh_token: 'refresh-1',
        expires_in: 10,
        usuario: {
          usuario: 'admin-area',
          rol: 'admin',
          area_ids: [2],
          equipo_ids: ['7'],
        },
      },
    }))

    __setAuthRequest(requestMock as any)

    const result = await login({ username: 'admin-area', password: 'pw' })

    assert.equal(result.token, 'nested-token')
    assert.equal(result.refreshToken, 'refresh-1')
    assert.equal(result.user.username, 'admin-area')
    assert.equal(result.user.role, 'administrador')
    assert.deepEqual(result.user.areas, [2])
    assert.deepEqual(result.user.equipos, [7])
    assert.ok(typeof result.expiresAt === 'number')
  })

  it('falls back to demo users when no user is returned', async () => {
    requestMock.mock.mockImplementation(async () => ({
      token: 'demo-token',
      refresh_token: null,
      expires_in: null,
    }))

    __setAuthRequest(requestMock as any)

    const result = await login({ username: 'invitado', password: 'pw' })

    assert.equal(result.user.username, 'invitado')
    assert.equal(result.user.role, 'invitado')
    assert.equal(result.refreshToken, null)
    assert.equal(result.expiresAt, null)
  })
})
