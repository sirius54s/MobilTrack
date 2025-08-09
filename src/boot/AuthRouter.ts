// src/boot/AuthRouter.ts
import { Router } from "vue-router"
import { auth, db } from "src/boot/firebaseConfig"
import { User, onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

// Obtener usuario actual
const getCurrentUser = (): Promise<User | null> =>
  new Promise((resolve) => {
    if (auth.currentUser) return resolve(auth.currentUser)
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })

// Verificar si usuario existe en DB
const userExists = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    return userDoc.exists()
  } catch {
    return false
  }
}

export function setupAuthGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)
    const user = await getCurrentUser()

    // Sin auth y ruta protegida -> login
    if (requiresAuth && !user) {
      return next({ name: "login" })
    }

    // Con auth y va a login -> verificar setup
    if (!requiresAuth && user && to.name === "login") {
      const hasDocument = await userExists(user.uid)

      if (!hasDocument) {
        return next({ name: "setupPage" })
      } else if (from.name !== "home") {
        return next({ name: "home" })
      }
    }

    // Con auth y ruta protegida (no setup) -> verificar documento
    if (user && requiresAuth && to.name !== "setupPage") {
      const hasDocument = await userExists(user.uid)
      if (!hasDocument) {
        return next({ name: "setupPage" })
      }
    }

    next()
  })
}
