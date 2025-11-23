<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { Area, Equipo, Planta, Sistema } from './types/assets'
import {
  createArea,
  createEquipo,
  createPlanta,
  createSistema,
  deleteArea,
  deleteEquipo,
  deletePlanta,
  deleteSistema,
  getAreas,
  getEquipos,
  getPlantas,
  getSistemas,
  updateArea,
  updateEquipo,
  updatePlanta,
  updateSistema,
} from './services/api'

type CrudMode = 'create' | 'edit'

interface CrudForm {
  id: number | null
  nombre: string
  mode: CrudMode
}

const plantas = ref<Planta[]>([])
const areas = ref<Area[]>([])
const equipos = ref<Equipo[]>([])
const sistemas = ref<Sistema[]>([])

const selectedPlanta = ref<Planta | null>(null)
const selectedArea = ref<Area | null>(null)
const selectedEquipo = ref<Equipo | null>(null)
const selectedSistema = ref<Sistema | null>(null)

const loading = reactive({
  plantas: false,
  areas: false,
  equipos: false,
  sistemas: false,
})

const saving = reactive({
  planta: false,
  area: false,
  equipo: false,
  sistema: false,
})

const removing = reactive({
  planta: false,
  area: false,
  equipo: false,
  sistema: false,
})

const feedback = ref<{ type: 'success' | 'danger'; message: string } | null>(null)

const plantaForm = reactive<CrudForm>({ id: null, nombre: '', mode: 'create' })
const areaForm = reactive<CrudForm>({ id: null, nombre: '', mode: 'create' })
const equipoForm = reactive<CrudForm>({ id: null, nombre: '', mode: 'create' })
const sistemaForm = reactive<CrudForm>({ id: null, nombre: '', mode: 'create' })

function setFeedback(type: 'success' | 'danger', message: string) {
  feedback.value = { type, message }
}

function clearFeedback() {
  feedback.value = null
}

function resetForm(form: CrudForm) {
  form.id = null
  form.nombre = ''
  form.mode = 'create'
}

async function loadPlantas() {
  loading.plantas = true
  try {
    plantas.value = await getPlantas()
    if (!selectedPlanta.value && plantas.value.length > 0) {
      const firstPlanta = plantas.value[0]
      if (firstPlanta) {
        selectPlanta(firstPlanta)
      }
    } else if (selectedPlanta.value) {
      const found = plantas.value.find((planta) => planta.id === selectedPlanta.value?.id)
      if (!found) {
        clearSelectionFrom('planta')
      } else {
        selectPlanta(found)
      }
    }
  } catch (error) {
    console.error(error)
    setFeedback('danger', (error as Error).message)
  } finally {
    loading.plantas = false
  }
}

async function loadAreas(plantaId: number) {
  loading.areas = true
  try {
    areas.value = await getAreas(plantaId)
    if (areas.value.length === 0) {
      clearSelectionFrom('area')
      return
    }

    if (!selectedArea.value) {
      const firstArea = areas.value[0]
      if (firstArea) {
        selectArea(firstArea)
      }
      return
    }

    const found = areas.value.find((area) => area.id === selectedArea.value?.id)
    if (!found) {
      const firstArea = areas.value[0]
      if (firstArea) {
        selectArea(firstArea)
      }
    } else {
      selectArea(found)
    }
  } catch (error) {
    console.error(error)
    setFeedback('danger', (error as Error).message)
  } finally {
    loading.areas = false
  }
}

async function loadEquipos(areaId: number) {
  loading.equipos = true
  try {
    equipos.value = await getEquipos(areaId)
    if (equipos.value.length === 0) {
      clearSelectionFrom('equipo')
      return
    }

    if (!selectedEquipo.value) {
      const firstEquipo = equipos.value[0]
      if (firstEquipo) {
        selectEquipo(firstEquipo)
      }
      return
    }

    const found = equipos.value.find((equipo) => equipo.id === selectedEquipo.value?.id)
    if (!found) {
      const firstEquipo = equipos.value[0]
      if (firstEquipo) {
        selectEquipo(firstEquipo)
      }
    } else {
      selectEquipo(found)
    }
  } catch (error) {
    console.error(error)
    setFeedback('danger', (error as Error).message)
  } finally {
    loading.equipos = false
  }
}

