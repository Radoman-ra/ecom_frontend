<template>
  <div>
    <AuthButtons />
    <!-- Компонент с кнопками авторизации/профиля -->
    <SearchProducts />
    <!-- Компонент с формой для поиска продуктов -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AuthButtons from '../components/AuthButtons.vue'
import SearchProducts from '../components/SearchProducts.vue'

export default defineComponent({
  components: {
    AuthButtons,
    SearchProducts
  }
})
</script>
