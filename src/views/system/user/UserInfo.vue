<template>
  <a-modal
    :title="'用户信息'"
    :width="800"
    :height="450"
    :open="userInfoVisiable"
    @cancel="onClose"
    :footer="null"
  >
    <a-descriptions
      :column="2"
      bordered
    >
      <a-descriptions-item label="用户名">
        {{ userInfoData.loginName }}
      </a-descriptions-item>
      <a-descriptions-item label="姓名">
        {{ userInfoData.userName }}
      </a-descriptions-item>
      <a-descriptions-item label="邮箱" span="2">
        {{ userInfoData.email }}
      </a-descriptions-item>
      <a-descriptions-item label="手机号">
        {{ userInfoData.userPhone }}
      </a-descriptions-item>
      <a-descriptions-item label="性别">
        <span v-if="userInfoData.sex === 1">男</span>
        <span v-else-if="userInfoData.sex === 2">女</span>
        <span v-else-if="userInfoData.sex === 3">保密</span>
      </a-descriptions-item>
      <a-descriptions-item label="部门" span="2">
        {{ userInfoData.stationsName }}
      </a-descriptions-item>
      <a-descriptions-item label="状态">
        <a-tag :color="userInfoData.userStatus === 1 ? 'cyan' : 'red'">
          {{ userInfoData.userStatus === 1 ? '有效' : '锁定' }}
        </a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="创建时间">
        {{ userInfoData.createTime }}
      </a-descriptions-item>
    </a-descriptions>
    <div class="drawer-bootom-button" style="margin-top: 10px;">
      <a-button style="margin-right: 8px" @click="onClose">关闭</a-button>
    </div>
  </a-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// 定义Props
const props = defineProps({
  userInfoData: {
    type: Object,
    default: () => ({})
  },
  userInfoVisiable: {
    type: Boolean,
    default: false
  }
})

// 定义事件
const emit = defineEmits(['close'])

// 关闭弹窗
const onClose = () => {
  emit('close')
}
</script>

<style lang="less" scoped>
.drawer-bootom-button {
  position: absolute;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  left: 0;
  background: #fff;
  border-radius: 0 0 2px 2px;
}
</style>
