import { RouteRecordRaw } from "vue-router"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("src/layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "home",
        component: () => import("src/pages/IndexPage.vue"),
        meta: { requiresAuth: true },
      },
      {
        path: "login",
        name: "login",
        component: () => import("src/pages/homeLogin.vue"),
        meta: { requiresAuth: false },
      },

      {
        path: "setupPage",
        name: "setupPage",
        component: () => import("src/pages/setupPage.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },
  {
    path: "/:catchAll(.*)*",
    component: () => import("src/pages/ErrorNotFound.vue"),
  },
]

export default routes
