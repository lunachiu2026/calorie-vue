<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuth } from '../auth.js'

const menuOpen = ref(false)
const closeMenu = () => { menuOpen.value = false }
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
    <RouterLink class="brand" to="/" @click="closeMenu">
      <img src="../assets/logo.png" alt="卡路里 calorie" />
    </RouterLink>

    <button class="hamburger" :class="{ active: menuOpen }" type="button"
      :aria-expanded="menuOpen" aria-label="開啟選單" @click="menuOpen = !menuOpen">
      <span></span><span></span><span></span>
    </button>

    <nav class="nav-links" :class="{ open: menuOpen }">
      <RouterLink to="/" exact-active-class="active" @click="closeMenu">首頁(熱量計算)</RouterLink>
      <RouterLink to="/sport" active-class="active" @click="closeMenu">運動場所</RouterLink>
      <RouterLink to="/teacher" active-class="active" @click="closeMenu">預約營養師</RouterLink>
      <RouterLink to="/records" active-class="active" @click="closeMenu">會員中心</RouterLink>
      <button v-if="isLoggedIn" class="mobile-logout" type="button" @click="handleLogout">登出</button>
      <RouterLink v-else class="mobile-login" to="/login" @click="closeMenu">登入</RouterLink>
    </nav>

    <div class="nav-actions">
      <span class="daily-goal">今日目標：2,000 kcal</span>
      <RouterLink v-if="!isLoggedIn" class="user-avatar" to="/login" aria-label="登入">👤</RouterLink>
      <button v-else class="user-avatar logged-in" type="button" :title="`${currentUser}，點擊登出`" @click="handleLogout">
        {{ currentUser.slice(0, 1).toUpperCase() }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky; z-index: 50; top: 0; display: grid;
  grid-template-columns: 220px 1fr 220px; align-items: center;
  min-height: 78px; padding: 0 max(5%, calc((100% - 1280px) / 2));
  background: rgba(255,255,255,.96); border-bottom: 1px solid #e7ece9;
  box-shadow: 0 3px 14px rgba(31,55,40,.03); backdrop-filter: blur(10px);
}
.brand { display: inline-flex; justify-self: start; }
.brand img { display: block; width: 171px; height: auto; }
.nav-links { display: flex; align-items: stretch; justify-content: center; gap: 34px; min-height: 78px; }
.nav-links a { position: relative; display: grid; color: #657169; text-decoration: none; font-weight: 600; place-items: center; white-space: nowrap; }
.nav-links a::after { position: absolute; right: 28%; bottom: 0; left: 28%; height: 3px; content: ''; background: transparent; border-radius: 3px 3px 0 0; }
.nav-links a:hover, .nav-links a.active { color: #31bb70; }
.nav-links a.active::after { background: #37c77a; }
.nav-actions { display: flex; align-items: center; justify-content: flex-end; gap: 16px; }
.daily-goal { padding: 8px 14px; color: #28b76b; background: #ebf9f2; border-radius: 999px; font-size: 13px; font-weight: 700; white-space: nowrap; }
.user-avatar { display: grid; width: 38px; height: 38px; color: #34443a; background: #edf2ef; border: 3px solid #e3e8e5; border-radius: 50%; text-decoration: none; place-items: center; }
.user-avatar.logged-in { color: #fff; background: #37c77a; border: 0; font-weight: 800; cursor: pointer; }
.hamburger { display: none; width: 40px; height: 40px; padding: 8px; background: transparent; border: 0; cursor: pointer; }
.hamburger span { display: block; width: 24px; height: 3px; margin: 4px 0; background: #34443a; border-radius: 3px; transition: .2s; }
.hamburger.active span:first-child { transform: translateY(7px) rotate(45deg); }
.hamburger.active span:nth-child(2) { opacity: 0; }
.hamburger.active span:last-child { transform: translateY(-7px) rotate(-45deg); }
.mobile-login, .mobile-logout { display: none !important; }
@media (max-width: 1050px) {
  .navbar { grid-template-columns: 190px 1fr 190px; padding: 0 3%; }
  .nav-links { gap: 17px; }
  .brand img { width: 155px; }
  .daily-goal { font-size: 12px; }
}
@media (max-width: 820px) {
  .navbar { display: flex; justify-content: space-between; min-height: 66px; padding: 0 18px; }
  .hamburger { display: block; order: 3; }
  .nav-actions { margin-left: auto; margin-right: 8px; }
  .daily-goal { display: none; }
  .nav-links { position: fixed; top: 66px; right: 0; display: flex; width: min(290px,82vw); height: calc(100vh - 66px); padding: 24px; align-items: stretch; flex-direction: column; justify-content: flex-start; gap: 4px; background: #fff; box-shadow: -14px 18px 35px rgba(32,56,41,.12); transform: translateX(105%); transition: transform .25s ease; }
  .nav-links.open { transform: translateX(0); }
  .nav-links a { display: flex; min-height: 49px; padding: 0 12px; border-radius: 9px; }
  .nav-links a::after { display: none; }
  .nav-links a.active { background: #ebf9f2; }
  .mobile-login, .mobile-logout { display: flex !important; min-height: 49px; padding: 0 12px; align-items: center; color: #657169; background: transparent; border: 0; font-weight: 600; }
  .nav-actions .user-avatar { display: none; }
}
</style>
