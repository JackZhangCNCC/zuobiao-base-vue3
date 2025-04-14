<!--
  auther: Johnson
  date: 2025-04-02
  description: 文件展示列表及上传下载(文件流)
-->
<template>
  <div class="file-upload-wrapper">
    <div class="upload-header">
      <span class="upload-label">附件：</span>
      <a-upload
        name="file"
        :accept="accept"
        :multiple="false"
        :file-list="[]"
        :show-upload-list="false"
        :before-upload="handleBeforeUpload"
      >
        <div v-if="showUploadBtn" class="upload-btn-group">
          <zb-button 
            class="upload-btn" 
            type="default" 
            iconType="antd" 
            icon="upload"
          >
            <template #icon>
              <upload-outlined />
            </template>
            {{ fileList.length > 0 ? btnText2 : btnText }}
          </zb-button>
        </div>
      </a-upload>
    </div>
    
    <!-- 自定义文件列表 -->
    <div class="custom-file-list" v-if="fileList.length > 0">
      <div v-for="file in fileList" :key="file.uid" class="file-item">
        <!-- 图片缩略图 -->
        <div class="file-icon" v-if="isImageFile(file)">
          <img 
            :src="file.url || ''" 
            class="thumbnail-image" 
            @error="handleImageError" 
            alt="缩略图"
          />
        </div>
        
        <!-- 非图片文件图标 -->
        <div class="file-icon" v-else>
          <!-- Excel文件 -->
          <file-excel-outlined v-if="isFileType(file, ['xlsx', 'xls', 'csv'])" style="color: #1D9953" />
          
          <!-- Word文件 -->
          <file-word-outlined v-if="isFileType(file, ['doc', 'docx'])" style="color: #2B5599" />
          
          <!-- PDF文件 -->
          <file-pdf-outlined v-if="isFileType(file, ['pdf'])" style="color: #FF4545" />
          
          <!-- 其他文件 -->
          <file-outlined v-if="!isFileType(file, ['xlsx', 'xls', 'csv', 'doc', 'docx', 'pdf'])" />
        </div>
        
        <!-- 文件名称 -->
        <div class="file-name" @click="handlePreview(file)">
          {{ file.name }}
        </div>
        
        <!-- 删除按钮 -->
        <div v-if="showUploadBtn" class="file-delete" @click="handleRemove(file)">
          <delete-outlined />
        </div>
      </div>
    </div>
    
    <zb-file-preview ref="filePreviewRef" :file-path="filePath" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { 
  UploadOutlined, 
  FileExcelOutlined, 
  FileWordOutlined, 
  FilePdfOutlined, 
  FileOutlined,
  DeleteOutlined
} from '@ant-design/icons-vue';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { PropType } from 'vue';
import { useUserStore } from '../../stores/user';

// 获取环境变量中的基础API URL
const BASE_API = (import.meta as any).env.VITE_APP_BASE_API || '';

// 文件类型常量
const IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
const DOCUMENT_TYPES = {
  excel: ['xlsx', 'xls', 'csv'],
  word: ['doc', 'docx'],
  pdf: ['pdf']
};

// 定义文件信息接口
interface FileInfo {
  id?: string | number;
  uid: string;
  name: string;
  status: string;
  fileType?: string;
  size?: number;
  url?: string;
  fileId?: string;
  fileName?: string;
}

// 定义组件属性
const props = defineProps({
  // 限制上传文件数
  fileLimit: {
    type: Number,
    default: 1
  },
  // 上传文件列表
  modelValue: {
    type: Array as PropType<FileInfo[]>,
    default: () => [],
  },
  // 上传地址
  action: {
    type: String,
    default: '/investment/file/addFile'
  },
  // 文件下载地址
  downloadUrl: {
    type: String,
    default: '/investment/supplierfile/downLoadFileByStream'
  },
  // 文件路径
  filePath: {
    type: String,
    default: '/investment/supplierfile/downLoadFileByStream'
  },
  // 上传文案
  btnText: {
    type: String,
    default: '点击上传'
  },
  // 重新上传文案
  btnText2: {
    type: String,
    default: '继续上传'
  },
  // 文件大小限制(MB)
  sizeMaxMb: {
    type: Number,
    default: 20
  },
  // 文件类型
  accept: {
    type: String,
    default: '.jpg,.png,.pdf,.docx,.xlsx'
  },
  // 是否显示上传按钮
  showUploadBtn: {
    type: Boolean,
    default: true
  },
  // 是否使用真实接口
  useRealApi: {
    type: Boolean,
    default: true
  }
});

