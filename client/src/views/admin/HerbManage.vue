<template>
  <div>
    <div class="admin-header">
      <h1 class="page-title">药材管理</h1>
      <button class="btn btn-primary" @click="showForm = true; resetForm()">添加药材</button>
    </div>

    <div v-if="showForm" class="form-modal">
      <div class="form-card">
        <h2>{{ editingId ? '编辑药材' : '添加药材' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-row">
            <div class="form-group">
              <label>名称</label>
              <input v-model="form.name" required />
            </div>
            <div class="form-group">
              <label>别名</label>
              <input v-model="form.alias" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>分类</label>
              <select v-model="form.category" required>
                <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>归经</label>
              <input v-model="form.meridian" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>性</label>
              <input v-model="form.nature" required placeholder="如：温、寒、平" />
            </div>
            <div class="form-group">
              <label>味</label>
              <input v-model="form.taste" required placeholder="如：甘、苦、辛" />
            </div>
          </div>
          <div class="form-group">
            <label>功效</label>
            <textarea v-model="form.effect" rows="3" required></textarea>
          </div>
          <div class="form-group">
            <label>用法用量</label>
            <input v-model="form.usage" />
          </div>
          <div class="form-group">
            <label>使用禁忌</label>
            <input v-model="form.caution" />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">{{ editingId ? '更新' : '添加' }}</button>
            <button type="button" class="btn btn-secondary" @click="showForm = false">取消</button>
          </div>
        </form>
      </div>
    </div>

    <div class="article-list">
      <div class="card list-item" v-for="herb in herbs" :key="herb._id">
        <div class="item-info">
          <h3>{{ herb.name }}</h3>
          <span class="tag">{{ herb.category }}</span>
          <span class="meta">{{ herb.nature }} | {{ herb.taste }}</span>
        </div>
        <div class="item-actions">
          <button class="btn btn-primary" @click="editHerb(herb)">编辑</button>
          <button class="btn btn-danger" @click="deleteHerb(herb._id)">删除</button>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="page <= 1" @click="page--; fetchHerbs()">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; fetchHerbs()">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../utils/api'

const herbs = ref([])
const page = ref(1)
const totalPages = ref(1)
const showForm = ref(false)
const editingId = ref(null)
const form = ref({ name: '', alias: '', category: '补虚药', nature: '', taste: '', meridian: '', effect: '', usage: '', caution: '' })

const categoryOptions = ['解表药', '清热药', '泻下药', '祛风湿药', '化湿药', '利水渗湿药', '温里药', '理气药', '消食药', '补虚药', '收涩药', '安神药', '活血化瘀药', '止血药', '化痰止咳平喘药']

const resetForm = () => {
  editingId.value = null
  form.value = { name: '', alias: '', category: '补虚药', nature: '', taste: '', meridian: '', effect: '', usage: '', caution: '' }
}

const fetchHerbs = async () => {
  try {
    const data = await api.get('/herbs', { params: { page: page.value, limit: 10 } })
    herbs.value = data.herbs
    totalPages.value = data.pages
  } catch (e) {
    console.error(e)
  }
}

const handleSubmit = async () => {
  try {
    if (editingId.value) {
      await api.put(`/herbs/${editingId.value}`, form.value)
    } else {
      await api.post('/herbs', form.value)
    }
    showForm.value = false
    fetchHerbs()
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

const editHerb = (herb) => {
  editingId.value = herb._id
  form.value = { name: herb.name, alias: herb.alias, category: herb.category, nature: herb.nature, taste: herb.taste, meridian: herb.meridian, effect: herb.effect, usage: herb.usage, caution: herb.caution }
  showForm.value = true
}

const deleteHerb = async (id) => {
  if (!confirm('确认删除此药材？')) return
  try {
    await api.delete(`/herbs/${id}`)
    fetchHerbs()
  } catch (e) {
    alert('删除失败')
  }
}

onMounted(() => fetchHerbs())
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
.meta { color: #999; font-size: 0.8rem; margin-left: 8px; }
</style>
