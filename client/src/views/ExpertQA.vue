<template>
  <div class="expert-page">
    <h1 class="page-title">专家问答</h1>

    <div class="tab-bar">
      <button :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">全部问题</button>
      <button v-if="userStore.isLoggedIn" :class="{ active: activeTab === 'my' }" @click="activeTab = 'my'">我的提问</button>
    </div>

    <div class="filter-bar">
      <select v-model="filterCategory" @change="fetchQuestions">
        <option value="">全部分类</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
      <input v-model="searchKeyword" placeholder="搜索问题..." @keyup.enter="fetchQuestions" />
      <button class="btn btn-primary" @click="fetchQuestions">搜索</button>
      <button v-if="userStore.isLoggedIn" class="btn btn-primary" @click="showAskModal = true">我要提问</button>
    </div>

    <div v-if="questions.length" class="questions-list">
      <div v-for="q in questions" :key="q._id" class="card question-card" @click="openQuestion(q)">
        <div class="question-header">
          <span class="status-badge" :class="q.status">{{ statusLabel(q.status) }}</span>
          <span class="category-badge">{{ q.category }}</span>
        </div>
        <h3>{{ q.title }}</h3>
        <p class="question-preview">{{ q.content.slice(0, 100) }}{{ q.content.length > 100 ? '...' : '' }}</p>
        <div class="question-meta">
          <span>{{ q.user?.username }}</span>
          <span>{{ q.answers?.length || 0 }} 个回答</span>
          <span>{{ q.viewCount }} 次浏览</span>
          <span>{{ formatDate(q.createdAt) }}</span>
        </div>
      </div>
    </div>
    <div v-else-if="!loading" class="empty">暂无问题</div>
    <div v-if="loading" class="loading">加载中...</div>

    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
    </div>

    <div v-if="showAskModal" class="modal-overlay" @click.self="showAskModal = false">
      <div class="modal card">
        <h3>提交问题</h3>
        <div class="form-group">
          <label>分类</label>
          <select v-model="askForm.category">
            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>标题</label>
          <input v-model="askForm.title" placeholder="简要描述您的问题" maxlength="100" />
        </div>
        <div class="form-group">
          <label>问题详情</label>
          <textarea v-model="askForm.content" placeholder="详细描述您的问题，方便专家为您解答" rows="6"></textarea>
        </div>
        <div class="form-group">
          <label>标签（选填，逗号分隔）</label>
          <input v-model="askForm.tags" placeholder="如：体质,养生,失眠" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="showAskModal = false">取消</button>
          <button class="btn btn-primary" @click="submitQuestion">提交</button>
        </div>
      </div>
    </div>

    <div v-if="selectedQuestion" class="modal-overlay" @click.self="selectedQuestion = null">
      <div class="modal card detail-modal">
        <div class="detail-header">
          <span class="status-badge" :class="selectedQuestion.status">{{ statusLabel(selectedQuestion.status) }}</span>
          <span class="category-badge">{{ selectedQuestion.category }}</span>
        </div>
        <h2>{{ selectedQuestion.title }}</h2>
        <p class="detail-content">{{ selectedQuestion.content }}</p>
        <div class="detail-meta">
          <span>提问者：{{ selectedQuestion.user?.username }}</span>
          <span>{{ formatDate(selectedQuestion.createdAt) }}</span>
        </div>

        <div class="answers-section">
          <h3>回答 ({{ selectedQuestion.answers?.length || 0 }})</h3>
          <div v-for="answer in selectedQuestion.answers" :key="answer._id" class="answer-card" :class="{ accepted: answer.isAccepted }">
            <div class="answer-header">
              <div class="expert-info">
                <span class="expert-name">{{ answer.expert?.username }}</span>
                <span v-if="answer.expert?.role === 'expert'" class="expert-badge">认证中医师</span>
              </div>
              <span v-if="answer.isAccepted" class="accepted-badge">已采纳</span>
            </div>
            <p class="answer-content">{{ answer.content }}</p>
            <div class="answer-actions">
              <button class="btn-like" @click.stop="likeAnswer(answer)">
                {{ answer.likes?.includes(userStore.user?._id) ? '❤' : '♡' }} {{ answer.likes?.length || 0 }}
              </button>
              <button v-if="canAccept(selectedQuestion)" class="btn btn-sm btn-primary" @click.stop="acceptAnswer(answer)">采纳</button>
              <span class="answer-date">{{ formatDate(answer.createdAt) }}</span>
            </div>
          </div>
          <div v-if="!selectedQuestion.answers?.length" class="empty-answers">暂无回答，等待专家解答中...</div>
        </div>

        <div v-if="canAnswer" class="answer-form">
          <h4>我来回答</h4>
          <div class="form-group">
            <textarea v-model="answerContent" placeholder="请输入您的专业解答" rows="4"></textarea>
          </div>
          <button class="btn btn-primary" @click="submitAnswer">提交回答</button>
        </div>

        <button class="modal-close" @click="selectedQuestion = null">&times;</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import api from '../utils/api'
