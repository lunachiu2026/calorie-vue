<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const teacher = route.query.teacher || ''

const email = ref('')
const phone = ref('')
const appointmentDate = ref('')
const errors = ref({ email: '', phone: '', appointmentDate: '' })
const submitted = ref(false)

const submit = () => {
  errors.value = { email: '', phone: '', appointmentDate: '' }

  if (!email.value.trim()) {
    errors.value.email = '請輸入電子郵件'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
    errors.value.email = '請輸入有效的電子郵件'
  }

  if (!phone.value.trim()) {
    errors.value.phone = '請輸入電話'
  } else if (!/^(?=.*\d)[0-9-]{6,}$/.test(phone.value.trim())) {
    errors.value.phone = '請輸入有效的電話號碼'
  }

  if (!appointmentDate.value) {
    errors.value.appointmentDate = '請選擇預約日期'
  }

  if (errors.value.email || errors.value.phone || errors.value.appointmentDate) return

  submitted.value = true
}

const resetForm = () => {
  email.value = ''
  phone.value = ''
  appointmentDate.value = ''
  errors.value = { email: '', phone: '', appointmentDate: '' }
}
</script>

<template>
  <main class="main-container">
    <section class="login-card">
      <RouterLink to="/teacher" class="back-link">&#8592; 返回營養師介紹</RouterLink>

      <div class="card-tabs">
        <button class="tab-btn active">預約表單</button>
      </div>

      <p v-if="teacher" class="teacher-info">預約營養師：<strong>{{ teacher }}</strong></p>
      <p v-if="submitted" class="success-msg">預約資料已送出{{ teacher ? '，我們會盡快與 ' + teacher + ' 營養師聯繫您' : '' }}！</p>

      <form @submit.prevent="submit" v-else>
        <div class="form-group">
          <label for="email">電子郵件 (Gmail)</label>
          <input type="email" id="email" class="form-control" v-model="email" placeholder="請輸入 Gmail" />
          <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <div class="input-wrapper">
            <label for="number">電話 (Number)</label>
            <input type="text" id="number" class="form-control" v-model="phone" placeholder="請輸入聯絡電話" />
            <span v-if="errors.phone" class="error-msg">{{ errors.phone }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="date">預約日期 (Date)</label>
          <input type="date" id="date" class="form-control" v-model="appointmentDate" />
          <span v-if="errors.appointmentDate" class="error-msg">{{ errors.appointmentDate }}</span>
        </div>

        <div class="btn-row">
          <button type="submit" class="submit-btn">送出預約</button>
          <button type="button" class="clear-btn" @click="resetForm">清除</button>
        </div>
      </form>
    </section>
  </main>
</template>

<style scoped>
.error-msg {
  display: block;
  color: #d64545;
  font-size: 13px;
  margin-top: 4px;
}

.success-msg {
  color: #2e9e5b;
  font-weight: 600;
  padding: 12px 0;
}

.back-link {
  display: inline-block;
  margin-bottom: 12px;
  color: #2e9e5b;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
}

.teacher-info {
  margin: 8px 0 0;
  color: #555;
}

.btn-row {
  display: flex;
  gap: 12px;
  margin-top: 18px;
}

.btn-row .submit-btn {
  flex: 1;
}

.clear-btn {
  flex: 1;
  min-height: 46px;
  border: 1px solid #d6d6d6;
  border-radius: 10px;
  background: #fff;
  color: #64748b;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.clear-btn:hover {
  background: #f8fafc;
  border-color: #94a3b8;
}
</style>
