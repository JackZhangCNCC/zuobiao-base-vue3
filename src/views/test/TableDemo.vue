<template>
  <div class="table-demo-container">
    <!-- <h1 class="page-title">列表组件示例</h1> -->

    <!-- 搜索表单 -->
    <zb-search-form
      :fields="searchFields"
      :initial-values="searchInitValues"
      @search="handleSearch"
      @reset="handleReset"
      :loading="searchLoading"
    />

    <!-- 表格组件 -->
    <zb-table
      :columns="columns"
      :dataSource="tableData"
      :loading="loading"
      :addLoading="addButtonLoading"
      :exportLoading="exportButtonLoading"
      rowKey="id"
      :pagination="pagination"
      :rowSelection="{ type: 'checkbox' }"
      :addOptions="addOptions"
      :moreOptions="moreOptions"
      :customDataInfo="'已合作供应商350家'"
      @add="handleAdd"
      @edit="handleEdit"
      @delete="handleDelete"
      @batch-delete="handleBatchDelete"
      @view="handleView"
      @export="handleExport"
      @refresh="fetchData"
      @table-change="handleTableChange"
      @update:pagination="handlePaginationChange"
      @column-change="handleColumnChange"
      @more-action="handleMoreAction"
      @item-action="handleItemAction"
    >
      <!-- 自定义状态列 -->
      <template #status="{ text, record }">
        <a-tag :color="text == '1' ? 'success' : 'default'">
          {{ text == '1' ? "启用" : "停用" }}
        </a-tag>
      </template>
    </zb-table>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h } from "vue";
import { message, Modal, Dropdown, Menu } from "ant-design-vue";

// 搜索字段配置
const searchFields = [
  {
    field: "keyword",
    label: "关键字",
    type: "input",
    placeholder: "请输入标题/内容",
  },
  {
    field: "status",
    label: "状态",
    type: "select",
    options: [
      { label: "全部", value: "" },
      { label: "启用", value: "1" },
      { label: "停用", value: "0" },
    ],
  },
  {
    field: "dateRange",
    label: "创建日期",
    type: "dateRange",
    format: "YYYY-MM-DD",
  },
  {
    field: "type",
    label: "类型",
    type: "select",
    options: [
      { label: "全部", value: "" },
      { label: "类型一", value: "1" },
      { label: "类型二", value: "2" },
      { label: "类型三", value: "3" },
    ],
  },
  {
    field: "category",
    label: "分类",
    type: "select",
    options: [
      { label: "全部", value: "" },
      { label: "分类A", value: "A" },
      { label: "分类B", value: "B" },
      { label: "分类C", value: "C" },
    ],
  },
];

// 搜索表单初始值
const searchInitValues = reactive({
  keyword: "",
  status: "",
  dateRange: [],
  type: "",
  category: "",
});

