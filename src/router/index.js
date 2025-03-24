import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('../views/layout/Layout.vue'),
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: 'Home',
        component: () => import('../views/home/Home.vue'),
        meta: { requiresAuth: true, title: '首页' }
      },
      // 系统管理
      {
        path: '/system',
        name: 'System',
        redirect: '/system/user',
        meta: { requiresAuth: true, title: '系统管理', icon: 'SettingOutlined' },
        children: [
          {
            path: '/system/user',
            name: 'User',
            component: () => import('../views/system/user/User.vue'),
            meta: { requiresAuth: true, title: '用户管理', icon: 'UserOutlined' }
          },
          {
            path: '/system/role',
            name: 'Role',
            component: () => import('../views/system/role/Role.vue'),
            meta: { requiresAuth: true, title: '角色管理', icon: 'TeamOutlined' }
          },
          {
            path: '/system/menu',
            name: 'Menu',
            component: () => import('../views/system/menu/Menu.vue'),
            meta: { requiresAuth: true, title: '菜单管理', icon: 'MenuOutlined' }
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/error/404.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  NProgress.start()

  const userStore = useUserStore()
  const { token, user, routesLoaded } = userStore

  // 不需要认证的路由直接放行
  if (!to.meta.requiresAuth) {
    next()
    return
  }

  // 已登录用户
  if (token && user) {
    // 如果访问登录页，重定向到首页
    if (to.path === '/login') {
      next({ path: '/' })
      return
    }

    // 如果没有加载路由菜单，先加载
    if (!routesLoaded) {
      try {
        // 获取用户路由菜单
        const success = await userStore.getUserRoutes()

        if (success) {
          // 动态添加路由 - Vue Router 4 实现
          if (userStore.routes && userStore.routes.length > 0) {
            // 路由名称去重处理，记录已使用的路由名称
            const usedNames = new Set()

            // 处理后端返回的路由
            const processServerRoutes = (serverRoutes, parentPath = '', level = 0) => {
              return serverRoutes.map((route, index) => {
                const { path, name, meta, component, children } = route

                // 构建路由路径
                const routePath = path.startsWith('/') ? path : `${parentPath}/${path}`.replace(/\/+/g, '/')

                // 构建唯一路由名称 - 使用路径、层级和索引确保唯一性
                let routeName = '';
                if (name) {
                  // 尝试使用原始名称加上层级标识
                  routeName = `route_${level}_${index}_${name}`;
                } else {
                  // 使用路径生成名称
                  routeName = `route_${level}_${index}_${routePath.replace(/\//g, '_').replace(/^_/, '')}`;
                }

                // 如果名称已被使用，添加随机数确保唯一
                while (usedNames.has(routeName)) {
                  routeName = `route_${level}_${index}_${Math.random().toString(36).substring(2, 8)}`;
                }

                // 记录已使用的名称
                usedNames.add(routeName)

                // 构建路由对象
                const newRoute = {
                  path: routePath,
                  name: routeName,
                  meta,
                  // 动态导入组件
                  component: component ? () => import(`../views/${component}.vue`) : undefined
                }

                // 递归处理子路由 - 递增层级计数
                if (children && children.length > 0) {
                  newRoute.children = processServerRoutes(children, routePath, level + 1)
                }

                return newRoute
              })
            }

            // 处理路由并添加到router
            const dynamicRoutes = processServerRoutes(userStore.routes)

            // 使用addRoute添加路由
            dynamicRoutes.forEach(route => {
              if (route.component) {  // 只添加有组件的路由
                router.addRoute(route)
              }
            })

            // 添加路由后，重新尝试导航到目标页面
            next({ ...to, replace: true })
            return
          }
        }

        // 如果获取路由失败，转到登录页
        next('/login')
        return
      } catch (error) {
        console.error('路由加载失败:', error)
        next('/login')
        return
      }
    }

    // 检查用户权限，确保用户有权限访问当前路由
    if (to.meta.permission) {
      const hasPermission = userStore.permissions.some(p => p === to.meta.permission)
      if (!hasPermission) {
        next('/error/403')  // 跳转到无权限页面
        return
      }
    }

    // 权限验证通过，放行
    next()
    return
  }

  // 未登录且需要认证的页面，重定向到登录页
  next(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
})

router.afterEach(() => {
  NProgress.done()
})

export default router
