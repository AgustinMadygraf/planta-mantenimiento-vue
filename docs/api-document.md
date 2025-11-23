# API consumida por la aplicación

## Configuración base
- La URL base proviene de la variable `VITE_API_BASE_URL`, definida en [.env](.env) y [.env.example](.env.example).
- Todas las peticiones se realizan con `fetch` desde [`request`](src/services/api.ts), que fuerza el encabezado `Content-Type: application/json` y, salvo en los borrados, espera respuestas en JSON.

## Modelos de datos
- [`Planta`](src/types/assets.ts): `{ id: number; nombre: string }`.
- [`Area`](src/types/assets.ts): `{ id: number; nombre: string; plantaId: number }`.
- [`Equipo`](src/types/assets.ts): `{ id: number; nombre: string; areaId: number }`.
- [`Sistema`](src/types/assets.ts): `{ id: number; nombre: string; equipoId: number }`.
- Los payloads de creación/actualización usan solo `{ nombre: string }` mediante [`PlantaPayload`](src/types/assets.ts), [`AreaPayload`](src/types/assets.ts), [`EquipoPayload`](src/types/assets.ts) y [`SistemaPayload`](src/types/assets.ts).

## Endpoints utilizados

### Plantas
- `GET /plantas` vía [`getPlantas`](src/services/api.ts) → lista de plantas.
- `POST /plantas` vía [`createPlanta`](src/services/api.ts) → nombre en el cuerpo JSON, espera la planta creada.
- `PUT /plantas/{id}` vía [`updatePlanta`](src/services/api.ts) → nombre en el cuerpo JSON, espera la planta actualizada.
- `DELETE /plantas/{id}` vía [`deletePlanta`](src/services/api.ts) → no parsea respuesta.

### Áreas
- `GET /plantas/{plantaId}/areas` vía [`getAreas`](src/services/api.ts) → lista de áreas de la planta.
- `POST /plantas/{plantaId}/areas` vía [`createArea`](src/services/api.ts) → nombre en el cuerpo JSON, espera el área creada.
- `PUT /areas/{id}` vía [`updateArea`](src/services/api.ts) → nombre en el cuerpo JSON, espera el área actualizada.
- `DELETE /areas/{id}` vía [`deleteArea`](src/services/api.ts) → no parsea respuesta.

### Equipos
- `GET /areas/{areaId}/equipos` vía [`getEquipos`](src/services/api.ts) → lista de equipos del área.
- `POST /areas/{areaId}/equipos` vía [`createEquipo`](src/services/api.ts) → nombre en el cuerpo JSON, espera el equipo creado.
- `PUT /equipos/{id}` vía [`updateEquipo`](src/services/api.ts) → nombre en el cuerpo JSON, espera el equipo actualizado.
- `DELETE /equipos/{id}` vía [`deleteEquipo`](src/services/api.ts) → no parsea respuesta.

### Sistemas
- `GET /equipos/{equipoId}/sistemas` vía [`getSistemas`](src/services/api.ts) → lista de sistemas del equipo.
- `POST /equipos/{equipoId}/sistemas` vía [`createSistema`](src/services/api.ts) → nombre en el cuerpo JSON, espera el sistema creado.
- `PUT /sistemas/{id}` vía [`updateSistema`](src/services/api.ts) → nombre en el cuerpo JSON, espera el sistema actualizado.
- `DELETE /sistemas/{id}` vía [`deleteSistema`](src/services/api.ts) → no parsea respuesta.

## Manejo de errores
- Si la respuesta HTTP no es exitosa, [`request`](src/services/api.ts) intenta leer un JSON con propiedad `message`; si falla, usa `response.statusText` y lanza un `Error`.