// 表格列配置
const columns = [
  {
    title: "序号",
    dataIndex: "index",
    width: 64,
    align: "center",
    customRender: ({ index }) => index + 1,
  },
  {
    title: "标题",
    dataIndex: "title",
    ellipsis: true,
    align: "center",
  },
  {
    title: "内容",
    dataIndex: "content",
    ellipsis: true,
    align: "center",
  },
  {
    title: "金额",
    dataIndex: "amount",
    ellipsis: true,
    align: "center",
    sorter: true,
    tooltipFormatter: (text) => `¥${text}`
  },
  {
    title: "日期",
    dataIndex: "createTime",
    ellipsis: true,
    align: "center",
  },
  {
    title: "状态",
    dataIndex: "status",
    ellipsis: true,
    align: "center",
    valueMap: {
      '1': '启用',
      '0': '停用'
    },
    customRender: ({ text }) => {
      // console.log('状态值:', text, '类型:', typeof text);
      return h('a-tag', { 
        color: text === '1' ? 'success' : 'default' 
      }, text === '1' ? "启用" : "停用");
    }
  },
  {
    title: "审批状态",
    dataIndex: "approvalStatus",
    ellipsis: true,
    align: "center",
    customRender: ({ text }) => {
      // 审批状态配置
      const config = {
        '审批中': { text: '审批中', bgColor: '#fff7e6', textColor: '#fa8c16' },
        '已通过': { text: '已通过', bgColor: '#f6ffed', textColor: '#52c41a' },
        '已驳回': { text: '已驳回', bgColor: '#fff1f0', textColor: '#f5222d' }
      };
      
      const item = config[text] || { text, bgColor: '#f1f3f8', textColor: '#666' };
      
      return h('span', {
        class: 'zb-badge-text',
        style: {
          display: 'inline-block',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '13px',
          lineHeight: '18px',
          backgroundColor: item.bgColor,
          color: item.textColor
        }
      }, item.text);
    }
  },
  {
    title: "处理进度",
    dataIndex: "processStatus",
    ellipsis: true,
    align: "center",
    showTooltip: true,
    customRender: ({ text }) => {
      // 处理进度配置
      const config = {
        '处理中': { text: '处理中', color: '#1890ff' },
        '已完成': { text: '已完成', color: '#52c41a' },
        '错误': { text: '错误', color: '#f5222d' },
        '警告': { text: '警告', color: '#faad14' }
      };
      
      const item = config[text] || { text, color: '#666' };
      
      return h('span', { 
        class: 'zb-dot-text',
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }
      }, [
        h('span', {
          class: 'zb-dot',
          style: {
            display: 'inline-block',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            marginRight: '6px',
            backgroundColor: item.color
          }
        }),
        h('span', {}, item.text)
      ]);
    }
  },
  {
    title: "操作",
    key: "action",
    fixed: "right",
    showTooltip: false,
    width: 180,
    customRender: ({ record }) => {
      if (record.id == '3') {
        return h('div', { class: 'action-buttons' }, [
            // 普通查看按钮
            h('a', { 
              onClick: () => handleView(record),
              class: 'operation-link check-action',
            }, '呵呵'),
            
            // 更多按钮
            h(Dropdown, {
              trigger: ['click'],
              overlayClassName: 'action-dropdown'
            }, {
              default: () => h('a', { 
                class: 'operation-link more-action',
              }, '...'),
              overlay: () => h(Menu, {
                onClick: ({ key }) => handleMoreAction(key, record)
              }, {
                default: () => [
                  h(Menu.Item, { key: 'action1' }, () => '操作666'),
                ]
              })
            })
          ]);
      } else {
        // demo中第一行使用带下拉的查看按钮
        if (record.id == '1') {
          return h('div', { class: 'action-buttons' }, [
            // 带下拉的查看按钮
            h(Dropdown, {
              trigger: ['click'],
              overlayClassName: 'action-dropdown'
            }, {
              default: () => h('a', { 
                class: 'operation-link check-action check-action-dropdown',
              }, [
                h('span', {}, '查看 '),
                h('span', { class: 'dropdown-arrow' }, '▼')
              ]),
              overlay: () => h(Menu, {
                onClick: ({ key }) => handleDetailAction(key, record)
              }, {
                default: () => [
                  h(Menu.Item, { key: 'detail1' }, () => '某详情1'),
                  h(Menu.Item, { key: 'detail2' }, () => '某详情2'),
                  h(Menu.Item, { key: 'detail3' }, () => '某详情3'),
                  h(Menu.Item, { key: 'detail4' }, () => '某详情4')
                ]
              })
            }),
            
            // 编辑按钮
            h('a', { 
              onClick: () => handleEdit(record),
              class: 'operation-link edit-action',
            }, '编辑'),
            
            // 删除按钮
            h('a', { 
              onClick: (e) => {
                e.preventDefault();
                Modal.confirm({
                  title: '确定删除此记录?',
                  content: '删除后将无法恢复',
                  okText: '确定',
                  cancelText: '取消',
                  onOk: () => handleDelete(record)
                });
              },
              class: 'operation-link danger-text',
            }, '删除'),
            
            // 更多按钮
            h(Dropdown, {
              trigger: ['click'],
              overlayClassName: 'action-dropdown'
            }, {
              default: () => h('a', { 
                class: 'operation-link more-action',
              }, '...'),
              overlay: () => h(Menu, {
                onClick: ({ key }) => handleMoreAction(key, record)
              }, {
                default: () => [
                  h(Menu.Item, { key: 'action1' }, () => '操作1'),
                  h(Menu.Item, { key: 'action2' }, () => '操作2'),
                  h(Menu.Item, { key: 'action3' }, () => '操作3'),
                  h(Menu.Item, { key: 'action4' }, () => '操作4')
                ]
              })
            })
          ]);
        } else {
          return h('div', { class: 'action-buttons' }, [
            // 普通查看按钮
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
              onClick: (e) => {
                e.preventDefault();
                Modal.confirm({
                  title: '确定删除此记录?',
                  content: '删除后将无法恢复',
                  okText: '确定',
                  cancelText: '取消',
                  onOk: () => handleDelete(record)
                });
              },
              class: 'operation-link danger-text',
            }, '删除'),
            
            // 更多按钮
            h(Dropdown, {
              trigger: ['click'],
              overlayClassName: 'action-dropdown'
            }, {
              default: () => h('a', { 
                class: 'operation-link more-action',
              }, '...'),
              overlay: () => h(Menu, {
                onClick: ({ key }) => handleMoreAction(key, record)
              }, {
                default: () => [
                  h(Menu.Item, { key: 'action1' }, () => '操作1'),
                  h(Menu.Item, { key: 'action2' }, () => '操作2'),
                  h(Menu.Item, { key: 'action3' }, () => '操作3'),
                  h(Menu.Item, { key: 'action4' }, () => '操作4')
                ]
              })
            })
          ]);
        }
      }
    }
  }
];

