import type { Area, Equipo, Sistema } from '../../assets/types'
import type { AuthUser } from '../types'

interface AssetPermissionService {
  canManagePlantas(): boolean
  canManageAreas(): boolean
  canManageEquipos(): boolean
  isAreaAllowed(area: Area | null, equipos: readonly Equipo[]): boolean
  isEquipoAllowed(equipo?: Equipo | null): boolean
  isSistemaAllowed(sistema: Sistema | null, equipos: readonly Equipo[]): boolean
  canCreateArea(selectedPlanta: unknown): boolean
  canCreateEquipo(selectedArea: Area | null): boolean
  canCreateSistema(selectedArea: Area | null, selectedEquipo: Equipo | null): boolean
}

export function createAssetPermissionService(user: AuthUser | null): AssetPermissionService {
  const role = user?.role ?? 'invitado'
  const allowedAreas = user?.areas ?? []
  const allowedEquipos = user?.equipos ?? []

  const isSuperAdmin = role === 'superadministrador'
  const isAdmin = role === 'administrador'
  const isOperator = role === 'maquinista'

  const canManagePlantas = () => isSuperAdmin
  const canManageAreas = () => isSuperAdmin || isAdmin
  const canManageEquipos = () => isSuperAdmin || isAdmin || isOperator

  const isAreaAllowed = (area: Area | null, equipos: readonly Equipo[]) => {
    if (!area) return false
    if (isSuperAdmin) return true
    if (isAdmin) return allowedAreas.includes(area.id)
    if (isOperator) {
      return equipos.some((equipo) => allowedEquipos.includes(equipo.id) && equipo.areaId === area.id)
    }
    return false
  }

  const isEquipoAllowed = (equipo?: Equipo | null) => {
    if (!equipo) return false
    if (isSuperAdmin) return true
    if (isAdmin) return allowedAreas.includes(equipo.areaId)
    if (isOperator) return allowedEquipos.includes(equipo.id)
    return false
  }

  const isSistemaAllowed = (sistema: Sistema | null, equipos: readonly Equipo[]) => {
    if (!sistema) return false
    const equipo = equipos.find((item) => item.id === sistema.equipoId)
    return isEquipoAllowed(equipo)
  }

  const canCreateArea = (selectedPlanta: unknown) => !!selectedPlanta && canManagePlantas()

  const canCreateEquipo = (selectedArea: Area | null) => {
    if (!selectedArea) return false
    if (isSuperAdmin) return true
    if (isAdmin) return isAreaAllowed(selectedArea, [])
    return false
  }

  const canCreateSistema = (selectedArea: Area | null, selectedEquipo: Equipo | null) => {
    if (!selectedArea || !selectedEquipo) return false
    if (isSuperAdmin) return true
    if (isAdmin) return isAreaAllowed(selectedArea, [])
    if (isOperator) return isEquipoAllowed(selectedEquipo)
    return false
  }

  return {
    canManagePlantas,
    canManageAreas,
    canManageEquipos,
    isAreaAllowed,
    isEquipoAllowed,
    isSistemaAllowed,
    canCreateArea,
    canCreateEquipo,
    canCreateSistema,
  }
}
