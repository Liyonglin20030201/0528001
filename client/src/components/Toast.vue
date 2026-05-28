<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div v-for="msg in messages" :key="msg.id" :class="['toast', `toast-${msg.type}`]">
        {{ msg.text }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useMessage } from '../composables/useMessage'

const { messages } = useMessage()
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 70px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.toast {
  padding: 12px 20px;
  border-radius: 6px;
  color: #fff;
  font-size: 0.9rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  max-width: 360px;
}
.toast-success { background: #2c5f2d; }
.toast-error { background: #dc3545; }
.toast-warning { background: #e67e22; }
.toast-info { background: #2980b9; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(40px); }
.toast-leave-to { opacity: 0; transform: translateX(40px); }
</style>
