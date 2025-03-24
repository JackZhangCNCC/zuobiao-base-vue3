<template>
  <div class="footer">
    <div class="copyright">
      坐标基础系统 &copy; {{ currentYear }} Johnson
    </div>
    <div class="links">
      <a href="https://github.com/JackZhangCNCC/zuobiao-base-vue3" target="_blank">GitHub</a>
      <a-divider type="vertical" />
      <a href="https://github.com/JackZhangCNCC" target="_blank">博客</a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// 当前年份
const currentYear = computed(() => new Date().getFullYear())
</script>

<style lang="less" scoped>
.footer {
  text-align: center;
  color: rgba(0, 0, 0, 0.45);

  .copyright {
    margin-bottom: 8px;
  }

  .links {
    a {
      color: rgba(0, 0, 0, 0.45);

      &:hover {
        color: @primary-color;
      }
    }
  }
}
</style>
