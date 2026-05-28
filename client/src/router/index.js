import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('../views/Home.vue') },
  { path: '/login', component: () => import('../views/Login.vue') },
  { path: '/register', component: () => import('../views/Register.vue') },
  { path: '/herbs', component: () => import('../views/Herbs.vue') },
  { path: '/herbs/:id', component: () => import('../views/HerbDetail.vue') },
  { path: '/articles', component: () => import('../views/Articles.vue') },
  { path: '/articles/:id', component: () => import('../views/ArticleDetail.vue') },
  { path: '/masters', component: () => import('../views/Masters.vue') },
  { path: '/masters/:id', component: () => import('../views/MasterDetail.vue') },
  { path: '/favorites', component: () => import('../views/Favorites.vue'), meta: { requiresAuth: true } },
  { path: '/admin', component: () => import('../views/admin/Dashboard.vue'), meta: { requiresAdmin: true } },
  { path: '/admin/articles', component: () => import('../views/admin/ArticleManage.vue'), meta: { requiresAdmin: true } },
  { path: '/admin/herbs', component: () => import('../views/admin/HerbManage.vue'), meta: { requiresAdmin: true } },
  { path: '/admin/masters', component: () => import('../views/admin/MasterManage.vue'), meta: { requiresAdmin: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.requiresAdmin && (!token || user?.role !== 'admin')) {
    next('/')
  } else {
    next()
  }
})

export default router
