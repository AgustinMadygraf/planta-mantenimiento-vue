# Estado de tareas

## Tareas implementadas
- **Modelo de roles ampliado con alcances**: se añadieron los roles `superadministrador`, `administrador`, `maquinista` e `invitado`, incluyendo campos opcionales de áreas y equipos para acotar permisos. 【F:src/features/auth/types.ts†L1-L9】
- **Autenticación demo robusta**: se definieron credenciales de ejemplo para cada rol, con carga segura desde `localStorage` (limpieza ante JSON corrupto) y mensajes de error que enumeran todas las combinaciones válidas. 【F:src/features/auth/composables/useAuth.ts†L11-L70】
- **Ayuda de login actualizada**: la tarjeta de acceso muestra todas las credenciales demo disponibles para orientar a cada rol. 【F:src/features/auth/components/LoginCard.vue†L9-L16】
- **Controles de UI según rol y alcance**: la página de activos limita creación/edición/eliminación según la jerarquía (planta/área/equipo) y muestra avisos de feedback contextual cuando la acción no está permitida. 【F:src/features/assets/components/AssetsPage.vue†L1-L196】
- **Feedback reutilizable**: la lógica de mensajes ahora admite estados `warning`, permitiendo alertar restricciones de permisos sin marcar error crítico. 【F:src/features/assets/composables/useFeedback.ts†L1-L16】

## Tareas pendientes o incompletas
- **Pruebas automatizadas ausentes**: aún no se han definido o ejecutado suites de pruebas (unitarias o e2e) que cubran autenticación y reglas de permisos.
- **Revisión funcional**: falta validar manualmente en la UI que cada rol solo ve y puede actuar sobre el alcance correcto (planta/área/equipo) con los nuevos avisos de advertencia.

## Próximos pasos sugeridos
1. **Añadir pruebas**: crear pruebas unitarias para los composables de autenticación y autorización; incluir pruebas de integración en la UI para los flujos de creación/edición/borrado según rol.
2. **Validación manual guiada**: ejecutar la app con cada usuario demo y confirmar que los controles y feedback se comportan según la matriz de permisos.
3. **Monitoreo continuo**: integrar el comando de build en CI para garantizar que el tipado y la compilación se mantengan verdes tras futuros cambios.
