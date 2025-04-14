<!-- 搜索栏组件
  用法：
  <zb-search-form :fields="fields" :keywordPlaceholder="keywordPlaceholder" :initialValues="initialValues" 
  :autoSearch="autoSearch" :autoSearchDelay="autoSearchDelay" @search="handleSearch" @reset="handleReset" />
  
  参数：
  fields：字段配置
  keywordPlaceholder：关键词搜索框占位文本
  initialValues：初始值 
  autoSearch：是否自动查询
  autoSearchDelay：自动查询延迟（毫秒）
  
  事件：
  search：搜索事件
  reset：重置事件 
  
  字段类型：
  input：输入框
  select：下拉选择框
  date：日期选择器
  dateRange：日期范围选择器
  
  字段配置示例：
  {
    field: 'keyword',
    label: '关键词',
  }

  2025-03-25 By Johnson
-->
<template>
  <div class="zb-search-form">
    <!-- 简单搜索区域 - 关键词输入框和少量搜索项 -->
    <div class="simple-search-area">
      <!-- 关键词搜索输入框（无标签） -->
      <a-input-search
        v-model:value="formState.keyword"
        :placeholder="keywordPlaceholder"
        allow-clear
        :enter-button="loading ? ' ' : true"
        :loading="loading"
        :disabled="loading"
        @search="handleSearch"
        @change="handleKeywordChange"
        class="keyword-search"
        :class="{ 'loading-search': loading }"
      />

      <!-- 简单搜索项 (最多2个，值变动立即查询) -->
      <template v-if="otherFields.length <= 2">
        <div
          class="simple-field"
          v-for="(item, index) in otherFields"
          :key="item.field"
        >
          <span class="field-label">{{ item.label }}:</span>

          <!-- 下拉选择框 -->
          <a-select
            v-if="item.type === 'select'"
            v-model:value="formState[item.field]"
            :placeholder="item.placeholder || `请选择${item.label}`"
            :options="item.options || []"
            :mode="item.mode"
            allow-clear
            style="width: 300px"
            @change="handleValueChange"
          />

          <!-- 日期选择器 -->
          <a-date-picker
            v-else-if="item.type === 'date'"
            v-model:value="formState[item.field]"
            :placeholder="item.placeholder || `请选择${item.label}`"
            :format="item.format"
            allow-clear
            style="width: 300px"
            @change="handleValueChange"
          />

          <!-- 日期范围选择器 -->
          <a-range-picker
            v-else-if="item.type === 'dateRange'"
            v-model:value="formState[item.field]"
            :placeholder="item.placeholder || ['开始时间', '结束时间']"
            :format="item.format || 'YYYY-MM-DD'"
            allow-clear
            style="width: 300px"
            @change="(dates) => {
              // 确保不会传递无效日期
              if (!dates || !dates.length) {
                formState[item.field] = [];
              }
              handleValueChange();
            }"
          />

          <!-- 输入框 -->
          <a-input
            v-else-if="item.type === 'input'"
            v-model:value="formState[item.field]"
            :placeholder="item.placeholder || `请输入${item.label}`"
            allow-clear
            style="width: 300px"
            @change="handleValueChange"
            @pressEnter="handleSearch"
          />

          <!-- 自定义组件 -->
          <component
            v-else-if="item.type === 'custom' && item.render"
            :is="item.render().component"
            v-bind="item.render().props || {}"
            v-on="item.render().on || {}"
          />

          <!-- 默认输入框 -->
          <a-input
            v-else
            v-model:value="formState[item.field]"
            :placeholder="item.placeholder || `请输入${item.label}`"
            allow-clear
            style="width: 300px"
            @change="handleValueChange"
            @pressEnter="handleSearch"
          />
        </div>
      </template>

      <!-- 高级搜索按钮 (搜索项超过2个时显示) -->
      <zb-button
        v-else
        type="link"
        @click="showAdvancedSearch = true"
        class="advanced-search-btn"
      >
        <img
          src="@/assets/images/btn/filter.png"
          alt="筛选"
          class="filter-icon"
        />
      </zb-button>
    </div>

    <!-- 已选高级搜索项标签区域 -->
    <div
      class="search-tags"
      v-if="hasActiveFilters && otherFields.length > 2"
      ref="tagsContainer"
    >
      <div class="tags-container" ref="visibleTags">
        <a-tag
          v-for="(tag, index) in visibleSelectedTags"
          :key="tag.field"
          closable
          @close="handleRemoveTag(tag.field)"
          class="filter-tag"
        >
          {{ tag.label }}: {{ formatTagValue(tag) }}
        </a-tag>

        <!-- 显示更多按钮 -->
        <a-popover
          v-if="hiddenTags.length > 0"
          trigger="click"
          placement="bottomLeft"
          :arrow="false"
          :open="moreTagsVisible"
          @openChange="(val) => moreTagsVisible = val"
          :overlay-style="{ maxWidth: '400px' }"
        >
          <template #content>
            <div class="hidden-tags">
              <a-tag
                v-for="tag in hiddenTags"
                :key="tag.field"
                closable
                @close="handleRemoveTag(tag.field)"
                class="filter-tag"
              >
                {{ tag.label }}: {{ formatTagValue(tag) }}
              </a-tag>
            </div>
          </template>
          <a class="more-tags-btn">
            <img
              src="@/assets/images/btn/more.png"
              alt="更多"
              class="more-icon"
            />
          </a>
        </a-popover>

        <!-- 清除所有过滤器按钮 -->
        <a
          class="clear-all-btn"
          v-if="hasActiveFilters"
          @click="handleClearAllTags"
        >
          <img
            src="@/assets/images/btn/clear.png"
            alt="清除"
            class="clear-icon"
          />
        </a>
      </div>
    </div>

    <!-- 高级搜索弹出框 -->
    <a-popover
      v-model:open="showAdvancedSearch"
      trigger="click"
      placement="bottomRight"
      :arrow="false"
      :destroy-tooltip-on-hide="false"
      :overlay-style="{ width: '660px' }"
      :getPopupContainer="(triggerNode) => triggerNode.parentNode"
    >
      <template #content>
        <div class="advanced-search-form">
          <a-form layout="vertical" :model="tempFormState" ref="formRef">
            <a-row :gutter="16">
              <a-col
                :span="12"
                v-for="(item, index) in otherFields"
                :key="item.field"
              >
                <a-form-item :label="item.label" :name="item.field">
                  <!-- 输入框 -->
                  <a-input
                    v-if="item.type === 'input'"
                    v-model:value="tempFormState[item.field]"
                    :placeholder="item.placeholder || `请输入${item.label}`"
                  />

                  <!-- 下拉选择框 -->
                  <a-select
                    v-else-if="item.type === 'select'"
                    v-model:value="tempFormState[item.field]"
                    :placeholder="item.placeholder || `请选择${item.label}`"
                    :options="item.options || []"
                    :mode="item.mode"
                    style="width: 100%"
                  />

                  <!-- 日期选择器 -->
                  <a-date-picker
                    v-else-if="item.type === 'date'"
                    v-model:value="tempFormState[item.field]"
                    :placeholder="item.placeholder || `请选择${item.label}`"
                    :format="item.format"
                    style="width: 100%"
                  />

                  <!-- 日期范围选择器 -->
                  <a-range-picker
                    v-else-if="item.type === 'dateRange'"
                    v-model:value="tempFormState[item.field]"
                    style="width: 100%"
                    :placeholder="item.placeholder || ['开始日期', '结束日期']"
                    :format="item.format || 'YYYY-MM-DD'"
                    @change="(dates) => {
                      // 确保不会传递无效日期
                      if (!dates || !dates.length) {
                        tempFormState[item.field] = [];
                      }
                    }"
                  />

                  <!-- 自定义组件 -->
                  <component
                    v-else-if="item.type === 'custom' && item.render"
                    :is="item.render().component"
                    v-bind="item.render().props || {}"
                    v-on="item.render().on || {}"
                  />
                </a-form-item>
              </a-col>
            </a-row>

            <div class="advanced-search-buttons">
              <zb-button @click="handleCancelAdvanced">取消</zb-button>
              <a-space>
                <zb-button @click="handleAdvancedReset" :disabled="loading">重置</zb-button>
                <zb-button type="primary" :loading="loading" :disabled="loading" @click="handleAdvancedSearch">查询</zb-button>
              </a-space>
            </div>
          </a-form>
        </div>
      </template>
    </a-popover>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, nextTick } from "vue";
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons-vue";

