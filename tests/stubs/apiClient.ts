import type { RequestOptions } from "../../src/services/apiClient"

const captured: Array<{ path: string; options: RequestOptions }> = []
const demoJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE5MDg1MjgwMDB9.signature"

export function clearCaptured() {
  captured.splice(0, captured.length)
}

export function getCaptured() {
  return captured
}

export async function request(path: string, options: RequestOptions = {}) {
  captured.push({ path, options })
  const { auth = true, ...rest } = options

  if (path === "/auth/login") {
    if (rest.body && typeof rest.body === "string") {
      const parsed = JSON.parse(rest.body)
      if (parsed.username === "superadmin" && parsed.password === "superadmin") {
        return {
          access_token: demoJwt,
          user: { username: "superadmin", role: "superadministrador" },
          expires_in: 60,
          refresh_token: "refresh-token-demo",
        }
      }
    }
    const error: any = new Error("Credenciales inválidas")
    error.status = 401
    throw error
  }

  if (auth && !rest.headers) {
    throw new Error("Missing headers when auth is requested")
  }

  return {} as any
}
