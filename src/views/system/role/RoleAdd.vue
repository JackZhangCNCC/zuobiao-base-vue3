<template>
  <zb-drawer
    title="新增角色"
    :maskClosable="false"
    width="650"
    placement="right"
    :closable="true"
    @close="onClose"
    :visible="roleAddVisiable"
    @update:visible="val => val === false && onClose()"
    style="height: calc(100% - 55px);overflow: auto;padding-bottom: 53px;"
    :hideFooter="true"
  >
    <a-form ref="formRef" :model="role" :rules="rules">
      <a-form-item
        label="角色名称"
        name="roleName"
        :validate-status="validateStatus"
        :help="help"
        v-bind="formItemLayout"
      >
        <a-input
          @blur="handleRoleNameBlur"
          v-model:value="role.roleName"
        />
      </a-form-item>
      <a-form-item label="角色描述" name="remark" v-bind="formItemLayout">
        <a-textarea
          :rows="4"
          v-model:value="role.remark"
        >
        </a-textarea>
      </a-form-item>
      <a-form-item label="子系统" name="sysId" v-bind="formItemLayout">
        <a-select
          style="width: 100%"
          v-model:value="role.sysId"
          @change="purposeSelect"
        >
          <a-select-option v-for="item in selectList" :key="item.sysId">
            {{ item.sysName }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item
        label="权限选择"
        style="margin-bottom: 2rem"
        :validate-status="menuSelectStatus"
        :help="menuSelectHelp"
        v-bind="formItemLayout"
      >
        <a-tree
          :key="menuTreeKey"
          ref="menuTreeRef"
          :checkable="true"
          :check-strictly="checkStrictly"
          @check="handleCheck"
          @expand="handleExpand"
          :expanded-keys="expandedKeys"
          :tree-data="menuTreeData"
        >
        </a-tree>
      </a-form-item>
    </a-form>
    <div class="drawer-bootom-button footer-btn">
      <a-dropdown
        style="float: left"
        trigger="click"
        placement="topCenter"
      >
        <template #overlay>
          <a-menu>
            <a-menu-item key="1" @click="expandAll">展开所有</a-menu-item>
            <a-menu-item key="2" @click="closeAll">合并所有</a-menu-item>
            <a-menu-item key="3" @click="enableRelate">父子关联</a-menu-item>
            <a-menu-item key="4" @click="disableRelate">取消关联</a-menu-item>
          </a-menu>
        </template>
        <a-button>
          树操作
          <up-outlined />
        </a-button>
      </a-dropdown>
      <a-popconfirm
        title="确定放弃编辑？"
        @confirm="onClose"
        ok-text="确定"
        cancel-text="取消"
      >
        <a-button style="margin-right: .8rem">取消</a-button>
      </a-popconfirm>
      <a-button @click="handleSubmit" type="primary" :loading="loading">提交</a-button>
    </div>
  </zb-drawer>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { UpOutlined } from '@ant-design/icons-vue'
import { useRequest, handleResponse } from '@/utils/request'

// 定义Props和事件
const props = defineProps({
  roleAddVisiable: {
    type: Boolean,
    default: false
  },
  selectList: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'success'])

// 表单引用
const formRef = ref(null)
const menuTreeRef = ref(null)

// 角色名称验证状态
const validateStatus = ref('')
const help = ref('')

// 菜单选择验证状态
const menuSelectStatus = ref('')
const menuSelectHelp = ref('')

// 角色数据
const role = reactive({
  roleName: '',
  remark: '',
  sysId: undefined,
  menuIds: []
})

// 验证规则
const rules = {
  roleName: [
    { required: true, message: '角色名称不能为空', trigger: 'blur' },
    { max: 20, message: '角色名称长度不能超过20个字符', trigger: 'blur' }
  ],
  remark: [
    { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
  ],
  sysId: [
    { required: true, message: '子系统不能为空', trigger: 'change' }
  ]
}

// 表单布局
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 }
}

// 树形数据
const menuTreeData = ref([])
const menuTreeKey = ref(0)
const expandedKeys = ref([])
const checkedKeys = ref([])
const selectedKeys = ref([])
const autoExpandParent = ref(true)
const checkStrictly = ref(true)

// 提交状态
const loading = ref(false)

