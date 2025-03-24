<template>
  <a-card :bordered="false" class="search-card">
    <!-- 搜索区域 -->
    <div class="search-area">
      <a-form layout="horizontal">
        <a-row>
          <slot name="search-items"></slot>
          <a-col :span="24" class="action-buttons">
            <a-button type="primary" @click="$emit('search')">
              <template #icon><search-outlined /></template>
              查询
            </a-button>
            <a-button @click="$emit('reset')">
              <template #icon><reload-outlined /></template>
              重置
            </a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>

    <!-- 操作区域 -->
    <div class="operation-area">
      <slot name="operations"></slot>
    </div>

    <!-- 表格区域 -->
    <div class="table-area">
      <slot name="table"></slot>
    </div>

    <!-- 弹窗组件 -->
    <slot name="dialogs"></slot>
  </a-card>
</template>

<script setup>
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue';

defineEmits(['search', 'reset']);
</script>

<style lang="less" scoped>
.search-card {
  width: 100%;
  margin-bottom: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px rgba(0, 0, 0, 0.02);

  :deep(.ant-card-body) {
    padding: 20px;
  }

  .search-area {
    margin-bottom: 20px;
    padding: 16px;
    background: #f9f9f9;
    border-radius: 4px;
    border: 1px solid #f0f0f0;

    .action-buttons {
      display: flex;
      justify-content: flex-end;
      margin-top: 8px;

      .ant-btn {
        margin-left: 8px;
      }
    }
  }

  .operation-area {
    margin-bottom: 16px;

    button {
      margin-right: 8px;
    }
  }

  .table-area {
    :deep(.ant-table-thead > tr > th) {
      background-color: #f7f9fb;
      color: #677b8c;
      font-weight: 500;
      border-bottom: 1px solid #e8e8e8;
    }

    :deep(.ant-table-tbody > tr > td) {
      border-bottom: 1px solid #f0f0f0;
      padding: 12px 16px;
    }

    :deep(.ant-pagination) {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
    }
  }
}
</style>
