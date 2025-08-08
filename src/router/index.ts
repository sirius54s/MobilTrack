import { createRouter, createWebHashHistory } from "vue-router"
import routes from "./routes"
import { setupAuthGuard } from "src/boot/AuthRouter"

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

setupAuthGuard(router)

export default router
