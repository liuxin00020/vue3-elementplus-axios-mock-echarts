/*
 * @Author: liuxin
 * @Date: 2022-04-19 15:42:34
 * @LastEditors: liuxin
 * @LastEditTime: 2022-06-10 16:42:35
 * @Description: 请求拦截
 */
import axios from "axios";
import { ElMessage } from 'element-plus'
import "element-plus/es/components/message/style/css"

// 这里打包后，可以修改根目录下的config.js进行修改
axios.defaults.baseURL = Window.apiConfig[process.env.NODE_ENV].baseUrl

// 请求拦截器，内部根据返回值，重新组装，统一管理。
axios.interceptors.response.use(res => {
    const { data } = res;
    if (typeof data !== 'object') {
        ElMessage.error('服务器异常，请联系管理员')
        return Promise.reject(res);
    }
    if (data.code != 200) {
        if (res.data.message)
            ElMessage.error(res.data.message)
        return Promise.reject(res.data);
    }

    return data
}, (err) => {
    ElMessage.error({
        showClose: true,
        message: '服务器异常，请联系管理员',
        type: 'error',
    })
    return Promise.reject(err)
})

export default axios;
