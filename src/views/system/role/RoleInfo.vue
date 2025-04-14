<template>
  <zb-drawer
    title="角色信息"
    :maskClosable="false"
    width="650"
    placement="right"
    :closable="true"
    @close="close"
    :visible="roleInfoVisiable"
    @update:visible="val => val === false && close()"
    style="height: calc(100% - 55px);overflow: auto;padding-bottom: 53px;"
    :hideFooter="true"
  >
    <p>
      <crown-outlined />&nbsp;&nbsp;角色名称：{{ roleInfoData.roleName }}
    </p>
    <p :title="roleInfoData.remark">
      <book-outlined />&nbsp;&nbsp;角色描述：{{ roleInfoData.remark }}
    </p>
    <p>
      <snippets-outlined />&nbsp;&nbsp;子系统：{{ roleInfoData.sysName }}
    </p>
    <p>
      <clock-circle-outlined />&nbsp;&nbsp;创建时间：{{ roleInfoData.createTime }}
    </p>
    <p>
      <clock-circle-outlined />&nbsp;&nbsp;修改时间：{{ roleInfoData.updateTime ? roleInfoData.updateTime : "暂未修改" }}
    </p>
    <p>
      <trophy-outlined />&nbsp;&nbsp;所拥有的权限：
      <a-tree
        :key="key"
        :checkStrictly="true"
        :checkable="true"
        :defaultCheckedKeys="checkedKeys[0]"
        :defaultExpandedKeys="checkedKeys[0]"
        :treeData="menuTreeData"
      >
      </a-tree>
    </p>
  </zb-drawer>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  CrownOutlined,
  BookOutlined,
  SnippetsOutlined,
  ClockCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons-vue'
import { useRequest } from '@/utils/request'

// 定义Props
const props = defineProps({
  roleInfoVisiable: {
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

// 定义事件
const emit = defineEmits(['close'])

// 状态数据
const key = ref(Date.now())
const loading = ref(true)
const checkedKeys = ref([])
const menuTreeData = ref([])

// 获取API请求方法
const { get } = useRequest()

// 关闭抽屉
const close = () => {
  emit('close')
  checkedKeys.value = []
}

// 过滤路由树数据
const filterAsyncRouter = (tree) => {
  return tree.map(item => {
    const newItem = { ...item }
    newItem.disabled = true
    newItem.disableCheckbox = true
    if (newItem.children && newItem.children.length) {
      newItem.children = filterAsyncRouter(newItem.children)
    }
    return newItem
  })
}

// 监听抽屉可见性变化
watch(() => props.roleInfoVisiable, (visible) => {
  if (visible) {
    // 获取菜单树数据
    get('auth/menu').then(r => {
      const tree = r.data.obj.rows.children;
      menuTreeData.value = filterAsyncRouter(tree);

      // 获取角色的菜单权限
      get('auth/role/menu', {
        roleId: props.roleInfoData.roleId
      }).then(r => {
        // 与Vue2项目保持一致的数据处理逻辑
        const length = checkedKeys.value.length;
        checkedKeys.value.splice(0, length, r.data.obj);
        key.value = Date.now(); // 触发树重新渲染
      }).catch(error => {
        console.error('获取角色菜单权限失败', error);
      });
    }).catch(error => {
      console.error('获取菜单树失败', error);
    });
  }
});
</script>

<style scoped>
/* 可以根据需要添加样式 */
</style>
