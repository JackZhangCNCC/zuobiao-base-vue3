<template>
  <div>
    <a-drawer
      :title="parentMenu ? `新增${parentMenu.name}的按钮` : '新增按钮'"
      :width="600"
      :open="visible"
      :body-style="{ paddingBottom: '80px' }"
      @close="onClose"
    >
      <a-form :model="form" :rules="rules" ref="formRef" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="上级菜单" name="parentId">
          <a-input v-model:value="parentMenuName" disabled />
        </a-form-item>

        <a-form-item label="按钮名称" name="name">
          <a-input v-model:value="form.name" placeholder="请输入按钮名称" />
        </a-form-item>

        <a-form-item label="权限标识" name="perms">
          <a-input v-model:value="form.perms" placeholder="请输入权限标识" />
        </a-form-item>

        <a-form-item label="排序号" name="orderNum">
          <a-input-number v-model:value="form.orderNum" :min="0" style="width: 100%" />
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
        <a-button type="primary" @click="handleSubmit">提交</a-button>
      </div>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { useRequest, handleResponse } from '../../../utils/request';
import { useUserStore } from '../../../stores/user';

// 获取API请求方法
const { get, post } = useRequest();
// 获取用户存储
const userStore = useUserStore();

// 抽屉状态
const visible = ref(false);
const loading = ref(false);

// 表单引用
const formRef = ref(null);

// 菜单树状态
const menuTreeData = ref([]);
const menuTreeKey = ref(Date.now());
const expandedKeys = ref([]);
const checkedKeys = ref([]);
const allTreeKeys = ref([]);
const autoExpandParent = ref(true);
const checkStrictly = ref(true);

// 按钮表单数据
const button = reactive({
  menuName: '',
  perms: '',
  orderNum: 0,
  sysId: undefined,
  parentId: ''
});

// 状态变量
const parentMenu = ref(null);

// 定义事件
const emit = defineEmits(['close', 'success']);

// 表单数据
const form = reactive({
  parentId: undefined,
  type: 'F', // 按钮类型
  name: '',
  perms: '',
  orderNum: 0,
  subsystem: '1'
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入按钮名称', trigger: 'blur' }],
  perms: [{ required: true, message: '请输入权限标识', trigger: 'blur' }],
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
        text: item.sysName  // 使用text作为显示字段名称
      }))

      // 设置默认系统ID - 使用用户当前的系统ID
      const userSysId = userStore.user?.sysId;
      if (userSysId && subsystemOptions.value.some(option => option.value === userSysId)) {
        // 如果用户系统ID在选项中，使用用户系统ID
        button.sysId = userSysId;
        form.subsystem = userSysId;
      } else if (data.obj.length > 0) {
        // 否则使用第一个系统ID
        button.sysId = data.obj[0].sysId;
        form.subsystem = data.obj[0].sysId;
      }
    }
  } catch (error) {
    console.error('获取子系统列表失败', error)
  }
}

// 初始化数据
onMounted(() => {
  getSubsystemList();
});

// 计算属性 - 父级菜单名称
const parentMenuName = computed(() => {
  return parentMenu.value ? parentMenu.value.name : '';
});

// 获取菜单树
const getMenuTree = async () => {
  menuTreeKey.value = Date.now(); // 强制重新渲染

  try {
    // 传递系统ID参数，添加type=0表示获取菜单类型
    const { data } = await get(`auth/menu?type=0&sysId=${button.sysId || ''}`)
    menuTreeData.value = data.obj.rows.children
    // 保存所有树节点ID，用于展开/折叠全部功能
    allTreeKeys.value = data.obj.ids
  } catch (error) {
    console.error('获取菜单树失败', error)
    menuTreeData.value = []
  }
}

// 子系统变化处理
const handleSubsystemChange = (value) => {
  // 更新系统ID
  button.sysId = value;
  form.subsystem = value;
  console.log('子系统已变更，当前选择系统ID:', value);
}

// 系统选择变化
const handleSysChange = (value) => {
  button.sysId = value
  // 系统变更后重新获取菜单树
  getMenuTree()
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate().then(async (valid) => {
    if (valid) {
      loading.value = true

      if (!form.parentId && !parentMenu.value) {
        message.error("请为按钮选择一个上级菜单")
        loading.value = false
        return
      }

      // 构造提交数据
      const buttonData = {
        menuName: form.name,
        perms: form.perms,
        orderNum: form.orderNum,
        sysId: form.subsystem || button.sysId, // 优先使用表单中选择的系统ID
        // 0 表示菜单 1 表示按钮
        type: "1",
        parentId: form.parentId || (parentMenu.value ? parentMenu.value.id : '')
      }

      try {
        // 与Vue2项目一致的API调用
        const { data } = await post("auth/menu", buttonData)

        if (handleResponse(data, null, '新增按钮失败')) {
          // 关闭抽屉
          visible.value = false;
          // 重置表单并通知父组件
          nextTick(() => {
            resetForm();
            emit('success');
          });
        }
      } catch (error) {
        console.error("新增按钮失败", error)
        message.error("新增按钮失败")
      } finally {
        loading.value = false
      }
    }
  }).catch(error => {
    console.log("表单验证失败", error)
  })
}

// 重置表单
const resetForm = () => {
  // 先重置父菜单引用，避免引用错误
  parentMenu.value = null;

  // 调用表单组件的重置方法
  if (formRef.value) {
    formRef.value.resetFields();
  }

  // 重置状态变量
  loading.value = false;
  menuTreeKey.value = Date.now();
  menuTreeData.value = [];
  expandedKeys.value = [];
  checkedKeys.value = [];

  // 重置button对象
  Object.keys(button).forEach(key => {
    if (typeof button[key] === 'string') {
      button[key] = '';
    } else if (typeof button[key] === 'boolean') {
      button[key] = false;
    } else if (Array.isArray(button[key])) {
      button[key] = [];
    } else {
      button[key] = undefined;
    }
  });

  // 重置form对象到初始状态
  form.parentId = undefined;
  form.type = 'F';
  form.name = '';
  form.perms = '';
  form.orderNum = 0;
  // 不重置subsystem，因为它应该保持当前选择的系统
}

// 关闭抽屉
const onClose = () => {
  // 先重置状态，避免组件卸载时引用不存在的组件
  resetForm();

  // 发送关闭事件
  emit('close');

  // 最后设置visible为false关闭抽屉
  visible.value = false;

  console.log('按钮抽屉已关闭');
}

// 展开所有节点
const expandAll = () => {
  expandedKeys.value = [...allTreeKeys.value]
}

// 折叠所有节点
const closeAll = () => {
  expandedKeys.value = []
}

// 节点选择变化
const handleCheck = (keys) => {
  checkedKeys.value = keys
}

// 节点展开变化
const handleExpand = (keys) => {
  expandedKeys.value = keys
  autoExpandParent.value = false
}

// 打开抽屉
const open = (record) => {
  try {
    // 先重置表单，确保表单状态清空
    resetForm();

    // 设置打开状态
    visible.value = true;

    // 如果传入菜单记录，设置为父菜单
    if (record) {
      parentMenu.value = record;
      form.parentId = record.id || '';

      // 如果有系统ID，自动设置子系统与父菜单一致
      if (record.sysId) {
        button.sysId = record.sysId;
        form.subsystem = record.sysId;
        console.log('根据父菜单自动设置系统ID:', record.sysId);
      }
    }

    console.log('按钮抽屉已打开');
  } catch (error) {
    console.error('打开按钮抽屉时发生错误:', error);
    // 出现异常时确保状态正确
    visible.value = false;
    resetForm();
  }
}

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
</style>
