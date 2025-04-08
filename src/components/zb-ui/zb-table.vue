<!--
  auther: Johnson
  date: 2025-03-24
  description: 列表组件
-->
<template>
  <div class="zb-table-container">
    <!-- 顶部工具栏区域 -->
    <div class="zb-table-toolbar" v-if="showToolbar">
      <!-- 左侧信息区 -->
      <div class="zb-table-toolbar-left">
        <slot name="toolbarLeft">
          <!-- 自定义数据展示 -->
          <div v-if="customDataInfo" class="custom-data-info">
            <span>{{ customDataInfo }}</span>
          </div>
          <!-- 已选择项信息 -->
          <div v-if="selectedRows.length > 0" class="selection-info">
            <span>已选择 {{ selectedRows.length }} 项</span>
          </div>
        </slot>
      </div>

      <!-- 右侧工具区 -->
      <div class="zb-table-toolbar-right">
        <slot name="toolbarRight">
          <a-space>
            <!-- 列设置 -->
            <a-popover
              v-if="showColumnSetting"
              trigger="click"
              placement="bottomRight"
              :overlayClassName="'column-setting-popover'"
            >
              <template #content>
                <div class="column-setting">
                  <div class="column-setting-header">
                    <span>列展示</span>
                    <a-space>
                      <a-button type="link" @click="handleSelectAll"
                        >全选</a-button
                      >
                      <a-button type="link" @click="handleResetColumns"
                        >重置</a-button
                      >
                    </a-space>
                  </div>
                  <a-checkbox-group
                    v-model:value="visibleColumnKeys"
                    class="column-setting-list"
                  >
                    <div
                      v-for="col in columns"
                      :key="col.dataIndex"
                      class="column-setting-item"
                    >
                      <a-checkbox :value="col.dataIndex">{{
                        col.title
                      }}</a-checkbox>
                    </div>
                  </a-checkbox-group>
                </div>
              </template>
              <a-tooltip title="列设置">
                <a-button type="link" class="toolbar-button">
                  <img
                    src="@/assets/images/btn/setting.png"
                    alt="设置"
                    class="button-icon"
                  />
                </a-button>
              </a-tooltip>
            </a-popover>

            <!-- 批量删除 -->
            <a-popconfirm
              v-if="showBatchDelete && selectedRows.length > 0"
              title="确定要删除选中的记录吗?"
              @confirm="handleBatchDelete"
              okText="确定"
              cancelText="取消"
            >
              <a-tooltip title="批量删除">
                <a-button type="link" class="toolbar-button">
                  <img
                    src="@/assets/images/btn/delete.png"
                    alt="批量删除"
                    class="button-icon"
                  />
                </a-button>
              </a-tooltip>
            </a-popconfirm>
            <a-tooltip v-else-if="showBatchDelete" title="批量删除">
              <a-button type="link" class="toolbar-button" disabled>
                <img
                  src="@/assets/images/btn/delete.png"
                  alt="批量删除"
                  class="button-icon"
                />
              </a-button>
            </a-tooltip>

            <!-- 导出 -->
            <a-popover
              v-if="showExport"
              trigger="click"
              placement="bottomRight"
            >
              <template #content>
                <div class="export-options">
                  <a-button
                    type="text"
                    block
                    @click="handleExport('selected')"
                    :disabled="!selectedRows.length"
                    :loading="exportLoading"
                  >
                    导出选中项
                  </a-button>
                  <a-button type="text" block @click="handleExport('all')" :loading="exportLoading">
                    导出全部
                  </a-button>
                </div>
              </template>
              <a-tooltip title="导出">
                <a-button type="link" class="toolbar-button">
                  <img
                    src="@/assets/images/btn/export.png"
                    alt="导出"
                    class="button-icon"
                  />
                </a-button>
              </a-tooltip>
            </a-popover>

            <!-- 更多功能 -->
            <a-dropdown
              v-if="showMore && moreOptions?.length"
              :trigger="['click']"
              placement="bottomRight"
            >
              <a-tooltip title="更多">
                <a-button type="link" class="toolbar-button">
                  <img
                    src="@/assets/images/btn/more.png"
                    alt="更多"
                    class="button-icon"
                  />
                </a-button>
              </a-tooltip>
              <template #overlay>
                <a-menu @click="handleMoreAction">
                  <a-menu-item v-for="item in moreOptions" :key="item.value">
                    {{ item.label }}
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>

            <!-- 刷新 -->
            <!-- <a-tooltip title="刷新">
              <a-button type="link" @click="handleRefresh" class="toolbar-button">
                <img src="@/assets/images/btn/refresh.png" alt="刷新" class="button-icon" />
              </a-button>
            </a-tooltip> -->

            <!-- 新增按钮 -->
            <template v-if="showAddButton">
              <!-- 普通新增 -->
              <zb-button
                v-if="!addOptions?.length"
                type="primary"
                @click="handleAdd()"
                iconType="antd"
                icon="plus"
                :loading="addLoading"
              >
                <template #icon>
                  <plus-outlined />
                </template>
                新增
              </zb-button>
              <!-- 下拉新增 -->
              <a-dropdown v-else :trigger="['click']">
                <zb-button
                  type="primary"
                  iconType="antd"
                  icon="caret-down"
                  :loading="addLoading"
                >
                  <template #icon>
                    <caret-down-outlined />
                  </template>
                  新增
                </zb-button>
                <template #overlay>
                  <a-menu @click="handleAdd">
                    <a-menu-item v-for="item in addOptions" :key="item.value">
                      {{ item.label }}
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </template>
          </a-space>
        </slot>
      </div>
    </div>

    <!-- 表格区域 -->
    <a-table
      bordered
      v-bind="$attrs"
      :columns="visibleColumns"
      :dataSource="dataSource"
      :loading="loading"
      :pagination="paginationConfig"
      :rowKey="rowKey"
      :rowSelection="rowSelectionConfig"
      @change="handleTableChange"
      :scroll="scroll"
      class="zb-table"
    >
      <!-- 列插槽渲染 -->
      <template
        v-for="col in columns"
        #[col.dataIndex]="{ text, record, index }"
      >
        <slot
          :name="col.dataIndex"
          :text="text"
          :record="record"
          :index="index"
        >
          <!-- 圆角背景特殊文案 -->
          <template v-if="col.renderType === 'badge'">
            <span
              class="zb-badge-text"
              :style="{
                backgroundColor: getBadgeColor(text, col.badgeConfig).bgColor,
                color: getBadgeColor(text, col.badgeConfig).textColor,
              }"
            >
              {{ getBadgeText(text, col.badgeConfig) }}
            </span>
          </template>

          <!-- 带颜色小球的文案 -->
          <template v-else-if="col.renderType === 'dot'">
            <span class="zb-dot-text">
              <span
                class="zb-dot"
                :style="{ backgroundColor: getDotColor(text, col.dotConfig) }"
              ></span>
              <span>{{ getDotText(text, col.dotConfig) }}</span>
            </span>
          </template>

          <!-- 默认文本渲染 -->
          <template v-else>
            {{ text }}
          </template>
        </slot>
      </template>

      <!-- 操作列 -->
      <template #operation="{ record, index }">
        <slot name="operation" :record="record" :index="index"></slot>
      </template>
    </a-table>
  </div>
