<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header principal de la aplicación -->
    <q-header elevated class="bg-primary text-white">
      <!-- Tu navbar personalizado -->
      <mainNavbar />
    </q-header>

    <!-- Contenedor principal donde se renderiza el contenido -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import mainNavbar from "src/components/mainNavbar.vue"
</script>

<style scoped>
/* Estilos específicos para el layout principal */
</style>
