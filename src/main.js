import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useAuth } from './auth.js'
import './assets/style.css'
import './assets/sport.css'
import './assets/goodhealth.css'
import './assets/Nutritionist.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/refinements.css'

const bootstrap = async () => {
  const { initializeAuth } = useAuth()
  await initializeAuth()
  createApp(App).use(router).mount('#app')
}

bootstrap()
