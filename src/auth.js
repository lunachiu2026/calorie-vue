import { ref } from 'vue'
import { apiRequest, clearApiSession } from './api.js'
import { startDemoSession } from './demo.js'

const isLoggedIn = ref(false)
const currentUser = ref('')
const displayName = ref('')
const demoMode = ref(false)
const dailyCalorieTarget = ref(2000)
const profile = ref(null)
let initializationPromise = null

const applyUser = (user, isDemo = false) => {
  profile.value = user
  isLoggedIn.value = true
  currentUser.value = user.username
  displayName.value = user.fullName || user.username
  demoMode.value = isDemo
  dailyCalorieTarget.value = Number(user.dailyCalories) || 2000
}

const clearUser = () => {
  profile.value = null
  isLoggedIn.value = false
  currentUser.value = ''
  displayName.value = ''
  demoMode.value = false
  dailyCalorieTarget.value = 2000
  clearApiSession()
}

const initializeAuth = () => {
  if (!initializationPromise) {
    initializationPromise = apiRequest('me.php')
      .then(result => {
        if (result.authenticated) applyUser(result.user, result.demo === true)
        else clearUser()
      })
      .catch(clearUser)
  }
  return initializationPromise
}

const loginDemo = (reset = false) => {
  applyUser(startDemoSession(reset), true)
  return { ok: true }
}

const login = async (username, password, remember) => {
  try {
    const result = await apiRequest('login.php', { method: 'POST', body: { username, password, remember } })
    applyUser(result.user, result.demo === true)
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

const register = async (username, password, email, fullName, phone, acceptedTerms) => {
  try {
    const result = await apiRequest('register.php', { method: 'POST', body: { username, password, email, fullName, phone, acceptedTerms } })
    applyUser(result.user)
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

const getProfile = () => profile.value ? { ...profile.value } : null

const updateProfile = async updates => {
  try {
    const result = await apiRequest('profile.php', { method: 'PATCH', body: updates })
    applyUser(result.user, result.demo === true)
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

const logout = async () => {
  try {
    await apiRequest('logout.php', { method: 'POST' })
    clearUser()
    return { ok: true }
  } catch (error) {
    if (error.status === 401) {
      clearUser()
      return { ok: true }
    }
    return { ok: false, message: error.message }
  }
}

export function useAuth() {
  return { isLoggedIn, currentUser, displayName, demoMode, dailyCalorieTarget, initializeAuth, login, loginDemo, register, getProfile, updateProfile, logout }
}
