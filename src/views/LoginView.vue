<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../auth.js'

const { login, DEMO_USER, DEMO_PASS } = useAuth()

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const remember = ref(false)
const error = ref('')

const submit = () => {
  error.value = ''
  if (!username.value.trim() || !password.value) {
    error.value = '請輸入帳號與密碼'
    return
  }
  const ok = login(username.value.trim(), password.value, remember.value)
  if (!ok) {
    error.value = '帳號或密碼錯誤'
    return
  }
  const redirect = route.query.redirect || '/records'
  router.push(redirect)
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <header class="auth-header">
        <span class="auth-icon"><i class="bi bi-person" aria-hidden="true"></i></span>
        <h2>歡迎回來</h2>
        <p>登入後即可儲存與管理每日飲食紀錄</p>
      </header>
      <p class="demo-hint"><i class="bi bi-info-circle" aria-hidden="true"></i>Demo：{{ DEMO_USER }} ／ {{ DEMO_PASS }}</p>

      <form class="auth-form" @submit.prevent="submit">
        <div class="auth-field">
          <label for="username">帳號</label>
          <input
            id="username"
            type="text"
            class="auth-input"
            v-model="username"
            placeholder="請輸入帳號"
            autocomplete="username"
          />
        </div>

        <div class="auth-field">
          <label for="password">密碼</label>
          <input
            id="password"
            type="password"
            class="auth-input"
            v-model="password"
            placeholder="請輸入密碼"
            autocomplete="current-password"
          />
        </div>

        <label class="auth-remember">
          <input type="checkbox" v-model="remember" /> 保持登入狀態
        </label>

        <p v-if="error" class="auth-error"><i class="bi bi-exclamation-circle" aria-hidden="true"></i>{{ error }}</p>

        <button type="submit" class="auth-submit">登入</button>
      </form>
      <div class="auth-switch">
        <span>還沒有帳號嗎？</span>
        <RouterLink :to="{ path: '/register', query: route.query.redirect ? { redirect: route.query.redirect } : {} }">立即註冊</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.auth-page { box-sizing: border-box; display: grid; min-height: calc(100vh - 72px); padding: 48px 18px; background: radial-gradient(circle at 50% 0%, #fff 0, #f3f4f6 58%); place-items: center; }
.auth-card { box-sizing: border-box; width: min(430px,100%); padding: 34px 32px 28px; background: rgba(255,255,255,.96); border: 1px solid #e2e5e3; border-radius: 22px; box-shadow: 0 20px 55px rgba(31,41,55,.1); }
.auth-header { margin-bottom: 22px; text-align: center; }
.auth-icon { display: grid; width: 56px; height: 56px; margin: 0 auto 14px; color: #657a6b; background: #eef1ef; border-radius: 18px; font-size: 27px; place-items: center; }
.auth-header h2 { margin: 0 0 7px; color: #163a2b; font-size: 24px; }
.auth-header p { margin: 0; color: #7b8580; font-size: 13px; line-height: 1.6; }
.demo-hint { display: flex; gap: 7px; margin: 0 0 20px; padding: 10px 12px; color: #68736d; background: #f3f4f6; border-radius: 9px; font-size: 12px; align-items: center; }
.auth-field { margin-bottom: 16px; }
.auth-field label { display: block; margin-bottom: 7px; color: #33443b; font-size: 14px; font-weight: 700; }
.auth-input { box-sizing: border-box; width: 100%; height: 47px; padding: 0 13px; color: #29322d; background: #fff; border: 1px solid #d8dedb; border-radius: 10px; outline: none; font-size: 15px; transition: border-color .2s, box-shadow .2s; }
.auth-input:focus { border-color: #AAC0AF; box-shadow: 0 0 0 3px rgba(170,192,175,.2); }
.auth-remember { display: flex; gap: 7px; margin: 2px 0 17px; color: #69756e; font-size: 13px; align-items: center; }
.auth-remember input { accent-color: #AAC0AF; }
.auth-error { display: flex; gap: 6px; margin: 0 0 13px; padding: 9px 11px; color: #c43d3d; background: #fff0f0; border-radius: 8px; font-size: 13px; align-items: center; }
.auth-submit { width: 100%; min-height: 47px; color: #fff; background: #AAC0AF; border: 0; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; transition: background .2s, transform .2s; }
.auth-submit:hover { background: #FAAC9A; transform: translateY(-1px); }
.auth-switch { display: flex; justify-content: center; gap: 7px; margin-top: 22px; padding-top: 19px; color: #748078; border-top: 1px solid #ecefed; font-size: 14px; }
.auth-switch a { color: #657a6b; font-weight: 700; text-decoration: none; }
.auth-switch a:hover { color: #d98270; }
@media (max-width: 480px) { .auth-page { padding: 28px 14px; } .auth-card { padding: 28px 22px 24px; } }
</style>
