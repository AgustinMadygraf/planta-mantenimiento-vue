/*
Path: tests/stubs/apiClient.ts
*/

export async function request(path: string, options?: { method?: string; body?: any }) {
  if (path === '/auth/login' && options?.method === 'POST') {
    const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {};
    const username: keyof typeof demoUsers = body.username as keyof typeof demoUsers;
    const password: string = body.password;
    // Usuarios demo
    const demoUsers = {
      'superadmin': { username: 'superadmin', role: 'superadministrador' },
      'admin-area': { username: 'admin-area', role: 'administrador', areas: [1] },
      'maquinista': { username: 'maquinista', role: 'maquinista', equipos: [1, 2] },
      'invitado': { username: 'invitado', role: 'invitado' },
    };
    if (Object.prototype.hasOwnProperty.call(demoUsers, username) && password === username) {
      // Genera expiresAt válido (1 hora en el futuro)
      const expiresIn = 3600; // segundos
      const expiresAt = Date.now() + expiresIn * 1000;
      console.log('[stub] expiresAt:', expiresAt, 'expires_in:', expiresIn);
      const sessionObj = {
        token: 'demo-token',
        refreshToken: null,
        expiresAt,
        expires_in: expiresIn,
        user: demoUsers[username],
      };
      console.log('[stub] login response:', sessionObj);
      return sessionObj;
    }
    throw new Error('Credenciales inválidas para usuario demo');
  }
  throw new Error('request should be mocked in tests');
}
