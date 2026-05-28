<template>
  <div class="learning-page">
    <h1 class="page-title">学习中心</h1>

    <div v-if="!userStore.isLoggedIn" class="empty">
      <p>请先登录，开始您的中医药学习之旅</p>
      <button class="btn btn-primary" @click="$router.push('/login')">去登录</button>
    </div>

    <template v-else>
      <div class="stats-bar">
        <div class="stat-item">
          <span class="stat-number">{{ stats.totalCompleted }}</span>
          <span class="stat-label">已学完</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ stats.totalLearning }}</span>
          <span class="stat-label">学习中</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ streak }}</span>
          <span class="stat-label">连续打卡</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ totalCheckinDays }}</span>
          <span class="stat-label">累计打卡</span>
        </div>
      </div>

      <div class="checkin-section card">
        <div class="checkin-header">
          <h3>每日打卡</h3>
          <span v-if="todayChecked" class="checked-badge">今日已打卡</span>
        </div>
        <div v-if="!todayChecked" class="checkin-form">
          <input v-model="checkinNote" placeholder="记录今日学习心得（选填）" />
          <button class="btn btn-primary" @click="doCheckin">打卡</button>
        </div>
        <div class="checkin-calendar">
          <div class="calendar-header">
            <button @click="changeMonth(-1)">&lt;</button>
            <span>{{ currentMonth }}</span>
            <button @click="changeMonth(1)">&gt;</button>
          </div>
          <div class="calendar-grid">
            <span v-for="day in ['日','一','二','三','四','五','六']" :key="day" class="calendar-weekday">{{ day }}</span>
            <span v-for="d in calendarDays" :key="d.date" class="calendar-day" :class="{ checked: d.checked, today: d.isToday, empty: !d.date }">
              {{ d.day }}
            </span>
          </div>
        </div>
      </div>

      <div class="tab-bar">
        <button :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">全部</button>
        <button :class="{ active: activeTab === 'article' }" @click="activeTab = 'article'">文章</button>
        <button :class="{ active: activeTab === 'herb' }" @click="activeTab = 'herb'">药材</button>
        <button :class="{ active: activeTab === 'prescription' }" @click="activeTab = 'prescription'">方剂</button>
      </div>

      <div v-if="filteredProgress.length" class="progress-list">
        <div v-for="item in filteredProgress" :key="item._id" class="card progress-card">
          <div class="progress-info" @click="goToDetail(item)">
            <span class="type-badge" :class="item.targetType">{{ typeLabel(item.targetType) }}</span>
            <h4>{{ getItemTitle(item) }}</h4>
          </div>
          <div class="progress-actions">
            <span class="status-badge" :class="item.status">{{ item.status === 'completed' ? '已学完' : '学习中' }}</span>
            <button v-if="item.status === 'learning'" class="btn btn-primary btn-sm" @click="markCompleted(item)">标记完成</button>
            <button class="btn btn-danger btn-sm" @click="removeProgress(item)">移除</button>
          </div>
        </div>
      </div>
      <div v-else class="empty">
        <p>还没有学习记录，去浏览文章或药材时可以标记为"正在学习"</p>
      </div>

      <div v-if="loading" class="loading">加载中...</div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import api from '../utils/api'
import { useMessage } from '../composables/useMessage'

const { success, error } = useMessage()
const userStore = useUserStore()
const router = useRouter()

const loading = ref(false)
const activeTab = ref('all')
const progress = ref([])
const stats = ref({ totalCompleted: 0, totalLearning: 0, totalArticles: 0, totalHerbs: 0, completedArticles: 0, completedHerbs: 0 })
const checkins = ref([])
const streak = ref(0)
const totalCheckinDays = ref(0)
const todayChecked = ref(false)
const checkinNote = ref('')
const calendarMonth = ref(new Date())

const currentMonth = computed(() => {
  const y = calendarMonth.value.getFullYear()
  const m = calendarMonth.value.getMonth() + 1
  return `${y}年${m}月`
})

