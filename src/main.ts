import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import Antd from 'ant-design-vue'
import VueApexCharts from 'vue3-apexcharts'
import setupPermissionDirectives from './utils/permissionDirect'

// 导入dayjs并设置中文语言
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'

// 设置dayjs默认语言为中文
dayjs.locale('zh-cn')

// 导入样式
import 'ant-design-vue/dist/reset.css'
import './styles/theme.less'
import './styles/utils.less'
import './assets/styles/index.less'

// 创建应用
const app = createApp(App)

// 配置Pinia
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 使用插件
app.use(router)
app.use(pinia)
app.use(Antd)
app.use(VueApexCharts)

// 注册权限指令
setupPermissionDirectives(app)

// 挂载应用
app.mount('#app')
