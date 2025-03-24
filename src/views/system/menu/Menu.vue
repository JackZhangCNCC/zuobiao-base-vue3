<template>
  <div class="menu-management">
    <search-card @search="handleQuery" @reset="resetQuery">
      <template #search-items>
        <search-form-item label="菜单名称">
          <a-input v-model:value="queryParams.menuName" placeholder="请输入" allowClear />
        </search-form-item>

        <search-form-item label="创建时间">
          <a-range-picker v-model:value="rangePickerValue" style="width: 100%" />
        </search-form-item>

        <search-form-item label="子系统">
          <a-select
            v-model:value="queryParams.sysId"
            placeholder="请选择"
            style="width: 100%"
            allowClear
          >
            <a-select-option v-for="item in subsystemOptions" :key="item.value" :value="item.value">
              {{ item.text }}
            </a-select-option>
          </a-select>
        </search-form-item>
      </template>

      <template #operations>
        <action-buttons
          :hasSelected="selectedRowKeys.length > 0"
          @add="handleAdd"
          @delete="handleBatchDelete"
          @export="exportExcel"
        />
      </template>

      <template #table>
        <a-table
          :dataSource="menuList"
          :columns="columns"
          :pagination="false"
          :loading="loading"
          rowKey="id"
          :row-selection="{
            selectedRowKeys: selectedRowKeys,
            onChange: onSelectChange,
            columnWidth: '55px',
            columnTitle: ' ',
            type: 'checkbox',
            preserveSelectedRowKeys: false
          }"
          size="middle"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'icon'">
              <component :is="getIconComponent(record.icon)" v-if="record.icon" />
            </template>
            <template v-if="column.dataIndex === 'visible'">
              <a-tag :color="record.hidden === '0' || record.hidden === false ? 'green' : 'red'">
                {{ record.hidden === '0' || record.hidden === false ? '显示' : '隐藏' }}
              </a-tag>
            </template>
            <template v-if="column.dataIndex === 'type'">
              <a-tag :color="record.type === 'M' ? 'blue' : (record.type === 'C' ? 'cyan' : 'purple')">
                {{ record.type === 'M' ? '菜单' : (record.type === 'C' ? '组件' : '按钮') }}
              </a-tag>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-space>
                <a @click="handleAddChild(record)" v-if="record.type !== 'F'">新增子菜单</a>
                <a @click="handleAddButton(record)" v-if="record.type !== 'F'">新增按钮</a>
                <a @click="handleEdit(record)">编辑</a>
                <a-popconfirm
                  title="确定删除该菜单吗？"
                  @confirm="handleDelete(record)"
                  okText="确定"
                  cancelText="取消"
                >
                  <a class="danger-text">删除</a>
                </a-popconfirm>
              </a-space>
            </template>
          </template>
        </a-table>
      </template>

      <template #dialogs>
        <MenuAdd ref="menuAddRef" @close="handleMenuAddClose" @success="handleMenuAddSuccess" />
        <MenuEdit ref="menuEditRef" @close="handleMenuEditClose" @success="handleMenuEditSuccess" />
        <ButtonAdd ref="buttonAddRef" @close="handleButtonAddClose" @success="handleButtonAddSuccess" />
        <ButtonEdit ref="buttonEditRef" @close="handleButtonEditClose" @success="handleButtonEditSuccess" />
      </template>
    </search-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
  DownloadOutlined
} from '@ant-design/icons-vue';
// 导入所有Ant Design图标
import * as AntIcons from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';
import { useRequest, handleResponse } from '../../../utils/request';
import { useUserStore } from '../../../stores/user';
import MenuAdd from './MenuAdd.vue';
import MenuEdit from './MenuEdit.vue';
import ButtonAdd from './ButtonAdd.vue';
import ButtonEdit from './ButtonEdit.vue';
import SearchCard from '@/components/layout/SearchCard.vue';
import SearchFormItem from '@/components/form/SearchFormItem.vue';
import ActionButtons from '@/components/operation/ActionButtons.vue';
import { format } from 'date-fns';

// 获取请求方法
const { get, post, export: exportExcelFile } = useRequest();
// 获取用户存储
const userStore = useUserStore();

// 引用组件实例
const menuAddRef = ref(null);
const menuEditRef = ref(null);
const buttonAddRef = ref(null);
const buttonEditRef = ref(null);
const queryFormRef = ref(null);

// 数据加载状态
const loading = ref(false);
// 菜单列表数据 - 确保初始化为空数组
const menuList = ref([]);
// 选中的行
const selectedRowKeys = ref([]);
// 日期选择值
const rangePickerValue = ref([]);

// 查询参数
const queryParams = reactive({
  menuName: '',
  sysId: undefined,
  createTimeFrom: '',
  createTimeTo: ''
});

// 表格列定义
const columns = [
  {
    title: '菜单名称',
    dataIndex: 'name',
    key: 'name',
    width: '15%'
  },
  {
    title: '图标',
    dataIndex: 'icon',
    key: 'icon',
    width: '5%'
  },
  {
    title: '排序',
    dataIndex: 'orderNum',
    key: 'orderNum',
    width: '8%'
  },
  {
    title: '权限标识',
    dataIndex: 'perms',
    key: 'perms',
    width: '15%'
  },
  {
    title: '路径',
    dataIndex: 'path',
    key: 'path',
    width: '10%'
  },
  {
    title: '组件',
    dataIndex: 'component',
    key: 'component',
    width: '10%'
  },
  {
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: '8%'
  },
  {
    title: '可见',
    dataIndex: 'visible',
    key: 'visible',
    width: '8%'
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    width: '20%'
  }
];

