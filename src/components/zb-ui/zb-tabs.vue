<!--
  auther: Johnson
  date: 2025-04-07
  description: 标签页组件
-->
<template>
  <div class="zb-tabs">
    <!-- 选项卡头部 -->
    <div class="zb-tabs-nav">
      <!-- 通过items配置生成的选项卡 -->
      <template v-if="items && items.length">
        <div
          v-for="item in items"
          :key="item.key"
          class="zb-tabs-tab"
          :class="{ 'zb-tabs-tab-active': modelValue === item.key, 'zb-tabs-tab-disabled': item.disabled }"
          @click="!item.disabled && handleTabClick(item.key)"
        >
          <span>{{ item.label }}</span>
        </div>
      </template>
      
      <!-- 通过插槽提供的选项卡 -->
      <template v-else>
        <div
          v-for="(tab, index) in tabList"
          :key="tab.name || index"
          class="zb-tabs-tab"
          :class="{ 'zb-tabs-tab-active': modelValue === tab.name, 'zb-tabs-tab-disabled': tab.disabled }"
          @click="!tab.disabled && handleTabClick(tab.name)"
        >
          <span>{{ tab.label }}</span>
        </div>
      </template>
    </div>
    
    <!-- 选项卡内容区域 -->
    <div class="zb-tabs-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, provide, computed } from 'vue';

export default defineComponent({
  name: 'ZbTabs',
  props: {
    // 当前选中的选项卡
    modelValue: {
      type: [String, Number],
      default: ''
    },
    // 选项卡配置项
    items: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    // 保存所有的tab pane
    const tabList = ref([]);
    
    // 注册tab pane
    const registerTabPane = (pane) => {
      tabList.value.push(pane);
      
      // 如果没有设置modelValue，则默认选中第一个tab
      if (!props.modelValue && tabList.value.length === 1) {
        emit('update:modelValue', pane.name);
      }
    };
    
    // 注销tab pane
    const unregisterTabPane = (name) => {
      const index = tabList.value.findIndex(tab => tab.name === name);
      if (index !== -1) {
        tabList.value.splice(index, 1);
      }
    };
    
    // 处理选项卡点击
    const handleTabClick = (name) => {
      if (props.modelValue !== name) {
        emit('update:modelValue', name);
        emit('change', name);
      }
    };
    
    // 当前激活的tab
    const currentTab = computed(() => props.modelValue);
    
    // 提供给子组件的上下文
    provide('TABS_CONTEXT', {
      currentTab,
      registerTabPane,
      unregisterTabPane
    });
    
    return {
      tabList,
      handleTabClick
    };
  }
});
</script>

<style lang="less" scoped>
@import '../../assets/styles/design-tokens.less';

.zb-tabs {
  width: 100%;
  
  &-nav {
    display: flex;
    border-bottom: none;
    margin-bottom: 8px;
  }
  
  &-tab {
    padding: 6px 14px;
    cursor: pointer;
    font-size: 16px;
    color: #0F1948;
    position: relative;
    text-align: center;
    
    &:hover {
      color: #364FC7;
    }
    
    &-active {
      color: #ffffff !important;
      font-weight: 500;
      background-color: #364FC7;
      border-radius: 4px;
    }
    
    &-disabled {
      color: rgba(0, 0, 0, 0.25);
      cursor: not-allowed;
      
      &:hover {
        color: rgba(0, 0, 0, 0.25);
      }
    }
  }
  
  &-content {
    padding: 0;
  }
}
</style> 