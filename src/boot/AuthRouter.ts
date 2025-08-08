// src/boot/AuthRouter.ts
import { Router } from "vue-router"
import { auth } from "src/boot/firebaseConfig"
import { User, onAuthStateChanged } from "firebase/auth"

function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    if (auth.currentUser !== null) {
      resolve(auth.currentUser)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}

export function setupAuthGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    console.log("🔒 Auth Guard - Navegando de:", from.path, "hacia:", to.path)

    // Verificar si la ruta requiere autenticación
    const requiresAuth = to.matched.some(
      (record) => record.meta?.requiresAuth === true,
    )
    console.log("🔐 Requiere autenticación:", requiresAuth)
    console.log("📋 Meta de la ruta:", to.meta)

    try {
      const user = await getCurrentUser()
      console.log("👤 Usuario actual:", user?.email || "No autenticado")

      if (requiresAuth && !user) {
        console.log("❌ Acceso denegado - Redirigiendo a login")
        next({ name: "login" })
        return
      }

      if (
        !requiresAuth &&
        user &&
        (to.path === "/login" || to.name === "login")
      ) {
        console.log("✅ Usuario ya autenticado - Redirigiendo a home")
        if (from.path !== "/" || from.name !== "home") {
          next({ name: "home" })
          return
        }
      }

      console.log("✅ Acceso permitido")
      next()
    } catch (error) {
      console.error("💥 Error en auth guard:", error)
      next({ name: "login" })
    }
  })
}
