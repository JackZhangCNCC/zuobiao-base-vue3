<template>
  <div class="menu-management">
    <!-- 搜索表单 - 按照TableDemo的方式使用 -->
    <zb-search-form
      ref="searchFormRef"
      :fields="searchFields"
      :initial-values="queryParams"
      @search="handleQuery"
      @reset="resetQuery"
      :loading="loading"
    />

    <!-- 表格 - 与TableDemo保持一致的用法 -->
    <zb-table
      :loading="loading"
      :columns="columns"
      :dataSource="menuList"
      :rowSelection="{ type: 'checkbox' }"
      rowKey="id"
      size="middle"
      bordered
      :expandable="{
        defaultExpandAllRows: true,
        indentSize: 20
      }"
      :childrenColumnName="'children'"
      @add="handleAdd"
      @refresh="getList"
      @batch-delete="handleBatchDelete"
      @export="exportExcel"
    >
    </zb-table>

    <!-- 保留原有的抽屉组件和弹框 -->
    <MenuAdd ref="menuAddRef" @close="handleMenuAddClose" @success="handleMenuAddSuccess" />
    <MenuEdit ref="menuEditRef" @close="handleMenuEditClose" @success="handleMenuEditSuccess" />
    <ButtonAdd ref="buttonAddRef" @close="handleButtonAddClose" @success="handleButtonAddSuccess" />
    <ButtonEdit ref="buttonEditRef" @close="handleButtonEditClose" @success="handleButtonEditSuccess" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h } from 'vue';
