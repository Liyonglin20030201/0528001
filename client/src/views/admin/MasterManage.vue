<template>
  <div>
    <div class="admin-header">
      <h1 class="page-title">名家管理</h1>
      <button class="btn btn-primary" @click="showForm = true; resetForm()">添加名家</button>
    </div>

    <div v-if="showForm" class="form-modal">
      <div class="form-card">
        <h2>{{ editingId ? '编辑名家' : '添加名家' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-row">
            <div class="form-group">
              <label>姓名</label>
              <input v-model="form.name" required />
            </div>
            <div class="form-group">
              <label>朝代</label>
              <input v-model="form.dynasty" required placeholder="如：唐代、明代" />
            </div>
          </div>
          <div class="form-group">
            <label>主要贡献</label>
            <input v-model="form.contribution" />
          </div>
          <div class="form-group">
            <label>生平简介</label>
            <textarea v-model="form.biography" rows="6" required></textarea>
          </div>
          <div class="form-group">
            <label>经典故事（每行一个故事）</label>
            <textarea v-model="storiesText" rows="4" placeholder="每行输入一个故事"></textarea>
          </div>
          <div class="form-group">
            <label>代表著作（每行一部）</label>
            <textarea v-model="worksText" rows="3" placeholder="每行输入一部著作"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">{{ editingId ? '更新' : '添加' }}</button>
            <button type="button" class="btn btn-secondary" @click="showForm = false">取消</button>
          </div>
        </form>
      </div>
    </div>

    <div class="article-list">
      <div class="card list-item" v-for="master in masters" :key="master._id">
        <div class="item-info">
          <h3>{{ master.name }}</h3>
          <span class="tag">{{ master.dynasty }}</span>
        </div>
        <div class="item-actions">
          <button class="btn btn-primary" @click="editMaster(master)">编辑</button>
          <button class="btn btn-danger" @click="deleteMaster(master._id)">删除</button>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="page <= 1" @click="page--; fetchMasters()">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; fetchMasters()">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../utils/api'

const masters = ref([])
const page = ref(1)
const totalPages = ref(1)
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ name: '', dynasty: '', biography: '', contribution: '' })
const storiesText = ref('')
const worksText = ref('')

const resetForm = () => {
  editingId.value = null
  form.value = { name: '', dynasty: '', biography: '', contribution: '' }
  storiesText.value = ''
  worksText.value = ''
}

const fetchMasters = async () => {
  try {
    const data = await api.get('/masters', { params: { page: page.value, limit: 10 } })
    masters.value = data.masters
    totalPages.value = data.pages
  } catch (e) {
    console.error(e)
  }
}

const handleSubmit = async () => {
  try {
    const payload = {
      ...form.value,
      stories: storiesText.value.split('\n').filter(s => s.trim()),
      famousWorks: worksText.value.split('\n').filter(s => s.trim())
    }
    if (editingId.value) {
      await api.put(`/masters/${editingId.value}`, payload)
    } else {
      await api.post('/masters', payload)
    }
    showForm.value = false
    fetchMasters()
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

const editMaster = async (master) => {
  const full = await api.get(`/masters/${master._id}`)
  editingId.value = master._id
  form.value = { name: full.name, dynasty: full.dynasty, biography: full.biography, contribution: full.contribution }
  storiesText.value = (full.stories || []).join('\n')
  worksText.value = (full.famousWorks || []).join('\n')
  showForm.value = true
}

const deleteMaster = async (id) => {
  if (!confirm('确认删除此名家？')) return
  try {
    await api.delete(`/masters/${id}`)
    fetchMasters()
  } catch (e) {
    alert('删除失败')
  }
}

onMounted(() => fetchMasters())
</script>

<style scoped>
.admin-header { display: flex; justify-content: space-between; align-items: center; }
.form-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
.form-card { background: #fff; border-radius: 12px; padding: 30px; width: 100%; max-width: 700px; max-height: 90vh; overflow-y: auto; }
.form-card h2 { color: #2c5f2d; margin-bottom: 20px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-actions { display: flex; gap: 12px; margin-top: 16px; }
.list-item { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.item-info h3 { color: #333; margin-bottom: 4px; }
.item-actions { display: flex; gap: 8px; }
</style>
