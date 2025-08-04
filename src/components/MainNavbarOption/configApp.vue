<script lang="ts" setup>
import { ref } from 'vue';

interface Config {
  language: string;
  theme: string;
  notifications: boolean;
  sound: boolean;
  enableLogs: boolean;
  logLevel: string;
  autoUpdate: boolean;
  cacheSize: number;
}

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', payload: Config): void;
}>();

const languageOptions = [
  { label: 'Español', value: 'es' },
  { label: 'Inglés', value: 'en' },
  { label: 'Portugués', value: 'pt' },
];

const themeOptions = [
  { label: 'Claro', value: 'light' },
  { label: 'Oscuro', value: 'dark' },
];

const logLevelOptions = [
  { label: 'Error', value: 'error' },
  { label: 'Advertencia', value: 'warn' },
  { label: 'Información', value: 'info' },
  { label: 'Depuración', value: 'debug' },
];

const config = ref<Config>({
  language: 'es',
  theme: 'light',
  notifications: true,
  sound: true,
  enableLogs: false,
  logLevel: 'error',
  autoUpdate: true,
  cacheSize: 100,
});

function saveConfig() {
  emit('save', config.value);
  emit('close');
}
</script>

<template>
  <q-card>
    <!-- Encabezado -->
    <q-bar class="q-pa-xs">
      <q-icon name="settings" />
      <div>Configuración:</div>
      <q-space />
      <q-btn dense flat round icon="close" @click="emit('close')">
        <q-tooltip>Cerrar</q-tooltip>
      </q-btn>
    </q-bar>

    <q-separator />

    <!-- Formulario -->
    <q-card-section class="q-pa-md">
      <q-form @submit.prevent="saveConfig">
        <div class="row q-col-gutter-md">
          <!-- Ajustes Generales -->
          <div class="col-12 col-md-6">
            <div class="section-header">General</div>
            <q-select
              filled
              dense
              v-model="config.language"
              :options="languageOptions"
              label="Idioma"
              class="q-mb-sm"
            />
            <q-select
              filled
              dense
              v-model="config.theme"
              :options="themeOptions"
              label="Tema"
              class="q-mb-sm"
            />
            <q-toggle dense v-model="config.notifications" label="Notificaciones" class="q-mb-md" />
            <q-toggle dense v-model="config.sound" label="Sonidos" class="q-mb-md" />
          </div>

          <!-- Ajustes Avanzados -->
          <div class="col-12 col-md-6">
            <div class="section-header">Avanzado</div>
            <q-checkbox
              filled
              dense
              v-model="config.enableLogs"
              label="Habilitar logs"
              class="q-mb-sm"
            />
            <q-select
              filled
              dense
              v-model="config.logLevel"
              :options="logLevelOptions"
              label="Nivel de log"
              class="q-mb-sm"
            />
            <q-toggle
              dense
              v-model="config.autoUpdate"
              label="Actualizaciones automáticas"
              class="q-mb-sm"
            />
            <q-input
              filled
              dense
              v-model.number="config.cacheSize"
              label="Tamaño de caché"
              type="number"
              suffix="MB"
              class="q-mb-sm"
            />
          </div>
        </div>

        <!-- Botones -->
        <div class="row q-mt-md">
          <div class="col-6">
            <q-btn
              label="Cancelar"
              color="secondary"
              flat
              @click="emit('close')"
              class="full-width"
            />
          </div>
          <div class="col-6">
            <q-btn label="Guardar" type="submit" color="primary" class="full-width" />
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>
