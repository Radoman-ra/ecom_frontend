<template>
  <div id="app">
    <router-view></router-view>
    <!-- Рендерим активный маршрут -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'App'
})
</script>

<style>
/* Добавь глобальные стили, если нужно */
</style>
