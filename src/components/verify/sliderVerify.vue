<template>
  <div class="slide-verify" :style="{width: canvasWidth + 'px'}" onselectstart="return false;">
    <!-- 图片加载遮蔽罩 -->
    <div :class="{'img-loading': isLoading}" :style="{height: canvasHeight + 'px'}" v-if="isLoading"/>
    <!-- 认证成功后的文字提示 -->
    <div class="success-hint" :style="{height: canvasHeight + 'px'}" v-if="verifySuccess">{{ successHint }}</div>
    <!--刷新按钮-->
    <div class="refresh-icon" @click="refresh"/>
    <!--后端生成-->
    <!--验证图片-->
    <img ref="canvas" class="slide-canvas" :width="canvasWidth" :height="canvasHeight"/>
    <!--阻塞块-->
    <img ref="block" :class="['slide-block', {'verify-fail': verifyFail}]"/>
    <!-- 滑动条 -->
    <div class="slider" :class="{'verify-active': verifyActive, 'verify-success': verifySuccess, 'verify-fail': verifyFail}">
      <!--滑块-->
      <div class="slider-box" :style="{width: sliderBoxWidth}">
        <!-- 按钮 -->
        <div class="slider-button" id="slider-button" :style="{left: sliderButtonLeft}">
          <!-- 按钮图标 -->
          <div class="slider-button-icon"/>
        </div>
      </div>
      <!--滑动条提示文字-->
      <span class="slider-hint">{{ sliderHint }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { useRequest } from '@/utils/request'

const { get, postJson } = useRequest()

// 组件属性定义
const props = defineProps({
  // 阻塞块长度
  blockLength: {
    type: Number,
    default: 42,
  },
  // 阻塞块弧度
  blockRadius: {
    type: Number,
    default: 10,
  },
  // 画布宽度
  canvasWidth: {
    type: Number,
    default: 320,
  },
  // 画布高度
  canvasHeight: {
    type: Number,
    default: 155,
  },
  // 滑块操作提示
  sliderHint: {
    type: String,
    default: '向右滑动',
  },
  // 可允许的误差范围小；为1时，则表示滑块要与凹槽完全重叠，才能验证成功。默认值为5，若为 -1 则不进行机器判断
  accuracy: {
    type: Number,
    default: 3,
  }
})

// 定义事件
const emit = defineEmits(['success', 'fail', 'again'])

// 状态变量
const isLoading = ref(true)
const verifyActive = ref(false)
const verifySuccess = ref(false)
const verifyFail = ref(false)
const blockX = ref(0)
const blockY = ref(0)
const sliderBoxWidth = ref(0)
const sliderButtonLeft = ref(0)
const isMouseDown = ref(false)
const timestamp = ref(null)
const successHint = ref('')
const uuId = ref('')
const dragDistanceList = ref([])
const originX = ref(0)
const originY = ref(0)

// DOM引用
const canvas = ref(null)
const block = ref(null)

// 辅助函数
function sum(x, y) {
  return x + y
}

function square(x) {
  return x * x
}

// 生命周期钩子
onMounted(() => {
  init()
})

// 方法
function init() {
  initDom()
  bindEvents()
}

function initDom() {
  getCaptcha()
}

/* 后台获取验证码*/
async function getCaptcha() {
  isLoading.value = true
  try {
    // 生成一个新的UUID，这个是我们要保留的原始UUID
    uuId.value = uuidv4()
    console.log('生成的UUID (发送到后端):', uuId.value)

    const data = {
      uuId: uuId.value
    }
    console.log('获取验证码参数:', data)
    const response = await postJson('auth/get-captcha', data)
    console.log('验证码返回数据:', response.data)
    const responseData = response.data.obj

    /*
    if (responseData && responseData.uuId) {
      uuId.value = responseData.uuId
      console.log('设置后端返回的UUID:', uuId.value)
    }
    */

    // 确保blockX为number类型
    if (responseData && responseData.blockX !== undefined) {
      blockX.value = parseInt(responseData.blockX)
      console.log('设置blockX值:', blockX.value)
    }

    blockY.value = responseData.blockY
    block.value.src = responseData.blockSrc
    block.value.style.top = responseData.blockY + 'px'
    canvas.value.src = responseData.canvasSrc
  } catch (error) {
    console.error('获取验证码失败', error)
  } finally {
    isLoading.value = false
  }
}

/* 事件绑定*/
function bindEvents() {
  // 监听鼠标按下事件
  document.getElementById('slider-button').addEventListener('mousedown', (event) => {
    startEvent(event.clientX, event.clientY)
  })
  // 监听鼠标移动事件
  document.addEventListener('mousemove', (event) => {
    moveEvent(event.clientX, event.clientY)
  })
  // 监听鼠标离开事件
  document.addEventListener('mouseup', (event) => {
    endEvent(event.clientX)
  })
  // 监听触摸开始事件
  document.getElementById('slider-button').addEventListener('touchstart', (event) => {
    startEvent(event.changedTouches[0].pageX, event.changedTouches[0].pageY)
  })
  // 监听触摸滑动事件
  document.addEventListener('touchmove', (event) => {
    moveEvent(event.changedTouches[0].pageX, event.changedTouches[0].pageY)
  })
  // 监听触摸离开事件
  document.addEventListener('touchend', (event) => {
    endEvent(event.changedTouches[0].pageX)
  })
}

/* 校验图片是否存在*/
function checkImgSrc() {
  return !!canvas.value.src
}

/* 滑动开始事件*/
function startEvent(clientX, clientY) {
  if (!checkImgSrc() || isLoading.value || verifySuccess.value) {
    return
  }
  originX.value = clientX
  originY.value = clientY
  isMouseDown.value = true
  timestamp.value = +new Date()
  // 重置拖动距离数组
  dragDistanceList.value = []
}

/* 滑动事件*/
function moveEvent(clientX, clientY) {
  if (!isMouseDown.value) {
    return false
  }
  const moveX = clientX - originX.value
  const moveY = clientY - originY.value
  if (moveX < 0 || moveX + 40 >= props.canvasWidth) {
    return false
  }
  sliderButtonLeft.value = moveX + 'px'
  let blockLeft = (props.canvasWidth - 40 - 20) / (props.canvasWidth - 40) * moveX
  block.value.style.left = blockLeft + 'px'
  verifyActive.value = true
  sliderBoxWidth.value = moveX + 'px'
  dragDistanceList.value.push(moveY)
}

/* 滑动结束事件*/
function endEvent(clientX) {
  if (!isMouseDown.value) {
    return false
  }
  isMouseDown.value = false
  if (clientX === originX.value) {
    return false
  }
  // 开始校验
  isLoading.value = true
  // 校验结束
  verifyActive.value = false
  // 滑动时长
  const verifyTime = +new Date() - timestamp.value
  // 移动距离
  const moveLength = parseInt(block.value.style.left)

  // 限制操作时长10S，超出判断失败
  if (verifyTime > 10000) {
    verifyFailEvent()
  } else if (!turingTest()) {
    // 人为操作判定
    verifyFail.value = true
    emit('again')
  } else {
    const accuracy = props.accuracy <= 1 ? 1 : props.accuracy > 10 ? 10 : props.accuracy // 容错精度值
    const spliced = Math.abs(moveLength - blockX.value) <= accuracy // 判断是否重合
    if (!spliced) {
      verifyFailEvent()
    } else {
      // 成功时同时传递code和uuId
      emit('success', {
        code: blockX.value,
        uuId: uuId.value
      })
    }
  }
}

/* 图灵测试*/
function turingTest() {
  const arr = dragDistanceList.value // 拖动距离数组
  if (arr.length === 0) return false

  const average = arr.reduce(sum) / arr.length // 平均值
  const deviations = arr.map((x) => x - average) // 偏离值
  const stdDev = Math.sqrt(deviations.map(square).reduce(sum) / arr.length) // 标准偏差
  return average !== stdDev // 判断是否人为操作
}

/* 校验成功*/
function verifySuccessEvent() {
  isLoading.value = false
  verifySuccess.value = true
  const elapsedTime = (timestamp.value / 1000).toFixed(1)
  if (elapsedTime < 1) {
    successHint.value = `仅仅${elapsedTime}S，你的速度快如闪电`
  } else if (elapsedTime < 2) {
    successHint.value = `只用了${elapsedTime}S，这速度简直完美`
  } else {
    successHint.value = `耗时${elapsedTime}S，争取下次再快一点`
  }
}

/* 校验失败*/
function verifyFailEvent(msg) {
  verifyFail.value = true
  emit('fail', msg)
  refresh()
}

/* 刷新图片验证码*/
function refresh() {
  // 延迟class的删除，等待动画结束
  setTimeout(() => {
    verifyFail.value = false
  }, 500)
  isLoading.value = true
  verifyActive.value = false
  verifySuccess.value = false
  block.value.style.left = 0
  sliderBoxWidth.value = 0
  sliderButtonLeft.value = 0
  getCaptcha()
}

// 暴露给父组件的方法和值
defineExpose({
  refresh,
  verifySuccessEvent,
  verifyFailEvent,
  blockX: blockX,
  // 直接暴露uuId的value，这样父组件获取时不需要.value
  get uuId() {
    return uuId.value
  }
})
</script>

<style scoped>
.slide-verify {
  position: relative;
}

/*图片加载样式*/
.img-loading {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 999;
  animation: loading 1.5s infinite;
  background-image: url(@/assets/images/loading.svg);
  background-repeat: no-repeat;
  background-position: center center;
  background-size: 100px;
  background-color: #737c8e;
  border-radius: 5px;
}

@keyframes loading {
  0% {
    opacity: .7;
  }
  100% {
    opacity: 9;
  }
}

/*认证成功后的文字提示*/
.success-hint {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  color: #2CD000;
  font-size: large;
}

/*刷新按钮*/
.refresh-icon {
  position: absolute;
  right: 0;
  top: 0;
  width: 35px;
  height: 35px;
  cursor: pointer;
  background: url(@/assets/images/refresh.png);
  background-size: 35px 35px;
}

/*验证图片*/
.slide-canvas {
  border-radius: 5px;
}

/*阻塞块*/
.slide-block {
  position: absolute;
  left: 0;
  top: 0;
}

/*校验失败时的阻塞块样式*/
.slide-block.verify-fail {
  transition: left 0.5s linear;
}

/*滑动条*/
.slider {
  position: relative;
  text-align: center;
  width: 100%;
  height: 40px;
  line-height: 40px;
  margin-top: 15px;
  background: #f7f9fa;
  color: #45494c;
  border: 1px solid #e4e7eb;
  border-radius: 5px;
}

/*滑动盒子*/
.slider-box {
  position: absolute;
  left: 0;
  top: 0;
  height: 40px;
  border: 0 solid #1991FA;
  background: #D1E9FE;
  border-radius: 5px;
}

/*滑动按钮*/
.slider-button {
  position: absolute;
  top: 0;
  left: 0;
  width: 40px;
  height: 40px;
  background: #fff;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: background .2s linear;
  border-radius: 5px;
}

/*鼠标悬浮时的按钮样式*/
.slider-button:hover {
  background: #1991FA
}

/*鼠标悬浮时的按钮图标样式*/
.slider-button:hover .slider-button-icon {
  background-position: 0 -13px
}

/*滑动按钮图标*/
.slider-button-icon {
  position: absolute;
  top: 15px;
  left: 13px;
  width: 15px;
  height: 13px;
  background: url(@/assets/images/vslide.png) 0 -26px;
  background-size: 35px 470px
}

/*校验时的按钮样式*/
.verify-active .slider-button {
  height: 38px;
  top: -1px;
  border: 1px solid #1991FA;
}

/*校验时的滑动箱样式*/
.verify-active .slider-box {
  height: 38px;
  border-width: 1px;
}

/*校验成功时的滑动箱样式*/
.verify-success .slider-box {
  height: 38px;
  border: 1px solid #52CCBA;
  background-color: #D2F4EF;
}

/*校验成功时的按钮样式*/
.verify-success .slider-button {
  height: 38px;
  top: -1px;
  border: 1px solid #52CCBA;
  background-color: #52CCBA !important;
}

/*校验成功时的按钮图标样式*/
.verify-success .slider-button-icon {
  background-position: 0 0 !important;
}

/*校验失败时的滑动箱样式*/
.verify-fail .slider-box {
  height: 38px;
  border: 1px solid #f57a7a;
  background-color: #fce1e1;
  transition: width 0.5s linear;
}

/*校验失败时的按钮样式*/
.verify-fail .slider-button {
  height: 38px;
  top: -1px;
  border: 1px solid #f57a7a;
  background-color: #f57a7a !important;
  transition: left 0.5s linear;
}

/*校验失败时的按钮图标样式*/
.verify-fail .slider-button-icon {
  top: 14px;
  background-position: 0 -82px !important;
}

/*校验状态下的提示文字隐藏*/
.verify-active .slider-hint,
.verify-success .slider-hint,
.verify-fail .slider-hint {
  display: none;
}
</style>