// 表格数据
const tableData = ref([]);
const loading = ref(false);
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
});

// 新增选项配置
const addOptions = [
  { label: '新增菜单', value: 'menu' },
  { label: '新增按钮', value: 'button' }
]

// 更多功能选项
const moreOptions = [
  { label: '批量启用', value: 'enable' },
  { label: '批量停用', value: 'disable' },
  { label: '批量导出', value: 'export' }
]

// 按钮加载状态
const addButtonLoading = ref(false);
const exportButtonLoading = ref(false);
const searchLoading = ref(false); // 搜索按钮加载状态

// 模拟数据加载
const fetchData = async (params = {}) => {
  loading.value = true;
  try {
    // 模拟API请求延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 生成模拟数据
    const data = [];
    const total = 100;
    const { current, pageSize } = pagination;
    const startIndex = (current - 1) * pageSize;

    // 审批状态选项
    const approvalStatusOptions = ['pending', 'approved', 'rejected'];
    
    // 处理进度选项
    const processStatusOptions = ['processing', 'success', 'error', 'warning'];

    for (let i = 0; i < pageSize; i++) {
      const index = startIndex + i;
      if (index < total) {
        // 根据索引生成不同的审批状态和处理进度
        const approvalType = index % 3;
        const processType = index % 4;
        
        // 审批状态中文映射
        const approvalStatusMap = {
          0: '审批中',  // pending
          1: '已通过',  // approved
          2: '已驳回'   // rejected
        };
        
        // 处理进度中文映射
        const processStatusMap = {
          0: '处理中',  // processing
          1: '已完成',  // success
          2: '错误',    // error
          3: '警告'     // warning
        };
        
        data.push({
          id: `${index + 1}`,
          title: `标题 ${index + 1}`,
          content: `这是内容描述，模拟一段较长的文本内容，用于测试表格的显示效果和排版情况 ${
            index + 1
          }`,
          amount: (Math.random() * 10000).toFixed(2),
          createTime: `2025-01-${String((index % 28) + 1).padStart(2, "0")}`,
          status: index % 2 === 0 ? "1" : "0",
          type: `${(index % 3) + 1}`,
          category: ["A", "B", "C"][index % 3],
          approvalStatus: approvalStatusMap[approvalType],
          processStatus: processStatusMap[processType]
        });
      }
    }

    tableData.value = data;
    pagination.total = total;
  } catch (error) {
    console.error("获取数据失败", error);
    message.error("获取数据失败");
  } finally {
    loading.value = false;
  }
};

