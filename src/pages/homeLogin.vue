<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'

const router = useRouter()
const $q = useQuasar()
const auth = useAuthStore()

const userWorkName = ref('')
const technicalName = ref('')

const deviceId = ref('')
const isSubmitting = ref(false)
const step = ref(1) // 1 = pedir nombre de usuario, 2 = pedir nombre de técnico

// Genera o carga el ID único de esta máquina
onMounted(() => {
  let id = localStorage.getItem('device_id')
  if (!id) {
    id = crypto.randomUUID?.() || Date.now().toString()
    localStorage.setItem('device_id', id)
  }
  deviceId.value = id
})

// Avanza al siguiente paso validando el nombre de usuario
function nextData() {
  if (!userWorkName.value.trim()) {
    return $q.notify({
      type: 'warning',
      message: 'Por favor ingresa tu nombre',
    })
  }
  step.value = 2
}

// Envía todo y hace login como invitado
async function submitGuestLogin() {
  if (!technicalName.value.trim()) {
    return $q.notify({
      type: 'warning',
      message: 'Por favor ingresa el nombre del técnico',
    })
  }

  isSubmitting.value = true
  try {
    // Persistir datos
    localStorage.setItem('user_name', userWorkName.value)
    localStorage.setItem('technician_name', technicalName.value)
    await auth.loginAsGuest()

    $q.notify({
      type: 'info',
      color: 'primary',
      message: `Bienvenido, ${userWorkName.value}! Técnico: ${technicalName.value}`,
    })
    await router.push('/')
  } catch (err) {
    console.error(err)
    $q.notify({
      type: 'negative',
      message: 'Error al ingresar como invitado',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <q-page
    class="flex-center"
    :class="$q.dark.isActive ? 'bg-black text-white' : 'bg-white text-black'"
    style="min-height: 100vh"
  >
    <q-card class="q-pa-lg" style="max-width: 400px; width: 100%">
      <div class="text-h6 text-center q-mb-md">Acceso como Invitado</div>

      <q-input
        v-if="step === 1"
        v-model="userWorkName"
        label="nombre de la empresa"
        filled
        placeholder="Escribe el nombre de tu empresa"
        :disable="isSubmitting"
        @keyup.enter="nextData"
        class="q-mb-md"
      />

      <q-input
        v-else
        v-model="technicalName"
        label="Nombre del Técnico"
        filled
        placeholder="Escribe el nombre del técnico"
        :disable="isSubmitting"
        @keyup.enter="submitGuestLogin"
        class="q-mb-md"
      />

      <div class="text-caption text-grey-6 q-mb-lg">ID del dispositivo: {{ deviceId }}</div>

      <div class="q-mt-md">
        <q-btn
          v-if="step === 1"
          label="Siguiente"
          color="primary"
          unelevated
          class="full-width"
          :disable="isSubmitting"
          @click="nextData"
        />

        <q-btn
          v-else
          label="Ingresar"
          color="primary"
          unelevated
          class="full-width"
          :loading="isSubmitting"
          :disable="isSubmitting"
          @click="submitGuestLogin"
        />
      </div>
    </q-card>
  </q-page>
</template>

<style scoped>
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}
.full-width {
  width: 100%;
}
</style>
