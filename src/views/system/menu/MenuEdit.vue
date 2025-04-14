<template>
  <div>
    <zb-drawer
      title="编辑菜单"
      :width="600"
      v-model:visible="visible"
      :body-style="{ paddingBottom: '80px' }"
      @close="onClose"
      @confirm="onSubmit"
      :confirm-loading="loading"
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

        <a-form-item label="菜单名称" name="menuName">
          <a-input v-model:value="form.menuName" placeholder="请输入菜单名称" />
        </a-form-item>

        <a-form-item label="菜单类型" name="isFrame">
          <a-radio-group v-model:value="form.isFrame" @change="(e) => handleMenuAttributeChange(e.target.value)">
            <a-radio value="0">内部菜单</a-radio>
            <a-radio value="1">外部链接</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="组件路径" name="component" v-if="form.isFrame === '0'">
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
                <span v-else>点击选择图标</span>
              </span>
            </span>
            <span class="icon-name ml-2" v-if="form.icon">{{ form.icon }}</span>
          </div>
        </a-form-item>

        <a-form-item label="排序号" name="orderNum">
          <a-input-number v-model:value="form.orderNum" :min="0" style="width: 100%" />
        </a-form-item>

        <a-form-item label="显示状态" name="status">
          <a-radio-group v-model:value="form.status">
            <a-radio value="0">显示</a-radio>
            <a-radio value="1">隐藏</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </zb-drawer>

    <!-- 图标选择器弹窗 -->
    <Icons ref="iconSelectRef" @select="handleIconSelect" />
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, watch, computed } from 'vue';
import Icons from './Icons.vue';
import { Modal, Tree } from 'ant-design-vue';
// 导入图标工具类，不再需要直接导入所有图标
import IconUtils from '@/utils/iconUtils';
import * as AntIcons from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { useRequest, handleResponse, handleMenuResponse } from '@/utils/request';
import { useUserStore } from '@/stores/user';
import { MenuUtils } from '@/utils/menuUtils';
import { resetObjectValues } from '@/utils/formUtils';

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
  menuType: 'C', // 保留该字段以兼容后端API期望的数据格式
  menuName: '',
  component: '',
  path: '',
  perms: '',
  icon: '',
  orderNum: 0,
  status: '0',
  isFrame: '0',
  query: '',
  isEx: '0'
});

