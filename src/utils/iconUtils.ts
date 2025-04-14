import {
  HomeOutlined,
  SettingOutlined,
  UserOutlined,
  TeamOutlined,
  FileOutlined,
  AppstoreOutlined,
  SafetyCertificateOutlined,
  MenuOutlined,
  DashboardOutlined,
  GlobalOutlined,
  FormOutlined,
  TableOutlined,
  MessageOutlined,
  MailOutlined,
  BellOutlined,
  CalendarOutlined,
  FolderOutlined,
  ProjectOutlined,
  ShopOutlined,
  MoneyCollectOutlined,
  DollarOutlined,
  AreaChartOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  EyeOutlined,
  LockOutlined,
  KeyOutlined,
  TagOutlined,
  TagsOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  UploadOutlined,
  DownloadOutlined,
  CloudOutlined,
  PrinterOutlined,
  SearchOutlined,
  FilterOutlined,
  LinkOutlined,
  PlusOutlined,
  MinusOutlined,
  QuestionOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CheckOutlined,
  CloseOutlined,
  LaptopOutlined,
  MobileOutlined,
  TabletOutlined,
  CarOutlined,
  ClockCircleOutlined,
  ScheduleOutlined,
  StarOutlined,
  HeartOutlined,
  EnvironmentOutlined
} from '@ant-design/icons-vue';

/**
 * 图标工具类
 * 用于处理图标名称映射和组件获取
 */
export class IconUtils {
  /**
   * 特殊图标名称映射表
   * 将旧版图标名称映射到新版图标组件名称
   */
  private static specialIconMapping: Record<string, string> = {
    'appstore-o': 'AppstoreOutlined',
    'appstore': 'AppstoreOutlined',
    'setting-o': 'SettingOutlined',
    'user-o': 'UserOutlined',
    'team-o': 'TeamOutlined',
    'file-o': 'FileOutlined',
    'safety-o': 'SafetyCertificateOutlined',
    'menu-o': 'MenuOutlined',
    'dashboard-o': 'DashboardOutlined',
    'global-o': 'GlobalOutlined',
    'profile-o': 'UserOutlined',
    'form-o': 'FormOutlined',
    'table-o': 'TableOutlined',
    'message-o': 'MessageOutlined',
    'mail-o': 'MailOutlined',
    'bell-o': 'BellOutlined',
    'calendar-o': 'CalendarOutlined',
    'folder-o': 'FolderOutlined',
    'system': 'AppstoreOutlined',
    'appstoreo': 'AppstoreOutlined',
    'setting': 'SettingOutlined',
    'settingo': 'SettingOutlined'
  };

  /**
   * 图标组件映射表 - 完整组件名称
   */
  private static iconComponentMap: Record<string, any> = {
    'HomeOutlined': HomeOutlined,
    'SettingOutlined': SettingOutlined,
    'UserOutlined': UserOutlined,
    'TeamOutlined': TeamOutlined,
    'FileOutlined': FileOutlined,
    'AppstoreOutlined': AppstoreOutlined,
    'SafetyCertificateOutlined': SafetyCertificateOutlined,
    'MenuOutlined': MenuOutlined,
    'DashboardOutlined': DashboardOutlined,
    'GlobalOutlined': GlobalOutlined,
    'FormOutlined': FormOutlined,
    'TableOutlined': TableOutlined,
    'MessageOutlined': MessageOutlined,
    'MailOutlined': MailOutlined,
    'BellOutlined': BellOutlined,
    'CalendarOutlined': CalendarOutlined,
    'FolderOutlined': FolderOutlined,
    'ProjectOutlined': ProjectOutlined,
    'ShopOutlined': ShopOutlined,
    'MoneyCollectOutlined': MoneyCollectOutlined,
    'DollarOutlined': DollarOutlined,
    'AreaChartOutlined': AreaChartOutlined,
    'LineChartOutlined': LineChartOutlined,
    'BarChartOutlined': BarChartOutlined,
    'PieChartOutlined': PieChartOutlined,
    'EyeOutlined': EyeOutlined,
    'LockOutlined': LockOutlined,
    'KeyOutlined': KeyOutlined,
    'TagOutlined': TagOutlined,
    'TagsOutlined': TagsOutlined,
    'DeleteOutlined': DeleteOutlined,
    'EditOutlined': EditOutlined,
    'SaveOutlined': SaveOutlined,
    'UploadOutlined': UploadOutlined,
    'DownloadOutlined': DownloadOutlined,
    'CloudOutlined': CloudOutlined,
    'PrinterOutlined': PrinterOutlined,
    'SearchOutlined': SearchOutlined,
    'FilterOutlined': FilterOutlined,
    'LinkOutlined': LinkOutlined,
    'PlusOutlined': PlusOutlined,
    'MinusOutlined': MinusOutlined,
    'QuestionOutlined': QuestionOutlined,
    'InfoCircleOutlined': InfoCircleOutlined,
    'WarningOutlined': WarningOutlined,
    'CheckOutlined': CheckOutlined,
    'CloseOutlined': CloseOutlined,
    'LaptopOutlined': LaptopOutlined,
    'MobileOutlined': MobileOutlined,
    'TabletOutlined': TabletOutlined,
    'CarOutlined': CarOutlined,
    'ClockCircleOutlined': ClockCircleOutlined,
    'ScheduleOutlined': ScheduleOutlined,
    'StarOutlined': StarOutlined,
    'HeartOutlined': HeartOutlined,
    'EnvironmentOutlined': EnvironmentOutlined,
  };

