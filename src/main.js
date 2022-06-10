/*
 * @Author: liuxin
 * @Date: 2022-06-01 14:49:35
 * @LastEditors: liuxin
 * @LastEditTime: 2022-06-10 16:55:29
 * @Description: 
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 引入mocks，测试接口
if (process.env.NODE_ENV === "development") {
    require("./mock");
}
createApp(App).use(store).use(router).mount('#app')
