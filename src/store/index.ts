import { createStore } from 'vuex'

export default createStore({
  state: {
    user: null,
    token: ''
  },
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    setToken(state, token) {
      state.token = token
    }
  },
  actions: {
    login({ commit }, userData) {
      // Вызовите API для авторизации
    },
    logout({ commit }) {
      commit('setUser', null)
      commit('setToken', '')
    }
  },
  modules: {}
})
