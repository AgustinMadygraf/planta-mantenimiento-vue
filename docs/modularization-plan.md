# Propuesta de modularización para `App.vue`

## Problemas actuales
- El componente principal concentra estado, validaciones y orquestación de cuatro jerarquías (plantas, áreas, equipos, sistemas) en ~800 líneas, dificultando pruebas y evolución.【F:src/App.vue†L32-L120】
- Formularios y feedback se gestionan en el mismo archivo, mezclando responsabilidades de UI, dominio y acceso a datos.【F:src/App.vue†L32-L120】

## Objetivos
1. Separar responsabilidades de dominio (gestión de jerarquías y CRUD) de la vista.
2. Reutilizar lógica común (validaciones, sincronización jerárquica, manejo de feedback) en composables o stores.
3. Alinear la estructura de carpetas con convenciones de Vue 3 + TypeScript y principios de arquitectura limpia.

## Estructura propuesta (feature-first)
```
src/
├─ components/
│  ├─ layout/          # Shells y contenedores generales (AppHeader, AppShell)
│  └─ ui/              # Átomos y moléculas (cards, modales, formularios reutilizables)
├─ features/
│  └─ assets/          # Caso de uso jerárquico plantas→áreas→equipos→sistemas
│     ├─ components/   # Vistas y subcomponentes específicos (PlantaList, AreaList, EquipoList, SistemaList)
│     ├─ composables/  # Lógica de dominio reutilizable (useAssetHierarchy, useCrudForm)
│     ├─ services/     # Adaptadores a HTTP/API para el feature (delegan en `src/services/api` o nuevos endpoints)
│     └─ types/        # Tipos del feature (reexportan o extienden `src/types/assets`)
├─ services/           # Gateways/infraestructura compartida (API, almacenamiento)
├─ types/              # Modelos compartidos
├─ router/             # (Opcional) Si se introduce routing más adelante
└─ styles/             # Estilos globales
```

## División sugerida de `App.vue`
- **Contenedor de página** (`features/assets/components/AssetsPage.vue`): arma la vista principal, compone los subcomponentes y provee providers/injections de datos.
- **Listas y formularios por nivel**:
  - `PlantaList.vue` + `PlantaForm.vue`
  - `AreaList.vue` + `AreaForm.vue`
  - `EquipoList.vue` + `EquipoForm.vue`
  - `SistemaList.vue` + `SistemaForm.vue`
- **Feedback y loaders**: componentes de UI genéricos (alerta, spinner) en `components/ui/` para evitar repetición.

## Composables clave
- `useAssetHierarchy()`: encapsula el estado reactivo de las colecciones/selecciones, la sincronización jerárquica y el borrado en cascada (reusa el helper `syncSelection`).
- `useCrudForm<T>()`: maneja modo create/edit, reseteo y validación de formularios tipados.
- `useFeedback()`: centraliza mensajes `success/danger` y su limpieza.

## Beneficios
- **Responsabilidad única**: cada componente gestiona sólo su vista; la lógica de negocio queda en composables o services.
- **Testabilidad**: los composables pueden probarse sin montar la UI.
- **Evolución**: agregar niveles o cambiar la fuente de datos se concentra en `features/assets/composables` y `services`.

## Pasos recomendados
1. Extraer el estado y los métodos CRUD de `App.vue` hacia `useAssetHierarchy` y `useCrudForm` manteniendo la API actual para minimizar riesgos.
2. Crear componentes de lista/formulario que reciban props y emitan eventos (`select`, `submit`, `delete`), dejando a `AssetsPage` la orquestación.
3. Migrar el helper `syncSelection` a `features/assets/composables` y reutilizarlo desde los nuevos composables.
4. Introducir componentes de feedback y carga en `components/ui` y reemplazar el markup duplicado.
5. Una vez establecida la división, reducir `App.vue` a un shell mínimo o reemplazarlo por `AssetsPage.vue`.