// 定义组件属性
const props = defineProps({
  // 字段配置
  fields: {
    type: Array,
    required: true,
  },
  // 关键词搜索框占位文本
  keywordPlaceholder: {
    type: String,
    default: "请输入关键词搜索",
  },
  // 初始值
  initialValues: {
    type: Object,
    default: () => ({}),
  },
  // 是否自动查询（值变化时）
  autoSearch: {
    type: Boolean,
    default: true,
  },
  // 自动查询延迟（毫秒）
  autoSearchDelay: {
    type: Number,
    default: 300,
  },
  // 搜索按钮加载状态
  loading: {
    type: Boolean,
    default: false,
  },
});

// 定义事件
const emit = defineEmits(["search", "reset"]);

// 内部状态
const formRef = ref(null);
const formState = reactive({ keyword: "", ...props.initialValues });
const tempFormState = reactive({}); // 临时表单状态，用于高级搜索
const showAdvancedSearch = ref(false);
const moreTagsVisible = ref(false);
let searchTimer = null;
const tagsContainer = ref(null);
const visibleTags = ref(null);
const visibleSelectedTags = ref([]);
const hiddenTags = ref([]);

// 计算非关键词搜索的其他字段
const otherFields = computed(() => {
  return props.fields.filter((field) => field.field !== "keyword");
});

