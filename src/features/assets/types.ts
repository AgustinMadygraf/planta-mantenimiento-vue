export interface BaseEntity {
  id: number
  nombre: string
}

export interface Planta extends BaseEntity {}

export interface Area extends BaseEntity {
  plantaId: number
}

export interface Equipo extends BaseEntity {
  areaId: number
}

export interface Sistema extends BaseEntity {
  equipoId: number
}

export type PlantaPayload = Pick<Planta, 'nombre'>
export type AreaPayload = Pick<Area, 'nombre'>
export type EquipoPayload = Pick<Equipo, 'nombre'>
export type SistemaPayload = Pick<Sistema, 'nombre'>
