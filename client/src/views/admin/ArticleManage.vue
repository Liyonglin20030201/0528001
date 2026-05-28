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
            <label>标题 <span class="required">*</span></label>
            <input v-model="form.title" required maxlength="100" placeholder="请输入文章标题（2-100字）" />
            <span v-if="errors.title" class="field-error">{{ errors.title }}</span>
          </div>
          <div class="form-group">
            <label>分类 <span class="required">*</span></label>
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
            <label>封面图片</label>
            <ImageUpload v-model="form.coverImage" placeholder="上传封面图" />
          </div>
          <div class="form-group">
            <label>摘要</label>
            <input v-model="form.summary" maxlength="200" placeholder="简短描述文章主旨（选填，最多200字）" />
          </div>
          <div class="form-group">
            <label>内容 <span class="required">*</span>（支持 ## 标题和 - 列表）</label>
            <textarea v-model="form.content" rows="12" required placeholder="请输入文章正文内容"></textarea>
            <span v-if="errors.content" class="field-error">{{ errors.content }}</span>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? '提交中...' : (editingId ? '更新' : '发布') }}
            </button>
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
import ImageUpload from '../../components/ImageUpload.vue'
import { useMessage } from '../../composables/useMessage'

const { success, error } = useMessage()

const articles = ref([])
const page = ref(1)
const totalPages = ref(1)
const showForm = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const errors = ref({})
const form = ref({ title: '', category: 'general', summary: '', content: '', coverImage: '' })

const categoryLabels = {
  spring: '春季养生', summer: '夏季养生', autumn: '秋季养生', winter: '冬季养生',
  qi_deficiency: '气虚体质', yang_deficiency: '阳虚体质', yin_deficiency: '阴虚体质',
  phlegm_dampness: '痰湿体质', blood_stasis: '血瘀体质', general: '综合'
}
const getCategoryLabel = (cat) => categoryLabels[cat] || cat
const formatDate = (date) => new Date(date).toLocaleDateString('zh-CN')

const resetForm = () => {
  editingId.value = null
  errors.value = {}
  form.value = { title: '', category: 'general', summary: '', content: '', coverImage: '' }
}

const validate = () => {
  errors.value = {}
  if (!form.value.title || form.value.title.trim().length < 2) {
    errors.value.title = '标题至少需要2个字符'
  }
  if (!form.value.content || form.value.content.trim().length < 10) {
    errors.value.content = '文章内容至少需要10个字符'
  }
  return Object.keys(errors.value).length === 0
}

const fetchArticles = async () => {
  try {
    const data = await api.get('/articles', { params: { page: page.value, limit: 10 } })
    articles.value = data.articles
    totalPages.value = data.pages
  } catch (e) {
    error('获取文章列表失败，请刷新重试')
  }
}

const handleSubmit = async () => {
  if (!validate()) return
  submitting.value = true
  try {
    if (editingId.value) {
      await api.put(`/articles/${editingId.value}`, form.value)
      success('文章更新成功')
    } else {
      await api.post('/articles', form.value)
      success('文章发布成功')
    }
    showForm.value = false
    fetchArticles()
  } catch (e) {
    error(e.message || '操作失败，请检查内容后重试')
  } finally {
    submitting.value = false
  }
}

const editArticle = async (article) => {
  try {
    const full = await api.get(`/articles/${article._id}`)
    editingId.value = article._id
    errors.value = {}
    form.value = { title: full.title, category: full.category, summary: full.summary, content: full.content, coverImage: full.coverImage || '' }
    showForm.value = true
  } catch (e) {
    error('获取文章详情失败')
  }
}

const deleteArticle = async (id) => {
  if (!confirm('确认删除此文章？删除后不可恢复。')) return
  try {
    await api.delete(`/articles/${id}`)
    success('文章已删除')
    fetchArticles()
  } catch (e) {
    error('删除失败，请稍后重试')
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
.required { color: #dc3545; }
.field-error { color: #dc3545; font-size: 0.8rem; margin-top: 4px; display: block; }
</style>
