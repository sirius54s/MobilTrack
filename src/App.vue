<script setup lang="ts">
import { onMounted } from "vue"
import { useAuthStore } from "src/boot/authStorePinia"

const authStore = useAuthStore()

onMounted(async () => {
  console.log("🚀 Inicializando app y auth store...")
  await authStore.initializeAuth()
  console.log("✅ App inicializada correctamente")
})
</script>

<template>
  <div
    v-if="authStore.loading && !authStore.initialized"
    class="loading-screen"
  >
    <!-- Pantalla de carga mientras Firebase inicializa -->
    <div class="flex flex-center full-height">
      <q-spinner color="primary" size="10em" />
    </div>
  </div>

  <router-view v-else />
</template>

<style scoped>
.loading-screen {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
</style>
