import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/home/Circuits.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { title: 'EMOLA' },
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 80, // 헤더 높이만큼 오프셋
      }
    }
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, behavior: 'smooth' }
  },
})

// 페이지 타이틀 업데이트
router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'EMOLA'
  next()
})

export default router
