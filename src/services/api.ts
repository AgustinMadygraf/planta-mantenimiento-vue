import type {
  Area,
  AreaPayload,
  Equipo,
  EquipoPayload,
  Planta,
  PlantaPayload,
  Sistema,
  SistemaPayload,
} from '../types/assets'
import { request } from './httpClient'

export function getPlantas(): Promise<Planta[]> {
  return request<Planta[]>('/plantas')
}

export function createPlanta(payload: PlantaPayload): Promise<Planta> {
  return request<Planta>('/plantas', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updatePlanta(id: number, payload: PlantaPayload): Promise<Planta> {
  return request<Planta>(`/plantas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deletePlanta(id: number): Promise<void> {
  return request<void>(`/plantas/${id}`, {
    method: 'DELETE',
    parseResponse: false,
  })
}

export function getAreas(plantaId: number): Promise<Area[]> {
  return request<Area[]>(`/plantas/${plantaId}/areas`)
}

export function createArea(plantaId: number, payload: AreaPayload): Promise<Area> {
  return request<Area>(`/plantas/${plantaId}/areas`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateArea(id: number, payload: AreaPayload): Promise<Area> {
  return request<Area>(`/areas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteArea(id: number): Promise<void> {
  return request<void>(`/areas/${id}`, {
    method: 'DELETE',
    parseResponse: false,
  })
}

export function getEquipos(areaId: number): Promise<Equipo[]> {
  return request<Equipo[]>(`/areas/${areaId}/equipos`)
}

export function createEquipo(areaId: number, payload: EquipoPayload): Promise<Equipo> {
  return request<Equipo>(`/areas/${areaId}/equipos`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateEquipo(id: number, payload: EquipoPayload): Promise<Equipo> {
  return request<Equipo>(`/equipos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteEquipo(id: number): Promise<void> {
  return request<void>(`/equipos/${id}`, {
    method: 'DELETE',
    parseResponse: false,
  })
}

export function getSistemas(equipoId: number): Promise<Sistema[]> {
  return request<Sistema[]>(`/equipos/${equipoId}/sistemas`)
}

export function createSistema(equipoId: number, payload: SistemaPayload): Promise<Sistema> {
  return request<Sistema>(`/equipos/${equipoId}/sistemas`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateSistema(id: number, payload: SistemaPayload): Promise<Sistema> {
  return request<Sistema>(`/sistemas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteSistema(id: number): Promise<void> {
  return request<void>(`/sistemas/${id}`, {
    method: 'DELETE',
    parseResponse: false,
  })
}
