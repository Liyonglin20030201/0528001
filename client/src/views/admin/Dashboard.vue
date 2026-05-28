<template>
  <div>
    <h1 class="page-title">后台管理</h1>
    <div class="admin-grid">
      <div class="card admin-card" @click="$router.push('/admin/articles')">
        <div class="admin-icon">📖</div>
        <h3>文章管理</h3>
        <p>发布、编辑、删除养生文章</p>
      </div>
      <div class="card admin-card" @click="$router.push('/admin/herbs')">
        <div class="admin-icon">🌿</div>
        <h3>药材管理</h3>
        <p>添加、编辑、删除中药材信息</p>
      </div>
      <div class="card admin-card" @click="$router.push('/admin/masters')">
        <div class="admin-icon">👨‍⚕️</div>
        <h3>名家管理</h3>
        <p>添加、编辑、删除名家信息</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; }
.admin-card { cursor: pointer; text-align: center; padding: 40px 20px; }
.admin-icon { font-size: 3rem; margin-bottom: 12px; }
.admin-card h3 { color: #2c5f2d; margin-bottom: 8px; }
.admin-card p { color: #666; font-size: 0.9rem; }
</style>
