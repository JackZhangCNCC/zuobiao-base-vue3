<template>
  <div>
    <zb-drawer
      :title="parentMenu ? `新增${parentMenu.name}的子菜单` : '新增菜单'"
      :width="600"
      v-model:visible="visible"
      :body-style="{ paddingBottom: '80px' }"
      :maskClosable="false"
      @close="onClose"
      @confirm="onSubmit"
      :confirm-loading="loading"
    >
      <a-form :model="form" :rules="rules" ref="formRef" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="上级菜单" name="parentId">
          <template v-if="!!parentMenu">
            <a-input :value="parentMenu.name || parentMenu.text" disabled />
          </template>
          <template v-else>
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
          </template>
        </a-form-item>

        <a-form-item label="菜单名称" name="name">
          <a-input v-model:value="form.name" placeholder="请输入菜单名称" />
        </a-form-item>

        <a-form-item label="菜单类型" name="isFrame">
          <a-radio-group v-model:value="menu.isFrame" @change="handleFrameChange">
            <a-radio value="0">内部菜单</a-radio>
            <a-radio value="1">外部链接</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="组件路径" name="component" v-if="menu.isFrame === '0'">
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
              <span class="icon-container">
                <component :is="resolveIconComponent(form.icon)" v-if="form.icon" />
                <span v-else>请选择图标</span>
              </span>
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
            :disabled="!!parentMenu"
          >
            <a-select-option v-for="item in subsystemOptions" :key="item.value" :value="item.value">
              {{ item.text }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </zb-drawer>

    <!-- 图标选择器弹窗 -->
    <Icons ref="iconsRef" @select="handleIconSelect" />
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, computed, watchEffect } from 'vue';
import { message } from 'ant-design-vue';
import { useRequest, handleResponse, handleMenuResponse } from '@/utils/request';
import { useUserStore } from '@/stores/user';
import Icons from './Icons.vue';
import IconUtils from '@/utils/iconUtils';
import * as AntIcons from '@ant-design/icons-vue';
import { MenuUtils } from '@/utils/menuUtils';
import { resetObjectValues } from '@/utils/formUtils';

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
  type: 'C', // 保留该字段以兼容后端API期望的数据格式
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
    // 使用工具类获取子系统列表
    subsystemOptions.value = await MenuUtils.getSubsystemList();

    // 设置默认系统ID - 使用用户当前的系统ID
    const userSysId = userStore.user?.sysId;
    if (userSysId && subsystemOptions.value.some(option => option.value == userSysId)) {
      // 如果用户系统ID在选项中，使用用户系统ID
      menu.sysId = userSysId;
      form.subsystem = userSysId;
    } else if (subsystemOptions.value.length > 0) {
      // 否则使用第一个系统ID
      menu.sysId = subsystemOptions.value[0].value;
      form.subsystem = subsystemOptions.value[0].value;
    }

    // 系统ID设置后，立即加载菜单树
    if (form.subsystem) {
      getMenuTree(form.subsystem);
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
    // 使用工具类获取菜单树
    const { treeData, allKeys } = await MenuUtils.getMenuTree(sysId || form.subsystem || '');
    menuTreeData.value = treeData;
    allTreeKeys.value = allKeys;
  } catch (error) {
    console.error('获取菜单树失败', error)
    menuTreeData.value = []
  }
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
  resetObjectValues(menu);
  // 确保isFrame属性被正确设置
  menu.isFrame = '0';

  // 重置form对象到初始状态
  form.parentId = undefined
  form.type = 'C'
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

// 处理菜单类型变化（内部/外部链接）
const handleFrameChange = (e) => {
  menu.isFrame = e.target.value;
  
  // 如果切换为外部链接，清空组件路径
  if (menu.isFrame == '1') {
    form.component = '';
  }
};

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
      menu.hidden = form.visible == '1'
      // 类型：0表示菜单，1表示按钮
      menu.type = '0'

      // 处理外部链接URL
      if (menu.isFrame == '1' && menu.path) {
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

// 处理图标名称到组件的转换
const resolveIconComponent = (iconName) => {
  if (!iconName) return null;
  
  // 1. 尝试从导入的图标中直接获取
  if (AntIcons[iconName]) {
    return AntIcons[iconName];
  }
  
  // 2. 使用IconUtils处理
  return IconUtils.getIconComponent(iconName);
};

// 显示图标选择器
const showIconSelect = () => {
  iconsRef.value?.open();
};

// 处理图标选择
const handleIconSelect = (icon) => {
  console.log('选择的图标:', icon);
  form.icon = icon;
  menu.icon = icon; // 确保menu对象也更新图标
};

// 子系统变化
const handleSubsystemChange = (value) => {
  // 如果值未变化，不做处理
  if (value == menu.sysId) return;

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

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  min-width: 24px;
  min-height: 24px;
}

.icon-name {
  margin-left: 12px;
  color: #666;
  font-size: 14px;
}
</style> 