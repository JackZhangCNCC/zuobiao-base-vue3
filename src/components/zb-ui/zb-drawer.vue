<!--
  author: Johnson
  date: 2025-04-07
  description: zb-drawer抽屉组件
-->
<template>
  <div class="zb-drawer-container" v-if="isVisible">
    <!-- 遮罩层 -->
    <div class="zb-drawer-mask" @click="handleMaskClick" :style="{ zIndex: zIndex }"></div>
    
    <!-- 抽屉内容 -->
    <div 
      class="zb-drawer-content" 
      :class="[
        `zb-drawer-${placement}`,
        `zb-drawer-${size}`
      ]"
      :style="[drawerStyle, { zIndex: zIndex + 1 }]"
    >
      <!-- 头部 -->
      <div class="zb-drawer-header">
        <div class="zb-drawer-title">{{ title }}</div>
        <div class="zb-drawer-close" v-if="closable" @click="close">
          <close-outlined />
        </div>
      </div>
      
      <!-- 内容区域 -->
      <div class="zb-drawer-body">
        <slot></slot>
      </div>
      
      <!-- 底部按钮区域 -->
      <div class="zb-drawer-footer" v-if="!hideFooter">
        <slot name="footer">
          <div class="zb-drawer-footer-left">
            <template v-for="(button, index) in leftButtons" :key="`left-${index}`">
              <zb-button
                :type="button.type || 'default'"
                :loading="button.loading"
                :disabled="button.disabled"
                @click="handleButtonClick(button)"
              >
                {{ button.text }}
              </zb-button>
            </template>
          </div>
          <div class="zb-drawer-footer-right">
            <template v-if="!footerButtons || footerButtons.length === 0">
              <zb-button @click="close">取消</zb-button>
              <zb-button type="primary" :loading="confirmLoading" @click="handleConfirm">确定</zb-button>
            </template>
            <template v-else>
              <template v-for="(button, index) in rightButtons" :key="`right-${index}`">
                <zb-button
                  :type="button.type || 'default'"
                  :loading="button.loading"
                  :disabled="button.disabled"
                  @click="handleButtonClick(button)"
                >
                  {{ button.text }}
                </zb-button>
              </template>
            </template>
          </div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue';
import { CloseOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  // 是否可见 (用于v-model:visible)
  visible: {
    type: Boolean,
    default: false
  },
  // 用于v-model绑定
  modelValue: {
    type: Boolean,
    default: false
  },
  // 标题
  title: {
    type: String,
    default: '抽屉'
  },
  // 宽度，placement为right或left时生效
  width: {
    type: [Number, String],
    default: 400
  },
  // 高度，placement为top或bottom时生效
  height: {
    type: [Number, String],
    default: 400
  },
  // 位置，可选 top/right/bottom/left
  placement: {
    type: String,
    default: 'right',
    validator: (value) => ['top', 'right', 'bottom', 'left'].includes(value)
  },
  // 尺寸，可选 default/large/small
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'large', 'small'].includes(value)
  },
  // 点击遮罩是否可以关闭
  maskClosable: {
    type: Boolean,
    default: true
  },
  // 隐藏底部
  hideFooter: {
    type: Boolean,
    default: false
  },
  // 确认按钮loading
  confirmLoading: {
    type: Boolean,
    default: false
  },
  // 是否显示右上角的关闭按钮 (与Ant Design保持一致)
  closable: {
    type: Boolean,
    default: true
  },
  // 关闭抽屉时是否销毁子元素
  destroyOnClose: {
    type: Boolean,
    default: false
  },
  // 键盘按键关闭
  keyboard: {
    type: Boolean,
    default: true
  },
  // 自定义z-index
  zIndex: {
    type: Number,
    default: 1000
  },
  // 挂载容器，保持与ant-design的API一致性
  getContainer: {
    type: [String, Object, Function],
    default: () => document.body
  },
  // 底部按钮配置
  footerButtons: {
    type: Array,
    default: () => []
    /*
      按钮配置对象格式：
      {
        text: String,       // 按钮文字
        type: String,       // 按钮类型：primary/default/warning
        position: String,   // 位置：left/right，默认right
        loading: Boolean,   // 加载状态
        disabled: Boolean,  // 禁用状态
        key: String/Number, // 唯一标识
        onClick: Function,  // 点击回调
        closeDrawer: Boolean // 点击后是否关闭抽屉，默认false
      }
    */
  }
});

const emit = defineEmits(['update:visible', 'update:modelValue', 'confirm', 'cancel', 'close', 'button-click']);

// 计算实际的可见状态 (同时支持v-model和v-model:visible)
const isVisible = computed(() => props.visible || props.modelValue);

// 将按钮分为左侧和右侧
const leftButtons = computed(() => 
  props.footerButtons.filter(btn => btn.position === 'left')
);

const rightButtons = computed(() => 
  props.footerButtons.filter(btn => !btn.position || btn.position === 'right')
);