  /**
   * 简短名称到组件的映射表
   */
  private static iconNameMap: Record<string, any> = {
    'home': HomeOutlined,
    'setting': SettingOutlined,
    'user': UserOutlined,
    'team': TeamOutlined,
    'file': FileOutlined,
    'app': AppstoreOutlined,
    'appstore': AppstoreOutlined,
    'safety': SafetyCertificateOutlined,
    'security': SafetyCertificateOutlined,
    'menu': MenuOutlined,
    'dashboard': DashboardOutlined,
    'global': GlobalOutlined,
    'profile': UserOutlined,
    'audit': FileOutlined,
    'form': FormOutlined,
    'table': TableOutlined,
    'message': MessageOutlined,
    'mail': MailOutlined,
    'bell': BellOutlined,
    'notification': BellOutlined,
    'calendar': CalendarOutlined,
    'folder': FolderOutlined,
    'project': ProjectOutlined,
    'shop': ShopOutlined,
    'money': MoneyCollectOutlined,
    'dollar': DollarOutlined,
    'chart': AreaChartOutlined,
    'analysis': LineChartOutlined,
    'bar': BarChartOutlined,
    'pie': PieChartOutlined,
    'eye': EyeOutlined,
    'lock': LockOutlined,
    'key': KeyOutlined,
    'tag': TagOutlined,
    'tags': TagsOutlined,
    'delete': DeleteOutlined,
    'edit': EditOutlined,
    'save': SaveOutlined,
    'upload': UploadOutlined,
    'download': DownloadOutlined,
    'cloud': CloudOutlined,
    'printer': PrinterOutlined,
    'search': SearchOutlined,
    'filter': FilterOutlined,
    'link': LinkOutlined,
    'plus': PlusOutlined,
    'minus': MinusOutlined,
    'question': QuestionOutlined,
    'info': InfoCircleOutlined,
    'warning': WarningOutlined,
    'check': CheckOutlined,
    'close': CloseOutlined,
    'laptop': LaptopOutlined,
    'mobile': MobileOutlined,
    'tablet': TabletOutlined,
    'car': CarOutlined,
    'clock': ClockCircleOutlined,
    'schedule': ScheduleOutlined,
    'star': StarOutlined,
    'heart': HeartOutlined,
    'environment': EnvironmentOutlined,
    'location': EnvironmentOutlined,
    'system': AppstoreOutlined
  };

