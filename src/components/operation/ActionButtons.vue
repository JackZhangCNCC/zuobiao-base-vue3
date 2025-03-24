<template>
  <div class="action-buttons-container">
    <a-space>
      <a-button type="primary" ghost v-if="hasAdd" @click="$emit('add')">
        <template #icon><plus-outlined /></template>
        新增
      </a-button>
      <a-button v-if="hasDelete" :disabled="!hasSelected" @click="$emit('delete')">
        <template #icon><delete-outlined /></template>
        删除
      </a-button>
      <a-button v-if="hasExport" @click="$emit('export')">
        <template #icon><download-outlined /></template>
        导出Excel
      </a-button>
      <slot></slot>
    </a-space>
  </div>
</template>

<script setup>
import { PlusOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons-vue';

defineProps({
  hasAdd: {
    type: Boolean,
    default: true
  },
  hasDelete: {
    type: Boolean,
    default: true
  },
  hasExport: {
    type: Boolean,
    default: true
  },
  hasSelected: {
    type: Boolean,
    default: true
  }
});

defineEmits(['add', 'delete', 'export']);
</script>

<style lang="less" scoped>
.action-buttons-container {
  margin-bottom: 16px;

  :deep(.ant-btn) {
    height: 32px;
    font-size: 14px;
    padding: 0 12px;
  }
}
</style>