// 抽屉样式
const drawerStyle = computed(() => {
  const style = {};
  // 只有当width不等于默认值且明确指定时才应用行内样式
  if (props.placement === 'right' || props.placement === 'left') {
    // 检查是否为数字类型的400(默认值)，或者字符串"400px"
    const isDefaultWidth = 
      (typeof props.width === 'number' && props.width === 400) || 
      (typeof props.width === 'string' && props.width === '400px');
    
    if (!isDefaultWidth) {
      style.width = typeof props.width === 'number' ? `${props.width}px` : props.width;
    }
  }
  
  // 只有当height不等于默认值且明确指定时才应用行内样式
  if (props.placement === 'top' || props.placement === 'bottom') {
    // 检查是否为数字类型的400(默认值)，或者字符串"400px"
    const isDefaultHeight = 
      (typeof props.height === 'number' && props.height === 400) || 
      (typeof props.height === 'string' && props.height === '400px');
    
    if (!isDefaultHeight) {
      style.height = typeof props.height === 'number' ? `${props.height}px` : props.height;
    }
  }
  return style;
});

// 关闭抽屉
const close = () => {
  console.log('关闭抽屉，当前状态:', isVisible.value);
  // 同时更新两种绑定方式
  emit('update:visible', false);
  emit('update:modelValue', false);
  console.log('已触发更新事件');
  // 同时触发close和cancel事件，以兼容Ant Design Vue的用法
  emit('close');
  emit('cancel');
};

// 点击确认
const handleConfirm = () => {
  emit('confirm');
};

// 处理自定义按钮点击
const handleButtonClick = (button) => {
  // 触发通用按钮点击事件，传递按钮的key或索引
  emit('button-click', button.key || button);
  
  // 如果按钮有自己的onClick回调，则调用
  if (typeof button.onClick === 'function') {
    button.onClick();
  }
  
  // 如果配置了点击后关闭抽屉
  if (button.closeDrawer) {
    close();
  }
};

// 点击遮罩
const handleMaskClick = () => {
  if (props.maskClosable) {
    close();
  }
};

// 监听Escape键关闭抽屉
const handleKeydown = (e) => {
  if (e.key === 'Escape' && isVisible.value && props.keyboard) {
    close();
  }
};

// 组件挂载与卸载时添加/移除键盘事件监听
watch(isVisible, (val) => {
  if (val) {
    document.addEventListener('keydown', handleKeydown);
    // 防止滚动
    document.body.style.overflow = 'hidden';
  } else {
    document.removeEventListener('keydown', handleKeydown);
    // 恢复滚动
    document.body.style.overflow = '';
  }
});
</script>

<style lang="less" scoped>
@zb-primary-color: #364fc7;
@zb-border-color: #e8e8e8;
@zb-text-color: #040849;

.zb-drawer-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.zb-drawer-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.45);
}

.zb-drawer-content {
  position: fixed;
  background-color: #fff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  
  // 抽屉位置
  &.zb-drawer-right {
    top: 0;
    right: 0;
    height: 100%;
    transform: translateX(0);
  }
  
  &.zb-drawer-left {
    top: 0;
    left: 0;
    height: 100%;
    transform: translateX(0);
  }
  
  &.zb-drawer-top {
    top: 0;
    left: 0;
    width: 100%;
    transform: translateY(0);
  }
  
  &.zb-drawer-bottom {
    bottom: 0;
    left: 0;
    width: 100%;
    transform: translateY(0);
  }
  
  // 抽屉尺寸
  &.zb-drawer-small {
    &.zb-drawer-right, &.zb-drawer-left {
      width: 300px;
    }
    
    &.zb-drawer-top, &.zb-drawer-bottom {
      height: 256px;
    }
  }
  
  &.zb-drawer-default {
    &.zb-drawer-right, &.zb-drawer-left {
      width: 400px;
    }
    
    &.zb-drawer-top, &.zb-drawer-bottom {
      height: 400px;
    }
  }
  
  &.zb-drawer-large {
    &.zb-drawer-right, &.zb-drawer-left {
      width: 736px;
    }
    
    &.zb-drawer-top, &.zb-drawer-bottom {
      height: 600px;
    }
  }
}

.zb-drawer-header {
  padding: 16px 24px;
  border-bottom: 1px solid @zb-border-color;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.zb-drawer-title {
  font-size: 16px;
  font-weight: 500;
  color: @zb-text-color;
  line-height: 22px;
}

.zb-drawer-close {
  cursor: pointer;
  color: rgba(0, 0, 0, 0.45);
  font-size: 16px;
  transition: color 0.3s;
  
  &:hover {
    color: rgba(0, 0, 0, 0.75);
  }
}

.zb-drawer-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.zb-drawer-footer {
  padding: 16px 24px;
  border-top: 1px solid @zb-border-color;
  display: flex;
  justify-content: space-between;
  
  &-left {
    display: flex;
    gap: 8px;
  }
  
  &-right {
    display: flex;
    gap: 8px;
    margin-left: auto;
  }
}
</style> 