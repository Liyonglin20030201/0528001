import { reactive } from 'vue'

const messages = reactive([])
let id = 0

function showMessage(text, type = 'info', duration = 3000) {
  const msg = { id: ++id, text, type }
  messages.push(msg)
  setTimeout(() => {
    const index = messages.findIndex(m => m.id === msg.id)
    if (index > -1) messages.splice(index, 1)
  }, duration)
}

export function useMessage() {
  return {
    messages,
    success: (text) => showMessage(text, 'success'),
    error: (text) => showMessage(text, 'error'),
    warning: (text) => showMessage(text, 'warning'),
    info: (text) => showMessage(text, 'info')
  }
}
