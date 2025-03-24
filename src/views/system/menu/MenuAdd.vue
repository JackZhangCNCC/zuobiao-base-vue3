<template>
  <div>
    <a-drawer
      :title="parentMenu ? `新增${parentMenu.name}的子菜单` : '新增菜单'"
      :width="600"
      :open="visible"
      :body-style="{ paddingBottom: '80px' }"
      :maskClosable="false"
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
            :disabled="!!parentMenu"
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
          <a-input
            v-model:value="form.icon"
            placeholder="点击选择图标"
            @click="showIconSelect"
            readonly
          >
            <template #prefix>
              <component :is="getIconComponent(form.icon)" v-if="form.icon" />
              <template v-else>
                <span class="ant-input-prefix">
                  <span role="img" aria-label="plus" class="anticon anticon-plus">
                    <svg viewBox="64 64 896 896" data-icon="plus" width="1em" height="1em" fill="currentColor" aria-hidden="true" focusable="false" class="">
                      <defs></defs>
                      <path d="M482 152h60q8 0 8 8v704q0 8-8 8h-60q-8 0-8-8V160q0-8 8-8z"></path>
                      <path d="M176 474h672q8 0 8 8v60q0 8-8 8H176q-8 0-8-8v-60q0-8 8-8z"></path>
                    </svg>
                  </span>
                </span>
              </template>
            </template>
          </a-input>
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
            :disabled="!!parentMenu"
          >
            <a-select-option v-for="item in subsystemOptions" :key="item.value" :value="item.value">
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
    <Icons ref="iconsRef" @select="handleIconSelect" />
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, computed, watchEffect } from 'vue';
import { message } from 'ant-design-vue';
import { useRequest, handleResponse, handleMenuResponse } from '../../../utils/request';
import { useUserStore } from '../../../stores/user';
import Icons from './Icons.vue';
import * as AntIcons from '@ant-design/icons-vue';

// 获取API请求方法
const { get, post } = useRequest();
// 获取用户存储
const userStore = useUserStore();

// 抽屉状态
const visible = ref(false);
const loading = ref(false);

// 表单引用
const formRef = ref(null);
const iconsRef = ref(null);

// 菜单树状态
const menuTreeData = ref([]);
const menuTreeKey = ref(Date.now());
const expandedKeys = ref([]);
const checkedKeys = ref([]);
const allTreeKeys = ref([]);
const autoExpandParent = ref(true);
const checkStrictly = ref(true);

// 计算属性 - 菜单树
const menuTree = computed(() => menuTreeData.value);

