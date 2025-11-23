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

            <AssetList
              :items="plantas"
              :selected-id="selectedPlanta?.id ?? null"
              :loading="loading.plantas"
              :removing="removing.planta"
              empty-label="No hay plantas registradas aún."
              @select="selectPlanta"
              @edit="plantaForm.startEdit"
              @delete="confirmDeletePlanta"
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
              @update:nombre="(value) => (plantaForm.form.nombre = value)"
              @submit="submitPlanta"
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
              <AssetList
                :items="areas"
                :selected-id="selectedArea?.id ?? null"
                :loading="loading.areas"
                :removing="removing.area"
                empty-label="No hay áreas registradas para esta planta."
                @select="selectArea"
                @edit="areaForm.startEdit"
                @delete="confirmDeleteArea"
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
                :disabled="!selectedPlanta"
                @update:nombre="(value) => (areaForm.form.nombre = value)"
                @submit="submitArea"
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
              <AssetList
                :items="equipos"
                :selected-id="selectedEquipo?.id ?? null"
                :loading="loading.equipos"
                :removing="removing.equipo"
                empty-label="No hay equipos registrados para esta área."
                @select="selectEquipo"
                @edit="equipoForm.startEdit"
                @delete="confirmDeleteEquipo"
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
                :disabled="!selectedArea"
                @update:nombre="(value) => (equipoForm.form.nombre = value)"
                @submit="submitEquipo"
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
              <AssetList
                :items="sistemas"
                :selected-id="selectedSistema?.id ?? null"
                :loading="loading.sistemas"
                :removing="removing.sistema"
                empty-label="No hay sistemas registrados para este equipo."
                @select="selectSistema"
                @edit="sistemaForm.startEdit"
                @delete="confirmDeleteSistema"
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
                :disabled="!selectedEquipo"
                @update:nombre="(value) => (sistemaForm.form.nombre = value)"
                @submit="submitSistema"
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
import { onMounted } from 'vue'
import AlertMessage from '../../../components/ui/AlertMessage.vue'
import AssetForm from './AssetForm.vue'
import AssetList from './AssetList.vue'
import { useAssetHierarchy } from '../composables/useAssetHierarchy'

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

onMounted(async () => {
  await loadPlantas()
})
</script>
