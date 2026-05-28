<template>
  <div>
    <h1 class="page-title">养生文章</h1>
    <div class="filter-bar">
      <select v-model="selectedCategory" @change="page = 1; fetchArticles()">
        <option value="">全部分类</option>
        <optgroup label="四季养生">
          <option value="spring">春季养生</option>
          <option value="summer">夏季养生</option>
          <option value="autumn">秋季养生</option>
          <option value="winter">冬季养生</option>
        </optgroup>
        <optgroup label="体质调养">
          <option value="qi_deficiency">气虚体质</option>
          <option value="yang_deficiency">阳虚体质</option>
          <option value="yin_deficiency">阴虚体质</option>
          <option value="phlegm_dampness">痰湿体质</option>
          <option value="blood_stasis">血瘀体质</option>
        </optgroup>
        <option value="general">综合</option>
      </select>
      <input v-model="keyword" placeholder="搜索文章..." @keyup.enter="page = 1; fetchArticles()" />
      <button class="btn btn-primary" @click="page = 1; fetchArticles()">搜索</button>
    </div>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="articles.length === 0" class="empty">暂无文章</div>
    <div v-else>
      <div class="article-list">
        <div class="card article-item" v-for="article in articles" :key="article._id" @click="$router.push(`/articles/${article._id}`)">
          <h3>{{ article.title }}</h3>
          <p class="summary">{{ article.summary }}</p>
          <div class="meta">
            <span class="tag">{{ getCategoryLabel(article.category) }}</span>
            <span>{{ article.author?.username || '管理员' }}</span>
            <span>阅读 {{ article.viewCount }}</span>
            <span>{{ formatDate(article.createdAt) }}</span>
          </div>
        </div>
      </div>
      <div class="pagination" v-if="totalPages > 1">
        <button :disabled="page <= 1" @click="page--; fetchArticles()">上一页</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button :disabled="page >= totalPages" @click="page++; fetchArticles()">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils/api'
import { useMessage } from '../composables/useMessage'

const { error } = useMessage()
const articles = ref([])
const selectedCategory = ref('')
const keyword = ref('')
const page = ref(1)
const totalPages = ref(1)
const loading = ref(false)

const categoryLabels = {
  spring: '春季养生', summer: '夏季养生', autumn: '秋季养生', winter: '冬季养生',
  qi_deficiency: '气虚体质', yang_deficiency: '阳虚体质', yin_deficiency: '阴虚体质',
  phlegm_dampness: '痰湿体质', blood_stasis: '血瘀体质', general: '综合'
}

const getCategoryLabel = (cat) => categoryLabels[cat] || cat
const formatDate = (date) => new Date(date).toLocaleDateString('zh-CN')

const fetchArticles = async () => {
  loading.value = true
  try {
    const params = { page: page.value, limit: 10 }
    if (selectedCategory.value) params.category = selectedCategory.value
    if (keyword.value) params.keyword = keyword.value
    const data = await api.get('/articles', { params })
    articles.value = data.articles
    totalPages.value = data.pages
  } catch (e) {
    error('获取文章列表失败，请刷新重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchArticles())
</script>

<style scoped>
.article-item { cursor: pointer; }
.article-item h3 { color: #2c5f2d; margin-bottom: 8px; }
.summary { color: #666; font-size: 0.9rem; line-height: 1.5; margin-bottom: 12px; }
.meta { display: flex; gap: 16px; color: #999; font-size: 0.8rem; align-items: center; }
</style>