</template>

<script setup>
import { ref, computed, watch, h } from "vue";
import ZbButton from "./zb-button.vue";
import { Tooltip } from "ant-design-vue";
import "../../assets/styles/design-tokens.less";
import { CaretDownOutlined, PlusOutlined } from "@ant-design/icons-vue";

// 定义组件属性
const props = defineProps({
  // 表格列定义
  columns: {
    type: Array,
    required: true,
  },
  // 表格数据源
  dataSource: {
    type: Array,
    default: () => [],
  },
  // 是否显示加载状态
  loading: {
    type: Boolean,
    default: false,
  },
  // 行数据的唯一key
  rowKey: {
    type: String,
    default: "id",
  },
  // 分页配置
  pagination: {
    type: [Object, Boolean],
    default: () => ({
      current: 1,
      pageSize: 10,
      total: 0,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total) => `共 ${total} 条`,
    }),
  },
  // 是否支持行选择
  rowSelection: {
    type: [Object, Boolean],
    default: false,
  },
  // 是否显示工具栏
  showToolbar: {
    type: Boolean,
    default: true,
  },
  // 是否显示新增按钮
  showAddButton: {
    type: Boolean,
    default: true,
  },
  // 新增选项配置(这里你们不传就是普通新增按钮)
  addOptions: {
    type: Array,
    default: () => [],
  },
  // 是否显示列设置
  showColumnSetting: {
    type: Boolean,
    default: true,
  },
  // 是否支持批量删除
  showBatchDelete: {
    type: Boolean,
    default: true,
  },
  // 是否支持导出功能
  showExport: {
    type: Boolean,
    default: true,
  },
  // 是否显示更多功能
  showMore: {
    type: Boolean,
    default: true,
  },
  // 更多功能选项
  moreOptions: {
    type: Array,
    default: () => [],
  },
  // 表格滚动配置
  scroll: {
    type: Object,
    default: () => ({ x: "100%" }),
  },
  // 操作列配置
  actionColumn: {
    type: Object,
    default: () => ({
      title: "操作",
      dataIndex: "operation",
      fixed: "right",
      width: 180,
    }),
  },
  // 行操作项配置
  rowActions: {
    type: Array,
    default: () => [],
  },
  // 自定义数据展示
  customDataInfo: {
    type: String,
    default: "",
  },
  // 行更多操作项配置
  rowMoreActions: {
    type: Array,
    default: () => [],
  },
  // 添加按钮loading状态
  addLoading: {
    type: Boolean,
    default: false
  },
  // 导出按钮loading状态
  exportLoading: {
    type: Boolean,
    default: false
  },
});

