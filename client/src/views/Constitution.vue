<template>
  <div class="constitution-page">
    <h1 class="page-title">中医体质自测</h1>

    <div v-if="!started && !result" class="intro-section">
      <div class="card intro-card">
        <h2>了解您的体质类型</h2>
        <p>中医将人体体质分为九种基本类型：平和质、气虚质、阳虚质、阴虚质、痰湿质、湿热质、血瘀质、气郁质和特禀质。</p>
        <p>通过回答以下问卷，我们将帮助您判断自己的体质类型，并为您推荐适合的养生文章和药材。</p>
        <p class="note">本测试共 {{ questions.length }} 道题，每题从"没有"到"总是"五个程度选择，约需3分钟完成。</p>
        <button v-if="!userStore.isLoggedIn" class="btn btn-secondary" @click="$router.push('/login')">请先登录后开始测试</button>
        <button v-else class="btn btn-primary" @click="startTest">开始测试</button>
      </div>

      <div v-if="history.length" class="history-section">
        <h3>历史测试记录</h3>
        <div v-for="record in history" :key="record._id" class="card history-card">
          <span class="history-type">{{ getTypeName(record.primaryType) }}</span>
          <span class="history-date">{{ formatDate(record.createdAt) }}</span>
        </div>
      </div>
    </div>

    <div v-if="started && !result" class="test-section">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <p class="progress-text">第 {{ currentIndex + 1 }} / {{ questions.length }} 题</p>

      <div class="card question-card">
        <h3 class="question-text">{{ questions[currentIndex].text }}</h3>
        <div class="options">
          <label v-for="option in options" :key="option.value" class="option-item" :class="{ selected: answers[currentIndex] === option.value }">
            <input type="radio" :value="option.value" v-model="answers[currentIndex]" />
            <span class="option-label">{{ option.label }}</span>
          </label>
        </div>
      </div>

      <div class="nav-buttons">
        <button class="btn btn-secondary" :disabled="currentIndex === 0" @click="currentIndex--">上一题</button>
        <button v-if="currentIndex < questions.length - 1" class="btn btn-primary" :disabled="!answers[currentIndex]" @click="currentIndex++">下一题</button>
        <button v-else class="btn btn-primary" :disabled="!allAnswered" @click="submitTest">提交测试</button>
      </div>
    </div>

    <div v-if="result" class="result-section">
      <div class="card result-card">
        <h2>您的体质类型：{{ result.typeInfo.name }}</h2>
        <p class="type-desc">{{ result.typeInfo.description }}</p>

        <div class="score-chart">
          <h3>各体质得分</h3>
          <div v-for="item in result.scores.filter(s => s.score > 0)" :key="item.type" class="score-item">
            <span class="score-label">{{ getTypeName(item.type) }}</span>
            <div class="score-bar-bg">
              <div class="score-bar-fill" :style="{ width: item.score + '%' }" :class="{ primary: item.type === result.primaryType }"></div>
            </div>
            <span class="score-value">{{ item.score }}%</span>
          </div>
        </div>

        <div class="recommendations">
          <h3>养生建议</h3>
          <div class="rec-grid">
            <div class="rec-item">
              <h4>推荐药材</h4>
              <ul>
                <li v-for="herb in result.typeInfo.recommendations.herbs" :key="herb">{{ herb }}</li>
              </ul>
            </div>
            <div class="rec-item">
              <h4>饮食建议</h4>
              <p>{{ result.typeInfo.recommendations.diet }}</p>
            </div>
            <div class="rec-item">
              <h4>运动建议</h4>
              <p>{{ result.typeInfo.recommendations.exercise }}</p>
            </div>
          </div>
        </div>

        <div v-if="result.recommendedHerbs.length" class="rec-herbs">
          <h3>推荐药材详情</h3>
          <div class="grid">
            <router-link v-for="herb in result.recommendedHerbs" :key="herb._id" :to="`/herbs/${herb._id}`" class="card herb-card">
              <h4>{{ herb.name }}</h4>
              <p class="herb-info">{{ herb.nature }} / {{ herb.taste }}</p>
              <p class="herb-effect">{{ herb.effect }}</p>
            </router-link>
          </div>
        </div>

        <div v-if="result.recommendedArticles.length" class="rec-articles">
          <h3>推荐文章</h3>
          <div v-for="article in result.recommendedArticles" :key="article._id" class="card article-rec-card">
            <router-link :to="`/articles/${article._id}`">
              <h4>{{ article.title }}</h4>
              <p>{{ article.summary }}</p>
            </router-link>
          </div>
        </div>
      </div>

      <button class="btn btn-primary" @click="resetTest">重新测试</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import api from '../utils/api'
import { useMessage } from '../composables/useMessage'

const { error } = useMessage()
const userStore = useUserStore()

const questions = ref([])
const types = ref({})
const started = ref(false)
const currentIndex = ref(0)
const answers = ref([])
const result = ref(null)
const history = ref([])

