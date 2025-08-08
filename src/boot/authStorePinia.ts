// src/boot/authStorePinia.ts
import { defineStore } from "pinia"
import { ref, computed } from "vue"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth"
import { auth } from "src/boot/firebaseConfig"

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const initialized = ref(false)
  const isLoggingOut = ref(false)

  // Computed para verificar si está autenticado
  const isAuthenticated = computed(() => !!user.value)

  async function login({
    email,
    password,
  }: {
    email: string
    password: string
  }) {
    loading.value = true
    error.value = null
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      )
      user.value = userCredential.user
      console.log("✅ Login exitoso:", userCredential.user.email)
    } catch (err: unknown) {
      error.value = getErrorMessage(err)
      console.error("❌ Error de login:", err)
    } finally {
      loading.value = false
    }
  }

  async function register({
    email,
    password,
  }: {
    email: string
    password: string
  }) {
    loading.value = true
    error.value = null
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      )
      user.value = userCredential.user
      console.log("✅ Registro exitoso:", userCredential.user.email)
    } catch (err: unknown) {
      error.value = getErrorMessage(err)
      console.error("❌ Error de registro:", err)
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    isLoggingOut.value = true
    error.value = null
    try {
      await signOut(auth)
      console.log("✅ Logout exitoso")
      return true
    } catch (err: unknown) {
      error.value = getErrorMessage(err)
      console.error("❌ Error de logout:", err)
      return false
    } finally {
      loading.value = false
      isLoggingOut.value = false
    }
  }

  function initializeAuth() {
    console.log("🔄 Inicializando auth store...")

    return new Promise<void>((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        console.log(
          "👤 Estado de auth cambió:",
          currentUser?.email || "No autenticado",
        )
        user.value = currentUser

        if (!initialized.value) {
          initialized.value = true
          loading.value = false
          console.log("✅ Auth store inicializado")
          resolve()
        }
      })

      // Opcional: retornar función de cleanup
      return unsubscribe
    })
  }

  function getErrorMessage(err: unknown): string {
    const error = err as { code?: string; message?: string }

    switch (error.code) {
      case "auth/user-not-found":
        return "Usuario no encontrado"
      case "auth/wrong-password":
        return "Contraseña incorrecta"
      case "auth/email-already-in-use":
        return "Este correo ya está registrado"
      case "auth/invalid-email":
        return "Correo no válido"
      case "auth/weak-password":
        return "La contraseña es muy débil"
      case "auth/invalid-credential":
        return "Credenciales inválidas"
      default:
        return `Error: ${error.message || "Error desconocido"}`
    }
  }
  return {
    user,
    loading,
    error,
    initialized,
    isAuthenticated,
    isLoggingOut,
    login,
    register,
    logout,
    initializeAuth,
  }
})
