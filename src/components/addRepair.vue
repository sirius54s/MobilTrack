<script setup lang="ts">
import { reactive, computed } from "vue"

// Opciones para el técnico asignado
const tecnicos = [
  { label: "Yoel", value: "Yoel" },
  { label: "manuel", value: "manuel" },
  { label: "No especificar", value: "No especificar" },
]

// Opciones para el Estado
const estadoOptions = [
  { label: "Listo", value: "Listo" },
  { label: "Cancelado", value: "Cancelado" },
  { label: "Pendiente", value: "Pendiente" },
]

// Opciones para la Marca
const marcaOptions = [
  { label: "Apple", value: "Apple" },
  { label: "Samsung", value: "Samsung" },
  { label: "Huawei", value: "Huawei" },
  { label: "Xiaomi", value: "Xiaomi" },
  { label: "Motorola", value: "Motorola" },
  { label: "Oppo", value: "Oppo" },
  { label: "Vivo", value: "Vivo" },
  { label: "Realme", value: "Realme" },
  { label: "OnePlus", value: "OnePlus" },
  { label: "Nokia", value: "Nokia" },
  { label: "Sony", value: "Sony" },
  { label: "Google", value: "Google" },
  { label: "LG", value: "LG" },
]

// Calcular hoy en formato "YYYY-MM-DD"
const today = new Date().toISOString().split("T")[0]

// Estado reactivo del formulario
const formData = reactive({
  id: Math.floor(Date.now() * Math.random()).toString(),
  marca: "",
  modelo: "",
  estado: "Pendiente",
  fecha: today,
  tipoServicio: "",
  costoEstimado: "",
  fechaEntrega: "",
  tecnicoAsignado: "",
  nombreCliente: "",
  telefono: "",
  notaDetalles: "",
  imprimirBoleta: true,
})

// Computed para formatear costo
const formattedCosto = computed({
  get() {
    if (!formData.costoEstimado) return ""
    return new Intl.NumberFormat("es-CL").format(Number(formData.costoEstimado))
  },
  set(val: string) {
    formData.costoEstimado = val.replace(/\D/g, "")
  },
})

const submitForm = () => {
  console.log("Datos enviados:", formData)
  // lógica de envío al backend…
}
</script>

<template>
  <q-card class="q-ma-md">
    <!-- Encabezado -->
    <q-bar class="q-pa-xs">
      <q-icon name="arrow_forward" />
      <div>Agregar un nuevo registro:</div>
      <q-space />
      <q-btn
        dense
        flat
        round
        icon="close"
        v-close-popup
        @click="$emit('close')"
      >
        <q-tooltip>Close</q-tooltip>
      </q-btn>
    </q-bar>

    <q-separator />

    <q-card-section class="q-pa-md">
      <q-form @submit.prevent="submitForm">
        <div class="row q-col-gutter-md">
          <!-- Columna Izquierda: Servicio -->
          <div class="col-12 col-md-6">
            <div class="section-header">Servicio</div>

            <!-- ID y Marca -->
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  filled
                  dense
                  v-model="formData.id"
                  label="ID"
                  disable
                  class="q-mb-sm"
                />
              </div>
              <div class="col-6">
                <q-select
                  filled
                  dense
                  v-model="formData.marca"
                  :options="marcaOptions"
                  label="Marca"
                  class="q-mb-sm"
                />
              </div>
            </div>

            <!-- Modelo y Estado -->
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  filled
                  dense
                  v-model="formData.modelo"
                  label="Modelo"
                  placeholder="Ingresa modelo"
                  class="q-mb-sm"
                />
              </div>
              <div class="col-6">
                <q-select
                  filled
                  dense
                  v-model="formData.estado"
                  :options="estadoOptions"
                  label="Estado"
                  class="q-mb-sm"
                />
              </div>
            </div>

            <!-- Fecha y Tipo de reparación -->
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  filled
                  dense
                  v-model="formData.fecha"
                  label="Fecha"
                  type="date"
                  class="q-mb-sm"
                />
              </div>
              <div class="col-6">
                <q-input
                  filled
                  dense
                  v-model="formData.tipoServicio"
                  label="Tipo de reparación"
                  class="q-mb-sm"
                />
              </div>
            </div>

            <!-- Costo y Fecha de entrega -->
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  filled
                  dense
                  v-model="formattedCosto"
                  label="Costo (CLP)"
                  prefix="$"
                  class="q-mb-sm"
                />
              </div>
              <div class="col-6">
                <q-input
                  filled
                  dense
                  v-model="formData.fechaEntrega"
                  label="Entrega"
                  type="date"
                  class="q-mb-sm"
                />
              </div>
            </div>

            <!-- Técnico -->
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-select
                  filled
                  dense
                  v-model="formData.tecnicoAsignado"
                  :options="tecnicos"
                  label="Técnico"
                  class="q-mb-sm"
                />
              </div>
            </div>
          </div>

          <!-- Columna Derecha: Cliente -->
          <div class="col-12 col-md-6">
            <div class="section-header">Cliente</div>
            <q-input
              filled
              dense
              v-model="formData.nombreCliente"
              label="Nombre"
              class="q-mb-sm"
            />
            <q-input
              filled
              dense
              v-model="formData.telefono"
              label="Teléfono"
              type="tel"
              prefix="+56"
              class="q-mb-sm"
            />
            <q-input
              filled
              dense
              v-model="formData.notaDetalles"
              label="Notas"
              type="textarea"
              autogrow
              class="q-mb-sm"
            />
            <q-checkbox
              filled
              dense
              v-model="formData.imprimirBoleta"
              label="Imprimir boleta"
              class="q-mb-sm"
            />
          </div>
        </div>

        <!-- Botón de envío -->
        <div class="row q-mt-md">
          <div class="col-12">
            <q-btn
              label="Enviar"
              type="submit"
              color="primary"
              class="full-width"
            />
          </div>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<style scoped lang="sass">
.full-width
  width: 100%

.section-header
  font-weight: bold
  font-size: 1.1rem
  margin-bottom: 8px
  color: var(--q-color-primary)
</style>