// 菜单表单数据
const menu = reactive({
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

// 定义事件
const emit = defineEmits(['close', 'success']);

// 状态变量
const parentMenu = ref(null);
const form = reactive({
  parentId: undefined,
  type: 'M',
  name: '',
  component: '',
  path: '',
  perms: '',
  icon: '',
  orderNum: 0,
  visible: '0',
  subsystem: undefined  // 修改这里，默认为undefined而不是固定值'1'
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

// 获取子系统列表
const getSubsystemList = async () => {
  try {
    const { data } = await get('auth/sys/selectSysList')
    if (handleResponse(data, null, '获取子系统列表失败') && data.obj) {
      subsystemOptions.value = data.obj.map(item => ({
        value: item.sysId,
        text: item.sysName
      }))

      // 设置默认系统ID - 使用用户当前的系统ID
      const userSysId = userStore.user?.sysId;
      if (userSysId && subsystemOptions.value.some(option => option.value === userSysId)) {
        // 如果用户系统ID在选项中，使用用户系统ID
        menu.sysId = userSysId;
        form.subsystem = userSysId;
      } else if (data.obj.length > 0) {
        // 否则使用第一个系统ID
        menu.sysId = data.obj[0].sysId;
        form.subsystem = data.obj[0].sysId;
      }

      // 系统ID设置后，立即加载菜单树
      if (form.subsystem) {
        getMenuTree(form.subsystem);
      }
    }
  } catch (error) {
    console.error('获取子系统列表失败', error)
  }
}

// 打开抽屉
const open = async (parent) => {
  // 先重置表单，确保表单状态清空
  resetForm();

  // 设置打开状态
  visible.value = true;

  // 如果传入了父级菜单，则设置父级
  if (parent) {
    parentMenu.value = parent;
    form.parentId = parent.id;

    // 子菜单时自动设置子系统与父菜单一致
    if (parent.sysId) {
      form.subsystem = parent.sysId;
      menu.sysId = parent.sysId;
      console.log('根据父菜单自动设置系统ID:', parent.sysId);
    }
  }

  // 获取菜单树，传递当前选择的系统ID
  await getMenuTree(form.subsystem);

  console.log('菜单抽屉已打开');
};

// 获取菜单树数据
const getMenuTree = async (sysId) => {
  menuTreeKey.value = Date.now() // 强制重新渲染

  try {
    // 确保系统ID有效，优先使用传入的sysId参数
    const currentSysId = sysId || form.subsystem || menu.sysId || '';
    if (!currentSysId) {
      console.warn('未指定系统ID，菜单树将为空');
      menuTreeData.value = [];
      return;
    }

    // 传递系统ID参数，添加type=0表示获取菜单类型
    const { data } = await get(`auth/menu?type=0&sysId=${currentSysId}`)

    // 与Vue2项目保持一致的数据处理逻辑
    if (handleResponse(data)) {
      if (data.obj && data.obj.rows && data.obj.rows.children) {
        menuTreeData.value = data.obj.rows.children;
        // 保存所有树节点ID，用于展开/折叠全部功能
        allTreeKeys.value = data.obj.ids || [];
      } else {
        console.warn('菜单树数据结构异常', data);
        menuTreeData.value = [];
      }
    } else {
      menuTreeData.value = [];
    }
  } catch (error) {
    console.error('获取菜单树失败', error)
    menuTreeData.value = []
  }
}

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

// 重置表单
const resetForm = () => {
  // 调用表单组件的重置方法
  formRef.value?.resetFields()

  // 重置状态变量
  loading.value = false
  menuTreeKey.value = Date.now()
  expandedKeys.value = []
  checkedKeys.value = []
  parentMenu.value = null

  // 重置menu对象
  Object.keys(menu).forEach(key => {
    if (typeof menu[key] === 'string') {
      menu[key] = ''
    } else if (typeof menu[key] === 'boolean') {
      menu[key] = false
    } else if (Array.isArray(menu[key])) {
      menu[key] = []
    } else {
      menu[key] = undefined
    }
  })

  // 重置form对象到初始状态
  form.parentId = undefined
  form.type = 'M'
  form.name = ''
  form.component = ''
  form.path = ''
  form.perms = ''
  form.icon = ''
  form.orderNum = 0
  form.visible = '0'
  // 不重置subsystem，因为它应该保持当前选择的系统
}

// 关闭抽屉
const onClose = () => {
  // 确保抽屉状态设置为关闭
  visible.value = false;

  // 使用nextTick确保DOM更新后再重置表单
  nextTick(() => {
    resetForm();
    emit('close');
    console.log('菜单抽屉已关闭');
  });
};

// 展开所有节点
const expandAll = () => {
  expandedKeys.value = [...allTreeKeys.value]
}

// 折叠所有节点
const closeAll = () => {
  expandedKeys.value = []
}

// 选择图标
const handleIconChoose = (value) => {
  menu.icon = value
  showIcons.value = false
}

// 删除图标
const deleteIcon = () => {
  menu.icon = ''
}

// 提交表单
const onSubmit = () => {
  formRef.value.validate().then(async (valid) => {
    if (valid) {
      // 确保系统ID已设置
      if (!form.subsystem) {
        message.error('请选择子系统');
        return;
      }

      loading.value = true

      // 检查是否选择了多个上级菜单，兼容树选择器两种模式
      const checkedArr = Object.prototype.hasOwnProperty.call(checkedKeys.value, 'checked')
        ? checkedKeys.value.checked
        : checkedKeys.value

      if (checkedArr.length > 1) {
        message.error('最多只能选择一个上级菜单，请修改')
        loading.value = false
        return
      }

      // 设置父级ID
      if (checkedArr.length) {
        menu.parentId = checkedArr[0]
      } else {
        menu.parentId = form.parentId || ''
      }

      // 更新menu对象的值
      menu.menuName = form.name
      menu.path = form.path
      menu.component = form.component
      menu.perms = form.perms
      // icon已经在选择图标时更新
      menu.orderNum = form.orderNum
      menu.sysId = form.subsystem
      menu.hidden = form.visible === '1'
      // 类型：0表示菜单，1表示按钮
      menu.type = '0'

      // 处理外部链接URL
      if (menu.isFrame === '1' && menu.path) {
        if (!menu.path.startsWith('http://') && !menu.path.startsWith('https://')) {
          menu.path = 'http://' + menu.path
        }
      }

      try {
        // 直接发送整个menu对象，与Vue2项目保持一致
        const response = await post("auth/menu", menu)

        // 使用专门针对菜单接口的响应处理函数
        if (handleMenuResponse(response, '新增菜单成功')) {
          resetForm()
          visible.value = false // 确保关闭抽屉
          emit('success')
        } else {
          loading.value = false
        }
      } catch (error) {
        console.error("新增菜单失败", error)
        message.error("新增菜单失败")
        loading.value = false
      }
    }
  }).catch(error => {
    console.log("表单验证失败", error)
  })
}

// 处理菜单类型变化
const handleTypeChange = (e) => {
  form.type = e.target.value;
  if (form.type === 'M') {
    form.component = '';
  }
};

// 显示图标选择器
const showIconSelect = () => {
  iconsRef.value?.open();
};

// 处理图标选择
const handleIconSelect = (icon) => {
  console.log('选择的图标:', icon);
  form.icon = icon;
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

// 子系统变化
const handleSubsystemChange = (value) => {
  // 如果值未变化，不做处理
  if (value === menu.sysId) return;

  // 更新系统ID
  menu.sysId = value;
  form.subsystem = value;
  console.log('子系统已变更，当前选择系统ID:', value);

  // 清空上级菜单选择，因为切换系统后上级菜单列表会变化
  form.parentId = undefined;

  // 系统变更后重新获取对应系统的菜单树
  getMenuTree(value);
}

// 初始化数据
onMounted(() => {
  getSubsystemList();
});

// 暴露方法给父组件调用
defineExpose({
  open
});
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
}

.icon-wrapper:hover {
  border-color: #1890ff;
  color: #1890ff;
}
</style>
