import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SportView from '../views/SportView.vue'
import SportDetailView from '../views/SportDetailView.vue'
import TeacherView from '../views/TeacherView.vue'
import BookingView from '../views/BookingView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import RecordsView from '../views/RecordsView.vue'
import { useAuth } from '../auth.js'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/sport', name: 'sport', component: SportView },
  {
    path: '/sport/:category',
    name: 'sport-detail',
    component: SportDetailView,
    props: true
  },
  { path: '/teacher', name: 'teacher', component: TeacherView },
  { path: '/teacher/booking', name: 'teacher-booking', component: BookingView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/register', name: 'register', component: RegisterView },
  {
    path: '/records',
    name: 'records',
    component: RecordsView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const { isLoggedIn } = useAuth()
  if (to.meta.requiresAuth && !isLoggedIn.value) {
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
