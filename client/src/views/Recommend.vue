<template>
  <div class="recommend-page">
    <h1 class="page-title">个性化推荐</h1>

    <div v-if="!userStore.isLoggedIn" class="empty">
      <p>请先登录，获取为您定制的中医药学习推荐</p>
      <button class="btn btn-primary" @click="$router.push('/login')">去登录</button>
    </div>

    <template v-else>
      <div v-if="constitution" class="constitution-banner card">
        <div class="banner-content">
          <h3>您的体质类型：{{ getTypeName(constitution.primaryType) }}</h3>
          <p>测试时间：{{ formatDate(constitution.testDate) }}</p>
        </div>
        <button class="btn btn-secondary" @click="$router.push('/constitution')">重新测试</button>
      </div>
      <div v-else class="constitution-banner card">
        <div class="banner-content">
          <h3>尚未进行体质测试</h3>
          <p>完成体质自测后，系统将为您推荐更精准的内容</p>
        </div>
        <button class="btn btn-primary" @click="$router.push('/constitution')">去测试</button>
      </div>

      <section v-if="recommendedArticles.length" class="recommend-section">
        <h2>为您推荐的文章</h2>
        <div class="grid">
          <div v-for="article in recommendedArticles" :key="article._id" class="card item-card" @click="$router.push(`/articles/${article._id}`)">
            <h4>{{ article.title }}</h4>
            <p>{{ article.summary }}</p>
            <span class="tag">{{ getCategoryLabel(article.category) }}</span>
          </div>
        </div>
      </section>

      <section v-if="recommendedHerbs.length" class="recommend-section">
        <h2>适合您的药材</h2>
        <div class="grid">
          <div v-for="herb in recommendedHerbs" :key="herb._id" class="card item-card" @click="$router.push(`/herbs/${herb._id}`)">
            <h4>{{ herb.name }}</h4>
            <p class="herb-info">{{ herb.nature }} | {{ herb.taste }}</p>
            <p>{{ herb.effect }}</p>
            <span class="tag">{{ herb.category }}</span>
          </div>
        </div>
      </section>

      <section v-if="historyBasedArticles.length" class="recommend-section">
        <h2>根据浏览记录推荐</h2>
        <div class="grid">
          <div v-for="article in historyBasedArticles" :key="article._id" class="card item-card" @click="$router.push(`/articles/${article._id}`)">
            <h4>{{ article.title }}</h4>
            <p>{{ article.summary }}</p>
            <span class="tag">{{ getCategoryLabel(article.category) }}</span>
          </div>
        </div>
      </section>

      <section v-if="historyBasedHerbs.length" class="recommend-section">
        <h2>您可能感兴趣的药材</h2>
        <div class="grid">
          <div v-for="herb in historyBasedHerbs" :key="herb._id" class="card item-card" @click="$router.push(`/herbs/${herb._id}`)">
            <h4>{{ herb.name }}</h4>
            <p class="herb-info">{{ herb.nature }} | {{ herb.taste }}</p>
            <p>{{ herb.effect }}</p>
            <span class="tag">{{ herb.category }}</span>
          </div>
        </div>
      </section>

      <div v-if="loading" class="loading">加载中...</div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import api from '../utils/api'
import { useMessage } from '../composables/useMessage'

const { error } = useMessage()
const userStore = useUserStore()

const loading = ref(false)
const constitution = ref(null)
const recommendedArticles = ref([])
const recommendedHerbs = ref([])
const historyBasedArticles = ref([])
const historyBasedHerbs = ref([])

const typeNames = {
  balanced: '平和质', qi_deficiency: '气虚质', yang_deficiency: '阳虚质',
  yin_deficiency: '阴虚质', phlegm_dampness: '痰湿质', damp_heat: '湿热质',
  blood_stasis: '血瘀质', qi_stagnation: '气郁质', special: '特禀质'
}

const categoryLabels = {
  spring: '春季养生', summer: '夏季养生', autumn: '秋季养生', winter: '冬季养生',
  qi_deficiency: '气虚体质', yang_deficiency: '阳虚体质', yin_deficiency: '阴虚体质',
  phlegm_dampness: '痰湿体质', blood_stasis: '血瘀体质', general: '综合'
}

const getTypeName = (type) => typeNames[type] || type
const getCategoryLabel = (cat) => categoryLabels[cat] || cat
const formatDate = (date) => new Date(date).toLocaleDateString('zh-CN')

const fetchRecommendations = async () => {
  if (!userStore.isLoggedIn) return
  loading.value = true
  try {
    const data = await api.get('/recommend/personal')
    constitution.value = data.constitution
    recommendedArticles.value = data.recommendedArticles
    recommendedHerbs.value = data.recommendedHerbs
    historyBasedArticles.value = data.historyBasedArticles
    historyBasedHerbs.value = data.historyBasedHerbs
  } catch (e) {
    error('获取推荐内容失败')
  } finally {
    loading.value = false
  }
}

onMounted(fetchRecommendations)
</script>

<style scoped>
.recommend-page { max-width: 1000px; margin: 0 auto; }
.constitution-banner { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; margin-bottom: 30px; }
.banner-content h3 { color: #2c5f2d; margin-bottom: 4px; }
.banner-content p { color: #666; font-size: 0.9rem; }
.recommend-section { margin-bottom: 36px; }
.recommend-section h2 { font-size: 1.3rem; color: #2c5f2d; margin-bottom: 16px; padding-left: 12px; border-left: 3px solid #4a8c5c; }
.item-card { cursor: pointer; padding: 16px; }
.item-card h4 { color: #2c5f2d; margin-bottom: 8px; }
.item-card p { color: #666; font-size: 0.9rem; line-height: 1.5; margin-bottom: 8px; }
.herb-info { color: #888; font-size: 0.85rem; }
</style>
