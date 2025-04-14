<!--
  auther: Johnson
  date: 2025-04-01
  description: 复选框组件
-->
<template>
  <a-checkbox
    v-bind="$attrs"
    :checked="modelValue"
    :disabled="disabled"
    @change="handleChange"
    :class="['zb-checkbox', $attrs.class, { 'is-disabled': disabled }]"
  >
    <slot></slot>
  </a-checkbox>
</template>

<script setup>
// 定义组件属性
const props = defineProps({
  // v-model绑定值
  modelValue: {
    type: Boolean,
    default: false
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits([
  'update:modelValue',
  'change'
])

// 变更事件处理
const handleChange = (e) => {
  emit('update:modelValue', e.target.checked)
  emit('change', e.target.checked)
}
</script>

<style lang="less" scoped>
@import '../../assets/styles/design-tokens.less';

.zb-checkbox {
  font-size: @font-size-t2;
  color: @text-color-primary;
  
  :deep(.ant-checkbox) {
    top: 0;
    
    .ant-checkbox-inner {
      border-color: @border-color-base;
      border-radius: @border-radius-sm;
      width: 16px;
      height: 16px;
    }
    
    &:hover .ant-checkbox-inner {
      border-color: @btn-primary-hover;
    }
    
    &.ant-checkbox-checked {
      .ant-checkbox-inner {
        background-color: @btn-primary;
        border-color: @btn-primary;
        
        &:after {
          border-color: @gray-1;
        }
      }
      
      &:hover .ant-checkbox-inner {
        background-color: @btn-primary-hover;
        border-color: @btn-primary-hover;
      }
    }
  }
  
  &.is-disabled {
    :deep(.ant-checkbox) {
      .ant-checkbox-inner {
        background-color: @gray-2;
        border-color: @border-color-base !important;
      }
      
      &.ant-checkbox-checked {
        .ant-checkbox-inner {
          background-color: @gray-6;
          border-color: @gray-6 !important;
        }
      }
    }
  }
}
</style> 