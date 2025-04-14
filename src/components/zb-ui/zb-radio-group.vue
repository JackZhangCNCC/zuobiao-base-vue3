<!--
  auther: Johnson
  date: 2025-04-02
  description: 单选框组组件
-->
<template>
  <a-radio-group
    v-bind="$attrs"
    :value="modelValue"
    :disabled="disabled"
    :options="options"
    :button-style="buttonStyle"
    @change="handleChange"
    :class="['zb-radio-group', $attrs.class, { 'is-disabled': disabled }]"
  >
    <slot></slot>
  </a-radio-group>
</template>

<script setup>
// 定义组件属性
const props = defineProps({
  // v-model绑定值
  modelValue: {
    type: [String, Number, Boolean],
    default: undefined
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
  },
  // 按钮样式
  buttonStyle: {
    type: String,
    default: undefined,
    validator: (value) => ['outline', 'solid', undefined].includes(value)
  }
})

// 定义事件
const emit = defineEmits([
  'update:modelValue',
  'change'
])

// 变更事件处理
const handleChange = (e) => {
  emit('update:modelValue', e.target.value)
  emit('change', e.target.value)
}
</script>

<style lang="less" scoped>
@import '../../assets/styles/design-tokens.less';

.zb-radio-group {
  font-size: @font-size-t2;
  
  :deep(.ant-radio-wrapper) {
    color: @text-color-primary;
    margin-right: @spacing-md;
    
    .ant-radio {
      .ant-radio-inner {
        border-color: @border-color-base;
        width: 16px;
        height: 16px;
      }
      
      &:hover .ant-radio-inner {
        border-color: @btn-primary-hover;
      }
      
      &.ant-radio-checked {
        .ant-radio-inner {
          border-color: @btn-primary;
          background-color: #ffffff;
        }
        
        &:hover .ant-radio-inner {
          border-color: @btn-primary-hover;
        }
      }
    }
    
    &.ant-radio-wrapper-disabled {
      .ant-radio-inner {
        background-color: @gray-2;
        border-color: @border-color-base !important;
      }
      
      &.ant-radio-wrapper-checked {
        .ant-radio-inner {
          border-color: @gray-6 !important;
          background-color: @gray-2 !important;
          
          &:after {
            display: block;
            background-color: @gray-6;
          }
        }
      }
    }
  }
  
  // 按钮样式
  :deep(.ant-radio-button-wrapper) {
    height: @control-height-md;
    line-height: @control-height-md;
    padding: 0 @spacing-md;
    border-color: @border-color-base;
    
    &:hover {
      color: @btn-primary-hover;
    }
    
    &.ant-radio-button-wrapper-checked {
      border-color: @btn-primary;
      color: @btn-primary-selected-color;
      background: @btn-primary;
      
      &:before {
        background-color: @btn-primary;
      }
    }
    
    &.ant-radio-button-wrapper-disabled {
      color: @text-color-disabled;
      background-color: @gray-2;
      border-color: @border-color-base;
      
      &.ant-radio-button-wrapper-checked {
        border-color: @gray-6;
        color: @gray-6;
        
        &:before {
          background-color: @gray-6;
        }
      }
    }
  }
}
</style> 