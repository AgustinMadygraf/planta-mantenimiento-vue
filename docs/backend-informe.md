# Informe técnico para backend

## 1. Resumen ejecutivo
- **Frontend**: la UI de activos aplica una matriz de permisos por rol (superadministrador, administrador, maquinista, invitado) y consume un cliente REST jerárquico para plantas, áreas, equipos y sistemas. La sesión demo persiste en `localStorage` con validación defensiva.
- **Impacto en backend**: se requieren endpoints CRUD jerárquicos coherentes, claims de alcance en el token (áreas/equipos asignados) y reglas de autorización que respeten la jerarquía en cada operación.

## 2. Contexto y alcance
- **Pantallas afectadas**: gestión de activos (`AssetsPage.vue`) con listas y formularios para cada nivel. Feedback de permisos se muestra como `warning`/`danger` según el guard. 【F:src/features/assets/components/AssetsPage.vue†L1-L197】【F:src/features/assets/components/AssetsPage.vue†L240-L365】
- **Autenticación demo**: cuatro usuarios predefinidos con roles y alcances opcionales (`areas`, `equipos`) cargados desde `localStorage` de forma segura. 【F:src/features/auth/composables/useAuth.ts†L6-L70】【F:src/features/auth/types.ts†L1-L9】
- **Cliente API**: `src/services/api.ts` define rutas REST jerárquicas y maneja errores JSON (`{ message }`). Requiere `VITE_API_BASE_URL`. 【F:src/services/api.ts†L1-L121】

## 3. Cambios realizados en el frontend
- **Matriz de permisos por rol**
  - *Funcional*: bloquea creación/edición/borrado según rol y alcance; muestra advertencias cuando la acción no está permitida. 【F:src/features/assets/components/AssetsPage.vue†L240-L365】
  - *Técnico*: computeds `canManage*`, helpers `isAreaAllowed/isEquipoAllowed/isSistemaAllowed` y guards `guardAction` con feedback.
  - *Datos esperados*: el frontend necesita conocer `role`, `areas?: number[]`, `equipos?: number[]` en el payload del usuario autenticado.

- **Autenticación demo robusta**
  - *Funcional*: credenciales de prueba para cada rol; mensaje de error enumera todas las combinaciones válidas.
  - *Técnico*: carga desde `localStorage` con `try/catch` y validación de shape; persistencia controlada en `useAuth`. 【F:src/features/auth/composables/useAuth.ts†L18-L66】
  - *Datos esperados*: el backend real debe emitir un token con los claims anteriores y endpoints `/auth/login` y `/auth/refresh` para reemplazar la demo.

- **Cliente REST jerárquico**
  - *Funcional*: CRUD de plantas, áreas, equipos, sistemas; mensajes de error se leen de `{ message }` cuando existe.
  - *Técnico*: funciones `getPlantas`, `createArea`, `updateEquipo`, etc., basadas en `fetch` parametrizado por `VITE_API_BASE_URL`. 【F:src/services/api.ts†L1-L121】
  - *Datos esperados*: respuestas JSON con los modelos `Planta`, `Area`, `Equipo`, `Sistema`; status 204 en deletes.

## 4. Cambios requeridos en el backend
- **Autenticación y claims**
  - Emitir tokens (JWT) con campos: `sub`, `role` (`superadministrador|administrador|maquinista|invitado`), `areas?: number[]`, `equipos?: number[]`, `exp`, `iat`, `jti`.
  - Endpoint `POST /auth/login` que valide credenciales y devuelva `access_token` + `refresh_token` (o cookie httpOnly para refresh).
  - Endpoint `POST /auth/refresh` para rotar refresh tokens; revocación por `jti`.
  - Middleware/dep `Depends` que inyecte el usuario y verifique expiración + revocación.

