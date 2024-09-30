<template>
  <div>
    <form @submit.prevent="searchProducts">
      <input v-model="productName" placeholder="Product Name" />
      <input v-model="creationDateFrom" placeholder="Creation Date From" type="date" />
      <input v-model="creationDateTo" placeholder="Creation Date To" type="date" />
      <input v-model="categoryName" placeholder="Category Name" />
      <input v-model="supplierName" placeholder="Supplier Name" />
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
import { defineComponent } from 'vue'
import axios from 'axios'

export default defineComponent({
  data() {
    return {
      productName: '',
      creationDateFrom: '',
      creationDateTo: '',
      categoryName: '',
      supplierName: '',
      products: [] as Array<{ id: number; name: string; price: number }>,
      currentPage: 1,
      totalPages: 0,
      totalProducts: 0,
      limit: 10,
      errorMessage: '' // Для хранения сообщения об ошибке
    }
  },
  methods: {
    async searchProducts(event: Event, page: number = 1) {
      event.preventDefault() // Prevent default form submission behavior

      this.errorMessage = '' // Сбрасываем сообщение об ошибке перед каждым запросом

      // Начальные параметры для запроса
      const params: any = {
        limit: this.limit,
        offset: (page - 1) * this.limit // Расчет смещения на основе текущей страницы
      }

      // Добавляем только непустые параметры
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

      try {
        const response = await axios.get('http://127.0.0.1:8000/api/search/products', {
          params
        })
        this.products = response.data.products
        this.totalProducts = response.data.total_products // Общее количество продуктов
        this.totalPages = response.data.total_pages // Общее количество страниц
        this.currentPage = page // Устанавливаем текущую страницу
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          this.errorMessage = 'No products found matching the criteria'
        } else {
          this.errorMessage = 'An error occurred while fetching products'
        }
        console.error('Error fetching products:', error)
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.searchProducts(new Event(''), this.currentPage + 1) // Переход к следующей странице
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.searchProducts(new Event(''), this.currentPage - 1) // Переход к предыдущей странице
      }
    }
  }
})
</script>

<style scoped>
/* Добавьте свои стили здесь */
.error-message {
  font-weight: bold;
  margin-top: 10px;
}
</style>
