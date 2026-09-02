import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/books',
      name: 'Books',
      component: () => import('@/views/BooksView.vue'),
    },
  ],
})

export default router