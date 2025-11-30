/*
Path: tests/stubs/apiClient.ts
*/

export async function request(path, options) {
  if (path === '/auth/login' && options?.method === 'POST') {
    const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {};
    const { username, password } = body;
    // Usuarios demo
    const demoUsers = {
      'superadmin': { username: 'superadmin', role: 'superadministrador' },
      'admin-area': { username: 'admin-area', role: 'administrador', areas: [1] },
      'maquinista': { username: 'maquinista', role: 'maquinista', equipos: [1, 2] },
      'invitado': { username: 'invitado', role: 'invitado' },
    };
    if (demoUsers[username] && password === username) {
      // Genera expiresAt válido (1 hora en el futuro)
      const expiresAt = Date.now() + 3600 * 1000;
      return {
        token: 'demo-token',
        refreshToken: null,
        expiresAt,
        user: demoUsers[username],
      };
    }
    throw new Error('Credenciales inválidas para usuario demo');
  }
  throw new Error('request should be mocked in tests');
}
}
