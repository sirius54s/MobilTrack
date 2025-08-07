<template>
  <q-page class="flex-center" style="min-height: 100vh">
    <q-card class="q-pa-lg" style="max-width: 400px; width: 100%">
      <div class="text-h6 text-center q-mb-md">Autenticación</div>

      <q-tabs v-model="tab" class="q-mb-md" dense>
        <q-tab name="login" label="Iniciar sesión" />
        <q-tab name="register" label="Registrarse" />
      </q-tabs>

      <q-tab-panels v-model="tab" animated>
        <!-- Login -->
        <q-tab-panel name="login">
          <q-input
            v-model="email"
            label="Correo"
            type="email"
            filled
            class="q-mb-md"
          />
          <q-input
            v-model="password"
            label="Contraseña"
            type="password"
            filled
            class="q-mb-md"
          />
          <q-btn
            label="Ingresar"
            color="primary"
            class="full-width"
            :loading="auth.loading"
            @click="login"
          />
        </q-tab-panel>

        <!-- Registro -->
        <q-tab-panel name="register">
          <q-input
            v-model="email"
            label="Correo"
            type="email"
            filled
            class="q-mb-md"
          />
          <q-input
            v-model="password"
            label="Contraseña"
            type="password"
            filled
            class="q-mb-md"
          />
          <q-btn
            label="Registrarse"
            color="secondary"
            class="full-width"
            :loading="auth.loading"
            @click="register"
          />
        </q-tab-panel>
      </q-tab-panels>

      <div v-if="auth.error" class="text-negative q-mt-md text-caption">
        {{ auth.error }}
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "src/boot/authStorePinia"

const tab = ref<"login" | "register">("login")
const email = ref("")
const password = ref("")
const router = useRouter()
const auth = useAuthStore()

onMounted(() => {
  auth.initializeAuth()
})

async function login() {
  await auth.login({ email: email.value, password: password.value })
  if (auth.user) {
    router.push("/")
  }
}

async function register() {
  await auth.register({ email: email.value, password: password.value })
  if (auth.user) {
    router.push("/")
  }
}
</script>

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
