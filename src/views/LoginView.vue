<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../auth.js'
import { isStaticPreview } from '../api.js'

const { login, loginDemo } = useAuth()

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const remember = ref(false)
const error = ref('')
const submitting = ref(false)

const enterDemo = reset => {
  loginDemo(reset)
  const redirect = route.query.redirect || '/'
  router.push(redirect)
}

const submit = async () => {
  error.value = ''
  if (!username.value.trim() || !password.value) {
    error.value = '請輸入帳號與密碼'
    return
  }
  submitting.value = true
  const result = await login(username.value.trim(), password.value, remember.value)
  submitting.value = false
  if (!result.ok) {
    error.value = result.message
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
      <section class="demo-entry" aria-labelledby="demo-title">
        <span class="demo-label">面試展示模式</span>
        <h3 id="demo-title">免帳號，直接體驗完整功能</h3>
        <p>內含 7 天飲食與體重趨勢，資料只保存在這個瀏覽器。</p>
        <button type="button" class="demo-button" @click="enterDemo(false)">
          <i class="bi bi-play-circle" aria-hidden="true"></i>一鍵進入 Demo
        </button>
        <button type="button" class="demo-reset" @click="enterDemo(true)">重新載入範例資料</button>
      </section>
      <div class="auth-divider"><span>{{ isStaticPreview ? '正式登入需使用本機版' : '或使用正式帳號' }}</span></div>
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

        <button type="submit" class="auth-submit" :disabled="submitting">{{ submitting ? '登入中...' : '登入' }}</button>
      </form>
      <div v-if="!isStaticPreview" class="auth-switch">
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
.demo-entry { margin-bottom: 18px; padding: 17px; text-align: center; background: linear-gradient(145deg,#eff9f3,#f9fcfa); border: 1px solid #cfe6d7; border-radius: 14px; }
.demo-label { display: inline-block; margin-bottom: 7px; padding: 4px 9px; color: #24764a; background: #dff3e7; border-radius: 999px; font-size: 11px; font-weight: 800; }
.demo-entry h3 { margin: 0 0 6px; color: #234c37; font-size: 16px; }
.demo-entry p { margin: 0 0 12px; color: #65766c; font-size: 12px; line-height: 1.6; }
.demo-button { display: inline-flex; width: 100%; min-height: 44px; align-items: center; justify-content: center; gap: 8px; color: #fff; background: #38ae70; border: 0; border-radius: 10px; font-size: 14px; font-weight: 800; cursor: pointer; }
.demo-button:hover { background: #2b925b; }
.demo-reset { margin-top: 10px; padding: 0; color: #61746a; background: transparent; border: 0; font-size: 11px; text-decoration: underline; cursor: pointer; }
.auth-divider { display: flex; margin: 0 0 17px; align-items: center; gap: 10px; color: #929b96; font-size: 11px; }
.auth-divider::before, .auth-divider::after { height: 1px; content: ''; background: #e4e9e6; flex: 1; }
.auth-divider span { white-space: nowrap; }
.auth-field { margin-bottom: 16px; }
.auth-field label { display: block; margin-bottom: 7px; color: #33443b; font-size: 14px; font-weight: 700; }
.auth-input { box-sizing: border-box; width: 100%; height: 47px; padding: 0 13px; color: #29322d; background: #fff; border: 1px solid #d8dedb; border-radius: 10px; outline: none; font-size: 15px; transition: border-color .2s, box-shadow .2s; }
.auth-input:focus { border-color: #AAC0AF; box-shadow: 0 0 0 3px rgba(170,192,175,.2); }
.auth-remember { display: flex; gap: 7px; margin: 2px 0 17px; color: #69756e; font-size: 13px; align-items: center; }
.auth-remember input { accent-color: #AAC0AF; }
.auth-error { display: flex; gap: 6px; margin: 0 0 13px; padding: 9px 11px; color: #c43d3d; background: #fff0f0; border-radius: 8px; font-size: 13px; align-items: center; }
.auth-submit { width: 100%; min-height: 47px; color: #fff; background: #AAC0AF; border: 0; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; transition: background .2s, transform .2s; }
.auth-submit:disabled { cursor: wait; opacity: .7; }
.auth-submit:hover { background: #FAAC9A; transform: translateY(-1px); }
.auth-switch { display: flex; justify-content: center; gap: 7px; margin-top: 22px; padding-top: 19px; color: #748078; border-top: 1px solid #ecefed; font-size: 14px; }
.auth-switch a { color: #657a6b; font-weight: 700; text-decoration: none; }
.auth-switch a:hover { color: #d98270; }
@media (max-width: 480px) { .auth-page { padding: 28px 14px; } .auth-card { padding: 28px 22px 24px; } }
</style>
