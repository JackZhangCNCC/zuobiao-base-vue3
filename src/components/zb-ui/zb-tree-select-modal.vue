<!--
  auther: Johnson
  date: 2025-04-02
  description: 树选择弹窗组件
-->
<template>
  <!-- 作为表单控件时的选择器 -->
  <div v-if="asFormControl" class="zb-tree-select-wrapper">
    <a-select
      v-model:value="internalValue"
      :mode="multiple ? 'multiple' : undefined"
      :placeholder="placeholder"
      :disabled="disabled"
      :allowClear="allowClear"
      :open="false"
      @click="handleSelectClick"
      @clear="handleClear"
      :maxTagCount="maxTagCount"
      :maxTagPlaceholder="(omittedValues) => `+${omittedValues.length}`"
      :options="optionsData"
      :showSearch="false"
    >
    </a-select>
    <!-- 添加一个覆盖层div，确保点击事件能够被捕获 -->
    <!-- <div
      class="select-overlay"
      @click="handleSelectClick"
      v-if="!disabled"
    ></div> -->
  </div>

  <!-- 单独使用的按钮模式 -->
  <div v-else>
    <zb-button type="primary" :disabled="disabled" @click="modelOpen = true">
      {{ title || "选择" }}
    </zb-button>
  </div>

  <!-- 弹窗部分 -->
  <zb-modal
    v-model:open="modelOpen"
    :title="title"
    :width="width"
    :maskClosable="false"
    :destroyOnClose="true"
    :zIndex="zIndex"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  >
    <div class="tree-select-modal">
      <!-- 搜索框 -->
      <div class="search-bar">
        <a-form-item-rest>
          <a-input
            v-model:value="searchValue"
            placeholder="输入关键字搜索"
            allowClear
            class="search-input"
          >
            <template #prefix>
              <search-outlined />
            </template>
          </a-input>

          <!-- 已选标签展示 -->
          <div class="selected-tags" v-if="multiple">
            <div class="checkall-container" v-if="multiple && showCheckAll">
              <a-checkbox
                :checked="checkAll"
                :indeterminate="indeterminate"
                @change="onCheckAllChange"
              >
                全选
              </a-checkbox>
            </div>
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
        </a-form-item-rest>
      </div>

      <!-- 选择区域 -->
      <div class="selection-area">
        <!-- 全选按钮 -->
        <div class="selection-header">
          <span>{{ title }}</span>
        </div>

        <!-- 树结构 -->
        <div class="tree-container">
          <a-form-item-rest>
            <a-tree
              v-if="filteredTreeData.length"
              :treeData="filteredTreeData"
              :fieldNames="fieldNames"
              :checkable="multiple"
              :checked-keys="checkedKeys"
              :selectable="!multiple"
              :selected-keys="!multiple ? selectedKeys : []"
              :check-strictly="checkStrictly"
              @check="onCheck"
              @select="onSelect"
              :auto-expand-parent="autoExpandParent"
              :defaultExpandAll="defaultExpandAll"
              :expandedKeys="expandedKeys"
              @expand="onExpand"
            >
              <template #title="{ key, title }">
                <span v-if="searchValue && title.indexOf(searchValue) > -1">
                  {{ title.substr(0, title.indexOf(searchValue)) }}
                  <span style="color: #f50">{{ searchValue }}</span>
                  {{
                    title.substr(
                      title.indexOf(searchValue) + searchValue.length
                    )
                  }}
                </span>
                <span v-else>{{ title }}</span>
              </template>
            </a-tree>
            <div v-else class="empty-tree">
              <a-empty description="暂无数据" />
            </div>
          </a-form-item-rest>
        </div>
      </div>
    </div>
  </zb-modal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { SearchOutlined } from "@ant-design/icons-vue";
import { Form } from "ant-design-vue";

