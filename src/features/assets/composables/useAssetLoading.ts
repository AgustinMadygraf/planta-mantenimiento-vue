import { reactive, ref } from 'vue'
import {
  getAreas,
  getEquipos,
  getPlantas,
  getSistemas,
} from '../services/assetApi'
import type { Area, Equipo, Planta, Sistema } from '../types'
import type { NotificationVariant } from '../../../stores/notifications'

export type AssetLoadCallbacks = {
  onPlantasLoaded?: (items: Planta[]) => void
  onAreasLoaded?: (items: Area[]) => void
  onEquiposLoaded?: (items: Equipo[]) => void
  onSistemasLoaded?: (items: Sistema[]) => void
}

export function useAssetLoading(
  notify: (variant: NotificationVariant, message: string) => void,
  loadCallbacks: AssetLoadCallbacks,
) {
  const plantas = ref<Planta[]>([])
  const areas = ref<Area[]>([])
  const equipos = ref<Equipo[]>([])
  const sistemas = ref<Sistema[]>([])

  const loading = reactive({ plantas: false, areas: false, equipos: false, sistemas: false })

  async function loadPlantas() {
    loading.plantas = true
    try {
      plantas.value = await getPlantas()
      loadCallbacks.onPlantasLoaded?.(plantas.value)
    } catch (error) {
      console.error(error)
      notify('danger', (error as Error).message)
    } finally {
      loading.plantas = false
    }
  }

  async function loadAreas(plantaId: number) {
    loading.areas = true
    try {
      areas.value = await getAreas(plantaId)
      loadCallbacks.onAreasLoaded?.(areas.value)
    } catch (error) {
      console.error(error)
      notify('danger', (error as Error).message)
    } finally {
      loading.areas = false
    }
  }

  async function loadEquipos(areaId: number) {
    loading.equipos = true
    try {
      equipos.value = await getEquipos(areaId)
      loadCallbacks.onEquiposLoaded?.(equipos.value)
    } catch (error) {
      console.error(error)
      notify('danger', (error as Error).message)
    } finally {
      loading.equipos = false
    }
  }

  async function loadSistemas(equipoId: number) {
    loading.sistemas = true
    try {
      sistemas.value = await getSistemas(equipoId)
      loadCallbacks.onSistemasLoaded?.(sistemas.value)
    } catch (error) {
      console.error(error)
      notify('danger', (error as Error).message)
    } finally {
      loading.sistemas = false
    }
  }

  return {
    plantas,
    areas,
    equipos,
    sistemas,
    loading,
    loadPlantas,
    loadAreas,
    loadEquipos,
    loadSistemas,
  }
}
