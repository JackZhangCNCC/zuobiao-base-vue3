<template>
  <a-layout class="layout-container">
    <!-- 侧边栏 -->
    <a-layout-sider
      v-model:collapsed="sidebarCollapsed"
      :width="sidebarWidth"
      :collapsible="true"
      breakpoint="lg"
      @collapse="handleCollapse"
      class="sidebar-container"
    >
      <div class="logo">
        <router-link to="/">
          <img src="@/assets/images/logo.png" alt="logo" />
          <h1 v-show="!sidebarCollapsed">坐标基础系统</h1>
        </router-link>
      </div>

      <menu-component />
    </a-layout-sider>

    <!-- 主体内容 -->
    <a-layout>
      <!-- 顶部导航 -->
      <a-layout-header class="header-container">
        <header-component :collapsed="sidebarCollapsed" @toggle="toggleSidebar" />
      </a-layout-header>

      <!-- 内容区域 -->
      <a-layout-content class="content-container">
        <div class="content-wrapper">
          <breadcrumb-component />
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <keep-alive :include="cachedViews">
                <component :is="Component" :key="$route.path" />
              </keep-alive>
            </transition>
          </router-view>
        </div>
      </a-layout-content>

      <!-- 页脚 -->
      <a-layout-footer class="footer-container">
        <footer-component />
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '@/stores/app'
import MenuComponent from './components/Menu.vue'
import HeaderComponent from './components/Header.vue'
import BreadcrumbComponent from './components/Breadcrumb.vue'
import FooterComponent from './components/Footer.vue'

// 使用 Pinia store
const appStore = useAppStore()

// 侧边栏状态
const sidebarWidth = ref('256px')
const sidebarCollapsed = computed({
  get: () => appStore.sidebarCollapsed,
  set: (value) => appStore.setSidebarCollapsed(value)
})

// 缓存的视图
const cachedViews = ref([])

// 切换侧边栏
const toggleSidebar = () => {
  appStore.toggleSidebar()
}

// 处理侧边栏折叠状态变化
const handleCollapse = (collapsed) => {
  appStore.setSidebarCollapsed(collapsed)
  if (collapsed) {
    sidebarWidth.value = '80px'
  } else {
    sidebarWidth.value = '256px'
  }
}

onMounted(() => {
  // 移动端默认折叠侧边栏
  if (appStore.isMobile && !sidebarCollapsed.value) {
    sidebarWidth.value = '80px'
    appStore.setSidebarCollapsed(true)
  }
})
</script>

<style lang="less" scoped>
.layout-container {

  .sidebar-container {
    box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
    z-index: 10;

    .logo {
      height: 64px;
      padding: 16px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;

      a {
        display: flex;
        align-items: center;
        height: 100%;

        img {
          height: 32px;
          width: 32px;
          margin-right: 8px;
        }

        h1 {
          color: white;
          font-size: 18px;
          margin: 0;
        }
      }
    }

    :deep(.ant-layout-sider-children) {
      width: v-bind('sidebarWidth');
      position: fixed;
    }
  }

  .header-container {
    padding: 0;
    background: #fff;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }

  .content-container {
    margin: 16px;

    .content-wrapper {
      min-height: 280px;
    }
  }

  .footer-container {
    text-align: center;
    padding: 16px;
  }
}

// 页面切换动画
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
