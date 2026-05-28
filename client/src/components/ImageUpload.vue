<template>
  <div class="image-upload">
    <div v-if="previewUrl" class="upload-preview">
      <img :src="previewUrl" alt="预览" />
      <button type="button" class="btn-remove" @click="removeImage">×</button>
    </div>
    <label v-else class="upload-area">
      <input type="file" accept="image/jpeg,image/png,image/gif,image/webp" @change="handleFileChange" />
      <span class="upload-placeholder">
        <span class="upload-icon">+</span>
        <span>{{ placeholder }}</span>
      </span>
    </label>
    <p v-if="uploading" class="upload-status">上传中...</p>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '../utils/api'
import { useMessage } from '../composables/useMessage'

const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: '点击上传图片' }
})

const emit = defineEmits(['update:modelValue'])
const { error } = useMessage()

const previewUrl = ref(props.modelValue || '')
const uploading = ref(false)

watch(() => props.modelValue, (val) => {
  previewUrl.value = val || ''
})

const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    error('图片大小不能超过 5MB')
    return
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    error('仅支持 JPG、PNG、GIF、WebP 格式')
    return
  }

  uploading.value = true
  try {
    const formData = new FormData()
    formData.append('image', file)
    const data = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    previewUrl.value = data.url
    emit('update:modelValue', data.url)
  } catch (e) {
    error(e.message || '图片上传失败')
  } finally {
    uploading.value = false
  }
}

const removeImage = () => {
  previewUrl.value = ''
  emit('update:modelValue', '')
}
</script>

<style scoped>
.image-upload { margin-bottom: 8px; }
.upload-area {
  display: flex; align-items: center; justify-content: center;
  width: 160px; height: 120px;
  border: 2px dashed #ccc; border-radius: 8px;
  cursor: pointer; transition: border-color 0.3s;
}
.upload-area:hover { border-color: #4a8c5c; }
.upload-area input { display: none; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; color: #999; font-size: 0.85rem; }
.upload-icon { font-size: 1.8rem; line-height: 1; color: #bbb; }
.upload-preview { position: relative; display: inline-block; }
.upload-preview img { width: 160px; height: 120px; object-fit: cover; border-radius: 8px; border: 1px solid #eee; }
.btn-remove {
  position: absolute; top: -8px; right: -8px;
  width: 22px; height: 22px; border-radius: 50%;
  background: #dc3545; color: #fff; border: none;
  font-size: 1rem; line-height: 1; cursor: pointer;
}
.upload-status { color: #666; font-size: 0.8rem; margin-top: 4px; }
</style>
