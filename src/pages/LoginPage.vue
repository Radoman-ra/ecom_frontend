<template>
  <div class="login-page">
    <form @submit.prevent="login" class="login-form">
      <div class="login-text">Login</div>

      <input
        v-model="email"
        placeholder="Email"
        required
        class="input-field"
        :class="{ 'input-error': emailError }"
      />
      <div v-if="emailError" class="error-message">{{ emailError }}</div>

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
        class="input-field"
        :class="{ 'input-error': passwordError }"
      />
      <div v-if="passwordError" class="error-message">{{ passwordError }}</div>

      <button type="submit" class="btn btn-login" :disabled="isSubmitting">Login</button>
      <button type="button" class="btn btn-register" @click="goToRegister">Register</button>

      <button type="button" class="btn btn-google" @click="loginWithGoogle">
        <img src="@/assets/google-icon.png" alt="Google icon" class="google-icon" />
        Login with Google
      </button>

      <transition name="fade">
        <div v-if="loginError" class="login-error">{{ loginError }}</div>
      </transition>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'

export default defineComponent({
  setup() {
    const email = ref('')
    const password = ref('')
    const emailError = ref('')
    const passwordError = ref('')
    const loginError = ref('')
    const isSubmitting = ref(false)
    const router = useRouter()

    const ACCESS_TOKEN_EXPIRE_MINUTES = 15
    const REFRESH_TOKEN_EXPIRE_DAYS = 7

    const validateInputs = (): boolean => {
      emailError.value = ''
      passwordError.value = ''

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      let isValid = true

      if (!emailPattern.test(email.value)) {
        emailError.value = 'Please enter a valid email.'
        isValid = false
      }

      if (password.value.length < 6) {
        passwordError.value = 'Password must be at least 6 characters long.'
        isValid = false
      }

      return isValid
    }

    const login = async () => {
      if (!validateInputs()) return

      isSubmitting.value = true
      try {
        const response = await axios.post(
          'https://ecombackend-production-7935.up.railway.app/api/auth/login',
          {
            email: email.value,
            password: password.value
          }
        )

        const { access_token, refresh_token } = response.data

        Cookies.set('access_token', access_token, {
          expires: ACCESS_TOKEN_EXPIRE_MINUTES / (24 * 60),
          secure: true
        })

        Cookies.set('refresh_token', refresh_token, {
          expires: REFRESH_TOKEN_EXPIRE_DAYS,
          secure: true
        })

        router.push('/')
      } catch (error) {
        if ((error as any).response && (error as any).response.status === 401) {
          loginError.value = 'Invalid email or password.'
        } else {
          loginError.value = 'An error occurred. Please try again.'
        }
        console.error('Login failed:', error)
      } finally {
        isSubmitting.value = false
      }
    }

    const loginWithGoogle = async () => {
      window.location.href =
        'https://ecombackend-production-7935.up.railway.app/api/auth/login/google'
    }

    const goToRegister = () => {
      router.push('/register')
    }

    return {
      email,
      password,
      emailError,
      passwordError,
      login,
      loginWithGoogle,
      goToRegister,
      loginError,
      isSubmitting
    }
  }
})
</script>

<style scoped>
.btn-google {
  background-color: #db4437;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.google-icon {
  width: 20px;
  height: 20px;
}
</style>
