<template>
  <div class="user-management">
    <!-- 搜索表单 -->
    <zb-search-form
      ref="searchFormRef"
      :fields="searchFields"
      :initial-values="queryParams"
      @search="search"
      @reset="reset"
      :loading="loading"
    />

    <!-- 表格组件 -->
    <zb-table
      :columns="columns"
      :dataSource="dataSource"
      :loading="loading"
      rowKey="id"
      :pagination="pagination"
      :rowSelection="{ 
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange,
        type: 'checkbox'
      }"
      :showBatchDelete="true"
      :moreOptions="moreOptions"
      :customDataInfo="selectedRowKeys.length > 0 ? `已选择 ${selectedRowKeys.length} 项` : ''"
      @add="add"
      @batch-delete="batchDelete"
      @refresh="fetch"
      @table-change="handleTableChange"
      @update:pagination="handlePaginationChange"
      @more-action="handleMoreAction"
    >
    </zb-table>

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
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, h } from 'vue'
import { message, Modal, Tag } from 'ant-design-vue'
import UserInfo from './UserInfo.vue'
import UserAdd from './UserAdd.vue'
import UserEdit from './UserEdit.vue'
import { useRequest, handleResponse } from '@/utils/request'
import { DownOutlined } from '@ant-design/icons-vue'

// 获取请求方法
const { get, post, export: exportExcelFile } = useRequest()

// 表单相关
const searchFormRef = ref(null)
const userEditRef = ref(null)

// 部门树相关
const deptSelectVisible = ref(false)
const multiDeptSelectVisible = ref(false) // 多选部门弹窗状态
const deptTreeData = ref([])
const selectedDeptKeys = ref([])
const selectedDeptName = ref('')
const selectedDeptId = ref('')

// 部门多选相关
const selectedMultiDeptKeys = ref([])
const selectedMultiDeptNames = ref('')

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
const dataSource = ref([])
const selectedRowKeys = ref([])
const loading = ref(false)
const defaultPassword = ref('') // 默认密码

// 更多功能选项
const moreOptions = [
  { label: '密码重置', value: 'reset-password' },
  { label: '导出Excel', value: 'export-excel' }
]

// 打开部门选择弹窗
const openDeptSelect = async () => {
  try {
    loading.value = true
    // 强制重新加载部门树数据
    await fetchDeptTree()
    console.log('打开弹窗前的数据:', deptTreeData.value)
    
    if (deptTreeData.value.length > 0) {
      // 数据加载成功，打开弹窗
      deptSelectVisible.value = true
    } else {
      message.warning('暂无部门数据')
    }
  } catch (error) {
    console.error('加载部门数据失败', error)
    message.error('加载部门数据失败')
  } finally {
    loading.value = false
  }
}

// 获取部门树数据
const fetchDeptTree = async () => {
  try {
    const { data } = await get('auth/dept/deptTree')
    console.log('部门树原始数据:', data)
    
    if (data && (data.code == 200 || data.status == 200)) {
      // 提取实际数据，适配不同的接口返回格式
      const responseData = data.obj || data.data || data;
      
      // 转换数据结构适配组件
      const transformTreeData = (treeNodes) => {
        if (!treeNodes || !Array.isArray(treeNodes)) return []
        
        return treeNodes.map(node => ({
          key: node.id,
          title: node.title || node.text || node.name,
          value: node.id,
          children: node.children ? transformTreeData(node.children) : undefined,
          personNum: node.personNum
        }))
      }
      
      // 处理不同结构的数据返回
      if (responseData && responseData.children && Array.isArray(responseData.children)) {
        deptTreeData.value = transformTreeData(responseData.children)
      } else if (Array.isArray(responseData)) {
        deptTreeData.value = transformTreeData(responseData)
      } else if (responseData) {
        deptTreeData.value = transformTreeData([responseData])
      } else {
        deptTreeData.value = []
      }
      
      console.log('转换后的部门树数据:', deptTreeData.value)
    } else {
      console.warn('接口返回数据格式不符合预期:', data)
      deptTreeData.value = []
    }
  } catch (error) {
    console.error('获取部门树失败', error)
    message.error('获取部门树失败')
    deptTreeData.value = []
  }
}

