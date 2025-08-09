<script lang="ts" setup>
import { ref, onMounted } from "vue"
import { useQuasar } from "quasar"

interface Settings {
  theme: string
  notifications: { email: boolean }
  modules: {
    dashboard: { name: string; install: boolean; disable: boolean }
    repairs: { name: string; install: boolean; disable: boolean }
    clients: { name: string; install: boolean; disable: boolean }
    technicians: { name: string; install: boolean; disable: boolean }
    reports: { name: string; install: boolean; disable: boolean }
    settings: { name: string; install: boolean; disable: boolean }
  }
}

const emit = defineEmits<{
  (e: "close"): void
  (e: "save", payload: Settings): void
}>()

const $q = useQuasar()

const TEMA_OPTIONS = [
  { label: "Claro", value: "light" },
  { label: "Oscuro", value: "dark" },
]

const config = ref<Settings>({
  theme: "light",
  notifications: { email: true },
  modules: {
    dashboard: { name: "Panel Principal", install: true, disable: true },
    repairs: { name: "Gestión de Reparaciones", install: true, disable: true },
    clients: {
      name: "Administración de Clientes",
      install: true,
      disable: true,
    },
    technicians: { name: "Control de Técnicos", install: true, disable: true },
    reports: {
      name: "Reportes y Estadísticas",
      install: false,
      disable: false,
    },
    settings: {
      name: "Configuración del Sistema",
      install: true,
      disable: true,
    },
  },
})

onMounted(() => {
  loadSavedConfig()
})

function loadSavedConfig() {
  try {
    const savedConfig = localStorage.getItem("appSettings")
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig)
      config.value = { ...config.value, ...parsed }
      $q.dark.set(config.value.theme === "dark")
    }
  } catch (error) {
    console.warn("Error loading saved config:", error)
  }
}

function saveConfig() {
  try {
    $q.dark.set(config.value.theme === "dark")
    localStorage.setItem("appSettings", JSON.stringify(config.value))
    emit("save", config.value)
    $q.notify({
      type: "positive",
      message: "Configuración guardada correctamente",
      position: "top",
      timeout: 2000,
    })
    emit("close")
  } catch (error) {
    $q.notify({
      type: "negative",
      message: "Error al guardar la configuración",
      position: "top",
    })
    console.error("Save config error:", error)
  }
}

function resetConfig() {
  $q.dialog({
    title: "Restablecer configuración",
    message:
      "¿Estás seguro que quieres restablecer la configuración por defecto?",
    cancel: true,
    persistent: true,
  }).onOk(() => {
    config.value = {
      theme: "light",
      notifications: { email: true },
      modules: {
        dashboard: { name: "Panel Principal", install: true, disable: true },
        repairs: {
          name: "Gestión de Reparaciones",
          install: true,
          disable: true,
        },
        clients: {
          name: "Administración de Clientes",
          install: true,
          disable: true,
        },
        technicians: {
          name: "Control de Técnicos",
          install: true,
          disable: true,
        },
        reports: {
          name: "Reportes y Estadísticas",
          install: false,
          disable: false,
        },
        settings: {
          name: "Configuración del Sistema",
          install: true,
          disable: true,
        },
      },
    }

    $q.notify({
      type: "info",
      message: "Configuración restablecida",
      position: "top",
    })
  })
}
</script>

<template>
  <q-card style="min-width: 600px; max-width: 700px">
    <q-bar class="q-pa-xs">
      <q-icon name="settings" />
      <div>Configuración</div>
      <q-space />
      <q-btn dense flat round icon="close" @click="emit('close')">
        <q-tooltip>Cerrar</q-tooltip>
      </q-btn>
    </q-bar>

    <q-separator />

    <q-card-section class="q-pa-md">
      <q-form @submit.prevent="saveConfig">
        <!-- Tema y Notificaciones -->
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-6">
            <q-select
              filled
              dense
              v-model="config.theme"
              :options="TEMA_OPTIONS"
              label="Tema"
            />
          </div>
          <div class="col-6">
            <q-toggle
              v-model="config.notifications.email"
              label="Notificaciones por Email"
              color="primary"
            />
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Módulos -->
        <div class="text-subtitle2 q-mb-sm">
          <q-icon name="apps" size="16px" class="q-mr-xs" />
          Módulos del Sistema
        </div>

        <div class="row q-col-gutter-sm q-mb-md">
          <div
            v-for="(module, key) in config.modules"
            :key="key"
            class="col-12 col-sm-6"
          >
            <div
              class="flex items-center justify-between q-pa-sm rounded-borders"
              :class="$q.dark.isActive ? 'bg-grey-8' : 'bg-grey-1'"
            >
              <div class="text-body2">{{ module.name }}</div>
              <q-toggle
                v-model="config.modules[key].install"
                color="primary"
                :disable="module.disable"
                dense
              />
            </div>
          </div>
        </div>

        <!-- Botones -->
        <div class="row q-gutter-sm">
          <q-btn
            label="Restablecer"
            flat
            color="orange"
            @click="resetConfig"
            class="col-4"
          />
          <q-btn label="Cancelar" flat @click="emit('close')" class="col-4" />
          <q-btn
            label="Guardar"
            type="submit"
            color="primary"
            unelevated
            class="col-4"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>
