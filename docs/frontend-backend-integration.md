# Informe para frontend: estado del backend y expectativas de integración

## Autenticación y sesión
- Endpoint disponible: `POST /api/auth/login` recibe `{ "username", "password" }` y responde `{ token, expires_in, user: { username, role, areas, equipos } }`.
- El frontend persiste `token`, `expires_in` y los claims de usuario en `localStorage` y los limpia automáticamente cuando expiran.
- Todas las rutas `/api` incluyen la cabecera `Authorization: Bearer <token>`; si el token falta o expira, la UI volverá a solicitar autenticación.
- Se pueden sembrar usuarios demo mediante la variable `AUTH_BOOTSTRAP_DEMO_USERS`.

## Roles y autorización
- Roles soportados: `superadministrador`, `administrador`, `maquinista`, `invitado`.
- Alcance por recurso:
  - Plantas: solo `superadministrador` puede crear/editar/eliminar.
  - Áreas/equipos/sistemas: restringidos a `areas`/`equipos` del usuario según su rol; `invitado` es solo lectura.
- Respuestas fuera de alcance retornan `403` con `{ "message": "..." }`.

## Contratos CRUD y validaciones
- Modelos esperados: `Planta { id, nombre }`, `Area { id, nombre, plantaId }`, `Equipo { id, nombre, areaId }`, `Sistema { id, nombre, equipoId }`.
- Creación/edición reciben `{ nombre: string }`; si falta o está vacío devuelven `400` y `{ "message": "El campo 'nombre' es obligatorio" }`.
- Endpoints devuelven el recurso en JSON al crear/actualizar y responden `204` sin cuerpo al eliminar.

## Manejo de errores y formato de respuestas
- Todas las excepciones HTTP (400, 401, 403, 404, 405) y errores inesperados responden `{ "message": string }` en JSON.
- El frontend debe usar `message` cuando `response.ok` sea falso y recurrir a `statusText` solo si no hay JSON.

## Recomendaciones para el frontend
- Configurar `VITE_API_BASE_URL` apuntando al host donde vive `/api`.
- Reenviar siempre el token y gestionar su expiración con `expires_in` (reanudar sesión cuando sea necesario).
- Tras crear/editar, refrescar la lista usando el recurso que devuelve el backend para mantener la UI sincronizada.
- Mantener restricciones de UI basadas en `role`/`areas`/`equipos`, pero considerar que el backend validará el alcance y puede rechazar acciones.
