# TODO

- [x] Flujo de login con token JWT almacenado en localStorage.
- [x] Añadir refresh tokens y expiración automática de sesión.
- [x] Migrar el estado de sesión a una store global (Pinia) y proteger rutas con guards.
- [x] Reorganizar composables y servicios por dominio (auth, assets) para reducir acoplamiento.
- [x] Dividir `useAssetHierarchy` en sub-composables para carga, selección y mutaciones.
- [x] Crear un servicio de permisos de UI alineado con los claims devueltos por el backend.
- [x] Unificar el manejo de errores y feedback mediante un sistema de notificaciones/toasts global.