// 事件处理方法
const handleSearch = (params) => {
  if (searchLoading.value) return; // 如果已经在搜索中，直接返回
  
  console.log("搜索参数:", params);
  searchLoading.value = true; // 设置搜索按钮为加载状态
  pagination.current = 1; // 重置到第一页
  
  // 模拟搜索延迟
  setTimeout(() => {
    fetchData(params);
    
    // 搜索完成后，延迟一段时间再恢复按钮，避免频繁点击
    setTimeout(() => {
      searchLoading.value = false;
    }, 300);
  }, 300);
};

// 重置搜索
const handleReset = () => {
  if (searchLoading.value) return; // 如果已经在搜索中，直接返回
  
  console.log("重置搜索");
  searchLoading.value = true; // 设置搜索按钮为加载状态
  pagination.current = 1; // 重置到第一页
  
  // 模拟重置延迟
  setTimeout(() => {
    fetchData();
    
    // 重置完成后，延迟一段时间再恢复按钮
    setTimeout(() => {
      searchLoading.value = false;
    }, 300);
  }, 300);
};

// 表格变化
const handleTableChange = ({ pagination: newPagination, filters, sorter }) => {
  // 处理排序和筛选
  console.log("表格变化:", { newPagination, filters, sorter });

  // 更新分页信息
  pagination.current = newPagination.current;
  pagination.pageSize = newPagination.pageSize;

  // 重新获取数据
  fetchData({
    // 可以将筛选和排序参数传递给后端
    sorter: sorter.order
      ? { field: sorter.field, order: sorter.order }
      : undefined,
  });
};

// 分页变化
const handlePaginationChange = (newPagination) => {
  pagination.current = newPagination.current;
  pagination.pageSize = newPagination.pageSize;
  fetchData();
};

// 新增按钮点击
const handleAdd = (type) => {
  console.log("🚀 ~ handleAdd ~ type:", type)
  
  // 设置加载状态
  addButtonLoading.value = true;
  
  // 模拟异步操作
  setTimeout(() => {
    addButtonLoading.value = false;
    if (type) {
      message.success(`新增${type === 'menu' ? '菜单' : '按钮'}`);
    } else {
      message.success('点击了新增按钮');
    }
  }, 1000);
};

// 编辑按钮点击
const handleEdit = (record) => {
  message.success(`编辑记录: ${record.id}`);
};

// 删除按钮点击
const handleDelete = (record) => {
  message.success(`删除记录: ${record.id}`);
  fetchData();
};

// 批量删除按钮点击
const handleBatchDelete = (selectedKeys, selectedRows) => {
  message.success(`批量删除记录: ${selectedKeys.join(",")}`);
  fetchData();
};

// 查看按钮点击
const handleView = (record) => {
  message.success(`查看记录: ${record.id}`);
};

// 列显示变化
const handleColumnChange = (columns) => {
  console.log('列显示变化:', columns);
};

// 详情操作
const handleDetailAction = (key, record) => {
  message.success(`执行详情操作: ${key}, 记录ID: ${record.id}`);
};

// 更多操作
const handleMoreAction = (key, record) => {
  if (record) {
    // 行操作中的更多操作
    message.success(`执行行操作: ${key}, 记录ID: ${record.id}`);
  } else {
    // 工具栏中的更多操作
    console.log('点击了工具栏更多功能:', key);
    message.success(`执行工具栏操作: ${key}`);
  }
};

// 行操作
const handleItemAction = (key, record) => {
  console.log('点击了行操作:', key, record);
  message.success(`对记录 ${record.id} 执行操作: ${key}`);
};

// 导出按钮点击
const handleExport = ({ type, selectedRows }) => {
  // 设置加载状态
  exportButtonLoading.value = true;
  
  // 模拟异步操作
  setTimeout(() => {
    exportButtonLoading.value = false;
    
    if (type === 'selected') {
      message.success(`导出选中的 ${selectedRows.length} 条数据`);
    } else {
      message.success('导出全部数据');
    }
  }, 1000);
};

// 页面加载时获取数据
onMounted(() => {
  fetchData();
});
</script>

<style lang="less" scoped>
.table-demo-container {
  background: #f1f3f8;
  padding: 0;

  .page-title {
    font-size: 20px;
    font-weight: 500;
    color: #333;
  }

  .danger-text {
    color: #ff4d4f;
  }
  
  .action-buttons {
    white-space: nowrap;
  }
}
</style>
