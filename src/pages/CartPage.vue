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
                  type="number"
                  v-model.number="item.quantity"
                  min="1"
                  :max="item.availableQuantity"
                  class="quantity-input"
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
      <div class="checkout-summary" v-if="cartItems.length > 0">
        <div class="total-price-box">
          <div>Total:</div>
          <div>{{ totalPrice.toFixed(2) }}$</div>
        </div>
        <button class="checkout-button" @click="checkout">Checkout</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const cartItems = ref([])
const timeoutIds = ref([])

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const getImageUrl = (path) => {
  return `http://127.0.0.1:8000/images/${path}`
}

const increaseQuantity = (item) => {
  if (item.quantity < item.availableQuantity) {
    item.quantity++
    updateLocalStorage()
  }
}

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--
    updateLocalStorage()
  }
}

const updateLocalStorage = () => {
  localStorage.setItem('cart', JSON.stringify(cartItems.value))
}

const handleInput = (item) => {
  timeoutIds.value.forEach((id) => clearTimeout(id))
  timeoutIds.value = []

  let timeoutId = setTimeout(() => {
    if (item.quantity < 1) {
      item.quantity = 1
    } else if (item.quantity > item.availableQuantity) {
      item.quantity = item.availableQuantity
    }
    updateLocalStorage()
  }, 500)

  timeoutIds.value.push(timeoutId)
}

const fetchAvailableQuantities = async () => {
  const ids = cartItems.value.map((item) => item.id)
  console.log('Requesting IDs:', ids)
  try {
    const response = await axios.get('http://127.0.0.1:8000/api/products/available-quantities', {
      params: { ids }
    })
    console.log('API response:', response.data)
    // Continue processing
  } catch (error) {
    console.error('API error:', error.response.data)
  }
}

const checkout = async () => {
  const products = cartItems.value.map((item) => ({
    product_id: item.id,
    quantity: item.quantity
  }))
  // Handle the checkout process
}

onMounted(() => {
  // Populate cartItems from localStorage or other source
  const storedCart = localStorage.getItem('cart')
  if (storedCart) {
    cartItems.value = JSON.parse(storedCart)
  }

  fetchAvailableQuantities()
})
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
