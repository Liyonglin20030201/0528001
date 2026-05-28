<template>
  <div class="comments-section">
    <h3>评论 ({{ total }})</h3>

    <div v-if="userStore.isLoggedIn" class="comment-input">
      <textarea v-model="newComment" placeholder="写下您的想法..." maxlength="500" rows="3"></textarea>
      <div class="input-footer">
        <span class="char-count">{{ newComment.length }}/500</span>
        <button class="btn btn-primary" :disabled="!newComment.trim()" @click="postComment()">发表评论</button>
      </div>
    </div>
    <p v-else class="login-hint">
      <router-link to="/login">登录</router-link> 后参与评论
    </p>

    <div v-if="comments.length" class="comment-list">
      <div v-for="comment in comments" :key="comment._id" class="comment-item">
        <div class="comment-main">
          <div class="comment-header">
            <span class="comment-user">{{ comment.user?.username }}</span>
            <span class="comment-time">{{ formatDate(comment.createdAt) }}</span>
          </div>
          <p class="comment-content">{{ comment.content }}</p>
          <div class="comment-actions">
            <button v-if="userStore.isLoggedIn" class="action-btn" @click="toggleLike(comment)">
              {{ isLiked(comment) ? '❤' : '♡' }} {{ comment.likes?.length || 0 }}
            </button>
            <button v-if="userStore.isLoggedIn" class="action-btn" @click="replyTo = replyTo === comment._id ? null : comment._id">
              回复
            </button>
            <button v-if="canDelete(comment)" class="action-btn delete-btn" @click="deleteComment(comment._id)">
              删除
            </button>
          </div>

          <div v-if="replyTo === comment._id" class="reply-input">
            <textarea v-model="replyContent" :placeholder="`回复 ${comment.user?.username}...`" maxlength="500" rows="2"></textarea>
            <div class="reply-actions">
              <button class="btn btn-secondary btn-sm" @click="replyTo = null; replyContent = ''">取消</button>
              <button class="btn btn-primary btn-sm" :disabled="!replyContent.trim()" @click="postComment(comment._id)">回复</button>
            </div>
          </div>
        </div>

        <div v-if="comment.replies?.length" class="replies">
          <div v-for="reply in comment.replies" :key="reply._id" class="reply-item">
            <div class="comment-header">
              <span class="comment-user">{{ reply.user?.username }}</span>
              <span class="comment-time">{{ formatDate(reply.createdAt) }}</span>
            </div>
            <p class="comment-content">{{ reply.content }}</p>
            <div class="comment-actions">
              <button v-if="canDelete(reply)" class="action-btn delete-btn" @click="deleteComment(reply._id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-comments">暂无评论，来抢沙发吧！</div>

    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" @click="changePage(page - 1)">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="changePage(page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import api from '../utils/api'
import { useMessage } from '../composables/useMessage'

const props = defineProps({ articleId: { type: String, required: true } })
const { success, error } = useMessage()
const userStore = useUserStore()

const comments = ref([])
const total = ref(0)
const page = ref(1)
const totalPages = ref(0)
const newComment = ref('')
const replyTo = ref(null)
const replyContent = ref('')

const formatDate = (date) => new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
const isLiked = (comment) => comment.likes?.includes(userStore.user?._id)
const canDelete = (comment) => userStore.isLoggedIn && (comment.user?._id === userStore.user?._id || userStore.isAdmin)

const fetchComments = async () => {
  try {
    const data = await api.get(`/comments/article/${props.articleId}`, { params: { page: page.value } })
    comments.value = data.comments
    total.value = data.total
    totalPages.value = data.pages
  } catch (e) {}
}

const postComment = async (parentId = null) => {
  const content = parentId ? replyContent.value : newComment.value
  if (!content.trim()) return
  try {
    await api.post('/comments', { articleId: props.articleId, content, parentComment: parentId })
    success('评论成功')
    if (parentId) {
      replyTo.value = null
      replyContent.value = ''
    } else {
      newComment.value = ''
    }
    fetchComments()
  } catch (e) {
    error(e.message || '评论失败')
  }
}

const toggleLike = async (comment) => {
  try {
    const data = await api.post(`/comments/${comment._id}/like`)
    const idx = comments.value.findIndex(c => c._id === comment._id)
    if (idx > -1) {
      if (data.isLiked) {
        comments.value[idx].likes.push(userStore.user._id)
      } else {
        comments.value[idx].likes = comments.value[idx].likes.filter(id => id !== userStore.user._id)
      }
    }
  } catch (e) {
    error('操作失败')
  }
}

const deleteComment = async (id) => {
  if (!confirm('确定删除该评论吗？')) return
  try {
    await api.delete(`/comments/${id}`)
    success('删除成功')
    fetchComments()
  } catch (e) {
    error('删除失败')
  }
}

const changePage = (p) => {
  page.value = p
  fetchComments()
}

onMounted(fetchComments)
</script>

<style scoped>
.comments-section { margin-top: 40px; padding-top: 24px; border-top: 2px solid #e8f5e9; }
.comments-section h3 { color: #2c5f2d; margin-bottom: 20px; }
.comment-input textarea { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; resize: vertical; font-size: 0.9rem; }
.comment-input textarea:focus { outline: none; border-color: #4a8c5c; }
.input-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.char-count { color: #888; font-size: 0.8rem; }
.login-hint { color: #888; margin-bottom: 20px; }
.login-hint a { color: #2c5f2d; }
.comment-list { margin-top: 20px; }
.comment-item { padding: 16px 0; border-bottom: 1px solid #f0f0f0; }
.comment-header { display: flex; gap: 12px; align-items: center; margin-bottom: 6px; }
.comment-user { font-weight: 500; color: #2c5f2d; font-size: 0.9rem; }
.comment-time { color: #aaa; font-size: 0.8rem; }
.comment-content { color: #444; line-height: 1.6; margin-bottom: 8px; }
.comment-actions { display: flex; gap: 12px; }
.action-btn { background: none; border: none; cursor: pointer; color: #888; font-size: 0.8rem; padding: 2px 6px; border-radius: 4px; transition: all 0.3s; }
.action-btn:hover { background: #f5f5f5; color: #555; }
.delete-btn:hover { color: #dc3545; background: #fde8e8; }
.reply-input { margin-top: 12px; padding: 12px; background: #fafafa; border-radius: 8px; }
.reply-input textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; resize: none; font-size: 0.85rem; }
.reply-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 8px; }
.btn-sm { padding: 4px 12px; font-size: 0.8rem; }
.replies { margin-left: 32px; padding-left: 16px; border-left: 2px solid #e8f5e9; }
.reply-item { padding: 10px 0; }
.empty-comments { text-align: center; color: #999; padding: 30px; }
</style>
