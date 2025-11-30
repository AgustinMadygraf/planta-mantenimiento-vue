import { useAssetLoading, type AssetLoadCallbacks } from './useAssetLoading'
import { useAssetSelection } from './useAssetSelection'
import { useAssetMutations } from './useAssetMutations'
import { useNotifier } from '../../../composables/useNotifier'

export function useAssetHierarchy() {
  const { notify } = useNotifier()
  const loadCallbacks: AssetLoadCallbacks = {}

  const {
    plantas,
    areas,
    equipos,
    sistemas,
    loading,
    loadPlantas,
    loadAreas,
    loadEquipos,
    loadSistemas,
  } = useAssetLoading(notify, loadCallbacks)

  const {
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
  } = useAssetSelection({
    areas,
    equipos,
    sistemas,
    loadAreas,
    loadEquipos,
    loadSistemas,
    loadCallbacks,
  })

  const {
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
  } = useAssetMutations({
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
