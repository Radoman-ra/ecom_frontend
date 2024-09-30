import { createApp } from 'vue'
import App from './App.vue'
import router from './router' // Импорт роутера
import './assets/main.css' // Дополнительно для стилей, если нужно

const app = createApp(App)

app.use(router) // Подключаем роутер

app.mount('#app')
