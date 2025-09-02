import { createRouter, createWebHistory } from 'vue-router'
import ChatView from '@/views/ChatView.vue'
import LoginView from '@/views/LoginView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true } // 只有未登录用户可以访问
    },
    {
      path: '/',
      redirect: '/chat' // 重定向到 /chat
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 初始化认证状态
  authStore.initAuth()
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    // 需要登录但未登录，跳转到登录页
    next({ name: 'login' })
  } else if (to.meta.requiresGuest && authStore.isLoggedIn) {
    // 已登录用户访问登录页，跳转到聊天页
    next({ name: 'chat' })
  } else {
    // 正常访问
    next()
  }
})

export default router