import {
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue';
// 导入所有Ant Design图标
import * as AntIcons from '@ant-design/icons-vue';
import { message, Modal, Tag } from 'ant-design-vue';
import { useRequest, handleResponse } from '@/utils/request';
import { useUserStore } from '@/stores/user';
import MenuAdd from './MenuAdd.vue';
import MenuEdit from './MenuEdit.vue';
import ButtonAdd from './ButtonAdd.vue';
import ButtonEdit from './ButtonEdit.vue';
import { format } from 'date-fns';
// 引入zb-drawer组件
import ZbDrawer from '@/components/zb-ui/zb-drawer.vue';

// 获取请求方法
const { get, post, export: exportExcelFile } = useRequest();
// 获取用户存储
const userStore = useUserStore();

// 引用组件实例
const menuAddRef = ref(null);
const menuEditRef = ref(null);
const buttonAddRef = ref(null);
const buttonEditRef = ref(null);
const searchFormRef = ref(null);

// 状态管理
const loading = ref(false);
const menuList = ref([]);

// 查询参数
const queryParams = reactive({
  menuName: '',
  sysId: undefined,
  dateRange: []
});

// 搜索表单配置
const searchFields = [
  {
    field: 'dateRange',
    label: '创建时间',
    type: 'dateRange'
  },
  {
    field: 'sysId',
    label: '子系统',
    type: 'select',
    options: [], // 将从后端获取
    placeholder: '请选择子系统'
  }
];

// 表格列配置
const columns = [
  {
    title: '菜单名称',
    dataIndex: 'name',
    width: '15%',
    customRender: ({ text, record }) => {
      const prefix = record.type === 'M' ? '📁 ' : 
                     record.type === 'C' ? '📄 ' : 
                     record.type === 'F' ? '🔘 ' : '';
      return h('span', {
        style: {
          fontWeight: record.type === 'M' ? 'bold' : 'normal'
        }
      }, prefix + text);
    }
  },
  {
    title: '图标',
    dataIndex: 'icon',
    width: '5%',
    customRender: ({ text, record }) => {
      if (!record.icon) return null;
      const iconComp = getIconComponent(record.icon);
      return h(iconComp);
    }
  },
  {
    title: '排序',
    dataIndex: 'orderNum',
    width: '8%'
  },
  {
    title: '权限标识',
    dataIndex: 'perms',
    width: '15%'
  },
  {
    title: '路径',
    dataIndex: 'path',
    width: '10%'
  },
  {
    title: '组件',
    dataIndex: 'component',
    width: '10%'
  },
  {
    title: '类型',
    dataIndex: 'type',
    width: '8%',
    customRender: ({ text }) => {
      const typeColors = {
        M: 'blue',
        C: 'cyan',
        F: 'purple'
      };
      const typeTexts = {
        M: '菜单',
        C: '组件',
        F: '按钮'
      };
      return h(Tag, { color: typeColors[text] || 'default' }, () => typeTexts[text] || '未知');
    }
  },
  {
    title: '可见',
    dataIndex: 'visible',
    width: '8%',
    customRender: ({ record }) => {
      return h(Tag, { 
        color: record.hidden == '0' || record.hidden === false ? '#87d068' : '#f50' 
      }, () => record.hidden == '0' || record.hidden === false ? '显示' : '隐藏');
    }
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '15%',
    fixed: 'right',
    customRender: ({ record }) => {
      const children = [];
      
      if (record.type !== 'F') {
        children.push(h('a', { 
          onClick: () => handleAddChild(record),
          style: 'cursor: pointer; margin-right: 8px;' 
        }, '新增子菜单'));
        
        children.push(h('a', { 
          onClick: () => handleAddButton(record),
          style: 'cursor: pointer; margin-right: 8px;' 
        }, '新增按钮'));
      }
      
      children.push(h('a', { 
        onClick: () => handleEdit(record),
        style: 'cursor: pointer; margin-right: 8px;' 
      }, '编辑'));
      
      children.push(h('a', { 
        onClick: () => confirmDelete(record),
        class: 'danger-text',
        style: 'cursor: pointer;' 
      }, '删除'));
      
      return h('div', { class: 'operation-buttons' }, children);
    }
  }
];

// 获取子系统列表
const getSubsystemList = async () => {
  try {
    // 获取当前用户ID
    const userId = userStore.user?.id || '';
    const { data } = await get(`/auth/sys/selectSysList?userId=${userId}`)
    if (handleResponse(data, null, '获取子系统列表失败')) {
      // 转换为下拉选项格式
      searchFields[1].options = data.obj.map(item => ({
        label: item.sysName,
        value: item.sysId
      }));

      // 设置默认系统ID
      if (data.obj.length > 0) {
        queryParams.sysId = data.obj[0].sysId;
        // 获取菜单列表
        getList();
      }
    }
  } catch (error) {
    console.error('获取子系统列表失败', error);
  }
}

// 查询菜单列表
const getList = async () => {
  loading.value = true;
  try {
    console.log('开始加载菜单列表, 参数:', queryParams);
    // 创建最终的请求参数对象
    const requestParams = {};

    // 处理日期范围参数
    if (queryParams.dateRange && Array.isArray(queryParams.dateRange) && queryParams.dateRange.length === 2) {
      try {
        // 获取日期对象，但不使用instanceof，因为响应式对象会干扰该判断
        const startDate = queryParams.dateRange[0];
        const endDate = queryParams.dateRange[1];
        
        // 尝试直接转换为时间戳判断有效性
        const startTime = startDate && startDate.getTime ? startDate.getTime() : (new Date(startDate)).getTime();
        const endTime = endDate && endDate.getTime ? endDate.getTime() : (new Date(endDate)).getTime();
        
        if (!isNaN(startTime) && !isNaN(endTime)) {
          // 使用时间戳创建新的日期对象，避开响应式问题
          requestParams.createTimeFrom = format(new Date(startTime), 'yyyy-MM-dd');
          requestParams.createTimeTo = format(new Date(endTime), 'yyyy-MM-dd');
          console.log('日期格式化成功', requestParams.createTimeFrom, requestParams.createTimeTo);
        } else {
          console.warn('日期格式化失败: 无效日期', startDate, endDate);
        }
      } catch (error) {
        console.error('日期格式化失败:', error);
        // 出错时不添加日期参数
      }
    }

    // 仅添加有值的参数，关键词搜索使用menuName传递
    if (queryParams.keyword) {
      requestParams.menuName = queryParams.keyword;
    }

    if (queryParams.sysId) {
      requestParams.sysId = queryParams.sysId;
    }

    // 发起请求获取菜单列表
    const { data } = await get('auth/menu', requestParams);

    if (data.code == 200 && data.obj) {
      
      if (data.obj.rows) {
      
        // 尝试不同的数据结构，确保能够正确获取菜单数据
        let menuData = [];
        
        if (data.obj.rows?.children) {
          // 第一种情况：data.obj.rows.children
          menuData = data.obj.rows.children;
          console.log('使用 data.obj.rows.children 结构');
        } else if (data.obj.rows) {
          // 第二种情况：data.obj.rows
          menuData = data.obj.rows;
          console.log('使用 data.obj.rows 结构');
        } else if (Array.isArray(data.obj)) {
          // 第三种情况：data.obj是数组
          menuData = data.obj;
          console.log('使用 data.obj 数组结构');
        } else if (typeof data.obj === 'object') {
          // 第四种情况：data.obj是对象，尝试找children
          menuData = data.obj.children || [];
          console.log('使用 data.obj.children 结构');
        }
        
        // 处理后端返回的数据格式
        processMenuData(menuData);
        console.log('处理后的菜单数据:', menuData);
        
        // 设置菜单列表数据
        menuList.value = menuData;
        
      } else {
        menuList.value = []; // 发生错误时，重置为空数组
        console.log('API返回错误或无数据, code:', data.code);
      }
    }
  } catch (error) {
    console.error('获取菜单列表失败', error);
    message.error('获取菜单列表失败');
    menuList.value = []; // 发生错误时，重置为空数组
  } finally {
    loading.value = false;
    
    // 检查菜单数据
    if (menuList.value.length > 0) {
      const firstItem = menuList.value[0];
      console.log('【菜单数据示例】:', firstItem);
      console.log('【菜单ID字段检查】:', {
        hasId: 'id' in firstItem,
        id值: firstItem.id,
        menuId值: firstItem.menuId
      });
    }
  }
};

// 处理菜单数据，确保字段正确映射
const processMenuData = (menus) => {
  if (!menus || !menus.length) return;

  menus.forEach(menu => {
    // 处理菜单类型
    if (menu.type == '0') {
      menu.type = 'M'; // 菜单
    } else if (menu.type == '1') {
      menu.type = 'F'; // 按钮
    } else if (!menu.type) {
      menu.type = 'C'; // 默认为组件
    }

    // 处理可见性字段
    // 兼容 hidden 和 visible 字段，hidden为0或false表示显示，与visible=0的逻辑相同
    if (menu.hidden !== undefined && menu.visible === undefined) {
      // 根据hidden字段设置visible
      menu.visible = menu.hidden == '0' || menu.hidden === false ? '0' : '1';
    }

    // 处理其他属性的映射
    menu.name = menu.text || menu.name; // 确保有名称字段
    menu.orderNum = menu.order || menu.orderNum; // 排序字段
    menu.perms = menu.permission || menu.perms; // 权限标识字段

    // 确保子菜单数组存在
    if (!menu.children) {
      menu.children = [];
    }

    // 递归处理子菜单
    if (menu.children && menu.children.length > 0) {
      processMenuData(menu.children);
    } else {
      // 如果没有子菜单，删除空的children数组以避免显示展开图标
      delete menu.children;
    }
  });
};

// 查询按钮事件
const handleQuery = (values) => {
  // 重置查询参数
  Object.keys(queryParams).forEach(key => {
    queryParams[key] = undefined;
  });
  
  // 合并新的查询参数
  Object.assign(queryParams, values);
  
  // 执行查询
  getList();
};

// 重置查询
const resetQuery = () => {
  searchFormRef.value?.resetFields();
  // 确保所有参数被清空
  Object.keys(queryParams).forEach(key => {
    queryParams[key] = undefined;
  });
  getList();
};

// 确认删除
const confirmDelete = (record) => {
  Modal.confirm({
    title: '确定删除该菜单吗？',
    content: '删除后将无法恢复，如果包含子菜单或按钮，将一并删除！',
    centered: true,
    onOk: () => handleDelete(record)
  });
};

// 新增菜单
const handleAdd = () => {
  if (menuAddRef.value) {
    menuAddRef.value.open();
  }
};

// 新增子菜单
const handleAddChild = (record) => {
  if (menuAddRef.value) {
    menuAddRef.value.open(record);
  }
};

// 新增按钮
const handleAddButton = (record) => {
  if (buttonAddRef.value) {
    buttonAddRef.value.open(record);
  }
};

// 编辑菜单
const handleEdit = (record) => {
  if (record.type === 'F') {
    buttonEditRef.value.open(record);
  } else {
    menuEditRef.value.open(record);
  }
};

// 删除菜单
const handleDelete = async (record) => {
  try {
    const { data } = await post('auth/menu/del', {
      menuIds: record.id
    });

    if (handleResponse(data, '删除成功', '删除失败')) {
      getList();
    }
  } catch (error) {
    console.error('删除菜单失败', error);
    message.error('删除失败');
  }
};

// 批量删除
const handleBatchDelete = async (selectedKeys, selectedRows) => {
  if (selectedKeys.length === 0) {
    message.warning('请选择要删除的菜单');
    return;
  }

  console.log('执行批量删除，已选择ID:', selectedKeys);

  Modal.confirm({
    title: '确定删除所选中的记录?',
    content: '当您点击确定按钮后，这些记录将会被彻底删除，如果其包含子记录，也将一并删除！',
    centered: true,
    async onOk() {
      try {
        const { data } = await post('auth/menu/del', {
          menuIds: selectedKeys.join(',')
        });

        if (handleResponse(data, '删除成功', '删除失败')) {
          getList();
        }
      } catch (error) {
        console.error('批量删除菜单失败', error);
        message.error('批量删除失败');
      }
    },
    onCancel() {
      // 取消时不清除选择
    }
  });
};

// 菜单添加完成回调
const handleMenuAddSuccess = () => {
  message.success('新增菜单成功');
  getList();
};

// 菜单编辑完成回调
const handleMenuEditSuccess = () => {
  message.success('修改菜单成功');
  getList();
};

// 按钮添加完成回调
const handleButtonAddSuccess = () => {
  message.success('新增按钮成功');
  getList();
};

// 按钮编辑完成回调
const handleButtonEditSuccess = () => {
  message.success('修改按钮成功');
  getList();
};

// 菜单添加组件关闭回调
const handleMenuAddClose = () => {
  // 确保组件状态被重置
  if (menuAddRef.value) {
    menuAddRef.value.resetForm?.();
  }
};

// 菜单编辑组件关闭回调
const handleMenuEditClose = () => {
  // 确保组件状态被重置
  if (menuEditRef.value) {
    menuEditRef.value.resetForm?.();
  }
};

// 按钮添加组件关闭回调
const handleButtonAddClose = () => {
  // 确保组件状态被重置
  if (buttonAddRef.value) {
    buttonAddRef.value.resetForm?.();
  }
};

// 按钮编辑组件关闭回调
const handleButtonEditClose = () => {
  // 确保组件状态被重置
  if (buttonEditRef.value) {
    buttonEditRef.value.resetForm?.();
  }
};

// 导出Excel
const exportExcel = async () => {
  try {
    await exportExcelFile('menu/excel', {
      ...queryParams
    })
    message.success('导出成功')
  } catch (error) {
    console.error('导出Excel失败', error)
    message.error('导出失败')
  }
};

// 获取图标组件
const getIconComponent = (iconName) => {
  if (!iconName) return null;

  // 首先尝试直接匹配
  if (AntIcons[iconName]) {
    return AntIcons[iconName];
  }

  // 尝试转换成Outlined后缀形式匹配
  const outlinedName = iconName.charAt(0).toUpperCase() + iconName.slice(1) + 'Outlined';
  if (AntIcons[outlinedName]) {
    return AntIcons[outlinedName];
  }

  // 尝试全部首字母大写
  const capitalizedName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  if (AntIcons[capitalizedName]) {
    return AntIcons[capitalizedName];
  }

  // 尝试 XXXFilled 格式
  const filledName = iconName.charAt(0).toUpperCase() + iconName.slice(1) + 'Filled';
  if (AntIcons[filledName]) {
    return AntIcons[filledName];
  }

  // 尝试 XXXTwoTone 格式
  const twoToneName = iconName.charAt(0).toUpperCase() + iconName.slice(1) + 'TwoTone';
  if (AntIcons[twoToneName]) {
    return AntIcons[twoToneName];
  }

  // 尝试常见的简写映射
  const iconMap = {
    'global': 'GlobalOutlined',
    'user': 'UserOutlined',
    'team': 'TeamOutlined',
    'tool': 'ToolOutlined',
    'setting': 'SettingOutlined',
    'solution': 'SolutionOutlined',
    'bell': 'BellOutlined',
    'file': 'FileOutlined',
    'home': 'HomeOutlined',
    'dashboard': 'DashboardOutlined',
    'plus': 'PlusOutlined',
    'edit': 'EditOutlined',
    'delete': 'DeleteOutlined',
    'save': 'SaveOutlined',
    'search': 'SearchOutlined',
    'question': 'QuestionOutlined',
    'info': 'InfoOutlined'
  };

  if (iconMap[iconName]) {
    return AntIcons[iconMap[iconName]];
  }

  console.warn('找不到图标组件:', iconName);
  // 默认返回一个问号图标，避免渲染失败
  return AntIcons['QuestionCircleOutlined'];
};

// 初始化
onMounted(() => {
  // 获取子系统列表，在子系统列表的回调中会调用getList()
  getSubsystemList();
});
</script>

<style lang="less" scoped>
.menu-management {
  .operation-buttons {
    display: flex;
    gap: 8px;
    white-space: nowrap;
    
    a {
      cursor: pointer;
      color: @primary-color;
      
      &:hover {
        opacity: 0.8;
      }
    }
    
    .danger-text {
      color: #ff4d4f;
      
      &:hover {
        color: #ff7875;
      }
    }
  }
}
</style>