/**
 * 树选择弹窗组件
 *
 * 支持单选和多选模式
 * 可以作为表单控件使用，也可以单独以按钮形式使用
 * 提供搜索、清除、全选等功能
 *
 * 新增特性:
 * - singleClickSelect: 单选模式下，点击节点后是否立即选择并关闭弹窗（默认为true）
 *   设置为false时，单选模式也需要点击确定按钮才会关闭弹窗
 * - checkStrictly: 多选模式下，父子节点是否独立选择（默认为false）
 *   设置为true时，选中父节点不会自动选中子节点，反之亦然
 */

// 组件名称（为了保持与组件自注册兼容）
const name = "ZbTreeSelectModal";

// 注册Form.ItemRest组件
const AFormItemRest = Form.ItemRest;

// Props定义
const props = defineProps({
  // 弹窗是否打开
  open: { type: Boolean, default: false },
  // 弹窗标题
  title: { type: String, default: "选择" },
  // 弹窗宽度
  width: { type: [Number, String], default: 600 },
  // 树形数据
  data: { type: Array, default: () => [] },
  // 已选中的值
  selectedValues: { type: Array, default: () => [] },
  // 多选模式下，父子节点是否独立选择
  checkStrictly: { type: Boolean, default: false },
  // v-model绑定值
  modelValue: { type: [String, Number, Array], default: undefined },
  // 显示文本
  displayText: { type: String, default: "" },
  // 占位符文本
  placeholder: { type: String, default: "请选择" },
  // 是否作为表单控件使用
  asFormControl: { type: Boolean, default: true },
  // 是否禁用
  disabled: { type: Boolean, default: false },
  // 是否多选模式
  multiple: { type: Boolean, default: true },
  // 是否允许清除
  allowClear: { type: Boolean, default: true },
  // 是否显示全选按钮
  showCheckAll: { type: Boolean, default: true },
  // 最多显示的标签数量
  maxTagCount: { type: Number, default: 2 },
  // 字段名称配置
  fieldNames: { type: Object, default: () => ({}) },
  // z-index层级
  zIndex: { type: Number, default: 2000 },
  // 单选模式下，点击节点后是否立即选择并关闭弹窗
  singleClickSelect: { type: Boolean, default: true },
});

// Emits定义
const emit = defineEmits([
  "update:open",
  "confirm",
  "cancel",
  "update:modelValue",
  "change",
]);

// ===== 基础状态 =====
const modelOpen = computed({
  get: () => props.open,
  set: (val) => emit("update:open", val),
});

const treeData = ref([]);
const expandedKeys = ref([]);
const checkedKeys = ref([]);
const selectedKeys = ref([]);
const selectedTags = ref([]);
const searchValue = ref("");
const checkAll = ref(false);
const indeterminate = ref(false);
const autoExpandParent = ref(true);
const defaultExpandAll = ref(false);

// ===== 计算属性 =====
const fieldNames = computed(() => ({
  title: "title",
  key: "key",
  children: "children",
  ...(props.fieldNames || {}),
}));

const internalValue = computed({
  get: () => {
    if (!props.multiple) {
      return props.modelValue === null || props.modelValue === ""
        ? undefined
        : props.modelValue;
    }
    return Array.isArray(props.modelValue) ? props.modelValue : [];
  },
  set: (val) => {
    emit("update:modelValue", val);
    updateInternalState(val);
  },
});

const optionsData = computed(() =>
  selectedTags.value.length > 0
    ? selectedTags.value.map((tag) => ({ label: tag.label, value: tag.value }))
    : []
);

const filteredTreeData = computed(() => {
  try {
    return searchValue.value
      ? filterTreeNodes(treeData.value, searchValue.value)
      : treeData.value;
  } catch (error) {
    console.error("Error in filteredTreeData:", error);
    return [];
  }
});

// ===== 工具函数 =====

// 查找节点
const findNode = (data, key) => {
  if (!data || !Array.isArray(data)) return null;

  for (const item of data) {
    if (item.key === key) return item;
    if (item.children) {
      const found = findNode(item.children, key);
      if (found) return found;
    }
  }
  return null;
};

