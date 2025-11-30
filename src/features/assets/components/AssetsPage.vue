<template>
  <main class="container py-4">
    <header class="mb-4">
      <h1 class="h3">Gestión de activos y Mantenimiento</h1>
      <p class="text-muted mb-0">
        Administra la jerarquía Planta → Áreas → Equipos → Sistema con operaciones de alta, baja y edición conectadas a la API.
      </p>
    </header>

    <section v-if="feedback" class="mb-3">
      <AlertMessage :feedback="feedback" @close="clearFeedback" />
    </section>

    <section v-if="selectedTrail" class="mb-4">
      <div class="alert alert-info" role="status">
        <strong>Ruta seleccionada:</strong> {{ selectedTrail }}
      </div>
    </section>

    <div class="row g-4">
      <div class="col-12 col-md-6 col-xl-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h2 class="h5 mb-0">Plantas</h2>
              <span class="badge text-bg-secondary">{{ plantas.length }}</span>
            </div>

            <p v-if="!canManagePlantas" class="text-muted small mb-2">
              Solo el superadministrador puede crear, editar o eliminar plantas.
            </p>

            <AssetList
              :items="plantas"
              :selected-id="selectedPlanta?.id ?? null"
              :loading="loading.plantas"
              :removing="removing.planta"
              :can-manage="canManagePlantas"
              :is-action-allowed="() => canManagePlantas.value"
              empty-label="No hay plantas registradas aún."
              @select="selectPlanta"
              @edit="handleEditPlanta"
              @delete="handleDeletePlanta"
            />

            <AssetForm
              class="mt-3"
              :mode="plantaForm.form.mode"
              :nombre="plantaForm.form.nombre"
              input-id="planta-nombre"
              placeholder="Ej. Planta Principal"
              create-label="Crear planta"
              edit-label="Guardar cambios"
              :saving="saving.planta"
              :disabled="plantaFormDisabled"
              @update:nombre="(value) => (plantaForm.form.nombre = value)"
              @submit="handleSubmitPlanta"
              @cancel="plantaForm.reset"
            />
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6 col-xl-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h2 class="h5 mb-0">Áreas</h2>
              <span class="badge text-bg-secondary">{{ areas.length }}</span>
            </div>

            <p v-if="!selectedPlanta" class="text-muted">Selecciona una planta para listar sus áreas.</p>
            <div v-else>
              <p v-if="!canManageAreas" class="text-muted small mb-2">Gestión solo disponible en las áreas asignadas.</p>
              <AssetList
                :items="areas"
                :selected-id="selectedArea?.id ?? null"
                :loading="loading.areas"
                :removing="removing.area"
                :can-manage="canManageAreas"
                :is-action-allowed="canManageAreaItem"
                empty-label="No hay áreas registradas para esta planta."
                @select="selectArea"
                @edit="handleEditArea"
                @delete="handleDeleteArea"
              />

              <AssetForm
                class="mt-3"
                :mode="areaForm.form.mode"
                :nombre="areaForm.form.nombre"
                input-id="area-nombre"
                placeholder="Ej. Área de Producción"
                create-label="Crear área"
                edit-label="Guardar cambios"
                :saving="saving.area"
                :disabled="areaFormDisabled"
                @update:nombre="(value) => (areaForm.form.nombre = value)"
                @submit="handleSubmitArea"
                @cancel="areaForm.reset"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6 col-xl-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h2 class="h5 mb-0">Equipos</h2>
              <span class="badge text-bg-secondary">{{ equipos.length }}</span>
            </div>

            <p v-if="!selectedArea" class="text-muted">Selecciona un área para listar sus equipos.</p>
            <div v-else>
              <p v-if="!canManageEquipos" class="text-muted small mb-2">Gestión limitada a los equipos asignados.</p>
              <AssetList
                :items="equipos"
                :selected-id="selectedEquipo?.id ?? null"
                :loading="loading.equipos"
                :removing="removing.equipo"
                :can-manage="canManageEquipos"
                :is-action-allowed="canManageEquipoItem"
                empty-label="No hay equipos registrados para esta área."
                @select="selectEquipo"
                @edit="handleEditEquipo"
                @delete="handleDeleteEquipo"
              />

              <AssetForm
                class="mt-3"
                :mode="equipoForm.form.mode"
                :nombre="equipoForm.form.nombre"
                input-id="equipo-nombre"
                placeholder="Ej. Compresor N°1"
                create-label="Crear equipo"
                edit-label="Guardar cambios"
                :saving="saving.equipo"
                :disabled="equipoFormDisabled"
                @update:nombre="(value) => (equipoForm.form.nombre = value)"
                @submit="handleSubmitEquipo"
                @cancel="equipoForm.reset"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-6 col-xl-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center justify-content-between mb-3">
              <h2 class="h5 mb-0">Sistemas</h2>
              <span class="badge text-bg-secondary">{{ sistemas.length }}</span>
            </div>

            <p v-if="!selectedEquipo" class="text-muted">Selecciona un equipo para listar sus sistemas.</p>
            <div v-else>
              <p v-if="!canManageEquipos" class="text-muted small mb-2">
                Solo puedes editar o crear sistemas en los equipos dentro de tu alcance.
              </p>
              <AssetList
                :items="sistemas"
                :selected-id="selectedSistema?.id ?? null"
                :loading="loading.sistemas"
                :removing="removing.sistema"
                :can-manage="canManageEquipos"
                :is-action-allowed="canManageSistemaItem"
                empty-label="No hay sistemas registrados para este equipo."
                @select="selectSistema"
                @edit="handleEditSistema"
                @delete="handleDeleteSistema"
              />

              <AssetForm
                class="mt-3"
                :mode="sistemaForm.form.mode"
                :nombre="sistemaForm.form.nombre"
                input-id="sistema-nombre"
                placeholder="Ej. Sistema Hidráulico"
                create-label="Crear sistema"
                edit-label="Guardar cambios"
                :saving="saving.sistema"
                :disabled="sistemaFormDisabled"
                @update:nombre="(value) => (sistemaForm.form.nombre = value)"
                @submit="handleSubmitSistema"
                @cancel="sistemaForm.reset"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import type { AuthUser } from '../../auth/types'
