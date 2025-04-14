<!--
  auther: Johnson
  date: 2025-03-31
  description: 下拉选择框组件
-->
<template>
  <a-select
    v-bind="$attrs"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :options="options"
    :mode="mode"
    :loading="loading"
    :allow-clear="allowClear"
    :show-search="showSearch"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
    :class="['zb-select', $attrs.class, { 'is-disabled': disabled }]"
  >
    <slot></slot>
  </a-select>
</template>

<script setup>
// 定义组件属性
const props = defineProps({
  // v-model绑定值
  modelValue: {
    type: [String, Number, Array],
    default: undefined
  },
  // 占位文本
  placeholder: {
    type: String,
    default: '请选择'
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 选项列表
  options: {
    type: Array,
    default: () => []
  },
  // 选择模式 (multiple/tags)
  mode: {
    type: String,
    default: undefined
  },
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  },
  // 是否支持清除
  allowClear: {
    type: Boolean,
    default: true
  },
  // 是否支持搜索
  showSearch: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits([
  'update:modelValue',
  'change',
  'blur',
  'focus'
])

// 变更事件处理
const handleChange = (value) => {
  emit('update:modelValue', value)
  emit('change', value)
}

// 失焦事件处理
const handleBlur = (e) => {
  emit('blur', e)
}

// 聚焦事件处理
const handleFocus = (e) => {
  emit('focus', e)
}
</script>

<style lang="less" scoped>
@import '../../assets/styles/design-tokens.less';

.zb-select {
  width: 100%;
  
  :deep(.ant-select-selector) {
    border-radius: @border-radius-md !important;
    height: @control-height-md !important;
    padding: @control-padding-vertical @control-padding-horizontal !important;
    font-size: @font-size-t2;
    color: @text-color-primary;
    border-color: @border-color-base !important;
    
    .ant-select-selection-item {
      color: @text-color-primary;
    }
    
    .ant-select-selection-placeholder {
      color: @text-color-disabled;
      line-height: @control-height-md;
    }
  }
  
  &:hover {
    :deep(.ant-select-selector) {
      border-color: @btn-primary-hover !important;
    }
  }
  
  &.ant-select-focused {
    :deep(.ant-select-selector) {
      border-color: @btn-primary !important;
      box-shadow: 0 0 0 2px fade(@btn-primary, 20%) !important;
    }
  }
  
  &.is-disabled {
    :deep(.ant-select-selector) {
      background-color: @gray-2 !important;
      color: @text-color-disabled !important;
      cursor: not-allowed !important;
      border-color: @border-color-base !important;
      
      .ant-select-selection-item {
        color: @text-color-disabled;
      }
    }
    
    &:hover {
      :deep(.ant-select-selector) {
        border-color: @border-color-base !important;
      }
    }
  }
}

// 下拉菜单样式
:deep(.ant-select-dropdown) {
  border-radius: @border-radius-md;
  box-shadow: @shadow-md;
  
  .ant-select-item {
    padding: @spacing-xs @spacing-sm;
    font-size: @font-size-t2;
    color: @text-color-primary;
    
    &-option-active {
      background-color: fade(@btn-primary, 10%);
    }
    
    &-option-selected {
      background-color: fade(@btn-primary, 15%);
      color: @btn-primary;
      font-weight: @font-weight-medium;
    }
  }
}

// 修复多选模式下的标签样式
:deep(.ant-select-multiple) {
  .ant-select-selection-item {
    background-color: @gray-3;
    border: none;
    border-radius: @border-radius-md;
    height: 24px;
    line-height: 24px;
    margin-top: 1px;
    margin-bottom: 1px;
    margin-right: 5px;
    padding: 0 @spacing-xs;
    
    .ant-select-selection-item-content {
      margin-right: @spacing-xxs;
    }
    
    .ant-select-selection-item-remove {
      color: @text-color-secondary;
      font-size: @font-size-t1;
      
      &:hover {
        color: @text-color-primary;
      }
    }
  }
  
  &.ant-select-disabled {
    .ant-select-selection-item {
      color: @text-color-disabled;
      background-color: @gray-2;
      
      .ant-select-selection-item-remove {
        color: @text-color-disabled;
        
        &:hover {
          color: @text-color-disabled;
        }
      }
    }
  }
}
</style> 