// 获取所有节点的key
const getAllKeys = (data, onlyLeaves = false, onlyRoots = false) => {
  if (!data || !Array.isArray(data)) return [];

  const keys = [];

  const traverse = (items) => {
    items.forEach((item) => {
      if (!item) return;

      const hasChildren = item.children && item.children.length > 0;

      // 根据条件收集节点
      if (item.key) {
        if (
          (onlyLeaves && !hasChildren) ||
          (onlyRoots && !item.parentKey) ||
          (!onlyLeaves && !onlyRoots)
        ) {
          keys.push(item.key);
        }
      }

      // 递归处理子节点
      if (hasChildren) {
        traverse(item.children);
      }
    });
  };

  traverse(data);
  return keys;
};

const getAllRootKeys = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) return [];
  return data.map((item) => item.key).filter(Boolean);
};

const getAllLeafKeys = (data) => getAllKeys(data, true);

// 过滤树节点
const filterTreeNodes = (nodes, searchText) => {
  if (!searchText) return nodes;
  if (!nodes || !Array.isArray(nodes)) return [];

  const lowerSearchText = searchText.toLowerCase();

  return nodes
    .filter((node) => {
      if (!node) return false;

      // 节点自身匹配
      const title = String(node.title || "");
      const matchesSearch = title.toLowerCase().includes(lowerSearchText);

      // 子节点匹配
      const children = node.children || [];
      const filteredChildren = filterTreeNodes(children, searchText);
      const hasMatchingChildren = filteredChildren.length > 0;

      // 如果自身或子节点匹配，保留该节点
      return matchesSearch || hasMatchingChildren;
    })
    .map((node) => {
      // 如果有子节点，递归处理
      if (node.children) {
        return {
          ...node,
          children: filterTreeNodes(node.children, searchText),
        };
      }
      return node;
    });
};

// 统一错误处理
const handleError = (error, context, fallbackValue = null) => {
  console.error(`Error in ${context}:`, error);
  return fallbackValue;
};

// ===== 核心逻辑函数 =====

// 更新内部状态
const updateInternalState = (val) => {
  // 处理空值
  if (
    val === undefined ||
    val === null ||
    val === "" ||
    (Array.isArray(val) && val.length === 0)
  ) {
    checkedKeys.value = [];
    selectedTags.value = [];
    updateCheckAllStatus();
    return;
  }

  // 设置选中keys
  checkedKeys.value = props.multiple
    ? Array.isArray(val)
      ? [...val]
      : []
    : [val];

  // 更新UI和状态
  updateSelectedTags();
  updateCheckAllStatus();
};

// 更新全选状态
const updateCheckAllStatus = () => {
  // 安全检查
  if (!treeData.value?.length || !Array.isArray(checkedKeys.value)) {
    checkAll.value = false;
    indeterminate.value = false;
    return;
  }

  // 获取相关节点集合
  const allKeys = props.checkStrictly
    ? getAllLeafKeys(treeData.value)
    : getAllKeys(treeData.value);

  if (!allKeys.length) {
    checkAll.value = false;
    indeterminate.value = false;
    return;
  }

  // 计算选中比例
  const selectedCount = checkedKeys.value.filter((key) =>
    allKeys.includes(key)
  ).length;
  checkAll.value = selectedCount === allKeys.length && allKeys.length > 0;
  indeterminate.value = selectedCount > 0 && selectedCount < allKeys.length;
};

