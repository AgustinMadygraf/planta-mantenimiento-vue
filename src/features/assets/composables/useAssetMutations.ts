import { reactive } from 'vue'
import type { Ref } from 'vue'
import type { Area, Equipo, Planta, Sistema } from '../types'
import {
  createArea,
  createEquipo,
  createPlanta,
  createSistema,
  deleteArea,
  deleteEquipo,
  deletePlanta,
  deleteSistema,
  updateArea,
  updateEquipo,
  updatePlanta,
  updateSistema,
} from '../services/assetApi'
import { useCrudForm } from './useCrudForm'
import { logger } from '../../../services/logger'
import type { NotificationVariant } from '../../../stores/notifications'

export function useAssetMutations(params: {
  selectedPlanta: Ref<Planta | null>
  selectedArea: Ref<Area | null>
  selectedEquipo: Ref<Equipo | null>
  selectedSistema: Ref<Sistema | null>
  loadPlantas: () => Promise<void>
  loadAreas: (plantaId: number) => Promise<void>
  loadEquipos: (areaId: number) => Promise<void>
  loadSistemas: (equipoId: number) => Promise<void>
  notify: (variant: NotificationVariant, message: string) => void
  clearSelectionFrom: (level: 'planta' | 'area' | 'equipo' | 'sistema') => void
}) {
  const {
    selectedPlanta,
    selectedArea,
    selectedEquipo,
    selectedSistema,
    loadPlantas,
    loadAreas,
    loadEquipos,
    loadSistemas,
    notify,
    clearSelectionFrom,
  } = params

  const saving = reactive({ planta: false, area: false, equipo: false, sistema: false })
  const removing = reactive({ planta: false, area: false, equipo: false, sistema: false })

  const plantaForm = useCrudForm()
  const areaForm = useCrudForm()
  const equipoForm = useCrudForm()
  const sistemaForm = useCrudForm()

  async function submitPlanta() {
    if (!plantaForm.form.nombre.trim()) {
      notify('danger', 'El nombre de la planta es obligatorio.')
      return
    }

    saving.planta = true
    try {
      if (plantaForm.form.mode === 'create') {
        await createPlanta({ nombre: plantaForm.form.nombre.trim() })
        notify('success', 'Planta creada correctamente.')
      } else if (plantaForm.form.id) {
        await updatePlanta(plantaForm.form.id, { nombre: plantaForm.form.nombre.trim() })
        notify('success', 'Planta actualizada correctamente.')
      }

      plantaForm.reset()
      await loadPlantas()
    } catch (error) {
      logger.error(error)
      notify('danger', (error as Error).message)
    } finally {
      saving.planta = false
    }
  }

  async function submitArea() {
    if (!selectedPlanta.value) {
      notify('danger', 'Selecciona una planta para gestionar sus áreas.')
      return
    }

    if (!areaForm.form.nombre.trim()) {
      notify('danger', 'El nombre del área es obligatorio.')
      return
    }

    saving.area = true
    try {
      if (areaForm.form.mode === 'create') {
        await createArea(selectedPlanta.value.id, { nombre: areaForm.form.nombre.trim() })
        notify('success', 'Área creada correctamente.')
      } else if (areaForm.form.id) {
        await updateArea(areaForm.form.id, { nombre: areaForm.form.nombre.trim() })
        notify('success', 'Área actualizada correctamente.')
      }

      areaForm.reset()
      await loadAreas(selectedPlanta.value.id)
    } catch (error) {
      logger.error(error)
      notify('danger', (error as Error).message)
    } finally {
      saving.area = false
    }
  }

  async function submitEquipo() {
    if (!selectedArea.value) {
      notify('danger', 'Selecciona un área para gestionar sus equipos.')
      return
    }

    if (!equipoForm.form.nombre.trim()) {
      notify('danger', 'El nombre del equipo es obligatorio.')
      return
    }

    saving.equipo = true
    try {
      if (equipoForm.form.mode === 'create') {
        await createEquipo(selectedArea.value.id, { nombre: equipoForm.form.nombre.trim() })
        notify('success', 'Equipo creado correctamente.')
      } else if (equipoForm.form.id) {
        await updateEquipo(equipoForm.form.id, { nombre: equipoForm.form.nombre.trim() })
        notify('success', 'Equipo actualizado correctamente.')
      }

      equipoForm.reset()
      await loadEquipos(selectedArea.value.id)
    } catch (error) {
      logger.error(error)
      notify('danger', (error as Error).message)
    } finally {
      saving.equipo = false
    }
  }

  async function submitSistema() {
    if (!selectedEquipo.value) {
      notify('danger', 'Selecciona un equipo para gestionar sus sistemas.')
      return
    }

    if (!sistemaForm.form.nombre.trim()) {
      notify('danger', 'El nombre del sistema es obligatorio.')
      return
    }

    saving.sistema = true
    try {
      if (sistemaForm.form.mode === 'create') {
        await createSistema(selectedEquipo.value.id, { nombre: sistemaForm.form.nombre.trim() })
        notify('success', 'Sistema creado correctamente.')
      } else if (sistemaForm.form.id) {
        await updateSistema(sistemaForm.form.id, { nombre: sistemaForm.form.nombre.trim() })
        notify('success', 'Sistema actualizado correctamente.')
      }

      sistemaForm.reset()
      await loadSistemas(selectedEquipo.value.id)
    } catch (error) {
      logger.error(error)
      notify('danger', (error as Error).message)
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
      notify('success', 'Planta eliminada correctamente.')
      if (selectedPlanta.value?.id === planta.id) {
        clearSelectionFrom('planta')
      }
      await loadPlantas()
    } catch (error) {
      logger.error(error)
      notify('danger', (error as Error).message)
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
      notify('success', 'Área eliminada correctamente.')
      if (selectedArea.value?.id === area.id) {
        clearSelectionFrom('area')
      }
      if (selectedPlanta.value) {
        await loadAreas(selectedPlanta.value.id)
      }
    } catch (error) {
      logger.error(error)
      notify('danger', (error as Error).message)
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
      notify('success', 'Equipo eliminado correctamente.')
      if (selectedEquipo.value?.id === equipo.id) {
        clearSelectionFrom('equipo')
      }
      if (selectedArea.value) {
        await loadEquipos(selectedArea.value.id)
      }
    } catch (error) {
      logger.error(error)
      notify('danger', (error as Error).message)
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
      notify('success', 'Sistema eliminado correctamente.')
      if (selectedSistema.value?.id === sistema.id) {
        clearSelectionFrom('sistema')
      }
      if (selectedEquipo.value) {
        await loadSistemas(selectedEquipo.value.id)
      }
    } catch (error) {
      logger.error(error)
      notify('danger', (error as Error).message)
    } finally {
      removing.sistema = false
    }
  }

  return {
    saving,
    removing,
    plantaForm,
    areaForm,
    equipoForm,
    sistemaForm,
    submitPlanta,
    submitArea,
    submitEquipo,
    submitSistema,
    confirmDeletePlanta,
    confirmDeleteArea,
    confirmDeleteEquipo,
    confirmDeleteSistema,
  }
}
