<!--
  auther: Johnson
  date: 2025-04-02
  description: 树选择弹窗组件
-->
<template>
  <zb-modal
    v-model:open="modelOpen"
    :title="title"
    :width="920"
    :maskClosable="false"
    :destroyOnClose="true"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="tree-select-modal">
      <!-- 搜索框 -->
      <div class="search-bar">
        <a-input
          v-model:value="searchValue"
          placeholder="输入关键字"
          allowClear
          class="search-input"
        >
          <template #prefix>
            <search-outlined />
          </template>
        </a-input>
        
        <!-- 已选标签展示 -->
        <div class="selected-tags">
          <a-tag 
            v-for="tag in selectedTags" 
            :key="tag.value" 
            :closable="true" 
            @close="removeTag(tag.value)"
            class="selected-tag"
          >
            {{ tag.label }}
          </a-tag>
        </div>
      </div>
      
      <!-- 选择区域 -->
      <div class="selection-area">
        <!-- 全选按钮 -->
        <div class="selection-header">
          <a-checkbox 
            :checked="checkAll" 
            :indeterminate="indeterminate"
            @change="onCheckAllChange"
          >
            全选
          </a-checkbox>
        </div>
        
        <!-- 树结构 -->
        <div class="tree-container">
          <a-tree
            v-if="filteredTreeData && filteredTreeData.length > 0"
            :checkable="true"
            :check-strictly="checkStrictly"
            :tree-data="filteredTreeData"
            :checked-keys="checkedKeys"
            :expanded-keys="expandedKeys"
            :auto-expand-parent="autoExpandParent"
            @check="onCheck"
            @expand="onExpand"
          >
            <template #title="nodeProps">
              <span v-if="nodeProps.personNum">{{ nodeProps.title }} ({{ nodeProps.personNum }})</span>
              <span v-else>{{ nodeProps.title }}</span>
            </template>
          </a-tree>
          <div v-else class="empty-tree">
            <a-empty description="暂无数据" />
          </div>
        </div>
      </div>
    </div>
  </zb-modal>
</template>

<script>
import { ref, computed, watch } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import ZbModal from './zb-modal.vue';