// 更新标签显示
const updateSelectedTags = () => {
  try {
    // 清空标签列表
    selectedTags.value = [];

    // 安全检查
    if (
      !treeData.value ||
      !checkedKeys.value ||
      checkedKeys.value.length === 0
    ) {
      return;
    }

    // 获取当前选中的keys
    const keys = Array.isArray(checkedKeys.value) ? checkedKeys.value : [];

    // 非严格模式（级联选择）
    if (!props.checkStrictly && props.multiple) {
      // 使用Set去重
      const uniqueNodeMap = new Map();

      // 递归收集选中节点及其子节点
      const collectNodes = (node, isParentSelected) => {
        if (!node) return;

        // 当前节点是否选中
        const isSelected = isParentSelected || keys.includes(node.key);

        // 如果选中且未添加过
        if (isSelected && node.key && !uniqueNodeMap.has(node.key)) {
          uniqueNodeMap.set(node.key, {
            label: node.title,
            value: node.key,
          });
        }

        // 处理子节点
        if (node.children && node.children.length > 0) {
          node.children.forEach((child) => collectNodes(child, isSelected));
        }
      };

      // 处理所有节点
      treeData.value.forEach((node) => collectNodes(node, false));

      // 将Map转为数组
      selectedTags.value = Array.from(uniqueNodeMap.values());
    } else {
      // 严格模式下的简单处理
      keys.forEach((key) => {
        const node = findNode(treeData.value, key);
        if (node) {
          selectedTags.value.push({
            label: node.title,
            value: node.key,
          });
        }
      });
    }
  } catch (error) {
    handleError(error, "updateSelectedTags");
  }
};

// 获取所有级联选中的节点
const getAllCascadeSelectedKeys = () => {
  // 非级联模式直接返回当前选中
  if (props.checkStrictly || !props.multiple) {
    return [...checkedKeys.value];
  }

  // 级联模式下收集所有选中节点
  const currentSelectedKeys = [...checkedKeys.value];
  const allSelectedKeys = new Set();

  // 处理每个选中节点及其子节点
  currentSelectedKeys.forEach((key) => {
    // 获取当前节点
    const node = findNode(treeData.value, key);
    if (!node) return;

    // 添加当前节点
    allSelectedKeys.add(key);

    // 递归添加所有子节点
    const addAllChildren = (children) => {
      if (!children || !Array.isArray(children)) return;
      children.forEach((child) => {
        if (child.key) allSelectedKeys.add(child.key);
        if (child.children?.length) addAllChildren(child.children);
      });
    };

    if (node.children?.length) {
      addAllChildren(node.children);
    }
  });

  return Array.from(allSelectedKeys);
};

// ===== 事件处理 =====

// 表单控件点击
const handleSelectClick = (e) => {
  if (props.disabled) return;
  if (e?.stopPropagation) e.stopPropagation();
  modelOpen.value = true;
};

// 树节点展开
const onExpand = (keys) => {
  if (!keys || !Array.isArray(keys)) return;
  expandedKeys.value = keys;
  autoExpandParent.value = false;
};

// 勾选树节点
const onCheck = (keys, e) => {
  try {
    if (!props.multiple) return;

    // 根据模式处理选中键值
    if (props.checkStrictly && keys?.checked) {
      // 严格模式下 Ant Tree 返回 {checked: [], halfChecked: []}
      checkedKeys.value = [...keys.checked];
    } else if (Array.isArray(keys)) {
      // 非严格模式下返回数组
      checkedKeys.value = [...keys];
    } else {
      // 兜底处理
      checkedKeys.value = [];
    }

    // 更新UI显示
    updateSelectedTags();
    updateCheckAllStatus();

    // 同步通知外部
    if (props.asFormControl) {
      emit("update:modelValue", checkedKeys.value);
      const labels = selectedTags.value.map((t) => t.label).join(", ");
      emit("change", checkedKeys.value, labels);
    }
  } catch (error) {
    handleError(error, "onCheck");
  }
};

// 单选树节点
const onSelect = (keys, info) => {
  try {
    if (props.multiple) return;

    // 更新选中节点
    selectedKeys.value = keys;
    const nodeKey = info.node.key;
    const nodeTitle = info.node.title;

    // 设置选中状态
    checkedKeys.value = [nodeKey];
    selectedTags.value = [{ value: nodeKey, label: nodeTitle }];

    // 通知外部
    emit("update:modelValue", nodeKey);
    emit("change", nodeKey, nodeTitle);

    // 单击选择模式下自动确认
    if (props.singleClickSelect) {
      emit("confirm", [nodeKey], selectedTags.value);
      modelOpen.value = false;
    }
  } catch (error) {
    handleError(error, "onSelect");
  }
};

