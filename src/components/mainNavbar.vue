<script setup lang="ts">
import { useRouter } from "vue-router"
import { useQuasar } from "quasar"
import { useAuthStore } from "src/boot/authStorePinia"
import { useModalStore } from "src/stores/modalStore"
import { Dark } from "quasar"
import { version } from "../../package.json"

const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore()
const modalStore = useModalStore()

function logout() {
  $q.dialog({
    title: "Confirmar",
    message: "¿Estás seguro que quieres cerrar sesión?",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    auth.logout()
    router.push("/login").then(
      () =>
        $q.notify({
          type: "info",
          message: "Sesión cerrada correctamente",
          color: "primary",
        }),
      (err) => {
        console.error("Fallo redirección:", err)
        $q.notify({ type: "negative", message: "Error al cerrar sesión" })
      },
    )
  })
}

function darkModeToggle() {
  $q.dark.toggle()
}
</script>

<template>
  <q-toolbar
    style="min-height: 40px; padding: 0 10px"
    :class="Dark.isActive ? 'bg-grey-9 text-white' : 'bg-grey-1 text-black'"
  >
    <q-toolbar-title>BETA v{{ version }}</q-toolbar-title>

    <q-btn
      flat
      dense
      round
      v-show="auth.user"
      icon="search"
      aria-label="Buscar"
    />
    <q-btn
      flat
      dense
      round
      :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
      :aria-label="$q.dark.isActive ? 'Tema claro' : 'Tema oscuro'"
      @click="darkModeToggle"
    />
    <q-btn
      flat
      dense
      round
      v-show="auth.user"
      icon="settings"
      aria-label="Configuración"
    />

    <q-btn
      flat
      dense
      round
      icon="logout"
      aria-label="Cerrar sesión"
      @click="logout"
      v-show="auth.user"
    >
      <q-tooltip>Cerrar sesión</q-tooltip>
    </q-btn>
  </q-toolbar>

  <!-- Diálogo global controlado por Pinia -->
  <q-dialog v-model="modalStore.modalVisible" persistent>
    <component
      :is="modalStore.activeModalComponent"
      @close="modalStore.closeModal"
    />
  </q-dialog>
</template>
