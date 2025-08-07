import { Router } from "vue-router"
import { auth } from "src/boot/firebaseConfig"
import { User } from "firebase/auth"

function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        unsubscribe()
        resolve(user)
      },
      (error) => {
        unsubscribe()
        reject(error)
      },
    )
  })
}
export function setupAuthGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const user = await getCurrentUser()

    if (requiresAuth && !user) {
      next({ path: "/login" })
    } else if (!requiresAuth && user && to.path === "/login") {
      // Evitar que usuarios logueados accedan al login
      next({ path: "/" })
    } else {
      next()
    }
  })
}
