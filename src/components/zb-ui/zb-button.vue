<!--
  auther: Johnson
  date: 2025-03-31
  description: 按钮组件
-->
<template>
  <a-button
    v-bind="$attrs"
    :type="type"
    :size="size"
    :disabled="disabled"
    :loading="loading"
    :class="['zb-button', $attrs.class, size, {'with-icon': hasIcon}]"
    @click="handleClick"
  >
    <!-- Ant Design Vue 图标 - 非loading状态 -->
    <span v-if="iconType === 'antd' && icon && !loading" class="button-icon">
      <slot name="icon"></slot>
    </span>
    
    <!-- 本地图片图标 - 非loading状态 -->
    <img 
      v-if="iconType === 'image' && iconSrc && !loading" 
      :src="iconSrc"
      class="button-icon"
      :alt="iconAlt || '按钮图标'"
    />
    
    <!-- loading状态下自动隐藏上面的图标，使用antd内置loading效果 -->
    <slot></slot>
  </a-button>
</template>

<script setup>
import { computed } from 'vue';

// 定义组件属性
const props = defineProps({
  // 按钮类型
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'dashed', 'text', 'link', 'warning'].includes(value)
  },
  // 按钮尺寸
  size: {
    type: String,
    default: 'middle',
    validator: (value) => ['large', 'middle', 'small'].includes(value)
  },
  // 是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  // 是否加载中
  loading: {
    type: Boolean,
    default: false
  },
  // 图标类型: antd或image
  iconType: {
    type: String,
    default: '',
    validator: (value) => ['', 'antd', 'image'].includes(value)
  },
  // 图标名称(antd)
  icon: {
    type: String,
    default: ''
  },
  // 图片路径(image)
  iconSrc: {
    type: String,
    default: ''
  },
  // 图片alt属性(image)
  iconAlt: {
    type: String,
    default: ''
  }
})

// 计算属性：是否有图标
const hasIcon = computed(() => {
  return (props.iconType === 'antd' && props.icon) || 
         (props.iconType === 'image' && props.iconSrc);
});

// 定义事件
const emit = defineEmits(['click'])

// 点击事件处理
const handleClick = (e) => {
  if (!props.disabled && !props.loading) {
    emit('click', e)
  }
}
</script>

<style lang="less" scoped>
@import '../../assets/styles/design-tokens.less';

.zb-button {
  border-radius: @border-radius-md;
  font-size: @font-size-t1;
  line-height: @line-height-base;
  font-weight: @font-weight-medium;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  height: 28px;
  padding: 0 10px;
  
  &:hover {
    opacity: 0.9;
  }
  
  &:active {
    opacity: 0.8;
  }
  
  // 尺寸
  &.large {
    height: @control-height-lg;
    padding: @control-padding-vertical @control-padding-horizontal * 1.5;
    font-size: @font-size-t3;
  }
  
  &.middle {
    height: 28px;
    padding: 0 10px;
  }
  
  &.small {
    height: @control-height-sm;
    padding: @control-padding-vertical @control-padding-horizontal * 0.8;
    font-size: @font-size-t1;
  }
  
  // 类型
  &.ant-btn-primary {
    background-color: @btn-primary;
    border-color: @btn-primary;
    color: @gray-1;
    
    &:hover {
      background-color: @btn-primary-hover;
      border-color: @btn-primary-hover;
    }
    
    &:active {
      background-color: @btn-primary-active;
      border-color: @btn-primary-active;
    }
  }
  
  &.ant-btn-default {
    border-color: @color-default-border;
    color: @color-default-text;
    background-color: @color-default;
    
    &:hover {
      border-color: @color-default-border;
      color: @color-default-text;
      background-color: @color-default-hover;
    }

    &:active {
      border-color: @color-default-border;
      color: @color-default-text;
      background-color: @color-default-active;
    }
  }
  
  // 告警按钮
  &.ant-btn-warning {
    background-color: @color-error;
    border-color: @color-error;
    color: @gray-1;
    
    &:hover {
      background-color: @color-error-hover;
      border-color: @color-error-hover;
    }
    
    &:active {
      background-color: @color-error-active;
      border-color: @color-error-active;
    }
  }
  
  // 禁用状态
  &.ant-btn-disabled, &[disabled] {
    color: @btn-disabled-text;
    background-color: @btn-disabled;
    border-color: @btn-disabled;
    cursor: not-allowed;
    opacity: 1;
  }
  
  // 加载状态
  &.ant-btn-loading {
    opacity: 0.8;
    pointer-events: none;
    
    .ant-btn-loading-icon {
      color: inherit; // 确保loading图标颜色与按钮文字一致
    }
  }
  
  // 图标按钮
  &.with-icon {
    .button-icon {
      margin-right: 8px;
      font-size: 14px;
      display: inline-flex;
      width: 14px;
      height: 14px;
    }
    
    &.ant-btn-lg .button-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    &.ant-btn-sm .button-icon {
      font-size: 12px;
      width: 12px;
      height: 12px;
    }
  }
}
</style> 