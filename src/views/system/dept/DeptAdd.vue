<template>
  <zb-drawer
    :title="title"
    :width="720"
    v-model:visible="deptAddVisiable"
    :body-style="{ paddingBottom: '80px' }"
    @close="onClose"
    @confirm="handleSubmit"
    :confirm-loading="loading"
  >
    <a-form ref="formRef" :model="deptForm" :rules="rules" layout="vertical">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item name="parentId" label="上级部门">
            <dept-input-tree @change="handleDeptTreeChange" ref="deptTreeRef"></dept-input-tree>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item name="deptName" label="部门名称">
            <a-input v-model:value="deptForm.deptName" placeholder="请输入部门名称" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item name="orderNum" label="显示顺序">
            <a-input-number v-model:value="deptForm.orderNum" style="width: 100%" :min="0" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item name="sysId" label="子系统">
            <a-select v-model:value="deptForm.sysId" placeholder="请选择子系统">
              <a-select-option v-for="item in selectList" :key="item.sysId" :value="item.sysId">
                {{ item.sysName }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row :gutter="16">
        <a-col :span="12">
          <a-form-item name="status" label="状态">
            <a-select v-model:value="deptForm.status" placeholder="请选择状态">
              <a-select-option value="0">正常</a-select-option>
              <a-select-option value="1">停用</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </zb-drawer>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import DeptInputTree from './DeptInputTree.vue'
import { useRequest, handleResponse } from '@/utils/request'
import { useUserStore } from '@/stores/user'

// 定义组件属性
const props = defineProps({
  deptAddVisiable: {
    type: Boolean,
    default: false
  }
})

// 定义组件事件
const emit = defineEmits(['close', 'success'])

// 获取API请求方法
const { get, post } = useRequest()
// 获取用户存储
const userStore = useUserStore()

// 引用
const formRef = ref(null)
const deptTreeRef = ref(null)

// 状态
const loading = ref(false)
const title = ref('新增部门')
const selectList = ref([])

// 表单数据
const deptForm = reactive({
  parentId: 0,
  deptName: '',
  orderNum: 1,
  status: '0',
  sysId: undefined
})

// 表单校验规则
const rules = {
  deptName: [
    { required: true, message: '部门名称不能为空', trigger: 'blur' },
    { max: 30, message: '长度不能超过30个字符', trigger: 'blur' }
  ],
  orderNum: [
    { required: true, message: '显示顺序不能为空', trigger: 'blur' }
  ],
  sysId: [
    { required: true, message: '请选择子系统', trigger: 'change' }
  ]
}

// 生命周期钩子
onMounted(() => {
  fetchSystems()
})

// 获取子系统列表
const fetchSystems = async () => {
  try {
    // 获取当前用户ID
    const userId = userStore.user?.id || ''
    const { data } = await get(`/auth/sys/selectSysList?userId=${userId}`)

    if (handleResponse(data, null, '获取子系统列表失败') && data.obj) {
      selectList.value = data.obj
      if (data.obj.length > 0) {
        deptForm.sysId = data.obj[0].sysId
      }
    } else {
      selectList.value = []
    }
  } catch (error) {
    console.error('获取子系统列表失败', error)
    message.error('获取子系统列表失败')
  }
}

// 关闭抽屉
const onClose = () => {
  emit('close')
  // 重置表单
  formRef.value?.resetFields()
  deptForm.parentId = 0
  deptForm.deptName = ''
  deptForm.orderNum = 1
  deptForm.status = '0'
  deptForm.sysId = selectList.value[0]?.sysId

  // 重置部门树选择
  deptTreeRef.value?.reset()
}

// 部门树选择变化
const handleDeptTreeChange = (value) => {
  deptForm.parentId = value || 0
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate().then(() => {
    post('auth/dept', deptForm).then(({ data }) => {
      if (handleResponse(data, '新增部门成功', '新增部门失败')) {
        resetForm()
        emit('success')
      }
    }).catch(error => {
      console.error('新增部门失败', error)
      message.error('新增部门失败')
    })
  }).catch(errors => {
    console.log('表单校验失败', errors)
  })
}

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields()
  deptForm.parentId = 0
  deptForm.deptName = ''
  deptForm.orderNum = 1
  deptForm.status = '0'
  deptForm.sysId = selectList.value[0]?.sysId

  // 重置部门树选择
  deptTreeRef.value?.reset()
}
</script>

<style scoped>
/* 已删除底部按钮样式，因为zb-drawer组件已经内置了底部按钮功能 */
</style>
