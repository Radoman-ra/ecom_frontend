<template>
  <div>
    <h2>Register</h2>
    <form @submit.prevent="register">
      <input v-model="username" placeholder="Username" required />
      <input v-model="email" placeholder="Email" type="email" required />
      <input v-model="password" placeholder="Password" type="password" required />
      <button type="submit">Register</button>
    </form>
    <div v-if="message">{{ message }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

export default defineComponent({
  data() {
    return {
      username: '',
      email: '',
      password: '',
      message: ''
    }
  },
  setup() {
    const router = useRouter()
    return { router }
  },
  methods: {
    async register() {
      try {
        await axios.post('http://127.0.0.1:8000/api/auth/register', {
          username: this.username,
          email: this.email,
          password: this.password
        })

        this.message = 'Registration successful!'
        this.router.push('/login')
      } catch (error) {
        const err = error as any
        if (err.response) {
          if (err.response.status === 422 && Array.isArray(err.response.data.detail)) {
            this.message = err.response.data.detail.map((err: any) => err.msg).join(', ')
          } else if (err.response.data.detail && typeof err.response.data.detail === 'string') {
            this.message = err.response.data.detail
          } else {
            this.message = `Error: ${err.response.status} - ${err.response.data.detail || 'Unknown error'}`
          }
        } else {
          this.message = 'An error occurred. Please check your network connection.'
        }
      }
    }
  }
})
</script>

<style scoped>
</style>
