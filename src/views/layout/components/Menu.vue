<template>
  <a-menu
    v-model:selectedKeys="selectedKeys"
    v-model:openKeys="openKeys"
    mode="inline"
    theme="dark"
    :inline-collapsed="appStore.sidebarCollapsed"
    :force-sub-menu-render="true"
  >
    <template v-for="menu in menus" :key="getMenuKey(menu)">
      <!-- 有子菜单的情况 -->
      <template v-if="menu.children && menu.children.length > 0">
        <a-sub-menu :key="getMenuKey(menu)">
          <template #icon>
            <component :is="getIconComponent(menu.meta?.icon || menu.icon)" />
          </template>
          <template #title>{{ menu.meta?.title || menu.name || menu.text }}</template>

          <!-- 递归渲染子菜单 -->
          <a-menu-item
            v-for="subMenu in menu.children"
            :key="getMenuKey(subMenu)"
            @click="handleMenuClick(subMenu)"
          >
            <template #icon>
              <component :is="getIconComponent(subMenu.meta?.icon || subMenu.icon)" />
            </template>
            {{ subMenu.meta?.title || subMenu.name || subMenu.text }}
          </a-menu-item>
        </a-sub-menu>
      </template>

      <!-- 没有子菜单的情况 -->
      <template v-else>
        <a-menu-item :key="getMenuKey(menu)" @click="handleMenuClick(menu)">
          <template #icon>
            <component :is="getIconComponent(menu.meta?.icon || menu.icon)" />
          </template>
          <span>
            {{ menu.meta?.title || menu.name || menu.text }}
            <LinkOutlined v-if="isExternalLink(menu)" class="external-link-icon" />
          </span>
        </a-menu-item>
      </template>
    </template>
  </a-menu>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import MenuHandlerUtils from '@/utils/menuHandlerUtils'
import ExternalLinkUtils from '@/utils/externalLinkUtils'
import IconUtils from '@/utils/iconUtils'
import { LinkOutlined, MenuOutlined } from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

// 检查菜单项是否为外部链接
const isExternalLink = (menu) => {
  return menu.isFrame == '1' || menu.isFrame === 1 || ExternalLinkUtils.isExternalLink(menu.path);
}

// 获取菜单的唯一键，用于菜单项的key
const getMenuKey = (menu) => {
  if (!menu) return '';
  
  // 如果是路由对象
  if (menu.path) {
    return menu.path;
  }
  
  // 如果是路径字符串
  if (typeof menu === 'string') {
    return menu;
  }
  
  // 默认使用菜单ID或生成随机ID
  return menu.id || Date.now().toString();
}

// 当前选中的菜单
const selectedKeys = ref([getMenuKey(route)])
// 当前展开的子菜单
const openKeys = ref([])

// 菜单数据 - 从路由和用户权限生成
const menus = computed(() => {
  // 使用后端返回的路由数据
  const routes = userStore.routes || []

  // 找到"主页"菜单
  const homeMenu = routes.find(route => route.path === '/' || route.name === '主页')

  // 如果找到主页菜单且有子菜单，则使用其子菜单作为一级菜单
  if (homeMenu && homeMenu.children && homeMenu.children.length > 0) {
    return homeMenu.children
  }

  // 如果找不到主页菜单或没有子菜单，则返回原始路由列表
  return routes
})

// 处理菜单点击
const handleMenuClick = (menu) => {
  // 检查是否为外部链接
  if (isExternalLink(menu)) {
    // 使用外部链接工具处理
    ExternalLinkUtils.openExternalLink(menu.path, {
      extraParams: {
        menuId: menu.id || '',
        menuName: menu.name || menu.text || ''
      }
    });
  } else {
    // 内部路由跳转
    router.push(menu.path);
  }
}

// 监听路由变化，更新选中的菜单
watch(() => route.path, (newPath) => {
  selectedKeys.value = [newPath]

  // 找到所有父级路径并展开
  const findParentPaths = (path) => {
    // 处理层级偏移的情况
    const homeMenu = (userStore.routes || []).find(route => route.path === '/' || route.name === '主页')
    const isUsingChildrenAsTopLevel = homeMenu && homeMenu.children && homeMenu.children.length > 0

    const segments = path.split('/').filter(Boolean)
    const paths = []

    if (segments.length > 0) {
      let currentPath = ''
      for (let i = 0; i < segments.length - 1; i++) {
        currentPath += '/' + segments[i]
        // 不包含主页路径
        if (isUsingChildrenAsTopLevel && homeMenu.path && currentPath === homeMenu.path) {
          continue
        }
        paths.push(currentPath)
      }
    }

    return paths
  }

  const parentPaths = findParentPaths(newPath)
  if (parentPaths.length > 0 && !appStore.sidebarCollapsed) {
    openKeys.value = parentPaths
  }
}, { immediate: true })

// 监听侧边栏折叠状态
watch(() => appStore.sidebarCollapsed, (collapsed) => {
  openKeys.value = collapsed ? [] : findParentPathsByPath(route.path)
})

// 根据路径查找所有父级路径
const findParentPathsByPath = (path) => {
  // 处理层级偏移的情况
  const homeMenu = (userStore.routes || []).find(route => route.path === '/' || route.name === '主页')
  const isUsingChildrenAsTopLevel = homeMenu && homeMenu.children && homeMenu.children.length > 0

  // 从完整路由中获取父路径
  const segments = path.split('/').filter(Boolean)
  const paths = []

  if (segments.length > 0) {
    let currentPath = ''
    for (let i = 0; i < segments.length - 1; i++) {
      currentPath += '/' + segments[i]
      // 不包含主页路径
      if (isUsingChildrenAsTopLevel && homeMenu.path && currentPath === homeMenu.path) {
        continue
      }
      paths.push(currentPath)
    }
  }

  return paths
}

// 获取图标组件 - 使用工具类
const getIconComponent = (icon) => {
  if (!icon) {
    // console.log('图标名称为空，返回默认图标');
    return MenuOutlined;
  }
  
  try {
    const component = IconUtils.getIconComponent(icon);
    return component;
  } catch (error) {
    console.error('图标转换错误:', error);
    return MenuOutlined;
  }
}
</script>

<style lang="less" scoped>
.ant-menu {
  border-right: 0;
  overflow-y: auto;
  height: calc(100vh - 112px);
}

.external-link-icon {
  margin-left: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
}
</style>
