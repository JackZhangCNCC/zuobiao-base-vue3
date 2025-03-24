<template>
  <div class="breadcrumb">
    <a-breadcrumb>
      <a-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
        <router-link
          v-if="item.path && index !== breadcrumbs.length - 1"
          :to="item.path"
        >
          <span>{{ item.title }}</span>
        </router-link>
        <span v-else>{{ item.title }}</span>
      </a-breadcrumb-item>
    </a-breadcrumb>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const breadcrumbs = ref([])

// 根据当前路由生成面包屑
const generateBreadcrumbs = () => {
  const { path, matched, meta } = route

  // 首页始终是第一个
  const result = [
    {
      path: '/',
      title: '首页',
    }
  ]

  // 添加当前路由的所有父级和自身
  if (matched.length > 1) {
    matched.slice(1).forEach(match => {
      if (match.meta?.title) {
        result.push({
          path: match.path,
          title: match.meta.title,
        })
      }
    })
  }

  // 如果没有匹配到带有标题的路由，则添加当前路径的最后一段
  if (result.length === 1 && meta?.title) {
    result.push({
      path: path,
      title: meta.title,
    })
  }

  breadcrumbs.value = result
}

// 监听路由变化
watch(() => route.path, generateBreadcrumbs, { immediate: true })
</script>

<style lang="less" scoped>
.breadcrumb {
  margin-bottom: 16px;
}
</style>