// 处理多选部门选择
const handleMultiDeptSelect = (keys, tags) => {
  if (keys && keys.length > 0) {
    selectedMultiDeptKeys.value = keys;
    selectedMultiDeptNames.value = tags.map(tag => tag.label).join(', ');
    queryParams.multiDeptIds = keys.join(',');
    
    // 刷新搜索表单
    if (searchFormRef.value) {
      searchFormRef.value.refreshForm?.();
    }
  } else {
    selectedMultiDeptKeys.value = [];
    selectedMultiDeptNames.value = '';
    queryParams.multiDeptIds = '';
  }
  
  // 关闭弹窗
  multiDeptSelectVisible.value = false;
  
  // 触发搜索
  search(queryParams);
}

// 处理部门选择
const handleDeptSelect = (keys, tags) => {
  if (keys && keys.length > 0 && tags && tags.length > 0) {
    selectedDeptKeys.value = [keys[0]] // 只保留第一个选择的部门
    selectedDeptId.value = keys[0]
    selectedDeptName.value = tags[0].label
    queryParams.stationsId = keys[0]
    
    // 刷新搜索表单
    if (searchFormRef.value) {
      searchFormRef.value.refreshForm?.();
    }
  } else {
    selectedDeptKeys.value = []
    selectedDeptId.value = ''
    selectedDeptName.value = ''
    queryParams.stationsId = ''
  }
  
  // 关闭弹窗
  deptSelectVisible.value = false
  
  // 直接触发搜索以更新界面
  search(queryParams);
}

// 处理部门变更事件（当使用表单控件模式时）
const handleDeptChange = (value, label) => {
  // 处理清除的情况
  if (value === undefined || value === null || value === '') {
    selectedDeptId.value = '';
    selectedDeptName.value = '';
    selectedDeptKeys.value = [];
    queryParams.stationsId = '';
  } else {
    selectedDeptId.value = value;
    selectedDeptName.value = label;
    selectedDeptKeys.value = [value];
    queryParams.stationsId = value;
  }
  
  // 触发搜索
  search(queryParams);
}

// 处理多选部门变更
const handleMultiDeptChange = (values, labels) => {
  selectedMultiDeptKeys.value = values;
  selectedMultiDeptNames.value = labels;
  queryParams.multiDeptIds = values ? values.join(',') : '';
  
  // 触发搜索
  search(queryParams);
}

// 搜索字段配置
const searchFields = [
  {
    field: "keyword",
    label: "关键词",
    type: "input",
    placeholder: "请输入用户名搜索"
  },
  {
    field: "stationsId",
    label: "部门",
    type: "custom", // 自定义类型
    render: () => {
      return {
        component: 'zb-tree-select-modal',
        props: {
          asFormControl: true,
          modelValue: selectedDeptId.value,
          displayText: selectedDeptName.value,
          placeholder: '请选择所属部门',
          data: deptTreeData.value,
          selectedValues: selectedDeptKeys.value,
          checkStrictly: true,
          open: deptSelectVisible.value,
          multiple: false,
          allowClear: true
        },
        on: {
          change: handleDeptChange,
          'update:modelValue': (val) => {
            selectedDeptId.value = val;
          },
          'update:open': (val) => {
            deptSelectVisible.value = val;
          }
        }
      }
    }
  },
  {
    field: "multiDeptIds",
    label: "多选部门",
    type: "custom", // 自定义类型
    render: () => {
      return {
        component: 'zb-tree-select-modal',
        props: {
          asFormControl: true,
          modelValue: selectedMultiDeptKeys.value,
          displayText: selectedMultiDeptNames.value,
          placeholder: '请选择多个部门',
          data: deptTreeData.value,
          selectedValues: selectedMultiDeptKeys.value,
          checkStrictly: true,
          open: multiDeptSelectVisible.value,
          multiple: true,
          allowClear: true
        },
        on: {
          change: handleMultiDeptChange,
          'update:modelValue': (val) => {
            selectedMultiDeptKeys.value = val;
          },
          'update:open': (val) => {
            multiDeptSelectVisible.value = val;
          }
        }
      }
    }
  },
  {
    field: "dateRange",
    label: "创建时间",
    type: "dateRange",
    format: "YYYY-MM-DD"
  }
]

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  pageSizeOptions: ['10', '20', '30', '40', '100'],
  showTotal: (total) => `共 ${total} 条`
})

