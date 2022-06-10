/*
 * @Author: liuxin
 * @Date: 2022-06-10 13:59:41
 * @LastEditors: liuxin
 * @LastEditTime: 2022-06-10 16:05:46
 * @Description: 测试mockjs
 */
import axios from "@/utils/axios.js"

/**
 * @description:  或者列表
 * @Author: liuxin
 */
export const getUseList = (param) => {
    return axios.post('/getUseList', param)
}

