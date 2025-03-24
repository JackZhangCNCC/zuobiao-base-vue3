<template>
  <div class="user-management">
    <search-card @search="search" @reset="reset">
      <template #search-items>
        <search-form-item label="用户名">
          <a-input v-model:value="queryParams.loginName" />
        </search-form-item>

        <search-form-item label="部门">
          <dept-input-tree @change="handleDeptChange" ref="deptTreeRef"></dept-input-tree>
        </search-form-item>

        <search-form-item label="创建时间">
          <range-date
            @change="handleDateChange"
            ref="createTimeRef"
          ></range-date>
        </search-form-item>
      </template>

      <template #operations>
        <action-buttons
          :hasSelected="selectedRowKeys.length > 0"
          @add="add"
          @delete="batchDelete"
        >
          <span v-hasAnyPermission="['user:reset', 'user:export']">
            <a-dropdown>
              <template #overlay>
                <a-menu>
                  <span v-hasPermission="'user:reset'">
                    <a-menu-item
                      key="password-reset"
                      @click="resetPassword"
                    >密码重置</a-menu-item>
                  </span>
                  <!-- <span v-hasPermission="'user:export'">
                    <a-menu-item
                      key="export-excel"
                      @click="exportExcel"
                    >导出Excel</a-menu-item>
                  </span> -->
                </a-menu>
              </template>
              <a-button>
                更多操作
                <down-outlined />
              </a-button>
            </a-dropdown>
          </span>
        </action-buttons>
      </template>

      <template #table>
        <a-table
          ref="tableRef"
          :columns="columns"
          :data-source="dataSource"
          :pagination="pagination"
          :loading="loading"
          :row-selection="{
            selectedRowKeys: selectedRowKeys,
            onChange: onSelectChange,
            columnWidth: '55px',
            columnTitle: ' ',
            type: 'checkbox',
            preserveSelectedRowKeys: false
          }"
          :scroll="{ x: 900 }"
          @change="handleTableChange"
          row-key="id"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'email'">
              <a-popover placement="topLeft">
                <template #content>
                  <div>{{ text }}</div>
                </template>
                <p style="width: 150px;margin-bottom: 0">{{ text }}</p>
              </a-popover>
            </template>
            <template v-else-if="column.dataIndex === 'sex'">
              <span>
                <template v-if="text === 1">男</template>
                <template v-else-if="text === 2">女</template>
                <template v-else-if="text === 3">保密</template>
                <template v-else>{{ text }}</template>
              </span>
            </template>
            <template v-else-if="column.dataIndex === 'userStatus'">
              <a-tag :color="text === 1 ? 'cyan' : 'red'">
                {{ text === 1 ? '有效' : '锁定' }}
              </a-tag>
            </template>
            <template v-else-if="column.dataIndex === 'operation'">
              <setting-outlined
                v-hasPermission="'user:update'"
                class="icon-button"
                theme="twoTone"
                two-tone-color="#4a9ff5"
                @click="edit(record)"
                title="修改用户"
              />
              <eye-outlined
                v-hasPermission="'user:view'"
                class="icon-button"
                theme="twoTone"
                two-tone-color="#42b983"
                @click="view(record)"
                title="查看"
              />
              <a-badge
                v-hasNoPermission="['user:update', 'user:view']"
                status="warning"
                text="无权限"
              ></a-badge>
            </template>
          </template>
        </a-table>
      </template>

      <template #dialogs>
        <!-- 用户信息查看 -->
        <user-info
          :userInfoData="userInfo.data"
          :userInfoVisiable="userInfo.visiable"
          @close="handleUserInfoClose"
        ></user-info>
        <!-- 新增用户 -->
        <user-add
          @close="handleUserAddClose"
          @success="handleUserAddSuccess"
          :userAddVisiable="userAdd.visiable"
          :defaultPassword="defaultPassword"
        ></user-add>
        <!-- 修改用户 -->
        <user-edit
          ref="userEditRef"
          @close="handleUserEditClose"
          @success="handleUserEditSuccess"
          :userEditVisiable="userEdit.visiable"
        ></user-edit>
      </template>
    </search-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, toRefs, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { SettingOutlined, EyeOutlined, DownOutlined } from '@ant-design/icons-vue'
