<template>
  <a-drawer
    title="修改用户"
    :maskClosable="false"
    width="650"
    placement="right"
    :closable="false"
    @close="onClose"
    :open="userEditVisiable"
    style="height: calc(100%);overflow: auto;padding-bottom: 53px;"
  >
    <a-form ref="formRef" :model="user" :rules="rules">
      <a-form-item label="用户名" v-bind="formItemLayout">
        <a-input v-model:value="user.loginName" readonly />
      </a-form-item>
      <a-form-item label="姓名" name="userName" v-bind="formItemLayout">
        <a-input v-model:value="user.userName" />
      </a-form-item>
      <a-form-item label="邮箱" name="email" v-bind="formItemLayout">
        <a-input v-model:value="user.email" />
      </a-form-item>
      <a-form-item label="手机" name="userPhone" v-bind="formItemLayout">
        <a-input v-model:value="user.userPhone" />
      </a-form-item>
      <a-form-item label="角色" name="roleIds" v-bind="formItemLayout">
        <a-tree-select
          v-model:value="user.roleIds"
          show-search
          style="width: 100%"
          :dropdown-style="{ maxHeight: '220px', overflow: 'auto' }"
          :tree-data="roleData"
          placeholder="请选择角色"
          allow-clear
          tree-default-expand-all
          tree-checkable
          :fieldNames="{ label: 'title', value: 'value', children: 'children' }"
        />
      </a-form-item>
      <a-form-item label="部门" name="stationsId" v-bind="formItemLayout">
        <a-tree-select
          v-model:value="user.stationsId"
          show-search
          style="width: 100%"
          :dropdown-style="{ maxHeight: '220px', overflow: 'auto' }"
          :tree-data="deptTreeData"
          placeholder="请选择部门"
          allow-clear
          tree-default-expand-all
          :fieldNames="{ label: 'title', value: 'value', children: 'children' }"
        />
      </a-form-item>
      <a-form-item label="状态" name="userStatus" v-bind="formItemLayout">
        <a-radio-group v-model:value="user.userStatus">
          <a-radio value="2">锁定</a-radio>
          <a-radio value="1">有效</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="性别" name="sex" v-bind="formItemLayout">
        <a-radio-group v-model:value="user.sex">
          <a-radio value="1">男</a-radio>
          <a-radio value="2">女</a-radio>
          <a-radio value="3">保密</a-radio>
        </a-radio-group>
      </a-form-item>
      <div class="drawer-bootom-button">
        <a-button style="margin-right: 8px" @click="onClose">取消</a-button>
        <a-button type="primary" @click="handleSubmit">提交</a-button>
      </div>
    </a-form>
  </a-drawer>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useRequest, handleResponse, sysDataFilter } from '@/utils/request'

// 获取API请求方法
const { get, post } = useRequest()

// 定义Props和事件
const props = defineProps({
  userEditVisiable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])

// 表单引用
const formRef = ref(null)

// 表单布局
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 }
}

// 提交状态
const loading = ref(false)

// 用户数据
const user = reactive({
  id: '',
  loginName: '',
  userName: '',
  email: '',
  userPhone: '',
  roleIds: [],
  stationsId: [],
  userStatus: '1',
  sex: '1'
})

// 验证规则
const rules = {
  userName: [
    { required: true, message: '姓名不能为空', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' },
    { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
  ],
  userPhone: [
    { pattern: '^0?(13[0-9]|15[012356789]|17[013678]|18[0-9]|14[57])[0-9]{8}$', message: '请输入正确的手机号', trigger: 'blur' }
  ],
  roleIds: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  userStatus: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ],
  sex: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ]
}

// 角色和部门数据
const roleData = ref([])
const deptTreeData = ref([])

// 监听抽屉显示状态变化
watch(() => props.userEditVisiable, (newVal) => {
  if (newVal) {
    // 抽屉打开时获取数据
    fetchRoles()
    fetchDepts()
  }
}, { immediate: true })

// 获取角色数据
const fetchRoles = () => {
  get('auth/role/roleTree').then(r => {
    console.log('角色数据响应原始数据:', r)
    console.log('角色数据响应JSON:', JSON.stringify(r.data))
    try {
      // 直接从响应数据中提取角色列表
      let roleList = [];

      if (r.data && r.data.data) {
        const rootNode = r.data.data;
        console.log('角色根节点:', rootNode);

        // 判断是否有children结构
        if (rootNode.children && Array.isArray(rootNode.children)) {
          roleList = rootNode.children;
        } else {
          // 如果没有children，可能角色数据直接在根节点
          roleList = [rootNode];
        }
      }

      // 如果有效角色列表不为空，则格式化数据
      if (roleList && roleList.length > 0) {
        roleData.value = formatRoleTreeData(roleList);
        console.log('格式化后的角色数据:', roleData.value);
      } else {
        console.warn('无法从响应中提取有效角色数据');
        fetchRolesLegacy();
      }
    } catch (err) {
      console.error('处理角色数据时出错:', err);
      fetchRolesLegacy();
    }
  }).catch(error => {
    console.error('获取角色数据失败', error);
    message.error('获取角色数据失败');
    fetchRolesLegacy();
  });
};