// 移除标签
const removeTag = (key) => {
  try {
    if (!key) return;

    // 从选中列表中移除
    checkedKeys.value = checkedKeys.value.filter((k) => k !== key);

    // 更新UI状态
    updateSelectedTags();
    updateCheckAllStatus();

    // 同步到外部
    if (props.multiple) {
      emit("update:modelValue", checkedKeys.value);
      const labels = selectedTags.value.map((t) => t.label).join(", ");
      emit("change", checkedKeys.value, labels);
    }
  } catch (error) {
    handleError(error, "removeTag");
  }
};

// 全选/取消全选
const onCheckAllChange = (e) => {
  try {
    if (!e?.target) return;

    const checked = e.target.checked;

    // 根据模式选择节点集合
    if (checked) {
      // 在级联模式下只需选择顶层节点，子节点会自动级联选中
      const keysToCheck = props.checkStrictly
        ? getAllLeafKeys(filteredTreeData.value)
        : getAllRootKeys(filteredTreeData.value);

      checkedKeys.value = keysToCheck;
    } else {
      checkedKeys.value = [];
    }

    // 更新状态
    checkAll.value = checked;
    indeterminate.value = false;
    updateSelectedTags();

    // 同步通知外部
    if (props.asFormControl && props.multiple) {
      emit("update:modelValue", checkedKeys.value);
      const labels = selectedTags.value.map((t) => t.label).join(", ");
      emit("change", checkedKeys.value, labels);
    }
  } catch (error) {
    handleError(error, "onCheckAllChange");
  }
};

// 清除选择
const handleClear = (e) => {
  try {
    if (e?.stopPropagation) e.stopPropagation();

    // 清空选择
    checkedKeys.value = [];
    selectedTags.value = [];
    updateCheckAllStatus();

    // 通知外部
    if (props.multiple) {
      emit("update:modelValue", []);
      emit("change", [], "");
    } else {
      emit("update:modelValue", undefined);
      emit("change", undefined, "");
    }

    emit("confirm", [], []);
  } catch (error) {
    handleError(error, "handleClear");
  }
};

// 重置状态
const resetToInitialState = () => {
  try {
    // 根据情况选择重置数据源
    if (props.selectedValues?.length) {
      checkedKeys.value = [...props.selectedValues];
    } else if (props.modelValue) {
      if (props.multiple) {
        checkedKeys.value = Array.isArray(props.modelValue)
          ? [...props.modelValue]
          : [];
      } else {
        checkedKeys.value = [props.modelValue];
      }
    } else {
      checkedKeys.value = [];
    }

    // 更新UI和状态
    updateSelectedTags();
    updateCheckAllStatus();
  } catch (error) {
    handleError(error, "resetToInitialState");
  }
};

// 确认选择
const handleConfirm = () => {
  try {
    // 获取最终选中结果（包括级联选中的子节点）
    let finalCheckedKeys = [...checkedKeys.value];

    // 非严格模式(checkStrictly=false)下，补充所有级联选中的子节点
    if (props.multiple && !props.checkStrictly) {
      const currentSelected = new Set(finalCheckedKeys);
      const allSelected = new Set();

      // 递归收集所有子节点
      const collectChildrenKeys = (node) => {
        if (!node) return;

        // 添加当前节点
        if (node.key) allSelected.add(node.key);

        // 处理子节点
        if (node.children && node.children.length > 0) {
          node.children.forEach((child) => collectChildrenKeys(child));
        }
      };

      // 遍历每个选中的节点，收集它和它的所有子节点
      treeData.value.forEach((node) => {
        // 只处理选中的节点
        if (node.key && currentSelected.has(node.key)) {
          collectChildrenKeys(node);
        } else if (node.children && node.children.length > 0) {
          // 递归查找子节点中是否有选中的节点
          const processChildren = (children) => {
            children.forEach((child) => {
              if (child.key && currentSelected.has(child.key)) {
                collectChildrenKeys(child);
              } else if (child.children && child.children.length > 0) {
                processChildren(child.children);
              }
            });
          };

          processChildren(node.children);
        }
      });

      // 更新最终结果
      finalCheckedKeys = Array.from(allSelected);
    }

    // 生成对应的标签数据
    const finalTags = finalCheckedKeys.map((key) => {
      const node = findNode(treeData.value, key);
      return node
        ? { value: key, label: node.title }
        : { value: key, label: key };
    });

    // 通知外部组件
    if (props.asFormControl) {
      if (props.multiple) {
        emit("update:modelValue", finalCheckedKeys);
        const selectedLabels = finalTags.map((tag) => tag.label).join(", ");
        emit("change", finalCheckedKeys, selectedLabels);
      } else if (selectedTags.value.length > 0) {
        const firstSelected = selectedTags.value[0];
        emit("update:modelValue", firstSelected.value);
        emit("change", firstSelected.value, firstSelected.label);
      }
    }

    // 关闭弹窗
    modelOpen.value = false;

    // 发送确认事件
    emit("confirm", finalCheckedKeys, finalTags);
  } catch (error) {
    handleError(error, "handleConfirm");
    // 确保出错时也关闭弹窗
    modelOpen.value = false;
  }
};

