/*
 * @Author: liuxin
 * @Date: 2022-06-01 14:49:35
 * @LastEditors: liuxin
 * @LastEditTime: 2022-06-10 14:22:42
 * @Description: 
 */
const { defineConfig } = require('@vue/cli-service')
const AutoImport = require("unplugin-auto-import/webpack");
const Components = require("unplugin-vue-components/webpack");
const { ElementPlusResolver } = require("unplugin-vue-components/resolvers");
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "./", // 公共路径，这样设置，打包后的index.html才可以打开
  productionSourceMap: false, // 打包后不要映射文件
  lintOnSave: true, // 保存时，使用eslint，不想用则置为false
  devServer: {
    host: "localhost", // 解决自动打开0.0.0.0
    port: 9090, // 端口
    open: true, // 编译完成，自己打开浏览器
    // 代理防止跨域
    // proxy: {
    //   '/api': {
    //     target: '目标地址',
    //     changeOrigin: true,
    //     ws: true,
    //     pathRewrite: {
    //       '^/api': '',
    //     },
    //   },
    // },
  },
  pages: {
    index: {
      entry: 'src/main.js',// page 的入口
      template: 'public/index.html',// 模板来源
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'vue3简易框架代码',
    },
  },
  configureWebpack: {
    plugins: [
      // 自动引入
      AutoImport({
        resolvers: [
          ElementPlusResolver({
            // 自动引入修改主题色添加这一行，使用预处理样式，不添加将会导致使用ElMessage，ElNotification等组件时默认的主题色会覆盖自定义的主题色
            importStyle: "sass",
          }),
        ],
      }),
      //按需引入element
      Components({
        resolvers: [
          ElementPlusResolver({
            // 按需引入修改主题色添加这一行，使用预处理样式
            importStyle: "sass",
          }),
        ],
      }),
    ],
  },

  css: {
    loaderOptions: {
      sass: {
        // 全局scss 和自定义element主题
        additionalData: `@use "~/src/styles/mixins.scss" as *;@use "~/src/styles/variable.scss" as *; @use "~/src/styles/elementplus.scss" as *;`,
      },
    },
  },
})
