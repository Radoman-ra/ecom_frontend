import { reactive } from 'vue'

const state = reactive({
  isAuthenticated: !!localStorage.getItem('authToken') // Проверяем, есть ли токен в localStorage
})

const login = (token: string) => {
  state.isAuthenticated = true
  localStorage.setItem('authToken', token)
}

const logout = () => {
  state.isAuthenticated = false
  localStorage.removeItem('authToken')
}

export default { state, login, logout }
