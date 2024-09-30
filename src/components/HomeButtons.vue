<template>
  <div>
    <button v-if="!isAuthenticated" @click="goToLogin">Login</button>
    <button v-if="!isAuthenticated" @click="goToRegister">Register</button>
    <button v-else @click="goToProfile">Profile</button>
    <button v-if="isAuthenticated" @click="goToCart">Cart</button>
    <button v-if="isAuthenticated" @click="logout">Logout</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import auth from '../store/auth'
import Cookies from 'js-cookie'

export default defineComponent({
  setup() {
    const router = useRouter()
    const isAuthenticated = auth.state.isAuthenticated

    const goToLogin = () => router.push('/login')
    const goToRegister = () => router.push('/register')
    const goToProfile = () => router.push('/profile')
    const goToCart = () => router.push('/cart')

    const logout = () => {
      Cookies.remove('access_token')
      Cookies.remove('refresh_token')

      auth.logout()

      location.reload()
    }

    return {
      isAuthenticated,
      goToLogin,
      goToRegister,
      goToProfile,
      goToCart,
      logout
    }
  }
})
</script>

<style scoped>
</style>