// 子系统选项列表
const subsystemOptions = ref([]);

// 获取子系统列表
const getSubsystemList = async () => {
  try {
    // 获取当前用户ID
    const userId = userStore.user?.id || '';
    const { data } = await get(`/auth/sys/selectSysList?userId=${userId}`)
    if (handleResponse(data, null, '获取子系统列表失败')) {
      // 转换为下拉选项格式
      subsystemOptions.value = data.obj.map(item => ({
        value: item.sysId,
        text: item.sysName
      }))

      // 设置默认系统ID
      if (data.obj.length > 0) {
        queryParams.sysId = data.obj[0].sysId;
        // 获取菜单列表
        getList();
      }
    }
  } catch (error) {
    console.error('获取子系统列表失败', error)
  }
}

// 表格选择变化
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys;
};

// 查询菜单列表
const getList = async () => {
  loading.value = true;
  try {
    // 创建最终的请求参数对象
    const requestParams = {};

    // 处理日期范围参数
    if (rangePickerValue.value && rangePickerValue.value.length > 0) {
      requestParams.createTimeFrom = format(rangePickerValue.value[0], 'yyyy-MM-dd');
      requestParams.createTimeTo = format(rangePickerValue.value[1], 'yyyy-MM-dd');
    }

    // 仅添加有值的参数
    if (queryParams.menuName) {
      requestParams.menuName = queryParams.menuName;
    }

    if (queryParams.sysId) {
      requestParams.sysId = queryParams.sysId;
    }

    // 发起请求获取菜单列表，不默认添加type参数
    const { data } = await get('auth/menu', requestParams);

    if (data.code == 200 && data.obj) {
      // 输出完整的菜单数据用于调试
      console.log('API返回的菜单数据:', JSON.stringify(data.obj));

      // 确保子级菜单在父级后面
      const menuData = data.obj.rows.children || [];
      // 处理后端返回的数据格式
      processMenuData(menuData);
      // 设置菜单列表数据
      menuList.value = menuData;

      // 打印处理后的第一个菜单数据，用于调试
      if (menuData.length > 0) {
        console.log('第一个菜单数据示例:', JSON.stringify(menuData[0]));
      }
    } else {
      menuList.value = []; // 发生错误时，重置为空数组
    }
  } catch (error) {
    console.error('获取菜单列表失败', error);
    message.error('获取菜单列表失败');
    menuList.value = []; // 发生错误时，重置为空数组
  } finally {
    loading.value = false;
  }
};

// 处理菜单数据，确保字段正确映射
const processMenuData = (menus) => {
  if (!menus || !menus.length) return;

  menus.forEach(menu => {
    // 处理菜单类型
    if (menu.type === '0') {
      menu.type = 'M'; // 菜单
    } else if (menu.type === '1') {
      menu.type = 'F'; // 按钮
    } else if (!menu.type) {
      menu.type = 'C'; // 默认为组件
    }

    // 处理可见性字段
    // 兼容 hidden 和 visible 字段，hidden为0或false表示显示，与visible=0的逻辑相同
    if (menu.hidden !== undefined && menu.visible === undefined) {
      // 根据hidden字段设置visible
      menu.visible = menu.hidden === '0' || menu.hidden === false ? '0' : '1';
    }

    // 处理其他属性的映射
    menu.name = menu.text || menu.name; // 确保有名称字段
    menu.orderNum = menu.order || menu.orderNum; // 排序字段
    menu.perms = menu.permission || menu.perms; // 权限标识字段

    // 递归处理子菜单
    if (menu.children && menu.children.length > 0) {
      processMenuData(menu.children);
    }
  });
};

// 查询按钮事件
const handleQuery = () => {
  selectedRowKeys.value = [];
  getList();
};

// 重置查询
const resetQuery = () => {
  // 重置所有查询条件
  queryParams.menuName = '';
  queryParams.sysId = undefined;
  queryParams.createTimeFrom = '';
  queryParams.createTimeTo = '';

  // 清空日期范围选择器
  rangePickerValue.value = [];

  // 清空选中行
  selectedRowKeys.value = [];

  // 重新查询
  getList();
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
  if (menuEditRef.value) {
    if (record.type === 'F') {
      buttonEditRef.value.open(record);
    } else {
      menuEditRef.value.open(record);
    }
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
const handleBatchDelete = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的菜单');
    return;
  }

  Modal.confirm({
    title: '确定删除所选中的记录?',
    content: '当您点击确定按钮后，这些记录将会被彻底删除，如果其包含子记录，也将一并删除！',
    centered: true,
    async onOk() {
      try {
        const { data } = await post('auth/menu/del', {
          menuIds: selectedRowKeys.value.join(',')
        });

        if (handleResponse(data, '删除成功', '删除失败')) {
          selectedRowKeys.value = [];
          getList();
        }
      } catch (error) {
        console.error('批量删除菜单失败', error);
        message.error('批量删除失败');
      }
    },
    onCancel() {
      selectedRowKeys.value = [];
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

// 生命周期钩子
onMounted(() => {
  // 先获取子系统列表，在子系统列表的回调中会调用getList()
  getSubsystemList();
  // 不要在这里直接调用getList()，避免重复调用
});
</script>

<style scoped>
.menu-management {
  padding: 16px;
}

.card-container {
  box-shadow: 0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12), 0 5px 12px 4px rgba(0, 0, 0, 0.09);
}

.ant-advanced-search-form {
  margin-bottom: 16px;
  padding: 16px;
  background: #fbfbfb;
  border: 1px solid #d9d9d9;
  border-radius: 2px;
}

.danger-text {
  color: #ff4d4f;
}
</style>