// 获取API请求方法
const { get, post } = useRequest()

// 监听抽屉可见性变化
watch(() => props.roleAddVisiable, (visible) => {
  if (visible) {
    getMenuTree()
  }
})

// 获取菜单树
const getMenuTree = () => {
  menuTreeKey.value = Date.now() // 强制重新渲染

  // 获取菜单树
  get(`auth/menu${role.sysId ? '?sysId=' + role.sysId : ''}`).then(r => {
    menuTreeData.value = r.data.obj.rows.children
  }).catch(error => {
    console.error('获取菜单树失败', error)
    menuTreeData.value = []
  })
}

// 角色名称失去焦点时检查是否已存在
const handleRoleNameBlur = () => {
  if (!role.roleName) {
    validateStatus.value = 'error'
    help.value = '角色名称不能为空'
    return
  }

  // TODO: 实现API调用检查角色名是否存在
  // fetch(`auth/role/check/${role.roleName}`).then(r => {
  //   if (r.data.data) {
  //     validateStatus.value = 'error'
  //     help.value = '角色名已存在'
  //   } else {
  //     validateStatus.value = 'success'
  //     help.value = ''
  //   }
  // })
}

// 子系统选择变化
const purposeSelect = (value) => {
  role.sysId = value
  // 子系统变更后重新获取菜单树
  if (value) {
    getMenuTree()
  }
}

// 节点展开处理
const handleExpand = (keys, { expanded, node }) => {
  expandedKeys.value = keys
  autoExpandParent.value = false
}

// 节点选择处理
const handleCheck = (checkedKeys, e) => {
  role.menuIds = checkedKeys.checked
  if (role.menuIds.length) {
    menuSelectStatus.value = 'success'
    menuSelectHelp.value = ''
  } else {
    menuSelectStatus.value = 'error'
    menuSelectHelp.value = '权限不能为空'
  }
}

// 展开所有节点
const expandAll = () => {
  expandedKeys.value = getAllKeys()
}

// 合并所有节点
const closeAll = () => {
  expandedKeys.value = []
}

// 启用父子关联
const enableRelate = () => {
  checkStrictly.value = false
}

// 禁用父子关联
const disableRelate = () => {
  checkStrictly.value = true
}

// 获取所有节点的key
const getAllKeys = (tree = menuTreeData.value) => {
  const keys = []
  const getKeys = (items) => {
    items.forEach(item => {
      keys.push(item.key)
      if (item.children && item.children.length) {
        getKeys(item.children)
      }
    })
  }
  getKeys(tree)
  return keys
}

// 提交表单
const handleSubmit = async () => {
  try {
    // 使用formRef验证表单
    await formRef.value.validateFields();

    // 验证角色名称是否已存在
    if (validateStatus.value === 'error') {
      return
    }

    // 验证菜单选择
    if (!role.menuIds || !role.menuIds.length) {
      menuSelectStatus.value = 'error'
      menuSelectHelp.value = '权限不能为空'
      return
    }

    loading.value = true

    // 提交数据
    const values = {
      roleName: role.roleName,
      remark: role.remark,
      sysId: role.sysId,
      menuId: role.menuIds.join(',')
    }

    // 提交到API
    post('auth/role/add', values).then(r => {
      if (handleResponse(r.data, null, '新增角色失败')) {
        message.success('新增角色成功')
        emit('success')
        resetForm()
      }
    }).catch(error => {
      console.error('新增角色失败', error)
      message.error('新增角色失败')
    }).finally(() => {
      loading.value = false
    })
  } catch (error) {
    console.error('表单验证失败', error)
  }
}

// 重置表单
const resetForm = () => {
  formRef.value.resetFields()
  Object.keys(role).forEach(key => {
    if (Array.isArray(role[key])) {
      role[key] = []
    } else if (typeof role[key] === 'string') {
      role[key] = ''
    } else {
      role[key] = undefined
    }
  })
  validateStatus.value = ''
  help.value = ''
  menuSelectStatus.value = ''
  menuSelectHelp.value = ''
  expandedKeys.value = []
  checkedKeys.value = []
  selectedKeys.value = []
}

// 关闭抽屉
const onClose = () => {
  resetForm()
  emit('close')
}
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
