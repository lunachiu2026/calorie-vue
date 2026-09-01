import { ref } from 'vue'

const DEMO_USER = 'admin'
const DEMO_PASS = '1234'
const USERS_KEY = 'auth_users'
const DEMO_PROFILE_KEY = 'auth_demo_profile'

const isLoggedIn = ref(localStorage.getItem('auth_loggedIn') === '1')
const currentUser = ref(localStorage.getItem('auth_user') || '')
const dailyCalorieTarget = ref(2000)

const getUsers = () => {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
    return Array.isArray(users) ? users : []
  } catch {
    return []
  }
}

const login = (username, password, remember) => {
  const registeredUser = getUsers().find(user => user.username === username && user.password === password)
  if ((username === DEMO_USER && password === DEMO_PASS) || registeredUser) {
    isLoggedIn.value = true
    currentUser.value = username
    localStorage.setItem('auth_loggedIn', '1')
    localStorage.setItem('auth_user', username)
    if (remember) localStorage.setItem('auth_remember', '1')
    syncDailyCalorieTarget()
    return true
  }
  return false
}

const register = (username, password, email, fullName, phone) => {
  const normalizedUsername = username.trim()
  const normalizedEmail = email.trim().toLowerCase()
  const users = getUsers()
  if (normalizedUsername === DEMO_USER || users.some(user => user.username === normalizedUsername)) {
    return { ok: false, message: '此帳號已被使用' }
  }
  if (users.some(user => user.email === normalizedEmail)) {
    return { ok: false, message: '此電子郵件已註冊' }
  }
  users.push({ username: normalizedUsername, password, email: normalizedEmail, fullName: fullName.trim(), phone })
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  isLoggedIn.value = true
  currentUser.value = normalizedUsername
  localStorage.setItem('auth_loggedIn', '1')
  localStorage.setItem('auth_user', normalizedUsername)
  syncDailyCalorieTarget()
  return { ok: true }
}

const getProfile = () => {
  if (currentUser.value === DEMO_USER) {
    try {
      return { username: DEMO_USER, fullName: '管理員', email: '', phone: '', height: '', weight: '', bmi: '', sex: '', birthDate: '', activity: '', bmr: '', dailyCalories: '', ...JSON.parse(localStorage.getItem(DEMO_PROFILE_KEY) || '{}') }
    } catch {
      return { username: DEMO_USER, fullName: '管理員', email: '', phone: '', height: '', weight: '', bmi: '', sex: '', birthDate: '', activity: '', bmr: '', dailyCalories: '' }
    }
  }
  const user = getUsers().find(item => item.username === currentUser.value)
  return user ? { username: user.username, fullName: user.fullName || '', email: user.email || '', phone: user.phone || '', height: user.height || '', weight: user.weight || '', bmi: user.bmi || '', sex: user.sex || '', birthDate: user.birthDate || '', activity: user.activity || '', bmr: user.bmr || '', dailyCalories: user.dailyCalories || '' } : null
}

const syncDailyCalorieTarget = () => {
  const profile = getProfile()
  dailyCalorieTarget.value = Number(profile?.dailyCalories) || 2000
}

const updateProfile = profile => {
  const normalizedEmail = profile.email.trim().toLowerCase()
  const normalizedPhone = profile.phone.replace(/\D/g, '')
  if (currentUser.value === DEMO_USER) {
    let existingProfile = {}
    try {
      existingProfile = JSON.parse(localStorage.getItem(DEMO_PROFILE_KEY) || '{}')
    } catch {
      existingProfile = {}
    }
    localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify({ ...existingProfile, ...profile, fullName: profile.fullName.trim(), email: normalizedEmail, phone: normalizedPhone }))
    syncDailyCalorieTarget()
    return { ok: true }
  }
  const users = getUsers()
  const index = users.findIndex(user => user.username === currentUser.value)
  if (index < 0) return { ok: false, message: '找不到會員資料' }
  if (users.some((user, userIndex) => userIndex !== index && user.email === normalizedEmail)) {
    return { ok: false, message: '此電子郵件已被其他帳號使用' }
  }
  users[index] = { ...users[index], ...profile, fullName: profile.fullName.trim(), email: normalizedEmail, phone: normalizedPhone }
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  syncDailyCalorieTarget()
  return { ok: true }
}

const logout = () => {
  isLoggedIn.value = false
  currentUser.value = ''
  dailyCalorieTarget.value = 2000
  localStorage.removeItem('auth_loggedIn')
  localStorage.removeItem('auth_user')
  localStorage.removeItem('auth_remember')
}

syncDailyCalorieTarget()

export function useAuth() {
  return { isLoggedIn, currentUser, dailyCalorieTarget, login, register, getProfile, updateProfile, logout, DEMO_USER, DEMO_PASS }
}