export default {
  name: 'ZbTreeSelectModal',
  components: {
    ZbModal,
    SearchOutlined
  },
  props: {
    // 弹窗是否显示
    open: {
      type: Boolean,
      default: false
    },
    // 弹窗标题
    title: {
      type: String,
      default: '选择'
    },
    // 树结构数据
    data: {
      type: Array,
      default: () => []
    },
    // 默认选中的值
    selectedValues: {
      type: Array,
      default: () => []
    },
    // 是否严格检查父子节点
    checkStrictly: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:open', 'confirm', 'cancel'],
  setup(props, { emit }) {
    // 内部管理弹窗状态
    const modelOpen = computed({
      get: () => props.open,
      set: (val) => emit('update:open', val)
    });
    
    // 树数据和状态
    const treeData = ref([]);
    const expandedKeys = ref([]);
    const checkedKeys = ref([]);
    const autoExpandParent = ref(true);
    const selectedTags = ref([]);
    const searchValue = ref('');
    const checkAll = ref(false);
    const indeterminate = ref(false);
    
    // 获取所有顶级节点的key
    const getAllRootKeys = (data) => {
      if (!data || !Array.isArray(data) || data.length === 0) {
        return [];
      }
      return data.map(item => item.key).filter(Boolean);
    };
    
    // 获取所有叶子节点的key
    const getAllLeafKeys = (data) => {
      if (!data || !Array.isArray(data)) return [];
      
      let keys = [];
      const getKeys = (items) => {
        items.forEach(item => {
          if (!item) return;
          
          if (!item.children || item.children.length === 0) {
            if (item.key) keys.push(item.key);
          } else {
            getKeys(item.children);
          }
        });
      };
      getKeys(data);
      return keys;
    };
    
    // 获取所有节点的key
    const getAllKeys = (data) => {
      if (!data || !Array.isArray(data)) return [];
      
      let keys = [];
      const getKeys = (items) => {
        items.forEach(item => {
          if (!item) return;
          
          if (item.key) keys.push(item.key);
          if (item.children && item.children.length) {
            getKeys(item.children);
          }
        });
      };
      getKeys(data);
      return keys;
    };
    
    // 查找节点
    const findNode = (data, key) => {
      if (!data || !Array.isArray(data)) {
        return null;
      }
      
      for (const item of data) {
        if (item.key === key) {
          return item;
        }
        if (item.children) {
          const found = findNode(item.children, key);
          if (found) return found;
        }
      }
      return null;
    };
    
    // 更新全选状态
    const updateCheckAllStatus = () => {
      try {
        if (!treeData.value || !Array.isArray(treeData.value) || treeData.value.length === 0) {
          checkAll.value = false;
          indeterminate.value = false;
          return;
        }
        
        const allKeys = getAllLeafKeys(treeData.value);
        if (allKeys.length === 0) {
          checkAll.value = false;
          indeterminate.value = false;
          return;
        }
        
        if (!checkedKeys.value || !Array.isArray(checkedKeys.value)) {
          checkAll.value = false;
          indeterminate.value = false;
          return;
        }
        
        const selectedCount = checkedKeys.value.filter(key => allKeys.includes(key)).length;
        
        checkAll.value = selectedCount === allKeys.length && allKeys.length > 0;
        indeterminate.value = selectedCount > 0 && selectedCount < allKeys.length;
      } catch (error) {
        console.error('Error updating check all status:', error);
        checkAll.value = false;
        indeterminate.value = false;
      }
    };
    
    // 更新已选标签
    const updateSelectedTags = () => {
      try {
        selectedTags.value = [];
        
        if (!treeData.value || !checkedKeys.value) {
          return;
        }
        
        checkedKeys.value.forEach(key => {
          if (!key) return;
          
          const node = findNode(treeData.value, key);
          if (node) {
            selectedTags.value.push({
              label: node.title,
              value: node.key
            });
          }
        });
      } catch (error) {
        console.error('Error updating selected tags:', error);
      }
    };
    
    // 展开/收起节点
    const onExpand = (keys) => {
      if (!keys || !Array.isArray(keys)) return;
      
      expandedKeys.value = keys;
      autoExpandParent.value = false;
    };
    
    // 选中/取消选中节点
    const onCheck = (keys, e) => {
      try {
        // 处理检查状态
        let checkedKeysToUse = [];
        if (keys && typeof keys === 'object' && keys.checked) {
          // 如果是对象形式，说明是严格检查模式
          checkedKeysToUse = Array.isArray(keys.checked) ? [...keys.checked] : [];
        } else if (Array.isArray(keys)) {
          // 如果是数组形式
          checkedKeysToUse = [...keys];
        }
        
        checkedKeys.value = checkedKeysToUse;
        updateSelectedTags();
        updateCheckAllStatus();
      } catch (error) {
        console.error('Error handling check event:', error);
      }
    };
    
    // 移除标签
    const removeTag = (key) => {
      if (!key || !checkedKeys.value) return;
      
      checkedKeys.value = checkedKeys.value.filter(k => k !== key);
      updateSelectedTags();
      updateCheckAllStatus();
    };
    
    // 全选/取消全选
    const onCheckAllChange = (e) => {
      try {
        if (!e || e.target === undefined) return;
        
        const checked = e.target.checked;
        
        if (checked) {
          checkedKeys.value = getAllKeys(filteredTreeData.value);
        } else {
          checkedKeys.value = [];
        }
        
        checkAll.value = checked;
        indeterminate.value = false;
        updateSelectedTags();
      } catch (error) {
        console.error('Error handling check all change:', error);
      }
    };
    
    // 确认选择
    const handleConfirm = () => {
      emit('confirm', checkedKeys.value, selectedTags.value);
    };
    
    // 取消选择
    const handleCancel = () => {
      emit('cancel');
    };
    
    // 过滤后的树数据
    const filteredTreeData = computed(() => {
      try {
        if (!treeData.value || !Array.isArray(treeData.value)) {
          return [];
        }
        
        if (!searchValue.value) return treeData.value;
        
        const filter = (data) => {
          if (!data || !Array.isArray(data)) return [];
          
          return data.filter(item => {
            if (!item) return false;
            
            const title = item.title || '';
            const match = typeof title === 'string' && title.toLowerCase().includes(searchValue.value.toLowerCase());
            const childMatch = item.children ? filter(item.children).length > 0 : false;
            return match || childMatch;
          }).map(item => {
            if (item.children) {
              return {
                ...item,
                children: filter(item.children)
              };
            }
            return item;
          });
        };
        
        return filter(treeData.value);
      } catch (error) {
        console.error('Error filtering tree data:', error);
        return [];
      }
    });
    
    // 监听数据变化 - 确保在所有函数定义后调用
    watch(() => props.data, (newVal) => {
      try {
        // 确保数据是数组
        treeData.value = Array.isArray(newVal) ? newVal : [];
        // 初始化展开前两级
        expandedKeys.value = getAllRootKeys(newVal);
      } catch (error) {
        console.error('Error processing tree data:', error);
        treeData.value = [];
        expandedKeys.value = [];
      }
    }, { immediate: true });
    
    // 监听选中值变化 - 确保在所有函数定义后调用
    watch(() => props.selectedValues, (newVal) => {
      try {
        checkedKeys.value = Array.isArray(newVal) ? newVal : [];
        updateSelectedTags();
        updateCheckAllStatus();
      } catch (error) {
        console.error('Error processing selected values:', error);
        checkedKeys.value = [];
        selectedTags.value = [];
      }
    }, { immediate: true });
    
    return {
      modelOpen,
      treeData,
      filteredTreeData,
      expandedKeys,
      checkedKeys,
      autoExpandParent,
      searchValue,
      selectedTags,
      checkAll,
      indeterminate,
      checkStrictly: props.checkStrictly,
      onExpand,
      onCheck,
      removeTag,
      onCheckAllChange,
      handleConfirm,
      handleCancel
    };
  }
};
</script>

<style lang="less" scoped>
@import '../../assets/styles/design-tokens.less';

.tree-select-modal {
  display: flex;
  flex-direction: column;
  height: 580px;
  
  .search-bar {
    margin-bottom: @spacing-md;
    
    .search-input {
      width: 300px;
      margin-bottom: @spacing-sm;
    }
    
    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: @spacing-xs;
      min-height: 32px;
      max-height: 80px;
      overflow-y: auto;
      padding: @spacing-xs;
      border: 1px solid @border-color-base;
      border-radius: @border-radius-md;
      background-color: @gray-2;
      
      .selected-tag {
        margin: 2px;
      }
    }
  }
  
  .selection-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid @border-color-base;
    border-radius: @border-radius-md;
    overflow: hidden;
    
    .selection-header {
      padding: @spacing-xs @spacing-sm;
      border-bottom: 1px solid @border-color-base;
      background-color: @gray-2;
    }
    
    .tree-container {
      flex: 1;
      padding: @spacing-sm;
      overflow-y: auto;
    }
    
    .empty-tree {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
  }
}
</style> 