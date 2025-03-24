<template>
  <div>
    <a-drawer
      title="编辑菜单"
      :width="600"
      :open="visible"
      :body-style="{ paddingBottom: '80px' }"
      @close="onClose"
    >
      <a-form :model="form" :rules="rules" ref="formRef" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="上级菜单" name="parentId">
          <a-tree-select
            v-model:value="form.parentId"
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            :tree-data="menuTree"
            placeholder="请选择上级菜单"
            tree-default-expand-all
            :fieldNames="{ label: 'text', key: 'id', value: 'id' }"
            allow-clear
          />
        </a-form-item>

        <a-form-item label="菜单类型" name="type">
          <a-radio-group v-model:value="form.type" @change="handleTypeChange">
            <a-radio value="M">目录</a-radio>
            <a-radio value="C">菜单</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="菜单名称" name="name">
          <a-input v-model:value="form.name" placeholder="请输入菜单名称" />
        </a-form-item>

        <a-form-item v-if="form.type !== 'M'" label="组件路径" name="component">
          <a-input v-model:value="form.component" placeholder="请输入组件路径" />
        </a-form-item>

        <a-form-item label="路由地址" name="path">
          <a-input v-model:value="form.path" placeholder="请输入路由地址" />
        </a-form-item>

        <a-form-item label="权限标识" name="perms">
          <a-input v-model:value="form.perms" placeholder="请输入权限标识" />
        </a-form-item>

        <a-form-item label="菜单图标" name="icon">
          <div class="icon-selector">
            <span @click="showIconSelect" class="icon-wrapper">
              <component :is="getIconComponent(form.icon)" v-if="form.icon" />
              <span v-else>点击选择图标</span>
            </span>
            <span class="icon-name ml-2" v-if="form.icon">{{ form.icon }}</span>
          </div>
        </a-form-item>

        <a-form-item label="排序号" name="orderNum">
          <a-input-number v-model:value="form.orderNum" :min="0" style="width: 100%" />
        </a-form-item>

        <a-form-item label="显示状态" name="visible">
          <a-radio-group v-model:value="form.visible">
            <a-radio value="0">显示</a-radio>
            <a-radio value="1">隐藏</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="子系统" name="subsystem">
          <a-select
            v-model:value="form.subsystem"
            placeholder="请选择子系统"
            style="width: 100%"
            @change="handleSubsystemChange"
          >
            <a-select-option v-for="item in subsystemOptions" :key="item.value" :value="item.value">
              {{ item.text }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="系统" name="sysId">
          <a-select
            placeholder="请选择系统"
            class="fullWidth"
            v-model:value="menu.sysId"
            @change="handleSysChange"
          >
            <a-select-option v-for="item in systemOptions" :key="item.value" :value="item.value">
              {{ item.text }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>

      <div class="drawer-footer">
        <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
        <a-button type="primary" @click="onSubmit">提交</a-button>
      </div>
    </a-drawer>

    <!-- 图标选择器弹窗 -->
    <Icons ref="iconSelectRef" @select="handleIconSelect" />
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, watch, computed } from 'vue';
import Icons from './Icons.vue';
// 导入所有Ant Design图标
import * as AntIcons from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { useRequest, handleResponse, handleMenuResponse } from '../../../utils/request';
import { useUserStore } from '../../../stores/user';

// 获取API
const { get, post } = useRequest();
// 获取用户存储
const userStore = useUserStore();

// 抽屉状态
const visible = ref(false);
const title = ref('修改菜单');
const loading = ref(false);

// 表单引用
const formRef = ref(null);
const iconSelectRef = ref(null);

// 菜单树状态
const menuTreeData = ref([]);
const menuTreeKey = ref(Date.now());
const expandedKeys = ref([]);
const checkedKeys = ref([]);
const defaultCheckedKeys = ref([]);
const allTreeKeys = ref([]); // 所有树节点ID，用于展开/折叠全部功能
const autoExpandParent = ref(true);

// 计算属性 - 菜单树
const menuTree = computed(() => menuTreeData.value);

// 菜单表单数据
const menu = reactive({
  menuId: '',
  menuName: '',
  path: '',
  component: '',
  perms: '',
  icon: '',
  orderNum: 0,
  sysId: undefined,
  hidden: false,
  parentId: '',
  isFrame: '0' // 添加外部链接标识，0-内部菜单 1-外部链接
});

// 图标选择相关
const showIcons = ref(false);

// 表单数据
const form = reactive({
  id: '',
  parentId: undefined,
  type: 'M',
  name: '',
  component: '',
  path: '',
  perms: '',
  icon: '',
  orderNum: 0,
  visible: '0',
  subsystem: '1'
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  component: [{ required: false, message: '请输入组件路径', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
  perms: [{ required: false, message: '请输入权限标识', trigger: 'blur' }],
  subsystem: [{ required: true, message: '请选择子系统', trigger: 'change' }]
};

// 子系统选项
const subsystemOptions = ref([]);

// 系统选项
const systemOptions = ref([
  { value: '1', text: '系统1' },
  { value: '2', text: '系统2' },
  { value: '3', text: '系统3' }
]);

// 获取子系统列表
const getSubsystemList = async () => {
  try {
    // 获取当前用户ID
    const userId = userStore.user?.id || '';
    const { data } = await get(`/auth/sys/selectSysList?userId=${userId}`)
    if (data.code === 200 && data.obj) {
      // 转换为下拉选项格式
      subsystemOptions.value = data.obj.map(item => ({
        value: item.sysId,
        text: item.sysName
      }))
    }
  } catch (error) {
    console.error('获取子系统列表失败', error)
  }
}

// 初始化数据
onMounted(() => {
  getSubsystemList();
});

// 打开抽屉
const open = async (record) => {
  if (!record) return;

  visible.value = true;
  menu.menuId = record.id;

  // 获取菜单树
  await getMenuTree();

  // 获取菜单详情
  await getMenuInfo(record.id);
};

// 获取菜单树数据
const getMenuTree = async (sysId) => {
  menuTreeKey.value = Date.now(); // 强制重新渲染

  try {
    // 传递系统ID参数，添加type=0表示获取菜单类型，与Vue2项目保持一致
    const { data } = await get(`auth/menu?type=0&sysId=${sysId || form.subsystem || ''}`)

    if (data.code === 200 && data.obj) {
      menuTreeData.value = data.obj.rows.children;
      // 保存所有树节点ID，用于展开/折叠全部功能
      allTreeKeys.value = data.obj.ids;
    } else {
      console.error('获取菜单树数据格式错误', data);
      menuTreeData.value = [];
    }
  } catch (error) {
    console.error('获取菜单树失败', error);
    menuTreeData.value = [];
  }
}

// 获取菜单详情
const getMenuInfo = async (id) => {
  try {
    loading.value = true;

    // 从菜单树获取详情，无需额外API请求
    const { data } = await get('auth/menu', { type: 0, sysId: '' });

    if (handleResponse(data, null, '获取菜单数据失败')) {
      let menuInfo = null;

      // 在菜单树中查找指定ID的菜单
      const findMenuById = (list, targetId) => {
        if (!list || !list.length) return null;

        for (const item of list) {
          if (item.id === targetId) {
            return item;
          }
          if (item.children && item.children.length) {
            const found = findMenuById(item.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };

      // 从API响应中查找菜单
      if (data.obj && data.obj.rows && data.obj.rows.children) {
        menuInfo = findMenuById(data.obj.rows.children, id);
      }

      console.log('找到的菜单信息:', menuInfo);

      if (menuInfo) {
        // 设置表单数据，保持字段映射一致
        form.id = menuInfo.id;
        form.parentId = menuInfo.parentId === '0' ? undefined : menuInfo.parentId;
        form.type = menuInfo.type === '0' ? 'M' : 'C';
        form.name = menuInfo.text || menuInfo.name || menuInfo.menuName || '';
        form.component = menuInfo.component || '';
        form.path = menuInfo.path || '';
        form.perms = menuInfo.permission || menuInfo.perms || '';
        form.icon = menuInfo.icon || '';
        form.orderNum = menuInfo.order || menuInfo.orderNum || 0;
        // 处理可见状态
        form.visible = menuInfo.hidden === true || menuInfo.hidden === '1' ? '1' : '0';
        form.subsystem = menuInfo.sysId;
        form.isFrame = menuInfo.isFrame || '0';

        // 设置菜单ID
        menu.menuId = menuInfo.id;
        menu.sysId = menuInfo.sysId;

        console.log('设置的图标名称:', form.icon);

        // 重置表单校验状态
        nextTick(() => {
          formRef.value?.clearValidate();
        });
      } else {
        message.error('未找到指定菜单');
      }
    }
  } catch (error) {
    console.error('获取菜单详情失败', error);
    message.error('获取菜单详情失败');
  } finally {
    loading.value = false;
  }
};

// 重置表单
const resetForm = () => {
  formRef.value?.resetFields();
  loading.value = false;
  menuTreeKey.value = Date.now();
  expandedKeys.value = [];
  checkedKeys.value = [];
  defaultCheckedKeys.value = [];
  Object.keys(menu).forEach(key => {
    if (typeof menu[key] === 'string') {
      menu[key] = '';
    } else if (typeof menu[key] === 'boolean') {
      menu[key] = false;
    } else if (Array.isArray(menu[key])) {
      menu[key] = [];
    } else {
      menu[key] = undefined;
    }
  });
};

// 关闭抽屉
const onClose = () => {
  visible.value = false; // 确保抽屉状态设置为关闭
  resetForm();
  emit('close');
};

// 提交表单
const onSubmit = () => {
  formRef.value.validate().then(async () => {
    // 检查选中的父级菜单，兼容树选择器两种模式
    let checkedArr = Object.prototype.hasOwnProperty.call(checkedKeys.value, 'checked')
      ? checkedKeys.value.checked
      : checkedKeys.value;

    if (checkedArr.length > 1) {
      message.error('最多只能选择一个上级菜单，请修改');
      return;
    }

    if (checkedArr[0] === menu.menuId) {
      message.error('不能选择自己作为上级菜单，请修改');
      return;
    }

    loading.value = true;

    try {
      // 构建完整的菜单对象，与老系统保持一致
      const updatedMenu = {
        menuId: menu.menuId,
        menuName: form.name,
        path: form.path,
        component: form.component,
        perms: form.perms,
        icon: menu.icon, // 使用menu.icon而不是form.icon
        orderNum: form.orderNum,
        sysId: form.subsystem,
        hidden: form.visible === '1',
        type: '0', // 0 表示菜单 1 表示按钮
        isFrame: form.isFrame,
      };

      // 设置父级ID
      if (checkedArr.length) {
        updatedMenu.parentId = checkedArr[0];
      } else {
        updatedMenu.parentId = '';
      }

      // 处理外部链接URL
      if (updatedMenu.isFrame === '1' && updatedMenu.path) {
        if (!updatedMenu.path.startsWith('http://') && !updatedMenu.path.startsWith('https://')) {
          updatedMenu.path = 'http://' + updatedMenu.path;
        }
      }

      const response = await post('auth/menu/update', updatedMenu);

      // 使用专门针对菜单接口的响应处理函数，移除成功提示参数
      if (handleMenuResponse(response, null)) {
        resetForm();
        emit('success');
      }
    } catch (error) {
      console.error('修改菜单失败', error);
      message.error('修改菜单失败');
    } finally {
      loading.value = false;
    }
  }).catch(error => {
    console.log('表单验证失败', error);
  });
};

// 处理菜单类型变化
const handleTypeChange = (e) => {
  form.type = e.target.value;
  if (form.type === 'M') {
    form.component = '';
  }
};

// 显示图标选择器
const showIconSelect = () => {
  iconSelectRef.value?.open();
};

// 处理图标选择
const handleIconSelect = (icon) => {
  form.icon = icon;
  menu.icon = icon; // 同步更新menu对象的icon字段
  console.log('选择的图标:', icon);
};

// 暴露方法给父组件调用
defineExpose({
  open
});

// 定义事件
const emit = defineEmits(['close', 'success']);

// 系统选择变化
const handleSysChange = (value) => {
  // 更新两处系统ID，确保同步
  menu.sysId = value;
  form.subsystem = value;
  console.log('系统已变更，当前选择系统ID:', value);

  // 清空上级菜单选择，因为切换系统后上级菜单列表会变化
  form.parentId = undefined;

  // 系统变更后重新获取对应系统的菜单树
  getMenuTree(value);
}

// 设置表单值 - 修复字段映射和初始化
const setFormValues = (menuData) => {
  visible.value = true;

  // 重置表单
  resetForm();

  // 设置表单字段，保持与Vue2项目一致的字段映射
  form.name = menuData.text || menuData.name;
  form.path = menuData.path || '';
  form.component = menuData.component || '';
  form.perms = menuData.permission || menuData.perms || '';
  form.icon = menuData.icon || '';
  form.orderNum = menuData.order || menuData.orderNum || 0;
  form.visible = menuData.hidden ? '1' : '0';
  form.subsystem = menuData.sysId;
  form.type = menuData.type === '0' ? 'M' : 'C';
  form.isFrame = menuData.isFrame || '0';

  // 设置菜单ID
  menu.menuId = menuData.id;
  menu.sysId = menuData.sysId;

  // 设置父级ID
  if (menuData.parentId && menuData.parentId !== '0') {
    form.parentId = menuData.parentId;
    defaultCheckedKeys.value = [menuData.parentId];
    checkedKeys.value = [...defaultCheckedKeys.value];
    expandedKeys.value = [...checkedKeys.value];
  }

  // 获取菜单树
  getMenuTree(menuData.sysId);
};

// 展开所有节点
const expandAll = () => {
  expandedKeys.value = [...allTreeKeys.value];
};

// 折叠所有节点
const closeAll = () => {
  expandedKeys.value = [];
};

// 开启父子节点关联
const enableRelate = () => {
  checkStrictly.value = false;
};

// 关闭父子节点关联
const disableRelate = () => {
  checkStrictly.value = true;
};

// 选择图标
const handleIconChoose = (value) => {
  menu.icon = value;
  showIcons.value = false;
};

// 删除图标
const deleteIcon = () => {
  menu.icon = '';
};

// 获取图标组件
const getIconComponent = (iconName) => {
  if (!iconName) {
    console.log('图标名称为空');
    return null;
  }

  console.log('尝试解析图标:', iconName);

  // 输出可用的图标列表，帮助调试
  console.log('可用图标列表示例:', Object.keys(AntIcons).slice(0, 10));

  // 首先尝试直接匹配
  if (AntIcons[iconName]) {
    console.log('直接匹配成功:', iconName);
    return AntIcons[iconName];
  }

  // 尝试转换成Outlined后缀形式匹配
  const outlinedName = iconName.charAt(0).toUpperCase() + iconName.slice(1) + 'Outlined';
  if (AntIcons[outlinedName]) {
    console.log('Outlined后缀匹配成功:', outlinedName);
    return AntIcons[outlinedName];
  }

  // 尝试全部首字母大写
  const capitalizedName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  if (AntIcons[capitalizedName]) {
    console.log('首字母大写匹配成功:', capitalizedName);
    return AntIcons[capitalizedName];
  }

  // 尝试 XXXFilled 格式
  const filledName = iconName.charAt(0).toUpperCase() + iconName.slice(1) + 'Filled';
  if (AntIcons[filledName]) {
    console.log('Filled后缀匹配成功:', filledName);
    return AntIcons[filledName];
  }

  // 尝试 XXXTwoTone 格式
  const twoToneName = iconName.charAt(0).toUpperCase() + iconName.slice(1) + 'TwoTone';
  if (AntIcons[twoToneName]) {
    console.log('TwoTone后缀匹配成功:', twoToneName);
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

  if (iconMap[iconName.toLowerCase()]) {
    const mappedIcon = iconMap[iconName.toLowerCase()];
    console.log('映射匹配成功:', iconName, '->', mappedIcon);
    return AntIcons[mappedIcon];
  }

  console.warn('找不到图标组件:', iconName);
  // 默认返回一个问号图标，避免渲染失败
  return AntIcons['QuestionCircleOutlined'];
};

// 子系统变化
const handleSubsystemChange = (value) => {
  // 更新系统ID
  menu.sysId = value;
  form.subsystem = value;
  console.log('子系统已变更，当前选择系统ID:', value);

  // 清空上级菜单选择，因为切换系统后上级菜单列表会变化
  form.parentId = undefined;

  // 系统变更后重新获取对应系统的菜单树
  getMenuTree(value);
};
</script>

<style scoped>
.drawer-footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  left: 0;
  background: #fff;
}

.icon-selector {
  display: flex;
  align-items: center;
}

.icon-wrapper {
  display: inline-block;
  padding: 8px 12px;
  border: 1px dashed #d9d9d9;
  cursor: pointer;
  border-radius: 4px;
  min-width: 40px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.icon-name {
  font-size: 12px;
  color: #666;
  margin-left: 8px;
}

.ml-2 {
  margin-left: 8px;
}
</style>
