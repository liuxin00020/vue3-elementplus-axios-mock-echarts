<!--
 * @Author: liuxin
 * @Date: 2022-05-19 13:59:30
 * @LastEditors: liuxin
 * @LastEditTime: 2023-01-13 15:50:18
 * @Description: 视频播放器
-->
<template >
  <div
    v-loading="loading"
    element-loading-text="Loading..."
    class="video-div"
    :class="isFlullscreen ? 'video-fullscreen' : ''"
  >
    <span v-if="cameraName" class="camera-name">{{ cameraName }}</span>
    <video
      ref="flvPlayerVideo"
      muted
      autoplay
      width="100%"
      height="100%"
      class="flv-video"
    >
      <div>浏览器不支持video</div>
    </video>
    <!-- 退出全屏 / 全屏 -->
    <span
      class="fullscreen-span"
      v-show="url && errorCount <= maxReconnectCount"
    >
      <IconFont
        class="fullscreen-icon"
        :type="isFlullscreen ? 'icon-tuichuquanping' : 'icon-a-9Equanping'"
        @click="fullscreenHandle"
      />
    </span>

    <!-- 无播放源提示 -->
    <Empty
      v-if="!url"
      icon="iconshipinjiazaishibai"
      class="flv-refresh"
      text="暂无播放源"
    />

    <!-- 错误刷新提示 -->
    <Empty
      v-if="url && errorCount > maxReconnectCount"
      class="flv-refresh"
      icon="icon-icon"
      text="已播完或者出错了，点击我刷新"
      @click="faultRefresh"
    />
  </div>
</template>

<script>
/**
 * @description: 视频播放器 MP4/flv
 * @param {String} url 地址
 * @param {Object} option flv插件对应的option
 *        默认 {
 *              type: "flv", // 视频类型  flv/mp4
                isLive: true, // 是否实时流
              }
 * @param {Boolean} flvReload  用于判断是否重连，地址相同的情况下才用重连
 * @param {Boolean} isBufferedEnd  是否追帧和跳帧，默认true  异常视频不需要
 * @return {*}
 * @example 
 *      <div
          class="video-item"
        >
        <FlvVideo
          :url="stream_url"
          class="station-video-flv"
          v-model:flvReload="flvReload"
          @faultRefresh="videoRefresh(item)"
        />
        </div>
 * @Author: liuxin
 */
