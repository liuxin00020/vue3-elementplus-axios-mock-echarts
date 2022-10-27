<!--
 * @Author: liuxin
 * @Date: 2022-05-31 14:21:52
 * @LastEditors: liuxin
 * @LastEditTime: 2022-10-25 14:13:40
 * @Description: 空页面
-->
<template>
  <div class="empty-content">
    <IconFont :type="icon" class="empty-icon" />
    <div>
      <span>{{ text }}</span>
    </div>
  </div>
</template>

<script>
/**
 * @description: 空组件
 * @param {String} text 文本
 * @param {String} icon 字体图标,对应iconfont
 * @param {Boolean} isRefresh 是否需要点击刷新
 * @Author: liuxin
 */
import IconFont from "@/components/IconFont/index.vue";
export default {
  components: {
    
    IconFont,
  },
  props: {
    text: {
      type: String,
      default: "暂无记录",
    },
    icon: {
      type: String,
      default: "icon-zanwushuju1",
    },
  },
};
</script>

<style lang="scss" scoped>
.empty-content {
  width: 100%;
  color: rgba($fontColor, 0.7);
  min-height: 200px;
  @include flex-box(column, center, center);
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-refresh {
  color: $primaryColor;
  margin-left: 20px;

}
</style>