import { useMessage } from '../composables/useMessage'

const { success, error } = useMessage()
const userStore = useUserStore()

const activeTab = ref('all')
const loading = ref(false)
const questions = ref([])
const page = ref(1)
const totalPages = ref(0)
const filterCategory = ref('')
const searchKeyword = ref('')
const showAskModal = ref(false)
const selectedQuestion = ref(null)
const answerContent = ref('')

const categories = ['体质养生', '药材用法', '食疗方剂', '经络穴位', '四季养生', '其他']
const askForm = ref({ title: '', content: '', category: '其他', tags: '' })

const canAnswer = computed(() => {
  return userStore.isLoggedIn && (userStore.user?.role === 'expert' || userStore.user?.role === 'admin')
})

const canAccept = (question) => {
  return userStore.isLoggedIn && question.user?._id === userStore.user?._id && question.status !== 'closed'
}

const statusLabel = (status) => ({ pending: '待回答', answered: '已回答', closed: '已采纳' }[status] || status)
const formatDate = (date) => new Date(date).toLocaleDateString('zh-CN')

const fetchQuestions = async () => {
  loading.value = true
  try {
    const params = { page: page.value, limit: 10 }
    if (filterCategory.value) params.category = filterCategory.value
    if (searchKeyword.value) params.keyword = searchKeyword.value

    let data
    if (activeTab.value === 'my') {
      data = await api.get('/expert/my/questions')
      questions.value = data
      totalPages.value = 1
    } else {
      data = await api.get('/expert', { params })
      questions.value = data.questions
      totalPages.value = data.pages
    }
  } catch (e) {
    error('获取问题失败')
  } finally {
    loading.value = false
  }
}

const openQuestion = async (q) => {
  try {
    const data = await api.get(`/expert/${q._id}`)
    selectedQuestion.value = data
  } catch (e) {
    error('获取问题详情失败')
  }
}

const submitQuestion = async () => {
  if (!askForm.value.title.trim() || !askForm.value.content.trim()) {
    error('标题和内容不能为空')
    return
  }
  try {
    await api.post('/expert', {
      title: askForm.value.title,
      content: askForm.value.content,
      category: askForm.value.category,
      tags: askForm.value.tags.split(/[,，]/).map(t => t.trim()).filter(Boolean)
    })
    success('提问成功，等待专家回答')
    showAskModal.value = false
    askForm.value = { title: '', content: '', category: '其他', tags: '' }
    fetchQuestions()
  } catch (e) {
    error(e.message || '提问失败')
  }
}

const submitAnswer = async () => {
  if (!answerContent.value.trim()) {
    error('回答内容不能为空')
    return
  }
  try {
    const data = await api.post(`/expert/${selectedQuestion.value._id}/answer`, { content: answerContent.value })
    selectedQuestion.value = data
    answerContent.value = ''
    success('回答成功')
  } catch (e) {
    error(e.message || '回答失败')
  }
}

const acceptAnswer = async (answer) => {
  try {
    const data = await api.post(`/expert/${selectedQuestion.value._id}/answer/${answer._id}/accept`)
    selectedQuestion.value = data
    success('已采纳')
    fetchQuestions()
  } catch (e) {
    error('采纳失败')
  }
}

