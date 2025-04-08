<!--
  auther: Johnson
  date: 2025-04-02
  description: 文件预览组件，支持多种文件类型预览
-->
<template>
  <div class="screen_file_view" v-if="show">
    <div class="file_layout disflex" :class="contentTypeClass">
      <img 
        ref="imgRef" 
        :src="fileUrl" 
        class="img_content" 
        v-if="fileType === '1'" 
        :style="imageStyle" 
        @wheel.prevent="handleWheel" 
        @mousedown="startDrag" 
      />
      <video
        id="video"
        controls
        class="video_content"
        :src="fileUrl"
        v-else-if="fileType === '2'"
      ></video>
      <div 
        class="only-office-view" 
        id="onlyOfficeView" 
        v-else-if="['3', '4', '5', '6', '7'].includes(fileType)" 
      >
        <div id="vabOnlyOffice" ref="vabOnlyOffice"></div>
      </div>
      <div class="close_b" @click="close" :style="closeClass">
        <close-circle-outlined />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, defineComponent } from 'vue';
import { CloseCircleOutlined } from '@ant-design/icons-vue';
import { v4 as uuidv4 } from 'uuid';
import { message } from 'ant-design-vue';
import request from '../../utils/request';
import { useUserStore } from '../../stores/user';

// 定义文件信息接口
interface FileInfo {
  id?: string | number;
  uid?: string;
  name: string;
  fileName?: string;
  status?: string;
  fileType?: string;
  url?: string;
}