  /**
   * 获取图标组件
   * @param icon 图标名称
   * @param defaultIcon 默认图标组件，默认为MenuOutlined
   * @returns 图标组件
   */
  static getIconComponent(icon: string | null | undefined, defaultIcon: any = MenuOutlined): any {
    // 如果icon不是有效的字符串
    if (!icon || typeof icon !== 'string') {
      return defaultIcon;
    }

    // 开启调试日志
    const ENABLE_ICON_DEBUG = false;

    // 1. 直接检查iconComponentMap，Ant Design图标都应在这里
    if (this.iconComponentMap[icon]) {
      return this.iconComponentMap[icon];
    }

    // 处理旧版图标命名转换为新版组件名称
    let iconName = icon;
    
    // 2. 检查特殊映射表（处理旧版图标名称）
    if (this.specialIconMapping[iconName]) {
      if (ENABLE_ICON_DEBUG) {
        console.log(`[IconUtils] 特殊映射匹配: "${icon}" → "${this.specialIconMapping[iconName]}"`);
      }
      iconName = this.specialIconMapping[iconName];
      
      // 获取映射后的组件
      if (this.iconComponentMap[iconName]) {
        return this.iconComponentMap[iconName];
      }
    }
    
    // 3. 处理带-o后缀的图标名称（outline风格）
    if (iconName.endsWith('-o')) {
      // 移除-o后缀尝试匹配
      const baseNameWithoutO = iconName.slice(0, -2);
      
      // 尝试无连字符变体
      const noHyphenName = baseNameWithoutO.replace(/-/g, '') + 'o';
      if (this.specialIconMapping[noHyphenName]) {
        if (ENABLE_ICON_DEBUG) {
          console.log(`[IconUtils] 无连字符匹配: "${icon}" → "${noHyphenName}" → "${this.specialIconMapping[noHyphenName]}"`);
        }
        const mappedName = this.specialIconMapping[noHyphenName];
        if (this.iconComponentMap[mappedName]) {
          return this.iconComponentMap[mappedName];
        }
      }
      
      // 转换为驼峰命名并添加Outlined后缀
      const convertedName = baseNameWithoutO.replace(/-([a-z])/g, (_, char) => char.toUpperCase()) + 'Outlined';
      if (ENABLE_ICON_DEBUG) {
        console.log(`[IconUtils] 后缀-o处理: "${icon}" → "${convertedName}"`);
      }
      
      // 检查转换后的名称是否在图标组件映射中
      if (this.iconComponentMap[convertedName]) {
        return this.iconComponentMap[convertedName];
      }
    }
    
    // 4. 检查简短名称映射
    if (this.iconNameMap[iconName.toLowerCase()]) {
      if (ENABLE_ICON_DEBUG) {
        console.log(`[IconUtils] 在简短名称映射中找到: "${iconName.toLowerCase()}"`);
      }
      return this.iconNameMap[iconName.toLowerCase()];
    }
    
    // 5. 特殊情况处理
    if (icon.toLowerCase().includes('appstore')) {
      if (ENABLE_ICON_DEBUG) {
        console.log(`[IconUtils] 包含appstore的特殊处理: "${icon}" → AppstoreOutlined`);
      }
      return AppstoreOutlined;
    }
    
    // 6. 对于图标选择器中的预定义图标名，直接返回原始名称以便Vue动态组件处理
    return icon;
  }

  /**
   * 注册自定义图标组件
   * @param name 图标名称
   * @param component 图标组件
   */
  static registerIcon(name: string, component: any): void {
    if (!name || !component) return;
    
    this.iconComponentMap[name] = component;
    
    // 同时注册小写版本
    const lowercaseName = name.toLowerCase();
    if (!this.iconNameMap[lowercaseName]) {
      this.iconNameMap[lowercaseName] = component;
    }
  }

  /**
   * 注册特殊图标名称映射
   * @param oldName 旧图标名称
   * @param newName 新图标组件名称
   */
  static registerIconMapping(oldName: string, newName: string): void {
    if (!oldName || !newName) return;
    
    this.specialIconMapping[oldName] = newName;
  }

  /**
   * 获取所有图标组件映射
   * @returns 所有图标组件的映射对象
   */
  static getAllIcons(): Record<string, any> {
    return this.iconComponentMap;
  }
  
  /**
   * 获取所有图标名称列表
   * @returns 所有图标名称的数组
   */
  static getAllIconNames(): string[] {
    return Object.keys(this.iconComponentMap);
  }
}

export default IconUtils; 