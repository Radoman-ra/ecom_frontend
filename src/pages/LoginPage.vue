<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="login">
      <input v-model="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import auth from '../store/auth'
import Cookies from 'js-cookie'

export default defineComponent({
  setup() {
    const email = ref('')
    const password = ref('')
    const router = useRouter()

    const ACCESS_TOKEN_EXPIRE_MINUTES = 15
    const REFRESH_TOKEN_EXPIRE_DAYS = 7

    const login = async () => {
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/auth/login', {
          email: email.value,
          password: password.value
        })

        const { access_token, refresh_token } = response.data

        Cookies.set('access_token', access_token, {
          expires: ACCESS_TOKEN_EXPIRE_MINUTES / (24 * 60),
          secure: true
        })

        Cookies.set('refresh_token', refresh_token, {
          expires: REFRESH_TOKEN_EXPIRE_DAYS,
          secure: true
        })

        auth.login(access_token)

        router.push('/')
      } catch (error) {
        console.error('Login failed:', error)
      }
    }

    return {
      email,
      password,
      login
    }
  }
})
</script>

<style scoped></style>
