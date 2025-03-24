<template>
  <a-col :md="6" :sm="24">
    <a-form-item
      :label="label"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 18, offset: 1 }"
    >
      <slot></slot>
    </a-form-item>
  </a-col>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  }
});
</script>

<style lang="less" scoped>
:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-form-item-label) {
  text-align: right;
  label {
    color: #666;
  }
}

:deep(.ant-input), :deep(.ant-select) {
  border-radius: 4px;
}
</style>
