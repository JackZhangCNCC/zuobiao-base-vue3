<!--
  auther: Johnson
  date: 2025-04-01
  description: 输入框组件
-->
<template>
  <a-input
    v-bind="$attrs"
    :placeholder="placeholder"
    :disabled="disabled"
    :maxlength="maxlength"
    :show-count="showCount"
    :value="modelValue"
    @input="handleInput"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
    :class="['zb-input', $attrs.class, { 'is-disabled': disabled }]"
  />
</template>

<script setup>
import { computed } from 'vue'

// 定义组件属性
const props = defineProps({
  // v-model绑定值
  modelValue: {
    type: [String, Number],
    default: ''
  },
  // 占位文本
  placeholder: {
    type: String,
    default: '请输入'
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 最大长度
  maxlength: {
    type: Number,
    default: undefined
  },
  // 是否显示计数器
  showCount: {
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

// 输入事件处理
const handleInput = (e) => {
  const value = e.target.value
  emit('update:modelValue', value)
}

// 变更事件处理
const handleChange = (e) => {
  emit('change', e.target.value)
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

.zb-input {
  border-radius: @border-radius-md;
  font-size: @font-size-t2;
  height: @control-height-md;
  padding: @control-padding-vertical @control-padding-horizontal;
  color: @text-color-primary;
  
  &:hover {
    border-color: @btn-primary-hover;
  }
  
  &:focus, &.ant-input-focused {
    border-color: @btn-primary;
    box-shadow: 0 0 0 2px fade(@btn-primary, 20%);
  }
  
  &.is-disabled {
    background-color: @gray-2;
    color: @text-color-disabled;
    cursor: not-allowed;
    border-color: @border-color-base;
    
    &:hover {
      border-color: @border-color-base;
    }
  }
  
  &::placeholder {
    color: @text-color-disabled;
  }
}

// 修复计数器样式
:deep(.ant-input-show-count-suffix) {
  color: @text-color-disabled;
  font-size: @font-size-t1;
}
</style> 