import Empty from "@/components/Empty.vue";
import flvjs from "flv.js";
import { reactive, toRefs, onMounted, onUnmounted, watch, ref } from "vue";
export default {
  components: {
    Empty,
  },
  props: {
    cameraName: {
      type: String,
      default: "",
    },
    url: {
      type: String,
      default: "",
    },
    option: {
      type: Object,
      default: () => {
        return {
          type: "flv", // 视频类型  flv/mp4
          isLive: true, // 是否实时流
        };
      },
    },

    flvReload: {
      type: Boolean,
      default: false,
    },

    // 是否追帧和跳帧，默认需要
    isBufferedEnd: {
      type: Boolean,
      default: true,
    },
  },
  setup(prop, ctx) {
    const flvPlayerVideo = ref(null);
    const state = reactive({
      loading: true, // 加载动画
      flvPlayer: null,
      delayTimer: null,

      maxReconnectCount: Window.reconnectFlvCount, // 重连的最大次数
      errorCount: 0, // 错误次数，连接10次则不再连接
      lastDecodedFrame: 0, // 用于判断卡顿
      endedReloadFlag: true, // 用于判断推流结束，是否要再次构建（情景：后端关闭推流后重新打开，有几秒的断流时间）

      isFlullscreen: false,
    });

    onMounted(() => {
      if (prop.url) {
        flvInitLoad(); // 如果有地址，则直接构建视频
      } else {
        state.loading = false; // 没有地址，则去掉loading
      }
    });

    onUnmounted(() => {
      flvDestory();
    });

    watch(
      () => [prop.url, prop.flvReload],
      ([newUrl, newflvReload], [oldUrl, oldflvReload]) => {
        console.log("视频播放组件", newUrl, oldflvReload, newflvReload);
        // url为空
        if (!newUrl) {
          state.loading = false;
          addLog(`address changing, empty address`);
          flvDestory();
        }
        // url改变了
        // else if (newUrl != oldurl) {
        //   addLog(
        //     `address changing,Old address:${oldurl},New address:${newUrl}`
        //   );
        //   flvInitLoad();
        // }
        // 如果传入的loading是true，并且url没有变化，则重新构建推流，因为后端是关闭了再打开的
        else if (newflvReload === true) {
          flvInitLoad();
          ctx.emit("update:flvReload", false);
        }
      }
    );

    /**
     * @description: 报错刷新
     * @return {*}
     * @Author: liuxin
     */
    function faultRefresh() {
      ctx.emit("faultRefresh"); // 传递给父组件，用于请求后端推流
      flvInitLoad();
    }

    /**
     * @description: 播放器初始化处理
     * @return {*}
     * @Author: liuxin
     */
    function flvInitLoad() {
      state.loading = true; // 添加加载动画
      state.errorCount = 0; // 错误连接次数置0
      flvDestory();
      addLog(`flv init load,loading:${state.loading},address:${prop.url}`);
      state.delayTimer = setTimeout(() => {
        flvCreated("flvInitLoad");
      }, Window.flvTimeOut); // 等待一会儿再打开，防止找不到元素，最好不要超过1000,，否则切换时，容易导致锁死
    }

    /**
     * @description: 构建播放器
     * @return {*}
     * @Author: liuxin
     */
    function flvCreated() {
      try {
        const videoElement = flvPlayerVideo.value;
        if (flvjs.isSupported() && videoElement) {
          addLog(`flv created,address:${prop.url}`);
          const flvOption = {
            url: prop.url, // 播放地址
            hasAudio: false, // 是否有音频
            hasVideo: true, //是否有视频
            isLive: true, // 是否是直播流，默认 true
            type: "flv", // 是否是直播流，默认 true
            stashInitialSize: 128, // 减少首帧显示等待时长
            ...prop.option,
          };
          state.flvPlayer = flvjs.createPlayer(flvOption, {
            enableWorker: false, // 不启用分离的线程进行转换，之前为true
            enableStashBuffer: false, // 关闭IO隐藏缓冲区
            stashInitialSize: 128, // 减少首帧显示等待时长
            autoCleanupSourceBuffer: true, // 打开自动清除缓存
            fixAudioTimestampGap: false, //false才会音视频同步,新增
            lazyLoad: false, // 去掉懒加载,新增
          });

          state.flvPlayer.attachMediaElement(videoElement);
          state.flvPlayer.load();
          state.flvPlayer.play();
          state.endedReloadFlag = true; // 重置画面停滞的播放状态，下次停滞了会再次打开
          videoElementEvent(); // 手动跳帧，防止延时
          flvPlayerEvent(); // 断流、卡顿处理
        }
      } catch (error) {
        console.error("构建错误", error);
      }
    }

    /**
     * @description: 销毁播放器
     * @return {*}
     * @Author: liuxin
     */
    function flvDestory() {
      if (state.delayTimer) {
        clearTimeout(state.delayTimer); // 清除推迟打开播放器定时器
      }
      if (state.flvPlayer == null) return; // 空对象，不执行销毁

      /* ----- 销毁开始 ----- */
      addLog(`flv destory,address:${prop.url}`);
      try {
        state.flvPlayer.off(flvjs.Events.ERROR, errorHandle);
        if (state.flvPlayer._hasPendingLoad) {
          state.flvPlayer.pause();
          state.flvPlayer.unload();
        }
        state.flvPlayer.detachMediaElement();
        state.flvPlayer.destroy();
        state.flvPlayer = null;
      } catch (error) {
        console.error("销毁错误");
      }
    }

    /**
     * @description: video监听事件
     * @return {*}
     * @Author: liuxin
     */
    function videoElementEvent() {
      const videoElement = flvPlayerVideo.value; // 媒体播放器
      if (!videoElement) {
        return;
      }

      /**
       * @description: 浏览器下载流事件，手动跳帧，防止累计延时
       * @return {*}
       * @Author: liuxin
       */
      videoElement.onprogress = (e) => {
        // 不需要跳帧，如：异常视频   或者没有数据流，则不进行跳帧
        if (!prop.isBufferedEnd || state.flvPlayer.buffered.length <= 0) {
          return;
        }
        state.loading = false;
        /* ----- 跳帧操作 ----- */
        let end = state.flvPlayer.buffered.end(0); //获取当前时间值
        let diff = end - state.flvPlayer.currentTime; //获取相差差值
        // 延迟过大或帧率不正常，通过跳帧的方式更新视频
        if (diff > 20 || diff < 0) {
          // addLog(`Manual frame skipping,address:${prop.url}`); // 添加日志
          state.flvPlayer.currentTime = state.flvPlayer.buffered.end(0) - 0.5; // 手动跳帧到最后
          return;
        }
        // 正常帧率，正常播放
        if (diff <= 1) {
          videoElement.playbackRate = 1;
        }
        // 10秒内的延时，1.1倍速播放
        else if (diff <= 10) {
          // addLog(`Chase frames manually 1.1,address:${prop.url}`); // 手动追帧
          videoElement.playbackRate = 1.1;
        }
        // 20秒内的延时，1.2倍速播放
        else if (diff <= 20) {
          // addLog(`Chase frames manually 1.2,address:${prop.url}`); // 手动追帧
          videoElement.playbackRate = 1.2;
        }
      };

      /**
       * @description: 监听点击事件，不执行暂停
       * @return {*}
       * @Author: liuxin
       */
      videoElement.onclick = (e) => {
        e.preventDefault();
      };
    }

    /**
     * @description: flv对象事件监听，断流、卡顿处理
     * @return {*}
     * @Author: liuxin
     */
    function flvPlayerEvent() {
      if (!state.flvPlayer._hasPendingLoad) {
        return;
      }

      state.flvPlayer.on(flvjs.Events.ERROR, errorHandle); // 监听出错消息后，销毁后重连
      state.flvPlayer.on(flvjs.Events.LOADING_COMPLETE, errorHandle); // ctrl+f5刷新，会莫名因为停止end不播放
      state.flvPlayer.on(flvjs.Events.STATISTICS_INFO, statisticsInfoHanle); // 断流重连
    }

    /**
     * @description: 错误回调事件
     * @param {*} errorType
     * @param {*} errorDetail
     * @param {*} errorInfo
     * @return {*}
     * @Author: liuxin
     */
    function errorHandle() {
      //视频出错后销毁重新创建 网络错误
      if (state.flvPlayer && state.errorCount <= state.maxReconnectCount) {
        addLog(`Video error ${state.errorCount} reconnection,
            address:${prop.url}`); // 视频报错N重连

        state.loading = true; // 添加loading动画
        state.errorCount++; //错误重连次数+1
        flvDestory();
        flvCreated("ERROR");
      }

      if (state.errorCount > state.maxReconnectCount) {
        state.loading = false; // 去掉loading
      }
    }

    /**
     * @description: 视频卡顿，销毁后重建
     * @param {*} errorType
     * @param {*} errorDetail
     * @param {*} errorInfo
     * @return {*}
     * @Author: liuxin
     */
    function statisticsInfoHanle(res) {
      // 初始化播放
      if (state.lastDecodedFrame == 0) {
        state.lastDecodedFrame = res.decodedFrames;
        return;
      }
      // 正常播放
      if (state.lastDecodedFrame != res.decodedFrames) {
        state.lastDecodedFrame = res.decodedFrames;
        state.loading = false; // 去掉loading动画
        state.errorCount = 0; // 错误连接次数归0
      }
      // 播放异常
      else {
        if (state.player) {
          addLog(`Reconnect after video freezes, address:${prop.url}`); // 添加日志
          state.errorCount = 0; // 错误连接次数归0
          state.lastDecodedFrame = 0; // 最后播放编码号
          flvDestory(); // 销毁对象
          flvCreated("statistics_info"); // 创建对象
        }
      }
    }

    /**
     * @description: 添加前后端日志
     * @param {*} log 日志文字
     * @return {*}
     * @Author: liuxin
     */
    function addLog(log) {
      // console.log(log);
      // 发送消息给后端 存日志
      // socket.send(
      //   JSON.stringify({
      //     api: "web_log",
      //     data: {
      //       log: log,
      //     },
      //   })
      // );
    }

    /**
     * @description: 全屏 / 退出全屏
     * @return {*}
     * @Author: liuxin
     */
    function fullscreenHandle() {
      state.isFlullscreen = !state.isFlullscreen;

      document.addEventListener("keydown", function (e) {
        //此处填写你的业务逻辑即可
        if (e.key == "Escape") {
          e.stopPropagation();
          state.isFlullscreen = false;
        }
      });
    }

    return {
      ...toRefs(state),
      flvPlayerVideo,
      flvInitLoad,
      faultRefresh,
      fullscreenHandle,
    };
  },
};
</script>

<style lang="scss" scoped>
.video-div {
  position: relative;
  width: 100%;
  height: 100%;
  &:hover {
    .fullscreen-span {
      display: block;
    }
  }
}
.video-div.video-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999999;
  margin: 0;
  background: $bgColor;
  .fullscreen-icon {
    font-size: 30px;
  }
}

.fullscreen-span {
  display: block;
  width: 100%;
  padding: 1% 3%;
  background: rgba($bgColor, 0.5);
  position: absolute;
  bottom: 0;
  display: none;
  text-align: right;
}

.fullscreen-icon {
  cursor: pointer;
  font-size: 20px;
}

.flv-video {
  width: 100%;
  height: 100%;
  object-fit: fill;
}
.flv-refresh {
  width: 100%;
  height: 100%;
  @include flex-box(null, center, center);
  cursor: pointer;
  @include position-absolute(0, null, null, 0);
  &:hover {
    color: $fontHoverColor;
  }
}

.camera-name {
  color: $dangerColor;
  @include position-absolute(null, null, 10px, 10px);
}
</style>