<template>
  <div class="cart-wrapper">
    <div class="header">
      <div class="auth-buttons">
        <HomeButtons />
      </div>
    </div>
    <div class="cart-container">
      <div class="main-cart">
        <div v-if="cartItems.length === 0" class="no_items">Your cart is empty.</div>
        <ul v-else class="cart-list">
          <li v-for="item in cartItems" :key="item.id" class="cart-item">
            <img :src="getImageUrl(item.photo_path)" alt="Product Image" class="cart-image" />
            <div class="cart-details">
              <div class="item-name">{{ item.name }}</div>
              <div class="item-description">{{ item.description }}</div>
              <div class="item-price">{{ item.price }}$</div>
              <div class="quantity-controls">
                <button class="quantity-button" @click="decreaseQuantity(item)">-</button>
                <input
                  v-model.number="item.quantity"
                  :max="item.availableQuantity"
                  class="quantity-input"
                  min="1"
                  type="number"
                  @input="handleInput(item)"
                />
                <button class="quantity-button" @click="increaseQuantity(item)">+</button>
                <span v-if="item.quantity >= item.availableQuantity" class="max-quantity-msg">
                  Max available quantity reached
                </span>
              </div>
            </div>
            <button class="remove-button" @click="removeFromCart(item.id)">&#x274c;</button>
          </li>
        </ul>
      </div>
      <div v-if="cartItems.length > 0" class="checkout-summary">
        <div class="total-price-box">
          <div>Total:</div>
          <div>{{ totalPrice.toFixed(2) }}$</div>
        </div>
        <button class="checkout-button" @click="checkout">Checkout</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, onMounted, ref } from 'vue'
import HomeButtons from './HomeButtons.vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

interface CartItem {
  id: number
  name: string
  description: string
  photo_path: string
  price: number
  quantity: number
  availableQuantity: number
}

export default {
  components: {
    HomeButtons
  },
  setup() {
    const cartItems = ref<CartItem[]>([])
    const timeoutIds = ref<number[]>([])

    const router = useRouter()

    const getImageUrl = (path: string): string => {
      return `${VITE_BACKEND_URL}/static/images/500x500/${path}`
    }

    const increaseQuantity = (item: CartItem): void => {
      if (item.quantity < item.availableQuantity) {
        item.quantity++
        updateLocalStorage()
      }
    }

    const decreaseQuantity = (item: CartItem): void => {
      if (item.quantity > 1) {
        item.quantity--
        updateLocalStorage()
      }
    }

    const updateLocalStorage = (): void => {
      localStorage.setItem('cart', JSON.stringify(cartItems.value))
    }

    const handleInput = (item: CartItem): void => {
      timeoutIds.value.forEach((id) => clearTimeout(id))
      timeoutIds.value = []

      const timeoutId = setTimeout(() => {
        if (item.quantity < 1) {
          item.quantity = 1
        } else if (item.quantity > item.availableQuantity) {
          item.quantity = item.availableQuantity
        }
        updateLocalStorage()
      }, 500)

      timeoutIds.value.push(timeoutId as unknown as number)
    }

    const fetchAvailableQuantities = async (): Promise<void> => {
      const ids = cartItems.value.map((item) => item.id)
      try {
        const responses = await Promise.all(
          ids.map((id) => axios.get(`${VITE_BACKEND_URL}/api/products/${id}`))
        )
        responses.forEach((response, index) => {
          const item = cartItems.value[index]
          item.availableQuantity = response.data.quantity
        })
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error('API error:', error.response?.data)
        } else {
          console.error('Unexpected error:', error)
        }
      }
    }

    const removeFromCart = (id: number): void => {
      cartItems.value = cartItems.value.filter((item) => item.id !== id)
      updateLocalStorage()
    }

    const checkout = async () => {
      const products = cartItems.value.map((item) => ({
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
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/orders/`, {
          method: 'POST',
          headers: {
            Authorization: `${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(order)
        })

        if (response.status === 401) {
          alert('First you need to log in to your account')
          router.push('/login')
          return
        }

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }

        alert('Order placed successfully!')
        localStorage.removeItem('cart')
        cartItems.value = []
        router.push('/profile')
      } catch (error) {
        console.error('Error placing order:', error)
        alert('Failed to place order. Please try again.')
      }
    }

    const totalPrice = computed((): number => {
      return cartItems.value.reduce((total, item) => total + item.price * item.quantity, 0)
    })

    onMounted(() => {
      const storedCart = localStorage.getItem('cart')
      if (storedCart) {
        cartItems.value = JSON.parse(storedCart)
      }

      fetchAvailableQuantities()
    })

    return {
      cartItems,
      handleInput,
      fetchAvailableQuantities,
      checkout,
      totalPrice,
      getImageUrl,
      decreaseQuantity,
      increaseQuantity,
      removeFromCart
    }
  }
}
</script>

<style scoped>
.no_items {
  color: rgb(105, 105, 105);
  font-weight: bold;
  font-size: 1.2em;
  text-align: center;
  margin-top: 20px;
}

.cart-wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #e9ecef;
}

.item-name {
  font-size: 1.2rem;
  font-weight: bold;
}

.cart-container {
  min-height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  width: 80%;
  max-width: 800px;
  border-radius: 25px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.top-bar {
  display: flex;
  width: 100%;
}

.cart-list {
  width: 100%;
}

.cart-item {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  padding: 15px;
  margin: 10px 0;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  justify-content: center;
}

.cart-image {
  width: 200px;
  height: auto;
  max-width: 100%;
  border-radius: 5px;
  margin-right: 15px;
}

.main-cart {
  min-height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  justify-content: center;
  height: 100%;
}

input[type='number']::-webkit-outer-spin-button,
input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.cart-details {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px;
  height: 100%;
  gap: 1rem;
}

.quantity-controls {
  display: flex;
  align-items: center;
}

.quantity-button {
  padding: 6px 12px;
  background-color: #dfe7ec;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.quantity-button- {
  margin-right: 5px;
}

.quantity-button {
  margin: 0 5px;
}

quantity-button:hover {
  background-color: #cfd7e3;
}

.quantity-input {
  font-size: 1rem;
  width: 2rem;
  border: none;
  text-align: center;
}

.remove-button {
  padding: 6px 12px;
  border: none;
  cursor: pointer;
  filter: grayscale(100%);
  background-color: white;
  transition: 0.2s;
  align-self: flex-start;
}

.remove-button:hover {
  filter: grayscale(0%);
}

.total-price-box {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  font-size: 1.2rem;
  font-weight: bold;
  border-top: 1px solid #ced4da;
  border-bottom: 1px solid #ced4da;
  width: 100%;
}

.checkout-summary {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.checkout-button {
  margin-top: 20px;
  padding: 8px 16px;
  border-radius: 8px;
  background-color: #dfe7ec;
  font-size: 1rem;
  width: 100%;
  border: none;
  cursor: pointer;
}

.checkout-button:disabled {
  background-color: #eaeaea;
  cursor: not-allowed;
}

.checkout-button:hover {
  background-color: #cfd7e3;
}

.home-button {
  border: none;
  cursor: pointer;
  font-size: 1rem;
  border-radius: 5px;
  background-color: #e7e7e7;
}

.header {
  margin-top: 6rem;
  max-width: 850px;
  width: 80%;
}

.auth-buttons {
  margin: auto;
  display: flex;
  justify-content: flex-end;
  max-width: 80rem;
}

.max-quantity-msg {
  color: rgba(146, 146, 146, 0.53);
  font-size: 0.9rem;
  margin-left: 10px;
}
</style>
