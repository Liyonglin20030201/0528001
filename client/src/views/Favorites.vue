<template>
  <div>
    <h1 class="page-title">我的收藏</h1>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="favorites.length === 0" class="empty">
      <p>暂无收藏文章</p>
      <router-link to="/articles" class="btn btn-primary" style="margin-top: 16px;">去浏览文章</router-link>
    </div>
    <div v-else class="article-list">
      <div class="card article-item" v-for="article in favorites" :key="article._id" @click="$router.push(`/articles/${article._id}`)">
        <h3>{{ article.title }}</h3>
        <p class="summary">{{ article.summary }}</p>
        <div class="meta">
          <span class="tag">{{ getCategoryLabel(article.category) }}</span>
          <span>{{ formatDate(article.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { useMessage } from '../composables/useMessage'

const { error } = useMessage()
const userStore = useUserStore()
const favorites = ref([])
const loading = ref(false)

const categoryLabels = {
  spring: '春季养生', summer: '夏季养生', autumn: '秋季养生', winter: '冬季养生',
  qi_deficiency: '气虚体质', yang_deficiency: '阳虚体质', yin_deficiency: '阴虚体质',
  phlegm_dampness: '痰湿体质', blood_stasis: '血瘀体质', general: '综合'
}

const getCategoryLabel = (cat) => categoryLabels[cat] || cat
const formatDate = (date) => new Date(date).toLocaleDateString('zh-CN')

onMounted(async () => {
  loading.value = true
  try {
    favorites.value = await userStore.getFavorites()
  } catch (e) {
    error('获取收藏列表失败，请刷新重试')
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.article-item { cursor: pointer; }
.article-item h3 { color: #2c5f2d; margin-bottom: 8px; }
.summary { color: #666; font-size: 0.9rem; margin-bottom: 12px; }
.meta { display: flex; gap: 16px; color: #999; font-size: 0.8rem; align-items: center; }
</style>