async function loadSistemas(equipoId: number) {
  loading.sistemas = true
  try {
    sistemas.value = await getSistemas(equipoId)
    if (sistemas.value.length === 0) {
      clearSelectionFrom('sistema')
      return
    }

    if (!selectedSistema.value) {
      const firstSistema = sistemas.value[0]
      if (firstSistema) {
        selectSistema(firstSistema)
      }
      return
    }

    const found = sistemas.value.find((sistema) => sistema.id === selectedSistema.value?.id)
    if (!found) {
      const firstSistema = sistemas.value[0]
      if (firstSistema) {
        selectSistema(firstSistema)
      }
    } else {
      selectSistema(found)
    }
  } catch (error) {
    console.error(error)
    setFeedback('danger', (error as Error).message)
  } finally {
    loading.sistemas = false
  }
}

function clearSelectionFrom(level: 'planta' | 'area' | 'equipo' | 'sistema') {
  if (level === 'planta') {
    selectedPlanta.value = null
    resetForm(plantaForm)
  }

  if (level === 'planta' || level === 'area') {
    selectedArea.value = null
    areas.value = []
    resetForm(areaForm)
  }

  if (level === 'planta' || level === 'area' || level === 'equipo') {
    selectedEquipo.value = null
    equipos.value = []
    resetForm(equipoForm)
  }

  if (level === 'planta' || level === 'area' || level === 'equipo' || level === 'sistema') {
    selectedSistema.value = null
    sistemas.value = []
    resetForm(sistemaForm)
  }
}

function selectPlanta(planta: Planta) {
  selectedPlanta.value = planta
  resetForm(plantaForm)
  clearFeedback()
  loadAreas(planta.id)
}

function selectArea(area: Area) {
  selectedArea.value = area
  resetForm(areaForm)
  clearFeedback()
  loadEquipos(area.id)
}

function selectEquipo(equipo: Equipo) {
  selectedEquipo.value = equipo
  resetForm(equipoForm)
  clearFeedback()
  loadSistemas(equipo.id)
}

function selectSistema(sistema: Sistema) {
  selectedSistema.value = sistema
  resetForm(sistemaForm)
  clearFeedback()
}

async function submitPlanta() {
  if (!plantaForm.nombre.trim()) {
    setFeedback('danger', 'El nombre de la planta es obligatorio.')
    return
  }

  saving.planta = true
  try {
    if (plantaForm.mode === 'create') {
      await createPlanta({ nombre: plantaForm.nombre.trim() })
      setFeedback('success', 'Planta creada correctamente.')
    } else if (plantaForm.id) {
      await updatePlanta(plantaForm.id, { nombre: plantaForm.nombre.trim() })
      setFeedback('success', 'Planta actualizada correctamente.')
    }

    resetForm(plantaForm)
    await loadPlantas()
  } catch (error) {
    console.error(error)
    setFeedback('danger', (error as Error).message)
  } finally {
    saving.planta = false
  }
}

async function submitArea() {
  if (!selectedPlanta.value) {
    setFeedback('danger', 'Selecciona una planta para gestionar sus áreas.')
    return
  }

  if (!areaForm.nombre.trim()) {
    setFeedback('danger', 'El nombre del área es obligatorio.')
    return
  }

  saving.area = true
  try {
    if (areaForm.mode === 'create') {
      await createArea(selectedPlanta.value.id, { nombre: areaForm.nombre.trim() })
      setFeedback('success', 'Área creada correctamente.')
    } else if (areaForm.id) {
      await updateArea(areaForm.id, { nombre: areaForm.nombre.trim() })
      setFeedback('success', 'Área actualizada correctamente.')
    }

    resetForm(areaForm)
    await loadAreas(selectedPlanta.value.id)
  } catch (error) {
    console.error(error)
    setFeedback('danger', (error as Error).message)
  } finally {
    saving.area = false
  }
}