// 计算已选的过滤项
const selectedTags = computed(() => {
  // 获取已有值的字段并转换为tag
  return otherFields.value
    .filter((field) => {
      const value = formState[field.field];
      return (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
      );
    })
    .map((field) => {
      return {
        field: field.field,
        label: field.label,
        type: field.type,
        value: formState[field.field],
        options: field.options || [],
      };
    });
});

// 是否有活跃的过滤器
const hasActiveFilters = computed(() => {
  // 如果高级搜索框打开，则不显示过滤标签
  if (showAdvancedSearch.value) return false;
  
  return selectedTags.value.length > 0;
});

// 值变化处理（简单搜索时自动查询）
const handleValueChange = () => {
  // 重新计算标签分布
  calculateTagsVisibility();

  // 只有在高级搜索弹窗关闭时（即在简单搜索区域）才触发自动查询
  if (props.autoSearch && !showAdvancedSearch.value) {
    // 防抖处理
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
    searchTimer = setTimeout(() => {
      handleSearch();
    }, props.autoSearchDelay);
  }
};

// 关键词变化处理
const handleKeywordChange = (e) => {
  // 只处理清空的情况自动查询
  if (!e.target.value && props.autoSearch) {
    handleValueChange();
  }
};

// 格式化标签值
const formatTagValue = (tag) => {
  // 处理不同类型的值显示
  if (tag.type === "select") {
    // 查找选项中对应的标签
    if (Array.isArray(tag.value)) {
      // 多选
      return tag.value
        .map((val) => {
          const option = tag.options.find((opt) => opt.value === val);
          return option ? option.label : val;
        })
        .join(", ");
    } else {
      // 单选
      const option = tag.options.find((opt) => opt.value === tag.value);
      return option ? option.label : tag.value;
    }
  } else if (tag.type === "date") {
    // 日期格式化
    return formatDate(tag.value, tag.format || "YYYY-MM-DD") || "";
  } else if (tag.type === "dateRange") {
    // 日期范围格式化
    if (Array.isArray(tag.value) && tag.value.length === 2) {
      const format = tag.format || "YYYY-MM-DD";
      const startDate = formatDate(tag.value[0], format);
      const endDate = formatDate(tag.value[1], format);
      if (startDate && endDate) {
        return `${startDate} 至 ${endDate}`;
      }
    }
    return "";
  }
  // 默认直接返回值
  return tag.value;
};

