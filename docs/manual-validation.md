# Checklist de validación manual por rol

Este checklist permite comprobar que la UI respeta el alcance devuelto por el backend y muestra los mensajes adecuados ante errores.

## Roles y alcance esperado
- **Superadministrador**
  - Puede crear/editar/eliminar plantas, áreas, equipos y sistemas.
  - Observa el aviso: "Acceso total para crear, editar y eliminar en toda la planta.".
- **Administrador**
  - No puede crear ni borrar plantas; solo gestionar áreas/equipos/sistemas dentro de sus áreas asignadas.
  - Observa el aviso: "Gestión limitada a su área asignada (IDs: ...).".
- **Maquinista**
  - Puede gestionar únicamente los equipos/sistemas asociados a sus IDs asignados.
  - Formularios fuera de alcance deben estar deshabilitados y mostrar aviso de navegación de solo lectura.
- **Invitado**
  - Solo lectura en toda la jerarquía; botones de crear/editar/eliminar deshabilitados.
  - Observa el aviso de navegación de solo lectura.

## Pasos sugeridos
1. Iniciar sesión con cada rol y verificar el aviso mostrado en el encabezado de la pantalla de activos.
2. Navegar por la jerarquía Planta → Área → Equipo → Sistema y confirmar que los botones se habilitan solo dentro del alcance permitido.
3. Intentar guardar o eliminar fuera de alcance y confirmar que la UI muestra advertencias sin enviar la solicitud.
4. Validar que los formularios exigen el campo `nombre` y muestran el mensaje de error cuando está vacío.

## Flujos negativos a revisar
- **Credenciales inválidas**: ingresar usuario/contraseña incorrectos debe mostrar la alerta "Credenciales inválidas" en el formulario de login.
- **Token expirado o inválido**: si el backend responde 401 tras el login, la UI debe surfacear el mensaje "Token expirado o inválido" en la pantalla de activos.
- **403 por políticas de rol**: ante un 403 al crear/editar, la UI debe mostrar la alerta con el mensaje del backend y mantener el estado sin cambios.

> Este checklist puede ejecutarse con el backend real o con el mock de Playwright incluido en `tests/e2e`, usando datos de prueba representativos de cada rol.
