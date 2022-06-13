<!--
 * @Author: liuxin
 * @Date: 2022-06-13 11:03:49
 * @LastEditors: liuxin
 * @LastEditTime: 2022-06-13 16:35:54
 * @Description: 测试echarts
-->
<template>
  <div>
    <div id="chartTest1"></div>
    <div id="chartTest2"></div>
  </div>
</template>

<script>
import { getChart } from "@/apis/mockTest";
import { onMounted } from "vue";
import echarts from "@/utils/echartsUtil";
// 引入柱状图图表，图表后缀都为 Chart
import { BarChart } from "echarts/charts";
// 注册必须的组件
echarts.use([BarChart]);
import "@/utils/echartsDark";
import chalk from "@/utils/ecahrtsChalk";
echarts.registerTheme("chalk", chalk); //  注册主题；
export default {
  setup() {
    onMounted(() => {
      getChart().then((res) => {
        initChart(res.data.xDatas, res.data.yDatas, "chartTest1", "dark");
        initChart(res.data.xDatas, res.data.yDatas, "chartTest2", "chalk");
      });
    });

    /**
     * @description: 渲染图表
     * @param {*} xDatas x轴数据
     * @param {*} yDatas y轴数据
     * @return {*}
     * @Author: liuxin
     */
    const initChart = (xDatas, yDatas, id, theme) => {
      // 接下来的使用就跟之前一样，初始化图表，设置配置项
      const myChart = echarts.init(document.getElementById(id), theme);
      myChart.setOption({
        grid: {
          containLabel: true,
        },
        tooltip: {
          trigger: "axis",
        },
        legend: {
          show: false,
        },
        xAxis: {
          type: "category",
          name: "日期",
          data: xDatas,
        },
        yAxis: {
          type: "value",
          name: "人数",
        },
        series: [
          {
            name: "客流流量",
            data: yDatas,
            type: "bar",
            barMaxWidth: "40%",
          },
        ],
      });
      window.addEventListener("resize", function () {
        myChart.resize();
      });
    };

    return {};
  },
};
</script>

<style lang="scss" scoped>
#chartTest1,
#chartTest2 {
  width: 50%;
  height: 600px;
  display: inline-block;
}
</style>