// 计算标签的可见性分布
const calculateTagsVisibility = () => {
  nextTick(() => {
    if (!tagsContainer.value) return;

    const containerWidth = tagsContainer.value.clientWidth - 40; // 减去清除按钮的空间
    const allTags = [...selectedTags.value];

    // 重置
    visibleSelectedTags.value = [];
    hiddenTags.value = [];

    if (allTags.length === 0) return;

    // 临时元素测量宽度
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.visibility = "hidden";
    tempDiv.style.whiteSpace = "nowrap";
    document.body.appendChild(tempDiv);

    let currentWidth = 0;
    const moreButtonWidth = 30; // "更多"按钮的估计宽度

    allTags.forEach((tag, index) => {
      // 计算此标签的宽度
      tempDiv.textContent = `${tag.label}: ${formatTagValue(tag)}`;
      tempDiv.className = "filter-tag"; // 应用相同的样式以获得准确尺寸
      const tagWidth = tempDiv.offsetWidth + 40; // 添加额外的边距和padding

      // 检查是否还有空间放置此标签
      if (currentWidth + tagWidth < containerWidth || index === 0) {
        // 至少放一个标签，即使它太宽
        visibleSelectedTags.value.push(tag);
        currentWidth += tagWidth;
      } else if (currentWidth + moreButtonWidth < containerWidth) {
        // 放置"更多"按钮后剩余的标签都隐藏
        hiddenTags.value.push(tag);
      } else {
        // 如果连"更多"按钮也放不下，则替换最后一个可见标签为"更多"
        if (visibleSelectedTags.value.length > 0) {
          hiddenTags.value.push(visibleSelectedTags.value.pop());
        }
        hiddenTags.value.push(tag);
      }
    });

    document.body.removeChild(tempDiv);
  });
};

// 移除单个标签
const handleRemoveTag = (field) => {
  // 彻底清除此字段
  if (field === 'dateRange') {
    // 特殊处理日期范围，确保完全清除
    formState[field] = [];
    if (tempFormState[field] !== undefined) {
      tempFormState[field] = [];
    }
  } else {
    // 一般字段处理
    formState[field] = undefined;
    if (tempFormState[field] !== undefined) {
      tempFormState[field] = undefined;
    }
  }
  
  // 更新标签分布
  calculateTagsVisibility();
  
  // 触发搜索，传递清理后的参数
  handleSearch();
};

// 清除所有标签
const handleClearAllTags = () => {
  handleReset();
};

// 搜索处理
const handleSearch = () => {
  // 统一处理并转换日期格式
  const processedParams = processFormValues(formState);
  emit("search", processedParams);
};

// 统一处理表单值，特别是日期格式
const processFormValues = (values) => {
  // 去除空值
  const params = {};
  Object.keys(values).forEach((key) => {
    const value = values[key];
    const field = props.fields.find(f => f.field === key);
    
    // 只保留有效值：非undefined、非null、非空字符串，以及非空数组
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0)
    ) {
      // 对日期类型进行特殊处理
      if (field && field.type === 'date') {
        // 处理单个日期
        const formattedDate = formatDate(value, field.format || 'YYYY-MM-DD');
        if (formattedDate) {
          params[key] = formattedDate;
        }
      } 
      // 对日期范围类型进行特殊处理
      else if (field && field.type === 'dateRange' && Array.isArray(value)) {
        // 确保日期范围有效
        if (value.length === 2) {
          const startDate = formatDate(value[0], field.format || 'YYYY-MM-DD');
          const endDate = formatDate(value[1], field.format || 'YYYY-MM-DD');
          
          if (startDate && endDate) {
            params[key] = [startDate, endDate];
          } else {
            console.warn('日期范围包含无效日期:', key, value);
          }
        }
      } 
      // 处理其他类型值
      else {
        params[key] = value;
      }
    }
  });

  return params;
};

