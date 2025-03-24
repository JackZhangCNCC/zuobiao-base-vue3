<template>
  <a-card :bordered="false" class="card-area">
    <div>
      <!-- 搜索区域 -->
      <a-form layout="horizontal">
        <a-row>
          <a-col :md="8" :sm="24">
            <a-form-item
              label="部门名称"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 18, offset: 1 }"
            >
              <a-input v-model:value="queryParams.deptName" />
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item
              label="创建时间"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 18, offset: 1 }"
            >
              <range-date
                @change="handleDateChange"
                ref="createTimeRef"
              ></range-date>
            </a-form-item>
          </a-col>
          <a-col :md="8" :sm="24">
            <a-form-item
              label="子系统"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 18, offset: 1 }"
            >
              <a-select
                v-model:value="purposed"
                style="width: 100%"
                @change="purposeSelect"
              >
                <a-select-option v-for="item in selectList" :key="item.sysId">
                  {{ item.sysName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <span style="float: right; margin-top: 3px;">
          <a-button type="primary" @click="search">查询</a-button>
          <a-button style="margin-left: 8px" @click="reset">重置</a-button>
        </span>
      </a-form>
    </div>
    <div>
      <div class="operator">
        <a-button ghost type="primary" @click="add">新增</a-button>
        <a-button @click="batchDelete">删除</a-button>
        <a-button @click="exportExcel">导出Excel</a-button>
      </div>
      <!-- 表格区域 -->
      <a-table
        ref="tableRef"
        :columns="columns"
        :data-source="dataSource"
        :row-key="getRowkey"
        :pagination="false"
        :loading="loading"
        :defaultExpandedRowKeys="defaultExpandedRowKeys"
        @expand="expandChild"
        :row-selection="{
          selectedRowKeys: selectedRowKeys,
          onChange: onSelectChange
        }"
      >
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'operation'">
            <a @click="edit(record)">修改</a>
          </template>
        </template>
      </a-table>

      <!-- 部门新增 -->
      <dept-add
        v-if="deptAddVisiable"
        :deptAddVisiable="deptAddVisiable"
        @close="handleDeptAddClose"
        @success="handleDeptAddSuccess"
      />

      <!-- 部门编辑 -->
      <dept-edit
        v-if="deptEditVisiable"
        ref="deptEditRef"
        :deptEditVisiable="deptEditVisiable"
        @close="handleDeptEditClose"
        @success="handleDeptEditSuccess"
      />
    </div>
  </a-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import RangeDate from '@/components/datetime/RangeDate.vue'
import DeptAdd from './DeptAdd.vue'
import DeptEdit from './DeptEdit.vue'
import { useRequest, handleResponse } from '@/utils/request'
import { useUserStore } from '@/stores/user'

// 获取API请求方法
const { get, post, export: exportExcelFile } = useRequest()
// 获取用户存储
const userStore = useUserStore()

// 引用
const createTimeRef = ref(null)
const tableRef = ref(null)
const deptEditRef = ref(null)

// 状态数据
const purposed = ref('')
const selectList = ref([])
const deptAddVisiable = ref(false)
const deptEditVisiable = ref(false)
const openedList = ref([])

// 查询参数
const queryParams = reactive({
  deptName: '',
  sysId: ''
})

// 表格数据
const dataSource = ref([])
const sortedInfo = ref(null)
const selectedRowKeys = ref([])
const loading = ref(false)
const defaultExpandedRowKeys = ref([])

// 表格列配置
const columns = [
  {
    title: '部门名称',
    dataIndex: 'deptName',
    key: 'deptName'
  },
  {
    title: '排序',
    dataIndex: 'orderNum',
    key: 'orderNum'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    customRender: ({ text }) => {
      return text === '0' ? '正常' : '停用'
    }
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime'
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation'
  }
]

// 生命周期钩子
onMounted(() => {
  openedList.value = []
  getSystem()
})

// 获取子系统列表
const getSystem = async () => {
  try {
    // 获取当前用户ID
    const userId = userStore.user?.id || ''
    const { data } = await get(`/auth/sys/selectSysList?userId=${userId}`)

    if (handleResponse(data, null, '获取子系统列表失败') && data.obj) {
      selectList.value = data.obj
      queryParams.sysId = data.obj[0].sysId
      purposed.value = data.obj[0].sysId
      // 获取部门列表
      fetch({
        ...queryParams
      })
    } else {
      console.error('获取子系统数据格式错误', data)
      selectList.value = []
    }
  } catch (error) {
    console.error('获取子系统列表失败', error)
    message.error('获取子系统列表失败')
  }
}

// 子系统选择变化
const purposeSelect = (value) => {
  purposed.value = value
  queryParams.sysId = value
  fetch({
    ...queryParams
  })
}

// 日期范围变化
const handleDateChange = (value) => {
  if (value) {
    queryParams.createTimeFrom = value[0]
    queryParams.createTimeTo = value[1]
  }
}

// 获取表格行的唯一标识
const getRowkey = (record) => {
  return record.id
}

// 展开子节点
const expandChild = (expanded, record) => {
  if (expanded) {
    // 设置展开行Key
    defaultExpandedRowKeys.value.push(record.id)
  } else {
    defaultExpandedRowKeys.value = defaultExpandedRowKeys.value.filter(item => item !== record.id)
  }

  if (!expanded) return

  const id = record.id
  // 遍历查找需要展开的节点并获取其子节点数据
  const dataMap = (items) => {
    items.find(item => {
      if (item.id === id && openedList.value.indexOf(id) === -1) {
        // 找到当前要展开的节点，请求其子节点数据
        get(`auth/dept?deptId=${id}`).then(r => {
          if (handleResponse(r.data, null, '获取部门子节点失败')) {
            // 与Vue2项目保持一致的数据处理方式
            if (Object.is(r.data.obj.rows.children, undefined)) {
              item.children = r.data.obj.rows
            } else {
              item.children = r.data.obj.rows.children
            }
            openedList.value.push(id)
          }
        }).catch(error => {
          console.error('获取部门子节点失败', error)
          message.error('获取部门子节点失败')
        })
        return true
      }
      if (item.children && item.children.length > 0) {
        dataMap(item.children)
      }
      return false
    })
  }

  dataMap(dataSource.value || [])
}

// 表格选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys
}

