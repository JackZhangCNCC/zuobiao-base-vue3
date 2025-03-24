// 定义一些和权限有关的 Vue指令
import { useUserStore } from '../stores/user'
import { DirectiveBinding, App } from 'vue'

// 自定义权限指令接口
interface PermissionDirective {
  mounted(el: HTMLElement, binding: DirectiveBinding): void
}

// 处理权限值，确保返回字符串数组
function parsePermissionValue(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') return value.split(',');
  return [String(value)];
}

// 必须包含列出的所有权限，元素才显示
export const hasPermission: PermissionDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding): void {
    try {
      const userStore = useUserStore();
      const permissions: string[] = userStore.permissions || [];
      const value: string[] = parsePermissionValue(binding.value);

      let flag = true;
      for (let v of value) {
        if (!permissions.includes(v)) {
          flag = false;
          break;
        }
      }

      if (!flag) {
        if (!el.parentNode) {
          el.style.display = 'none';
        } else {
          el.parentNode.removeChild(el);
        }
      }
    } catch (error) {
      console.warn('Permission directive error:', error);
    }
  }
}

// 当不包含列出的权限时，渲染该元素
export const hasNoPermission: PermissionDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding): void {
    try {
      const userStore = useUserStore();
      const permissions: string[] = userStore.permissions || [];
      const value: string[] = parsePermissionValue(binding.value);

      let flag = true;
      for (let v of value) {
        if (permissions.includes(v)) {
          flag = false;
          break;
        }
      }

      if (!flag) {
        if (!el.parentNode) {
          el.style.display = 'none';
        } else {
          el.parentNode.removeChild(el);
        }
      }
    } catch (error) {
      console.warn('Permission directive error:', error);
    }
  }
}

// 只要包含列出的任意一个权限，元素就会显示
export const hasAnyPermission: PermissionDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding): void {
    try {
      const userStore = useUserStore();
      const permissions: string[] = userStore.permissions || [];
      const value: string[] = parsePermissionValue(binding.value);

      let flag = false;
      for (let v of value) {
        if (permissions.includes(v)) {
          flag = true;
          break;
        }
      }

      if (!flag) {
        if (!el.parentNode) {
          el.style.display = 'none';
        } else {
          el.parentNode.removeChild(el);
        }
      }
    } catch (error) {
      console.warn('Permission directive error:', error);
    }
  }
}

// 必须包含列出的所有角色，元素才显示
export const hasRole: PermissionDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding): void {
    try {
      const userStore = useUserStore();
      const roles: string[] = userStore.roles || [];
      const value: string[] = parsePermissionValue(binding.value);

      let flag = true;
      for (let v of value) {
        if (!roles.includes(v)) {
          flag = false;
          break;
        }
      }

      if (!flag) {
        if (!el.parentNode) {
          el.style.display = 'none';
        } else {
          el.parentNode.removeChild(el);
        }
      }
    } catch (error) {
      console.warn('Role directive error:', error);
    }
  }
}

// 只要包含列出的任意一个角色，元素就会显示
export const hasAnyRole: PermissionDirective = {
  mounted(el: HTMLElement, binding: DirectiveBinding): void {
    try {
      const userStore = useUserStore();
      const roles: string[] = userStore.roles || [];
      const value: string[] = parsePermissionValue(binding.value);

      let flag = false;
      for (let v of value) {
        if (roles.includes(v)) {
          flag = true;
          break;
        }
      }

      if (!flag) {
        if (!el.parentNode) {
          el.style.display = 'none';
        } else {
          el.parentNode.removeChild(el);
        }
      }
    } catch (error) {
      console.warn('Role directive error:', error);
    }
  }
}

// 注册指令插件
export function setupPermissionDirectives(app: App): void {
  app.directive('hasPermission', hasPermission)
  app.directive('hasNoPermission', hasNoPermission)
  app.directive('hasAnyPermission', hasAnyPermission)
  app.directive('hasRole', hasRole)
  app.directive('hasAnyRole', hasAnyRole)
}

export default setupPermissionDirectives
