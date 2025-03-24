<template>
  <a-tree-select
    :allow-clear="true"
    :dropdown-style="{ maxHeight: '220px', overflow: 'auto' }"
    :tree-data="deptTreeData"
    v-model:value="value"
  >
  </a-tree-select>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRequest } from '@/utils/request'

// 获取API请求方法
const { get } = useRequest()

// 定义事件
const emit = defineEmits(['change'])

// 部门树数据
const deptTreeData = ref([])
// 选中的值
const value = ref(undefined)

// 加载部门树数据
onMounted(() => {
  fetchDeptTree()
})

// 获取部门树数据
const fetchDeptTree = () => {
  get('auth/dept/deptTree').then(r => {
    // 确保返回数据格式正确
    if (r.data && r.data.data) {
      const data = r.data.data
      // 检查是否有children属性
      if (data.children) {
        deptTreeData.value = data.children
      } else {
        // 如果没有children属性，尝试直接使用返回的数据
        deptTreeData.value = Array.isArray(data) ? data : []
        console.warn('部门树数据结构不符合预期，缺少children属性', data)
      }
    } else {
      console.error('获取部门树数据格式错误', r.data)
      deptTreeData.value = []
    }
  }).catch(error => {
    console.error('获取部门树失败', error)
    deptTreeData.value = []
  })
}

// 监听值变化
watch(value, (newValue) => {
  emit('change', newValue)
})

// 重置方法
const reset = () => {
  value.value = undefined
}

// 设置选中值的方法
const setValue = (val) => {
  value.value = val
}

// 暴露方法给父组件
defineExpose({
  reset,
  setValue
})
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>