// 表格列配置
const columns = [
  {
    title: '用户名',
    dataIndex: 'loginName',
    ellipsis: true,
    align: 'center'
  },
  {
    title: '姓名',
    dataIndex: 'userName',
    ellipsis: true,
    align: 'center'
  },
  {
    title: '性别',
    dataIndex: 'sex',
    ellipsis: true,
    align: 'center',
    customRender: ({ text }) => {
      if (text == 1) return '男';
      if (text == 2) return '女';
      if (text == 3) return '保密';
      return text;
    }
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    ellipsis: true,
    align: 'center',
    width: 150
  },
  {
    title: '部门',
    dataIndex: 'stationsName',
    ellipsis: true,
    align: 'center'
  },
  {
    title: '电话',
    dataIndex: 'userPhone',
    ellipsis: true,
    align: 'center'
  },
  {
    title: '状态',
    dataIndex: 'userStatus',
    ellipsis: true,
    align: 'center',
    valueMap: {
      '1': '有效',
      '0': '锁定'
    },
    customRender: ({ text }) => {
      return h('a-tag', { 
        color: text == '1' ? 'cyan' : 'red' 
      }, text == '1' ? '有效' : '锁定');
    }
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    ellipsis: true,
    align: 'center'
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    showTooltip: false,
    width: 180,
    customRender: ({ record }) => {
      return h('div', { class: 'action-buttons' }, [
        // 查看按钮
        h('a', { 
          onClick: () => view(record),
          class: 'operation-link',
          directives: [
            {
              name: 'hasPermission',
              value: 'user:view'
            }
          ]
        }, '查看'),
        
        // 编辑按钮
        h('a', { 
          onClick: () => edit(record),
          class: 'operation-link',
          directives: [
            {
              name: 'hasPermission',
              value: 'user:update'
            }
          ]
        }, '编辑'),
        
        // 删除按钮
        h('a', { 
          onClick: () => confirmDelete(record),
          class: 'operation-link danger-texts',
        }, '删除')
      ]);
    }
  }
];

// 生命周期钩子
onMounted(() => {
  // 初始化查询参数中的日期值
  initializeInitialValues()
  
  fetch()
  getDefaultPassword()
  fetchDeptTree()
})

// 获取初始密码
const getDefaultPassword = () => {
  get('auth/user/defaultPassword').then(r => {
    defaultPassword.value = r.data.obj
  })
}

// 表格选择变化
const onSelectChange = (keys, rows) => {
  selectedRowKeys.value = keys;
  console.log('选中的行:', keys);
}

// 表格变化处理
const handleTableChange = ({ pagination: newPagination, filters, sorter }) => {
  fetch({
    pageNum: newPagination.current,
    pageSize: newPagination.pageSize,
    ...filters,
    sortField: sorter.field,
    sortOrder: sorter.order
  })
}

// 分页变化处理
const handlePaginationChange = (newPagination) => {
  pagination.current = newPagination.current
  pagination.pageSize = newPagination.pageSize
  fetch()
}

// 处理更多操作
const handleMoreAction = (action) => {
  if (action === 'reset-password') {
    resetPassword()
  } else if (action === 'export-excel') {
    exportExcel()
  }
}

// 查询处理
const search = (values) => {
  // 重置到第一页
  pagination.current = 1
  
  // 更新查询参数
  Object.assign(queryParams, values)
  
  // 处理日期范围
  if (values.dateRange && values.dateRange.length === 2) {
    queryParams.createTimeFrom = formatDate(values.dateRange[0])
    queryParams.createTimeTo = formatDate(values.dateRange[1])
    delete queryParams.dateRange
  }
  
  fetch()
}

