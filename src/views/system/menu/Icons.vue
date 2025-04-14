<template>
  <div>
    <a-modal
      title="选择图标"
      :open="visible"
      :width="980"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane v-for="icon in ['direction', 'suggested', 'edit', 'data', 'web', 'logo']" :key="icon" :tab="getTabTitle(icon)">
          <div class="icon-list">
            <div
              v-for="(iconName, index) in getIconsByType(icon)"
              :key="`${icon}-${index}`"
              class="icon-item"
              @click="handleChoose(iconName)"
              :class="{ 'icon-selected': selectedIcon === iconName }"
            >
              <span class="icon-container">
                <component :is="resolveIconComponent(iconName)" />
              </span>
              <div class="icon-name">{{ iconName }}</div>
            </div>
          </div>
        </a-tab-pane>
      </a-tabs>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import IconUtils from '@/utils/iconUtils';
import * as Icons from '@ant-design/icons-vue';

const visible = ref(false);
const activeKey = ref('direction');
// 添加selectedIcon变量跟踪当前选择的图标
const selectedIcon = ref('');

// 定义事件
const emit = defineEmits(['select']);

// 获取所有图标名称
const allIcons = Object.keys(IconUtils.getAllIcons())
  .filter(key => key.endsWith('Outlined') || key.endsWith('Filled') || key.endsWith('TwoTone'))
  .sort();

// 初始化所有图标组件
onMounted(() => {
  console.log('图标组件已初始化，共有图标:', allIcons.length);
});

// 方向性图标
const directionIcons = [
  'StepBackwardOutlined', 'StepForwardOutlined', 'FastBackwardOutlined', 'FastForwardOutlined',
  'ShrinkOutlined', 'ArrowsAltOutlined', 'DownOutlined', 'UpOutlined', 'LeftOutlined', 'RightOutlined',
  'CaretUpOutlined', 'CaretDownOutlined', 'CaretLeftOutlined', 'CaretRightOutlined', 'UpCircleOutlined',
  'DownCircleOutlined', 'LeftCircleOutlined', 'RightCircleOutlined', 'VerticalAlignTopOutlined',
  'VerticalAlignMiddleOutlined', 'VerticalAlignBottomOutlined', 'ForwardOutlined', 'BackwardOutlined',
  'RollbackOutlined', 'EnterOutlined', 'RetweetOutlined', 'SwapOutlined', 'SwapLeftOutlined',
  'SwapRightOutlined', 'ArrowLeftOutlined', 'ArrowRightOutlined', 'ArrowUpOutlined', 'ArrowDownOutlined',
  'FullscreenOutlined', 'FullscreenExitOutlined'
];

// 提示建议性图标
const suggestedIcons = [
  'QuestionOutlined', 'QuestionCircleOutlined', 'PlusOutlined', 'PlusCircleOutlined', 'PauseOutlined',
  'PauseCircleOutlined', 'MinusOutlined', 'MinusCircleOutlined', 'PlusSquareOutlined', 'MinusSquareOutlined',
  'InfoOutlined', 'InfoCircleOutlined', 'ExclamationOutlined', 'ExclamationCircleOutlined', 'CloseOutlined',
  'CloseCircleOutlined', 'CloseSquareOutlined', 'CheckOutlined', 'CheckCircleOutlined', 'CheckSquareOutlined',
  'ClockCircleOutlined', 'WarningOutlined', 'IssuesCloseOutlined', 'StopOutlined'
];

// 编辑类图标
const editIcons = [
  'EditOutlined', 'FormOutlined', 'CopyOutlined', 'ScissorOutlined', 'DeleteOutlined', 'SnippetsOutlined',
  'DiffOutlined', 'HighlightOutlined', 'AlignCenterOutlined', 'AlignLeftOutlined', 'AlignRightOutlined',
  'BgColorsOutlined', 'BoldOutlined', 'ItalicOutlined', 'UnderlineOutlined', 'StrikethroughOutlined',
  'RedoOutlined', 'UndoOutlined', 'ZoomInOutlined', 'ZoomOutOutlined', 'FontColorsOutlined',
  'FontSizeOutlined', 'LineHeightOutlined', 'DashOutlined', 'SmallDashOutlined', 'SortAscendingOutlined',
  'SortDescendingOutlined', 'DragOutlined', 'OrderedListOutlined', 'UnorderedListOutlined', 'RadiusSettingOutlined'
];

// 数据类图标
const dataIcons = [
  'AreaChartOutlined', 'PieChartOutlined', 'BarChartOutlined', 'DotChartOutlined', 'LineChartOutlined',
  'RadarChartOutlined', 'HeatMapOutlined', 'FallOutlined', 'RiseOutlined', 'StockOutlined',
  'BoxPlotOutlined', 'FundOutlined', 'SlidersOutlined'
];

