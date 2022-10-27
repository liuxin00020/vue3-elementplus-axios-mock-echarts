<!--
 * @Author: liuxin
 * @Date: 2022-05-19 13:59:30
 * @LastEditors: liuxin
 * @LastEditTime: 2022-10-27 11:47:04
 * @Description: 视频播放器
-->
<template >
  <div
    v-if="url && errorCount <= maxReconnectCount"
    class="video-div"
    :class="isFlullscreen ? 'video-fullscreen' : ''"
  >
    <video
      muted
      autoplay
      width="100%"
      height="100%"
      ref="flvPlayerVideo"
      class="flv-video"
    >
      <div>浏览器不支持video</div>
    </video>
    <!-- 退出全屏 / 全屏 -->
    <span class="fullscreen-span">
      <IconFont
        class="fullscreen-icon"
        :type="isFlullscreen ? 'icon-tuichuquanping' : 'icon-a-9Equanping'"
        @click="fullscreenHandle"
      />
    </span>
  </div>
  <Empty
    v-else-if="!url"
    icon="iconshipinjiazaishibai"
    text="暂无播放源"
  />
  <Empty
    v-else
    class="flv-refresh"
    icon="iconicon"
    text="出错了，点击我刷新"
    @click="faultRefresh"
  />
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
 * @param {Boolean} flvLoading 用于加载loading  默认false
 * @param {Boolean} isOpen  推流是否已经打开，已经打开，则不用延时 默认false
 * @return {*}
 * @example 
 *      <div
          class="video-item"
          v-loading="item.loading"
          element-loading-text="Loading..."
        >
          <!-- 实时视频 -->
          <FlvVideo
            :url="item.stream_url"
            class="flv-video"
            v-model:flvLoading="item.loading"
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

    flvLoading: {
      type: Boolean,
      default: false,
    },
  },
  setup(prop, ctx) {
    const flvPlayerVideo = ref(null);
    const state = reactive({
      loading: true,
      flvPlayer: null,
      delayTimer: null,

      maxReconnectCount: Window.reconnectFlvCount, // 重连的最大次数
      errorCount: 0, // 错误次数，连接10次则不再连接
      lastDecodedFrame: 0, // 用于判断卡顿
      endedReloadFlag: true, // 用于判断推流结束，是否要再次构建（情景：后端关闭推流后重新打开，有几秒的断流时间）

      isFlullscreen: false,
    });

    onMounted(() => {
      // 如果有地址，则直接构建视频
      if (prop.url) {
        flvInitLoad();
      }
    });

    onUnmounted(() => {
      flvDestory();
    });

    watch(
      () => [prop.url, state.loading, prop.flvLoading],
      (newValue, oldValue) => {
        const _url = newValue[0],
          _urlOld = oldValue[0],
          _loading = newValue[1],
          _loadingOld = oldValue[1],
          _flvLoading = newValue[2];
        // url为空
        if (!_url) {
          state.loading = false;
          addLog(`address changing, empty address`);
          flvDestory();
        }
        // url改变了
        else if (_url != _urlOld) {
          addLog(`address changing,Old address:${_urlOld},New address:${_url}`);
          flvInitLoad();
        }
        // 如果传入的loading是true，并且url没有变化，则重新构建推流，因为后端是关闭了再打开的
        else if (_flvLoading === true) {
          // addLog(`_flvLoading:${_flvLoading}`);
          ctx.emit("update:flvLoading", false); // 反馈给父组件的loading
        }

        if (_loading != _loadingOld) {
          // addLog(`flv component loading:${_loading}`);
          ctx.emit("update:flvLoading", _loading); // 反馈给父组件的loading
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
     * @param {*} handleLoading loading状态
     * @return {*}
     * @Author: liuxin
     */
    function flvInitLoad(handleLoading = true) {
      state.loading = handleLoading; // loading动画
      state.errorCount = 0; // 错误连接次数置0
      flvDestory();
      addLog(`flv init load,loading:${handleLoading},address:${prop.url}`);
      state.delayTimer = setTimeout(() => {
        flvCreated();
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
        console.error("构建错误");
      }
    }

    /**
     * @description: 销毁播放器
     * @return {*}
     * @Author: liuxin
     */
    function flvDestory() {
      if (state.flvPlayer == null) return;
      addLog(`flv destory,address:${prop.url}`);
      try {
        if (state.flvPlayer._hasPendingLoad) {
          state.flvPlayer.pause();
          state.flvPlayer.unload();
        }
        state.flvPlayer.detachMediaElement();
        state.flvPlayer.destroy();
        state.flvPlayer = null;
        clearTimeout(state.delayTimer); // 清除推迟打开播放器定时器
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
      videoElement.addEventListener("progress", () => {
        if (state.flvPlayer.buffered.length) {
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
        }
      });

      /**
       * @description: 监听停止事件，如果是后端关闭了，再次打开，则需要重新构建，这里从上次打开开始计算，只重连一次
       * @return {*}
       * @Author: liuxin
       */
      videoElement.addEventListener("ended", () => {
        state.loading = false; // 去掉loading动画
        if (state.endedReloadFlag) {
          addLog(`Video ended, reconnecting:${prop.url}`); // 日志
          state.endedReloadFlag = false; // 停滞重载的标识，设置为false，目的是只重载一次，若无法播放，会进入error事件重载
          flvInitLoad(false); // 销毁后重新构建，无loading动画，有延时播放
        }
      });

      /**
       * @description: 监听点击事件，不执行暂停
       * @return {*}
       * @Author: liuxin
       */
      videoElement.addEventListener("click", (e) => {
        e.preventDefault();
      });
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

      /**
       * @description: 监听出错消息后，销毁后重连
       * @return {*}
       * @Author: liuxin
       */
      state.flvPlayer.on(
        flvjs.Events.ERROR,
        (errorType, errorDetail, errorInfo) => {
          //视频出错后销毁重新创建 网络错误
          if (state.flvPlayer && state.errorCount <= state.maxReconnectCount) {
            addLog(`Video error ${state.errorCount} reconnection,
            address:${prop.url},
            errorinfo:${JSON.stringify(errorInfo)}`); // 视频报错N重连
            state.errorCount++;
            flvDestory();
            flvCreated();
          }

          if (state.errorCount > state.maxReconnectCount) {
            state.loading = false; // 去掉loading
          }
        }
      );

      /**
       * @description: 视频卡顿，销毁后重建
       * @return {*}
       * @Author: liuxin
       */
      state.flvPlayer.on("statistics_info", (res) => {
        // 初始化播放
        if (state.lastDecodedFrame == 0) {
          state.lastDecodedFrame = res.decodedFrames;
          return;
        }
        // 正常播放
        if (state.lastDecodedFrame != res.decodedFrames) {
          state.lastDecodedFrame = res.decodedFrames;
          if ((state.loading = true)) {
            state.loading = false; // 去掉loading
          }
        }
        // 播放异常
        else {
          if (state.player) {
            addLog(`Reconnect after video freezes, address:${prop.url}`); // 添加日志
            state.errorCount = 0; // 错误连接次数归0
            state.lastDecodedFrame = 0; // 最后播放编码号
            flvDestory(); // 销毁对象
            flvCreated(); // 创建对象
          }
        }
      });
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
      // scoket.send(
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
  z-index: 9999;
  margin: 0;
  background-color: black;
  .fullscreen-icon {
    font-size: 30px;
  }
}

.fullscreen-span {
  display: block;
  width: 100%;
  padding: 1% 3%;
  background: rgba(black, 0.5);
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
  &:hover {
    color: $primaryColor;
  }
}
</style>