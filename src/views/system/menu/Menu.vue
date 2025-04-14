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
      :rowSelection="{ 
        type: 'checkbox',
        selectedRowKeys: selectedKeys, 
        onChange: onSelectChange 
      }"
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
      :pagination="false"
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
import { message, Modal, Tag } from 'ant-design-vue';
import { useRequest, handleResponse } from '@/utils/request';
import { useUserStore } from '@/stores/user';
import MenuAdd from './MenuAdd.vue';
import MenuEdit from './MenuEdit.vue';
import ButtonAdd from './ButtonAdd.vue';
import ButtonEdit from './ButtonEdit.vue';
import { format } from 'date-fns';
import IconUtils from '@/utils/iconUtils';
import { MenuUtils } from '@/utils/menuUtils';

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
const selectedKeys = ref([]);

// 初始化查询参数
const queryParams = reactive({
  keyword: undefined,
  dateRange: undefined,
  sysId: undefined,
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
      const iconComp = IconUtils.getIconComponent(record.icon);
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
    width: '10%',
    customRender: ({ text, record }) => {
      // 对于外部链接，显示为可点击的链接样式
      if (record.isFrame == '1') {
        return h('a', { 
          href: text,
          target: '_blank',
          style: 'color: #1890ff; text-decoration: underline;'
        }, text);
      }
      return text;
    }
  },
  {
    title: '组件',
    dataIndex: 'component',
    width: '10%',
    customRender: ({ text, record }) => {
      // 对于外部链接，显示"--"
      if (record.isFrame == '1') {
        return '—';
      }
      return text;
    }
  },
  {
    title: '类型',
    dataIndex: 'type',
    width: '8%',
    tooltipFormatter: (text, record) => {
      // 优先判断是否为外部链接
      if (record.isFrame == '1') {
        return '外部链接';
      }
      
      // 使用与customRender一致的映射
      const typeTexts = {
        C: '菜单',
        F: '按钮'
      };
      return typeTexts[text] || '未知';
    },
    customRender: ({ text, record }) => {
      const typeColors = {
        M: 'blue',
        C: 'cyan',
        F: 'purple'
      };
      const typeTexts = {
        C: '菜单',
        F: '按钮'
      };
      
      // 优先判断是否为外部链接
      if (record.isFrame == '1') {
        console.log('渲染外部链接菜单:', record.text || record.name);
        return h(Tag, { color: 'orange' }, () => '外部链接');
      }
      
      // 菜单类型判断
      return h(Tag, { color: typeColors[text] || 'default' }, () => typeTexts[text] || '未知');
    }
  },
  {
    title: '可见',
    dataIndex: 'visible',
    width: '8%',
    valueMap: {
      '0': '显示',
      '1': '隐藏',
      'false': '显示',
      'true': '隐藏'
    },
    tooltipFormatter: (text, record) => {
      return record.hidden == '0' || record.hidden === false ? '显示' : '隐藏';
    },
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
          class: 'operation-link',
          style: 'cursor: pointer; margin-right: 8px;' 
        }, '新增子菜单'));
        
        children.push(h('a', { 
          onClick: () => handleAddButton(record),
          class: 'operation-link',
          style: 'cursor: pointer; margin-right: 8px;' 
        }, '新增按钮'));
      }
      
      children.push(h('a', { 
        onClick: () => handleEdit(record),
        class: 'operation-link',
        style: 'cursor: pointer; margin-right: 8px;' 
      }, '编辑'));
      
      children.push(h('a', { 
        onClick: () => confirmDelete(record),
        class: 'operation-link danger-text',
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
    
    // 使用工具类获取子系统列表
    const subsystems = await MenuUtils.getSubsystemList(userId);
    
    if (subsystems.length > 0) {
      // 转换为下拉选项格式
      searchFields[1].options = subsystems.map(item => ({
        label: item.text,
        value: item.value
      }));

      // 设置默认系统ID
      queryParams.sysId = subsystems[0].value;
      // 获取菜单列表
      getList();
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
        
        let menuData = [];
        
        if (data.obj.rows?.children) {
          // 第一种情况：data.obj.rows.children
          menuData = data.obj.rows.children;
          console.log('使用 data.obj.rows.children 结构');
        }
        
        // 添加详细日志，在处理数据前检查原始数据中的isFrame字段
        if (menuData.length > 0) {
          // 记录原始数据中的isFrame字段情况
          const externalMenusRaw = menuData.filter(item => item.isFrame == '1');
          console.log('原始数据中外部链接菜单数量:', externalMenusRaw.length);
          if (externalMenusRaw.length > 0) {
            console.log('原始数据中外部链接菜单示例:', 
              { id: externalMenusRaw[0].id, name: externalMenusRaw[0].text, isFrame: externalMenusRaw[0].isFrame, path: externalMenusRaw[0].path });
          }
        }
        
        // 处理后端返回的数据格式
        MenuUtils.processMenuData(menuData);
        console.log('处理后的菜单数据:', menuData);
        
        // 添加详细日志，检查isFrame字段
        if (menuData.length > 0) {
          console.log('菜单数据第一项详情:', {
            id: menuData[0].id,
            name: menuData[0].name,
            type: menuData[0].type,
            isFrame: menuData[0].isFrame,
            完整对象: menuData[0]
          });
          
          // 检查是否有外部链接菜单
          const externalMenus = menuData.filter(item => item.isFrame == '1');
          console.log('处理后外部链接菜单数量:', externalMenus.length);
          if (externalMenus.length > 0) {
            console.log('处理后外部链接菜单示例:', 
              { id: externalMenus[0].id, name: externalMenus[0].name, isFrame: externalMenus[0].isFrame, path: externalMenus[0].path });
          }
        }
        
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
      console.log('【菜单ID字段检查】:', {
        hasId: 'id' in firstItem,
        id值: firstItem.id,
        menuId值: firstItem.menuId
      });
    }
  }
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

// 处理表格选择变化
const onSelectChange = (selection) => {
  selectedKeys.value = selection;
  console.log('已选择菜单:', selectedKeys.value);
};

// 初始化
onMounted(() => {
  // 获取子系统列表，在子系统列表的回调中会调用getList()
  getSubsystemList();
});
</script>