// 定义事件
const emit = defineEmits([
  "add",
  "edit",
  "delete",
  "batch-delete",
  "view",
  "export",
  "refresh",
  "table-change",
  "update:pagination",
  "update:selectedRowKeys",
  "column-change",
  "more-action",
  "item-action",
  "row-action", // 新增行操作事件
]);

// 内部状态
const selectedRowKeys = ref([]);
const selectedRows = ref([]);
const visibleColumnKeys = ref(props.columns.map((col) => col.dataIndex));
const defaultColumnKeys = ref(props.columns.map((col) => col.dataIndex));

// 可见列计算属性
const visibleColumns = computed(() => {
  return props.columns
    .filter((col) => visibleColumnKeys.value.includes(col.dataIndex))
    .map((col) => {
      // 基础列配置
      let columnConfig = { ...col };

      // 对需要tooltip的列添加自定义渲染
      if (
        col.showTooltip !== false &&
        !["index", "operation", "action"].includes(col.dataIndex)
      ) {
        const originalCustomRender = col.customRender;

        // 设置自定义渲染函数
        columnConfig.customRender = ({ text, record, index }) => {
          if (text === undefined || text === null || text === "") {
            return "";
          }

          // 获取要显示的内容
          let content;

          // 对特殊渲染类型处理
          if (col.renderType === "badge") {
            content = h(
              "span",
              {
                class: "zb-badge-text",
                style: {
                  backgroundColor: getBadgeColor(text, col.badgeConfig).bgColor,
                  color: getBadgeColor(text, col.badgeConfig).textColor,
                },
              },
              getBadgeText(text, col.badgeConfig)
            );

            // 使用tooltip封装
            return wrapWithTooltip(
              content,
              getBadgeText(text, col.badgeConfig)
            );
          } else if (col.renderType === "dot") {
            content = h("span", { class: "zb-dot-text" }, [
              h("span", {
                class: "zb-dot",
                style: { backgroundColor: getDotColor(text, col.dotConfig) },
              }),
              h("span", {}, getDotText(text, col.dotConfig)),
            ]);

            // 使用tooltip封装
            return wrapWithTooltip(content, getDotText(text, col.dotConfig));
          }

          // 原始自定义渲染
          else if (originalCustomRender) {
            content = originalCustomRender({ text, record, index });

            // 确定tooltip文本
            let tooltipText;

            // 使用格式化函数优先
            if (
              col.tooltipFormatter &&
              typeof col.tooltipFormatter === "function"
            ) {
              tooltipText = col.tooltipFormatter(text, record, index);
            }
            // 使用映射配置
            else if (col.valueMap && col.valueMap[text] !== undefined) {
              tooltipText = col.valueMap[text];
            }
            // 默认使用原始内容
            else {
              tooltipText = typeof text === "string" ? text : String(text);
            }

            // 包装tooltip
            return wrapWithTooltip(content, tooltipText);
          }

          // 普通文本内容
          else {
            // 确定tooltip文本
            let tooltipText;

            // 使用格式化函数优先
            if (
              col.tooltipFormatter &&
              typeof col.tooltipFormatter === "function"
            ) {
              tooltipText = col.tooltipFormatter(text, record, index);
            }
            // 使用映射配置
            else if (col.valueMap && col.valueMap[text] !== undefined) {
              tooltipText = col.valueMap[text];
            }
            // 默认使用原始内容
            else {
              tooltipText = typeof text === "string" ? text : String(text);
            }

            content = h(
              "span",
              {
                class: "cell-content",
                style: col.ellipsis
                  ? {
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      display: "inline-block",
                      verticalAlign: "middle",
                      width: "100%",
                    }
                  : {},
              },
              text
            );

            // 包装tooltip
            return wrapWithTooltip(content, tooltipText);
          }
        };
      }

      return columnConfig;
    });
});

