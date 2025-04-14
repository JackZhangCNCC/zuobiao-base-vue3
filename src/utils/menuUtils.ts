import { useRequest } from './request';
import { message } from 'ant-design-vue';

/**
 * 菜单工具类
 */
export class MenuUtils {
  /**
   * 获取菜单树数据
   * @param sysId 系统ID
   * @returns 菜单树数据
   */
  static async getMenuTree(sysId: string) {
    const { get } = useRequest();
    try {
      // 确保系统ID有效
      const currentSysId = sysId || '';
      if (!currentSysId) {
        console.warn('未指定系统ID，菜单树将为空');
        return { treeData: [], allKeys: [] };
      }

      // 传递系统ID参数，添加type=0表示获取菜单类型
      const { data } = await get(`auth/menu?type=0&sysId=${currentSysId}`);

      if (data.code == 200 && data.obj) {
        if (data.obj.rows && data.obj.rows.children) {
          return {
            treeData: data.obj.rows.children,
            allKeys: data.obj.ids || []
          };
        } else {
          console.warn('菜单树数据结构异常', data);
          return { treeData: [], allKeys: [] };
        }
      } else {
        return { treeData: [], allKeys: [] };
      }
    } catch (error) {
      console.error('获取菜单树失败', error);
      message.error('获取菜单树失败');
      return { treeData: [], allKeys: [] };
    }
  }

  /**
   * 处理菜单数据，统一字段格式
   * @param menus 菜单数据
   */
  static processMenuData(menus: any[]) {
    if (!menus || !menus.length) return;

    menus.forEach(menu => {
      // 处理菜单类型
      if (menu.type == '0') {
        menu.type = 'C'; // 都处理为菜单类型
      } else if (menu.type == '1') {
        menu.type = 'F'; // 按钮
      } else if (!menu.type) {
        menu.type = 'C'; // 默认为菜单
      }

      // 处理可见性字段
      // 兼容 hidden 和 visible 字段，hidden为0或false表示显示，与visible=0的逻辑相同
      if (menu.hidden !== undefined && menu.visible === undefined) {
        // 根据hidden字段设置visible
        menu.visible = menu.hidden == '0' || menu.hidden === false ? '0' : '1';
      }

      // 确保isFrame字段存在，默认为内部菜单
      if (menu.isFrame === undefined) {
        menu.isFrame = '0';
      }
      
      // 调试打印isFrame值
      if (menu.isFrame == '1') {
        console.log('检测到外部链接菜单:', menu.text || menu.name, 'isFrame =', menu.isFrame, 'path =', menu.path);
      }

      // 处理其他属性的映射
      menu.name = menu.text || menu.name || menu.menuName; // 确保有名称字段
      menu.orderNum = menu.order || menu.orderNum; // 排序字段
      menu.perms = menu.permission || menu.perms; // 权限标识字段

      // 确保子菜单数组存在
      if (!menu.children) {
        menu.children = [];
      }

      // 递归处理子菜单
      if (menu.children && menu.children.length > 0) {
        this.processMenuData(menu.children);
      } else {
        // 如果没有子菜单，删除空的children数组以避免显示展开图标
        delete menu.children;
      }
    });
  }

  /**
   * 获取子系统列表
   * @param userId 用户ID
   * @returns 子系统列表
   */
  static async getSubsystemList(userId?: string) {
    const { get } = useRequest();
    try {
      // 构造URL，如果有userId则加入查询参数
      const url = userId ? `/auth/sys/selectSysList?userId=${userId}` : '/auth/sys/selectSysList';
      const { data } = await get(url);
      
      if (data.code == 200 && data.obj) {
        // 转换为下拉选项格式
        return data.obj.map(item => ({
          value: item.sysId,
          text: item.sysName
        }));
      }
      return [];
    } catch (error) {
      console.error('获取子系统列表失败', error);
      message.error('获取子系统列表失败');
      return [];
    }
  }
} 