async function submitEquipo() {
  if (!selectedArea.value) {
    setFeedback('danger', 'Selecciona un área para gestionar sus equipos.')
    return
  }

  if (!equipoForm.nombre.trim()) {
    setFeedback('danger', 'El nombre del equipo es obligatorio.')
    return
  }

  saving.equipo = true
  try {
    if (equipoForm.mode === 'create') {
      await createEquipo(selectedArea.value.id, { nombre: equipoForm.nombre.trim() })
      setFeedback('success', 'Equipo creado correctamente.')
    } else if (equipoForm.id) {
      await updateEquipo(equipoForm.id, { nombre: equipoForm.nombre.trim() })
      setFeedback('success', 'Equipo actualizado correctamente.')
    }

    resetForm(equipoForm)
    await loadEquipos(selectedArea.value.id)
  } catch (error) {
    console.error(error)
    setFeedback('danger', (error as Error).message)
  } finally {
    saving.equipo = false
  }
}

async function submitSistema() {
  if (!selectedEquipo.value) {
    setFeedback('danger', 'Selecciona un equipo para gestionar sus sistemas.')
    return
  }

  if (!sistemaForm.nombre.trim()) {
    setFeedback('danger', 'El nombre del sistema es obligatorio.')
    return
  }

  saving.sistema = true
  try {
    if (sistemaForm.mode === 'create') {
      await createSistema(selectedEquipo.value.id, { nombre: sistemaForm.nombre.trim() })
      setFeedback('success', 'Sistema creado correctamente.')
    } else if (sistemaForm.id) {
      await updateSistema(sistemaForm.id, { nombre: sistemaForm.nombre.trim() })
      setFeedback('success', 'Sistema actualizado correctamente.')
    }

    resetForm(sistemaForm)
    await loadSistemas(selectedEquipo.value.id)
  } catch (error) {
    console.error(error)
    setFeedback('danger', (error as Error).message)
  } finally {
    saving.sistema = false
  }
}

async function confirmDeletePlanta(planta: Planta) {
  if (!window.confirm(`¿Eliminar la planta "${planta.nombre}"?`)) {
    return
  }

  removing.planta = true
  try {
    await deletePlanta(planta.id)
    setFeedback('success', 'Planta eliminada correctamente.')
    if (selectedPlanta.value?.id === planta.id) {
      clearSelectionFrom('planta')
    }
    await loadPlantas()
  } catch (error) {
    console.error(error)
    setFeedback('danger', (error as Error).message)
  } finally {
    removing.planta = false
  }
}

async function confirmDeleteArea(area: Area) {
  if (!window.confirm(`¿Eliminar el área "${area.nombre}"?`)) {
    return
  }

  removing.area = true
  try {
    await deleteArea(area.id)
    setFeedback('success', 'Área eliminada correctamente.')
    if (selectedArea.value?.id === area.id) {
      clearSelectionFrom('area')
    }
    if (selectedPlanta.value) {
      await loadAreas(selectedPlanta.value.id)
    }
  } catch (error) {
    console.error(error)
    setFeedback('danger', (error as Error).message)
  } finally {
    removing.area = false
  }
}

async function confirmDeleteEquipo(equipo: Equipo) {
  if (!window.confirm(`¿Eliminar el equipo "${equipo.nombre}"?`)) {
    return
  }

  removing.equipo = true
  try {
    await deleteEquipo(equipo.id)
    setFeedback('success', 'Equipo eliminado correctamente.')
    if (selectedEquipo.value?.id === equipo.id) {
      clearSelectionFrom('equipo')
    }
    if (selectedArea.value) {
      await loadEquipos(selectedArea.value.id)
    }
  } catch (error) {
    console.error(error)
    setFeedback('danger', (error as Error).message)
  } finally {
    removing.equipo = false
  }
}

async function confirmDeleteSistema(sistema: Sistema) {
  if (!window.confirm(`¿Eliminar el sistema "${sistema.nombre}"?`)) {
    return
  }

  removing.sistema = true
  try {
    await deleteSistema(sistema.id)
    setFeedback('success', 'Sistema eliminado correctamente.')
    if (selectedSistema.value?.id === sistema.id) {
      clearSelectionFrom('sistema')
    }
    if (selectedEquipo.value) {
      await loadSistemas(selectedEquipo.value.id)
    }
  } catch (error) {
    console.error(error)
    setFeedback('danger', (error as Error).message)
  } finally {
    removing.sistema = false
  }
}

