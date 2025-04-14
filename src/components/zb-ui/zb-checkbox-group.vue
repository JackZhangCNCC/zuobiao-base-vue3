<!--
  auther: Johnson
  date: 2025-04-02
  description: 复选框组组件
-->
<template>
  <a-checkbox-group
    v-bind="$attrs"
    :value="modelValue"
    :disabled="disabled"
    :options="options"
    @change="handleChange"
    :class="['zb-checkbox-group', $attrs.class, { 'is-disabled': disabled }]"
  >
    <slot></slot>
  </a-checkbox-group>
</template>

<script setup>
// 定义组件属性
const props = defineProps({
  // v-model绑定值
  modelValue: {
    type: Array,
    default: () => []
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 选项数据
  options: {
    type: Array,
    default: () => []
  }
})

// 定义事件
const emit = defineEmits([
  'update:modelValue',
  'change'
])

// 变更事件处理
const handleChange = (checkedValues) => {
  emit('update:modelValue', checkedValues)
  emit('change', checkedValues)
}
</script>

<style lang="less" scoped>
@import '../../assets/styles/design-tokens.less';

.zb-checkbox-group {
  font-size: @font-size-t2;
  
  :deep(.ant-checkbox-wrapper) {
    color: @text-color-primary;
    margin-right: @spacing-md;
    
    .ant-checkbox {
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
    
    &.ant-checkbox-wrapper-disabled {
      .ant-checkbox {
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
}
</style> 