// 定义事件
const emit = defineEmits(['update:modelValue']);

// 组件引用
const filePreviewRef = ref<InstanceType<typeof ZbFilePreview> | null>(null);
const loading = ref(false);

// 文件列表
const fileList = computed(() => props.modelValue);

// 判断是否为图片文件
const isImageFile = (file: FileInfo) => {
  const fileExt = file.fileType?.toLowerCase() || getFileExtension(file.name);
  return IMAGE_TYPES.includes(fileExt) && file.url;
};

// 判断文件类型
const isFileType = (file: FileInfo, types: string[]) => {
  const fileExt = file.fileType?.toLowerCase() || getFileExtension(file.name);
  return types.includes(fileExt);
};

// 从文件名获取扩展名
const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};

// 图片加载错误处理
const handleImageError = (e: Event) => {
  if (e.target) {
    (e.target as HTMLImageElement).style.display = 'none';
  }
};

// 上传文件
const uploadFile = async (file: File, uploadUrl: string) => {
  try {
    loading.value = true;
    const formData = new FormData();
    formData.append('file', file);
    
    // 从用户store中获取认证信息和系统ID
    const userStore = useUserStore();
    const { token, user } = userStore;
    
    // 发送上传请求
    const fullUrl = uploadUrl.startsWith('http') ? uploadUrl : BASE_API + uploadUrl;
    const response = await axios.post(fullUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authentication': token || '',
        'SysId': user?.sysId || ''
      }
    });
    
    loading.value = false;
    
    // 处理上传成功的文件信息
    if (response.data.code === 200) {
      return response.data.obj || response.data.data;
    } else {
      throw new Error(response.data.msg || '上传失败');
    }
  } catch (error) {
    loading.value = false;
    console.error('File upload error:', error);
    throw error;
  }
};

// 下载文件
const downloadFileByStream = async (file: FileInfo, downloadUrl: string) => {
  try {
    // 准备下载参数
    const params = {
      filePath: file.id || file.fileId || '',
    };
    
    // 从用户store中获取认证信息
    const userStore = useUserStore();
    const { token, user } = userStore;
    
    // 发送下载请求
    const fullUrl = downloadUrl.startsWith('http') ? downloadUrl : BASE_API + downloadUrl;
    const response = await axios.get(fullUrl, {
      params,
      responseType: 'blob',
      headers: {
        'Authentication': token || '',
        'SysId': user?.sysId || ''
      }
    });
    
    // 创建临时链接并触发下载
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', file.fileName || file.name || 'download');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('File download error:', error);
    message.error('下载失败：' + (error instanceof Error ? error.message : String(error)));
  }
};

// 为图片文件设置预览URL
const setImagePreview = (file: File, fileInfo: FileInfo, fileList: FileInfo[]): Promise<void> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        const index = fileList.findIndex(item => item.uid === fileInfo.uid);
        if (index !== -1) {
          fileList[index] = { 
            ...fileList[index], 
            url: e.target.result as string
          };
          emit('update:modelValue', [...fileList]);
        }
      }
      resolve();
    };
    reader.readAsDataURL(file);
  });
};

