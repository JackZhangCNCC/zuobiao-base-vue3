import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRequest } from '../utils/request'
import { ApiResponse } from '../utils/request'

interface UserInfo {
  loginName: string;
  sysId: string | number;
  userName?: string;
  [key: string]: any;
}

interface LoginCredentials {
  username: string;
  password: string;
  code?: string;
  remember?: boolean;
}

interface LoginResponse {
  code: string | number;
  data: {
    token: string;
    expireTime: string;
    user: UserInfo;
  };
}

interface PermissionsResponse {
  code: string | number;
  data: {
    permissions: string[];
    roles: string[];
  };
}

interface RoutesResponse {
  code: number;
  obj: any[];
}

// LocalStorage操作辅助函数
const db = {
  save(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value))
  },
  get<T>(key: string, defaultValue: T): T {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  },
  remove(key: string): void {
    localStorage.removeItem(key)
  },
  clear(): void {
    localStorage.clear()
  }
}

export const useUserStore = defineStore('user', () => {
  // 状态 - 从localStorage中恢复
  const token = ref<string>(db.get<string>('USER_TOKEN', ''))
  const expireTime = ref<string>(db.get<string>('EXPIRE_TIME', ''))
  const user = ref<UserInfo | null>(db.get<UserInfo | null>('USER', null))
  const permissions = ref<string[]>(db.get<string[]>('PERMISSIONS', []))
  const roles = ref<string[]>(db.get<string[]>('ROLES', []))
  const routes = ref<any[]>([])
  const routesLoaded = ref<boolean>(false)

  // Getters
  const isLoggedIn = computed<boolean>(() => !!token.value && !!user.value)
  const userInfo = computed<UserInfo>(() => user.value || {} as UserInfo)
  const userPermissions = computed<string[]>(() => permissions.value || [])
  const userRoles = computed<string[]>(() => roles.value || [])

  // Actions
  const { get, post } = useRequest()

  /**
   * 登录
   * @param credentials 登录凭证
   */
  async function login(credentials: LoginCredentials): Promise<boolean> {
    try {
      // 调用登录接口
      const response = await post('auth/login', credentials)
      const data = response.data

      if (data.code == '200') {
        setToken(data.data?.token || '')
        setExpireTime(data.data?.expireTime || '')
        setUser(data.data?.user || null)
        return true
      }
      return false
    } catch (error) {
      console.error('登录失败', error)
      return false
    }
  }

  /**
   * 获取用户权限和角色
   */
  async function getUserPermissions(): Promise<boolean> {
    if (!token.value || !user.value) return false

    try {
      const response = await get('auth/user/permissions', {
        loginName: user.value.loginName
      })
      const data = response.data

      if (data.code == '200') {
        setPermissions(data.data?.permissions || [])
        setRoles(data.data?.roles || [])
        return true
      }
      return false
    } catch (error) {
      console.error('获取用户权限失败', error)
      return false
    }
  }

  /**
   * 获取用户路由
   */
  async function getUserRoutes(): Promise<boolean> {
    if (!token.value || !user.value) return false

    try {
      const response = await get('auth/menu/getUserRouters', {
        loginName: user.value.loginName,
        sysId: user.value.sysId
      })
      const data = response.data

      if (data.code === 200) {
        routes.value = data.obj || []
        routesLoaded.value = true
        return true
      }
      return false
    } catch (error) {
      console.error('获取用户路由失败', error)
      return false
    }
  }

  /**
   * 退出登录
   */
  function logout(): void {
    setToken('')
    setExpireTime('')
    setUser(null)
    setPermissions([])
    setRoles([])
    routes.value = []
    routesLoaded.value = false

    // 清除localStorage中的数据
    db.remove('USER_TOKEN')
    db.remove('EXPIRE_TIME')
    db.remove('USER')
    db.remove('PERMISSIONS')
    db.remove('ROLES')
  }

  // 辅助函数 - 同时更新状态和localStorage
  function setToken(val: string): void {
    token.value = val
    db.save('USER_TOKEN', val)
  }

  function setExpireTime(val: string): void {
    expireTime.value = val
    db.save('EXPIRE_TIME', val)
  }

  function setUser(val: UserInfo | null): void {
    user.value = val
    db.save('USER', val)
  }

  function setPermissions(val: string[]): void {
    permissions.value = val
    db.save('PERMISSIONS', val)
  }

  function setRoles(val: string[]): void {
    roles.value = val
    db.save('ROLES', val)
  }

  return {
    // 状态
    token,
    expireTime,
    user,
    permissions,
    roles,
    routes,
    routesLoaded,

    // Getters
    isLoggedIn,
    userInfo,
    userPermissions,
    userRoles,

    // Actions
    login,
    logout,
    getUserPermissions,
    getUserRoutes,
    setToken,
    setExpireTime,
    setUser,
    setPermissions,
    setRoles
  }
})
