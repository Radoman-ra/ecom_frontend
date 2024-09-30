<template>
  <div>
    <button @click="goHome">Home</button>
    <h1>My Orders</h1>
    <form @submit.prevent="fetchOrders">
      <label for="status">Order Status:</label>
      <select v-model="selectedStatus">
        <option value="">All</option>
        <option value="Pending">Pending</option>
        <option value="Delivered">Delivered</option>
        <option value="Cancelled">Cancelled</option>
      </select>
      <button type="submit">Filter</button>
    </form>

    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

    <div v-if="orders.length && !errorMessage">
      <ul>
        <li v-for="order in orders" :key="order.id">
          <h2>Order ID: {{ order.id }}</h2>
          <p>Status: {{ order.status }}</p>
          <p>Order Date: {{ new Date(order.order_date).toLocaleString() }}</p>
          <ul>
            <li v-for="product in order.products" :key="product.product_id">
              Product ID: {{ product.product_id }}, Quantity: {{ product.quantity }}
            </li>
          </ul>
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
import { useRouter } from 'vue-router'

export default defineComponent({
  data() {
    return {
      orders: [] as Array<{
        id: number
        status: string
        order_date: string
        products: Array<{ product_id: number; quantity: number }>
      }>,
      currentPage: 1,
      totalPages: 0,
      errorMessage: '',
      selectedStatus: ''
    }
  },
  setup() {
    const router = useRouter()

    const goHome = () => {
      router.push('/')
    }

    return { goHome }
  },
  methods: {
    getCookie(name: string): string | null {
      const value = `; ${document.cookie}`
      const parts = value.split(`; ${name}=`)
      if (parts.length === 2) return parts.pop()!.split(';').shift() || null
      return null
    },
    async fetchOrders() {
      const token = this.getCookie('access_token')
      if (!token) {
        this.errorMessage = 'Authorization token is missing'
        return
      }
      try {
        const params: any = {
          limit: 10,
          offset: (this.currentPage - 1) * 10
        }

        if (this.selectedStatus) {
          params.status = this.selectedStatus
        }

        const response = await axios.get('http://127.0.0.1:8000/api/orders/my-orders', {
          params,
          headers: {
            Authorization: `${token}`
          }
        })
        this.orders = response.data.orders
        this.totalPages = response.data.total_pages
      } catch (error: any) {
        this.errorMessage = 'Failed to fetch orders'
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
        this.fetchOrders()
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--
        this.fetchOrders()
      }
    }
  },
  mounted() {
    this.fetchOrders()
  }
})
</script>

<style scoped>
.error-message {
  color: red;
  font-weight: bold;
}
</style>