// 文件上传前的处理
const handleBeforeUpload = async (file: File) => {
  // 检查文件大小
  const isLtLimit = file.size / 1024 / 1024 <= props.sizeMaxMb;
  if (!isLtLimit) {
    message.error(`文件大小不能超过 ${props.sizeMaxMb}MB!`);
    return false;
  }

  // 获取文件类型
  const fileType = getFileExtension(file.name);
  const isImage = IMAGE_TYPES.includes(fileType);

  // 创建临时文件对象
  const fileInfo: FileInfo = {
    uid: `upload-${Date.now()}-${uuidv4()}`,
    name: file.name,
    status: 'uploading',
    fileType: fileType,
    size: file.size
  };

  // 先添加到文件列表，显示上传中状态
  let newList = [...props.modelValue, fileInfo];
  if (props.fileLimit > 0) {
    newList = newList.slice(-props.fileLimit);
  }
  emit('update:modelValue', newList);

  if (props.useRealApi) {
    try {
      // 上传文件到服务器
      const fileData = await uploadFile(file, props.action);
      
      if (fileData) {
        // 获取上传后的文件信息
        const index = newList.findIndex(item => item.uid === fileInfo.uid);
        
        if (index !== -1) {
          // 更新文件状态和ID
          newList[index] = { 
            ...newList[index], 
            id: fileData.id || fileData.fileId,
            name: fileData.name || newList[index].name,
            status: 'done' 
          };
          
          // 对于图片类型，生成预览URL
          if (isImage) {
            await setImagePreview(file, fileInfo, newList);
          } else {
            emit('update:modelValue', [...newList]);
          }
        }
      } else {
        // 上传失败，从列表中移除
        newList = newList.filter(item => item.uid !== fileInfo.uid);
        emit('update:modelValue', newList);
      }
    } catch (error) {
      console.error('文件处理失败:', error);
      message.error('文件处理失败，请重试');
      
      // 从列表中移除上传失败的文件
      newList = newList.filter(item => item.uid !== fileInfo.uid);
      emit('update:modelValue', newList);
    }
  } else {
    // 模拟上传过程
    setTimeout(() => {
      // 找到当前上传的文件并更新状态
      const index = newList.findIndex(item => item.uid === fileInfo.uid);
      if (index !== -1) {
        // 模拟文件ID
        const fileId = `file-${Date.now()}`; 
        newList[index] = { 
          ...newList[index], 
          id: fileId,
          status: 'done' 
        };
        
        // 对于图片类型，生成预览URL
        if (isImage) {
          setImagePreview(file, fileInfo, newList);
        } else {
          emit('update:modelValue', [...newList]);
        }
      }
    }, 1000); // 减少模拟延迟时间
  }

  // 阻止默认上传行为
  return false;
};

// 文件预览
const handlePreview = (file: FileInfo) => {
  if (filePreviewRef.value) {
    // 确保有fileName属性
    const previewFile = { ...file, fileName: file.fileName || file.name };
    filePreviewRef.value.openFile(previewFile);
  }
};

// 移除文件
const handleRemove = (file: FileInfo) => {
  const updatedList = props.modelValue.filter(item => item.uid !== file.uid);
  emit('update:modelValue', updatedList);
};

// 暴露给父组件的方法
defineExpose({
  preview: handlePreview,
  removeFile: handleRemove,
  downloadFile: downloadFileByStream
});
</script>

<style lang="less" scoped>
@import '../../assets/styles/design-tokens.less';

.file-upload-wrapper {
  width: 100%;
  margin-bottom: 16px;
  
  .upload-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    
    .upload-label {
      font-size: 14px;
      color: #333;
      margin-right: 8px;
    }
    
    .upload-btn-group {
      .upload-btn {
        color: #425bf4;
        border: 1px solid #425bf4;
        background: #fff;
        
        &:hover {
          color: lighten(#425bf4, 10%);
          border-color: lighten(#425bf4, 10%);
        }
      }
    }
  }
  
  .custom-file-list {
    margin-top: 8px;
    
    .file-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      width: fit-content;
      max-width: 100%;
      
      .file-icon {
        flex-shrink: 0;
        font-size: 24px;
        margin-right: 8px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .thumbnail-image {
          width: 24px;
          height: 24px;
          object-fit: cover;
          border-radius: 2px;
        }
      }
      
      .file-name {
        flex: 0 1 auto;
        margin-right: 8px;
        font-size: 14px;
        color: #333;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 500px;
        
        &:hover {
          color: #425bf4;
        }
      }
      
      .file-delete {
        flex-shrink: 0;
        color: #999;
        cursor: pointer;
        font-size: 16px;
        padding: 0 4px;
        
        &:hover {
          color: #ff4d4f;
        }
      }

      &:hover {
        background-color: #f9f9f9;
      }
    }
  }
}
</style> 