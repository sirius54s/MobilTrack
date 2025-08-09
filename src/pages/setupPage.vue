<script setup lang="ts">
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { useAuthStore } from "src/boot/authStorePinia"
import { doc, setDoc } from "firebase/firestore"
import { db } from "src/boot/firebaseConfig"

const router = useRouter()
const { user } = useAuthStore()
const loading = ref(false)

const TEMA_OPTIONS = [
  { label: "Claro", value: "light" },
  { label: "Oscuro", value: "dark" },
]

const genId = () => `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

const form = ref({
  name: "",
  company: "",
  phone: "",
  address: "",
  tecnicos: [{ id: genId(), name: "" }],
  settings: {
    theme: "light",
    modules: {
      dashboard: { name: "Main Panel", install: true, disable: true },
      repairs: { name: "Repair Management", install: true, disable: true },
      clients: { name: "Client Administration", install: true, disable: true },
      technicians: { name: "Technician Control", install: true, disable: true },
      reports: {
        name: "Reports and Statistics",
        install: false,
        disable: true,
      },
      settings: { name: "System Configuration", install: true, disable: true },
    },
  },
})

const valid = computed(
  () =>
    form.value.name.trim() &&
    form.value.company.trim() &&
    form.value.tecnicos.every((t) => t.name.trim()),
)

const addTecnico = () => form.value.tecnicos.push({ id: genId(), name: "" })
const removeTecnico = (i: number) =>
  form.value.tecnicos.length > 1 && form.value.tecnicos.splice(i, 1)

const completeSetup = async () => {
  if (!user?.uid) return
  loading.value = true
  try {
    await setDoc(doc(db, "users", user.uid), {
      ...form.value,
      email: user.email,
      repairs: {},
    })
    router.push({ name: "home" })
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-page padding class="flex items-center justify-center">
    <q-card
      flat
      bordered
      class="q-pa-sm"
      style="width: 600px; border-radius: 10px"
    >
      <div class="text-center q-pa-lg">
        <div class="text-h5 text-weight-light">Completa tu perfil</div>
      </div>

      <q-form @submit="completeSetup">
        <!-- Datos personales -->
        <div class="row q-col-gutter-md">
          <q-input
            v-model="form.name"
            label="Nombre completo"
            dense
            filled
            required
            class="col-6"
          />
          <q-input
            v-model="form.company"
            label="Empresa / Negocio"
            dense
            filled
            required
            class="col-6"
          />
          <q-input
            v-model="form.phone"
            label="Teléfono"
            dense
            filled
            class="col-6"
          />
          <q-input
            v-model="form.address"
            label="Dirección"
            dense
            filled
            class="col-6"
          />
        </div>

        <!-- Técnicos y Tema -->
        <div class="row q-col-gutter-md q-mt-sm">
          <div class="col-6">
            <div class="flex items-center q-my-xs">
              <div class="text-subtitle2 flex items-center">
                <q-icon name="engineering" size="16px" class="q-mr-xs" />
                Técnicos
              </div>
              <q-btn
                dense
                flat
                round
                icon="add"
                size="sm"
                @click="addTecnico"
              />
            </div>

            <div
              v-for="(t, i) in form.tecnicos"
              :key="t.id"
              class="row items-center q-col-gutter-sm q-my-xs"
            >
              <q-input
                v-model="t.name"
                :label="`Técnico ${i + 1}`"
                dense
                filled
                required
                class="col-8"
              />
              <q-btn
                v-if="form.tecnicos.length > 1"
                dense
                flat
                round
                icon="delete"
                size="sm"
                color="negative"
                @click="removeTecnico(i)"
                class="col-4"
              />
            </div>
          </div>

          <div class="col-6">
            <q-select
              v-model="form.settings.theme"
              :options="TEMA_OPTIONS"
              label="Tema"
              dense
              filled
            />
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Módulos -->
        <div class="text-subtitle2 q-my-xs">
          <q-icon name="apps" size="16px" class="q-mr-xs" />
          Módulos
        </div>
        <div class="row q-col-gutter-sm">
          <q-toggle
            v-for="(m, key) in form.settings.modules"
            :key="key"
            v-model="m.install"
            :label="m.name"
            color="secondary"
            dense
            class="col-6"
          />
        </div>

        <div class="text-center q-my-md">
          <q-btn
            type="submit"
            color="primary"
            unelevated
            :loading="loading"
            :disable="!valid"
            dense
          >
            Completar
          </q-btn>
        </div>
      </q-form>
    </q-card>
  </q-page>
</template>