// 取消选择
const handleCancel = () => {
  resetToInitialState();
  modelOpen.value = false;
  emit("cancel");
};

// ===== 监听数据变化 =====

// 监听数据和选中值变化
watch(
  [() => props.data, () => props.selectedValues],
  ([newData, newSelectedValues]) => {
    try {
      // 更新树数据
      treeData.value = Array.isArray(newData) ? newData : [];
      expandedKeys.value = getAllRootKeys(treeData.value);

      // 处理选中值变化
      if (newSelectedValues !== undefined) {
        checkedKeys.value = Array.isArray(newSelectedValues)
          ? [...newSelectedValues]
          : [];
        updateSelectedTags();
        updateCheckAllStatus();
      }
    } catch (error) {
      handleError(error, "watch data/selectedValues");
      treeData.value = [];
      expandedKeys.value = [];
      checkedKeys.value = [];
      selectedTags.value = [];
    }
  },
  { immediate: true }
);

// 监听modelValue变化
watch(() => props.modelValue, updateInternalState, { immediate: true });
</script>

<style lang="less" scoped>
@import "../../assets/styles/design-tokens.less";

.zb-tree-select-wrapper {
  width: 100%;
  position: relative;

  :deep(.ant-select) {
    width: 100%;
  }

  :deep(.ant-select-selector) {
    cursor: pointer !important;
  }

  :deep(.ant-select-arrow) {
    pointer-events: none;
  }

  :deep(.ant-select-selection-placeholder) {
    color: #bfbfbf;
    opacity: 1 !important;
    font-size: @font-size-t2;
  }

  :deep(.ant-select-selector) {
    width: 300px;
    height: 28px !important;
    padding-top: 0;
    padding-bottom: 0;
    .ant-select-selection-search {
      height: 28px;
      line-height: 28px;
      margin-top: 0;
      margin-bottom: 0;
      padding-top: 0;
      padding-bottom: 0;
    }
    .ant-select-selection-item {
      height: 26px;
      line-height: 26px;
      border-radius: 2px;
      margin-right: 4px;
      padding: 0 8px;
      margin-top: 0;
      margin-bottom: 0;
    }
    .ant-select-selection-placeholder {
      height: 28px;
      line-height: 28px;
      padding-right: 25px;
    }

    // 多选模式下的样式
    &.ant-select-multiple {
      .ant-select-selection-item {
        margin-top: 0;
        margin-bottom: 0;
        padding-top: 0;
        padding-bottom: 0;
        height: 22px;
        line-height: 22px;
      }

      .ant-select-selection-overflow {
        flex-wrap: nowrap;
        overflow: hidden;
      }

      .ant-select-selection-overflow-item-suffix {
        flex: none;
      }
    }
  }

  .select-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    cursor: pointer;
    z-index: 10;
  }
}

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
