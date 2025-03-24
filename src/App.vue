<template>
  <a-config-provider :locale="zhCN">
    <div id="app">
      <router-view />
    </div>
  </a-config-provider>
</template>

<script setup>
// 使用组合式API语法
import { onMounted } from 'vue'
import { useAppStore } from './stores/app'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

const appStore = useAppStore()

onMounted(() => {
  // 检测设备类型
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  appStore.setDevice(isMobile ? 'mobile' : 'desktop')
})
</script>

<style lang="less">
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  height: 100%;
}

::-webkit-scrollbar {
  width: 0.5rem;
  height: 0.5rem;
}

::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.05);
}

::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 0.25rem;
}
</style>
