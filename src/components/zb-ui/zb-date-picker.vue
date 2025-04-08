<!--
  auther: Johnson
  date: 2025-04-02
  description: 日期选择器
-->
<template>
  <a-date-picker
    v-bind="$attrs"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :format="format"
    :allow-clear="allowClear"
    :show-time="showTime"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
    :class="['zb-date-picker', $attrs.class, { 'is-disabled': disabled }]"
  />
</template>

<script setup>
import { ref, watch } from 'vue'
import { format as formatDate } from 'date-fns'

// 定义组件属性
const props = defineProps({
  // v-model绑定值
  modelValue: {
    type: [Object, String],
    default: undefined
  },
  // 占位文本
  placeholder: {
    type: String,
    default: '请选择日期'
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 日期格式
  format: {
    type: String,
    default: 'YYYY-MM-DD'
  },
  // 是否支持清除
  allowClear: {
    type: Boolean,
    default: true
  },
  // 是否显示时间选择
  showTime: {
    type: [Boolean, Object],
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
const handleChange = (date, dateString) => {
  emit('update:modelValue', date)
  emit('change', date, dateString)
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

.zb-date-picker {
  width: 100%;
  
  :deep(.ant-picker) {
    border-radius: @border-radius-md;
    height: @control-height-md;
    padding: @control-padding-vertical @control-padding-horizontal;
    font-size: @font-size-t2;
    color: @text-color-primary;
    border-color: @border-color-base;
    transition: all 0.2s;
    
    .ant-picker-input {
      input {
        color: @text-color-primary;
        font-size: @font-size-t2;
        
        &::placeholder {
          color: @text-color-disabled;
        }
      }
    }
    
    &:hover {
      border-color: @btn-primary-hover;
    }
    
    &.ant-picker-focused {
      border-color: @btn-primary;
      box-shadow: 0 0 0 2px fade(@btn-primary, 20%);
    }
  }
  
  &.is-disabled {
    :deep(.ant-picker) {
      background-color: @gray-2;
      color: @text-color-disabled;
      cursor: not-allowed;
      border-color: @border-color-base;
      
      .ant-picker-input {
        input {
          color: @text-color-disabled;
        }
      }
      
      &:hover {
        border-color: @border-color-base;
      }
    }
  }
}

// 日期选择面板样式
:deep(.ant-picker-dropdown) {
  border-radius: @border-radius-md;
  box-shadow: @shadow-md;
  
  .ant-picker-header {
    color: @text-color-primary;
    border-bottom-color: @border-color-split;
    
    button {
      color: @text-color-secondary;
      
      &:hover {
        color: @btn-primary;
      }
    }
  }
  
  .ant-picker-cell {
    color: @text-color-secondary;
    
    &:hover .ant-picker-cell-inner {
      background-color: fade(@btn-primary, 10%);
    }
    
    &-in-view.ant-picker-cell-selected .ant-picker-cell-inner {
      background-color: @btn-primary;
      color: @gray-1;
    }
    
    &-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
      border-color: @btn-primary;
    }
  }
  
  .ant-picker-today-btn {
    color: @btn-primary;
  }
}
</style> 