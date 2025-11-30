# Estado de tareas

## Tareas implementadas
- **Autenticación alineada al backend**: el login usa `/api/auth/login`, persiste `token` + `expires_in` y limpia la sesión automáticamente al expirar para forzar un nuevo acceso. 【F:src/features/auth/composables/useAuth.ts†L1-L78】
- **Cliente HTTP con bearer token**: todas las peticiones pasan por un cliente compartido que inyecta `Authorization: Bearer <token>` (cuando existe), interpreta los errores `{ "message" }` y exige `VITE_API_BASE_URL`. 【F:src/services/httpClient.ts†L1-L43】
- **UI con restricciones por rol y alcance**: la pantalla de activos limita acciones de creación/edición/borrado según el rol y los IDs de áreas/equipos autorizados, mostrando avisos contextualizados. 【F:src/features/assets/components/AssetsPage.vue†L1-L120】
- **Guía de integración actualizada**: se documentaron los contratos de autenticación, autorización y CRUD que consume el frontend (incluidos payloads y manejo de errores JSON). 【F:docs/frontend-backend-integration.md†L1-L31】
- **Pruebas unitarias de sesión**: se añadieron pruebas de `useAuth` que verifican el login con expiración programada, la hidratación desde `localStorage` y la limpieza de sesiones vencidas. 【F:src/features/auth/composables/useAuth.test.ts†L1-L98】
- **Pruebas e2e de CRUD y permisos**: se añadieron flujos Playwright para el superadministrador (creación jerárquica completa) y para administradores con áreas asignadas que valida formularios deshabilitados y botones bloqueados fuera de alcance. 【F:tests/e2e/crud-permissions.spec.ts†L1-L71】【F:tests/e2e/mockBackend.ts†L1-L144】
- **Validación manual por roles**: se documentó un checklist para revisar la UI como superadministrador, administrador, maquinista e invitado, con expectativas sobre formularios habilitados, mensajes y alcance. 【F:docs/manual-validation.md†L1-L53】
- **Cobertura de flujos negativos**: se agregaron pruebas e2e que cubren credenciales inválidas, tokens expirados/incorrectos y rechazos 403 propagados a la UI. 【F:tests/e2e/negative-flows.spec.ts†L1-L49】【F:tests/e2e/mockBackend.ts†L1-L74】
- **CI de build**: se automatizó `npm run build` en GitHub Actions para prevenir regresiones de compilación.
- **CI de pruebas**: se añadieron flujos de GitHub Actions que ejecutan `npm test` y `npm run test:e2e` (con Playwright) en push y pull request para detectar regresiones.

## Tareas pendientes o incompletas
- Ninguna por ahora.

## Próximos pasos sugeridos
1. Ejecutar las suites e2e en un entorno con Playwright instalado (bloqueado en este entorno) y revisar los videos/trace generados en fallas.
2. Repetir el checklist manual en un entorno integrado con backend real para confirmar resultados observados con el mock.
