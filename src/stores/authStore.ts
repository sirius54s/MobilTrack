import { defineStore } from 'pinia'

// Tipos
interface Credentials {
  username: string
  password: string
}

type UserRole = 'admin' | 'guest' | ''

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '' as string,
    userRole: '' as UserRole,
  }),

  getters: {
    // ¿Hay token almacenado?
    isAuthenticated: (state): boolean => !!state.token,

    // ¿Rol de invitado?
    isGuest: (state): boolean => state.userRole === 'guest',
  },

  actions: {
    // Login estándar (reemplaza con tu API real)
    async login({ username, password }: Credentials) {
      return new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          if (username === 'admin' && password === '1234') {
            this.token = 'fake-jwt-token'
            this.userRole = 'admin'
            localStorage.setItem('auth_token', this.token)
            localStorage.setItem('user_role', this.userRole)
            resolve()
          } else {
            reject(new Error('Credenciales inválidas'))
          }
        }, 500)
      })
    },

    // Login como invitado
    async loginAsGuest() {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          this.token = 'guest-token'
          this.userRole = 'guest'
          localStorage.setItem('auth_token', this.token)
          localStorage.setItem('user_role', this.userRole)
          resolve()
        }, 200)
      })
    },

    // Cerrar sesión
    logout() {
      // 1) Limpio estado reactivo al instante
      this.token = ''
      this.userRole = ''

      // 2) Limpio persistencia
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_role')
    },
  },
})