// 统一的tooltip包装函数
const wrapWithTooltip = (content, title) => {
  return h(
    Tooltip,
    {
      title,
      placement: "top",
      overlayClassName: "column-custom-tooltip",
      color: "#1f1f1f",
    },
    {
      default: () => content,
    }
  );
};

// 分页配置计算属性
const paginationConfig = computed(() => {
  if (props.pagination === false) return false;

  return {
    ...props.pagination,
    onChange: (page, pageSize) => {
      emit("update:pagination", {
        ...props.pagination,
        current: page,
        pageSize,
      });
    },
    onShowSizeChange: (current, size) => {
      emit("update:pagination", {
        ...props.pagination,
        current: 1,
        pageSize: size,
      });
    },
  };
});

// 行选择配置计算属性
const rowSelectionConfig = computed(() => {
  if (!props.rowSelection) return undefined;

  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys, rows) => {
      selectedRowKeys.value = keys;
      selectedRows.value = rows;
      emit("update:selectedRowKeys", keys);
    },
    ...(typeof props.rowSelection === "object" ? props.rowSelection : {}),
  };
});

// 事件处理方法
const handleTableChange = (pagination, filters, sorter) => {
  emit("table-change", { pagination, filters, sorter });
};

const handleAdd = (event) => {
  // 如果event是对象且有key属性，则使用event.key作为type
  const type = event && event.key ? event.key : event;
  emit("add", type);
};

const handleEdit = (record) => {
  emit("edit", record);
};

const handleDelete = (record) => {
  emit("delete", record);
};

const handleBatchDelete = () => {
  emit("batch-delete", selectedRowKeys.value, selectedRows.value);
};

const handleView = (record) => {
  emit("view", record);
};

const handleExport = (type) => {
  emit("export", {
    type,
    selectedRows: type === "selected" ? selectedRows.value : null,
  });
};

const handleRefresh = () => {
  emit("refresh");
};

const handleSelectAll = () => {
  visibleColumnKeys.value = props.columns.map((col) => col.dataIndex);
  emit("column-change", visibleColumnKeys.value);
};

const handleResetColumns = () => {
  visibleColumnKeys.value = [...defaultColumnKeys.value];
  emit("column-change", visibleColumnKeys.value);
};

const handleMoreAction = ({ key }) => {
  emit("more-action", key);
};

const handleItemAction = (e, record) => {
  emit("item-action", e.key, record);
};

// 监听列变化
watch(visibleColumnKeys, (newValue) => {
  emit("column-change", newValue);
});

// 清除选择
const clearSelection = () => {
  selectedRowKeys.value = [];
  selectedRows.value = [];
};

// 暴露给父组件的方法
defineExpose({
  clearSelection,
});
// console.log("🚀 ~ props.actionColumn:", props.actionColumn)

// 获取圆角徽章的颜色
const getBadgeColor = (value, config = {}) => {
  if (!config) return { bgColor: "#e6f7ff", textColor: "#1890ff" };

  const item = (config.items || []).find((item) => item.value == value);
  if (item) {
    return {
      bgColor: item.bgColor || "#e6f7ff",
      textColor: item.textColor || "#1890ff",
    };
  }

  return {
    bgColor: config.defaultBgColor || "#e6f7ff",
    textColor: config.defaultTextColor || "#1890ff",
  };
};

// 获取圆角徽章的文本
const getBadgeText = (value, config = {}) => {
  if (!config) return value;

  const item = (config.items || []).find((item) => item.value == value);
  return item ? item.text : value;
};

// 获取小球颜色
const getDotColor = (value, config = {}) => {
  if (!config) return "#1890ff";

  const item = (config.items || []).find((item) => item.value == value);
  return item ? item.color : config.defaultColor || "#1890ff";
};

// 获取小球文本
const getDotText = (value, config = {}) => {
  if (!config) return value;

  const item = (config.items || []).find((item) => item.value == value);
  return item ? item.text : value;
};
</script>

<style lang="less" scoped>
@import "../../assets/styles/design-tokens.less";

