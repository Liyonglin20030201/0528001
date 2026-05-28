<template>
  <div class="community-page">
    <h1 class="page-title">养生社区</h1>

    <div class="tab-bar">
      <button :class="{ active: activeTab === 'public' }" @click="activeTab = 'public'">社区笔记</button>
      <button v-if="userStore.isLoggedIn" :class="{ active: activeTab === 'my' }" @click="activeTab = 'my'">我的笔记</button>
    </div>

    <div v-if="userStore.isLoggedIn && activeTab === 'my'" class="write-section">
      <button v-if="!showEditor" class="btn btn-primary" @click="showEditor = true">写笔记</button>
      <div v-if="showEditor" class="card editor-card">
        <div class="form-group">
          <input v-model="noteForm.title" placeholder="笔记标题" maxlength="100" />
        </div>
        <div class="form-group">
          <textarea v-model="noteForm.content" placeholder="分享您的养生心得..." rows="6"></textarea>
        </div>
        <div class="form-group">
          <input v-model="noteForm.tagsInput" placeholder="标签（用逗号分隔，如：养生,食疗,穴位）" />
        </div>
        <div class="editor-footer">
          <label class="public-toggle">
            <input type="checkbox" v-model="noteForm.isPublic" />
            <span>公开到社区</span>
          </label>
          <div class="editor-actions">
            <button class="btn btn-secondary" @click="cancelEdit">取消</button>
            <button class="btn btn-primary" @click="saveNote">{{ editingId ? '更新' : '发布' }}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="filter-bar" v-if="activeTab === 'public'">
      <input v-model="searchKeyword" placeholder="搜索笔记..." @keyup.enter="fetchNotes" />
      <button class="btn btn-primary" @click="fetchNotes">搜索</button>
    </div>

    <div v-if="notes.length" class="notes-list">
      <div v-for="note in notes" :key="note._id" class="card note-card">
        <div class="note-header">
          <h3>{{ note.title }}</h3>
          <div class="note-meta">
            <span v-if="note.user?.username" class="note-author">{{ note.user.username }}</span>
            <span class="note-date">{{ formatDate(note.updatedAt) }}</span>
          </div>
        </div>
        <p class="note-content">{{ note.content }}</p>
        <div class="note-footer">
          <div class="note-tags">
            <span v-for="tag in note.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>
          <div class="note-actions">
            <button v-if="userStore.isLoggedIn" class="btn-like" :class="{ liked: isLiked(note) }" @click="toggleLike(note)">
              {{ isLiked(note) ? '❤' : '♡' }} {{ note.likes?.length || 0 }}
            </button>
            <template v-if="activeTab === 'my'">
              <button class="btn-edit" @click="editNote(note)">编辑</button>
              <button class="btn-delete" @click="deleteNote(note._id)">删除</button>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="!loading" class="empty">
      {{ activeTab === 'my' ? '还没有写过笔记，开始记录您的养生心得吧！' : '暂无社区笔记' }}
    </div>
    <div v-if="loading" class="loading">加载中...</div>

    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import api from '../utils/api'
import { useMessage } from '../composables/useMessage'

const { success, error } = useMessage()
const userStore = useUserStore()

const activeTab = ref('public')
const notes = ref([])
const page = ref(1)
const totalPages = ref(0)
const loading = ref(false)
const showEditor = ref(false)
const editingId = ref(null)
const searchKeyword = ref('')
const noteForm = ref({ title: '', content: '', tagsInput: '', isPublic: true })

const formatDate = (date) => new Date(date).toLocaleDateString('zh-CN')
const isLiked = (note) => note.likes?.includes(userStore.user?._id)

const fetchNotes = async () => {
  loading.value = true
  try {
    const endpoint = activeTab.value === 'my' ? '/notes/my' : '/notes/public'
    const params = { page: page.value, limit: 10 }
    if (searchKeyword.value) params.keyword = searchKeyword.value
    const data = await api.get(endpoint, { params })
    notes.value = data.notes
    totalPages.value = data.pages
  } catch (e) {
    error('获取笔记失败')
  } finally {
    loading.value = false
  }
}

