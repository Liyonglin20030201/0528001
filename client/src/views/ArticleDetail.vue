<template>
  <div v-if="article">
    <button class="btn btn-secondary" @click="$router.back()" style="margin-bottom: 20px;">← 返回列表</button>
    <div class="article-detail">
      <h1>{{ article.title }}</h1>
      <div class="article-meta">
        <span class="tag">{{ getCategoryLabel(article.category) }}</span>
        <span>作者：{{ article.author?.username || '管理员' }}</span>
        <span>阅读：{{ article.viewCount }}</span>
        <span>{{ formatDate(article.createdAt) }}</span>
        <button v-if="userStore.isLoggedIn" class="btn-favorite" :class="{ active: isFavorited }" @click="handleFavorite">
          {{ isFavorited ? '★ 已收藏' : '☆ 收藏' }}
        </button>
        <button v-if="userStore.isLoggedIn" class="btn-learning" :class="{ active: learningStatus }" @click="toggleLearning">
          {{ learningStatus === 'completed' ? '✓ 已学完' : learningStatus === 'learning' ? '📖 学习中' : '📖 标记学习' }}
        </button>
      </div>
      <div class="article-content" v-html="renderContent(article.content)"></div>
      <CommentSection :articleId="route.params.id" />
    </div>
  </div>
  <div v-else class="loading">加载中...</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import api from '../utils/api'
import { useMessage } from '../composables/useMessage'
import CommentSection from '../components/CommentSection.vue'

const { error, success } = useMessage()
const route = useRoute()
const userStore = useUserStore()
const article = ref(null)
const isFavorited = ref(false)
const learningStatus = ref(null)

const categoryLabels = {
  spring: '春季养生', summer: '夏季养生', autumn: '秋季养生', winter: '冬季养生',
  qi_deficiency: '气虚体质', yang_deficiency: '阳虚体质', yin_deficiency: '阴虚体质',
  phlegm_dampness: '痰湿体质', blood_stasis: '血瘀体质', general: '综合'
}

const getCategoryLabel = (cat) => categoryLabels[cat] || cat
const formatDate = (date) => new Date(date).toLocaleDateString('zh-CN')

const renderContent = (content) => {
  return content
    .replace(/## (.+)/g, '<h2>$1</h2>')
    .replace(/### (.+)/g, '<h3>$1</h3>')
    .replace(/\n- (.+)/g, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
}

const handleFavorite = async () => {
  try {
    const data = await userStore.toggleFavorite(article.value._id)
    isFavorited.value = data.isFavorited
  } catch (e) {
    error('收藏操作失败，请稍后重试')
  }
}

const toggleLearning = async () => {
  try {
    if (learningStatus.value) {
      await api.delete(`/learning/mark/article/${route.params.id}`)
      learningStatus.value = null
      success('已取消标记')
    } else {
      await api.post('/learning/mark', { targetType: 'article', targetId: route.params.id, status: 'learning' })
      learningStatus.value = 'learning'
      success('已标记为学习中')
    }
  } catch (e) {
    error('操作失败')
  }
}

onMounted(async () => {
  try {
    article.value = await api.get(`/articles/${route.params.id}`)
    if (userStore.isLoggedIn) {
      const favorites = await userStore.getFavorites()
      isFavorited.value = favorites.some(f => f._id === route.params.id)
      api.post('/recommend/browse', { targetType: 'article', targetId: route.params.id }).catch(() => {})
      const progressData = await api.get('/learning/progress', { params: { targetType: 'article' } })
      const found = progressData.progress.find(p => p.targetId === route.params.id)
      if (found) learningStatus.value = found.status
    }
  } catch (e) {
    error('获取文章详情失败，请返回重试')
  }
})
</script>

<style scoped>
.article-detail { background: #fff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.article-detail h1 { color: #2c5f2d; margin-bottom: 16px; }
.article-meta { display: flex; gap: 16px; align-items: center; color: #888; font-size: 0.85rem; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #eee; flex-wrap: wrap; }
.article-content { line-height: 2; color: #444; }
.article-content :deep(h2) { color: #2c5f2d; margin: 24px 0 12px; font-size: 1.3rem; }
.article-content :deep(h3) { color: #3d7c3f; margin: 16px 0 8px; }
.article-content :deep(ul) { padding-left: 20px; margin: 8px 0; }
.article-content :deep(li) { margin: 4px 0; }
.btn-favorite { background: none; border: 1px solid #ddd; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; transition: all 0.3s; }
.btn-favorite.active { background: #fff3cd; border-color: #ffc107; color: #856404; }
.btn-learning { background: none; border: 1px solid #ddd; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; transition: all 0.3s; }
.btn-learning.active { background: #d4edda; border-color: #28a745; color: #155724; }
</style>
