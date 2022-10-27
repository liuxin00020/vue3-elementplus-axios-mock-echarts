/*
 * @Author: liuxin
 * @Date: 2022-04-27 14:35:23
 * @LastEditors: liuxin
 * @LastEditTime: 2022-10-25 11:41:49
 * @Description: 配置文件，可打包后修改
 */

Window.apiConfig = {
    development: {
        baseUrl: '/api', // 开发环境域名  代理跨域
        wsUrl: 'ws://xxx.xxx.xx.xx:xxxx' // websocket地址
    },
    production: {
        baseUrl: '/api', // 正式接口域名
        wsUrl: 'ws://xxx.xxx.xx.xx:xxxx'// websocket地址
    }
}

Window.flvTimeOut = 300; // flv推流延时播放的时间，单位ms  值尽量在1000内，否则可能会导致偶现灰屏
Window.reconnectFlvCount = 20 // 推流断流重连次数，值最好>=20，否则可能会导致推流无法正常打开
