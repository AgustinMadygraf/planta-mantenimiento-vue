# Informe técnico para backend

## 1. Resumen ejecutivo
- El frontend ahora soporta cuatro roles (`superadministrador`, `administrador`, `maquinista`, `invitado`) con alcances por áreas y equipos. La UI restringe creación/edición/borrado según esos claims.
- Se consolidó el consumo de la API REST de activos (Planta → Áreas → Equipos → Sistemas) vía `src/services/api.ts`, que exige `VITE_API_BASE_URL` y espera respuestas JSON tipadas.
- Impacto: el backend debe emitir tokens o sesiones con `role`, `areas` (ids) y `equipos` (ids) y validar el alcance en cada endpoint de activos para que la seguridad no dependa de la UI.

## 2. Contexto y alcance
- Pantallas afectadas: login (`LoginCard`), página de gestión de activos (`AssetsPage`), composables de jerarquía y feedback.
- Áreas backend impactadas: autenticación/autorización (emisión de tokens y claims), endpoints CRUD de plantas/áreas/equipos/sistemas y manejo de errores HTTP en JSON.

## 3. Cambios realizados en el frontend
- **Roles y sesión persistente**
  - Se define `UserRole` con los cuatro roles y se guardan los IDs de áreas/equipos en el usuario autenticado. Persistencia en `localStorage` con parseo seguro. 【F:src/features/auth/types.ts†L1-L10】【F:src/features/auth/composables/useAuth.ts†L11-L74】
  - Mensajes de error y ayuda de login listan todas las credenciales demo. 【F:src/features/auth/composables/useAuth.ts†L55-L64】【F:src/features/auth/components/LoginCard.vue†L9-L42】
- **Permisos en gestión de activos**
  - La UI calcula `canManage*` en función del rol y alcances, y bloquea formularios/acciones fuera del scope mostrando avisos `warning`. 【F:src/features/assets/components/AssetsPage.vue†L62-L204】
  - Las operaciones CRUD se delegan a `useAssetHierarchy`, que orquesta cargas, formularios y llamadas HTTP centralizadas. 【F:src/features/assets/composables/useAssetHierarchy.ts†L1-L210】
- **Consumo de API**
  - Wrapper `request` usa `fetch` y exige contenido JSON en respuestas exitosas; parsea errores y devuelve mensajes descriptivos. 【F:src/services/api.ts†L12-L72】
  - Endpoints previstos para plantas, áreas, equipos y sistemas con los payloads `{ nombre }`. 【F:src/services/api.ts†L74-L151】

## 4. Cambios requeridos en el backend
Para alinear la API con la lógica de frontend:

- **Autenticación/Autorización**
  - Incluir en el token (JWT o sesión) los claims `role` (uno de: superadministrador, administrador, maquinista, invitado), `areas: number[]` (solo para administradores) y `equipos: number[]` (solo para maquinistas). Emitir `username` para trazabilidad.
  - Validar en cada endpoint que el usuario tenga alcance sobre la entidad:
    - Plantas: solo `superadministrador` puede crear/editar/eliminar.
    - Áreas: `superadministrador` o `administrador` con `area.id` en `areas`.
    - Equipos/Sistemas: `superadministrador`; `administrador` si el equipo pertenece a un área asignada; `maquinista` si el equipo está en `equipos`.
  - Responder 403 con cuerpo `{ "message": "..." }` cuando el alcance no es suficiente.

- **Endpoints CRUD (método/ruta)**
  - `GET /plantas` → lista accesible para cualquier rol autenticado (o público si aplica).
  - `POST /plantas`, `PUT /plantas/:id`, `DELETE /plantas/:id` → requieren rol `superadministrador`.
  - `GET /plantas/:plantaId/areas` → visible para roles con acceso a la planta; filtrar a las áreas permitidas para administradores.
  - `POST /plantas/:plantaId/areas` → `superadministrador` o `administrador` con `plantaId` y `area` dentro de su alcance.
  - `PUT /areas/:id`, `DELETE /areas/:id` → mismas reglas de alcance que arriba.
  - `GET /areas/:areaId/equipos` → visible si el área está en alcance (administrador) o contiene equipos asignados (maquinista).
  - `POST /areas/:areaId/equipos` → `superadministrador` o `administrador` con el área asignada.
  - `PUT /equipos/:id`, `DELETE /equipos/:id` → `superadministrador`; `administrador` si pertenece a su área; `maquinista` solo si el equipo está en su lista.
  - `GET /equipos/:equipoId/sistemas` → visible si el equipo está en alcance.
  - `POST /equipos/:equipoId/sistemas`, `PUT /sistemas/:id`, `DELETE /sistemas/:id` → mismas reglas de alcance que equipos.

- **Modelos/esquemas**
  - Usuarios deben tener relaciones `areas: [id]` y `equipos: [id]` (opcional según rol).
  - Las entidades usan esquema `{ id: number; nombre: string; ...ParentId }` según `src/types/assets.ts`.

- **Manejo de errores**
  - En respuestas no exitosas, devolver JSON `{ "message": "detalle" }` para que el frontend muestre feedback adecuado.

- **Compatibilidad**
  - Si ya existen endpoints con rutas diferentes, proveer alias o redirecciones temporales para evitar romper el frontend hasta ajustar URLs en `src/services/api.ts`.

## 5. Recomendaciones de implementación
1. Exponer middleware/Depend de autorización por rol+alcance reutilizable en los endpoints de activos.
2. Ajustar esquemas de usuario para incluir `areas`/`equipos` y poblarlos en el token.
3. Validar y normalizar rutas REST a las esperadas; añadir pruebas de autorización por recurso.
4. Definir mensajes de error consistentes (`message`) y códigos HTTP (401/403/404/422) según caso.
5. Considerar paginación futura en listados (`GET`) y campos audit (`created_at`, `updated_at`).

## 6. Checklist para el equipo backend
- [ ] Emitir tokens/sesiones con `role`, `areas`, `equipos`, `username`.
- [ ] Implementar guard/middleware de autorización por recurso (planta/area/equipo/sistema).
- [ ] Alinear rutas REST a las usadas por el frontend o exponer alias equivalentes.
- [ ] Validar payload `{ nombre: string }` en todos los POST/PUT y retornar el recurso creado/actualizado.
- [ ] Estandarizar respuestas de error con `{ "message": string }`.
- [ ] Añadir pruebas de integración para cada rol cubriendo create/update/delete en planta/área/equipo/sistema.