// 日期格式化函数
const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  
  try {
    // 处理 Date 对象
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // 处理 Moment/Dayjs 对象 (有 format 方法)
    if (date && typeof date.format === 'function') {
      return date.format(format);
    }
    
    // 如果已经是标准格式，直接返回
    if (typeof date === 'string') {
      if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
        return date;
      }
      // 尝试转换其他字符串格式
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    
    // 处理时间戳
    if (typeof date === 'number') {
      const parsedDate = new Date(date);
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const day = String(parsedDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    console.warn('无法识别的日期格式:', date);
    return '';
  } catch (error) {
    console.error('日期格式化错误:', error);
    return '';
  }
}

// 初始化查询参数时处理日期
const initializeInitialValues = () => {
  // 检查是否有日期初始值需要处理
  if (queryParams.createTimeFrom && queryParams.createTimeTo) {
    // 将日期范围转换回合适的格式
    const startDate = formatDate(queryParams.createTimeFrom);
    const endDate = formatDate(queryParams.createTimeTo);
    
    if (startDate && endDate) {
      // 更新日期范围控件的值
      queryParams.dateRange = [startDate, endDate];
    }
  }
}

// 重置处理
const reset = () => {
  // 重置表单
  if (searchFormRef.value) {
    searchFormRef.value.resetForm?.();
  }
  
  // 清空选中状态
  selectedRowKeys.value = []
  
  // 清空部门选择
  selectedDeptId.value = ''
  selectedDeptName.value = ''
  selectedDeptKeys.value = []
  
  // 清空多选部门
  selectedMultiDeptKeys.value = []
  selectedMultiDeptNames.value = ''
  
  // 重置查询参数
  Object.keys(queryParams).forEach(key => {
    delete queryParams[key]
  })
  
  // 重新获取数据
  pagination.current = 1 // 重置到第一页
  fetch()
}

// 获取数据
const fetch = async (params = {}) => {
  loading.value = true
  
  try {
    // 处理分页和查询参数
    const requestParams = {
      pageNum: pagination.current,
      pageSize: pagination.pageSize,
      ...params,
      ...queryParams
    }
    
    // 标准化日期参数
    if (requestParams.createTimeFrom) {
      requestParams.createTimeFrom = formatDate(requestParams.createTimeFrom);
    }
    if (requestParams.createTimeTo) {
      requestParams.createTimeTo = formatDate(requestParams.createTimeTo);
    }
    
    const { data } = await get('auth/user', requestParams)
    
    if (handleResponse(data, null, '获取用户列表失败')) {
      const obj = data.obj
      dataSource.value = obj.rows
      pagination.total = obj.total
    }
  } catch (error) {
    console.error('获取用户列表失败', error)
    message.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
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

// 编辑用户
const edit = (record) => {
  userEditRef.value.setFormValues(record)
  userEdit.visiable = true
}

// 确认删除单个用户
const confirmDelete = (record) => {
  Modal.confirm({
    title: '确定删除该用户?',
    content: '删除后将无法恢复',
    okText: '确定',
    cancelText: '取消',
    onOk: () => handleDelete([record.id])
  })
}

// 删除处理
const handleDelete = async (userIds) => {
  try {
    const { data } = await post('auth/user/del', {
      userIds: userIds.join(',')
    })

    if (handleResponse(data, null, '删除失败')) {
      message.success('删除成功')
      // 清空选中状态
      selectedRowKeys.value = []
      fetch()
    }
  } catch (error) {
    console.error('删除用户错误:', error)
    message.error('删除失败')
  }
}

// 批量删除
const batchDelete = (selectedKeys, selectedRows) => {
  if (!selectedKeys.length) {
    message.warning('请选择需要删除的记录')
    return
  }

  Modal.confirm({
    title: '确定删除所选中的记录?',
    content: '当您点击确定按钮后，这些记录将会被彻底删除，不可恢复。',
    okText: '确定',
    cancelText: '取消',
    onOk: () => handleDelete(selectedKeys)
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
    const userRecord = dataSource.value.find(item => item.id === key)
    return userRecord ? userRecord.loginName : null
  }).filter(Boolean)

  if (selectedLoginNames.length === 0) {
    message.warning('无法获取选中用户的登录名')
    return
  }

  Modal.confirm({
    title: '确定重置选中用户密码?',
    content: `当您点击确定按钮后，这些用户的密码将会重置为${defaultPassword.value}`,
    okText: '确定',
    cancelText: '取消',
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
    }
  })
}

// 导出Excel
const exportExcel = async () => {
  try {
    // 创建导出参数对象，并标准化日期
    const exportParams = { ...queryParams };
    
    if (exportParams.createTimeFrom) {
      exportParams.createTimeFrom = formatDate(exportParams.createTimeFrom);
    }
    if (exportParams.createTimeTo) {
      exportParams.createTimeTo = formatDate(exportParams.createTimeTo);
    }
    
    await exportExcelFile('user/excel', exportParams)
    message.success('导出成功')
  } catch (error) {
    console.error('导出Excel失败', error)
    message.error('导出失败')
  }
}

// 组件回调处理
const handleUserInfoClose = () => {
  userInfo.visiable = false
}

const handleUserAddClose = () => {
  userAdd.visiable = false
}

const handleUserAddSuccess = () => {
  userAdd.visiable = false
  message.success(`新增用户成功，初始密码为${defaultPassword.value}`)
  fetch()
}

const handleUserEditClose = () => {
  userEdit.visiable = false
}

const handleUserEditSuccess = () => {
  userEdit.visiable = false
  message.success('修改用户成功')
  fetch()
}
</script>

