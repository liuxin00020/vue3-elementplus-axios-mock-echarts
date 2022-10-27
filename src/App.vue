<!--
 * @Author: liuxin
 * @Date: 2022-06-01 14:49:35
 * @LastEditors: liuxin
 * @LastEditTime: 2022-10-25 13:38:45
 * @Description: 
-->
<template>
  <el-container>
    <el-header class="bg-header">
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/echartsView">EchartsView</router-link>
        <router-link to="/flvView">flvView</router-link>
      </nav>
    </el-header>
    <el-main><router-view /></el-main>
  </el-container>
  <!-- 
  <router-view /> -->
</template>

<style lang="scss">
@use "./styles/global.scss" as *;

#app {
  color: var(--el-text-color-primary);
}

body {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
}

code {
  border-radius: 2px;
  padding: 2px 4px;
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.bg-header {
  background-color: $primaryColor-light-3;
}

nav {
  font-size: 20px;
  width: 100%;
  height: 100%;
  @include flex-box(row, center, center);
  a {
    font-weight: bold;
    margin: 0 20px;
    color:$fontColor;

    &.router-link-exact-active {
      color: $fontTitleColor;
    }
  }
}
</style>
