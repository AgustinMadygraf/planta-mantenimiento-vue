import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import type { Area, Equipo, Planta, Sistema } from '../types'
import { syncSelection } from './syncSelection'
import type { AssetLoadCallbacks } from './useAssetLoading'

export function useAssetSelection(params: {
  areas: Ref<Area[]>
  equipos: Ref<Equipo[]>
  sistemas: Ref<Sistema[]>
  loadAreas: (plantaId: number) => Promise<void>
  loadEquipos: (areaId: number) => Promise<void>
  loadSistemas: (equipoId: number) => Promise<void>
  loadCallbacks: AssetLoadCallbacks
}) {
  const {
    areas,
    equipos,
    sistemas,
    loadAreas,
    loadEquipos,
    loadSistemas,
    loadCallbacks,
  } = params

  const selectedPlanta = ref<Planta | null>(null)
  const selectedArea = ref<Area | null>(null)
  const selectedEquipo = ref<Equipo | null>(null)
  const selectedSistema = ref<Sistema | null>(null)

  function clearSelectionFrom(level: 'planta' | 'area' | 'equipo' | 'sistema') {
    if (level === 'planta') {
      selectedPlanta.value = null
    }

    if (level === 'planta' || level === 'area') {
      selectedArea.value = null
      areas.value = []
    }

    if (level === 'planta' || level === 'area' || level === 'equipo') {
      selectedEquipo.value = null
      equipos.value = []
    }

    if (level === 'planta' || level === 'area' || level === 'equipo' || level === 'sistema') {
      selectedSistema.value = null
      sistemas.value = []
    }
  }

  async function selectPlanta(planta: Planta) {
    selectedPlanta.value = planta
    await loadAreas(planta.id)
  }

  async function selectArea(area: Area) {
    selectedArea.value = area
    await loadEquipos(area.id)
  }

  async function selectEquipo(equipo: Equipo) {
    selectedEquipo.value = equipo
    await loadSistemas(equipo.id)
  }

  function selectSistema(sistema: Sistema) {
    selectedSistema.value = sistema
  }

  loadCallbacks.onPlantasLoaded = (items) =>
    syncSelection(items, selectedPlanta, selectPlanta, () => clearSelectionFrom('planta'))
  loadCallbacks.onAreasLoaded = (items) =>
    syncSelection(items, selectedArea, selectArea, () => clearSelectionFrom('area'))
  loadCallbacks.onEquiposLoaded = (items) =>
    syncSelection(items, selectedEquipo, selectEquipo, () => clearSelectionFrom('equipo'))
  loadCallbacks.onSistemasLoaded = (items) =>
    syncSelection(items, selectedSistema, selectSistema, () => clearSelectionFrom('sistema'))

  const selectedTrail = computed(() => {
    const labels: string[] = []
    if (selectedPlanta.value) labels.push(selectedPlanta.value.nombre)
    if (selectedArea.value) labels.push(selectedArea.value.nombre)
    if (selectedEquipo.value) labels.push(selectedEquipo.value.nombre)
    if (selectedSistema.value) labels.push(selectedSistema.value.nombre)
    return labels.join(' > ')
  })

  return {
    selectedPlanta,
    selectedArea,
    selectedEquipo,
    selectedSistema,
    clearSelectionFrom,
    selectPlanta,
    selectArea,
    selectEquipo,
    selectSistema,
    selectedTrail,
  }
}
