/*
 * @Author: liuxin
 * @Date: 2022-04-27 14:35:23
 * @LastEditors: liuxin
 * @LastEditTime: 2022-06-10 14:19:31
 * @Description: 配置文件，可打包后修改
 */

Window.apiConfig = {
    development: {
        baseUrl: '/api' // 开发环境域名  代理跨域
    },
    production: {
        baseUrl: 'http://172.16.180.14:30081/api' // 正式接口域名
    }
}