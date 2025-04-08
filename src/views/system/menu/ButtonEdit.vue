<template>
  <div>
    <zb-drawer
      title="编辑按钮"
      :width="600"
      v-model:visible="visible"
      :body-style="{ paddingBottom: '80px' }"
      @close="onClose"
      @confirm="handleSubmit"
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
            :replaceFields="{ title: 'name', key: 'id', value: 'id' }"
            allow-clear
            disabled
          />
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
            disabled
          >
            <a-select-option v-for="item in subsystemOptions" :key="item.value" :value="item.value">
              {{ item.text }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </zb-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import { useRequest, handleResponse } from '@/utils/request';
import { useUserStore } from '@/stores/user';

// 获取请求方法
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
const defaultCheckedKeys = ref([]);
const allTreeKeys = ref([]);
const autoExpandParent = ref(true);
const checkStrictly = ref(true);

// 表单数据
const form = reactive({
  parentId: undefined,
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
    // 获取当前用户ID
    const userId = userStore.user?.id || '';
    const { data } = await get(`/auth/sys/selectSysList?userId=${userId}`)
    if (handleResponse(data, null, '获取子系统列表失败') && data.obj) {
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

// 定义事件
const emit = defineEmits(['close', 'success']);

// 计算属性 - 菜单树
const menuTree = computed(() => menuTreeData.value);

// 获取菜单树
const getMenuTree = async () => {
  menuTreeKey.value = Date.now(); // 强制重新渲染

  try {
    // 传递系统ID参数，添加type=0表示获取菜单类型
    const { data } = await get(`auth/menu?type=0&sysId=${form.sysId || ''}`)
    menuTreeData.value = data.obj.rows.children
    // 保存所有树节点ID，用于展开/折叠全部功能
    allTreeKeys.value = data.obj.ids
  } catch (error) {
    console.error('获取菜单树失败', error)
    menuTreeData.value = []
  }
}

// 系统选择变化
const handleSysChange = (value) => {
  form.sysId = value
  // 系统变更后重新获取菜单树
  getMenuTree()
}

// 设置表单值
const setFormValues = (formData) => {
  console.log("button", formData)

  // 设置基本字段
  form.menuId = formData.id
  form.name = formData.text || formData.name  // 正确设置按钮名称
  form.perms = formData.permission || formData.perms
  form.orderNum = formData.order || formData.orderNum
  form.sysId = formData.sysId
  form.subsystem = formData.sysId  // 同步设置子系统

  // 设置父级菜单
  if (formData.parentId) {
    form.parentId = formData.parentId  // 直接设置父级菜单ID
    defaultCheckedKeys.value = [formData.parentId]
    checkedKeys.value = [...defaultCheckedKeys.value]
    expandedKeys.value = [...checkedKeys.value]
  }

  // 获取菜单树
  getMenuTree()
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate().then(async (valid) => {
    if (valid) {
      // 处理选中的父级菜单
      const checkedArr = Array.isArray(checkedKeys.value)
        ? checkedKeys.value
        : (checkedKeys.value.checked || [])

      // 验证选择
      if (!checkedArr.length) {
        message.error("请为按钮选择一个上级菜单")
        return
      }

      if (checkedArr.length > 1) {
        message.error("最多只能选择一个上级菜单，请修改")
        return
      }

      loading.value = true

      // 构造提交数据
      const buttonData = {
        menuId: form.menuId,
        menuName: form.name,
        perms: form.perms,
        orderNum: form.orderNum,
        sysId: form.sysId,
        // 0 表示菜单 1 表示按钮
        type: "1",
        parentId: checkedArr[0]
      }

      try {
        // 与Vue2项目一致的API调用
        const { data } = await post("auth/menu/update", buttonData)

        if (handleResponse(data, null, '修改按钮失败')) {
          // 关闭抽屉
          visible.value = false;
          // 重置表单并通知父组件
          nextTick(() => {
            resetForm();
            emit('success');
          });
        }
      } catch (error) {
        console.error("修改按钮失败", error)
        message.error("修改按钮失败")
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
  formRef.value?.resetFields()
  loading.value = false
  menuTreeKey.value = Date.now()
  expandedKeys.value = []
  checkedKeys.value = []
  defaultCheckedKeys.value = []
  Object.keys(form).forEach(key => {
    if (typeof form[key] === 'string') {
      form[key] = ''
    } else if (typeof form[key] === 'boolean') {
      form[key] = false
    } else if (Array.isArray(form[key])) {
      form[key] = []
    } else {
      form[key] = undefined
    }
  })
}

// 关闭抽屉
const onClose = () => {
  // 确保抽屉状态设置为关闭
  visible.value = false;

  // 使用nextTick确保DOM更新后再重置表单
  nextTick(() => {
    resetForm();
    emit('close');
    console.log('按钮编辑抽屉已关闭');
  });
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
  // 先重置表单，再打开抽屉
  resetForm();
  visible.value = true;

  if (record) {
    // 设置表单值
    setFormValues(record);
    console.log('已加载按钮数据:', record);
  }
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
</style>
