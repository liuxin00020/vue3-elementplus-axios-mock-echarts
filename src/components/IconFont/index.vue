<template>
  <svg class="icon" aria-hidden="true">
    <use :xlink:href="'#' + type"></use>
  </svg>
</template>

<script>
/**
 * @description 阿里字体图标，会继承上级颜色、字体大小
 * @param type 字体图标对应的类型名称 参照iconfont项目文件夹查看type
 * @example <IconFont type="icon-yonghu1"/>
 */
import "./iconfont.js";
export default {
  name: "IconFont",
  props: {
    type: {
      type: String,
      required: true
    }
  }
};
</script>

<style>
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>