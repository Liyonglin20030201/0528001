<template>
  <div>
    <h1 class="page-title">名家故事</h1>
    <div class="filter-bar">
      <select v-model="selectedDynasty" @change="page = 1; fetchMasters()">
        <option value="">全部朝代</option>
        <option v-for="d in dynasties" :key="d" :value="d">{{ d }}</option>
      </select>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="masters.length === 0" class="empty">暂无名家数据</div>
    <div v-else class="grid">
      <div class="card master-card" v-for="master in masters" :key="master._id" @click="$router.push(`/masters/${master._id}`)">
        <div class="master-portrait" v-if="master.portrait">
          <img :src="master.portrait" :alt="master.name" />
        </div>
        <div class="master-icon" v-else>👨‍⚕️</div>
        <h3>{{ master.name }}</h3>
        <p class="dynasty"><span class="tag">{{ master.dynasty }}</span></p>
        <p class="contribution">{{ master.contribution }}</p>
      </div>
    </div>
    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="page <= 1" @click="page--; fetchMasters()">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; fetchMasters()">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils/api'
import { useMessage } from '../composables/useMessage'

const { error } = useMessage()
const masters = ref([])
const dynasties = ref([])
const selectedDynasty = ref('')
const page = ref(1)
const totalPages = ref(1)
const loading = ref(false)

const fetchMasters = async () => {
  loading.value = true
  try {
    const params = { page: page.value, limit: 10 }
    if (selectedDynasty.value) params.dynasty = selectedDynasty.value
    const data = await api.get('/masters', { params })
    masters.value = data.masters
    totalPages.value = data.pages
  } catch (e) {
    error('获取名家列表失败，请刷新重试')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    dynasties.value = await api.get('/masters/dynasties')
  } catch (e) {
    error('获取朝代列表失败')
  }
  fetchMasters()
})
</script>

<style scoped>
.master-card { cursor: pointer; text-align: center; }
.master-card h3 { color: #2c5f2d; margin: 8px 0; }
.master-portrait img { width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 0 auto; }
.master-icon { font-size: 4rem; padding: 10px 0; }
.dynasty { margin-bottom: 8px; }
.contribution { color: #555; font-size: 0.85rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