// 使用备用接口获取角色数据
const fetchRolesLegacy = () => {
  get('auth/role').then(r => {
    console.log('备用角色数据响应:', r)
    try {
      let roleList = []

      if (r.data && r.data.obj && Array.isArray(r.data.obj.rows)) {
        roleList = r.data.obj.rows
      } else if (r.data && Array.isArray(r.data.rows)) {
        roleList = r.data.rows
      } else if (r.data && Array.isArray(r.data)) {
        roleList = r.data
      }

      if (Array.isArray(roleList) && roleList.length > 0) {
        roleData.value = formatRoleTreeData(roleList)
        console.log('备用格式化后的角色数据:', roleData.value)
      } else {
        console.warn('备用角色数据为空或格式不正确')
        roleData.value = []
        message.warning('获取角色数据失败，请联系管理员')
      }
    } catch (err) {
      console.error('处理备用角色数据时出错:', err)
      roleData.value = []
      message.error('处理角色数据失败')
    }
  }).catch(error => {
    console.error('获取备用角色数据失败', error)
    message.error('获取角色数据失败')
  })
}

// 获取部门数据
const fetchDepts = () => {
  get('auth/dept').then(r => {
    console.log('部门数据响应原始数据:', r);
    console.log('部门数据响应JSON:', JSON.stringify(r.data));
    try {
      // 直接从响应数据中提取部门列表
      let deptList = [];

      if (r.data && r.data.obj && r.data.obj.rows) {
        const rootNode = r.data.obj.rows;
        console.log('部门根节点:', rootNode);

        // 判断是否有children结构
        if (rootNode.children && Array.isArray(rootNode.children)) {
          deptList = rootNode.children;
        } else {
          // 如果没有children，可能部门数据直接在根节点
          deptList = [rootNode];
        }
      }

      // 如果有效部门列表不为空，则格式化数据
      if (deptList && deptList.length > 0) {
        deptTreeData.value = formatDeptTreeData(deptList);
        console.log('格式化后的部门数据:', deptTreeData.value);
      } else {
        console.warn('无法从响应中提取有效部门数据');
        fetchDeptsLegacy();
      }
    } catch (err) {
      console.error('处理部门数据时出错:', err);
      fetchDeptsLegacy();
    }
  }).catch(error => {
    console.error('获取部门数据失败', error);
    message.error('获取部门数据失败');
    fetchDeptsLegacy();
  });
};

// 使用Vue2版本的接口路径获取部门数据
const fetchDeptsLegacy = () => {
  get('auth/dept').then(r => {
    console.log('部门数据响应(legacy):', r)
    try {
      let deptData = []
      if (r.data && r.data.obj) {
        if (r.data.obj.rows) {
          if (r.data.obj.rows.children === undefined) {
            deptData = r.data.obj.rows
          } else {
            deptData = r.data.obj.rows.children
          }
        } else if (Array.isArray(r.data.obj)) {
          // 有些接口直接返回数组
          deptData = r.data.obj
        }
      } else if (r.data && Array.isArray(r.data.rows)) {
        // 另一种可能的数据结构
        deptData = r.data.rows
      } else if (r.data && Array.isArray(r.data)) {
        // 直接是数组的情况
        deptData = r.data
      }

      if (Array.isArray(deptData) && deptData.length > 0) {
        deptTreeData.value = formatDeptTreeData(deptData)
        console.log('备用路径格式化后的部门数据:', deptTreeData.value)
      } else {
        console.warn('获取的部门数据为空或格式不正确')
        deptTreeData.value = []
        message.warning('获取部门数据失败，请联系管理员')
      }
    } catch (err) {
      console.error('处理部门数据时出错:', err)
      deptTreeData.value = []
      message.error('处理部门数据失败')
    }
  }).catch(error => {
    console.error('备用路径获取部门数据也失败', error)
    message.error('获取部门数据失败')
    deptTreeData.value = []
  })
}

