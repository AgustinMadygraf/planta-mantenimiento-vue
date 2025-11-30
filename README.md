# Planta Mantenimiento – Frontend (Vue 3 + TypeScript)

SPA para gestión jerárquica de activos (Planta → Áreas → Equipos → Sistemas) con control de permisos por rol. El frontend consume una API REST y usa credenciales demo para validar flujos de autenticación y autorización.

## Stack
- **Framework**: Vue 3 + TypeScript + Vite.
- **UI**: Bootstrap 5.
- **Estado / Composables**: Composition API; lógica de jerarquía en `useAssetHierarchy` y permisos en `AssetsPage`.
- **Cliente HTTP**: `fetch` con wrapper en `src/services/api.ts`.

## Roles y credenciales demo
Los roles y alcances se definen en `src/features/auth/types.ts` y se cargan en memoria desde `useAuth`.

| Rol | Usuario / Contraseña | Alcance |
| --- | --- | --- |
| Superadministrador | `superadmin` / `superadmin` | Acceso total a plantas, áreas, equipos y sistemas. |
| Administrador de área | `admin-area` / `admin-area` | Gestión solo de las áreas asignadas (`areas: [1]`). |
| Maquinista | `maquinista` / `maquinista` | Gestión solo de los equipos asignados (`equipos: [1, 2]`). |
| Invitado | `invitado` / `invitado` | Solo lectura. |

## Configuración y ejecución
1. Instalar dependencias: `npm install`
2. Definir `VITE_API_BASE_URL` en `.env` apuntando a la API (ej. `http://localhost:8000`).
3. Ejecutar en desarrollo: `npm run dev`
4. Compilar para producción: `npm run build`

## API esperada (frontend)
Las llamadas se centralizan en `src/services/api.ts` y esperan las siguientes rutas base:
- `GET /plantas` – Lista plantas.
- `POST /plantas` – Crea planta (`{ nombre }`).
- `PUT /plantas/:id` – Actualiza planta (`{ nombre }`).
- `DELETE /plantas/:id` – Elimina planta.
- `GET /plantas/:plantaId/areas` – Lista áreas de una planta.
- `POST /plantas/:plantaId/areas` – Crea área (`{ nombre }`).
- `PUT /areas/:id` – Actualiza área (`{ nombre }`).
- `DELETE /areas/:id` – Elimina área.
- `GET /areas/:areaId/equipos` – Lista equipos de un área.
- `POST /areas/:areaId/equipos` – Crea equipo (`{ nombre }`).
- `PUT /equipos/:id` – Actualiza equipo (`{ nombre }`).
- `DELETE /equipos/:id` – Elimina equipo.
- `GET /equipos/:equipoId/sistemas` – Lista sistemas de un equipo.
- `POST /equipos/:equipoId/sistemas` – Crea sistema (`{ nombre }`).
- `PUT /sistemas/:id` – Actualiza sistema (`{ nombre }`).
- `DELETE /sistemas/:id` – Elimina sistema.

## Comportamiento de permisos en la UI
- Las acciones de creación/edición/borrado se habilitan según `role` y los IDs de `areas`/`equipos` del usuario autenticado.
- Las restricciones muestran avisos de tipo `warning` sin bloquear la navegación.
- La selección de planta/área/equipo sincroniza formularios y listas para evitar estados inconsistentes.

## Próximos pasos sugeridos
- Añadir pruebas unitarias y de integración para flujos de autenticación y permisos.
- Conectar el login a la API real con emisión/refresh de tokens y claims de alcance.
- Validar en backend el alcance por recurso (planta/área/equipo) para evitar dependencia de la lógica de UI.