.zb-table-container {
  background-color: @gray-1;
  border-radius: @border-radius-md;
  margin-bottom: 0;
  padding: @spacing-md;
  box-shadow: @shadow-sm;

  :deep(.ant-table-title) {
    display: none;
  }
  :deep(.ant-table-container) {
    margin-top: @spacing-xs;
  }

  .zb-table-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: @spacing-sm;

    &-left {
      display: flex;
      align-items: center;

      .custom-data-info {
        margin-right: @spacing-md;
        display: flex;
        align-items: center;

        span {
          color: @text-color-primary;
          font-weight: @font-weight-medium;
        }
      }

      .selection-info {
        display: flex;
        align-items: center;
        gap: @spacing-xs;

        span {
          color: @text-color-primary;
        }
      }
    }

    &-right {
      display: flex;
      gap: @spacing-xs;

      .toolbar-button {
        padding: 0;
        height: @control-height-md;

        &:hover {
          background-color: @gray-3;
        }
      }

      .add-button {
        background-color: @btn-primary;
        border-color: @btn-primary;

        &:hover {
          background-color: @btn-primary-hover;
          border-color: @btn-primary-hover;
        }
      }
    }

    .button-icon {
      width: 28px;
      height: 28px;
      vertical-align: middle;
    }
  }

  .zb-table {
    :deep(.ant-table) {
      .ant-table-thead > tr > th {
        background-color: @table-header-bg;
        color: @table-header-color;
        font-weight: @font-weight-medium;
        padding: @spacing-xs @table-padding-horizontal;
        height: @table-row-height;
        border-color: @border-color-split;
      }

      .ant-table-tbody > tr > td {
        padding: @spacing-xs @table-padding-horizontal;
        color: @table-text-color;
        height: @table-row-height;
        border-color: @border-color-split;
      }

      .ant-table-row {
        &:hover {
          td {
            background-color: @table-row-hover-bg;
          }
        }
      }

      .ant-pagination {
        margin: @spacing-md 0;
      }
    }

    .operation-link {
      color: @btn-primary;

      &:hover {
        color: @btn-primary-hover;
      }

      &.danger-text {
        color: @color-error;

        &:hover {
          color: fade(@color-error, 80%);
        }
      }
    }
  }
}

// 列设置弹窗样式
:deep(.column-setting-popover) {
  .ant-popover-inner-content {
    padding: 0;
  }
}

.column-setting {
  width: 200px;

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: @spacing-xs @spacing-sm;
    border-bottom: 1px solid @border-color-split;

    span {
      font-weight: @font-weight-medium;
    }
  }

  &-list {
    max-height: 300px;
    overflow-y: auto;
    padding: @spacing-xs 0;
  }

  &-item {
    padding: @spacing-xxs @spacing-sm;

    &:hover {
      background-color: @gray-3;
    }
  }
}

// 导出选项样式
.export-options {
  min-width: 120px;

  .ant-btn {
    text-align: left;
    height: @control-height-md;

    &:hover {
      background-color: @gray-3;
    }
  }
}

// 圆角背景文本样式
.zb-badge-text {
  display: inline-block;
  padding: 2px @spacing-xs;
  border-radius: @border-radius-md;
  font-size: @font-size-t1;
  line-height: 18px;
}

// 带小球的文本样式
.zb-dot-text {
  display: flex;
  align-items: center;

  .zb-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: @border-radius-circle;
    margin-right: 6px;
  }
}
:deep(.operation-link) {
  color: #1890ff;
  cursor: pointer;
  display: inline-block;
  vertical-align: middle;
  width: auto;
  margin-right: 10px;
  
  &:hover {
    color: #40a9ff;
  }
  
  &.danger-texts {
    color: #ff4d4f;
    
    &:hover {
      color: #ff7875;
    }
  }

  &.check-action {
    color: #1890ff;
  }

  &.check-action-dropdown {
    display: inline-block;
    vertical-align: middle;
    height: 19px;
  }

  &.edit-action {
    color: #1890ff;
  }
  &.more-action {
    font-size: 24px;
    display: inline-block;
    vertical-align: middle;
    height: 19px;
    line-height: 6px;
    margin-right: 0;
  }

  .dropdown-arrow {
    font-size: 10px;
  }
}

:deep(.action-dropdown) {
  .ant-dropdown-menu-item {
    min-width: 100px;
  }
}
</style>

<!-- 全局样式，确保tooltip正确显示 -->
<style>
/* tooltip样式 */
.column-custom-tooltip {
  max-width: 300px;
}

.column-custom-tooltip .ant-tooltip-inner {
  color: #fff;
  background-color: #1f1f1f;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12),
    0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
}

.column-custom-tooltip .ant-tooltip-arrow-content {
  background-color: #1f1f1f;
}

/* 单元格内容样式 */
.cell-content {
  display: inline-block;
  width: 100%;
  cursor: auto;
}

/* 确保表格中的tooltip正确触发 */
.zb-table .ant-table-tbody td {
  overflow: visible !important;
}
</style>
