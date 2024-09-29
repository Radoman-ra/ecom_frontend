<template>
  <div>
    <h1>Products</h1>
    <ul>
      <li v-for="product in products" :key="product.id">{{ product.name }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { fetchProducts } from '../services/products'

export default defineComponent({
  data() {
    return {
      products: []
    }
  },
  async created() {
    this.products = await fetchProducts({})
  }
})
</script>
