# Estado de tareas

## Tareas implementadas
- **Inicio de sesión persistente con token**: al autenticarse se guarda la sesión (token y usuario) en `localStorage`, y cada petición API adjunta automáticamente `Authorization: Bearer` usando el token almacenado. 【F:src/features/auth/composables/useAuth.ts†L1-L25】【F:src/services/api.ts†L20-L85】【F:src/services/session.ts†L1-L43】
- **Gestor de logs solo para desarrollo**: se añadió un servicio `logger` que activa `log/info/warn/error` en modo dev y los desactiva en build de producción, usado por servicios de red y almacenamiento para depurar sin contaminar la consola en producción. 【F:src/services/logger.ts†L1-L14】【F:src/services/api.ts†L23-L41】【F:src/services/session.ts†L3-L22】

## Tareas pendientes o incompletas
- **Validación en navegador del header Authorization**: falta confirmar con la pestaña Network que `GET /api/plantas` envía el header `Authorization` después de login y que llega al backend (o revisar proxy si se pierde).
- **Pruebas automatizadas**: no se han agregado pruebas unitarias o e2e que cubran autenticación, persistencia de sesión y adjunción del token en llamadas protegidas.

## Próximos pasos sugeridos
1. **Reproducir en navegador**: iniciar sesión, abrir Network y verificar que la request a `/api/plantas` contiene `Authorization: Bearer <token>`; si no aparece, revisar timing del disparo de la llamada y la disponibilidad del token.
2. **Probar contra backend directamente**: usar `curl` o Postman con el token emitido por login desde la misma máquina del frontend para confirmar que el backend acepta la petición con header.
3. **Agregar pruebas**: incorporar tests que aseguren la lectura de sesión desde `localStorage` y la inclusión del token en las peticiones autenticadas.
