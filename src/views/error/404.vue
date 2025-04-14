<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <h2>抱歉，您访问的页面不存在</h2>
      <div class="actions">
        <a-button type="primary" @click="goHome">
          返回首页
        </a-button>
        <a-button @click="goBack">
          返回上一页
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

// 返回首页
const goHome = () => {
  router.push('/')
}

// 返回上一页
const goBack = () => {
  router.go(-1)
}
</script>

<style lang="less" scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f1f3f8;

  .content {
    text-align: center;

    h1 {
      font-size: 144px;
      font-weight: 600;
      color: #1890ff;
      margin-bottom: 24px;
    }

    h2 {
      font-size: 24px;
      margin-bottom: 48px;
      color: rgba(0, 0, 0, 0.65);
    }

    .actions {
      button {
        margin: 0 8px;
      }
    }
  }
}

@media screen and (max-width: 576px) {
  .not-found {
    .content {
      h1 {
        font-size: 96px;
      }

      h2 {
        font-size: 18px;
      }
    }
  }
}
</style>
