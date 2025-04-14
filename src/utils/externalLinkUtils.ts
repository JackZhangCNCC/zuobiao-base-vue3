import db from './localstorage';

interface ExternalLinkOptions {
  target?: string;       // 打开方式，默认为'_blank'
  extraParams?: Record<string, string | number | boolean>; // 额外参数
}

/**
 * 外部链接处理工具类
 */
export class ExternalLinkUtils {
  /**
   * 打开外部链接
   * @param url 外部链接URL
   * @param options 可选配置项
   * @returns void
   */
  static openExternalLink(url: string, options: ExternalLinkOptions = {}): void {
    // 默认配置
    const defaultOptions: ExternalLinkOptions = {
      target: '_blank',
      extraParams: {}
    };
    
    // 合并选项
    const mergedOptions = { ...defaultOptions, ...options };
    
    try {
      console.log('处理外部链接:', url);
      
      // 检查URL格式
      if (!url) {
        console.error('无效的URL');
        return;
      }
      
      // 确保URL格式正确
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
      }
      
      // 获取用户Token和信息
      const token = db.get<string>('USER_TOKEN', '');
      const user = db.get<any>('USER', null);
      
      if (!token || !user) {
        console.warn('用户未登录，无法传递Token信息');
      }
      
      // 构建URL对象
      const urlObj = new URL(url);
      
      // 设置正确的路径，添加 #
      urlObj.pathname = '/';
      urlObj.hash = '#/loginByToken';
      
      // 添加参数
      const params = new URLSearchParams();
      
      // 添加基本参数
      if (user) {
        params.append('name', user.loginName || '');
        params.append('sysId', user.sysId?.toString() || '');
      }
      
      // 添加Token
      if (token) {
        params.append('token', encodeURIComponent(token));
      }
      
      // 添加额外参数
      if (mergedOptions.extraParams) {
        Object.entries(mergedOptions.extraParams).forEach(([key, value]) => {
          params.append(key, String(value));
        });
      }
      
      // 合并参数到URL
      urlObj.hash = urlObj.hash + '?' + params.toString();
      
      console.log('完整的外部链接URL:', urlObj.toString());
      
      // 打开外部链接
      window.open(urlObj.toString(), mergedOptions.target);
    } catch (error) {
      console.error('打开外部链接失败:', error);
    }
  }
  
  /**
   * 判断链接是否为外部链接
   * @param path 链接路径
   * @returns 是否为外部链接
   */
  static isExternalLink(path: string): boolean {
    return !!(path && (path.startsWith('http://') || path.startsWith('https://')));
  }
}

// 提供默认导出
export default ExternalLinkUtils; 