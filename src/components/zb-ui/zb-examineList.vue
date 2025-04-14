<template>
  <div class="examine-list-layout">
    <div
      class="examine-list-item"
      :class="{ end: item.taskName === '结束' }"
      v-for="item in list"
      :key="item.auditTime"
    >
      <div
        class="examine-list-item-l"
        :style="getLeftItemStyle(item.statusName)"
      >
        {{ item.statusName }}
      </div>
      <div
        class="examine-list-item-r"
        :style="getRightItemStyle(item.statusName)"
      >
        <div v-if="item.taskName === '结束'">
          <span>流程结束</span>
        </div>
        <div v-else-if="item.statusName === '发起'">
          <span>申请时间：{{ item.auditTime }}</span>
          <span class="mar-l-60">提交人：{{ item.assignee }}</span>
        </div>
        <div v-else>
          <span>审批时间：{{ item.auditTime }}</span>
          <span class="mar-l-60">{{ item.taskName }}：{{ item.assignee }}</span>
          <div style="margin-top: 5px; word-break: break-all">
            审批意见：{{ item.comments }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  list: {
    type: Array,
    default: () => [],
  },
});

const statusColorConfig = ref({
  发起: {
    backgroundColor1: "#64C1A6",
    backgroundColor2: "#F3FAF8",
    color: "#FFFFFF",
    border: "1px solid #A4E0C3",
  },
  通过: {
    backgroundColor1: "#3B53C8",
    backgroundColor2: "#F8F8FF",
    color: "#FFFFFF",
    border: "1px solid #E6E8F0",
  },
  驳回: {
    backgroundColor1: "#FF8787",
    backgroundColor2: "#FFF7F7",
    color: "#FFFFFF",
    border: "1px solid #FFD8D8",
  },
  结束: {
    backgroundColor1: "#D9D9D9",
    backgroundColor2: "#F9F9F9",
    color: "#FFFFFF",
    border: "1px solid #E6E8F0",
  },
  作废: {
    backgroundColor1: "#D9D9D9",
    backgroundColor2: "#F9F9F9",
    color: "#FFFFFF",
    border: "1px solid #E6E8F0",
  },
});

// 计算左侧项的样式
const getLeftItemStyle = computed(() => (statusName) => {
  const config = statusColorConfig.value[statusName];
  return {
    backgroundColor: config?.backgroundColor1,
    color: config?.color,
  };
});

// 计算右侧项的样式
const getRightItemStyle = computed(() => (statusName) => {
  const config = statusColorConfig.value[statusName];
  return {
    backgroundColor: config?.backgroundColor2,
    border: config?.border,
  };
});
</script>

<style lang="less" scoped>
.examine-list-layout {
  width: 100%;
  padding: 20px;

  .examine-list-item:before {
    width: 0.5px;
    content: "1";
    opacity: 0.5;
    border-left: dashed 1px #b2afc2;
    height: 100%;
    position: absolute;
    left: 24px;
  }
  .examine-list-item.end:before {
    opacity: 0;
  }
  .examine-list-item {
    display: flex;
    position: relative;
    padding-bottom: 20px;

    .examine-list-item-l {
      width: 48px;
      height: 48px;
      background: #64c1a6;
      border-radius: 24px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: 400;
      font-size: 14px;
      color: #ffffff;
      z-index: 1;
    }

    .examine-list-item-r {
      width: 320px;
      padding: 17px 20px;
      font-weight: 400;
      font-size: 14px;
      color: #040432;
      margin-left: 20px;
    }
  }
  .examine-list-item:last-child {
    padding-bottom: 0 !important;
  }
}
</style>