// 格式化角色树数据
const formatRoleTreeData = (roles) => {
  if (!Array.isArray(roles)) {
    console.warn('角色数据不是数组:', roles);
    return [];
  }

  return roles.map(role => {
    // 提取必要的字段，根据截图中的实际字段名进行调整
    const node = {
      title: role.title || role.text || role.roleName || '未命名角色',
      value: String(role.value || role.key || role.roleId || role.id || ''),
      key: String(role.key || role.roleId || role.id || ''),
      disabled: true // 第一级节点设置为禁用
    };

    // 递归处理子节点，子节点可选
    if (role.children && Array.isArray(role.children) && role.children.length > 0) {
      node.children = role.children.map(child => {
        return {
          title: child.title || child.text || child.roleName || '未命名角色',
          value: String(child.value || child.key || child.roleId || child.id || ''),
          key: String(child.key || child.roleId || child.id || ''),
          disabled: false // 子节点可选
        };
      });
    }

    return node;
  });
};

// 格式化部门树数据
const formatDeptTreeData = (depts) => {
  if (!Array.isArray(depts)) {
    console.warn('部门数据不是数组格式', depts);
    return [];
  }

  return depts.map(dept => {
    // 提取必要的字段，根据截图中的实际字段名进行调整
    const node = {
      title: dept.title || dept.text || dept.deptName || '未命名部门',
      value: String(dept.value || dept.key || dept.id || ''),
      key: String(dept.key || dept.id || ''),
      disabled: true // 第一级节点设置为禁用
    };

    // 递归处理子节点，子节点可选
    if (dept.children && Array.isArray(dept.children) && dept.children.length > 0) {
      node.children = dept.children.map(child => {
        return {
          title: child.title || child.text || child.deptName || '未命名部门',
          value: String(child.value || child.key || child.id || ''),
          key: String(child.key || child.id || ''),
          disabled: false // 子节点可选
        };
      });
    }

    return node;
  });
};

// 设置表单值
const setFormValues = (record) => {
  console.log('设置表单值:', record)
  Object.keys(user).forEach(key => {
    if (record[key] !== undefined) {
      // 处理角色和部门 - 从字符串转为数组
      if (key === 'roleIds' && typeof record[key] === 'string') {
        user[key] = record[key].split(',')
        console.log('角色IDs:', user[key])
      } else if (key === 'stationsId' && typeof record[key] === 'string') {
        // 部门是单选，不需要拆分成数组
        user[key] = record[key]
        console.log('部门ID:', user[key])
      } else {
        user[key] = record[key]
      }
    }
  })

  // 处理用户状态和性别
  if (typeof user.userStatus === 'number') {
    user.userStatus = String(user.userStatus)
  }

  if (typeof user.sex === 'number') {
    user.sex = String(user.sex)
  }
}

// 提交表单
const handleSubmit = () => {
  formRef.value.validate().then(() => {
    // 检查是否选择了角色
    if (!user.roleIds || user.roleIds.length === 0) {
      message.error('请选择角色')
      return
    }

    // 处理提交数据
    const values = { ...user }

    // 处理数组类型为字符串
    if (Array.isArray(values.roleIds)) {
      values.roleIds = values.roleIds.join(',')
    }

    // 部门是单选，可能已经是字符串，确保类型正确
    if (values.stationsId === null || values.stationsId === undefined) {
      values.stationsId = ''
    } else if (Array.isArray(values.stationsId)) {
      // 兼容处理，如果是数组取第一个值
      values.stationsId = values.stationsId.length > 0 ? values.stationsId[0] : ''
    } else {
      // 确保是字符串
      values.stationsId = String(values.stationsId)
    }

    console.log('提交用户数据:', values)

    // 提交到API
    loading.value = true
    post('auth/user/update', values).then(r => {
      if (handleResponse(r.data, null, '修改用户失败')) {
        emit('success')
        resetForm()
      }
    }).catch(error => {
      console.error('修改用户失败', error)
      message.error('修改用户失败')
    }).finally(() => {
      loading.value = false
    })
  }).catch(err => {
    console.log('验证失败', err)
  })
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
  Object.keys(user).forEach(key => {
    if (Array.isArray(user[key])) {
      user[key] = []
    } else if (typeof user[key] === 'boolean') {
      user[key] = false
    } else if (typeof user[key] === 'string') {
      user[key] = ''
    }
  })
  user.userStatus = '1'
  user.sex = '1'
}

// 关闭抽屉
const onClose = () => {
  resetForm()
  emit('close')
}

// 导出方法给外部组件调用
defineExpose({
  setFormValues
})
</script>

<style lang="less" scoped>
.drawer-bootom-button {
  position: absolute;
  bottom: 0;
  width: 100%;
  border-top: 1px solid #e8e8e8;
  padding: 10px 16px;
  text-align: right;
  left: 0;
  background: #fff;
  border-radius: 0 0 2px 2px;
}
</style>
