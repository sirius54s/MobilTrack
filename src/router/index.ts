import { createRouter, createWebHistory } from "vue-router"
import routes from "./routes"
import { setupAuthGuard } from "src/boot/AuthRouter"

const router = createRouter({
  history: createWebHistory(),
  routes,
})

//  aca Proteger rutas
setupAuthGuard(router)

export default router