// 新增部门
const add = () => {
  deptAddVisiable.value = true
}

const handleDeptAddClose = () => {
  deptAddVisiable.value = false
}

const handleDeptAddSuccess = () => {
  deptAddVisiable.value = false
  message.success('新增部门成功')
  openedList.value = []
  getSystem()
}

// 编辑部门
const edit = (record) => {
  deptEditRef.value.setFormValues(record)
  deptEditVisiable.value = true
}

const handleDeptEditClose = () => {
  deptEditVisiable.value = false
}

const handleDeptEditSuccess = () => {
  deptEditVisiable.value = false
  message.success('修改部门成功')
  openedList.value = []
  getSystem()
}

// 批量删除
const batchDelete = () => {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择需要删除的记录')
    return
  }

  Modal.confirm({
    title: '确定删除所选中的记录?',
    content: '当您点击确定按钮后，这些记录将会被彻底删除，如果其包含子记录，也将一并删除！',
    centered: true,
    async onOk() {
      try {
        const { data } = await post('auth/dept/del', {
          deptIds: selectedRowKeys.value.join(',')
        })

        if (handleResponse(data, '删除成功', '删除失败')) {
          selectedRowKeys.value = []
          openedList.value = []
          getSystem()
        }
      } catch (error) {
        console.error('删除部门失败', error)
        message.error('删除失败')
      }
    },
    onCancel() {
      selectedRowKeys.value = []
    }
  })
}

// 导出Excel
const exportExcel = async () => {
  try {
    await exportExcelFile('dept/excel', {
      ...queryParams
    })

    message.success('导出成功')
  } catch (error) {
    console.error('导出Excel失败', error)
    message.error('导出失败')
  }
}

// 查询
const search = () => {
  if (Object.keys(queryParams).length === 0) {
    queryParams.deptId = 0
  }

  openedList.value = []

  fetch({
    ...queryParams
  })
}

// 重置
const reset = () => {
  // 取消选中
  selectedRowKeys.value = []
  // 重置排序
  sortedInfo.value = null
  // 重置查询参数
  queryParams.deptName = ''
  queryParams.sysId = purposed.value

  // 清空日期选择
  createTimeRef.value.reset()

  openedList.value = []
  getSystem()
}

// 获取数据
const fetch = async (params = {}) => {
  loading.value = true

  try {
    const { data } = await get('auth/dept', {
      ...params
    })

    if (handleResponse(data, null, '获取部门列表失败')) {
      const response = data.obj
      dataSource.value = response.rows
      pagination.total = response.total
    } else {
      message.error(data.msg || '获取部门列表失败')
      dataSource.value = []
    }
  } catch (error) {
    console.error('获取部门列表失败', error)
    message.error('获取部门列表失败')
    dataSource.value = []
  } finally {
    loading.value = false
  }
}

const handleDelete = (record) => {
  Modal.confirm({
    title: '确定删除这条记录?',
    content: '当您点击确定按钮后，这些记录将会被彻底删除，无法恢复。',
    closable: true,
    centered: true,
    async onOk() {
      try {
        post(`auth/dept/del?deptId=${record.deptId}`).then(r => {
          if (handleResponse(r.data, '删除成功', '删除失败')) {
            openedList.value = []
            getSystem()
          }
        })
      } catch (error) {
        console.error('删除部门失败', error)
        message.error('删除失败')
      }
    },
    onCancel() {
      selectedRowKeys.value = []
    }
  })
}
</script>

<style lang="less" scoped>
.card-area {
  width: 100%;
}

.operator {
  margin-bottom: 18px;

  button {
    margin-right: 5px;
  }
}

:deep(.ant-table-tbody) > tr > td {
  padding: 4px 16px;
  overflow-wrap: break-word;
}

:deep(.ant-table-thead) tr th {
  background: #f7f9fb;
  color: #677b8c;
  border-bottom: 1px solid #e8e8e8;
}

:deep(.ant-table-thead > tr > th) {
  color: #677b8c;
  background: #f7f9fb;
  border: none;
}

:deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid #e8e8e8;
  color: #79858e;
}
</style>
