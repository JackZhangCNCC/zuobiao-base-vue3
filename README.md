# 坐标基础系统 (zuobiao-base-vue3) by Johnson

一个基于Vue 3和Ant Design Vue的现代化后台管理系统，由vue2版本的FEBS框架升级而来，专注于提供高效、灵活的企业级应用基础架构。

## 技术栈

- **前端框架**: Vue 3 + Vite
- **UI组件库**: Ant Design Vue 4.x
- **状态管理**: Pinia (带持久化支持)
- **路由管理**: Vue Router 4
- **HTTP请求**: Axios
- **图表工具**: ApexCharts
- **样式处理**: Less

## 主要功能

系统提供一套完整的后台管理功能，主要包括：

- **用户管理**: 创建、编辑和管理系统用户
- **角色管理**: 基于角色的权限控制系统
- **部门管理**: 组织架构和部门维护
- **菜单管理**: 动态菜单配置
- **字典管理**: 系统字典数据维护
- **权限控制**: 细粒度的权限指令系统

## 项目结构

```
zuobiao-base-vue3/
├── src/                    # 源代码
│   ├── assets/             # 静态资源
│   ├── components/         # 全局公共组件
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia状态管理
│   ├── styles/             # 全局样式
│   ├── utils/              # 工具函数
│   ├── views/              # 页面视图
│   │   ├── error/          # 错误页面
│   │   ├── home/           # 首页
│   │   ├── layout/         # 布局组件
│   │   ├── login/          # 登录页面
│   │   └── system/         # 系统管理模块
│   ├── App.vue             # 根组件
│   └── main.ts             # 应用入口
├── .env                    # 环境变量
├── .env.development        # 开发环境变量
├── .env.production         # 生产环境变量
├── .env.test               # 测试环境变量
├── vite.config.js          # Vite配置
└── package.json            # 项目依赖
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建测试环境
npm run build:test

# 构建生产环境
npm run build:prod

# 预览构建结果
npm run preview
```

## 环境配置

- 开发环境API地址: http://192.168.99.198:7002
- 系统标题: 坐标基础系统
- 系统ID: 18676 (默认)

## 浏览器支持

- Chrome >= 49
- Firefox >= 45
- 现代浏览器
- 不支持IE

## 特色功能

- 完整的权限管理系统
- 基于指令的权限控制
- 响应式布局设计
- 多环境支持
- 完善的数据加密机制