import type { Area, Equipo, Sistema } from '../../../types/assets'
import AlertMessage from '../../../components/ui/AlertMessage.vue'
import AssetForm from './AssetForm.vue'
import AssetList from './AssetList.vue'
import { useAssetHierarchy } from '../composables/useAssetHierarchy'

const props = defineProps<{ user: AuthUser | null }>()

const {
  plantas,
  areas,
  equipos,
  sistemas,
  selectedPlanta,
  selectedArea,
  selectedEquipo,
  selectedSistema,
  loading,
  saving,
  removing,
  feedback,
  setFeedback,
  clearFeedback,
  plantaForm,
  areaForm,
  equipoForm,
  sistemaForm,
  loadPlantas,
  selectPlanta,
  selectArea,
  selectEquipo,
  selectSistema,
  submitPlanta,
  submitArea,
  submitEquipo,
  submitSistema,
  confirmDeletePlanta,
  confirmDeleteArea,
  confirmDeleteEquipo,
  confirmDeleteSistema,
  selectedTrail,
} = useAssetHierarchy()

const role = computed(() => props.user?.role ?? 'invitado')
const allowedAreas = computed(() => props.user?.areas ?? [])
const allowedEquipos = computed(() => props.user?.equipos ?? [])

const canManagePlantas = computed(() => role.value === 'superadministrador')
const canManageAreas = computed(() => role.value === 'superadministrador' || role.value === 'administrador')
const canManageEquipos = computed(
  () => role.value === 'superadministrador' || role.value === 'administrador' || role.value === 'maquinista',
)

function isAreaAllowed(area?: Area | null) {
  if (!area) return false
  if (role.value === 'superadministrador') return true
  if (role.value === 'administrador') return allowedAreas.value.includes(area.id)
  return false
}

function isEquipoAllowed(equipo?: Equipo | null) {
  if (!equipo) return false
  if (role.value === 'superadministrador') return true
  if (role.value === 'administrador') return allowedAreas.value.includes(equipo.areaId)
  if (role.value === 'maquinista') return allowedEquipos.value.includes(equipo.id)
  return false
}

function isSistemaAllowed(sistema?: Sistema | null) {
  if (!sistema) return false
  const equipo = equipos.value.find((item) => item.id === sistema.equipoId)
  return isEquipoAllowed(equipo)
}

const canCreateArea = computed(() => canManagePlantas.value)
const canCreateEquipo = computed(() => {
  if (!selectedArea.value) return false
  if (role.value === 'superadministrador') return true
  if (role.value === 'administrador') return isAreaAllowed(selectedArea.value)
  return false
})

const canCreateSistema = computed(() => {
  if (!selectedEquipo.value) return false
  if (role.value === 'superadministrador') return true
  if (role.value === 'administrador') return isAreaAllowed(selectedArea.value)
  if (role.value === 'maquinista') return isEquipoAllowed(selectedEquipo.value)
  return false
})

