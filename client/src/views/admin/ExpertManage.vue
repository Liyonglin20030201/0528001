<template>
  <div>
    <div class="admin-header">
      <h1 class="page-title">专家管理</h1>
    </div>

    <div class="tab-bar">
      <button :class="{ active: activeTab === 'experts' }" @click="activeTab = 'experts'; fetchExperts()">已认证专家</button>
      <button :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'; fetchUsers()">用户列表</button>
    </div>

    <template v-if="activeTab === 'experts'">
      <div v-if="experts.length" class="article-list">
        <div class="card list-item" v-for="expert in experts" :key="expert._id">
          <div class="item-info">
            <h3>{{ expert.username }}</h3>
            <div class="expert-detail">
              <span v-if="expert.expertInfo?.title" class="tag">{{ expert.expertInfo.title }}</span>
              <span v-if="expert.expertInfo?.hospital">{{ expert.expertInfo.hospital }}</span>
              <span v-if="expert.expertInfo?.specialty">{{ expert.expertInfo.specialty }}</span>
            </div>
            <p v-if="expert.expertInfo?.bio" class="expert-bio">{{ expert.expertInfo.bio }}</p>
            <span class="meta-text" v-if="expert.expertInfo?.certifiedAt">认证时间：{{ formatDate(expert.expertInfo.certifiedAt) }}</span>
          </div>
          <div class="item-actions">
            <button class="btn btn-danger" @click="revokeExpert(expert._id)">撤销认证</button>
          </div>
        </div>
      </div>
      <div v-else class="empty">暂无认证专家</div>
    </template>

    <template v-if="activeTab === 'users'">
      <div class="filter-bar">
        <input v-model="searchKeyword" placeholder="搜索用户名..." @keyup.enter="fetchUsers" />
        <button class="btn btn-primary" @click="fetchUsers">搜索</button>
      </div>

      <div v-if="users.length" class="article-list">
        <div class="card list-item" v-for="user in users" :key="user._id">
          <div class="item-info">
            <h3>{{ user.username }}</h3>
            <span class="tag" :class="'role-' + user.role">{{ roleLabel(user.role) }}</span>
            <span class="meta-text">{{ user.email }}</span>
          </div>
          <div class="item-actions">
            <button v-if="user.role === 'user'" class="btn btn-primary" @click="openCertifyModal(user)">认证为专家</button>
            <button v-if="user.role === 'expert'" class="btn btn-danger" @click="revokeExpert(user._id)">撤销认证</button>
          </div>
        </div>
      </div>
      <div v-else class="empty">暂无用户</div>
    </template>

    <div v-if="showCertifyModal" class="form-modal" @click.self="showCertifyModal = false">
      <div class="form-card">
        <h2>认证专家：{{ certifyUser?.username }}</h2>
        <form @submit.prevent="confirmCertify">
          <div class="form-group">
            <label>职称 <span class="required">*</span></label>
            <input v-model="certifyForm.title" required placeholder="如：主任中医师、副主任中医师" />
          </div>
          <div class="form-group">
            <label>所在医院/机构</label>
            <input v-model="certifyForm.hospital" placeholder="如：北京中医药大学附属医院" />
          </div>
          <div class="form-group">
            <label>擅长领域</label>
            <input v-model="certifyForm.specialty" placeholder="如：脾胃病、针灸、推拿" />
          </div>
          <div class="form-group">
            <label>个人简介</label>
            <textarea v-model="certifyForm.bio" rows="4" placeholder="专家个人介绍"></textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? '提交中...' : '确认认证' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="showCertifyModal = false">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../../utils/api'
import { useMessage } from '../../composables/useMessage'

const { success, error } = useMessage()

const activeTab = ref('experts')
const experts = ref([])
const users = ref([])
const searchKeyword = ref('')
const showCertifyModal = ref(false)
const certifyUser = ref(null)
const submitting = ref(false)
const certifyForm = ref({ title: '', hospital: '', specialty: '', bio: '' })

const roleLabel = (role) => ({ user: '普通用户', admin: '管理员', expert: '认证专家' }[role] || role)
const formatDate = (date) => new Date(date).toLocaleDateString('zh-CN')

const fetchExperts = async () => {
  try {
    experts.value = await api.get('/user/experts')
  } catch (e) {
    error('获取专家列表失败')
  }
}

const fetchUsers = async () => {
  try {
    const params = {}
    if (searchKeyword.value) params.keyword = searchKeyword.value
    const data = await api.get('/user/all', { params })
    users.value = data
  } catch (e) {
    error('获取用户列表失败')
  }
}

const openCertifyModal = (user) => {
  certifyUser.value = user
  certifyForm.value = { title: '', hospital: '', specialty: '', bio: '' }
  showCertifyModal.value = true
}

const confirmCertify = async () => {
  if (!certifyForm.value.title.trim()) {
    error('职称不能为空')
    return
  }
  submitting.value = true
  try {
    await api.put(`/user/certify-expert/${certifyUser.value._id}`, certifyForm.value)
    success(`已将 ${certifyUser.value.username} 认证为专家`)
    showCertifyModal.value = false
    fetchExperts()
    fetchUsers()
  } catch (e) {
    error(e.message || '认证失败')
  } finally {
    submitting.value = false
  }
}

const revokeExpert = async (userId) => {
  if (!confirm('确认撤销该用户的专家资格？')) return
  try {
    await api.put(`/user/revoke-expert/${userId}`)
    success('已撤销专家资格')
    fetchExperts()
    if (activeTab.value === 'users') fetchUsers()
  } catch (e) {
    error('操作失败')
  }
}

onMounted(fetchExperts)
</script>

<style scoped>
.admin-header { display: flex; justify-content: space-between; align-items: center; }
.tab-bar { display: flex; gap: 0; margin-bottom: 24px; border-bottom: 2px solid #e0e0e0; }
.tab-bar button { padding: 10px 24px; border: none; background: none; cursor: pointer; font-size: 0.95rem; color: #888; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.3s; }
.tab-bar button.active { color: #2c5f2d; border-bottom-color: #2c5f2d; font-weight: 500; }
.form-modal { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; }
.form-card { background: #fff; border-radius: 12px; padding: 30px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
.form-card h2 { color: #2c5f2d; margin-bottom: 20px; }
.form-actions { display: flex; gap: 12px; margin-top: 16px; }
.list-item { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.item-info h3 { color: #333; margin-bottom: 4px; }
.item-actions { display: flex; gap: 8px; }
.expert-detail { display: flex; gap: 12px; align-items: center; margin: 4px 0; color: #666; font-size: 0.9rem; }
.expert-bio { color: #888; font-size: 0.85rem; margin-top: 4px; }
.meta-text { color: #999; font-size: 0.8rem; }
.required { color: #dc3545; }
.role-user { background: #e0e0e0; color: #555; }
.role-admin { background: #fff3cd; color: #856404; }
.role-expert { background: #d4edda; color: #155724; }
</style>
