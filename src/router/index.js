/*
 * @Author: liuxin
 * @Date: 2022-06-01 14:49:35
 * @LastEditors: liuxin
 * @LastEditTime: 2022-10-25 13:38:36
 * @Description: 路由
 */
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "home" */ '@/views/HomeView.vue')
  },
  {
    path: '/echartsView',
    name: 'echartsView',
    component: () => import(/* webpackChunkName: "echartsView" */ '@/views/EchartsView.vue')
  },
  {
    path: '/flvView',
    name: 'flvView',
    component: () => import(/* webpackChunkName: "about" */ '@/views/FlvView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
