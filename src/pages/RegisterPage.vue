<template>
  <div class="register-page">
    <form class="register-form" @submit.prevent="register">
      <h2 class="register-text">Register</h2>

      <div class="form-group">
        <input
          v-model="username"
          :class="{ 'is-invalid': errors.username }"
          class="input-field"
          placeholder="Username"
          required
        />
        <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
      </div>

      <div class="form-group">
        <input
          v-model="email"
          :class="{ 'is-invalid': errors.email }"
          class="input-field"
          placeholder="Email"
          required
          type="email"
        />
        <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
      </div>

      <div class="form-group">
        <input
          v-model="password"
          :class="{ 'is-invalid': errors.password }"
          autocomplete="new-password"
          class="input-field"
          placeholder="Password"
          required
          type="password"
        />
        <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
      </div>

      <div class="form-group">
        <input
          v-model="confirmPassword"
          :class="{ 'is-invalid': errors.confirmPassword }"
          autocomplete="new-password"
          class="input-field"
          placeholder="Confirm Password"
          required
          type="password"
        />
        <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
      </div>
      <div class="reg-and-log-but">
        <button class="btn btn-primary" type="submit">Register</button>
      </div>
      <button class="btn btn-google" type="button" @click="loginWithGoogle">
        <svg
          aria-hidden="true"
          class="google-icon"
          data-icon="google"
          data-prefix="fab"
          focusable="false"
          role="img"
          viewBox="0 0 488 512"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            fill="currentColor"
          ></path>
        </svg>

        Login with Google
      </button>
      <div class="login">Log in? <a class="link" @click="goToLogin">log in</a></div>

      <p v-if="message">{{ message }}</p>
    </form>
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
      confirmPassword: '',
      message: '',
      errors: {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      }
    }
  },
  setup() {
    const router = useRouter()
    return { router }
  },
  methods: {
    validateForm() {
      let valid = true
      this.errors = { username: '', email: '', password: '', confirmPassword: '' }

      if (this.username.length < 3) {
        this.errors.username = 'Username must be at least 3 characters long.'
        valid = false
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(this.email)) {
        this.errors.email = 'Please enter a valid email address.'
        valid = false
      }

      if (this.password.length < 6) {
        this.errors.password = 'Password must be at least 6 characters long.'
        valid = false
      }

      if (this.password !== this.confirmPassword) {
        this.errors.confirmPassword = 'Passwords do not match.'
        valid = false
      }

      return valid
    },
    async register() {
      if (!this.validateForm()) {
        return
      }

      try {
        await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
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
    },
    async loginWithGoogle() {
      const apiUrl = import.meta.env.VITE_BACKEND_URL
      window.location.href = `${apiUrl}/api/auth/login/google`
    },
    goToLogin() {
      this.router.push('/login')
    }
  }
})
</script>

<style scoped>
.register-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #fff;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  display: flex;
  flex-direction: column;
}

.google-icon {
  width: 20px;
  height: 20px;
}

.login {
  border-top: 1px solid #c8c8c8;
  padding-top: 5px;
  font-size: 14px;
  padding-left: 5px;
  text-align: right;
}

.link {
  color: #007bff;
  cursor: pointer;
}

.reg-and-log-but {
  display: flex;
  gap: 10px;
  justify-content: space-between;
}

.input-field {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  width: 200px;
}

.input-field.is-invalid {
  border-color: red;
}

.error-text {
  color: red;
  font-size: 12px;
  margin-top: 5px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  flex: 1;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-google {
  background-color: #db4437;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.register-text {
  font-size: 24px;
  font-weight: 500;
}
</style>
