<!--
  auther: Johnson
  date: 2025-04-01
  description: 单选框组件
-->
<template>
  <a-radio
    v-bind="$attrs"
    :checked="checked === undefined ? modelValue : checked"
    :disabled="disabled"
    :value="value"
    class="zb-radio"
    @change="handleChange"
  >
    <slot></slot>
  </a-radio>
</template>

<script>
import { Radio } from 'ant-design-vue';

export default {
  name: 'ZbRadio',
  components: {
    ARadio: Radio,
  },
  props: {
    value: {
      type: [String, Number, Boolean],
      default: undefined
    },
    // 支持v-model方式
    modelValue: {
      type: Boolean,
      default: false
    },
    // 支持checked方式 (兼容旧代码)
    checked: {
      type: Boolean,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:checked', 'update:modelValue', 'change'],
  setup(props, { emit }) {
    const handleChange = (e) => {
      if (props.checked !== undefined) {
        emit('update:checked', e.target.checked);
      }
      emit('update:modelValue', e.target.checked);
      emit('change', e);
    };

    return {
      handleChange
    };
  }
};
</script>

<style lang="less" scoped>
@import '../../assets/styles/design-tokens.less';

.zb-radio {
  font-size: @font-size-base;
  
  /* 基础样式 */
  :deep(.ant-radio) {
    .ant-radio-inner {
      border-color: #D9D9D9;
      background-color: #fff;
      
      &:after {
        width: 20px;
        height: 20px;
        margin-block-start: -10px;
        margin-inline-start: -10px;
        background-color: @btn-primary;
      }
    }
    
    &:hover .ant-radio-inner {
      border-color: @btn-primary;
    }
  }
  
  /* 选中状态 - 纯蓝色圆点 */
  :deep(.ant-radio-checked) {
    .ant-radio-inner {
      border-color: @btn-primary;
      background-color: #ffffff;
    }
    
    &:hover .ant-radio-inner {
      border-color: @btn-primary-hover;
    }
  }
  
  /* 禁用状态 */
  :deep(.ant-radio-disabled) {
    .ant-radio-inner {
      border-color: #d9d9d9 !important;
      background-color: #f5f5f5 !important;
    }
    
    &.ant-radio-checked .ant-radio-inner {
      background-color: #f5f5f5 !important;
      border-color: #d9d9d9 !important;
      
      &:after {
        transform: scale(0.5);
        opacity: 1;
        background-color: rgba(0, 0, 0, 0.25);
      }
    }
  }
}
</style> 