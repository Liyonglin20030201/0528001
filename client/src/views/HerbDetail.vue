<template>
  <div v-if="herb">
    <div class="action-bar" style="margin-bottom: 20px; display: flex; gap: 12px;">
      <button class="btn btn-secondary" @click="$router.back()">← 返回列表</button>
      <button v-if="userStore.isLoggedIn" class="btn-learning" :class="{ active: learningStatus }" @click="toggleLearning">
        {{ learningStatus === 'completed' ? '✓ 已学完' : learningStatus === 'learning' ? '📖 学习中' : '📖 标记学习' }}
      </button>
    </div>
    <div class="detail-card">
      <div class="detail-header">
        <div class="detail-image" v-if="herb.image">
          <img :src="herb.image" :alt="herb.name" />
        </div>
        <div class="detail-placeholder" v-else>🌿</div>
        <div class="detail-info">
          <h1>{{ herb.name }}</h1>
          <p v-if="herb.alias" class="alias">别名：{{ herb.alias }}</p>
          <div class="props">
            <div><strong>性：</strong>{{ herb.nature }}</div>
            <div><strong>味：</strong>{{ herb.taste }}</div>
            <div><strong>归经：</strong>{{ herb.meridian }}</div>
            <div><strong>分类：</strong>{{ herb.category }}</div>
          </div>
        </div>
      </div>
      <div class="detail-section">
        <h3>功效</h3>
        <p>{{ herb.effect }}</p>
      </div>
      <div class="detail-section" v-if="herb.usage">
        <h3>用法用量</h3>
        <p>{{ herb.usage }}</p>
      </div>
      <div class="detail-section" v-if="herb.caution">
        <h3>使用禁忌</h3>
        <p class="caution">{{ herb.caution }}</p>
      </div>
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

const { error, success } = useMessage()
const route = useRoute()
const userStore = useUserStore()
const herb = ref(null)
const learningStatus = ref(null)

const toggleLearning = async () => {
  try {
    if (learningStatus.value) {
      await api.delete(`/learning/mark/herb/${route.params.id}`)
      learningStatus.value = null
      success('已取消标记')
    } else {
      await api.post('/learning/mark', { targetType: 'herb', targetId: route.params.id, status: 'learning' })
      learningStatus.value = 'learning'
      success('已标记为学习中')
    }
  } catch (e) {
    error('操作失败')
  }
}

onMounted(async () => {
  try {
    herb.value = await api.get(`/herbs/${route.params.id}`)
    if (userStore.isLoggedIn) {
      api.post('/recommend/browse', { targetType: 'herb', targetId: route.params.id }).catch(() => {})
      const progressData = await api.get('/learning/progress', { params: { targetType: 'herb' } })
      const found = progressData.progress.find(p => p.targetId === route.params.id)
      if (found) learningStatus.value = found.status
    }
  } catch (e) {
    error('获取药材详情失败，请返回重试')
  }
})
</script>

<style scoped>
.detail-card { background: #fff; border-radius: 12px; padding: 30px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.detail-header { display: flex; gap: 30px; margin-bottom: 24px; flex-wrap: wrap; }
.detail-image img { width: 250px; height: 200px; object-fit: cover; border-radius: 8px; }
.detail-placeholder { font-size: 6rem; width: 250px; text-align: center; }
.detail-info h1 { color: #2c5f2d; margin-bottom: 8px; }
.alias { color: #888; margin-bottom: 12px; }
.props { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.props div { color: #555; }
.detail-section { border-top: 1px solid #eee; padding-top: 16px; margin-top: 16px; }
.detail-section h3 { color: #2c5f2d; margin-bottom: 8px; }
.detail-section p { color: #555; line-height: 1.8; }
.caution { color: #c0392b; }
.btn-learning { background: none; border: 1px solid #ddd; padding: 4px 12px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; transition: all 0.3s; }
.btn-learning.active { background: #d4edda; border-color: #28a745; color: #155724; }
</style>
