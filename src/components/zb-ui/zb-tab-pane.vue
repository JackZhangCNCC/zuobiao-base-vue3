<!--
  auther: Johnson
  date: 2025-04-03
  description: 标签页面板组件
-->
<template>
  <div v-show="isActive" class="zb-tab-pane">
    <slot></slot>
  </div>
</template>

<script>
import { defineComponent, inject, computed, onMounted, onBeforeUnmount } from 'vue';

export default defineComponent({
  name: 'ZbTabPane',
  props: {
    // 选项卡唯一标识
    name: {
      type: [String, Number],
      required: true
    },
    // 选项卡标题
    label: {
      type: String,
      required: true
    },
    // 是否禁用
    disabled: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // 获取父组件提供的上下文
    const { currentTab, registerTabPane, unregisterTabPane } = inject('TABS_CONTEXT');
    
    // 计算当前选项卡是否激活
    const isActive = computed(() => currentTab.value === props.name);
    
    // 组件挂载时注册
    onMounted(() => {
      registerTabPane({
        name: props.name,
        label: props.label,
        disabled: props.disabled
      });
    });
    
    // 组件卸载前注销
    onBeforeUnmount(() => {
      unregisterTabPane(props.name);
    });
    
    return {
      isActive
    };
  }
});
</script>

<style lang="less" scoped>
.zb-tab-pane {
  width: 100%;
}
</style> 