import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/HomePage.vue'
import Login from '../pages/LoginPage.vue'
import Register from '../pages/RegisterPage.vue'

const routes = [
  { path: '/', component: Home }, // Главная страница с поиском продуктов
  { path: '/login', component: Login }, // Страница логина
  { path: '/register', component: Register } // Страница регистрации
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
