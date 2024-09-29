<template>
  <div>
    <h1>Orders</h1>
    <ul>
      <li v-for="order in orders" :key="order.id">Order ID: {{ order.id }}</li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { fetchOrders } from '../services/orders'

export default defineComponent({
  data() {
    return {
      orders: []
    }
  },
  async created() {
    this.orders = await fetchOrders()
  }
})
</script>
