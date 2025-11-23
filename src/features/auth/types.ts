export type UserRole = 'superadministrador' | 'invitado'

export interface AuthUser {
  username: string
  role: UserRole
}
