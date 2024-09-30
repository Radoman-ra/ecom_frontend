<template>
  <div>
    <form @submit.prevent="searchProducts">
      <input v-model="productName" placeholder="Product Name" />
      <input v-model="creationDateFrom" placeholder="Creation Date From" type="date" />
      <input v-model="creationDateTo" placeholder="Creation Date To" type="date" />
      <input v-model="categoryName" placeholder="Category Name" />
      <input v-model="supplierName" placeholder="Supplier Name" />
      <input v-model="minPrice" placeholder="Min Price" type="number" />
      <input v-model="maxPrice" placeholder="Max Price" type="number" />
      <button type="submit">Search</button>
    </form>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <div v-if="products.length && !errorMessage">
      <h2>Search Results:</h2>
      <ul>
        <li v-for="product in products" :key="product.id">
          {{ product.name }} - {{ product.price }}$
          <button @click="addToCart(product)">Add to Cart</button>
          <span v-if="getCartQuantity(product.id) > 0">
            ({{ getCartQuantity(product.id) }} in cart)</span
          >
        </li>
      </ul>
      <div>
        <p>Page {{ currentPage }} of {{ totalPages }}</p>
        <button @click="prevPage" :disabled="currentPage === 1">Previous</button>
        <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import axios from 'axios'

export default defineComponent({
  data() {
    return {
      productName: '',
      creationDateFrom: '',
      creationDateTo: '',
      categoryName: '',
      supplierName: '',
      minPrice: '',
      maxPrice: '',
      products: [] as Array<{ id: number; name: string; price: number }>,
      currentPage: 1,
      totalPages: 0,
      totalProducts: 0,
      limit: 10,
      errorMessage: '',
      cart: reactive(JSON.parse(localStorage.getItem('cart') || '[]'))
    }
  },
  methods: {
    async searchProducts() {
      this.errorMessage = ''

      const params: any = {
        limit: this.limit,
        offset: (this.currentPage - 1) * this.limit
      }

      if (this.productName) {
        params.product_name = this.productName
      }
      if (this.creationDateFrom) {
        params.creation_date_from = this.creationDateFrom
      }
      if (this.creationDateTo) {
        params.creation_date_to = this.creationDateTo
      }
      if (this.categoryName) {
        params.category_name = this.categoryName
      }
      if (this.supplierName) {
        params.supplier_name = this.supplierName
      }
      if (this.minPrice) {
        params.min_price = this.minPrice
      }
      if (this.maxPrice) {
        params.max_price = this.maxPrice
      }

      try {
        const response = await axios.get('http://127.0.0.1:8000/api/search/products', {
          params
        })
        this.products = response.data.products
        this.totalProducts = response.data.total_products
        this.totalPages = response.data.total_pages
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          this.errorMessage = 'No products found matching the criteria'
        } else {
          this.errorMessage = 'An error occurred while fetching products'
        }
        console.error('Error fetching products:', error)
      }
    },
    async nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        await this.searchProducts()
      }
    },
    async prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        await this.searchProducts()
      }
    },
    addToCart(product: { id: number; name: string; price: number }) {
      const existingItem = this.cart.find((item: { id: number }) => item.id === product.id)

      if (existingItem) {
        existingItem.quantity++
      } else {
        this.cart.push({ ...product, quantity: 1 })
      }

      localStorage.setItem('cart', JSON.stringify(this.cart))
      this.cart = reactive(JSON.parse(localStorage.getItem('cart') || '[]'))
    },
    getCartQuantity(productId: number): number {
      const item = this.cart.find((item: { id: number }) => item.id === productId)
      return item ? item.quantity : 0
    }
  }
})
</script>

<style scoped>
.error-message {
  font-weight: bold;
  margin-top: 10px;
}
</style>