const likeAnswer = async (answer) => {
  if (!userStore.isLoggedIn) {
    error('请先登录')
    return
  }
  try {
    const data = await api.post(`/expert/${selectedQuestion.value._id}/answer/${answer._id}/like`)
    const idx = selectedQuestion.value.answers.findIndex(a => a._id === answer._id)
    if (idx > -1) {
      if (data.isLiked) {
        selectedQuestion.value.answers[idx].likes.push(userStore.user._id)
      } else {
        selectedQuestion.value.answers[idx].likes = selectedQuestion.value.answers[idx].likes.filter(id => id !== userStore.user._id)
      }
    }
  } catch (e) {
    error('操作失败')
  }
}

const changePage = (p) => {
  page.value = p
  fetchQuestions()
}

watch(activeTab, () => {
  page.value = 1
  fetchQuestions()
})

onMounted(fetchQuestions)
</script>

<style scoped>
.expert-page { max-width: 900px; margin: 0 auto; }
.tab-bar { display: flex; gap: 0; margin-bottom: 20px; border-bottom: 2px solid #e0e0e0; }
.tab-bar button { padding: 10px 24px; border: none; background: none; cursor: pointer; font-size: 0.95rem; color: #888; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.3s; }
.tab-bar button.active { color: #2c5f2d; border-bottom-color: #2c5f2d; font-weight: 500; }
.question-card { cursor: pointer; padding: 20px; }
.question-header { display: flex; gap: 8px; margin-bottom: 8px; }
.question-card h3 { color: #2c5f2d; margin-bottom: 8px; }
.question-preview { color: #666; font-size: 0.9rem; line-height: 1.5; margin-bottom: 12px; }
.question-meta { display: flex; gap: 16px; color: #999; font-size: 0.8rem; }
.status-badge { padding: 2px 8px; border-radius: 3px; font-size: 0.75rem; }
.status-badge.pending { background: #fff3cd; color: #856404; }
.status-badge.answered { background: #d4edda; color: #155724; }
.status-badge.closed { background: #d1ecf1; color: #0c5460; }
.category-badge { padding: 2px 8px; border-radius: 3px; font-size: 0.75rem; background: #e8f5e9; color: #2c5f2d; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
.modal { width: 100%; max-width: 600px; max-height: 85vh; overflow-y: auto; padding: 30px; position: relative; }
.detail-modal { max-width: 700px; }
.modal h3 { color: #2c5f2d; margin-bottom: 16px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; }
.modal-close { position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #888; }
.detail-header { display: flex; gap: 8px; margin-bottom: 12px; }
.detail-content { color: #555; line-height: 1.8; white-space: pre-wrap; margin: 16px 0; padding: 16px; background: #f9f9f9; border-radius: 6px; }
.detail-meta { color: #888; font-size: 0.85rem; display: flex; gap: 16px; margin-bottom: 24px; }
.answers-section { border-top: 1px solid #eee; padding-top: 20px; }
.answers-section h3 { color: #333; margin-bottom: 16px; }
.answer-card { background: #f9f9f9; border-radius: 8px; padding: 16px; margin-bottom: 12px; border-left: 3px solid #ddd; }
.answer-card.accepted { border-left-color: #2c5f2d; background: #f0f8f0; }
.answer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.expert-info { display: flex; align-items: center; gap: 8px; }
.expert-name { font-weight: 500; color: #333; }
.expert-badge { background: #2c5f2d; color: #fff; padding: 2px 6px; border-radius: 3px; font-size: 0.7rem; }
.accepted-badge { background: #d4edda; color: #155724; padding: 2px 8px; border-radius: 3px; font-size: 0.75rem; }
.answer-content { color: #555; line-height: 1.8; white-space: pre-wrap; }
.answer-actions { display: flex; align-items: center; gap: 12px; margin-top: 8px; }
.answer-date { color: #999; font-size: 0.8rem; margin-left: auto; }
.btn-like { background: none; border: none; cursor: pointer; font-size: 0.9rem; color: #888; }
.empty-answers { text-align: center; padding: 20px; color: #999; }
.answer-form { border-top: 1px solid #eee; padding-top: 16px; margin-top: 16px; }
.answer-form h4 { color: #2c5f2d; margin-bottom: 12px; }
.btn-sm { padding: 4px 12px; font-size: 0.8rem; }
</style>
