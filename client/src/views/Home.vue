<template>
  <div class="home">
    <section class="hero">
      <h1>中医药文化科普</h1>
      <p>传承千年智慧，守护全民健康</p>
    </section>

    <section class="features">
      <div class="feature-card" @click="$router.push('/herbs')">
        <div class="feature-icon">🌿</div>
        <h3>药材百科</h3>
        <p>了解常见中草药的性味归经与功效</p>
      </div>
      <div class="feature-card" @click="$router.push('/articles')">
        <div class="feature-icon">📖</div>
        <h3>养生文章</h3>
        <p>按季节和体质获取科普养生知识</p>
      </div>
      <div class="feature-card" @click="$router.push('/prescriptions')">
        <div class="feature-icon">📜</div>
        <h3>方剂查询</h3>
        <p>查询经典方剂，了解组成与主治</p>
      </div>
      <div class="feature-card" @click="$router.push('/constitution')">
        <div class="feature-icon">🔍</div>
        <h3>体质自测</h3>
        <p>测测您的中医体质，获取养生建议</p>
      </div>
      <div class="feature-card" @click="$router.push('/recommend')">
        <div class="feature-icon">🎯</div>
        <h3>个性推荐</h3>
        <p>根据体质和浏览记录，智能推荐药材文章</p>
      </div>
      <div class="feature-card" @click="$router.push('/learning')">
        <div class="feature-icon">📚</div>
        <h3>学习中心</h3>
        <p>追踪学习进度，每日打卡坚持学习</p>
      </div>
      <div class="feature-card" @click="$router.push('/expert-qa')">
        <div class="feature-icon">👨‍⚕️</div>
        <h3>专家问答</h3>
        <p>认证中医师在线答疑，专业指导</p>
      </div>
      <div class="feature-card" @click="$router.push('/community')">
        <div class="feature-icon">💬</div>
        <h3>养生社区</h3>
        <p>分享养生心得，交流健康经验</p>
      </div>
      <div class="feature-card" @click="$router.push('/masters')">
        <div class="feature-icon">🏆</div>
        <h3>名家故事</h3>
        <p>走近古代中医名家的传奇人生</p>
      </div>
    </section>

    <section class="latest-articles" v-if="articles.length">
      <h2 class="page-title">最新文章</h2>
      <div class="grid">
        <div class="card" v-for="article in articles" :key="article._id" @click="$router.push(`/articles/${article._id}`)">
          <h3>{{ article.title }}</h3>
          <p class="article-summary">{{ article.summary }}</p>
          <div class="article-meta">
            <span class="tag">{{ getCategoryLabel(article.category) }}</span>
            <span>{{ formatDate(article.createdAt) }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils/api'
import { useMessage } from '../composables/useMessage'

const { error } = useMessage()
const articles = ref([])

const categoryLabels = {
  spring: '春季养生', summer: '夏季养生', autumn: '秋季养生', winter: '冬季养生',
  qi_deficiency: '气虚体质', yang_deficiency: '阳虚体质', yin_deficiency: '阴虚体质',
  phlegm_dampness: '痰湿体质', blood_stasis: '血瘀体质', general: '综合'
}

const getCategoryLabel = (cat) => categoryLabels[cat] || cat
const formatDate = (date) => new Date(date).toLocaleDateString('zh-CN')

onMounted(async () => {
  try {
    const data = await api.get('/articles?limit=6')
    articles.value = data.articles
  } catch (e) {
    error('加载文章失败，请刷新页面重试')
  }
})
</script>

<style scoped>
.hero {
  text-align: center;
  padding: 80px 20px;
  background: linear-gradient(135deg, #2c5f2d, #97bc62);
  border-radius: 12px;
  color: #fff;
  margin-bottom: 40px;
}
.hero h1 { font-size: 2.5rem; margin-bottom: 12px; letter-spacing: 4px; }
.hero p { font-size: 1.2rem; opacity: 0.9; }
.features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-bottom: 50px; }
.feature-card {
  background: #fff; border-radius: 12px; padding: 30px; text-align: center;
  cursor: pointer; transition: all 0.3s; box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.feature-card:hover { transform: translateY(-4px); box-shadow: 0 8px 25px rgba(0,0,0,0.12); }
.feature-icon { font-size: 2.5rem; margin-bottom: 12px; }
.feature-card h3 { color: #2c5f2d; margin-bottom: 8px; }
.feature-card p { color: #666; font-size: 0.9rem; }
.article-summary { color: #666; margin: 8px 0; font-size: 0.9rem; line-height: 1.5; }
.article-meta { display: flex; justify-content: space-between; align-items: center; color: #999; font-size: 0.8rem; margin-top: 12px; }
.card { cursor: pointer; }
</style>
