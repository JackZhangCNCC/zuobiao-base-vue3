<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <!-- 标题 -->
      <div class="title-container">
        <h3 class="title">坐标基础系统</h3>
      </div>

      <!-- 登录表单 -->
      <a-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        @finish="doSubmit"
      >
        <!-- 错误提示 -->
        <a-alert
          v-if="error"
          type="error"
          :message="error"
          showIcon
          style="margin-bottom: 24px"
          :closable="true"
          @close="error = ''"
        />

        <!-- 用户名 -->
        <a-form-item name="username">
          <a-input
            v-model:value="loginForm.username"
            placeholder="用户名"
            size="large"
          >
            <template #prefix>
              <user-outlined />
            </template>
          </a-input>
        </a-form-item>

        <!-- 密码 -->
        <a-form-item name="password">
          <a-input-password
            v-model:value="loginForm.password"
            placeholder="密码"
            size="large"
            @keyup.enter="doSubmit"
          >
            <template #prefix>
              <lock-outlined />
            </template>
          </a-input-password>
        </a-form-item>

        <!-- 记住我 -->
        <a-form-item>
          <div class="additional-options">
            <a-checkbox v-model:checked="loginForm.rememberMe">
              记住我
            </a-checkbox>
            <a class="forget-link">忘记密码</a>
          </div>
        </a-form-item>

        <!-- 登录按钮 -->
        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            size="large"
            :loading="loading"
            class="login-button"
          >
            登录
          </a-button>
        </a-form-item>

        <!-- 其他登录方式 -->
        <div class="other-login">
          <div class="divider">
            <span>其他登录方式</span>
          </div>
          <div class="icons">
            <github-outlined class="icon" />
            <wechat-outlined class="icon" />
            <alipay-outlined class="icon" />
          </div>
        </div>
      </a-form>
    </div>

    <!-- 滑块验证模态框 -->
    <a-modal
      v-model:open="isShowSliderVerify"
      title="请拖动滑块完成拼图"
      centered
      :footer="null"
      width="350"
      :body-style="{ height: '280px', overflow: 'hidden', overflowY: 'scroll' }"
    >
      <slider-verify
        ref="sliderVerify"
        style="margin-top: 5px"
        @success="onVerifySuccess"
        @fail="onVerifyFail"
        @again="verifyRefresh"
      />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
import aesEncrypt from '@/utils/aesEncrypt'
import { useRequest } from '@/utils/request'
import SliderVerify from '@/components/verify/sliderVerify.vue'
import {
  UserOutlined,
  LockOutlined,
  GithubOutlined,
  WechatOutlined,
  AlipayOutlined
} from '@ant-design/icons-vue'

// 路由和状态管理
const router = useRouter()
const userStore = useUserStore()
const { get, post } = useRequest()

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度必须在3-20个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度必须在6-20个字符之间', trigger: 'blur' }
  ]
}

// 表单引用和状态
const formRef = ref(null)
const sliderVerify = ref(null)
const loading = ref(false)
const error = ref('')
const isShowSliderVerify = ref(false)

// 表单提交处理
const doSubmit = async () => {
  try {
    // 表单验证
    await formRef.value?.validate()

    // 显示滑块验证
    isShowSliderVerify.value = true

    // 刷新验证码
    sliderVerify.value?.refresh()
  } catch (err) {
    console.error('表单验证失败', err)
  }
}

// 执行登录操作 - 模拟Vue2版本的doLogin方法
const doLogin = async () => {
  try {
    loading.value = true

    // 直接从滑块组件获取值 - 与Vue2版本保持一致
    const blockXValue = sliderVerify.value.blockX
    const uuIdValue = sliderVerify.value.uuId

    // 调用登录接口 - 确保参数格式与老系统一致
    const { data } = await post('auth/login', {
      username: aesEncrypt.encrypt(loginForm.username),
      password: aesEncrypt.encrypt(loginForm.password),
      code: blockXValue,
      isAutoLogin: loginForm.rememberMe ? "1" : "0",
      sysId: import.meta.env.VITE_APP_SYS_ID,
      mode: 2,
      uuId: uuIdValue
    })

    console.log('登录响应:', data)

    // 使用宽松比较而非严格比较
    if (data.code == 1) {
      // 保存登录数据
      userStore.setToken(data.data.token)
      userStore.setExpireTime(data.data.exipreTime)
      userStore.setUser(data.data.user)
      userStore.setPermissions(data.data.permissions)
      userStore.setRoles(data.data.roles)

      message.success('登录成功')
      router.push('/')
    } else {
      error.value = data.msg || '登录失败，请检查用户名和密码是否正确'
      // 关闭模态框
      isShowSliderVerify.value = false
    }
  } catch (err) {
    console.error('登录失败', err)
    error.value = '登录时发生错误，请稍后再试'
    // 关闭模态框
    isShowSliderVerify.value = false
  } finally {
    loading.value = false
  }
}

// 验证成功
const onVerifySuccess = (data) => {
  sliderVerify.value.verifySuccessEvent()
  isShowSliderVerify.value = false
  // 使用事件数据中的code值和uuId
  console.log('验证成功事件数据:', data)
  doLogin()
}

// 验证失败
const onVerifyFail = (msg) => {
  message.error('验证失败，请控制拼图对齐缺口')
  console.log('验证失败，请控制拼图对齐缺口')
}

// 验证刷新
const verifyRefresh = () => {
  sliderVerify.value.refresh()
}
</script>

<style lang="less" scoped>
@import '@/styles/theme.less';

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: url('@/assets/images/login-bg.jpg') no-repeat center center;
  background-size: cover;

  .login-form-wrapper {
    width: 380px;
    padding: 35px 35px 15px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .title-container {
      margin-bottom: 30px;
      text-align: center;

      .title {
        font-size: 26px;
        font-weight: bold;
        color: @primary-color;
      }
    }

    .additional-options {
      display: flex;
      justify-content: space-between;

      .forget-link {
        color: @primary-color;
      }
    }

    .login-button {
      width: 100%;
    }

    .other-login {
      margin-top: 24px;

      .divider {
        color: rgba(0, 0, 0, 0.45);
        font-size: 14px;
        margin: 16px 0;
        text-align: center;
        position: relative;

        &::before,
        &::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 40%;
          height: 1px;
          background-color: #f0f0f0;
        }

        &::before {
          left: 0;
        }

        &::after {
          right: 0;
        }

        span {
          display: inline-block;
          padding: 0 10px;
          background-color: #fff;
          position: relative;
          z-index: 1;
        }
      }

      .icons {
        display: flex;
        justify-content: center;

        .icon {
          font-size: 24px;
          margin: 0 8px;
          cursor: pointer;
          transition: color 0.3s;

          &:hover {
            color: @primary-color;
          }
        }
      }
    }
  }
}

@media (max-width: 576px) {
  .login-form-wrapper {
    width: 95%;
    max-width: 380px;
  }
}
</style>
