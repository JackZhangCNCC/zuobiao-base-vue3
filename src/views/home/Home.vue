<template>
  <div class="home-container">
    <!-- 欢迎信息 -->
    <a-row :gutter="[16, 16]" class="welcome-row">
      <a-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
        <a-card class="welcome-card">
          <template #title>
            <div class="welcome-title">
              <div class="avatar">
                <a-avatar :size="64" :src="userAvatar">
                  <template #icon v-if="!userAvatar">
                    <user-outlined />
                  </template>
                </a-avatar>
              </div>
              <div class="info">
                <h2>欢迎回来，{{ username }}！</h2>
                <p>{{ greeting }}</p>
              </div>
            </div>
          </template>
          <div class="welcome-content">
            <a-row :gutter="16">
              <a-col :span="6">
                <a-statistic title="今日访问" :value="1024" />
              </a-col>
              <a-col :span="6">
                <a-statistic title="未读消息" :value="8" />
              </a-col>
              <a-col :span="6">
                <a-statistic title="待办任务" :value="12" />
              </a-col>
              <a-col :span="6">
                <a-statistic title="系统通知" :value="3" />
              </a-col>
            </a-row>
            <a-row style="margin-top: 16px;">
              <a-col :span="24" style="text-align: right;">
                <zb-button type="primary" @click="goToComponentsDemo">
                  <experiment-outlined /> 组件演示
                </zb-button>
              </a-col>
            </a-row>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 统计卡片 -->
    <a-row :gutter="[16, 16]" class="stats-row">
      <a-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="icon users">
              <team-outlined />
            </div>
            <div class="info">
              <p class="title">用户数量</p>
              <p class="value">1,286</p>
              <p class="trend">
                <span class="up">
                  <arrow-up-outlined /> 12%
                </span>
                较上周
              </p>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="icon visits">
              <eye-outlined />
            </div>
            <div class="info">
              <p class="title">总访问量</p>
              <p class="value">256,386</p>
              <p class="trend">
                <span class="up">
                  <arrow-up-outlined /> 25%
                </span>
                较上周
              </p>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="icon orders">
              <shopping-outlined />
            </div>
            <div class="info">
              <p class="title">订单数量</p>
              <p class="value">4,389</p>
              <p class="trend">
                <span class="down">
                  <arrow-down-outlined /> 8%
                </span>
                较上周
              </p>
            </div>
          </div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
        <a-card class="stat-card">
          <div class="stat-content">
            <div class="icon revenue">
              <dollar-outlined />
            </div>
            <div class="info">
              <p class="title">总收入</p>
              <p class="value">￥283,592</p>
              <p class="trend">
                <span class="up">
                  <arrow-up-outlined /> 18%
                </span>
                较上周
              </p>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 图表和任务列表 -->
    <a-row :gutter="[16, 16]" class="charts-row">
      <a-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <a-card title="访问量趋势" class="chart-card">
          <div id="visitChart" class="chart-container"></div>
        </a-card>
      </a-col>

      <a-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
        <a-card title="待办任务" class="todo-card">
          <a-list size="small" :bordered="false">
            <a-list-item v-for="(item, index) in todoList" :key="index">
              <template #actions>
                <a>完成</a>
              </template>
              <a-list-item-meta>
                <template #title>{{ item.title }}</template>
                <template #description>{{ item.description }}</template>
              </a-list-item-meta>
            </a-list-item>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import ApexCharts from 'apexcharts'
import {
  UserOutlined,
  TeamOutlined,
  EyeOutlined,
  ShoppingOutlined,
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ExperimentOutlined
} from '@ant-design/icons-vue'

// 路由
const router = useRouter()

// 组件演示页面跳转
const goToComponentsDemo = () => {
  router.push('/test/components')
}

// 用户信息
const userStore = useUserStore()
const username = computed(() => userStore.userInfo?.userName || '用户')
const userAvatar = computed(() => {
  if (userStore.userInfo?.avatar) {
    // 使用与Vue2相同的路径方式
    return `src/assets/avatar/${userStore.userInfo.avatar}`;
  }
  return ''
})

// 问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 6) {
    return '凌晨好！今天又是充满希望的一天。'
  } else if (hour < 9) {
    return '早上好！祝您今天心情愉快。'
  } else if (hour < 12) {
    return '上午好！工作进展顺利吗？'
  } else if (hour < 14) {
    return '中午好！午饭吃了吗？'
  } else if (hour < 17) {
    return '下午好！来杯咖啡提提神吧！'
  } else if (hour < 19) {
    return '傍晚好！工作辛苦了！'
  } else if (hour < 22) {
    return '晚上好！今天过得怎么样？'
  } else {
    return '夜深了，注意休息！'
  }
})

// 待办任务
const todoList = reactive([
  { title: '系统管理', description: '完善系统权限管理' },
  { title: '数据统计', description: '核对本月销售数据' },
  { title: '用户反馈', description: '处理用户提交的问题' },
  { title: '团队会议', description: '准备周例会材料' },
  { title: '功能开发', description: '完成新功能的开发任务' }
])

// 初始化图表
onMounted(() => {
  const options = {
    chart: {
      type: 'area',
      height: 350,
      zoom: {
        enabled: false
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth'
    },
    series: [
      {
        name: '访问量',
        data: [31, 40, 28, 51, 42, 109, 100, 120, 80, 95, 110, 85]
      },
      {
        name: '新用户',
        data: [11, 32, 45, 32, 34, 52, 41, 50, 28, 33, 48, 25]
      }
    ],
    xaxis: {
      categories: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    },
    tooltip: {
      x: {
        format: 'MM'
      }
    }
  }

  // 确保图表容器已经挂载
  setTimeout(() => {
    const chartElement = document.querySelector('#visitChart')
    if (chartElement) {
      new ApexCharts(chartElement, options).render()
    }
  }, 0)
})
</script>

<style lang="less" scoped>
.home-container {

  .welcome-row,
  .stats-row,
  .charts-row {
    margin-bottom: 16px;
  }
  .charts-row:last-child {
    margin-bottom: 0;
  }

  .welcome-card {
    .welcome-title {
      display: flex;
      align-items: center;
      padding: 12px 0 0 0;

      .avatar {
        margin-right: 16px;
      }

      .info {
        h2 {
          margin-bottom: 8px;
        }

        p {
          color: rgba(0, 0, 0, 0.45);
        }
      }
    }

    .welcome-content {
      margin-top: 16px;
    }
  }

  .stat-card {
    .stat-content {
      display: flex;
      align-items: center;

      .icon {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        margin-right: 16px;

        &.users {
          background-color: rgba(24, 144, 255, 0.1);
          color: #1890ff;
        }

        &.visits {
          background-color: rgba(82, 196, 26, 0.1);
          color: #52c41a;
        }

        &.orders {
          background-color: rgba(250, 173, 20, 0.1);
          color: #faad14;
        }

        &.revenue {
          background-color: rgba(245, 34, 45, 0.1);
          color: #f5222d;
        }
      }

      .info {
        .title {
          color: rgba(0, 0, 0, 0.45);
          margin-bottom: 4px;
        }

        .value {
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .trend {
          font-size: 12px;
          color: rgba(0, 0, 0, 0.45);

          .up {
            color: #52c41a;
          }

          .down {
            color: #f5222d;
          }
        }
      }
    }
  }

  .chart-card {
    .chart-container {
      height: 350px;
    }
  }

  .todo-card {
    height: 100%;
  }
}
</style>
