<template>
  <div v-if="herb">
    <button class="btn btn-secondary" @click="$router.back()" style="margin-bottom: 20px;">← 返回列表</button>
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
import api from '../utils/api'

const route = useRoute()
const herb = ref(null)

onMounted(async () => {
  try {
    herb.value = await api.get(`/herbs/${route.params.id}`)
  } catch (e) {
    console.error(e)
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
</style>