// 表单验证规则
const rules = {
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  icon: [{ required: true, message: '请选择菜单图标', trigger: 'change' }],
  orderNum: [{ required: true, message: '请输入显示排序', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由地址', trigger: 'blur' }],
  component: [{ required: false, message: '请输入组件路径', trigger: 'blur' }],
  perms: [{ required: false, message: '请输入权限标识', trigger: 'blur' }],
};

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
    // 使用工具类获取菜单树
    const { treeData, allKeys } = await MenuUtils.getMenuTree(sysId || form.sysId || '');
    menuTreeData.value = treeData;
    allTreeKeys.value = allKeys;
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
          if (item.id == targetId) {
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
      
      // 检查是否为外部链接菜单
      if (menuInfo && menuInfo.isFrame == '1') {
        console.log('编辑的是外部链接菜单, path:', menuInfo.path);
      }

      if (menuInfo) {
        // 设置表单数据，保持字段映射一致
        form.id = menuInfo.id;
        form.parentId = menuInfo.parentId == '0' ? undefined : menuInfo.parentId;
        form.menuType = 'C'; // 固定为菜单类型
        form.menuName = menuInfo.text || menuInfo.name || menuInfo.menuName || '';
        form.component = menuInfo.component || '';
        form.path = menuInfo.path || '';
        form.perms = menuInfo.permission || menuInfo.perms || '';
        form.icon = menuInfo.icon || '';
        form.orderNum = menuInfo.order || menuInfo.orderNum || 0;
        // 处理可见状态
        form.status = menuInfo.hidden == true || menuInfo.hidden == '1' ? '1' : '0';
        form.sysId = menuInfo.sysId;
        
        // 确保isFrame值正确设置和同步
        // 先将isFrame转为字符串以确保一致性
        const isFrameValue = menuInfo.isFrame?.toString() || '0';
        form.isFrame = isFrameValue;
        menu.isFrame = isFrameValue;
        
        // 如果是外部链接，组件路径置空
        if (isFrameValue == '1') {
          form.component = '';
        }
        
        form.query = menuInfo.query || '';
        form.isEx = menuInfo.isEx || '0';

        // 设置菜单ID和其他关键属性
        menu.menuId = menuInfo.id;
        menu.sysId = menuInfo.sysId;
        menu.icon = menuInfo.icon || '';

        console.log('设置的图标名称:', form.icon);
        console.log('设置的菜单类型(isFrame):', form.isFrame);

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
  resetObjectValues(menu);
};

// 关闭抽屉
const onClose = () => {
  visible.value = false; // 确保抽屉状态设置为关闭
  resetForm();
  emit('close');
};

// 处理菜单类型变化（内部/外部链接）
const handleMenuAttributeChange = (value) => {
  console.log('菜单类型切换为:', value);
  form.isFrame = value;
  menu.isFrame = value; // 同步更新menu对象的isFrame字段
  
  // 当切换为外部链接时，清空组件路径
  if (value == '1') {
    form.component = '';
  }
};

// 提交表单
const onSubmit = async () => {
  try {
    // 表单验证
    await formRef.value.validateFields();

    // 检查是否选择了父菜单
    if (!form.parentId) {
      message.error('请选择父菜单');
      return;
    }

    // 处理请求数据
    const data = { ...form };
    
    // 修正菜单类型为字符串
    if (typeof data.menuType === 'number') {
      data.menuType = data.menuType.toString();
    }

    loading.value = true;

    try {
      // 构建完整的菜单对象，与老系统保持一致
      const updatedMenu = {
        menuId: menu.menuId,
        menuName: data.menuName,
        path: data.path,
        component: data.component,
        perms: data.perms,
        icon: form.icon,
        orderNum: data.orderNum,
        sysId: data.sysId,
        hidden: data.status == '1',
        type: data.menuType, // 保留字段以兼容后端API
        isFrame: data.isFrame,
        query: data.query,
        isEx: data.isEx,
      };

      // 设置父级ID
      if (data.parentId) {
        updatedMenu.parentId = data.parentId;
      } else if (form.parentId) {
        // 如果没有新选择的父级菜单但原始表单中有父级ID，则使用原来的父级ID
        updatedMenu.parentId = form.parentId;
      } else {
        // 只有当确实没有父级菜单时才设置为空字符串
        updatedMenu.parentId = '';
      }

      // 处理外部链接URL
      if (updatedMenu.isFrame == '1' && updatedMenu.path) {
        if (!updatedMenu.path.startsWith('http://') && !updatedMenu.path.startsWith('https://')) {
          updatedMenu.path = 'http://' + updatedMenu.path;
        }
      }

      const response = await post('auth/menu/update', updatedMenu);

      // 使用专门针对菜单接口的响应处理函数
      if (handleMenuResponse(response, null)) {
        visible.value = false; // 先关闭抽屉，再重置表单
        nextTick(() => {
          resetForm();
          emit('success');
        });
      }
    } catch (error) {
      console.error('修改菜单失败', error);
      message.error('修改菜单失败');
    } finally {
      loading.value = false;
    }
  } catch (error) {
    console.log('表单验证失败', error);
  }
};

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

// 子系统变化
const handleSubsystemChange = (value) => {
  // 更新系统ID
  menu.sysId = value;
  form.sysId = value;
  console.log('子系统已变更，当前选择系统ID:', value);

  // 清空上级菜单选择，因为切换系统后上级菜单列表会变化
  form.parentId = undefined;

  // 系统变更后重新获取对应系统的菜单树
  getMenuTree(value);
};

// 设置表单值 - 修复字段映射和初始化
const setFormValues = (menuData) => {
  visible.value = true;

  // 重置表单
  resetForm();

  // 设置表单字段，保持与Vue2项目一致的字段映射
  form.menuName = menuData.text || menuData.name;
  form.path = menuData.path || '';
  form.component = menuData.component || '';
  form.perms = menuData.permission || menuData.perms || '';
  form.icon = menuData.icon || '';
  form.orderNum = menuData.order || menuData.orderNum || 0;
  form.status = menuData.hidden ? '1' : '0';
  form.sysId = menuData.sysId;
  form.menuType = 'C'; // 固定为菜单类型
  form.isFrame = menuData.isFrame || '0';
  form.query = menuData.query || '';
  form.isEx = menuData.isEx || '0';

  // 设置菜单ID和其他关键属性
  menu.menuId = menuData.id;
  menu.sysId = menuData.sysId;
  menu.isFrame = menuData.isFrame || '0';
  menu.icon = menuData.icon || '';

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

.ml-2 {
  margin-left: 8px;
}
</style> 