import UserInfo from './UserInfo.vue'
import DeptInputTree from '../dept/DeptInputTree.vue'
import RangeDate from '@/components/datetime/RangeDate.vue'
import UserAdd from './UserAdd.vue'
import UserEdit from './UserEdit.vue'
import { useRequest, handleResponse } from '../../../utils/request'
import SearchCard from '@/components/layout/SearchCard.vue'
import SearchFormItem from '@/components/form/SearchFormItem.vue'
import ActionButtons from '@/components/operation/ActionButtons.vue'

// 获取请求方法
const { get, post, export: exportExcelFile } = useRequest()

// 表单相关
const deptTreeRef = ref(null)
const createTimeRef = ref(null)
const tableRef = ref(null)
const userEditRef = ref(null)

// 状态数据
const userInfo = reactive({
  visiable: false,
  data: {}
})

const userAdd = reactive({
  visiable: false
})

const userEdit = reactive({
  visiable: false
})

// 查询参数
const queryParams = reactive({})
const filteredInfo = ref(null)
const sortedInfo = ref(null)
const paginationInfo = ref(null)
const dataSource = ref([])
const selectedRowKeys = ref([])
const loading = ref(false)
const defaultPassword = ref('') // 默认密码

// 分页配置
const pagination = reactive({
  pageSizeOptions: ['10', '20', '30', '40', '100'],
  defaultCurrent: 1,
  defaultPageSize: 10,
  showQuickJumper: true,
  showSizeChanger: true,
  showTotal: (total, range) =>
    `显示 ${range[0]} ~ ${range[1]} 条记录，共 ${total} 条记录`
})

// 表格列配置
const columns = computed(() => {
  return [
    {
      title: '用户名',
      dataIndex: 'loginName'
    },
    {
      title: '姓名',
      dataIndex: 'userName'
    },
    {
      title: '性别',
      dataIndex: 'sex'
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 100
    },
    {
      title: '部门',
      dataIndex: 'stationsName'
    },
    {
      title: '电话',
      dataIndex: 'userPhone'
    },
    {
      title: '状态',
      dataIndex: 'userStatus'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime'
    },
    {
      title: '操作',
      dataIndex: 'operation'
    }
  ]
})

// 生命周期钩子
onMounted(() => {
  fetch({
    ...queryParams
  })
  getDefaultPassword()
})

// 获取初始密码
const getDefaultPassword = () => {
  get('auth/user/defaultPassword').then(r => {
    defaultPassword.value = r.data.obj
  })
}

// 表格选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys;
  console.log('选中的行:', keys);
}

// 查看用户详情
const view = (record) => {
  userInfo.data = record
  userInfo.visiable = true
}

// 添加用户
const add = () => {
  userAdd.visiable = true
}

const handleUserAddClose = () => {
  userAdd.visiable = false
}

const handleUserAddSuccess = () => {
  userAdd.visiable = false
  message.success(`新增用户成功，初始密码为${defaultPassword.value}`)
  fetch({
    ...queryParams
  })
}

// 编辑用户
const edit = (record) => {
  userEditRef.value.setFormValues(record)
  userEdit.visiable = true
}

const handleUserEditClose = () => {
  userEdit.visiable = false
}

const handleUserEditSuccess = () => {
  userEdit.visiable = false
  message.success('修改用户成功')
  fetch({
    ...queryParams
  })
}

const handleUserInfoClose = () => {
  userInfo.visiable = false
}

// 查询条件变化处理
const handleDeptChange = (value) => {
  queryParams.stationsId = value || ''
}

const handleDateChange = (value) => {
  if (value) {
    queryParams.createTimeFrom = value[0]
    queryParams.createTimeTo = value[1]
  }
}

// 删除
const batchDelete = () => {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择需要删除的记录')
    return
  }

  Modal.confirm({
    title: '确定删除所选中的记录?',
    content: '当您点击确定按钮后，这些记录将会被彻底删除，不可恢复。',
    centered: true,
    async onOk() {
      try {
        // selectedRowKeys已经存储了用户ID，直接使用
        const userIds = selectedRowKeys.value.join(',')

        const { data } = await post('auth/user/del', {
          userIds: userIds
        })

        if (handleResponse(data, null, '删除失败')) {
          message.success('删除成功')
          selectedRowKeys.value = []
          fetch({
            ...queryParams
          })
        }
      } catch (error) {
        console.error('删除用户错误:', error)
        message.error('删除失败')
      }
    },
    onCancel() {
      selectedRowKeys.value = []
    }
  })
}

