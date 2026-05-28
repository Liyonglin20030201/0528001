<template>
  <div id="app">
    <nav class="navbar">
      <div class="nav-container">
        <router-link to="/" class="nav-brand">中医药文化科普</router-link>
        <div class="nav-links">
          <router-link to="/">首页</router-link>
          <router-link to="/herbs">药材百科</router-link>
          <router-link to="/articles">养生文章</router-link>
          <router-link to="/masters">名家故事</router-link>
          <template v-if="userStore.isLoggedIn">
            <router-link to="/favorites">我的收藏</router-link>
            <router-link v-if="userStore.isAdmin" to="/admin">后台管理</router-link>
            <span class="nav-user">{{ userStore.user.username }}</span>
            <button @click="handleLogout" class="btn-logout">退出</button>
          </template>
          <template v-else>
            <router-link to="/login">登录</router-link>
            <router-link to="/register">注册</router-link>
          </template>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
    <footer class="footer">
      <p>中医药文化科普网站 &copy; 2024 | 弘扬中医药文化，传承千年智慧</p>
    </footer>
  </div>
</template>

<script setup>
import { useUserStore } from './stores/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const handleLogout = () => {
  userStore.logout()
  router.push('/')
}
</script>
