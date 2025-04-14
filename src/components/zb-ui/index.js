import ZbInput from './zb-input.vue'
import ZbButton from './zb-button.vue'
import ZbSelect from './zb-select.vue'
import ZbDatePicker from './zb-date-picker.vue'
import ZbTable from './zb-table.vue'
import ZbSearchForm from './zb-search-form.vue'
import ZbCheckbox from './zb-checkbox.vue'
import ZbCheckboxGroup from './zb-checkbox-group.vue'
import ZbRadio from './zb-radio.vue'
import ZbRadioGroup from './zb-radio-group.vue'
import ZbTextarea from './zb-textarea.vue'
import ZbModal from './zb-modal.vue'
import ZbTreeSelectModal from './zb-tree-select-modal.vue'
import ZbFileUpload from './zb-file-upload.vue'
import ZbFilePreview from './zb-file-preview.vue'
import ZbTabs from './zb-tabs.vue'
import ZbTabPane from './zb-tab-pane.vue'
import ZbDrawer from './zb-drawer.vue'
import ZbInputNumber from './zb-input-number.vue'
import ZbDrawerForm from './zb-drawer-form.vue'
import ZbExamineList  from './zb-examineList.vue'

// 从Ant Design Vue导入其他需要的组件
import { Tag, Form, Card } from 'ant-design-vue';
const AntZbTag = Tag;
const AntZbForm = Form;
const AntZbFormItem = Form.Item;
const AntZbCard = Card;

// 组件列表
const components = [
  ZbInput,
  ZbButton,
  ZbSelect,
  ZbDatePicker,
  ZbTable,
  ZbSearchForm,
  ZbCheckbox,
  ZbCheckboxGroup,
  ZbRadio,
  ZbRadioGroup,
  ZbTextarea,
  ZbModal,
  ZbTreeSelectModal,
  ZbFileUpload,
  ZbFilePreview,
  ZbTabs,
  ZbTabPane,
  ZbDrawer,
  ZbInputNumber,
  ZbDrawerForm,
  ZbExamineList,
]

// 全局安装方法
const install = (app) => {
  // 遍历注册所有组件
  components.forEach(component => {
    app.component(component.name || component.__name, component)
  })
  
  // 注册从Ant Design Vue导入的组件
  app.component('ZbTag', AntZbTag)
  app.component('ZbForm', AntZbForm)
  app.component('ZbFormItem', AntZbFormItem)
  app.component('ZbCard', AntZbCard)
}

// 导出所有组件
export {
  ZbInput,
  ZbButton,
  ZbSelect,
  ZbDatePicker,
  ZbTable,
  ZbSearchForm,
  ZbCheckbox,
  ZbCheckboxGroup,
  ZbRadio,
  ZbRadioGroup,
  ZbTextarea,
  ZbModal,
  ZbTreeSelectModal,
  ZbFileUpload,
  ZbFilePreview,
  ZbTabs,
  ZbTabPane,
  ZbDrawer,
  ZbInputNumber,
  ZbDrawerForm,
  ZbExamineList,
}

// 导出从Ant Design Vue复用的组件
export {
  AntZbTag as ZbTag,
  AntZbForm as ZbForm,
  AntZbFormItem as ZbFormItem,
  AntZbCard as ZbCard
}

// 导出默认对象，用于全局安装
export default {
  install
} 