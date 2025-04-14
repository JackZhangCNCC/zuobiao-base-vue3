<!--
  auther: Johnson
  date: 2025-03-26
  description: 文本域组件
-->
<template>
  <a-textarea
    v-bind="$attrs"
    :placeholder="placeholder"
    :disabled="disabled"
    :maxlength="maxlength"
    :show-count="showCount"
    :value="modelValue"
    :auto-size="autoSize"
    @input="handleInput"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
    :class="['zb-textarea', $attrs.class, { 'is-disabled': disabled }]"
  />
</template>

<script setup>
// 定义组件属性
const props = defineProps({
  // v-model绑定值
  modelValue: {
    type: String,
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
  },
  // 自适应高度
  autoSize: {
    type: [Boolean, Object],
    default: () => ({ minRows: 4, maxRows: 8 })
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

.zb-textarea {
  border-radius: @border-radius-md;
  font-size: @font-size-t2;
  color: @text-color-primary;
  min-height: 100px;
  line-height: @line-height-base;
  
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

:deep(.ant-input-show-count-suffix) {
  color: @text-color-disabled;
  font-size: @font-size-t1;
  position: absolute;
  bottom: @spacing-xxs;
  right: @spacing-xs;
}
</style> 