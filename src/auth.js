import { ref } from 'vue'

const DEMO_USER = 'admin'
const DEMO_PASS = '1234'

const isLoggedIn = ref(localStorage.getItem('auth_loggedIn') === '1')
const currentUser = ref(localStorage.getItem('auth_user') || '')

const login = (username, password, remember) => {
  if (username === DEMO_USER && password === DEMO_PASS) {
    isLoggedIn.value = true
    currentUser.value = username
    localStorage.setItem('auth_loggedIn', '1')
    localStorage.setItem('auth_user', username)
    if (remember) localStorage.setItem('auth_remember', '1')
    return true
  }
  return false
}

const logout = () => {
  isLoggedIn.value = false
  currentUser.value = ''
  localStorage.removeItem('auth_loggedIn')
  localStorage.removeItem('auth_user')
  localStorage.removeItem('auth_remember')
}

export function useAuth() {
  return { isLoggedIn, currentUser, login, logout, DEMO_USER, DEMO_PASS }
}