// 格式化日期的通用函数
const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return null;
  
  try {
    // 转换各种可能的日期格式
    let dateObj;
    
    // 如果已经是标准格式，直接返回
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
      return date;
    }
    
    // 处理 Date 对象
    if (date instanceof Date) {
      dateObj = date;
    } 
    // 处理 Moment 对象 (如果存在 format 方法)
    else if (date && typeof date.format === 'function') {
      return date.format(format);
    }
    // 处理字符串或时间戳
    else {
      dateObj = new Date(date);
    }
    
    // 检查日期是否有效
    if (isNaN(dateObj.getTime())) {
      console.warn('无效的日期值:', date);
      return null;
    }
    
    // 格式化日期为指定格式 (简单实现)
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    // 根据指定格式返回
    if (format === 'YYYY-MM-DD') {
      return `${year}-${month}-${day}`;
    } else if (format === 'YYYY/MM/DD') {
      return `${year}/${month}/${day}`;
    } else {
      // 默认返回标准格式
      return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.error('日期格式化错误:', error);
    return null;
  }
};

// 监听高级搜索弹框的显示状态
watch(showAdvancedSearch, (newVal) => {
  if (newVal) {
    // 打开高级搜索弹框时，创建表单状态的副本
    Object.keys(formState).forEach(key => {
      tempFormState[key] = formState[key];
    });
  } else {
    // 关闭高级搜索弹框但未点击查询时，不会自动应用临时状态
  }
});

// 高级搜索处理
const handleAdvancedSearch = () => {
  // 将临时表单状态应用到真正的表单状态
  Object.keys(tempFormState).forEach(key => {
    formState[key] = tempFormState[key];
  });
  
  handleSearch();
  showAdvancedSearch.value = false;
  calculateTagsVisibility();
};

// 取消高级搜索
const handleCancelAdvanced = () => {
  // 关闭弹框但不应用临时表单状态
  showAdvancedSearch.value = false;
};

// 高级搜索重置
const handleAdvancedReset = () => {
  if (formRef.value) {
    formRef.value.resetFields();
  }
  
  // 清空临时表单状态，特殊处理日期范围字段
  Object.keys(tempFormState).forEach((key) => {
    if (key === 'dateRange') {
      tempFormState[key] = []; // 对日期范围使用空数组而不是undefined
    } else {
      tempFormState[key] = undefined;
    }
  });
};

// 重置处理
const handleReset = () => {
  // 重置字段
  if (formRef.value) {
    formRef.value.resetFields();
  }
  
  // 清空表单状态，特殊处理日期范围字段
  Object.keys(formState).forEach((key) => {
    const field = props.fields.find(f => f.field === key);
    
    if (field && (field.type === 'dateRange' || field.type === 'date')) {
      formState[key] = field.type === 'dateRange' ? [] : undefined;
    } else {
      formState[key] = undefined;
    }
  });
  
  // 清空临时表单状态，确保高级搜索也被重置
  Object.keys(tempFormState).forEach((key) => {
    const field = props.fields.find(f => f.field === key);
    
    if (field && (field.type === 'dateRange' || field.type === 'date')) {
      tempFormState[key] = field.type === 'dateRange' ? [] : undefined;
    } else {
      tempFormState[key] = undefined;
    }
  });

  // 重置标签状态
  visibleSelectedTags.value = [];
  hiddenTags.value = [];
  
  // 发送重置事件
  emit("reset");
};

// 监听初始值变化
watch(
  () => props.initialValues,
  (newVal) => {
    Object.keys(newVal).forEach((key) => {
      formState[key] = newVal[key];
    });
    calculateTagsVisibility();
  },
  { deep: true }
);

// 监听窗口大小变化
const handleResize = () => {
  calculateTagsVisibility();
};

// 组件挂载和卸载
onMounted(() => {
  // 组件挂载后执行一次计算
  nextTick(() => {
    calculateTagsVisibility();
    window.addEventListener("resize", handleResize);
  });
});

// 暴露给父组件的方法
defineExpose({
  formRef,
  formState,
  handleSearch,
  handleReset,
  calculateTagsVisibility, // 暴露给父组件以便需要时手动调用
  refreshForm: () => {
    nextTick(() => {
      // 强制更新，触发视图刷新
      calculateTagsVisibility();
    });
  }
});
</script>

<style lang="less" scoped>
@import '../../assets/styles/design-tokens.less';

