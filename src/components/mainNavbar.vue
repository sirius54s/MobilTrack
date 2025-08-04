<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'
import { useModalStore } from 'src/stores/modalStore'
import { Dark } from 'quasar'

const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore()
const modalStore = useModalStore()

function logout() {
  $q.dialog({
    title: 'Confirmar',
    message: '¿Estás seguro que quieres cerrar sesión?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    auth.logout()
    router.push('/login').then(
      () => $q.notify({ type: 'info', message: 'Sesión cerrada correctamente', color: 'primary' }),
      (err) => {
        console.error('Fallo redirección:', err)
        $q.notify({ type: 'negative', message: 'Error al cerrar sesión' })
      },
    )
  })
}

function darkModeToggle() {
  $q.dark.toggle()
}
</script>

<template>
  <q-toolbar :class="Dark.isActive ? 'bg-grey-9 text-white' : 'bg-grey-1 text-black'">
    <q-toolbar-title>GestionFix v{{ $q.version }}</q-toolbar-title>

    <q-btn flat dense round icon="search" aria-label="Buscar" />
    <q-btn flat dense round icon="brightness_6" aria-label="Tema" @click="darkModeToggle" />
    <q-btn flat dense round icon="settings" aria-label="Configuración" />

    <q-btn flat dense round icon="logout" aria-label="Cerrar sesión" @click="logout">
      <q-tooltip>Cerrar sesión</q-tooltip>
    </q-btn>
  </q-toolbar>

  <!-- Diálogo global controlado por Pinia -->
  <q-dialog v-model="modalStore.modalVisible" persistent>
    <component :is="modalStore.activeModalComponent" @close="modalStore.closeModal" />
  </q-dialog>
</template>