const saveNote = async () => {
  if (!noteForm.value.title.trim() || !noteForm.value.content.trim()) {
    error('标题和内容不能为空')
    return
  }
  try {
    const payload = {
      title: noteForm.value.title,
      content: noteForm.value.content,
      tags: noteForm.value.tagsInput.split(/[,，]/).map(t => t.trim()).filter(Boolean),
      isPublic: noteForm.value.isPublic
    }
    if (editingId.value) {
      await api.put(`/notes/${editingId.value}`, payload)
      success('更新成功')
    } else {
      await api.post('/notes', payload)
      success('发布成功')
    }
    cancelEdit()
    fetchNotes()
  } catch (e) {
    error(e.message || '操作失败')
  }
}

const editNote = (note) => {
  editingId.value = note._id
  noteForm.value = {
    title: note.title,
    content: note.content,
    tagsInput: note.tags.join('、'),
    isPublic: note.isPublic
  }
  showEditor.value = true
}

const cancelEdit = () => {
  showEditor.value = false
  editingId.value = null
  noteForm.value = { title: '', content: '', tagsInput: '', isPublic: true }
}

const deleteNote = async (id) => {
  if (!confirm('确定删除这篇笔记吗？')) return
  try {
    await api.delete(`/notes/${id}`)
    success('删除成功')
    fetchNotes()
  } catch (e) {
    error('删除失败')
  }
}

const toggleLike = async (note) => {
  try {
    const data = await api.post(`/notes/${note._id}/like`)
    const index = notes.value.findIndex(n => n._id === note._id)
    if (index > -1) {
      if (data.isLiked) {
        notes.value[index].likes.push(userStore.user._id)
      } else {
        notes.value[index].likes = notes.value[index].likes.filter(id => id !== userStore.user._id)
      }
    }
  } catch (e) {
    error('操作失败')
  }
}

const changePage = (p) => {
  page.value = p
  fetchNotes()
}

watch(activeTab, () => {
  page.value = 1
  searchKeyword.value = ''
  fetchNotes()
})

onMounted(fetchNotes)
</script>

<style scoped>
.community-page { max-width: 800px; margin: 0 auto; }
.tab-bar { display: flex; gap: 0; margin-bottom: 24px; border-bottom: 2px solid #e0e0e0; }
.tab-bar button { padding: 10px 24px; border: none; background: none; cursor: pointer; font-size: 0.95rem; color: #888; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.3s; }
.tab-bar button.active { color: #2c5f2d; border-bottom-color: #2c5f2d; font-weight: 500; }
.write-section { margin-bottom: 24px; }
.editor-card { padding: 20px; }
.editor-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
.public-toggle { display: flex; align-items: center; gap: 6px; cursor: pointer; color: #555; font-size: 0.9rem; }
.editor-actions { display: flex; gap: 8px; }
.note-card { padding: 20px; }
.note-header { margin-bottom: 12px; }
.note-header h3 { color: #2c5f2d; margin-bottom: 4px; }
.note-meta { display: flex; gap: 12px; color: #888; font-size: 0.85rem; }
.note-content { color: #555; line-height: 1.8; white-space: pre-wrap; margin-bottom: 12px; }
.note-footer { display: flex; justify-content: space-between; align-items: center; }
.note-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.note-actions { display: flex; gap: 8px; align-items: center; }
.btn-like { background: none; border: none; cursor: pointer; font-size: 0.9rem; color: #888; transition: color 0.3s; }
.btn-like.liked { color: #e53935; }
.btn-edit, .btn-delete { background: none; border: none; cursor: pointer; font-size: 0.85rem; padding: 4px 8px; border-radius: 4px; }
.btn-edit { color: #4a8c5c; }
.btn-edit:hover { background: #e8f5e9; }
.btn-delete { color: #dc3545; }
.btn-delete:hover { background: #fde8e8; }
</style>