export default defineComponent({
  name: 'ZbFilePreview',
  components: {
    CloseCircleOutlined
  },
  props: {
    filePath: {
      type: String,
      default: 'api/file/download'
    }
  },
  setup(props) {
    // 基本状态
    const show = ref(false);
    const fileUrl = ref('');
    const fileType = ref('');
    const imgRef = ref<HTMLImageElement | null>(null);
    const vabOnlyOffice = ref<HTMLElement | null>(null);
    const showLoading = ref(false);
    const onlyUrl = ref('');
    const doctype = ref('');
    let docEditor: any = null;
    
    // 图片缩放拖拽相关状态
    const scale = ref(1);
    const isDragging = ref(false);
    const startX = ref(0);
    const startY = ref(0);
    const translateX = ref(0);
    const translateY = ref(0);
    const imgHeight = ref('');
    const marginT = ref('');
    
    // OnlyOffice配置
    const onlyOfficeConfig = ref({
      url: '', // 附件地址
      isEdit: false, // 是否可以编辑 true可以传 false只能查看
      download: true, // 是否可以下载 true可以传 false只能查看
      fileType: 'pdf', // 文件类型ppt xlsm docx等
      title: '231.pdf', // only页面展示名称 // 文件名
      lang: 'en',
      isPrint: true, // 是否打印 true可以 false不可以
      user: { id: '', name: '' }, // 用户id和名称。用户展示文档标题 和传回后台 // 文件id  // 上传人姓名
      editUrl: '', // 保存文件回调地址
      key: '', // 打开文件的id, 必须是唯一的
      model: 'view'
    });
    
    // 计算属性
    const imageStyle = computed(() => {
      return {
      transform: `scale(${scale.value}) translate(${translateX.value}px, ${translateY.value}px)`,
      cursor: isDragging.value ? 'grabbing' : 'grab'
      };
    });
    
    const contentTypeClass = computed(() => {
      return {
      'image-content': fileType.value === '1',
      'video-content': fileType.value === '2',
      'office-content': ['3', '4', '5', '6', '7'].includes(fileType.value)
      };
    });
    
    const closeClass = computed(() => {
      return {
        height: imgHeight.value + 'px',
        'margin-top': marginT.value + 'px'
      };
    });
    
    // 从服务器获取OnlyOffice API地址
    const getOnlyOffice = (callback: () => void) => {
      // 获取系统配置的OnlyOffice API地址
      request.get("auth/sysBase/getSysBase", {
        sysKey: "only_office_api"
      }).then(response => {
        if (response.data && response.data.code == 200) {
          const data = response.data;
          if (data.obj && data.obj.sysValue) {
            onlyUrl.value = data.obj.sysValue;
            console.log('获取到OnlyOffice API地址:', onlyUrl.value);
            
            // 如果尚未加载 DocsAPI，动态加载脚本
            if (!(window as any).DocsAPI) {
              console.log('正在加载OnlyOffice API脚本...');
              const script = document.createElement("script");
              script.type = 'text/javascript';
              script.src = onlyUrl.value;
              script.onload = () => {
                console.log('OnlyOffice API脚本加载成功');
                callback && callback();
              };
              script.onerror = (error) => {
                console.error('加载OnlyOffice API失败:', error);
                message.error('加载OnlyOffice API失败，请刷新重试');
              };
              
              // 插入到body的第一个元素前
              const firstChild = document.body.firstChild;
              document.body.insertBefore(script, firstChild);
            } else {
              // 如果已加载，直接调用回调
              console.log('OnlyOffice API已加载');
              callback && callback();
            }
          } else {
            message.error('无法获取OnlyOffice API地址');
          }
        } else {
          message.error('获取OnlyOffice API地址失败');
        }
      }).catch(error => {
        console.error('获取OnlyOffice API地址出错:', error);
        message.error('获取OnlyOffice API地址失败');
      });
    };
    
    // 尝试下载文件并以base64形式提供给OnlyOffice
    const tryDownloadFile = async (fileUrl: string, fileExt: string): Promise<string | null> => {
      console.log('尝试直接下载文件:', fileUrl);
      try {
        // 获取认证信息
        const userStore = useUserStore();
        const token = userStore.token || '';
        const sysId = userStore.user?.sysId ? String(userStore.user.sysId) : '';
        
        // 使用fetch API直接获取文件
        const headers: HeadersInit = {
          'Authentication': token
        };
        
        // 只有在sysId存在时才添加
        if (sysId) {
          headers['SysId'] = sysId;
        }
        
        const response = await fetch(fileUrl, {
          method: 'GET',
          credentials: 'include', // 包含凭证
          headers
        });
        
        if (response.ok) {
          const blob = await response.blob();
          // 检查文件是否太大
          console.log('文件大小:', blob.size, 'bytes');
          
          // 创建Blob URL
          const blobUrl = URL.createObjectURL(blob);
          console.log('创建Blob URL:', blobUrl);
          return blobUrl;
        } else {
          console.error('获取文件失败，状态:', response.status);
          return null;
        }
      } catch (error) {
        console.error('下载文件失败:', error);
        return null;
      }
    };
    
    // 初始化编辑器
    const setEditor = (option: any) => {
      // 如果已存在编辑器实例，先销毁
      if (docEditor !== null) {
        docEditor.destroyEditor();
        docEditor = null;
      }
      
      // 确定文档类型
      const fileType = option.fileType.toLowerCase();
      const documentType = getCorrectDocumentType(fileType);
      
      // 编辑器配置
      const config = {
        type: "embedded",
        document: {
          fileType: option.fileType,
          key: option.key || "",
          title: option.title,
          info: {
            author: 'author name',
            owner: 'owner name',
            folder: 'path to document',
            created: new Date().toISOString(),
            uploaded: new Date().toISOString()
          },
          permissions: {
            edit: option.isEdit, 
            print: option.isPrint,
            download: option.download,
            comment: option.isEdit,
            deleteCommentAuthorOnly: true,
            editCommentAuthorOnly: true
          },
          url: option.url
        },
        documentType: documentType,
        editorConfig: {
          callbackUrl: option.editUrl,
          lang: option.lang,
          customization: {
            autosave: false,
            chat: false,
            comments: false,
            help: false,
            plugins: true,
          },
          user: {
            id: option.user.id || '1',
            name: option.user.name || 'User'
          },
          mode: option.model ? option.model : "view"
        },
        width: "100%",
        height: "100%",
        events: {
          onAppReady: initCss,
          onDocumentStateChange: onDocumentStateChange,
          onError: onDocumentError
        }
      };
      
      // 创建编辑器实例
      try {
        const DocsAPI = (window as any).DocsAPI;
        if (!DocsAPI) {
          throw new Error('DocsAPI 未加载成功');
        }
        docEditor = new DocsAPI.DocEditor("vabOnlyOffice", config);
      } catch (error) {
        console.error('初始化OnlyOffice编辑器失败:', error);
        message.error('初始化文档预览器失败');
      }
    };
    
    // 样式初始化回调
    const initCss = (event: any) => {
      console.log('OnlyOffice编辑器初始化完成', event);
      showLoading.value = false;
    };
    
    // 文档状态变化回调
    const onDocumentStateChange = (event: any) => {
      console.log('文档状态变化:', event);
    };
    
    // 文档错误回调
    const onDocumentError = (event: any) => {
      console.error('文档加载错误:', event);
      message.error('文档加载失败');
      showLoading.value = false;
    };
    
    // 打开文件
    const openFile = (file: FileInfo) => {
      fileUrl.value = '';
      fileType.value = '';
      show.value = true;
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      isDragging.value = false;
      
      const fileName = file.fileName || file.name;
      
      if (!isImg(fileName) && !isVideo(fileName)) {
        showLoading.value = true;
      }
      
      if (isImg(fileName)) {
        fileType.value = '1';
        fileUrl.value = file.url || `${props.filePath}?id=${file.id}`;
      } else if (isVideo(fileName)) {
        fileType.value = '2';
        fileUrl.value = file.url || `${props.filePath}?id=${file.id}`;
      } else if (isWord(fileName)) {
        fileType.value = '3';
        fileUrl.value = file.url || `${props.filePath}?id=${file.id}`;
        officeView(file);
      } else if (isExcel(fileName)) {
        fileType.value = '4';
        fileUrl.value = file.url || `${props.filePath}?id=${file.id}`;
        officeView(file);
      } else if (isPDF(fileName)) {
        fileType.value = '5';
        fileUrl.value = file.url || `${props.filePath}?id=${file.id}`;
        officeView(file);
      } else if (isPPT(fileName)) {
        fileType.value = '6';
        fileUrl.value = file.url || `${props.filePath}?id=${file.id}`;
        officeView(file);
      } else if (isTXT(fileName)) {
        fileType.value = '7';
        fileUrl.value = file.url || `${props.filePath}?id=${file.id}`;
        officeView(file);
      }
      
      // 设置元素尺寸
      setTimeout(() => {
        if (imgRef.value) {
          imgHeight.value = imgRef.value.offsetHeight + '';
          marginT.value = '-28';
        }
        if (vabOnlyOffice.value) {
          imgHeight.value = '900';
          marginT.value = '-8';
        }
      }, 100);
    };
    
    // 处理Office文件预览
    const officeView = async (file: FileInfo) => {
      // 显示加载状态
      showLoading.value = true;
      
      // 获取文件信息
      const fileName = file.fileName || file.name;
      const fileExt = getExtension(fileName);
      
      // 设置基本配置
      onlyOfficeConfig.value.key = uuidv4();
      onlyOfficeConfig.value.fileType = fileExt;
      onlyOfficeConfig.value.title = fileName;
      onlyOfficeConfig.value.url = file.url || `${props.filePath}?id=${file.id}`;
      
      // 获取OnlyOffice API并初始化编辑器
      getOnlyOffice(() => {
        if (onlyOfficeConfig.value.url) {
          setEditor(onlyOfficeConfig.value);
        } else {
          message.error('文件URL无效，无法预览');
          showLoading.value = false;
        }
      });
    };
    
    // 关闭预览
    const close = () => {
      show.value = false;
      
      // 销毁编辑器实例
      if (docEditor) {
        try {
          docEditor.destroyEditor();
          docEditor = null;
        } catch (error) {
          console.error('销毁编辑器失败:', error);
        }
      }
    };
    
    // 获取文件扩展名
    const getExtension = (filename: string): string => {
      return filename.split('.').pop()?.toLowerCase() || '';
    };
    
    // 文件类型检测
    const isImg = (file: string) => /\.(png|jpeg|jpg|gif)$/i.test(file);
    const isVideo = (file: string) => /\.(swf|flv|mp4|rmvb|avi|mpeg|ra|ram|mov|wmv)$/i.test(file);
    const isWord = (file: string) => /\.(docx|doc)$/i.test(file);
    const isExcel = (file: string) => /\.(xlsx|xls)$/i.test(file);
    const isPPT = (file: string) => /\.(pptx)$/i.test(file);
    const isPDF = (file: string) => /\.(pdf)$/i.test(file);
    const isTXT = (file: string) => /\.(txt)$/i.test(file);
    
    // 图片缩放
    const handleWheel = (e: WheelEvent) => {
      if (fileType.value !== '1') return;
      
      // 调整缩放步长，根据当前缩放比例动态计算
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      const newScale = scale.value + (scale.value * delta);
      
      // 扩大缩放范围到0.1-8
      if (newScale >= 0.1 && newScale <= 8) {
        scale.value = Number(newScale.toFixed(2));
      }
    };
    
    // 图片拖拽
    const startDrag = (e: MouseEvent) => {
      if (fileType.value !== '1') return;
      e.preventDefault(); // 防止拖动时选中图片
      
      isDragging.value = true;
      startX.value = e.clientX - (translateX.value * scale.value);
      startY.value = e.clientY - (translateY.value * scale.value);
      
      // 添加事件监听器到window对象
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      
      if (e.target) {
        (e.target as HTMLElement).style.cursor = 'grabbing';
      }
    };
    
    const handleDrag = (e: MouseEvent) => {
      if (!isDragging.value) return;
      e.preventDefault();
      
      // 直接更新位置，不使用requestAnimationFrame
      translateX.value = (e.clientX - startX.value) / scale.value;
      translateY.value = (e.clientY - startY.value) / scale.value;
    };
    
    const handleDragEnd = (e: MouseEvent) => {
      if (!isDragging.value) return;
      
      isDragging.value = false;
      if (e.target) {
        (e.target as HTMLElement).style.cursor = 'grab';
      }
      
      // 移除事件监听器
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
    
    // 组件清理
    onBeforeUnmount(() => {
      // 确保移除所有事件监听器
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
      
      // 销毁编辑器实例
      if (docEditor) {
        try {
          docEditor.destroyEditor();
          docEditor = null;
        } catch (error) {
          console.error('销毁编辑器失败:', error);
        }
      }
    });
    
    // 获取正确的OnlyOffice文档类型值
    function getCorrectDocumentType(fileType: string) {
      const docTypes = [
        "doc", "docm", "docx", "dot", "dotm", "dotx", "epub", "fodt",
        "htm", "html", "mht", "odt", "ott", "pdf", "rtf", "txt", "djvu", "xps"
      ];
      const spreadsheetTypes = [
        "csv", "fods", "ods", "ots", "xls", "xlsm", "xlsx", "xlt", "xltm", "xltx"
      ];
      const presentationTypes = [
        "fodp", "odp", "otp", "pot", "potm", "potx", "pps", "ppsm", "ppsx", "ppt", "pptm", "pptx"
      ];
      
      if (docTypes.includes(fileType)) {
        return "word";
      }
      if (spreadsheetTypes.includes(fileType)) {
        return "cell";
      }
      if (presentationTypes.includes(fileType)) {
        return "slide";
      }
      if (fileType === "pdf") {
        return "pdf";
      }
      
      return "word";
    }
    
    return {
      show,
      fileUrl,
      fileType,
      imgRef,
      vabOnlyOffice,
      scale,
      translateX,
      translateY,
      imageStyle,
      contentTypeClass,
      closeClass,
      imgHeight,
      marginT,
      openFile,
      close,
      handleWheel,
      startDrag
    };
  }
});
</script>

<style lang="less" scoped>
.screen_file_view {
  position: fixed;
  z-index: 99999999;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  background-color: #07071a8c;

  .close_b {
    margin-left: 15px;
    color: #fff;
    z-index: 99999999;
    cursor: pointer;

    i {
      font-size: 27px;
    }
  }
  
  .disflex {
    display: flex !important;
    flex-direction: row !important;
  }
  
  .file_layout {
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: 99999998;
    padding: 15px;
    text-align: center;
    cursor: auto;
    
    // 图片类型的布局
    &.image-content {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    // 视频类型的布局
    &.video-content {
      width: 1000px;
      height: 600px;
      top: 119px;
    }

    // office文档类型的布局
    &.office-content {
      width: 1000px;
      height: calc(100vh - 20px);
      top: 20px;
    }

    .only-office-view {
      height: 100%;
      width: 100%;
    }

    .video_content {
      width: 100%;
      height: 100%;
    }

    .img_content {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
      transition: transform 0.1s ease;
      cursor: grab;
      user-select: none;
      will-change: transform;
    }
  }
}
</style> 