.zb-search-form {
  background-color: @gray-1;
  padding: @spacing-sm @spacing-md;
  border-radius: @border-radius-md;
  margin-bottom: @spacing-md;
  position: relative;
  box-shadow: @shadow-sm;

  .simple-search-area {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: @spacing-md;

    .keyword-search {
      width: 360px;
      
      &.loading-search {
        :deep(.ant-input-search-button) {
          width: 46px !important;
          min-width: 46px !important;
        }
      }
    }

    .simple-field {
      display: flex;
      align-items: center;

      .field-label {
        margin-right: @spacing-xs;
        color: @text-color-secondary;
        white-space: nowrap;
      }
    }

    .advanced-search-btn {
      padding: 0 @spacing-xs;

      .filter-icon {
        width: 28px;
        height: 28px;
        vertical-align: middle;
      }
    }

    :deep(.ant-input-search-button) {
      background-color: @btn-primary;
      .anticon {
        color: #ffffff;
      }
    }
  }

  .search-tags {
    display: flex;
    align-items: center;
    margin-top: @spacing-sm;
    min-height: @control-height-md;
    position: relative;
    overflow: hidden;

    .tags-container {
      display: flex;
      flex-wrap: nowrap;
      overflow: hidden;
      flex: 1;

      .filter-tag {
        margin-right: @spacing-xs;
        max-width: 300px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        background: @gray-3;
        border-radius: @border-radius-md;
        color: @text-color-primary;
        border: none;
        
        &:hover {
          background: @btn-primary;
          color: @gray-1;
          
          :deep(.ant-tag-close-icon) {
            svg {
              color: @btn-primary;
              background: @gray-1;
              border-radius: @border-radius-circle;
            }
          }
        }
      }

      .more-tags-btn {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 0 @spacing-xs;

        .more-icon {
          width: 24px;
          height: 24px;
        }
      }

      .clear-all-btn {
        cursor: pointer;
        display: flex;
        align-items: center;
        margin-left: @spacing-xs;

        .clear-icon {
          width: 24px;
          height: 24px;
        }
      }
    }
  }

  .advanced-search-form {
    padding: @spacing-md @spacing-xs @spacing-xs;

    :deep(.ant-form-item) {
      margin-bottom: @spacing-md;
    }

    :deep(.ant-form-item-label) {
      padding-bottom: @spacing-xxs;

      label {
        color: @text-color-secondary;
        font-size: @font-size-t2;
      }
    }

    :deep(.ant-input), 
    :deep(.ant-select-selector),
    :deep(.ant-picker) {
      border-radius: @border-radius-md;
      height: @control-height-md;
      
      &:hover {
        border-color: @btn-primary-hover;
      }
      
      &:focus, &.ant-input-focused, &.ant-select-focused, &.ant-picker-focused {
        border-color: @btn-primary;
        box-shadow: 0 0 0 2px fade(@btn-primary, 20%);
      }
    }

    .advanced-search-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: @spacing-md;
      padding-top: @spacing-md;
      border-top: 1px solid @border-color-split;
    }
  }
  
  :deep(.ant-tabs-nav) {
    margin-bottom: @spacing-sm;
    
    .ant-tabs-tab {
      padding: @spacing-xs @spacing-sm;
      
      &.ant-tabs-tab-active .ant-tabs-tab-btn {
        color: @btn-primary;
        font-weight: @font-weight-medium;
      }
    }
    
    .ant-tabs-ink-bar {
      background-color: @btn-primary;
    }
  }
}

// 弹出框样式
:deep(.ant-popover-content) {
  .ant-popover-inner {
    border-radius: @border-radius-md;
    box-shadow: @shadow-md;
  }
  
  .hidden-tags {
    max-width: 400px;
    display: flex;
    flex-wrap: wrap;
    gap: @spacing-xs;
    
    .filter-tag {
      margin-bottom: @spacing-xxs;
      background: @gray-3;
      border-radius: @border-radius-md;
      color: @text-color-primary;
      border: none;
      
      &:hover {
        background: @btn-primary;
        color: @gray-1;
      }
    }
  }
}
</style>
