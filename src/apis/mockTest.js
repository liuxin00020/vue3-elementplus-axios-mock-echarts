/*
 * @Author: liuxin
 * @Date: 2022-06-10 13:59:41
 * @LastEditors: liuxin
 * @LastEditTime: 2022-06-13 11:34:40
 * @Description: 测试mockjs
 */
import axios from "@/utils/axios.js"

/**
 * @description:  测试列表
 * @Author: liuxin
 */
export const getUseList = (param) => {
    return axios.post('/getUseList', param)
}


/**
 * @description:  测试eacharts
 * @Author: liuxin
 */
export const getChart = (param) => {
    return axios.get('/getChart', param)
}

