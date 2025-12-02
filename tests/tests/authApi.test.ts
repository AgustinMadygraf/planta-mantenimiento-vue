import test from "node:test"
import { strict as assert } from "node:assert"
import { clearCaptured, getCaptured, request as stubRequest } from "../stubs/apiClient.js"
import { __resetAuthRequest, __setAuthRequest, login } from "../../src/features/auth/services/authApi.js"

function setup() {
  __resetAuthRequest()
  clearCaptured()
  __setAuthRequest(stubRequest)
}

test("login ok: returns session and records Authorization flow", async () => {
  setup()

  const session = await login({ username: "superadmin", password: "superadmin" })

  assert.equal(session.user.username, "superadmin")
  assert.equal(session.user.role, "superadministrador")
  assert.ok(session.token, "token should be present")
  assert.ok(session.expiresAt, "expiresAt should be derived")

  const calls = getCaptured()
  assert.equal(calls.length, 1)
  assert.equal(calls[0].path, "/auth/login")
  assert.equal(calls[0].options.method, "POST")
})

test("login 401 bubbles error message", async () => {
  setup()

  await assert.rejects(async () => {
    await login({ username: "invitado", password: "wrong" })
  }, /Credenciales inválidas/)
})
