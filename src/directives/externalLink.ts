import { Directive, DirectiveBinding } from 'vue';
import ExternalLinkUtils from '../utils/externalLinkUtils';

// 扩展 HTMLElement 类型
declare global {
  interface HTMLElement {
    _externalLink?: {
      url: string;
      extraParams: Record<string, any>;
      target: string;
      originalStyle: string;
      handler?: (e: Event) => void;
    };
  }
}

/**
 * 外部链接处理指令
 * 用法：v-external-link="'http://example.com'"
 * 或者：v-external-link="{ url: 'http://example.com', params: { key: 'value' } }"
 */
const externalLink: Directive = {
  // 在元素被挂载时
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    // 处理绑定值
    let url: string = '';
    let extraParams: Record<string, any> = {};
    let target: string = '_blank';

    if (typeof binding.value === 'string') {
      url = binding.value;
    } else if (binding.value && typeof binding.value === 'object') {
      url = binding.value.url || '';
      extraParams = binding.value.params || {};
      target = binding.value.target || '_blank';
    }

    // 确保URL存在
    if (!url) {
      console.warn('v-external-link指令需要提供URL');
      return;
    }

    // 存储原始样式
    const originalStyle = el.style.cssText;

    // 设置样式和鼠标样式以指示可点击
    el.style.cursor = 'pointer';
    
    // 如果是链接元素，添加类似链接的样式
    if (el.tagName !== 'A') {
      el.style.textDecoration = 'none';
      el.style.color = '#1890ff';
    }

    // 动态添加外部链接图标，如果需要
    if (binding.modifiers.showIcon) {
      const icon = document.createElement('i');
      icon.className = 'anticon anticon-link';
      icon.style.marginLeft = '4px';
      icon.style.fontSize = '12px';
      el.appendChild(icon);
    }

    // 创建点击事件处理函数
    const clickHandler = (e: Event) => {
      e.preventDefault();
      ExternalLinkUtils.openExternalLink(url, {
        target,
        extraParams
      });
    };

    // 添加点击事件监听器
    el.addEventListener('click', clickHandler);

    // 存储原始URL和处理函数，以便更新时使用
    el._externalLink = {
      url,
      extraParams,
      target,
      originalStyle,
      handler: clickHandler
    };
  },

  // 当绑定的值更新时
  updated(el: HTMLElement, binding: DirectiveBinding) {
    // 获取之前的状态
    const oldState = el._externalLink || {
      url: '',
      extraParams: {},
      target: '_blank',
      originalStyle: '',
      handler: undefined
    };

    // 处理新的绑定值
    let url: string = '';
    let extraParams: Record<string, any> = {};
    let target: string = '_blank';

    if (typeof binding.value === 'string') {
      url = binding.value;
    } else if (binding.value && typeof binding.value === 'object') {
      url = binding.value.url || '';
      extraParams = binding.value.params || {};
      target = binding.value.target || '_blank';
    }

    // 如果URL变化，更新点击处理函数
    if (url !== oldState.url || JSON.stringify(extraParams) !== JSON.stringify(oldState.extraParams) || target !== oldState.target) {
      // 移除旧的点击事件监听器
      if (oldState.handler) {
        el.removeEventListener('click', oldState.handler);
      }

      // 创建新的点击事件处理函数
      const clickHandler = (e: Event) => {
        e.preventDefault();
        ExternalLinkUtils.openExternalLink(url, {
          target,
          extraParams
        });
      };

      // 添加新的点击事件监听器
      el.addEventListener('click', clickHandler);

      // 更新存储的状态
      el._externalLink = {
        url,
        extraParams,
        target,
        originalStyle: oldState.originalStyle,
        handler: clickHandler
      };
    }
  },

  // 在元素解除挂载时
  unmounted(el: HTMLElement) {
    // 移除点击事件监听器
    if (el._externalLink && el._externalLink.handler) {
      el.removeEventListener('click', el._externalLink.handler);
    }
    
    // 恢复原始样式
    if (el._externalLink && el._externalLink.originalStyle) {
      el.style.cssText = el._externalLink.originalStyle;
    }
    
    // 移除存储的状态
    delete el._externalLink;
  }
};

export default externalLink; 