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
  <main class="main-container">
    <section class="login-card">
      <h2>會員登入</h2>
      <p class="demo-hint">Demo 帳號：{{ DEMO_USER }} ／ 密碼：{{ DEMO_PASS }}</p>

      <form @submit.prevent="submit">
        <div class="form-group">
          <label for="username">帳號</label>
          <input
            id="username"
            type="text"
            class="form-control"
            v-model="username"
            placeholder="請輸入帳號"
            autocomplete="username"
          />
        </div>

        <div class="form-group">
          <label for="password">密碼</label>
          <input
            id="password"
            type="password"
            class="form-control"
            v-model="password"
            placeholder="請輸入密碼"
            autocomplete="current-password"
          />
        </div>

        <label class="remember">
          <input type="checkbox" v-model="remember" /> 保持登入狀態
        </label>

        <p v-if="error" class="error-msg">{{ error }}</p>

        <button type="submit" class="btn-submit">登入</button>
      </form>
    </section>
  </main>
</template>

<style scoped>
.main-container {
  max-width: 420px;
  margin: 40px auto;
  padding: 0 16px;
}

.login-card {
  background: #ffffff;
  border: 1px solid #eef0f3;
  border-radius: 18px;
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.06);
  padding: 32px 28px;
}

.login-card h2 {
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.demo-hint {
  margin: 0 0 22px;
  font-size: 13px;
  color: #94a3b8;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

.form-control {
  width: 100%;
  min-height: 44px;
  padding: 0 12px;
  border: 1px solid #d6d6d6;
  border-radius: 9px;
  outline: none;
  font-size: 15px;
  box-sizing: border-box;
}

.form-control:focus {
  border-color: #2e9e5b;
}

.remember {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 16px;
}

.error-msg {
  color: #ef4444;
  font-size: 13px;
  margin: 0 0 12px;
}

.btn-submit {
  width: 100%;
  min-height: 46px;
  border: none;
  border-radius: 10px;
  background: #2e9e5b;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-submit:hover {
  background: #27894f;
}
</style>
