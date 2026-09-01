<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../auth.js'

const { register } = useAuth()
const route = useRoute()
const router = useRouter()
const fullName = ref('')
const phone = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const agreedToTerms = ref(false)
const error = ref('')
const submitted = ref(false)

const passwordChecks = computed(() => ({
  length: password.value.length >= 8,
  letter: /[A-Za-z]/.test(password.value),
  number: /\d/.test(password.value)
}))

const formatPhone = event => {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 4) {
    phone.value = digits
  } else if (digits.length <= 7) {
    phone.value = `${digits.slice(0, 4)}-${digits.slice(4)}`
  } else {
    phone.value = `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
  }
}

const submit = () => {
  submitted.value = true
  error.value = ''
  const normalizedUsername = username.value.trim()
  const normalizedEmail = email.value.trim().toLowerCase()
  const normalizedPhone = phone.value.replace(/[\s-]/g, '')
  if (!fullName.value.trim() || !normalizedPhone || !normalizedUsername || !normalizedEmail || !password.value || !confirmPassword.value) {
    return
  }
  if (fullName.value.trim().length < 2) {
    error.value = '請輸入完整姓名'
    return
  }
  if (!/^09\d{8}$/.test(normalizedPhone)) {
    error.value = '請輸入有效的台灣手機號碼'
    return
  }
  if (!/^[A-Za-z0-9_]{4,20}$/.test(normalizedUsername)) {
    error.value = '帳號須為 4–20 位英文字母、數字或底線'
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    error.value = '請輸入有效的電子郵件地址'
    return
  }
  if (!Object.values(passwordChecks.value).every(Boolean)) {
    error.value = '密碼尚未符合所有安全條件'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = '兩次輸入的密碼不一致'
    return
  }
  if (!agreedToTerms.value) {
    error.value = '請先閱讀並同意會員使用條款與隱私權政策'
    return
  }
  const result = register(normalizedUsername, password.value, normalizedEmail, fullName.value, normalizedPhone)
  if (!result.ok) {
    error.value = result.message
    return
  }
  router.push(route.query.redirect || '/')
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <header class="auth-header">
        <h2>會員註冊</h2>
        <p>請填寫以下資料以建立您的個人帳號</p>
      </header>

      <form class="auth-form" novalidate @submit.prevent="submit">
        <div class="auth-field">
          <label for="register-name">姓名</label>
          <input id="register-name" v-model="fullName" class="auth-input" type="text" placeholder="請輸入完整姓名" autocomplete="name" required />
          <small v-if="submitted && !fullName.trim()" class="required-message">必填</small>
        </div>
        <div class="auth-field">
          <label for="register-phone">聯絡電話</label>
          <input id="register-phone" :value="phone" class="auth-input" type="tel" placeholder="例如 0912-345-678" autocomplete="tel" inputmode="numeric" maxlength="12" required @input="formatPhone" />
          <small v-if="submitted && !phone.trim()" class="required-message">必填</small>
        </div>
        <div class="auth-field">
          <label for="register-username">會員帳號</label>
          <input id="register-username" v-model="username" class="auth-input" type="text" placeholder="4–20 位英文字母、數字或底線" autocomplete="username" maxlength="20" required />
          <small v-if="submitted && !username.trim()" class="required-message">必填</small>
        </div>
        <div class="auth-field">
          <label for="register-email">電子郵件</label>
          <input id="register-email" v-model="email" class="auth-input" type="email" placeholder="請輸入本人常用的電子郵件" autocomplete="email" required />
          <small v-if="submitted && !email.trim()" class="required-message">必填</small>
        </div>
        <div class="auth-field">
          <label for="register-password">設定密碼</label>
          <input id="register-password" v-model="password" class="auth-input" type="password" placeholder="請設定不易猜測的密碼" autocomplete="new-password" required />
          <small v-if="submitted && !password" class="required-message">必填</small>
          <ul class="password-rules" aria-label="密碼規則">
            <li :class="{ passed: passwordChecks.length }"><i class="bi" :class="passwordChecks.length ? 'bi-check-circle-fill' : 'bi-circle'"></i>至少 8 個字元</li>
            <li :class="{ passed: passwordChecks.letter }"><i class="bi" :class="passwordChecks.letter ? 'bi-check-circle-fill' : 'bi-circle'"></i>包含英文字母</li>
            <li :class="{ passed: passwordChecks.number }"><i class="bi" :class="passwordChecks.number ? 'bi-check-circle-fill' : 'bi-circle'"></i>包含數字</li>
          </ul>
        </div>
        <div class="auth-field">
          <label for="confirm-password">確認密碼</label>
          <input id="confirm-password" v-model="confirmPassword" class="auth-input" type="password" placeholder="請再次輸入密碼" autocomplete="new-password" required />
          <small v-if="submitted && !confirmPassword" class="required-message">必填</small>
        </div>

        <label class="terms-check">
          <input v-model="agreedToTerms" type="checkbox" />
          <span>我已閱讀並同意會員使用條款與隱私權政策</span>
        </label>
        <small v-if="submitted && !agreedToTerms" class="required-message terms-required">必填</small>

        <p v-if="error" class="auth-error"><i class="bi bi-exclamation-circle" aria-hidden="true"></i>{{ error }}</p>
        <button type="submit" class="auth-submit">確認資料並建立帳號</button>
      </form>

      <div class="auth-switch">
        <span>已經有帳號？</span>
        <RouterLink :to="{ path: '/login', query: route.query.redirect ? { redirect: route.query.redirect } : {} }">返回登入</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.auth-page { box-sizing: border-box; display: grid; min-height: calc(100vh - 72px); padding: 48px 18px; background: radial-gradient(circle at 50% 0%, #fff 0, #f3f4f6 58%); place-items: center; }
.auth-card { box-sizing: border-box; width: min(500px,100%); padding: 36px 40px 30px; background: rgba(255,255,255,.96); border: 1px solid #e2e5e3; border-radius: 22px; box-shadow: 0 20px 55px rgba(31,41,55,.1); }
.auth-header { margin-bottom: 23px; text-align: center; }
.auth-header h2 { margin: 0 0 7px; color: #163a2b; font-size: 24px; }
.auth-header p { margin: 0; color: #7b8580; font-size: 13px; line-height: 1.6; }
.auth-form { display: grid; grid-template-columns: 1fr; align-items: start; }
.auth-field { margin-bottom: 16px; }
.auth-field label { display: block; margin-bottom: 7px; color: #33443b; font-size: 14px; font-weight: 700; }
.auth-input { box-sizing: border-box; width: 100%; height: 47px; padding: 0 13px; color: #29322d; background: #fff; border: 1px solid #d8dedb; border-radius: 10px; outline: none; font-size: 15px; transition: border-color .2s, box-shadow .2s; }
.auth-input:focus { border-color: #AAC0AF; box-shadow: 0 0 0 3px rgba(170,192,175,.2); }
.required-message { display: block; margin-top: 5px; color: #c43d3d; font-size: 12px; font-weight: 700; }
.password-rules { display: grid; grid-template-columns: repeat(3,1fr); gap: 7px; padding: 0; margin: 10px 0 0; color: #c43d3d; list-style: none; font-size: 12px; font-weight: 700; }
.password-rules li { display: flex; gap: 4px; align-items: center; }
.password-rules li.passed { color: #c43d3d; }
.terms-check { display: flex; gap: 9px; margin: 3px 0 16px; color: #606b65; font-size: 12px; line-height: 1.5; align-items: flex-start; }
.terms-check input { flex: 0 0 auto; margin-top: 2px; accent-color: #AAC0AF; }
.terms-required { margin: -10px 0 14px 25px; }
.auth-error { display: flex; gap: 6px; margin: 0 0 13px; padding: 9px 11px; color: #c43d3d; background: #fff0f0; border-radius: 8px; font-size: 13px; align-items: center; }
.auth-submit { width: 100%; min-height: 47px; color: #fff; background: #AAC0AF; border: 0; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; transition: background .2s, transform .2s; }
.terms-check, .auth-error, .auth-submit { grid-column: auto; }
.auth-submit:hover { background: #FAAC9A; transform: translateY(-1px); }
.auth-switch { display: flex; justify-content: center; gap: 7px; margin-top: 22px; padding-top: 19px; color: #748078; border-top: 1px solid #ecefed; font-size: 14px; }
.auth-switch a { color: #657a6b; font-weight: 700; text-decoration: none; }
.auth-switch a:hover { color: #d98270; }
@media (max-width: 680px) { .auth-page { padding: 28px 14px; } .auth-card { width: min(430px,100%); padding: 28px 22px 24px; } .auth-form { grid-template-columns: 1fr; } .terms-check, .auth-error, .auth-submit { grid-column: auto; } .password-rules { grid-template-columns: 1fr; gap: 4px; } }
</style>
