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
import Cookies from 'js-cookie' // Импортируем js-cookie

export default defineComponent({
  setup() {
    const email = ref('')
    const password = ref('')
    const router = useRouter()

    const ACCESS_TOKEN_EXPIRE_MINUTES = 15 // Время жизни access токена в минутах
    const REFRESH_TOKEN_EXPIRE_DAYS = 7 // Время жизни refresh токена в днях

    const login = async () => {
      try {
        const response = await axios.post('http://127.0.0.1:8000/api/auth/login', {
          email: email.value,
          password: password.value
        })

        // Извлекаем токены из ответа
        const { access_token, refresh_token } = response.data

        // Сохраняем access_token на 15 минут
        Cookies.set('access_token', access_token, {
          expires: ACCESS_TOKEN_EXPIRE_MINUTES / (24 * 60),
          secure: true
        })

        // Сохраняем refresh_token на 7 дней
        Cookies.set('refresh_token', refresh_token, {
          expires: REFRESH_TOKEN_EXPIRE_DAYS,
          secure: true
        })

        // Сохраняем токен в auth
        auth.login(access_token)

        // Перенаправляем на главную страницу
        router.push('/')
      } catch (error) {
        console.error('Login failed:', error)
        // Обработка ошибок, например, отображение сообщения пользователю
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

<style scoped>
/* Добавьте свои стили здесь */
</style>
