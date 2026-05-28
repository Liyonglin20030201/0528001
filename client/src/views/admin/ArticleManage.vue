<template>
  <div>
    <div class="admin-header">
      <h1 class="page-title">文章管理</h1>
      <button class="btn btn-primary" @click="showForm = true; resetForm()">发布文章</button>
    </div>

    <div v-if="showForm" class="form-modal">
      <div class="form-card">
        <h2>{{ editingId ? '编辑文章' : '发布文章' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>标题</label>
            <input v-model="form.title" required />
          </div>
          <div class="form-group">
            <label>分类</label>
            <select v-model="form.category" required>
              <option value="spring">春季养生</option>
              <option value="summer">夏季养生</option>
              <option value="autumn">秋季养生</option>
              <option value="winter">冬季养生</option>
              <option value="qi_deficiency">气虚体质</option>
              <option value="yang_deficiency">阳虚体质</option>
              <option value="yin_deficiency">阴虚体质</option>
              <option value="phlegm_dampness">痰湿体质</option>
              <option value="blood_stasis">血瘀体质</option>
              <option value="general">综合</option>
            </select>
          </div>
          <div class="form-group">
            <label>摘要</label>
            <input v-model="form.summary" />
          </div>
          <div class="form-group">
            <label>内容（支持 ## 标题和 - 列表）</label>
            <textarea v-model="form.content" rows="12" required></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">{{ editingId ? '更新' : '发布' }}</button>
            <button type="button" class="btn btn-secondary" @click="showForm = false">取消</button>
          </div>
        </form>
      </div>
    </div>

    <div class="article-list">
      <div class="card list-item" v-for="article in articles" :key="article._id">
        <div class="item-info">
          <h3>{{ article.title }}</h3>
          <span class="tag">{{ getCategoryLabel(article.category) }}</span>
          <span class="meta">阅读 {{ article.viewCount }} | {{ formatDate(article.createdAt) }}</span>
        </div>
        <div class="item-actions">
          <button class="btn btn-primary" @click="editArticle(article)">编辑</button>
          <button class="btn btn-danger" @click="deleteArticle(article._id)">删除</button>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="page <= 1" @click="page--; fetchArticles()">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; fetchArticles()">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../utils/api'

const articles = ref([])
const page = ref(1)
const totalPages = ref(1)
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ title: '', category: 'general', summary: '', content: '' })

const categoryLabels = {
  spring: '春季养生', summer: '夏季养生', autumn: '秋季养生', winter: '冬季养生',
  qi_deficiency: '气虚体质', yang_deficiency: '阳虚体质', yin_deficiency: '阴虚体质',
  phlegm_dampness: '痰湿体质', blood_stasis: '血瘀体质', general: '综合'
}
const getCategoryLabel = (cat) => categoryLabels[cat] || cat
const formatDate = (date) => new Date(date).toLocaleDateString('zh-CN')

const resetForm = () => {
  editingId.value = null
  form.value = { title: '', category: 'general', summary: '', content: '' }
}

const fetchArticles = async () => {
  try {
    const data = await api.get('/articles', { params: { page: page.value, limit: 10 } })
    articles.value = data.articles
    totalPages.value = data.pages
  } catch (e) {
    console.error(e)
  }
}

const handleSubmit = async () => {
  try {
    if (editingId.value) {
      await api.put(`/articles/${editingId.value}`, form.value)
    } else {
      await api.post('/articles', form.value)
    }
    showForm.value = false
    fetchArticles()
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

const editArticle = async (article) => {
  const full = await api.get(`/articles/${article._id}`)
  editingId.value = article._id
  form.value = { title: full.title, category: full.category, summary: full.summary, content: full.content }
  showForm.value = true
}

const deleteArticle = async (id) => {
  if (!confirm('确认删除此文章？')) return
  try {
    await api.delete(`/articles/${id}`)
    fetchArticles()
  } catch (e) {
    alert('删除失败')
  }
}

onMounted(() => fetchArticles())
</script>

<style scoped>
.admin-header { display: flex; justify-content: space-between; align-items: center; }
.form-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
.form-card { background: #fff; border-radius: 12px; padding: 30px; width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto; }
.form-card h2 { color: #2c5f2d; margin-bottom: 20px; }
.form-actions { display: flex; gap: 12px; margin-top: 16px; }
.list-item { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.item-info h3 { color: #333; margin-bottom: 4px; }
.item-actions { display: flex; gap: 8px; }
.meta { color: #999; font-size: 0.8rem; margin-left: 8px; }
</style>
