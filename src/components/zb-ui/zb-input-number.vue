<!--
  auther: Johnson
  date: 2025-04-08
  description: 数字输入框组件
-->
<template>
  <a-input-number
    v-bind="$attrs"
    :value="modelValue"
    :min="min"
    :max="max"
    :step="step"
    :precision="precision"
    :disabled="disabled"
    :placeholder="placeholder"
    @change="handleChange"
    @blur="handleBlur"
    @focus="handleFocus"
    :class="['zb-input-number', $attrs.class, { 'is-disabled': disabled }]"
  />
</template>

<script setup>
// 定义组件属性
const props = defineProps({
  // v-model绑定值
  modelValue: {
    type: [Number, String],
    default: undefined
  },
  // 最小值
  min: {
    type: Number,
    default: -Infinity
  },
  // 最大值
  max: {
    type: Number,
    default: Infinity
  },
  // 步长
  step: {
    type: [Number, String],
    default: 1
  },
  // 精度
  precision: {
    type: Number,
    default: undefined
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 占位文本
  placeholder: {
    type: String,
    default: '请输入'
  }
});

// 定义事件
const emit = defineEmits([
  'update:modelValue',
  'change',
  'blur',
  'focus'
]);

// 变更事件处理
const handleChange = (value) => {
  emit('update:modelValue', value);
  emit('change', value);
};

// 失焦事件处理
const handleBlur = (e) => {
  emit('blur', e);
};

// 聚焦事件处理
const handleFocus = (e) => {
  emit('focus', e);
};
</script>

<style lang="less" scoped>
@import '../../assets/styles/design-tokens.less';

.zb-input-number {
  width: 100%;
  
  :deep(.ant-input-number) {
    width: 100%;
    border-radius: @border-radius-md;
    height: @control-height-md;
    
    .ant-input-number-input {
      height: @control-height-md;
      padding: @control-padding-vertical @control-padding-horizontal;
      font-size: @font-size-t2;
      color: @text-color-primary;
    }
    
    &:hover {
      border-color: @btn-primary-hover;
    }
    
    &.ant-input-number-focused {
      border-color: @btn-primary;
      box-shadow: 0 0 0 2px fade(@btn-primary, 20%);
    }
  }
  
  &.is-disabled {
    :deep(.ant-input-number) {
      background-color: @gray-2;
      color: @text-color-disabled;
      cursor: not-allowed;
      border-color: @border-color-base;
      
      .ant-input-number-input {
        color: @text-color-disabled;
      }
      
      &:hover {
        border-color: @border-color-base;
      }
    }
  }
  
  // 处理按钮样式
  :deep(.ant-input-number-handler-wrap) {
    background-color: transparent;
    
    .ant-input-number-handler {
      &:hover {
        .ant-input-number-handler-up-inner,
        .ant-input-number-handler-down-inner {
          color: @btn-primary;
        }
      }
    }
  }
}
</style> 