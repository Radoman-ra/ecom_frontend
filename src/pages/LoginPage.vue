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
      <div class="reg-and-log-but">
        <button type="submit" class="btn btn-login" :disabled="isSubmitting">Login</button>
      </div>

      <button type="button" class="btn btn-google" @click="loginWithGoogle">
        <svg
          class="google-icon"
          aria-hidden="true"
          focusable="false"
          data-prefix="fab"
          data-icon="google"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 488 512"
        >
          <path
            fill="currentColor"
            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
          ></path>
        </svg>

        Login with Google
      </button>
      <div class="register">Register? <a class="link" @click="goToRegister">register</a></div>

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
const apiUrl = import.meta.env.VITE_BACKEND_URL

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
        const response = await axios.post(`${apiUrl}/api/auth/login`, {
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
      window.location.href = `${apiUrl}/api/auth/login/google`
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
.reg-and-log-but {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.reg-and-log-but button {
  flex: 1;
}

.btn-google {
  background-color: #db4437;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.link {
  color: #007bff;
  cursor: pointer;
}
.google-icon {
  width: 20px;
  height: 20px;
}
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.login-form {
  max-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #fff;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.input-field {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  width: 200px;
}

.input-error {
  border-color: #dc3545;
}

.error-message {
  color: #dc3545;
  font-size: 0.85rem;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-login {
  background-color: #007bff;
  color: white;
}

.btn-login:disabled {
  background-color: #c0c0c0;
  cursor: not-allowed;
}

.btn-login:hover:enabled {
  background-color: #0056b3;
}

.btn-register {
  background-color: #6c757d;
  color: white;
}

.btn-register:hover {
  background-color: #5a6268;
}

.login-error {
  background-color: #dc3545;
  color: white;
  padding: 10px;
  border-radius: 10px;
  margin-top: 10px;
  text-align: center;
  font-weight: bold;
  animation: fade-in 0.5s;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.register {
  border-top: 1px solid #c8c8c8;
  padding-top: 5px;
  font-size: 14px;
  padding-left: 5px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
