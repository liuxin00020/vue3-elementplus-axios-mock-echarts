<!--
 * @Author: liuxin
 * @Date: 2022-06-01 14:49:35
 * @LastEditors: liuxin
 * @LastEditTime: 2022-10-26 14:56:04
 * @Description: 
-->
<template>
  <div class="about">
    <h1>FLV组件测试</h1>

    <el-row class="slef-margin-bottom" :gutter="20">
      <el-col :span="7">
        <el-input
          v-model="flvUrl"
          placeholder="在线推流地址"
          clearable="true"
        />
      </el-col>
      <el-col :offset="1" :span="16">
        <div
          v-loading="loading"
          element-loading-text="Loading..."
          class="flv-video"
        >
          <!-- 异常视频 -->
          <FlvVideo
            :url="flvUrl"
            v-model:flvLoading="loading"
            @faultRefresh="faultRefresh"
          />
        </div>
      </el-col>
    </el-row>
    <el-divider />
    <h1>WebSocket测试</h1>
    <el-row class="slef-margin-bottom" :gutter="20">
      <el-col :span="7">
        <div class="flex-center">
          <el-input v-model="webSocketUrl" placeholder="连接地址">
            <template #append>
              <el-button size="default" @click="loadWebSocket">连接</el-button>
            </template>
          </el-input>
        </div>
      </el-col>
      <el-col :offset="1" :span="16" class="">
        <h3>
          服务器响应
          <el-button type="success" @click="returnData = []">清空</el-button>
        </h3>
        <div v-for="(item, index) in returnData" :key="index">
          {{ item }}
          <el-divider />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { reactive, toRefs } from "vue";
import FlvVideo from "@/components/FlvVideo.vue";
import { initWebSocket, websocketDealData } from "@/utils/websocket";
export default {
  components: { FlvVideo },
  setup() {
    const state = reactive({
      // flv
      flvUrl: "",
      loading: false,

      //webSocket
      webSocketUrl: "",
      returnData: [],
    });

    /**
     * @description: flv错误刷新
     * @return {*}
     * @Author: liuxin
     */
    function faultRefresh() {
      console.log("faultRefresh====");
    }

    /**
     * @description: webscoket连接
     * @return {*}
     * @Author: liuxin
     */
    function loadWebSocket() {
      if (!state.webSocketUrl) {
        state.returnData.push("！！！空地址！！！");
        return;
      }
      const socket = initWebSocket(state.webSocketUrl); // 连接websocket

      if (socket) {
        socket.addEventListener("message", (scev) => {
          console.log(scev.data);
          state.returnData.push(scev.data);
        });

        /* 监听socket关闭 */
        socket.addEventListener("close", () => {
          state.returnData.push("连接关闭");
        });
      }
    }

    return {
      ...toRefs(state),
      faultRefresh,
      loadWebSocket,
    };
  },
};
</script>

<style lang="scss" scoped>
.flv-video {
  width: 500px;
  height: 400px;
  border: 1px solid $borderColor;
  background: $primaryColor-light-1;
  @include flex-box(null, center, center);
}
</style>