<template>
  <div class="header">
    <!-- 左侧菜单折叠按钮 -->
    <div class="left">
      <menu-unfold-outlined
        v-if="collapsed"
        class="trigger"
        @click="$emit('toggle')"
      />
      <menu-fold-outlined
        v-else
        class="trigger"
        @click="$emit('toggle')"
      />
    </div>

    <!-- 右侧工具区 -->
    <div class="right">
      <!-- 全屏按钮 -->
      <a-tooltip title="全屏">
        <div class="action-item" @click="toggleFullScreen">
          <fullscreen-outlined v-if="!isFullscreen" />
          <fullscreen-exit-outlined v-else />
        </div>
      </a-tooltip>

      <!-- 通知 -->
      <a-dropdown :trigger="['click']">
        <div class="action-item">
          <badge :count="5">
            <bell-outlined />
          </badge>
        </div>
        <template #overlay>
          <a-menu>
            <a-menu-item key="1">
              <a href="javascript:;">通知1</a>
            </a-menu-item>
            <a-menu-item key="2">
              <a href="javascript:;">通知2</a>
            </a-menu-item>
            <a-menu-item key="3">
              <a href="javascript:;">查看更多</a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>

      <!-- 用户头像和菜单 -->
      <a-dropdown :trigger="['click']">
        <div class="action-item">
          <a-avatar :size="32" :src="userAvatar">
            <template #icon v-if="!userAvatar">
              <user-outlined />
            </template>
          </a-avatar>
          <span class="username">{{ username }}</span>
        </div>
        <template #overlay>
          <a-menu>
            <a-menu-item key="profile">
              <user-outlined />
              <span>个人中心</span>
            </a-menu-item>
            <a-menu-item key="settings">
              <setting-outlined />
              <span>个人设置</span>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="logout" @click="handleLogout">
              <logout-outlined />
              <span>退出登录</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons-vue'
import { Badge } from 'ant-design-vue'

// 定义props
const props = defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits(['toggle'])

// 获取用户信息
const userStore = useUserStore()
const router = useRouter()

// 用户名和头像
const username = computed(() => {
  return userStore.user?.username || userStore.user?.loginName || '未登录'
})
const userAvatar = computed(() => {
  if (userStore.user?.avatar) {
    return `src/assets/avatar/${userStore.user.avatar}`;
  }
  return ''
})

// 退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

// 全屏功能
const isFullscreen = ref(false)

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      isFullscreen.value = false
    }
  }
}
</script>

<style lang="less" scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 16px;
  background: #fff;

  .left {
    .trigger {
      font-size: 18px;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: @primary-color;
      }
    }
  }

  .right {
    display: flex;
    align-items: center;

    .action-item {
      display: flex;
      align-items: center;
      height: 100%;
      padding: 0 12px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: rgba(0, 0, 0, 0.025);
      }
    }

    .username {
      margin-left: 8px;
    }
  }
}
</style>