const options = [
  { label: '没有', value: 1 },
  { label: '很少', value: 2 },
  { label: '有时', value: 3 },
  { label: '经常', value: 4 },
  { label: '总是', value: 5 }
]

const progressPercent = computed(() => ((currentIndex.value + 1) / questions.value.length) * 100)
const allAnswered = computed(() => answers.value.every(a => a !== null))

const getTypeName = (type) => types.value[type]?.name || type
const formatDate = (date) => new Date(date).toLocaleDateString('zh-CN')

const startTest = () => {
  answers.value = new Array(questions.value.length).fill(null)
  currentIndex.value = 0
  result.value = null
  started.value = true
}

const resetTest = () => {
  started.value = false
  result.value = null
  currentIndex.value = 0
}

const submitTest = async () => {
  try {
    const payload = answers.value.map((score, index) => ({
      questionId: questions.value[index].id,
      score
    }))
    result.value = await api.post('/constitution/submit', { answers: payload })
    started.value = false
  } catch (e) {
    error('提交失败，请重试')
  }
}

onMounted(async () => {
  try {
    const data = await api.get('/constitution/questions')
    questions.value = data.questions
    types.value = data.types
    if (userStore.isLoggedIn) {
      history.value = await api.get('/constitution/history')
    }
  } catch (e) {
    error('加载题目失败')
  }
})
</script>

<style scoped>
.constitution-page { max-width: 800px; margin: 0 auto; }
.intro-card { text-align: center; padding: 40px; }
.intro-card h2 { color: #2c5f2d; margin-bottom: 16px; }
.intro-card p { color: #555; margin-bottom: 12px; line-height: 1.8; }
.intro-card .note { color: #888; font-size: 0.9rem; margin-top: 16px; margin-bottom: 24px; }
.history-section { margin-top: 30px; }
.history-section h3 { color: #2c5f2d; margin-bottom: 12px; }
.history-card { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; }
.history-type { font-weight: 500; color: #2c5f2d; }
.history-date { color: #888; font-size: 0.85rem; }
.progress-bar { height: 6px; background: #e0e0e0; border-radius: 3px; margin-bottom: 8px; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #4a8c5c, #2c5f2d); border-radius: 3px; transition: width 0.3s; }
.progress-text { text-align: center; color: #888; font-size: 0.85rem; margin-bottom: 20px; }
.question-card { padding: 30px; }
.question-text { color: #333; margin-bottom: 24px; font-size: 1.1rem; }
.options { display: flex; flex-direction: column; gap: 12px; }
.option-item { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border: 1px solid #e0e0e0; border-radius: 8px; cursor: pointer; transition: all 0.3s; }
.option-item:hover { border-color: #4a8c5c; background: #f9fdf9; }
.option-item.selected { border-color: #2c5f2d; background: #e8f5e9; }
.option-item input { display: none; }
.option-label { font-size: 0.95rem; }
.nav-buttons { display: flex; justify-content: space-between; margin-top: 24px; }
.result-card { padding: 30px; }
.result-card h2 { color: #2c5f2d; text-align: center; margin-bottom: 8px; }
.type-desc { text-align: center; color: #666; margin-bottom: 30px; }
.score-chart { margin-bottom: 30px; }
.score-chart h3, .recommendations h3, .rec-herbs h3, .rec-articles h3 { color: #2c5f2d; margin-bottom: 16px; border-bottom: 1px solid #e8f5e9; padding-bottom: 8px; }
.score-item { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.score-label { width: 70px; font-size: 0.85rem; color: #555; text-align: right; }
.score-bar-bg { flex: 1; height: 12px; background: #f0f0f0; border-radius: 6px; overflow: hidden; }
.score-bar-fill { height: 100%; background: #a5d6a7; border-radius: 6px; transition: width 0.5s; }
.score-bar-fill.primary { background: linear-gradient(90deg, #4a8c5c, #2c5f2d); }
.score-value { width: 40px; font-size: 0.85rem; color: #888; }
.rec-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
.rec-item { background: #f9fdf9; padding: 16px; border-radius: 8px; }
.rec-item h4 { color: #2c5f2d; margin-bottom: 8px; }
.rec-item ul { padding-left: 16px; }
.rec-item li { margin: 4px 0; color: #555; }
.rec-item p { color: #555; line-height: 1.6; }
.rec-herbs, .rec-articles { margin-top: 24px; }
.herb-card { text-decoration: none; display: block; }
.herb-card h4 { color: #2c5f2d; margin-bottom: 4px; }
.herb-info { color: #888; font-size: 0.85rem; margin-bottom: 4px; }
.herb-effect { color: #555; font-size: 0.9rem; }
.article-rec-card a { text-decoration: none; }
.article-rec-card h4 { color: #2c5f2d; margin-bottom: 4px; }
.article-rec-card p { color: #666; font-size: 0.9rem; }
.result-section > .btn { display: block; margin: 20px auto 0; }
</style>
