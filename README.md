# Planta de mantenimiento — Frontend

SPA en Vue 3 + TypeScript que gestiona la jerarquía de activos (Planta → Áreas → Equipos → Sistemas) con control de accesos por rol. Este repositorio contiene solo el frontend; el backend esperado es una API REST (FastAPI recomendado) que expone CRUD jerárquico y autenticación basada en tokens.

## Requisitos
- Node.js 18+
- npm 9+
- Variable de entorno `VITE_API_BASE_URL` apuntando al backend (ej.: `http://localhost:8000`).

## Instalación y scripts
```bash
npm install           # instala dependencias
npm run dev           # arranca Vite en modo desarrollo
npm run build         # compila para producción
npm run preview       # sirva el build local
```

## Credenciales demo y roles
El login es local (no llama al backend) y simula cuatro roles con diferentes alcances:

| Rol                 | Usuario / Clave           | Alcance y edición |
|---------------------|---------------------------|-------------------|
| Superadministrador  | `superadmin` / `superadmin` | Toda la planta. Crea/edita/elimina plantas, áreas, equipos y sistemas. |
| Administrador       | `admin-area` / `admin-area` | Áreas específicas (`areas: [1]`). Gestiona áreas y equipos de esas áreas. |
| Maquinista          | `maquinista` / `maquinista` | Equipos asignados (`equipos: [1,2]`). Gestiona equipos/sistemas propios. |
| Invitado            | `invitado` / `invitado`     | Solo lectura. |

La sesión se guarda en `localStorage` con parseo robusto; cualquier valor corrupto se descarta automáticamente.

## Matriz de permisos en la UI
- **Plantas**: solo superadministrador puede crear/editar/eliminar. 
- **Áreas**: superadministrador o administrador con área asignada. 
- **Equipos**: superadministrador, administrador sobre sus áreas o maquinista sobre sus equipos. 
- **Sistemas**: mismo criterio que equipos. 
- Los controles de acción muestran advertencias (`warning`) cuando el rol carece de permiso y bloquean la acción.

## Flujo de datos con la API
La página de activos (`AssetsPage.vue`) consume el cliente `src/services/api.ts`, que espera un backend REST con los siguientes endpoints jerárquicos:

- `GET /plantas`, `POST /plantas`, `PUT /plantas/{id}`, `DELETE /plantas/{id}`
- `GET /plantas/{plantaId}/areas`, `POST /plantas/{plantaId}/areas`
- `PUT /areas/{id}`, `DELETE /areas/{id}`
- `GET /areas/{areaId}/equipos`, `POST /areas/{areaId}/equipos`
- `PUT /equipos/{id}`, `DELETE /equipos/{id}`
- `GET /equipos/{equipoId}/sistemas`, `POST /equipos/{equipoId}/sistemas`
- `PUT /sistemas/{id}`, `DELETE /sistemas/{id}`

Las respuestas se esperan en JSON y los errores se muestran en la UI usando el cuerpo `{ message: string }` cuando está disponible.

## Qué validar al integrar el backend
- Respetar la jerarquía (las rutas de áreas/equipos/sistemas dependen de su padre).
- Aplicar autorización en el backend según el rol y alcance recibido en el token (plantas/áreas/equipos asignados).
- Devolver códigos HTTP adecuados y mensajes claros para que el frontend pueda mostrarlos en el feedback.
- Mantener tokens de corta duración y refresh en el backend; el frontend está listo para inyectar encabezados y manejar expiración vía interceptores si se añade.

## Estructura relevante
- `src/features/auth/*`: autenticación demo y tipos de usuario/roles.
- `src/features/assets/*`: vistas y composables para CRUD jerárquico con guards de permisos.
- `src/services/api.ts`: cliente REST parametrizado por `VITE_API_BASE_URL`.
- `docs/task-status.md`: estado de trabajo completado y pendiente.
