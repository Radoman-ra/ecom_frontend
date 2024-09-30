<template>
  <div>
    <button @click="goHome">Home</button>
    <h1>Your Cart</h1>
    <div v-if="cartItems.length === 0">Your cart is empty.</div>
    <ul v-else>
      <li v-for="item in cartItems" :key="item.id">
        {{ item.name }} - {{ item.price }}$ x
        <input type="number" v-model.number="item.quantity" min="1" @input="updateQuantity(item)" />
        = {{ (item.price * item.quantity).toFixed(2) }}$
        <button @click="removeFromCart(item.id)">Remove</button>
      </li>
    </ul>
    <div v-if="cartItems.length > 0">
      <h3>Total Price: {{ totalPrice.toFixed(2) }}$</h3>
      <button @click="checkout">Checkout</button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const router = useRouter()
    const cartItems = ref(JSON.parse(localStorage.getItem('cart') || '[]'))

    const totalPrice = computed(() => {
      return cartItems.value.reduce(
        (acc: number, item: { price: number; quantity: number }) =>
          acc + item.price * item.quantity,
        0
      )
    })

    const removeFromCart = (id: number) => {
      const updatedCart = cartItems.value.filter((item: { id: number }) => item.id !== id)
      localStorage.setItem('cart', JSON.stringify(updatedCart))
      cartItems.value = updatedCart
    }

    const updateQuantity = (item: { id: number; quantity: number }) => {
      if (item.quantity < 1) {
        removeFromCart(item.id)
      } else {
        const updatedCart = cartItems.value.map((cartItem: { id: number; quantity: number }) =>
          cartItem.id === item.id ? { ...cartItem, quantity: item.quantity } : cartItem
        )
        localStorage.setItem('cart', JSON.stringify(updatedCart))
        cartItems.value = updatedCart
      }
    }

    const checkout = async () => {
      const products = cartItems.value.map((item: { id: number; quantity: number }) => ({
        product_id: item.id,
        quantity: item.quantity
      }))

      const order = {
        products
      }

      const getAccessToken = () => {
        const cookieString = document.cookie
        const cookies = cookieString.split('; ')
        const tokenCookie = cookies.find((cookie) => cookie.startsWith('access_token='))
        return tokenCookie ? tokenCookie.split('=')[1] : null
      }

      const token = getAccessToken()

      try {
        const response = await fetch('http://127.0.0.1:8000/api/orders/', {
          method: 'POST',
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        })

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        const responseData = await response.json()
        alert('Order placed successfully!')
        console.log('Server response:', responseData)
        localStorage.removeItem('cart')
        cartItems.value = []
      } catch (error) {
        console.error('Error placing order:', error)
        alert('Failed to place order. Please try again.')
      }
    }

    const goHome = () => {
      router.push('/')
    }

    return {
      cartItems,
      totalPrice,
      removeFromCart,
      updateQuantity,
      checkout,
      goHome
    }
  }
})
</script>

<style scoped></style>
