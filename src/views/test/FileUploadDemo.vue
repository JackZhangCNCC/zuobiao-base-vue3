<template>
  <div class="file-upload-demo">
    <zb-card title="文件上传组件示例">
      <!-- 基础用法 -->
      <div class="demo-section">
        <h3>基础用法</h3>
        <p>默认单文件上传，支持图片预览</p>
        <zb-file-upload v-model="fileList1" />
      </div>
      
      <!-- 多文件上传 -->
      <div class="demo-section">
        <h3>多文件上传</h3>
        <p>设置fileLimit为多个，支持上传多个文件</p>
        <zb-file-upload 
          v-model="fileList2" 
          :file-limit="5" 
          btn-text="上传多个文件" 
          btn-text2="继续上传"
        />
      </div>
      
      <!-- 限制文件类型 -->
      <div class="demo-section">
        <h3>限制文件类型</h3>
        <p>通过accept属性限制文件类型，例如仅允许PDF文件</p>
        <zb-file-upload 
          v-model="fileList3" 
          accept=".pdf" 
          btn-text="上传PDF文件" 
        />
      </div>
      
      <!-- 禁用上传按钮 -->
      <div class="demo-section">
        <h3>仅展示文件</h3>
        <p>通过showUploadBtn属性控制是否显示上传按钮</p>
        <zb-button type="primary" @click="addDemoFile">添加演示文件</zb-button>
        <div class="mt-16">
          <zb-file-upload 
            v-model="fileList4" 
            :show-upload-btn="false" 
          />
        </div>
      </div>
      
      <!-- 自定义上传配置 -->
      <div class="demo-section">
        <h3>自定义上传配置</h3>
        <p>自定义大小限制和上传地址</p>
        <zb-file-upload 
          v-model="fileList5" 
          :size-max-mb="5" 
          action="api/custom/upload" 
          file-path="api/custom/download"
          btn-text="上传小文件" 
        />
      </div>
      
      <!-- 上传文件API说明 -->
      <div class="api-section">
        <h3>API说明</h3>
        <zb-table :columns="apiColumns" :dataSource="apiData" :pagination="false" />
      </div>
    </zb-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { v4 as uuidv4 } from 'uuid';

// 文件列表
const fileList1 = ref([]);
const fileList2 = ref([]);
const fileList3 = ref([]);
const fileList4 = ref([]);
const fileList5 = ref([]);

// 添加演示文件
const addDemoFile = () => {
  const demoFile = {
    id: uuidv4(),
    uid: uuidv4(),
    name: '演示文件.pdf',
    status: 'done',
    fileType: 'pdf',
    url: ''
  };
  
  fileList4.value = [demoFile];
  message.success('已添加演示文件');
};

// API说明列
const apiColumns = [
  {
    title: '参数',
    dataIndex: 'param',
    width: 150
  },
  {
    title: '说明',
    dataIndex: 'desc'
  },
  {
    title: '类型',
    dataIndex: 'type',
    width: 120
  },
  {
    title: '默认值',
    dataIndex: 'default',
    width: 150
  }
];

// API说明数据
const apiData = [
  {
    param: 'v-model(modelValue)',
    desc: '文件列表',
    type: 'Array',
    default: '[]'
  },
  {
    param: 'fileLimit',
    desc: '限制上传文件数量',
    type: 'Number',
    default: '1'
  },
  {
    param: 'action',
    desc: '文件上传地址',
    type: 'String',
    default: 'api/upload/file'
  },
  {
    param: 'filePath',
    desc: '文件下载地址',
    type: 'String',
    default: 'api/file/download'
  },
  {
    param: 'btnText',
    desc: '上传按钮文案',
    type: 'String',
    default: '上传文件'
  },
  {
    param: 'btnText2',
    desc: '重新上传按钮文案',
    type: 'String',
    default: '重新上传'
  },
  {
    param: 'sizeMaxMb',
    desc: '文件大小限制(MB)',
    type: 'Number',
    default: '20'
  },
  {
    param: 'accept',
    desc: '接受的文件类型',
    type: 'String',
    default: '.jpg,.png,.pdf,.docx,.xlsx'
  },
  {
    param: 'showUploadBtn',
    desc: '是否显示上传按钮',
    type: 'Boolean',
    default: 'true'
  }
];
</script>

<style lang="less" scoped>
@import '../../assets/styles/design-tokens.less';

.file-upload-demo {
  padding: 20px;
  
  .demo-section {
    margin-bottom: 30px;
    
    h3 {
      margin-bottom: 8px;
      font-size: 16px;
      font-weight: 500;
      color: @text-color;
    }
    
    p {
      margin-bottom: 16px;
      color: @text-color-secondary;
    }
  }
  
  .api-section {
    h3 {
      margin: 16px 0;
      font-size: 16px;
      font-weight: 500;
      color: @text-color;
    }
  }
  
  .mt-16 {
    margin-top: 16px;
  }
}
</style> 