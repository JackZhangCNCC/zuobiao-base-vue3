import { Router } from 'vue-router';
import ExternalLinkUtils from './externalLinkUtils';

/**
 * 菜单处理工具类
 * 用于统一处理菜单项点击事件，特别是外部链接的处理
 */
export class MenuHandlerUtils {
  /**
   * 处理菜单项点击
   * @param path 菜单路径
   * @param router Vue Router实例
   * @param options 额外配置项
   */
  static handleMenuClick(
    path: string, 
    router: Router, 
    options: {
      extraParams?: Record<string, string | number | boolean>;
      target?: string;
      query?: Record<string, string | string[]>;
      replace?: boolean;
    } = {}
  ): void {
    // 检查是否为外部链接
    if (ExternalLinkUtils.isExternalLink(path)) {
      console.log('点击了外部链接:', path);
      // 使用外部链接工具处理
      ExternalLinkUtils.openExternalLink(path, {
        target: options.target || '_blank',
        extraParams: options.extraParams || {}
      });
    } else {
      // 内部路由跳转
      console.log('点击了内部路由:', path);
      router.push({
        path,
        query: options.query || {},
        replace: options.replace
      });
    }
  }

  /**
   * 格式化菜单路径
   * @param path 菜单路径
   * @returns 格式化后的路径
   */
  static formatMenuPath(path: string): string {
    if (!path) return '';
    
    // 如果是外部链接，直接返回
    if (ExternalLinkUtils.isExternalLink(path)) {
      return path;
    }
    
    // 确保内部路径以/开头
    return path.startsWith('/') ? path : `/${path}`;
  }

  /**
   * 判断当前菜单是否激活
   * @param path 菜单路径
   * @param currentPath 当前路径
   * @returns 是否激活
   */
  static isMenuActive(path: string, currentPath: string): boolean {
    // 外部链接永远不会是激活状态
    if (ExternalLinkUtils.isExternalLink(path)) {
      return false;
    }
    
    // 格式化路径
    const formattedPath = this.formatMenuPath(path);
    const formattedCurrentPath = currentPath || '';
    
    // 判断当前路径是否匹配菜单路径
    return formattedCurrentPath.startsWith(formattedPath);
  }
  
  /**
   * 创建菜单项的点击处理器
   * @param menu 菜单项对象
   * @param router Vue Router实例
   * @returns 点击处理函数
   */
  static createMenuClickHandler(menu: any, router: Router) {
    return () => {
      const path = menu.path || '';
      const isExternal = menu.isFrame == '1' || menu.isFrame === 1;
      
      if (isExternal) {
        // 处理外部链接
        ExternalLinkUtils.openExternalLink(path, {
          extraParams: {
            menuId: menu.id || '',
            menuName: menu.name || menu.text || ''
          }
        });
      } else {
        // 处理内部路由
        router.push({
          path: this.formatMenuPath(path),
          query: menu.query ? JSON.parse(menu.query) : {}
        });
      }
    };
  }
}

export default MenuHandlerUtils; 