// 网站通用图标
const webIcons = [
  'AccountBookOutlined', 'AimOutlined', 'AlertOutlined', 'ApartmentOutlined', 'ApiOutlined', 'AppstoreAddOutlined',
  'AppstoreOutlined', 'AudioOutlined', 'AudioMutedOutlined', 'AuditOutlined', 'BankOutlined',
  'BarcodeOutlined', 'BarsOutlined', 'BellOutlined', 'BlockOutlined', 'BookOutlined', 'BorderOutlined',
  'BorderlessTableOutlined', 'BranchesOutlined', 'BuildOutlined', 'BulbOutlined', 'CalculatorOutlined',
  'CalendarOutlined', 'CameraOutlined', 'CarOutlined', 'CarryOutOutlined', 'CiCircleOutlined',
  'CiOutlined', 'CloudDownloadOutlined', 'CloudOutlined', 'CloudServerOutlined', 'CloudSyncOutlined',
  'CloudUploadOutlined', 'ClusterOutlined', 'CodeOutlined', 'CoffeeOutlined', 'CommentOutlined',
  'CompassOutlined', 'CompressOutlined', 'ConsoleSqlOutlined', 'ContactsOutlined', 'ContainerOutlined',
  'ControlOutlined', 'CreditCardOutlined', 'CrownOutlined', 'CustomerServiceOutlined', 'DashboardOutlined',
  'DatabaseOutlined', 'DesktopOutlined', 'DingtalkOutlined', 'DisconnectOutlined', 'DislikeOutlined',
  'DollarCircleOutlined', 'DollarOutlined', 'DownloadOutlined', 'EllipsisOutlined', 'EnvironmentOutlined',
  'EuroCircleOutlined', 'EuroOutlined', 'ExceptionOutlined', 'ExpandAltOutlined', 'ExpandOutlined',
  'ExperimentOutlined', 'ExportOutlined', 'EyeOutlined', 'EyeInvisibleOutlined', 'FieldBinaryOutlined',
  'FieldNumberOutlined', 'FieldStringOutlined', 'FieldTimeOutlined', 'FileAddOutlined', 'FileDoneOutlined',
  'FileExcelOutlined', 'FileExclamationOutlined', 'FileOutlined', 'FileGifOutlined', 'FileImageOutlined',
  'FileJpgOutlined', 'FileMarkdownOutlined', 'FilePdfOutlined', 'FilePptOutlined', 'FileProtectOutlined',
  'FileSearchOutlined', 'FileTextOutlined', 'FileUnknownOutlined', 'FileWordOutlined', 'FileZipOutlined',
  'FilterOutlined', 'FireOutlined', 'FlagOutlined', 'FolderAddOutlined', 'FolderOutlined',
  'FolderOpenOutlined', 'FolderViewOutlined', 'ForkOutlined', 'FormatPainterOutlined', 'FrownOutlined',
  'FunctionOutlined', 'FunnelPlotOutlined', 'GiftOutlined', 'GlobalOutlined', 'GoldOutlined',
  'GroupOutlined', 'HddOutlined', 'HeartOutlined', 'HistoryOutlined', 'HomeOutlined',
  'HourglassOutlined', 'IdcardOutlined', 'ImportOutlined', 'InboxOutlined', 'InsertRowAboveOutlined',
  'InsertRowBelowOutlined', 'InsertRowLeftOutlined', 'InsertRowRightOutlined', 'InsuranceOutlined',
  'InteractionOutlined', 'KeyOutlined', 'LaptopOutlined', 'LayoutOutlined', 'LikeOutlined',
  'LineOutlined', 'LinkOutlined', 'LoadingOutlined', 'LockOutlined', 'MacCommandOutlined',
  'MailOutlined', 'ManOutlined', 'MedicineBoxOutlined', 'MehOutlined', 'MenuOutlined',
  'MergeCellsOutlined', 'MessageOutlined', 'MobileOutlined', 'MoneyCollectOutlined', 'MonitorOutlined',
  'MoreOutlined', 'NodeCollapseOutlined', 'NodeExpandOutlined', 'NodeIndexOutlined', 'NotificationOutlined',
  'NumberOutlined', 'OneToOneOutlined', 'PaperClipOutlined', 'PartitionOutlined', 'PayCircleOutlined',
  'PercentageOutlined', 'PhoneOutlined', 'PictureOutlined', 'PlaySquareOutlined', 'PoundCircleOutlined',
  'PoundOutlined', 'PoweroffOutlined', 'PrinterOutlined', 'ProfileOutlined', 'ProjectOutlined',
  'PropertySafetyOutlined', 'PullRequestOutlined', 'PushpinOutlined', 'QrcodeOutlined', 'ReadOutlined',
  'ReconciliationOutlined', 'RedEnvelopeOutlined', 'ReloadOutlined', 'RestOutlined', 'RobotOutlined',
  'RocketOutlined', 'SaveOutlined', 'ScanOutlined', 'ScheduleOutlined', 'SearchOutlined',
  'SecurityScanOutlined', 'SelectOutlined', 'SendOutlined', 'SettingOutlined', 'ShakeOutlined',
  'ShareAltOutlined', 'ShopOutlined', 'ShoppingCartOutlined', 'ShoppingOutlined', 'SisternodeOutlined',
  'SkinOutlined', 'SmileOutlined', 'SolutionOutlined', 'SoundOutlined', 'SplitCellsOutlined',
  'StarOutlined', 'SubnodeOutlined', 'SwitcherOutlined', 'SyncOutlined', 'TableOutlined',
  'TabletOutlined', 'TagOutlined', 'TagsOutlined', 'TeamOutlined', 'ThunderboltOutlined',
  'ToTopOutlined', 'ToolOutlined', 'TrademarkCircleOutlined', 'TrademarkOutlined', 'TransactionOutlined',
  'TranslationOutlined', 'TrophyOutlined', 'UngroupOutlined', 'UnlockOutlined', 'UploadOutlined',
  'UserAddOutlined', 'UserDeleteOutlined', 'UserOutlined', 'UserSwitchOutlined', 'UsergroupAddOutlined',
  'UsergroupDeleteOutlined', 'VerifiedOutlined', 'VideoCameraAddOutlined', 'VideoCameraOutlined',
  'WalletOutlined', 'WhatsAppOutlined', 'WifiOutlined', 'WomanOutlined'
];

