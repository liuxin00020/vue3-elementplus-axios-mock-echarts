<!--
 * @Author: liuxin
 * @Date: 2022-06-02 09:49:07
 * @LastEditors: liuxin
 * @LastEditTime: 2022-06-10 16:55:45
 * @Description: 
-->
<template>
  <div>
    <el-row class="slef-margin-bottom" :gutter="20">
      <el-col :span="4">
        <el-input v-model="userName" placeholder="姓名" />
      </el-col>
      <el-col :span="4"
        ><el-button type="primary" size="default" @click="getList">
          查询
        </el-button>
        <el-button type="primary" size="default" @click="showEmsg">
          点击显示消息框
        </el-button>
      </el-col>
    </el-row>

    <el-table :data="tableData" style="width: 100%" v-loading="loading">
      <el-table-column prop="date" label="日期" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="age" label="年龄" />
      <el-table-column prop="sex" label="性别" />
    </el-table>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { getUseList } from "@/apis/mockTest";
export default {
  setup() {
    const state = reactive({
      userName: "",

      loading: true,

      tableData: null,
    });

    onMounted(() => {
      getList();
    });

    /**
     * @description: 获取数据
     * @Author: liuxin
     */
    const getList = () => {
      state.loading = true;
      getUseList({ userName: state.userName })
        .then((res) => {
          console.log(res);
          state.loading = false;
          state.tableData = res.data;
        })
        .catch(() => {
          state.loading = false;
          state.tableData = [];
        });
    };

    const showEmsg = () => {
      ElMessage("这是消息提示");
    };

    return {
      ...toRefs(state),
      showEmsg,
      getList,
    };
  },
};
</script>

<style lang="scss" scoped>
</style>