<template>
  <div>
    <h1 class="page-title">药材百科</h1>
    <div class="filter-bar">
      <select v-model="selectedCategory" @change="fetchHerbs">
        <option value="">全部分类</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <input v-model="keyword" placeholder="搜索药材名称或功效..." @keyup.enter="fetchHerbs" />
      <button class="btn btn-primary" @click="fetchHerbs">搜索</button>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="herbs.length === 0" class="empty">暂无药材数据</div>
    <div v-else class="grid">
      <div class="card herb-card" v-for="herb in herbs" :key="herb._id" @click="$router.push(`/herbs/${herb._id}`)">
        <div class="herb-image" v-if="herb.image">
          <img :src="herb.image" :alt="herb.name" />
        </div>
        <div class="herb-placeholder" v-else>🌿</div>
        <h3>{{ herb.name }}</h3>
        <p class="herb-alias" v-if="herb.alias">别名：{{ herb.alias }}</p>
        <div class="herb-props">
          <span class="tag">{{ herb.nature }}</span>
          <span class="tag">{{ herb.taste }}</span>
          <span class="tag">{{ herb.category }}</span>
        </div>
        <p class="herb-effect">{{ herb.effect }}</p>
      </div>
    </div>
    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="page <= 1" @click="page--; fetchHerbs()">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; fetchHerbs()">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils/api'
import { useMessage } from '../composables/useMessage'

const { error } = useMessage()
const herbs = ref([])
const categories = ref([])
const selectedCategory = ref('')
const keyword = ref('')
const page = ref(1)
const totalPages = ref(1)
const loading = ref(false)

const fetchHerbs = async () => {
  loading.value = true
  try {
    const params = { page: page.value, limit: 12 }
    if (selectedCategory.value) params.category = selectedCategory.value
    if (keyword.value) params.keyword = keyword.value
    const data = await api.get('/herbs', { params })
    herbs.value = data.herbs
    totalPages.value = data.pages
  } catch (e) {
    error('获取药材列表失败，请刷新重试')
  } finally {
    loading.value = false
  }
}

const fetchCategories = async () => {
  try {
    categories.value = await api.get('/herbs/categories')
  } catch (e) {
    error('获取药材分类失败')
  }
}

onMounted(() => {
  fetchCategories()
  fetchHerbs()
})
</script>

<style scoped>
.herb-card { cursor: pointer; text-align: center; }
.herb-card h3 { color: #2c5f2d; margin: 8px 0; }
.herb-image img { width: 100%; height: 160px; object-fit: cover; border-radius: 6px; }
.herb-placeholder { font-size: 4rem; padding: 20px 0; }
.herb-alias { color: #888; font-size: 0.85rem; margin-bottom: 8px; }
.herb-props { margin: 8px 0; }
.herb-effect { color: #555; font-size: 0.85rem; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
