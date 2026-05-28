<template>
  <div>
    <div class="admin-header">
      <h1 class="page-title">方剂管理</h1>
      <button class="btn btn-primary" @click="showForm = true; resetForm()">添加方剂</button>
    </div>

    <div v-if="showForm" class="form-modal">
      <div class="form-card">
        <h2>{{ editingId ? '编辑方剂' : '添加方剂' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-row">
            <div class="form-group">
              <label>方剂名称 <span class="required">*</span></label>
              <input v-model="form.name" required maxlength="30" placeholder="如：麻黄汤" />
              <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
            </div>
            <div class="form-group">
              <label>出处</label>
              <input v-model="form.source" maxlength="50" placeholder="如：《伤寒论》" />
            </div>
          </div>
          <div class="form-group">
            <label>分类 <span class="required">*</span></label>
            <select v-model="form.category" required>
              <option v-for="cat in categoryOptions" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>组成 <span class="required">*</span></label>
            <div class="composition-editor">
              <div v-for="(item, index) in form.composition" :key="index" class="comp-row">
                <input v-model="item.herb" placeholder="药材名" class="comp-input" />
                <input v-model="item.dosage" placeholder="用量" class="comp-input comp-dosage" />
                <button type="button" class="btn-remove" @click="removeComposition(index)">×</button>
              </div>
              <button type="button" class="btn btn-secondary btn-sm" @click="addComposition">+ 添加药材</button>
            </div>
            <span v-if="errors.composition" class="field-error">{{ errors.composition }}</span>
          </div>
          <div class="form-group">
            <label>用法</label>
            <input v-model="form.method" maxlength="200" placeholder="如：水煎服，温覆取微似汗" />
          </div>
          <div class="form-group">
            <label>功效 <span class="required">*</span></label>
            <textarea v-model="form.effect" rows="2" required maxlength="500" placeholder="描述方剂功效"></textarea>
            <span v-if="errors.effect" class="field-error">{{ errors.effect }}</span>
          </div>
          <div class="form-group">
            <label>主治 <span class="required">*</span></label>
            <textarea v-model="form.indication" rows="3" required maxlength="500" placeholder="描述主治病证"></textarea>
            <span v-if="errors.indication" class="field-error">{{ errors.indication }}</span>
          </div>
          <div class="form-group">
            <label>方解</label>
            <textarea v-model="form.analysis" rows="3" maxlength="800" placeholder="分析君臣佐使配伍"></textarea>
          </div>
          <div class="form-group">
            <label>注意事项</label>
            <input v-model="form.caution" maxlength="200" placeholder="如：体虚自汗者忌用" />
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
      <div class="card list-item" v-for="p in prescriptions" :key="p._id">
        <div class="item-info">
          <h3>{{ p.name }}</h3>
          <span class="tag">{{ p.category }}</span>
          <span class="meta">{{ p.source }}</span>
        </div>
        <div class="item-actions">
          <button class="btn btn-primary" @click="editPrescription(p)">编辑</button>
          <button class="btn btn-danger" @click="deletePrescription(p._id)">删除</button>
        </div>
      </div>
    </div>

    <div class="pagination" v-if="totalPages > 1">
      <button :disabled="page <= 1" @click="page--; fetchPrescriptions()">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; fetchPrescriptions()">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../utils/api'
import { useMessage } from '../../composables/useMessage'

const { success, error } = useMessage()

const prescriptions = ref([])
const page = ref(1)
const totalPages = ref(1)
const showForm = ref(false)
const editingId = ref(null)
const submitting = ref(false)
const errors = ref({})
const form = ref({ name: '', source: '', category: '补益剂', composition: [{ herb: '', dosage: '' }], method: '', effect: '', indication: '', analysis: '', caution: '' })

const categoryOptions = ['解表剂', '泻下剂', '和解剂', '清热剂', '温里剂', '补益剂', '固涩剂', '安神剂', '理气剂', '理血剂', '治风剂', '治燥剂', '祛湿剂', '祛痰剂', '消食剂', '驱虫剂']

const resetForm = () => {
  editingId.value = null
  errors.value = {}
  form.value = { name: '', source: '', category: '补益剂', composition: [{ herb: '', dosage: '' }], method: '', effect: '', indication: '', analysis: '', caution: '' }
}

const addComposition = () => {
  form.value.composition.push({ herb: '', dosage: '' })
}

const removeComposition = (index) => {
  if (form.value.composition.length > 1) {
    form.value.composition.splice(index, 1)
  }
}

const validate = () => {
  errors.value = {}
  if (!form.value.name || form.value.name.trim().length < 1) {
    errors.value.name = '请输入方剂名称'
  }
  if (!form.value.effect || form.value.effect.trim().length < 2) {
    errors.value.effect = '请输入功效描述（至少2个字符）'
  }
  if (!form.value.indication || form.value.indication.trim().length < 2) {
    errors.value.indication = '请输入主治描述（至少2个字符）'
  }
  const validComps = form.value.composition.filter(c => c.herb.trim())
  if (validComps.length === 0) {
    errors.value.composition = '请至少添加一味药材'
  }
  return Object.keys(errors.value).length === 0
}

const fetchPrescriptions = async () => {
  try {
    const data = await api.get('/prescriptions', { params: { page: page.value, limit: 10 } })
    prescriptions.value = data.prescriptions
    totalPages.value = data.pages
  } catch (e) {
    error('获取方剂列表失败，请刷新重试')
  }
}

const handleSubmit = async () => {
  if (!validate()) return
  submitting.value = true
  const payload = { ...form.value, composition: form.value.composition.filter(c => c.herb.trim()) }
  try {
    if (editingId.value) {
      await api.put(`/prescriptions/${editingId.value}`, payload)
      success('方剂更新成功')
    } else {
      await api.post('/prescriptions', payload)
      success('方剂添加成功')
    }
    showForm.value = false
    fetchPrescriptions()
  } catch (e) {
    error(e.message || '操作失败，请检查内容后重试')
  } finally {
    submitting.value = false
  }
}

const editPrescription = (p) => {
  editingId.value = p._id
  errors.value = {}
  form.value = {
    name: p.name,
    source: p.source || '',
    category: p.category,
    composition: p.composition.length ? p.composition.map(c => ({ herb: c.herb, dosage: c.dosage })) : [{ herb: '', dosage: '' }],
    method: p.method || '',
    effect: p.effect,
    indication: p.indication,
    analysis: p.analysis || '',
    caution: p.caution || ''
  }
  showForm.value = true
}

const deletePrescription = async (id) => {
  if (!confirm('确认删除此方剂？删除后不可恢复。')) return
  try {
    await api.delete(`/prescriptions/${id}`)
    success('方剂已删除')
    fetchPrescriptions()
  } catch (e) {
    error('删除失败，请稍后重试')
  }
}

onMounted(() => fetchPrescriptions())
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
.required { color: #dc3545; }
.field-error { color: #dc3545; font-size: 0.8rem; margin-top: 4px; display: block; }
.composition-editor { display: flex; flex-direction: column; gap: 8px; }
.comp-row { display: flex; gap: 8px; align-items: center; }
.comp-input { flex: 1; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem; }
.comp-dosage { max-width: 120px; }
.btn-remove { background: none; border: none; color: #dc3545; font-size: 1.3rem; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
.btn-remove:hover { background: #fde8e8; }
.btn-sm { padding: 4px 12px; font-size: 0.8rem; }
</style>
