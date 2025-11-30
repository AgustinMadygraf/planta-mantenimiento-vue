import { computed, reactive, ref } from 'vue'
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
} from '../../../services/api'
import type { Area, Equipo, Planta, Sistema } from '../../../types/assets'
import { syncSelection } from './syncSelection'
import { useCrudForm } from './useCrudForm'
import { useFeedback } from './useFeedback'
import { logger } from '../../../services/logger'

export function useAssetHierarchy() {
  const plantas = ref<Planta[]>([])
  const areas = ref<Area[]>([])
  const equipos = ref<Equipo[]>([])
  const sistemas = ref<Sistema[]>([])

  const selectedPlanta = ref<Planta | null>(null)
  const selectedArea = ref<Area | null>(null)
  const selectedEquipo = ref<Equipo | null>(null)
  const selectedSistema = ref<Sistema | null>(null)

  const loading = reactive({ plantas: false, areas: false, equipos: false, sistemas: false })
  const saving = reactive({ planta: false, area: false, equipo: false, sistema: false })
  const removing = reactive({ planta: false, area: false, equipo: false, sistema: false })

  const { feedback, setFeedback, clearFeedback } = useFeedback()

  const plantaForm = useCrudForm()
  const areaForm = useCrudForm()
  const equipoForm = useCrudForm()
  const sistemaForm = useCrudForm()

  function clearSelectionFrom(level: 'planta' | 'area' | 'equipo' | 'sistema') {
    if (level === 'planta') {
      selectedPlanta.value = null
      plantaForm.reset()
    }

    if (level === 'planta' || level === 'area') {
      selectedArea.value = null
      areas.value = []
      areaForm.reset()
    }

    if (level === 'planta' || level === 'area' || level === 'equipo') {
      selectedEquipo.value = null
      equipos.value = []
      equipoForm.reset()
    }

    if (level === 'planta' || level === 'area' || level === 'equipo' || level === 'sistema') {
      selectedSistema.value = null
      sistemas.value = []
      sistemaForm.reset()
    }
  }

  async function loadPlantas() {
    loading.plantas = true
    try {
      plantas.value = await getPlantas()
      syncSelection(plantas.value, selectedPlanta, selectPlanta, () => clearSelectionFrom('planta'))
    } catch (error) {
      logger.error(error)
      setFeedback('danger', (error as Error).message)
    } finally {
      loading.plantas = false
    }
  }

  async function loadAreas(plantaId: number) {
    loading.areas = true
    try {
      areas.value = await getAreas(plantaId)
      syncSelection(areas.value, selectedArea, selectArea, () => clearSelectionFrom('area'))
    } catch (error) {
      logger.error(error)
      setFeedback('danger', (error as Error).message)
    } finally {
      loading.areas = false
    }
  }

  async function loadEquipos(areaId: number) {
    loading.equipos = true
    try {
      equipos.value = await getEquipos(areaId)
      syncSelection(equipos.value, selectedEquipo, selectEquipo, () => clearSelectionFrom('equipo'))
    } catch (error) {
      logger.error(error)
      setFeedback('danger', (error as Error).message)
    } finally {
      loading.equipos = false
    }
  }

  async function loadSistemas(equipoId: number) {
    loading.sistemas = true
    try {
      sistemas.value = await getSistemas(equipoId)
      syncSelection(sistemas.value, selectedSistema, selectSistema, () => clearSelectionFrom('sistema'))
    } catch (error) {
      logger.error(error)
      setFeedback('danger', (error as Error).message)
    } finally {
      loading.sistemas = false
    }
  }

  function selectPlanta(planta: Planta) {
    selectedPlanta.value = planta
    plantaForm.reset()
    clearFeedback()
    loadAreas(planta.id)
  }

  function selectArea(area: Area) {
    selectedArea.value = area
    areaForm.reset()
    clearFeedback()
    loadEquipos(area.id)
  }

  function selectEquipo(equipo: Equipo) {
    selectedEquipo.value = equipo
    equipoForm.reset()
    clearFeedback()
    loadSistemas(equipo.id)
  }

  function selectSistema(sistema: Sistema) {
    selectedSistema.value = sistema
    sistemaForm.reset()
    clearFeedback()
  }

  async function submitPlanta() {
    if (!plantaForm.form.nombre.trim()) {
      setFeedback('danger', 'El nombre de la planta es obligatorio.')
      return
    }

    saving.planta = true
    try {
      if (plantaForm.form.mode === 'create') {
        await createPlanta({ nombre: plantaForm.form.nombre.trim() })
        setFeedback('success', 'Planta creada correctamente.')
      } else if (plantaForm.form.id) {
        await updatePlanta(plantaForm.form.id, { nombre: plantaForm.form.nombre.trim() })
        setFeedback('success', 'Planta actualizada correctamente.')
      }

      plantaForm.reset()
      await loadPlantas()
    } catch (error) {
      logger.error(error)
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

    if (!areaForm.form.nombre.trim()) {
      setFeedback('danger', 'El nombre del área es obligatorio.')
      return
    }

    saving.area = true
    try {
      if (areaForm.form.mode === 'create') {
        await createArea(selectedPlanta.value.id, { nombre: areaForm.form.nombre.trim() })
        setFeedback('success', 'Área creada correctamente.')
      } else if (areaForm.form.id) {
        await updateArea(areaForm.form.id, { nombre: areaForm.form.nombre.trim() })
        setFeedback('success', 'Área actualizada correctamente.')
      }

      areaForm.reset()
      await loadAreas(selectedPlanta.value.id)
    } catch (error) {
      logger.error(error)
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

    if (!equipoForm.form.nombre.trim()) {
      setFeedback('danger', 'El nombre del equipo es obligatorio.')
      return
    }

    saving.equipo = true
    try {
      if (equipoForm.form.mode === 'create') {
        await createEquipo(selectedArea.value.id, { nombre: equipoForm.form.nombre.trim() })
        setFeedback('success', 'Equipo creado correctamente.')
      } else if (equipoForm.form.id) {
        await updateEquipo(equipoForm.form.id, { nombre: equipoForm.form.nombre.trim() })
        setFeedback('success', 'Equipo actualizado correctamente.')
      }

      equipoForm.reset()
      await loadEquipos(selectedArea.value.id)
    } catch (error) {
      logger.error(error)
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

    if (!sistemaForm.form.nombre.trim()) {
      setFeedback('danger', 'El nombre del sistema es obligatorio.')
      return
    }

    saving.sistema = true
    try {
      if (sistemaForm.form.mode === 'create') {
        await createSistema(selectedEquipo.value.id, { nombre: sistemaForm.form.nombre.trim() })
        setFeedback('success', 'Sistema creado correctamente.')
      } else if (sistemaForm.form.id) {
        await updateSistema(sistemaForm.form.id, { nombre: sistemaForm.form.nombre.trim() })
        setFeedback('success', 'Sistema actualizado correctamente.')
      }

      sistemaForm.reset()
      await loadSistemas(selectedEquipo.value.id)
    } catch (error) {
      logger.error(error)
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
      logger.error(error)
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
      logger.error(error)
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
      logger.error(error)
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
      logger.error(error)
      setFeedback('danger', (error as Error).message)
    } finally {
      removing.sistema = false
    }
  }

  const selectedTrail = computed(() => {
    const labels: string[] = []
    if (selectedPlanta.value) labels.push(selectedPlanta.value.nombre)
    if (selectedArea.value) labels.push(selectedArea.value.nombre)
    if (selectedEquipo.value) labels.push(selectedEquipo.value.nombre)
    if (selectedSistema.value) labels.push(selectedSistema.value.nombre)
    return labels.join(' > ')
  })

  return {
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
    loadAreas,
    loadEquipos,
    loadSistemas,
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
    clearSelectionFrom,
  }
}