// 重置密码
const resetPassword = () => {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择需要重置密码的用户')
    return
  }

  // 获取选中用户的登录名
  const selectedLoginNames = selectedRowKeys.value.map(key => {
    // 在数据源中查找对应的用户记录
    const userRecord = dataSource.value.find(item => item.id === key)
    return userRecord ? userRecord.loginName : null
  }).filter(Boolean) // 过滤掉null值

  if (selectedLoginNames.length === 0) {
    message.warning('无法获取选中用户的登录名')
    return
  }

  Modal.confirm({
    title: '确定重置选中用户密码?',
    content: `当您点击确定按钮后，这些用户的密码将会重置为${defaultPassword.value}`,
    centered: true,
    async onOk() {
      try {
        const { data } = await post('auth/user/password/reset', {
          loginNames: selectedLoginNames.join(',')
        })

        if (handleResponse(data, null, '重置密码失败')) {
          message.success('重置用户密码成功')
          selectedRowKeys.value = []
        }
      } catch (error) {
        console.error('重置密码错误:', error)
        message.error('重置密码失败')
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
    const { filteredInfo: filterInfo } = toRefs(tableRef)

    await exportExcelFile('user/excel', {
      ...queryParams,
      ...filterInfo.value
    })
    message.success('导出成功')
  } catch (error) {
    console.error('导出Excel失败', error)
    message.error('导出失败')
  }
}

// 查询
const search = () => {
  fetchFromPageOne({
    ...queryParams
  })
}

// 重置
const reset = () => {
  // 取消选中
  selectedRowKeys.value = []
  // 重置分页
  tableRef.value.pagination.current = pagination.defaultCurrent
  if (paginationInfo.value) {
    paginationInfo.value.current = pagination.defaultCurrent
    paginationInfo.value.pageSize = pagination.defaultPageSize
  }
  // 重置列过滤器规则
  filteredInfo.value = null
  // 重置列排序规则
  sortedInfo.value = null
  // 重置查询参数
  Object.keys(queryParams).forEach(key => {
    delete queryParams[key]
  })
  // 清空部门树选择
  deptTreeRef.value.reset()
  // 清空时间选择
  createTimeRef.value.reset()

  fetch({
    ...queryParams
  })
}

// 表格变化处理
const handleTableChange = (pag, filters, sorter) => {
  // 将这三个参数赋值给Vue data，用于后续使用
  paginationInfo.value = pag
  filteredInfo.value = filters
  sortedInfo.value = sorter

  userInfo.visiable = false
  fetch({
    ...queryParams,
    ...filters
  })
}

// 获取数据
const fetch = async (params = {}) => {
  // 显示loading
  loading.value = true

  // 处理分页
  if (paginationInfo.value) {
    params.pageSize = paginationInfo.value.pageSize
    params.pageNum = paginationInfo.value.current
  } else {
    params.pageSize = pagination.defaultPageSize
    params.pageNum = pagination.defaultCurrent
  }

  // 合并查询参数
  params = {
    ...params,
    ...queryParams
  }

  try {
    const { data } = await get('auth/user', params)
    if (handleResponse(data, null, '获取用户列表失败')) {
      const obj = data.obj
      dataSource.value = obj.rows
      pagination.total = obj.total
    }
  } catch (error) {
    console.error('获取用户列表失败', error)
    message.error('获取用户列表失败')
  } finally {
    // 关闭loading
    loading.value = false
  }
}

// 分页之后的查询，页数设置为1，页码为10
const fetchFromPageOne = async (params = {}) => {
  // 显示loading
  loading.value = true
  params.pageSize = pagination.defaultPageSize
  params.pageNum = pagination.defaultCurrent

  try {
    const { data } = await get('auth/user', params)
    if (handleResponse(data, null, '获取用户列表失败')) {
      const paginationConfig = { ...pagination }
      paginationConfig.total = data.obj.total
      dataSource.value = data.obj.rows
      pagination.value = paginationConfig
    }
  } catch (error) {
    console.error('获取用户列表错误:', error)
    message.error('获取用户列表失败')
  } finally {
    // 数据加载完毕，关闭loading
    loading.value = false
  }
}
</script>

<style lang="less" scoped>
.user-management {
  padding: 16px;
}

.icon-button {
  margin-right: 8px;
  cursor: pointer;
}
</style>
