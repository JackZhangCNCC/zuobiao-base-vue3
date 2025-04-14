<template>
  <zb-drawer
    title="修改角色"
    :maskClosable="false"
    width="650"
    placement="right"
    :closable="true"
    @close="onClose"
    :visible="roleEditVisiable"
    @update:visible="val => val === false && onClose()"
    style="height: calc(100% - 55px);overflow: auto;padding-bottom: 53px;"
    :hideFooter="true"
  >
    <a-form ref="formRef" :model="role" :rules="rules">
      <a-form-item
        label="角色名称"
        name="roleName"
        v-bind="formItemLayout"
      >
        <a-input
          v-model:value="role.roleName"
          readonly
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
          disabled
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
          :checked-keys="checkedKeys"
          :tree-data="menuTreeData"
          @check="handleCheck"
          @expand="handleExpand"
          :expanded-keys="expandedKeys"
          :auto-expand-parent="autoExpandParent"
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
import { ref, reactive, watch, nextTick } from 'vue'
import { message } from 'ant-design-vue'
import { UpOutlined } from '@ant-design/icons-vue'
import { useRequest, handleResponse } from '@/utils/request'

// 定义Props和事件
const props = defineProps({
  roleEditVisiable: {
    type: Boolean,
    default: false
  },
  roleInfoData: {
    type: Object,
    default: () => ({})
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

// 表单布局
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 18 }
}

// 菜单选择验证状态
const menuSelectStatus = ref('')
const menuSelectHelp = ref('')

// 角色数据
const role = reactive({
  roleId: '',
  roleName: '',
  remark: '',
  sysId: undefined,
  menuIds: []
})

// 验证规则
const rules = {
  roleName: [
    { required: true, message: '角色名称不能为空', trigger: 'blur' }
  ],
  remark: [
    { max: 50, message: '长度不能超过50个字符', trigger: 'blur' }
  ],
  sysId: [
    { required: true, message: '子系统不能为空', trigger: 'change' }
  ]
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
watch(() => props.roleEditVisiable, (visible) => {
  if (visible) {
    nextTick(() => {
      setFormValues()
      getMenuTree()
    })
  }
})

// 设置表单值
const setFormValues = () => {
  if (props.roleInfoData) {
    Object.assign(role, props.roleInfoData)
  }
}

// 获取菜单树和角色菜单
const getMenuTree = () => {
  menuTreeKey.value = Date.now() // 强制重新渲染

  // 获取菜单树数据
  get(`auth/menu?sysId=${role.sysId || ''}`).then(r => {
    menuTreeData.value = r.data.obj.rows.children

    // 保存所有节点的key，用于展开所有功能
    const allKeys = getAllKeys(menuTreeData.value)
    expandedKeys.value = allKeys.slice(0, 10) // 初始展开前10个节点，提高用户体验

    // 获取角色已有权限
    get(`auth/role/menu`, {
      roleId: role.roleId
    }).then(r => {
      // 兼容处理字符串与数组类型
      const menuIds = r.data.obj || [];

      if (Array.isArray(menuIds)) {
        checkedKeys.value = menuIds;
        role.menuIds = [...menuIds];
      } else {
        const menuIdsArray = String(menuIds).split(',').filter(Boolean);
        checkedKeys.value = menuIdsArray;
        role.menuIds = [...menuIdsArray];
      }

      // 初始展开包含选中节点的父节点
      expandedKeys.value = [...checkedKeys.value];
    }).catch(error => {
      console.error('获取角色权限失败', error)
    })
  }).catch(error => {
    console.error('获取菜单树失败', error)
    menuTreeData.value = []
  })
}

// 节点展开处理
const handleExpand = (keys, { expanded, node }) => {
  expandedKeys.value = keys
  autoExpandParent.value = false
}

// 节点选择处理
const handleCheck = (checkedKeysValue, event) => {
  // 兼容处理不同情况的选中状态
  let checkedArr;
  if (typeof checkedKeysValue === 'object' && checkedKeysValue.checked !== undefined) {
    // 如果是对象形式 {checked: [...], halfChecked: [...]}
    checkedArr = checkedKeysValue.checked;
  } else {
    // 如果是直接的数组形式
    checkedArr = Array.isArray(checkedKeysValue) ? checkedKeysValue : [];
  }

  // 更新选中状态
  checkedKeys.value = [...checkedArr];
  role.menuIds = [...checkedArr];

  // 验证是否有选中项
  if (checkedArr.length) {
    menuSelectStatus.value = '';
    menuSelectHelp.value = '';
  } else {
    menuSelectStatus.value = 'error';
    menuSelectHelp.value = '请选择相应的权限';
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
    // 使用Vue3的方式验证表单
    await formRef.value.validateFields();

    // 验证菜单选择
    if (!role.menuIds || !role.menuIds.length) {
      menuSelectStatus.value = 'error'
      menuSelectHelp.value = '权限不能为空'
      return
    }

    loading.value = true

    // 处理提交数据
    const values = {
      roleId: role.roleId,
      roleName: role.roleName,
      remark: role.remark,
      sysId: role.sysId,
      menuId: role.menuIds.join(',')
    }

    // 提交到API
    post('auth/role/update', values).then(r => {
      if (handleResponse(r.data, null, '修改角色失败')) {
        message.success('修改角色成功')
        emit('success')
        resetForm()
      }
    }).catch(error => {
      console.error('修改角色失败', error)
      message.error('修改角色失败')
    }).finally(() => {
      loading.value = false
    })
  } catch (error) {
    console.error('表单验证失败', error)
    message.error('表单验证失败，请检查填写内容')
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
