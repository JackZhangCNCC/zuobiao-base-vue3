<template>
  <a-range-picker
    :key="id"
    ref="rangeDateRef"
    @change="onChange"
    style="width: 100%"
  ></a-range-picker>
</template>

<script setup>
import { ref } from 'vue'

// 定义事件
const emit = defineEmits(['change'])

// 组件引用
const rangeDateRef = ref(null)

// 组件ID，用于强制刷新
const id = ref(Date.now())

// 日期变化处理
const onChange = (date, dateString) => {
  emit('change', dateString)
}

// 重置方法
const reset = () => {
  id.value = Date.now()
}

// 暴露方法给父组件
defineExpose({
  reset
})
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>
