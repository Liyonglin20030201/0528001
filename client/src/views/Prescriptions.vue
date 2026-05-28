<template>
  <div class="prescriptions-page">
    <h1 class="page-title">经典方剂查询</h1>

    <div class="filter-bar">
      <input v-model="keyword" placeholder="搜索方剂名称、功效、主治、药材..." @keyup.enter="search" />
      <select v-model="selectedCategory" @change="search">
        <option value="">全部分类</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <input v-model="herbFilter" placeholder="按药材组成筛选..." @keyup.enter="search" />
      <button class="btn btn-primary" @click="search">搜索</button>
    </div>

    <div v-if="prescriptions.length" class="prescription-list">
      <div v-for="p in prescriptions" :key="p._id" class="card prescription-card" @click="viewDetail(p)">
        <div class="card-header">
          <h3>{{ p.name }}</h3>
          <span class="tag">{{ p.category }}</span>
        </div>
        <p class="source" v-if="p.source">出处：{{ p.source }}</p>
        <p class="composition">组成：{{ p.composition.map(c => c.herb + ' ' + c.dosage).join('、') }}</p>
        <p class="effect">功效：{{ p.effect }}</p>
      </div>
    </div>
    <div v-else-if="!loading" class="empty">暂无匹配的方剂</div>
    <div v-if="loading" class="loading">加载中...</div>

    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
    </div>

    <div v-if="detail" class="modal-overlay" @click.self="detail = null">
      <div class="modal-content">
        <button class="modal-close" @click="detail = null">&times;</button>
        <h2>{{ detail.name }}</h2>
        <div class="detail-meta">
          <span class="tag">{{ detail.category }}</span>
          <span v-if="detail.source">{{ detail.source }}</span>
        </div>
        <div class="detail-section">
          <h4>组成</h4>
          <div class="composition-grid">
            <div v-for="c in detail.composition" :key="c.herb" class="comp-item">
              <span class="comp-herb">{{ c.herb }}</span>
              <span class="comp-dosage">{{ c.dosage }}</span>
            </div>
          </div>
        </div>
        <div class="detail-section" v-if="detail.method">
          <h4>用法</h4>
          <p>{{ detail.method }}</p>
        </div>
        <div class="detail-section">
          <h4>功效</h4>
          <p>{{ detail.effect }}</p>
        </div>
        <div class="detail-section">
          <h4>主治</h4>
          <p>{{ detail.indication }}</p>
        </div>
        <div class="detail-section" v-if="detail.analysis">
          <h4>方解</h4>
          <p>{{ detail.analysis }}</p>
        </div>
        <div class="detail-section caution" v-if="detail.caution">
          <h4>注意事项</h4>
          <p>{{ detail.caution }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils/api'
import { useMessage } from '../composables/useMessage'

const { error } = useMessage()

const prescriptions = ref([])
const categories = ref([])
const keyword = ref('')
const selectedCategory = ref('')
const herbFilter = ref('')
const page = ref(1)
const totalPages = ref(0)
const loading = ref(false)
const detail = ref(null)

const search = () => {
  page.value = 1
  fetchPrescriptions()
}

const changePage = (p) => {
  page.value = p
  fetchPrescriptions()
}

const viewDetail = async (p) => {
  try {
    detail.value = await api.get(`/prescriptions/${p._id}`)
  } catch (e) {
    error('获取方剂详情失败')
  }
}

const fetchPrescriptions = async () => {
  loading.value = true
  try {
    const params = { page: page.value, limit: 10 }
    if (keyword.value) params.keyword = keyword.value
    if (selectedCategory.value) params.category = selectedCategory.value
    if (herbFilter.value) params.herb = herbFilter.value
    const data = await api.get('/prescriptions', { params })
    prescriptions.value = data.prescriptions
    totalPages.value = data.pages
  } catch (e) {
    error('获取方剂列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    categories.value = await api.get('/prescriptions/categories')
  } catch (e) {}
  fetchPrescriptions()
})
</script>

<style scoped>
.prescriptions-page { max-width: 900px; margin: 0 auto; }
.prescription-card { cursor: pointer; }
.card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.card-header h3 { color: #2c5f2d; margin: 0; }
.source { color: #888; font-size: 0.85rem; margin-bottom: 6px; }
.composition { color: #555; font-size: 0.9rem; margin-bottom: 6px; }
.effect { color: #666; font-size: 0.9rem; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
.modal-content { background: #fff; border-radius: 12px; padding: 30px; max-width: 700px; width: 100%; max-height: 80vh; overflow-y: auto; position: relative; }
.modal-close { position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #888; }
.modal-content h2 { color: #2c5f2d; margin-bottom: 8px; }
.detail-meta { display: flex; gap: 12px; align-items: center; margin-bottom: 20px; color: #888; font-size: 0.9rem; }
.detail-section { margin-bottom: 20px; }
.detail-section h4 { color: #2c5f2d; margin-bottom: 8px; font-size: 0.95rem; }
.detail-section p { color: #555; line-height: 1.8; }
.composition-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.comp-item { background: #f9fdf9; padding: 4px 12px; border-radius: 4px; border: 1px solid #e8f5e9; }
.comp-herb { color: #2c5f2d; font-weight: 500; margin-right: 6px; }
.comp-dosage { color: #888; font-size: 0.85rem; }
.caution { background: #fff8e1; padding: 12px; border-radius: 8px; }
.caution h4 { color: #f57c00; }
.caution p { color: #e65100; }
</style>
