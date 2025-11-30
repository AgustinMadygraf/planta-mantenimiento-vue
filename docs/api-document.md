# API consumida por la aplicación

## Configuración base
- La URL base proviene de la variable `VITE_API_BASE_URL`, definida en [.env](.env) y [.env.example](.env.example).
- Todas las peticiones se realizan con `fetch` desde [`request`](src/services/apiClient.ts), que fuerza el encabezado `Content-Type: application/json` y, salvo en los borrados, espera respuestas en JSON.

## Modelos de datos
- [`Planta`](src/features/assets/types.ts): `{ id: number; nombre: string }`.
- [`Area`](src/features/assets/types.ts): `{ id: number; nombre: string; plantaId: number }`.
- [`Equipo`](src/features/assets/types.ts): `{ id: number; nombre: string; areaId: number }`.
- [`Sistema`](src/features/assets/types.ts): `{ id: number; nombre: string; equipoId: number }`.
- Los payloads de creación/actualización usan solo `{ nombre: string }` mediante [`PlantaPayload`](src/features/assets/types.ts), [`AreaPayload`](src/features/assets/types.ts), [`EquipoPayload`](src/features/assets/types.ts) y [`SistemaPayload`](src/features/assets/types.ts).

## Endpoints utilizados

### Plantas
- `GET /plantas` vía [`getPlantas`](src/features/assets/services/assetApi.ts) → lista de plantas.
- `POST /plantas` vía [`createPlanta`](src/features/assets/services/assetApi.ts) → nombre en el cuerpo JSON, espera la planta creada.
- `PUT /plantas/{id}` vía [`updatePlanta`](src/features/assets/services/assetApi.ts) → nombre en el cuerpo JSON, espera la planta actualizada.
- `DELETE /plantas/{id}` vía [`deletePlanta`](src/features/assets/services/assetApi.ts) → no parsea respuesta.

### Áreas
- `GET /plantas/{plantaId}/areas` vía [`getAreas`](src/features/assets/services/assetApi.ts) → lista de áreas de la planta.
- `POST /plantas/{plantaId}/areas` vía [`createArea`](src/features/assets/services/assetApi.ts) → nombre en el cuerpo JSON, espera el área creada.
- `PUT /areas/{id}` vía [`updateArea`](src/features/assets/services/assetApi.ts) → nombre en el cuerpo JSON, espera el área actualizada.
- `DELETE /areas/{id}` vía [`deleteArea`](src/features/assets/services/assetApi.ts) → no parsea respuesta.

### Equipos
- `GET /areas/{areaId}/equipos` vía [`getEquipos`](src/features/assets/services/assetApi.ts) → lista de equipos del área.
- `POST /areas/{areaId}/equipos` vía [`createEquipo`](src/features/assets/services/assetApi.ts) → nombre en el cuerpo JSON, espera el equipo creado.
- `PUT /equipos/{id}` vía [`updateEquipo`](src/features/assets/services/assetApi.ts) → nombre en el cuerpo JSON, espera el equipo actualizado.
- `DELETE /equipos/{id}` vía [`deleteEquipo`](src/features/assets/services/assetApi.ts) → no parsea respuesta.

### Sistemas
- `GET /equipos/{equipoId}/sistemas` vía [`getSistemas`](src/features/assets/services/assetApi.ts) → lista de sistemas del equipo.
- `POST /equipos/{equipoId}/sistemas` vía [`createSistema`](src/features/assets/services/assetApi.ts) → nombre en el cuerpo JSON, espera el sistema creado.
- `PUT /sistemas/{id}` vía [`updateSistema`](src/features/assets/services/assetApi.ts) → nombre en el cuerpo JSON, espera el sistema actualizado.
- `DELETE /sistemas/{id}` vía [`deleteSistema`](src/features/assets/services/assetApi.ts) → no parsea respuesta.

## Manejo de errores
- Si la respuesta HTTP no es exitosa, [`request`](src/services/apiClient.ts) intenta leer un JSON con propiedad `message`; si falla, usa `response.statusText` y lanza un `Error`.
