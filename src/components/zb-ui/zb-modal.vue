<!--
  auther: Johnson
  date: 2025-04-02
  description: 弹框组件
-->
<template>
  <a-modal
    :open="open"
    :title="title"
    :width="modalWidth"
    :maskClosable="maskClosable"
    :closable="closable"
    :centered="centered"
    :footer="footer === false ? null : undefined"
    :destroyOnClose="destroyOnClose"
    @cancel="handleCancel"
    :class="['zb-modal', { 'zb-modal-form': isForm }, modalClass]"
  >
    <template #title v-if="$slots.title">
      <slot name="title"></slot>
    </template>
    
    <template #footer v-if="footer !== false && $slots.footer">
      <slot name="footer"></slot>
    </template>
    
    <template #footer v-else-if="footer !== false">
      <div class="modal-footer">
        <zb-button @click="handleCancel">{{ cancelText }}</zb-button>
        <zb-button type="primary" :loading="confirmLoading" @click="handleConfirm">{{ okText }}</zb-button>
      </div>
    </template>
    
    <!-- 默认内容区 -->
    <div class="modal-content">
      <slot></slot>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  // 是否显示弹框
  open: {
    type: Boolean,
    default: false
  },
  // 弹框标题
  title: {
    type: String,
    default: ''
  },
  // 弹框宽度
  width: {
    type: [Number, String],
    default: 500
  },
  // 是否允许点击蒙层关闭
  maskClosable: {
    type: Boolean,
    default: true
  },
  // 是否显示关闭按钮
  closable: {
    type: Boolean,
    default: true
  },
  // 是否居中显示
  centered: {
    type: Boolean,
    default: true
  },
  // 确认按钮文本
  okText: {
    type: String,
    default: '确定'
  },
  // 取消按钮文本
  cancelText: {
    type: String,
    default: '取消'
  },
  // 确认按钮加载状态
  confirmLoading: {
    type: Boolean,
    default: false
  },
  // 是否显示底部
  footer: {
    type: [Boolean, Array],
    default: true
  },
  // 关闭时销毁内容
  destroyOnClose: {
    type: Boolean,
    default: false
  },
  // 是否是表单类型的弹框
  isForm: {
    type: Boolean,
    default: false
  },
  // 自定义类名
  modalClass: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:open', 'cancel', 'confirm']);

// 处理取消操作
const handleCancel = () => {
  emit('update:open', false);
  emit('cancel');
};

// 处理确认操作
const handleConfirm = () => {
  emit('confirm');
};

// 处理宽度，确保数字类型
const modalWidth = computed(() => {
  if (typeof props.width === 'number') {
    return props.width;
  }
  // 尝试将字符串转为数字
  if (typeof props.width === 'string') {
    const parsedWidth = parseInt(props.width, 10);
    return isNaN(parsedWidth) ? 500 : parsedWidth;
  }
  return 500;
});
</script>

<style lang="less" scoped>
@import '../../assets/styles/design-tokens.less';

.zb-modal {
  :deep(.ant-modal-header) {
    padding: @spacing-md @spacing-lg;
    border-bottom: 1px solid @border-color-split;
    
    .ant-modal-title {
      font-size: @font-size-t3;
      font-weight: @font-weight-medium;
      color: @text-color-primary;
    }
  }
  
  :deep(.ant-modal-close) {
    color: @text-color-secondary;
    
    &:hover {
      color: @text-color-primary;
    }
  }
  
  :deep(.ant-modal-body) {
    padding: @spacing-lg;
  }
  
  :deep(.ant-modal-footer) {
    padding: @spacing-md @spacing-lg;
    border-top: 1px solid @border-color-split;
    
    .ant-btn + .ant-btn {
      margin-left: @spacing-md;
    }
  }
  
  // 表单弹框样式
  &.zb-modal-form {
    :deep(.ant-modal-body) {
      padding: @spacing-lg @spacing-lg 0;
    }
    
    :deep(.ant-form-item:last-child) {
      margin-bottom: @spacing-md;
    }
  }
  
  // 内容区域样式
  .modal-content {
    max-height: calc(80vh - 160px);
    overflow-y: auto;
  }
  
  // 底部按钮区域
  .modal-footer {
    display: flex;
    justify-content: center;
    
    .ant-btn + .ant-btn {
      margin-left: @spacing-md;
    }
  }
}
</style> 