- **Autorización por recurso**
  - Endpoints de plantas: solo `superadministrador` puede `POST/PUT/DELETE`.
  - Áreas: `superadministrador` o `administrador` cuyo `areaId` esté en `areas` del token.
  - Equipos/sistemas: `superadministrador`; `administrador` con área asociada; `maquinista` con `equipoId` en `equipos`. Lecturas (`GET`) pueden permitir `invitado` si procede.
  - Validar en cada acción que el recurso pertenece al alcance (ej.: equipo pertenece a un área permitida) para evitar escalamientos laterales.

- **Endpoints y modelos**
  - Rutas esperadas (método → respuesta):
    - `GET /plantas` → `Planta[]`
    - `POST /plantas` → `Planta`
    - `PUT /plantas/{id}` → `Planta`
    - `DELETE /plantas/{id}` → `204 No Content`
    - `GET /plantas/{plantaId}/areas` → `Area[]`
    - `POST /plantas/{plantaId}/areas` → `Area`
    - `PUT /areas/{id}` → `Area`
    - `DELETE /areas/{id}` → `204`
    - `GET /areas/{areaId}/equipos` → `Equipo[]`
    - `POST /areas/{areaId}/equipos` → `Equipo`
    - `PUT /equipos/{id}` → `Equipo`
    - `DELETE /equipos/{id}` → `204`
    - `GET /equipos/{equipoId}/sistemas` → `Sistema[]`
    - `POST /equipos/{equipoId}/sistemas` → `Sistema`
    - `PUT /sistemas/{id}` → `Sistema`
    - `DELETE /sistemas/{id}` → `204`
  - **Esquemas sugeridos** (JSON):
    ```json
    // Planta
    { "id": 1, "nombre": "Planta Principal" }
    // Area
    { "id": 10, "plantaId": 1, "nombre": "Área de Producción" }
    // Equipo
    { "id": 20, "areaId": 10, "nombre": "Compresor N°1" }
    // Sistema
    { "id": 30, "equipoId": 20, "nombre": "Sistema Hidráulico" }
    ```
  - Validar que `area.plantaId` coincide con el parámetro, igual para `equipo.areaId` y `sistema.equipoId`.

- **Manejo de errores**
  - En respuestas de error, incluir `{ "message": "texto descriptivo" }` para que la UI lo muestre.
  - Usar códigos: `400` validación, `401` token inválido/ausente, `403` sin permiso, `404` recurso fuera de alcance o inexistente, `409` conflictos.

- **Compatibilidad hacia atrás**
  - Si ya existen endpoints con otra forma, se requiere una capa de compatibilidad o adaptación en el cliente. Idealmente mantener rutas y tipos anteriores o versionar (`/api/v1`).

## 5. Recomendaciones de implementación
1. **Seguridad primero**: definir esquema de roles y alcances en el backend y agregar dependencias de autorización a cada endpoint antes de exponerlos.
2. **Validar jerarquía**: en cada mutación (POST/PUT/DELETE) verificar pertenencia del recurso al alcance (área/equipo) para evitar acceso cruzado.
3. **Estructurar modelos**: usar Pydantic para los esquemas de planta/área/equipo/sistema; añadir migraciones si persistes en DB.
4. **Errores consistentes**: centralizar handlers para devolver `{ message }` y códigos coherentes.
5. **Pruebas**: crear tests de API por rol (superadmin/admin/maquinista/invitado) que cubran caminos felices y de denegación.

## 6. Checklist para backend
- [ ] Crear/ajustar endpoints CRUD jerárquicos conforme a las rutas listadas.
- [ ] Emitir tokens JWT con claims `role`, `areas`, `equipos` y rotación de refresh.
- [ ] Implementar dependencias de autorización que validen alcance por rol en cada recurso.
- [ ] Validar consistencia jerárquica (planta → área → equipo → sistema) en el backend.
- [ ] Normalizar respuestas de error con `{ message: string }` y códigos HTTP adecuados.
- [ ] Añadir pruebas automatizadas que cubran permisos por rol y accesos fuera de alcance.
