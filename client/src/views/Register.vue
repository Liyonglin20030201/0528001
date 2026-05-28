<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2>用户注册</h2>
      <div v-if="error" class="message message-error">{{ error }}</div>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label>用户名</label>
          <input v-model="form.username" type="text" placeholder="3-20个字符" required />
        </div>
        <div class="form-group">
          <label>邮箱</label>
          <input v-model="form.email" type="email" placeholder="请输入邮箱" required />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="至少6个字符" required />
        </div>
        <div class="form-group">
          <label>确认密码</label>
          <input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" required />
        </div>
        <button type="submit" class="btn btn-primary btn-block" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
      </form>
      <p class="auth-link">已有账号？<router-link to="/login">立即登录</router-link></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({ username: '', email: '', password: '', confirmPassword: '' })
const error = ref('')
const loading = ref(false)

const handleRegister = async () => {
  error.value = ''
  if (form.value.password !== form.value.confirmPassword) {
    error.value = '两次输入的密码不一致'
    return
  }
  loading.value = true
  try {
    await userStore.register(form.value.username, form.value.password, form.value.email)
    router.push('/')
  } catch (e) {
    error.value = e.message || '注册失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page { display: flex; justify-content: center; align-items: center; min-height: 60vh; }
.auth-card { background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
.auth-card h2 { text-align: center; color: #2c5f2d; margin-bottom: 24px; }
.btn-block { width: 100%; padding: 12px; font-size: 1rem; }
.auth-link { text-align: center; margin-top: 16px; color: #666; font-size: 0.9rem; }
.auth-link a { color: #2c5f2d; }
</style>
