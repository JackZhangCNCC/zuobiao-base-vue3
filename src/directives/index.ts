import { App } from 'vue';
import externalLink from './externalLink';

/**
 * 注册所有自定义指令
 * @param app Vue实例
 */
export function registerDirectives(app: App) {
  // 注册外部链接指令
  app.directive('external-link', externalLink);

  // 这里可以继续注册其他指令
}

export default registerDirectives; 