/*
 * @Author: liuxin
 * @Date: 2022-06-01 14:49:35
 * @LastEditors: liuxin
 * @LastEditTime: 2022-06-10 16:24:23
 * @Description: 路由
 */
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: import(/* webpackChunkName: "home" */ '@/views/HomeView.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '@/views/AboutView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
