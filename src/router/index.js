/*
 * @Author: liuxin
 * @Date: 2022-06-01 14:49:35
 * @LastEditors: liuxin
 * @LastEditTime: 2022-06-13 11:04:46
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
    path: '/echartsView',
    name: 'echartsView',
    component: () => import(/* webpackChunkName: "echartsView" */ '@/views/EchartsView.vue')
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
