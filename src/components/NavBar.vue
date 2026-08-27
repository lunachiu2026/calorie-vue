<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '../auth.js'

const menuOpen = ref(false)
const closeMenu = () => {
  menuOpen.value = false
}

const { isLoggedIn, currentUser, logout } = useAuth()
const router = useRouter()

const handleLogout = () => {
  logout()
  closeMenu()
  router.push('/')
}
</script>

<template>
  <header class="navbar">
    <div class="logo">
      <RouterLink to="/" @click="closeMenu">
        <img src="../assets/logo.png" alt="卡路里 calorie" />
      </RouterLink>
    </div>

    <button
      class="hamburger"
      :class="{ active: menuOpen }"
      @click="menuOpen = !menuOpen"
      :aria-expanded="menuOpen"
      aria-label="選單"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>

    <nav class="nav-links" :class="{ open: menuOpen }">
      <RouterLink to="/" exact-active-class="active" @click="closeMenu">首頁(熱量計算)</RouterLink>
      <RouterLink to="/sport" active-class="active" @click="closeMenu">運動場所</RouterLink>
      <RouterLink to="/teacher" active-class="active" @click="closeMenu">介紹營養師</RouterLink>
      <RouterLink to="/records" active-class="active" @click="closeMenu">我的紀錄</RouterLink>
      <template v-if="isLoggedIn">
        <span class="nav-user">Hi, {{ currentUser }}</span>
        <button class="nav-logout" @click="handleLogout">登出</button>
      </template>
      <RouterLink v-else to="/login" active-class="active" @click="closeMenu">登入</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 10px 24px;
  min-height: 64px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.logo img {
  height: 28px;
}

.nav-links {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  padding: 6px 4px;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
}

.nav-links a.active {
  color: #2e9e5b;
  border-bottom-color: #2e9e5b;
}

.nav-user {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  padding: 6px 4px;
  white-space: nowrap;
}

.nav-logout {
  border: none;
  background: transparent;
  color: #ef4444;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 4px;
  white-space: nowrap;
}

.nav-logout:hover {
  text-decoration: underline;
}

/* 漢堡按鈕：桌機預設隱藏 */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.hamburger span {
  display: block;
  height: 3px;
  width: 24px;
  background: #333;
  border-radius: 2px;
  transition: transform 0.2s, opacity 0.2s;
}

.hamburger.active span:nth-child(1) {
  transform: translateY(8px) rotate(45deg);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
}

.hamburger.active span:nth-child(3) {
  transform: translateY(-8px) rotate(-45deg);
}

@media (max-width: 600px) {
  .navbar {
    padding: 10px 16px;
  }

  .hamburger {
    display: flex;
  }

  .nav-links {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    text-align: right;
    gap: 4px;
    position: fixed;
    top: 64px;
    right: 0;
    width: 150px;
    height: 500px;
    overflow-y: auto;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 12px 0 0 12px;
    box-shadow: -8px 8px 20px rgba(0, 0, 0, 0.1);
    padding: 16px 8px;
    transform: translateX(100%);
    transition: transform 0.25s ease;
    pointer-events: none;
    z-index: 30;
  }

  .nav-links.open {
    transform: translateX(0);
    pointer-events: auto;
  }

  .nav-links a {
    padding: 10px 4px;
    font-size: 15px;
  }
}
</style>
