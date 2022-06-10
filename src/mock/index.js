/*
 * @Author: liuxin
 * @Date: 2022-06-09 17:21:03
 * @LastEditors: liuxin
 * @LastEditTime: 2022-06-10 16:50:42
 * @Description: 模拟接口自动引入入口页
 */
import Mock from "mockjs";

// 自动引入模块
const modulesFiles = require.context('./_modules', true, /\.js$/);

const mocks = modulesFiles.keys().reduce((modues, item) => {
    return [...modues, ...modulesFiles(item).default];
}, [])

// 设置拦截ajax请求的响应时间
Mock.setup({
    timeout: "200-1000"
});
// 遍历mock配置项
mocks.forEach(item => {
    Mock.mock(item.url, options => {
        const { type, body } = options;
        if (item.type !== type.toLowerCase()) {
            return { code: 500, msg: `该接口不支持${type}方式` };
        } else {
            return item.getData(JSON.parse(body)); // 这样每次调用接口，返回的数据才不一样
        }
    });
});