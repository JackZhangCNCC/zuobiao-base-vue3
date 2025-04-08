<template>
  <a-menu
    v-model:selectedKeys="selectedKeys"
    v-model:openKeys="openKeys"
    mode="inline"
    theme="dark"
    :inline-collapsed="appStore.sidebarCollapsed"
    :force-sub-menu-render="true"
  >
    <template v-for="menu in menus" :key="menu.path">
      <!-- 有子菜单的情况 -->
      <template v-if="menu.children && menu.children.length > 0">
        <a-sub-menu :key="menu.path">
          <template #icon>
            <component :is="getIconComponent(menu.meta?.icon)" />
          </template>
          <template #title>{{ menu.meta?.title || menu.name }}</template>

          <!-- 递归渲染子菜单 -->
          <a-menu-item
            v-for="subMenu in menu.children"
            :key="subMenu.path"
            @click="handleMenuClick(subMenu)"
          >
            <template #icon>
              <component :is="getIconComponent(subMenu.meta?.icon)" />
            </template>
            {{ subMenu.meta?.title || subMenu.name }}
          </a-menu-item>
        </a-sub-menu>
      </template>

      <!-- 没有子菜单的情况 -->
      <template v-else>
        <a-menu-item :key="menu.path" @click="handleMenuClick(menu)">
          <template #icon>
            <component :is="getIconComponent(menu.meta?.icon)" />
          </template>
          {{ menu.meta?.title || menu.name }}
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

// 导入图标
import {
  HomeOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  FileOutlined,
  AppstoreOutlined,
  SafetyCertificateOutlined,
  MenuOutlined,
  DashboardOutlined,
  GlobalOutlined,
  FormOutlined,
  TableOutlined,
  MessageOutlined,
  MailOutlined,
  BellOutlined,
  CalendarOutlined,
  FolderOutlined,
  ProjectOutlined,
  ShopOutlined,
  MoneyCollectOutlined,
  DollarOutlined,
  AreaChartOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  EyeOutlined,
  LockOutlined,
  KeyOutlined,
  TagOutlined,
  TagsOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  UploadOutlined,
  DownloadOutlined,
  CloudOutlined,
  PrinterOutlined,
  SearchOutlined,
  FilterOutlined,
  LinkOutlined,
  PlusOutlined,
  MinusOutlined,
  QuestionOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckOutlined,
  CloseOutlined,
  LaptopOutlined,
  MobileOutlined,
  TabletOutlined,
  CarOutlined,
  ClockCircleOutlined,
  ScheduleOutlined,
  StarOutlined,
  HeartOutlined,
  EnvironmentOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const userStore = useUserStore()

// 当前选中的菜单
const selectedKeys = ref([route.path])
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
  router.push(menu.path)
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

// 获取图标组件
const getIconComponent = (icon) => {
  // 如果icon是有效的字符串
  if (icon && typeof icon === 'string') {
    // 导入的图标组件映射表 - 完整组件名称
    const iconComponentMap = {
      'HomeOutlined': HomeOutlined,
      'SettingOutlined': SettingOutlined,
      'UserOutlined': UserOutlined,
      'TeamOutlined': TeamOutlined,
      'FileOutlined': FileOutlined,
      'AppstoreOutlined': AppstoreOutlined,
      'SafetyCertificateOutlined': SafetyCertificateOutlined,
      'MenuOutlined': MenuOutlined,
      'DashboardOutlined': DashboardOutlined
    }
    
    // 简短名称到组件的映射表
    const iconNameMap = {
      'home': HomeOutlined,
      'setting': SettingOutlined,
      'user': UserOutlined,
      'team': TeamOutlined,
      'file': FileOutlined,
      'app': AppstoreOutlined,
      'appstore': AppstoreOutlined,
      'safety': SafetyCertificateOutlined,
      'security': SafetyCertificateOutlined,
      'menu': MenuOutlined,
      'dashboard': DashboardOutlined,
      'global': GlobalOutlined,
      'profile': UserOutlined,
      'audit': FileOutlined,
      'form': FormOutlined,
      'table': TableOutlined,
      'message': MessageOutlined,
      'mail': MailOutlined,
      'bell': BellOutlined,
      'notification': BellOutlined,
      'calendar': CalendarOutlined,
      'folder': FolderOutlined,
      'project': ProjectOutlined,
      'shop': ShopOutlined,
      'money': MoneyCollectOutlined,
      'dollar': DollarOutlined,
      'chart': AreaChartOutlined,
      'analysis': LineChartOutlined,
      'bar': BarChartOutlined,
      'pie': PieChartOutlined,
      'eye': EyeOutlined,
      'lock': LockOutlined,
      'key': KeyOutlined,
      'tag': TagOutlined,
      'tags': TagsOutlined,
      'delete': DeleteOutlined,
      'edit': EditOutlined,
      'save': SaveOutlined,
      'upload': UploadOutlined,
      'download': DownloadOutlined,
      'cloud': CloudOutlined,
      'printer': PrinterOutlined,
      'search': SearchOutlined,
      'filter': FilterOutlined,
      'link': LinkOutlined,
      'plus': PlusOutlined,
      'minus': MinusOutlined,
      'question': QuestionOutlined,
      'info': InfoCircleOutlined,
      'warning': WarningOutlined,
      'check': CheckOutlined,
      'close': CloseOutlined,
      'laptop': LaptopOutlined,
      'mobile': MobileOutlined,
      'tablet': TabletOutlined,
      'car': CarOutlined,
      'clock': ClockCircleOutlined,
      'schedule': ScheduleOutlined,
      'star': StarOutlined,
      'heart': HeartOutlined,
      'environment': EnvironmentOutlined,
      'location': EnvironmentOutlined
    }
    
    // 1. 先检查完整组件名称映射
    if (iconComponentMap[icon]) {
      return iconComponentMap[icon]
    }
    
    // 2. 再检查简短名称映射
    if (iconNameMap[icon.toLowerCase()]) {
      return iconNameMap[icon.toLowerCase()]
    }
    
    // 3. 如果是字符串但不在映射表中，尝试直接返回（兼容其他可能的组件名）
    return icon
  }
  
  // 默认返回 MenuOutlined 图标
  return MenuOutlined
}
</script>

<style lang="less" scoped>
.ant-menu {
  border-right: 0;
  overflow-y: auto;
  height: calc(100vh - 112px);
}
</style>