function startEdit(form: CrudForm, item: { id: number; nombre: string }) {
  form.id = item.id
  form.nombre = item.nombre
  form.mode = 'edit'
}

const selectedTrail = computed(() => {
  const labels: string[] = []
  if (selectedPlanta.value) labels.push(selectedPlanta.value.nombre)
  if (selectedArea.value) labels.push(selectedArea.value.nombre)
  if (selectedEquipo.value) labels.push(selectedEquipo.value.nombre)
  if (selectedSistema.value) labels.push(selectedSistema.value.nombre)
  return labels.join(' > ')
})

onMounted(async () => {
  await loadPlantas()
})
</script>

<template>
  <main class="container py-4">
    <header class="mb-4">
      <h1 class="h3">Gestión de activos y Mantenimiento</h1>
      <p class="text-muted mb-0">
        Administra la jerarquía Planta → Áreas → Equipos → Sistema con operaciones de alta, baja y edición conectadas a la API.
      </p>
    </header>

    <section v-if="feedback" class="mb-3">
      <div class="alert" :class="`alert-${feedback.type}`" role="alert">
        {{ feedback.message }}
      </div>
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

            <div v-if="loading.plantas" class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Cargando plantas…</span>
              </div>
            </div>
            <div v-else class="list-group">
              <div
                v-for="planta in plantas"
                :key="planta.id"
                class="list-group-item"
                :class="{ active: selectedPlanta?.id === planta.id }"
              >
                <div class="d-flex align-items-center justify-content-between gap-3">
                  <button
                    class="btn btn-link text-decoration-none text-reset flex-grow-1 text-start"
                    type="button"
                    @click="selectPlanta(planta)"
                  >
                    {{ planta.nombre }}
                  </button>
                  <div class="btn-group btn-group-sm">
                    <button type="button" class="btn btn-outline-light" @click.stop="startEdit(plantaForm, planta)">
                      Editar
                    </button>
                    <button
                      type="button"
                      class="btn btn-outline-light"
                      :disabled="removing.planta"
                      @click.stop="confirmDeletePlanta(planta)"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
              <p v-if="!plantas.length" class="text-muted mb-0">No hay plantas registradas aún.</p>
            </div>

            <form class="mt-3" @submit.prevent="submitPlanta">
              <div class="mb-3">
                <label class="form-label" for="planta-nombre">Nombre</label>
                <input
                  id="planta-nombre"
                  v-model="plantaForm.nombre"
                  type="text"
                  class="form-control"
                  placeholder="Ej. Planta Principal"
                  required
                />
              </div>
              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary" :disabled="saving.planta">
                  {{ plantaForm.mode === 'create' ? 'Crear planta' : 'Guardar cambios' }}
                </button>
                <button
                  v-if="plantaForm.mode === 'edit'"
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="resetForm(plantaForm)"
                >
                  Cancelar
                </button>
              </div>
            </form>
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
              <div v-if="loading.areas" class="text-center py-4">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Cargando áreas…</span>
                </div>
              </div>
              <div v-else class="list-group">
                <div
                  v-for="area in areas"
                  :key="area.id"
                  class="list-group-item"
                  :class="{ active: selectedArea?.id === area.id }"
                >
                  <div class="d-flex align-items-center justify-content-between gap-3">
                    <button
                      class="btn btn-link text-decoration-none text-reset flex-grow-1 text-start"
                      type="button"
                      @click="selectArea(area)"
                    >
                      {{ area.nombre }}
                    </button>
                    <div class="btn-group btn-group-sm">
                      <button type="button" class="btn btn-outline-light" @click.stop="startEdit(areaForm, area)">
                        Editar
                      </button>
                      <button
                        type="button"
                        class="btn btn-outline-light"
                        :disabled="removing.area"
                        @click.stop="confirmDeleteArea(area)"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
                <p v-if="!areas.length" class="text-muted mb-0">No hay áreas registradas para esta planta.</p>
              </div>

              <form class="mt-3" @submit.prevent="submitArea">
                <div class="mb-3">
                  <label class="form-label" for="area-nombre">Nombre</label>
                  <input
                    id="area-nombre"
                    v-model="areaForm.nombre"
                    type="text"
                    class="form-control"
                    placeholder="Ej. Área de Producción"
                    :disabled="saving.area"
                    required
                  />
                </div>
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-primary" :disabled="saving.area">
                    {{ areaForm.mode === 'create' ? 'Crear área' : 'Guardar cambios' }}
                  </button>
                  <button
                    v-if="areaForm.mode === 'edit'"
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="resetForm(areaForm)"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
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
              <div v-if="loading.equipos" class="text-center py-4">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Cargando equipos…</span>
                </div>
              </div>
              <div v-else class="list-group">
                <div
                  v-for="equipo in equipos"
                  :key="equipo.id"
                  class="list-group-item"
                  :class="{ active: selectedEquipo?.id === equipo.id }"
                >
                  <div class="d-flex align-items-center justify-content-between gap-3">
                    <button
                      class="btn btn-link text-decoration-none text-reset flex-grow-1 text-start"
                      type="button"
                      @click="selectEquipo(equipo)"
                    >
                      {{ equipo.nombre }}
                    </button>
                    <div class="btn-group btn-group-sm">
                      <button type="button" class="btn btn-outline-light" @click.stop="startEdit(equipoForm, equipo)">
                        Editar
                      </button>
                      <button
                        type="button"
                        class="btn btn-outline-light"
                        :disabled="removing.equipo"
                        @click.stop="confirmDeleteEquipo(equipo)"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
                <p v-if="!equipos.length" class="text-muted mb-0">No hay equipos registrados para esta área.</p>
              </div>

              <form class="mt-3" @submit.prevent="submitEquipo">
                <div class="mb-3">
                  <label class="form-label" for="equipo-nombre">Nombre</label>
                  <input
                    id="equipo-nombre"
                    v-model="equipoForm.nombre"
                    type="text"
                    class="form-control"
                    placeholder="Ej. Compresor N°1"
                    :disabled="saving.equipo"
                    required
                  />
                </div>
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-primary" :disabled="saving.equipo">
                    {{ equipoForm.mode === 'create' ? 'Crear equipo' : 'Guardar cambios' }}
                  </button>
                  <button
                    v-if="equipoForm.mode === 'edit'"
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="resetForm(equipoForm)"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
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
              <div v-if="loading.sistemas" class="text-center py-4">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Cargando sistemas…</span>
                </div>
              </div>
              <div v-else class="list-group">
                <div
                  v-for="sistema in sistemas"
                  :key="sistema.id"
                  class="list-group-item"
                  :class="{ active: selectedSistema?.id === sistema.id }"
                >
                  <div class="d-flex align-items-center justify-content-between gap-3">
                    <button
                      class="btn btn-link text-decoration-none text-reset flex-grow-1 text-start"
                      type="button"
                      @click="selectSistema(sistema)"
                    >
                      {{ sistema.nombre }}
                    </button>
                    <div class="btn-group btn-group-sm">
                      <button type="button" class="btn btn-outline-light" @click.stop="startEdit(sistemaForm, sistema)">
                        Editar
                      </button>
                      <button
                        type="button"
                        class="btn btn-outline-light"
                        :disabled="removing.sistema"
                        @click.stop="confirmDeleteSistema(sistema)"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
                <p v-if="!sistemas.length" class="text-muted mb-0">No hay sistemas registrados para este equipo.</p>
              </div>

              <form class="mt-3" @submit.prevent="submitSistema">
                <div class="mb-3">
                  <label class="form-label" for="sistema-nombre">Nombre</label>
                  <input
                    id="sistema-nombre"
                    v-model="sistemaForm.nombre"
                    type="text"
                    class="form-control"
                    placeholder="Ej. Sistema Hidráulico"
                    :disabled="saving.sistema"
                    required
                  />
                </div>
                <div class="d-flex gap-2">
                  <button type="submit" class="btn btn-primary" :disabled="saving.sistema">
                    {{ sistemaForm.mode === 'create' ? 'Crear sistema' : 'Guardar cambios' }}
                  </button>
                  <button
                    v-if="sistemaForm.mode === 'edit'"
                    type="button"
                    class="btn btn-outline-secondary"
                    @click="resetForm(sistemaForm)"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
