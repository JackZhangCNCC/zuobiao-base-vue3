<template>
  <div class="role-management">
    <search-card @search="search" @reset="reset">
      <template #search-items>
        <search-form-item label="角色">
          <a-input v-model:value="queryParams.roleName" />
        </search-form-item>

        <search-form-item label="创建时间">
          <range-date
            @change="handleDateChange"
            ref="createTimeRef"
          ></range-date>
        </search-form-item>

        <search-form-item label="子系统">
          <a-select
            v-model:value="purposed"
            style="width: 100%"
            @change="purposeSelect"
          >
            <a-select-option v-for="item in selectList" :key="item.sysId">
              {{ item.sysName }}
            </a-select-option>
          </a-select>
        </search-form-item>
      </template>

      <template #operations>
        <action-buttons
          :hasSelected="selectedRowKeys.length > 0"
          :hasExport="false"
          @add="add"
          @delete="batchDelete"
        />
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
          row-key="roleId"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.dataIndex === 'remark'">
              <a-popover placement="topLeft">
                <template #content>
                  <div style="max-width: 200px">{{ text }}</div>
                </template>
                <p style="width: 200px;margin-bottom: 0">{{ text }}</p>
              </a-popover>
            </template>
            <template v-else-if="column.dataIndex === 'operation'">
              <setting-outlined
                v-hasPermission="'role:update'"
                class="icon-button"
                theme="twoTone"
                two-tone-color="#4a9ff5"
                @click="edit(record)"
                title="修改角色"
              />
              <eye-outlined
                class="icon-button"
                theme="twoTone"
                two-tone-color="#42b983"
                @click="view(record)"
                title="查看"
              />
            </template>
          </template>
        </a-table>
      </template>

      <template #dialogs>
        <!-- 角色信息查看 -->
        <role-info
          @close="handleRoleInfoClose"
          :roleInfoVisiable="roleInfo.visiable"
          :roleInfoData="roleInfo.data"
          :selectList="selectList"
        ></role-info>
        <!-- 新增角色 -->
        <role-add
          @close="handleRoleAddClose"
          @success="handleRoleAddSuccess"
          :roleAddVisiable="roleAdd.visiable"
          :selectList="selectList"
          :mainpageOptions="mainpageOptions"
        ></role-add>
        <!-- 修改角色 -->
        <role-edit
          ref="roleEditRef"
          :roleInfoData="roleInfo.data"
          @close="handleRoleEditClose"
          @success="handleRoleEditSuccess"
          :roleEditVisiable="roleEdit.visiable"
          :selectList="selectList"
          :mainpageOptions="mainpageOptions"
        ></role-edit>
      </template>
    </search-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { SettingOutlined, EyeOutlined } from '@ant-design/icons-vue'
import RangeDate from '@/components/datetime/RangeDate.vue'
import RoleInfo from './RoleInfo.vue'
import RoleAdd from './RoleAdd.vue'
import RoleEdit from './RoleEdit.vue'
import { useRequest, handleResponse } from '@/utils/request'
import { useUserStore } from '@/stores/user'
import SearchCard from '@/components/layout/SearchCard.vue'
import SearchFormItem from '@/components/form/SearchFormItem.vue'
import ActionButtons from '@/components/operation/ActionButtons.vue'

// 获取API请求方法
const { get, post, exportExcelFile } = useRequest()
// 获取用户存储
const userStore = useUserStore()

// 引用
const createTimeRef = ref(null)
const tableRef = ref(null)
const roleEditRef = ref(null)

// 状态数据
const purposed = ref('')
const selectList = ref([])
const advanced = ref(false)
const mainpageOptions = ref([])
const roleInfo = reactive({
  visiable: false,
  data: {}
})
const roleAdd = reactive({
  visiable: false
})
const roleEdit = reactive({
  visiable: false
})

// 查询参数
const queryParams = reactive({
  createTimeFrom: '',
  createTimeTo: '',
  sysId: ''
})

// 表格数据
const dataSource = ref([])
const sortedInfo = ref(null)
const paginationInfo = ref(null)
const selectedRowKeys = ref([])
const loading = ref(false)

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
  let { sortedInfo: sorterInfo } = reactive({ sortedInfo: sortedInfo.value })
  sorterInfo = sorterInfo || {}
  return [
    {
      title: '子系统',
      dataIndex: 'sysName'
    },
    {
      title: '角色',
      dataIndex: 'roleName',
      sorter: true
    },
    {
      title: '描述',
      dataIndex: 'remark'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      sorter: true
    },
    {
      title: '操作',
      dataIndex: 'operation'
    }
  ]
})