const plantaFormDisabled = computed(() => !canManagePlantas.value)
const areaFormDisabled = computed(() => {
  if (!selectedPlanta.value) return true
  if (areaForm.form.mode === 'create') return !canCreateArea.value
  const area = areas.value.find((item) => item.id === areaForm.form.id)
  return !isAreaAllowed(area)
})

const equipoFormDisabled = computed(() => {
  if (!selectedArea.value) return true
  if (equipoForm.form.mode === 'create') return !canCreateEquipo.value
  const equipo = equipos.value.find((item) => item.id === equipoForm.form.id)
  return !isEquipoAllowed(equipo)
})

const sistemaFormDisabled = computed(() => {
  if (!selectedEquipo.value) return true
  if (sistemaForm.form.mode === 'create') return !canCreateSistema.value
  if (sistemaForm.form.id === null) return !canCreateSistema.value
  const sistema = sistemas.value.find((item) => item.id === sistemaForm.form.id)
  return !isSistemaAllowed(sistema)
})

function guardAction(condition: boolean, message: string) {
  if (!condition) {
    setFeedback('warning', message)
    return false
  }
  return true
}

function canManageAreaItem(area: Area) {
  return isAreaAllowed(area)
}

function canManageEquipoItem(equipo: Equipo) {
  return isEquipoAllowed(equipo)
}

function canManageSistemaItem(sistema: Sistema) {
  return isSistemaAllowed(sistema)
}

function handleEditPlanta(planta: any) {
  if (!guardAction(canManagePlantas.value, 'Solo el superadministrador puede modificar plantas.')) return
  plantaForm.startEdit(planta)
}

function handleEditArea(area: Area) {
  if (!guardAction(canManageAreaItem(area), 'No puedes gestionar áreas fuera de tu alcance.')) return
  areaForm.startEdit(area)
}

function handleEditEquipo(equipo: Equipo) {
  if (!guardAction(canManageEquipoItem(equipo), 'No puedes gestionar equipos fuera de tu alcance.')) return
  equipoForm.startEdit(equipo)
}

function handleEditSistema(sistema: Sistema) {
  if (!guardAction(canManageSistemaItem(sistema), 'No puedes gestionar sistemas fuera de tu alcance.')) return
  sistemaForm.startEdit(sistema)
}

async function handleSubmitPlanta() {
  if (!guardAction(canManagePlantas.value, 'Solo el superadministrador puede gestionar plantas.')) return
  await submitPlanta()
}

async function handleSubmitArea() {
  const isEditing = areaForm.form.mode === 'edit'
  const allowed = isEditing
    ? isAreaAllowed(areas.value.find((item) => item.id === areaForm.form.id))
    : canCreateArea.value
  if (!guardAction(allowed, 'Solo puedes gestionar las áreas asignadas.')) return
  await submitArea()
}

async function handleSubmitEquipo() {
  const isEditing = equipoForm.form.mode === 'edit'
  const allowed = isEditing
    ? isEquipoAllowed(equipos.value.find((item) => item.id === equipoForm.form.id))
    : canCreateEquipo.value
  if (!guardAction(allowed, 'Solo puedes gestionar equipos dentro de tu área o asignación.')) return
  await submitEquipo()
}

async function handleSubmitSistema() {
  const isEditing = sistemaForm.form.mode === 'edit'
  const allowed = isEditing
    ? isSistemaAllowed(sistemas.value.find((item) => item.id === sistemaForm.form.id))
    : canCreateSistema.value
  if (!guardAction(allowed, 'Solo puedes gestionar sistemas dentro de los equipos asignados.')) return
  await submitSistema()
}

async function handleDeletePlanta(planta: any) {
  if (!guardAction(canManagePlantas.value, 'Solo el superadministrador puede eliminar plantas.')) return
  await confirmDeletePlanta(planta)
}

async function handleDeleteArea(area: Area) {
  if (!guardAction(canManageAreaItem(area), 'No puedes eliminar áreas fuera de tu alcance.')) return
  await confirmDeleteArea(area)
}

async function handleDeleteEquipo(equipo: Equipo) {
  if (!guardAction(canManageEquipoItem(equipo), 'No puedes eliminar equipos fuera de tu alcance.')) return
  await confirmDeleteEquipo(equipo)
}

async function handleDeleteSistema(sistema: Sistema) {
  if (!guardAction(canManageSistemaItem(sistema), 'No puedes eliminar sistemas fuera de tu alcance.')) return
  await confirmDeleteSistema(sistema)
}

onMounted(async () => {
  await loadPlantas()
})
</script>
