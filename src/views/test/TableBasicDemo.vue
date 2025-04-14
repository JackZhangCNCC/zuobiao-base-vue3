<template>
  <div class="table-basic-demo">
    <!-- 使用zb-search-form组件 -->
    <zb-search-form
      :fields="searchFields"
      :initial-values="searchInitValues"
      @search="handleSearch"
      @reset="handleReset"
      :loading="searchLoading"
    />

    <!-- 基础表格示例 -->
    <zb-table
      :columns="columns"
      :dataSource="dataSource"
      :loading="loading"
      rowKey="id"
      :pagination="pagination"
      :showExport="false"
      :showMore="false"
      :showBatchDelete="false"
      :showAddButton="true"
      @add="handleAdd"
      @edit="handleEdit"
      @view="handleView"
      @update:pagination="handlePaginationChange"
    >
    </zb-table>

    <!-- 新增表单弹框 -->
    <zb-modal
      v-model:open="addModalVisible"
      title="新增产品"
      :isForm="true"
      :confirmLoading="submitLoading"
      @confirm="handleSubmitAdd"
    >
      <zb-form :model="formState" layout="vertical">
        <zb-form-item label="产品名称" required>
          <zb-input v-model:value="formState.name" placeholder="请输入" />
        </zb-form-item>
        <zb-form-item label="类型">
          <zb-radio-group v-model:value="formState.type">
            <zb-radio value="1">HO产品</zb-radio>
            <zb-radio value="2">IHO产品</zb-radio>
            <zb-radio value="3">自研产品</zb-radio>
          </zb-radio-group>
        </zb-form-item>
      </zb-form>
    </zb-modal>

    <!-- 查看详情弹框 -->
    <zb-modal
      v-model:open="viewModalVisible"
      title="查看详情"
      :footer="false"
      width="700"
    >
      <div v-if="currentRecord" class="view-detail">
        <div class="detail-item">
          <span class="label">姓名：</span>
          <span class="value">{{ currentRecord.name }}</span>
        </div>
        <div class="detail-item">
          <span class="label">年龄：</span>
          <span class="value">{{ currentRecord.age }}</span>
        </div>
        <div class="detail-item">
          <span class="label">状态：</span>
          <span class="value">
            <zb-tag :color="currentRecord.status == '1' ? 'success' : 'warning'">
              {{ currentRecord.status == '1' ? '正常' : '异常' }}
            </zb-tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="label">地址：</span>
          <span class="value">{{ currentRecord.address }}</span>
        </div>
      </div>
    </zb-modal>

    <!-- 确认弹框 -->
    <zb-modal
      v-model:open="confirmModalVisible"
      title="提示"
      :confirmLoading="submitLoading"
      @confirm="handleConfirmDelete"
      width="400"
    >
      <div class="confirm-content">
        是否确认删除该记录？
      </div>
    </zb-modal>

    <!-- 简易说明 -->
    <div class="demo-description">
      <h3>基本用法说明：</h3>
      <ol>
        <li>使用zb-search-form组件：配置<code>fields</code>属性定义搜索项</li>
        <li>定义列配置：<code>columns</code>数组(注意操作列的配置)</li>
        <li>提供数据源：<code>dataSource</code>数组</li>
        <li>设置行唯一标识：<code>rowKey</code>属性</li>
        <li>配置分页：<code>pagination</code>对象</li>
        <li>处理表格事件：<code>@edit</code>、<code>@view</code>等</li>
        <li>使用zb-modal组件：实现新增、查看、确认等弹框功能</li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h } from 'vue';
import { message } from 'ant-design-vue';

// 表格加载状态
const loading = ref(false);
// 搜索按钮加载状态
const searchLoading = ref(false);
// 提交按钮加载状态
const submitLoading = ref(false);

// 弹框显示状态
const addModalVisible = ref(false);
const viewModalVisible = ref(false);
const confirmModalVisible = ref(false);

// 当前选中记录
const currentRecord = ref(null);
const deleteId = ref(null);

// 表单状态
const formState = reactive({
  name: '',
  type: '1'
});

// 重置表单
const resetForm = () => {
  formState.name = '';
  formState.type = '1';
};

// 搜索字段配置
const searchFields = [
  {
    field: "keyword",
    label: "关键字",
    type: "input",
    placeholder: "请输入姓名/地址",
  },
  {
    field: "status",
    label: "状态",
    type: "select",
    options: [
      { label: "全部", value: "" },
      { label: "正常", value: "1" },
      { label: "异常", value: "0" },
    ],
  }
];

// 搜索表单初始值
const searchInitValues = reactive({
  keyword: "",
  status: ""
});

