<template>
  <div>
    <AuthButtons />
    <SearchProducts />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AuthButtons from '../components/HomeButtons.vue'
import SearchProducts from '../components/SearchProducts.vue'

export default defineComponent({
  components: {
    AuthButtons,
    SearchProducts
  }
})
</script>
