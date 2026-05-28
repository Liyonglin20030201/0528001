<template>
  <div v-if="master">
    <button class="btn btn-secondary" @click="$router.back()" style="margin-bottom: 20px;">← 返回列表</button>
    <div class="master-detail">
      <div class="detail-header">
        <div class="portrait" v-if="master.portrait">
          <img :src="master.portrait" :alt="master.name" />
        </div>
        <div class="portrait-placeholder" v-else>👨‍⚕️</div>
        <div class="header-info">
          <h1>{{ master.name }}</h1>
          <p class="dynasty"><span class="tag">{{ master.dynasty }}</span></p>
          <p class="contribution">{{ master.contribution }}</p>
        </div>
      </div>
      <div class="detail-section">
        <h3>生平简介</h3>
        <p>{{ master.biography }}</p>
      </div>
      <div class="detail-section" v-if="master.stories && master.stories.length">
        <h3>经典故事</h3>
        <div class="story" v-for="(story, index) in master.stories" :key="index">
          <p>{{ story }}</p>
        </div>
      </div>
      <div class="detail-section" v-if="master.famousWorks && master.famousWorks.length">
        <h3>代表著作</h3>
        <ul>
          <li v-for="work in master.famousWorks" :key="work">{{ work }}</li>
        </ul>
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
const master = ref(null)

onMounted(async () => {
  try {
    master.value = await api.get(`/masters/${route.params.id}`)
  } catch (e) {
    console.error(e)
  }
})
</script>

<style scoped>
.master-detail { background: #fff; border-radius: 12px; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
.detail-header { display: flex; gap: 30px; margin-bottom: 24px; flex-wrap: wrap; }
.portrait img { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; }
.portrait-placeholder { font-size: 6rem; width: 150px; text-align: center; }
.header-info h1 { color: #2c5f2d; margin-bottom: 8px; }
.dynasty { margin-bottom: 8px; }
.contribution { color: #555; line-height: 1.6; }
.detail-section { border-top: 1px solid #eee; padding-top: 20px; margin-top: 20px; }
.detail-section h3 { color: #2c5f2d; margin-bottom: 12px; }
.detail-section p { color: #444; line-height: 1.8; }
.story { background: #f9f6f0; padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #4a8c5c; }
.story p { color: #555; }
ul { padding-left: 20px; }
li { color: #555; margin: 6px 0; }
</style>
