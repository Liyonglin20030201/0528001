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
              <label>姓名 <span class="required">*</span></label>
              <input v-model="form.name" required maxlength="20" placeholder="如：华佗" />
              <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
            </div>
            <div class="form-group">
              <label>朝代 <span class="required">*</span></label>
              <input v-model="form.dynasty" required maxlength="20" placeholder="如：东汉、唐代" />
              <span v-if="errors.dynasty" class="field-error">{{ errors.dynasty }}</span>
            </div>
          </div>
          <div class="form-group">
            <label>名家画像</label>
            <ImageUpload v-model="form.portrait" placeholder="上传画像" />
          </div>
          <div class="form-group">
            <label>主要贡献</label>
            <input v-model="form.contribution" maxlength="200" placeholder="概述其主要医学贡献" />
          </div>
          <div class="form-group">
            <label>生平简介 <span class="required">*</span></label>
            <textarea v-model="form.biography" rows="6" required placeholder="详细介绍名家生平"></textarea>
            <span v-if="errors.biography" class="field-error">{{ errors.biography }}</span>
          </div>
          <div class="form-group">
            <label>经典故事（每行一个故事）</label>
            <textarea v-model="storiesText" rows="4" placeholder="每行输入一个故事"></textarea>
          </div>
          <div class="form-group">
            <label>代表著作（每行一部）</label>
            <textarea v-model="worksText" rows="3" placeholder="每行输入一部著作名称"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? '提交中...' : (editingId ? '更新' : '添加') }}
            </button>
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
import ImageUpload from '../../components/ImageUpload.vue'
import { useMessage } from '../../composables/useMessage'

const { success, error } = useMessage()

const masters = ref([])
const page = ref(1)
const totalPages = ref(1)
const showForm = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const errors = ref({})
const form = ref({ name: '', dynasty: '', biography: '', contribution: '', portrait: '' })
const storiesText = ref('')
const worksText = ref('')

const resetForm = () => {
  editingId.value = null
  errors.value = {}
  form.value = { name: '', dynasty: '', biography: '', contribution: '', portrait: '' }
  storiesText.value = ''
  worksText.value = ''
}

const validate = () => {
  errors.value = {}
  if (!form.value.name || form.value.name.trim().length < 1) {
    errors.value.name = '请输入名家姓名'
  }
  if (!form.value.dynasty || form.value.dynasty.trim().length < 1) {
    errors.value.dynasty = '请输入朝代'
  }
  if (!form.value.biography || form.value.biography.trim().length < 10) {
    errors.value.biography = '生平简介至少需要10个字符'
  }
  return Object.keys(errors.value).length === 0
}

const fetchMasters = async () => {
  try {
    const data = await api.get('/masters', { params: { page: page.value, limit: 10 } })
    masters.value = data.masters
    totalPages.value = data.pages
  } catch (e) {
    error('获取名家列表失败，请刷新重试')
  }
}

const handleSubmit = async () => {
  if (!validate()) return
  submitting.value = true
  try {
    const payload = {
      ...form.value,
      stories: storiesText.value.split('\n').filter(s => s.trim()),
      famousWorks: worksText.value.split('\n').filter(s => s.trim())
    }
    if (editingId.value) {
      await api.put(`/masters/${editingId.value}`, payload)
      success('名家信息更新成功')
    } else {
      await api.post('/masters', payload)
      success('名家添加成功')
    }
    showForm.value = false
    fetchMasters()
  } catch (e) {
    error(e.message || '操作失败，请检查内容后重试')
  } finally {
    submitting.value = false
  }
}

const editMaster = async (master) => {
  try {
    const full = await api.get(`/masters/${master._id}`)
    editingId.value = master._id
    errors.value = {}
    form.value = { name: full.name, dynasty: full.dynasty, biography: full.biography, contribution: full.contribution || '', portrait: full.portrait || '' }
    storiesText.value = (full.stories || []).join('\n')
    worksText.value = (full.famousWorks || []).join('\n')
    showForm.value = true
  } catch (e) {
    error('获取名家详情失败')
  }
}

const deleteMaster = async (id) => {
  if (!confirm('确认删除此名家？删除后不可恢复。')) return
  try {
    await api.delete(`/masters/${id}`)
    success('名家已删除')
    fetchMasters()
  } catch (e) {
    error('删除失败，请稍后重试')
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
.required { color: #dc3545; }
.field-error { color: #dc3545; font-size: 0.8rem; margin-top: 4px; display: block; }
</style>