// 品牌和标识图标
const logoIcons = [
  'AndroidOutlined', 'AppleOutlined', 'WindowsOutlined', 'IeOutlined', 'ChromeOutlined',
  'GithubOutlined', 'AliwangwangOutlined', 'DingdingOutlined', 'WeiboSquareOutlined',
  'WeiboCircleOutlined', 'TaobaoCircleOutlined', 'Html5Outlined', 'WeiboOutlined',
  'TwitterOutlined', 'WechatOutlined', 'YoutubeOutlined', 'AlipayCircleOutlined',
  'TaobaoOutlined', 'SkypeOutlined', 'QqOutlined', 'MediumWorkmarkOutlined',
  'GitlabOutlined', 'MediumOutlined', 'LinkedinOutlined', 'GooglePlusOutlined',
  'DropboxOutlined', 'FacebookOutlined', 'CodepenOutlined', 'CodeSandboxOutlined',
  'AmazonOutlined', 'GoogleOutlined', 'CodepenCircleOutlined', 'AlipayOutlined',
  'AntDesignOutlined', 'AntCloudOutlined', 'AliyunOutlined', 'ZhihuOutlined',
  'SlackOutlined', 'SlackSquareOutlined', 'BehanceOutlined', 'BehanceSquareOutlined',
  'DribbbleOutlined', 'DribbbleSquareOutlined', 'InstagramOutlined', 'YuqueOutlined',
  'AlibabaOutlined', 'YahooOutlined', 'RedditOutlined', 'SketchOutlined'
];

// 打开图标选择器
const open = () => {
  visible.value = true;
};

// 处理取消
const handleCancel = () => {
  visible.value = false;
};

// 处理确定按钮点击
const handleOk = () => {
  visible.value = false;
  // 如果已经选择了图标，则触发选择事件
  if (selectedIcon.value) {
    emit('select', selectedIcon.value);
  }
};

// 处理选择图标
const handleChoose = (icon) => {
  selectedIcon.value = icon;
  console.log('选择图标:', icon);

  // 确保图标是有效的
  if (IconUtils.getIconComponent(icon)) {
    // 延迟关闭，让用户看到选择效果
    setTimeout(() => {
      emit('select', icon);
      visible.value = false;
    }, 300);
  } else {
    console.error('选择的图标不存在:', icon);
  }
};

// 根据类型获取对应图标
const getIconsByType = (type) => {
  switch (type) {
    case 'direction':
      return directionIcons;
    case 'suggested':
      return suggestedIcons;
    case 'edit':
      return editIcons;
    case 'data':
      return dataIcons;
    case 'web':
      return webIcons;
    case 'logo':
      return logoIcons;
    default:
      return [];
  }
};

// 获取Tab标题
const getTabTitle = (type) => {
  const titleMap = {
    'direction': '方向性图标',
    'suggested': '提示建议性图标',
    'edit': '编辑类图标',
    'data': '数据类图标',
    'web': '网站通用图标',
    'logo': '品牌和标识'
  };
  return titleMap[type] || type;
};

// 处理图标名称到组件的转换
const resolveIconComponent = (iconName) => {
  // 1. 尝试从导入的图标中获取
  if (Icons[iconName]) {
    return Icons[iconName];
  }
  
  // 2. 使用IconUtils处理
  return IconUtils.getIconComponent(iconName);
};

// 暴露方法给父组件
defineExpose({
  open
});
</script>

<style scoped>
.icon-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 8px;
}

.icon-item {
  width: 16.66%;
  text-align: center;
  cursor: pointer;
  padding: 10px 0;
  height: 85px;
  transition: all 0.3s;
  border-radius: 4px;
  position: relative;
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  font-size: 24px;
}

.icon-item:hover {
  background-color: #f0f5ff;
  color: #1890ff;
}

.icon-selected {
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.icon-name {
  margin-top: 8px;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  padding: 0 5px;
}
</style>