// 生命周期钩子
onMounted(() => {
  // 获取首页模板
  fetchMainpageOptions()
  // 获取子系统列表
  fetchSystems()
})

// 获取首页模板选项
const fetchMainpageOptions = async () => {
  try {
    const { data } = await post('auth/mainpage/selectAll', {})
    if (data.code == 200) {
      mainpageOptions.value = data.obj || []
    } else {
      console.error('获取首页模板失败', data)
    }
  } catch (error) {
    console.error('获取首页模板失败', error)
    message.error('获取首页模板失败')
  }
}

// 设置首页模板名称
const setMainpageName = (val) => {
  const node = mainpageOptions.value.find(n => n.id == val)
  if (node) return node.pageName
  return ''
}

// 获取子系统列表
const fetchSystems = async () => {
  try {
    // 获取当前用户ID
    const userId = userStore.user?.id || '';
    // 与Vue2项目保持一致的接口路径
    const { data } = await get(`/auth/sys/selectSysList?userId=${userId}`);

    if (handleResponse(data, null, '获取子系统列表失败')) {
      selectList.value = data.obj;
      queryParams.sysId = data.obj[0].sysId;
      purposed.value = data.obj[0].sysId;
      // 获取角色列表
      fetch({
        ...queryParams
      });
    }
  } catch (error) {
    console.error('获取子系统列表失败', error);
    message.error('获取子系统列表失败');
  }
}

// 子系统选择变化
const purposeSelect = (value) => {
  queryParams.sysId = value
}

// 日期范围变化
const handleDateChange = (value) => {
  if (value) {
    queryParams.createTimeFrom = value[0]
    queryParams.createTimeTo = value[1]
  }
}

// 表格选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys;
  console.log('选中的行:', keys);
}

// 查看角色详情
const view = (record) => {
  roleInfo.data = record
  roleInfo.visiable = true
}

// 添加角色
const add = () => {
  roleAdd.visiable = true
}

const handleRoleAddClose = () => {
  roleAdd.visiable = false
}

const handleRoleAddSuccess = () => {
  roleAdd.visiable = false
  message.success('新增角色成功')
  fetch()
}

// 编辑角色
const edit = (record) => {
  roleInfo.data = record
  roleEdit.visiable = true
}

const handleRoleEditClose = () => {
  roleEdit.visiable = false
}

const handleRoleEditSuccess = () => {
  roleEdit.visiable = false
  message.success('修改角色成功')
  fetch()
}

const handleRoleInfoClose = () => {
  roleInfo.visiable = false
}

// 批量删除
const batchDelete = () => {
  if (!selectedRowKeys.value.length) {
    message.warning('请选择需要删除的记录')
    return
  }

  Modal.confirm({
    title: '确定删除所选中的记录?',
    content: '当您点击确定按钮后，这些记录将会被彻底删除',
    centered: true,
    onOk() {
      // selectedRowKeys已经存储了roleId，直接使用
      const roleIds = selectedRowKeys.value.join(',')

      post('auth/role/del', {
        roleIds: roleIds
      }).then(({ data }) => {
        if (handleResponse(data, null, '删除失败')) {
          message.success('删除成功')
          selectedRowKeys.value = []
          fetch()
        }
      }).catch(error => {
        console.error('删除角色失败', error)
        message.error('删除失败')
      })
    },
    onCancel() {
      selectedRowKeys.value = []
    }
  })
}

// 导出Excel
const exportExcel = async () => {
  try {
    await exportExcelFile('role/excel', {
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
  fetch()
}

// 重置
const reset = () => {
  // 重置查询参数
  Object.keys(queryParams).forEach(key => {
    if (key !== 'sysId') {
      delete queryParams[key]
    }
  })

  // 重置选中值
  selectedRowKeys.value = []

  // 重置分页
  pagination.current = pagination.defaultCurrent

  // 重置日期
  createTimeRef.value.reset()

  // 重新查询
  fetch()
}

// 表格变化处理
const handleTableChange = (pag, filters, sorter) => {
  // 将这三个参数赋值给Vue data，用于后续使用
  paginationInfo.value = pag
  sortedInfo.value = sorter

  // 查询数据
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
    const { data } = await get('auth/role', params);
    if (handleResponse(data, null, '获取角色列表失败')) {
      const obj = data.obj;
      // 与Vue2项目保持一致的数据处理逻辑
      dataSource.value = obj.rows;
      pagination.total = obj.total;
    }
  } catch (error) {
    console.error('获取角色列表失败', error);
    message.error('获取角色列表失败');
  } finally {
    // 关闭loading
    loading.value = false;
  }
}
</script>

<style lang="less" scoped>
.role-management {
}

.icon-button {
  margin-right: 8px;
  cursor: pointer;
}
</style>
