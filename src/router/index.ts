import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';

// Importa tu authStore
import { useAuthStore } from 'src/stores/authStore';

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  // Guard global
  Router.beforeEach((to, from, next) => {
    const auth = useAuthStore();

    // Si la ruta requiere autenticación y no hay token → al login
    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return next({ path: '/login' });
    }

    // Si la ruta es sólo para invitados y ya estás autenticado → al home
    if (to.meta.guestOnly && auth.isAuthenticated) {
      return next({ path: '/' });
    }

    return next();
  });

  return Router;
});