const calendarDays = computed(() => {
  const year = calendarMonth.value.getFullYear()
  const month = calendarMonth.value.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date().toISOString().split('T')[0]

  const days = []
  for (let i = 0; i < firstDay; i++) {
    days.push({ date: '', day: '', checked: false, isToday: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    days.push({
      date: dateStr,
      day: d,
      checked: checkins.value.some(c => c.date === dateStr),
      isToday: dateStr === today
    })
  }
  return days
})

const filteredProgress = computed(() => {
  if (activeTab.value === 'all') return progress.value
  return progress.value.filter(p => p.targetType === activeTab.value)
})

const typeLabel = (type) => ({ article: '文章', herb: '药材', prescription: '方剂' }[type] || type)

const getItemTitle = (item) => {
  if (!item.target) return '内容已删除'
  if (item.targetType === 'article') return item.target.title
  if (item.targetType === 'herb') return item.target.name
  if (item.targetType === 'prescription') return item.target.name
  return ''
}

const goToDetail = (item) => {
  if (item.targetType === 'article') router.push(`/articles/${item.targetId}`)
  else if (item.targetType === 'herb') router.push(`/herbs/${item.targetId}`)
  else if (item.targetType === 'prescription') router.push(`/prescriptions`)
}

const changeMonth = (delta) => {
  const d = new Date(calendarMonth.value)
  d.setMonth(d.getMonth() + delta)
  calendarMonth.value = d
  fetchCheckins()
}

const fetchProgress = async () => {
  loading.value = true
  try {
    const data = await api.get('/learning/progress')
    progress.value = data.progress
    stats.value = data.stats
  } catch (e) {
    error('获取学习进度失败')
  } finally {
    loading.value = false
  }
}

const fetchCheckins = async () => {
  try {
    const month = `${calendarMonth.value.getFullYear()}-${String(calendarMonth.value.getMonth() + 1).padStart(2, '0')}`
    const data = await api.get('/learning/checkin', { params: { month } })
    checkins.value = data.checkins
    streak.value = data.streak
    totalCheckinDays.value = data.totalDays
    const today = new Date().toISOString().split('T')[0]
    todayChecked.value = data.checkins.some(c => c.date === today)
  } catch (e) {
    error('获取打卡记录失败')
  }
}

const doCheckin = async () => {
  try {
    const data = await api.post('/learning/checkin', { note: checkinNote.value })
    streak.value = data.streak
    todayChecked.value = true
    checkinNote.value = ''
    success('打卡成功！')
    fetchCheckins()
  } catch (e) {
    error(e.message || '打卡失败')
  }
}

const markCompleted = async (item) => {
  try {
    await api.post('/learning/mark', { targetType: item.targetType, targetId: item.targetId, status: 'completed' })
    success('已标记为学完')
    fetchProgress()
  } catch (e) {
    error('操作失败')
  }
}

const removeProgress = async (item) => {
  try {
    await api.delete(`/learning/mark/${item.targetType}/${item.targetId}`)
    success('已移除')
    fetchProgress()
  } catch (e) {
    error('操作失败')
  }
}

onMounted(() => {
  if (userStore.isLoggedIn) {
    fetchProgress()
    fetchCheckins()
  }
})
</script>

<style scoped>
.learning-page { max-width: 900px; margin: 0 auto; }
.stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-item { background: #fff; border-radius: 8px; padding: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
.stat-number { display: block; font-size: 1.8rem; font-weight: bold; color: #2c5f2d; }
.stat-label { color: #888; font-size: 0.85rem; }
.checkin-section { padding: 24px; margin-bottom: 24px; }
.checkin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.checkin-header h3 { color: #2c5f2d; }
.checked-badge { background: #d4edda; color: #155724; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; }
.checkin-form { display: flex; gap: 12px; margin-bottom: 20px; }
.checkin-form input { flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
.calendar-header { display: flex; justify-content: center; align-items: center; gap: 16px; margin-bottom: 12px; }
.calendar-header button { background: none; border: none; cursor: pointer; font-size: 1.1rem; color: #2c5f2d; padding: 4px 8px; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; }
.calendar-weekday { font-size: 0.8rem; color: #888; padding: 4px; }
.calendar-day { width: 32px; height: 32px; line-height: 32px; margin: 0 auto; border-radius: 50%; font-size: 0.85rem; }
.calendar-day.checked { background: #2c5f2d; color: #fff; }
.calendar-day.today { border: 2px solid #4a8c5c; }
.calendar-day.empty { visibility: hidden; }
.tab-bar { display: flex; gap: 0; margin-bottom: 20px; border-bottom: 2px solid #e0e0e0; }
.tab-bar button { padding: 10px 24px; border: none; background: none; cursor: pointer; font-size: 0.95rem; color: #888; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.3s; }
.tab-bar button.active { color: #2c5f2d; border-bottom-color: #2c5f2d; font-weight: 500; }
.progress-card { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; }
.progress-info { cursor: pointer; flex: 1; display: flex; align-items: center; gap: 12px; }
.progress-info h4 { color: #333; }
.type-badge { padding: 2px 8px; border-radius: 3px; font-size: 0.75rem; color: #fff; }
.type-badge.article { background: #4a8c5c; }
.type-badge.herb { background: #8c6d4a; }
.type-badge.prescription { background: #4a6d8c; }
.progress-actions { display: flex; align-items: center; gap: 8px; }
.status-badge { font-size: 0.8rem; padding: 2px 8px; border-radius: 3px; }
.status-badge.completed { background: #d4edda; color: #155724; }
.status-badge.learning { background: #fff3cd; color: #856404; }
.btn-sm { padding: 4px 12px; font-size: 0.8rem; }
</style>
