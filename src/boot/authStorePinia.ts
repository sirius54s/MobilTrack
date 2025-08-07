import { defineStore } from "pinia"
import { ref } from "vue"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth"
import { auth } from "./firebaseConfig"

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

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
    } catch (err: any) {
      error.value = getErrorMessage(err)
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
    } catch (err: any) {
      error.value = getErrorMessage(err)
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    error.value = null
    try {
      await signOut(auth)
      user.value = null
    } catch (err: any) {
      error.value = getErrorMessage(err)
    } finally {
      loading.value = false
    }
  }

  function initializeAuth() {
    loading.value = true
    onAuthStateChanged(auth, (currentUser) => {
      user.value = currentUser
      loading.value = false
    })
  }

  function getErrorMessage(err: any): string {
    const code = err.code || ""
    switch (code) {
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
      default:
        return "Error desconocido"
    }
  }

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    initializeAuth,
  }
})