// 列配置
const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    width: 100
  },
  {
    title: '年龄',
    dataIndex: 'age',
    width: 80
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    tooltipFormatter: (text) => {
      return text == '1' ? '正常' : '异常';
    },
    customRender: ({ text }) => {
      return h('zb-tag', { 
        color: text == '1' ? 'success' : 'warning' 
      }, text == '1' ? '正常' : '异常');
    }
  },
  {
    title: '地址',
    dataIndex: 'address'
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    showTooltip: false,
    width: 180,
    dataIndex: 'action',
    customRender: ({ record }) => {
      return h('div', { class: 'action-buttons' }, [
        // 查看按钮
        h('a', { 
          onClick: () => handleView(record),
          class: 'operation-link check-action',
        }, '查看'),
        
        // 编辑按钮
        h('a', { 
          onClick: () => handleEdit(record),
          class: 'operation-link edit-action',
        }, '编辑'),
        
        // 删除按钮
        h('a', { 
          onClick: () => handleDelete(record),
          class: 'operation-link danger-text',
        }, '删除')
      ]);
    }
  }
];

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 5,
  total: 0,
  showTotal: (total) => `共 ${total} 条`
});

// 表格数据
const dataSource = ref([]);

// 获取表格数据
const fetchData = (params = {}) => {
  loading.value = true;
  
  // 模拟API请求延时
  setTimeout(() => {
    // 模拟数据
    const data = [
      { id: '1', name: '张三', age: 28, status: '1', address: '北京市朝阳区' },
      { id: '2', name: '李四', age: 32, status: '0', address: '上海市浦东新区' },
      { id: '3', name: '王五', age: 24, status: '1', address: '广州市天河区' },
      { id: '4', name: '赵六', age: 35, status: '0', address: '深圳市南山区' },
      { id: '5', name: '钱七', age: 29, status: '1', address: '杭州市西湖区' },
      { id: '6', name: '孙八', age: 26, status: '0', address: '武汉市洪山区' },
      { id: '7', name: '周九', age: 31, status: '1', address: '成都市武侯区' },
      { id: '8', name: '吴十', age: 33, status: '0', address: '重庆市渝中区' }
    ];
    
    // 关键字过滤
    let filteredData = [...data];
    if (params.keyword) {
      filteredData = filteredData.filter(item => 
        item.name.includes(params.keyword) || 
        item.address.includes(params.keyword)
      );
    }
    
    // 状态过滤
    if (params.status) {
      filteredData = filteredData.filter(item => item.status === params.status);
    }
    
    dataSource.value = filteredData;
    pagination.total = filteredData.length;
    loading.value = false;
    
    // 搜索完成后也要重置搜索按钮状态
    searchLoading.value = false;
  }, 500);
};

// 搜索处理
const handleSearch = (values) => {
  if (searchLoading.value) return; // 如果已经在搜索中，直接返回
  
  console.log('搜索参数:', values);
  searchLoading.value = true; // 设置搜索按钮为加载状态
  pagination.current = 1; // 重置到第一页
  fetchData(values);
};

// 重置搜索
const handleReset = () => {
  if (searchLoading.value) return; // 如果已经在搜索中，直接返回
  
  console.log('重置搜索');
  searchLoading.value = true; // 设置搜索按钮为加载状态
  pagination.current = 1; // 重置到第一页
  fetchData();
};

// 分页变化处理
const handlePaginationChange = (newPagination) => {
  pagination.current = newPagination.current;
  pagination.pageSize = newPagination.pageSize;
};

// 新增按钮点击
const handleAdd = () => {
  resetForm();
  addModalVisible.value = true;
};

// 提交新增
const handleSubmitAdd = () => {
  if (!formState.name) {
    message.error('请输入产品名称');
    return;
  }
  
  submitLoading.value = true;
  
  // 模拟API请求延时
  setTimeout(() => {
    submitLoading.value = false;
    addModalVisible.value = false;
    message.success('添加成功');
    fetchData(); // 重新加载数据
  }, 800);
};

// 编辑按钮点击
const handleEdit = (record) => {
  message.success(`编辑: ${record.name}`);
};

// 查看按钮点击
const handleView = (record) => {
  currentRecord.value = record;
  viewModalVisible.value = true;
};

// 删除按钮点击
const handleDelete = (record) => {
  deleteId.value = record.id;
  confirmModalVisible.value = true;
};

// 确认删除
const handleConfirmDelete = () => {
  submitLoading.value = true;
  
  // 模拟API请求延时
  setTimeout(() => {
    submitLoading.value = false;
    confirmModalVisible.value = false;
    message.success('删除成功');
    
    // 从数据源中移除
    dataSource.value = dataSource.value.filter(item => item.id !== deleteId.value);
    pagination.total = dataSource.value.length;
  }, 600);
};

// 组件挂载时获取数据
onMounted(() => {
  fetchData();
});
</script>

<style lang="less" scoped>
.table-basic-demo {
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
}

.demo-description {
  margin-top: 20px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 4px;
  
  h3 {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 500;
  }
  
  ol {
    padding-left: 20px;
    
    li {
      margin-bottom: 8px;
      line-height: 1.5;
    }
  }
  
  code {
    background-color: #f0f0f0;
    padding: 2px 6px;
    border-radius: 3px;
    color: #d56161;
    font-family: Consolas, Monaco, 'Andale Mono', monospace;
  }
}

.confirm-content {
  text-align: center;
  padding: 20px 0;
}

.view-detail {
  .detail-item {
    margin-bottom: 16px;
    display: flex;
    
    .label {
      width: 80px;
      color: #666;
      text-align: right;
      margin-right: 12px;
    }
    
    .value {
      flex: 1;
    }
  }
}
</style> 