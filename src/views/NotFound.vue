<template>
  <div class="not-found">
    <!-- 固定背景层 - 使用与动态背景相同的图片 -->
    <div 
      class="fixed-background"
      :style="{ backgroundImage: 'url(' + randomBgImage + ')' }"
    ></div>
    
    <!-- 背景图片 -->
    <img 
      :src="randomBgImage"
      alt="404 background"
      class="background-image"
      @load="imageLoaded = true"
      @error="imageError = true"
    />
    <!-- 加载状态 -->
    <div v-if="!imageLoaded && !imageError" class="loading-state">
      加载中...
    </div>
    <!-- 备用背景 -->
    <div v-if="imageError" class="fallback-background"></div>
    
    <!-- 鼠标跟随悬浮框 -->
    <div 
      class="floating-box"
      :style="{
        transform: `translate(${mouseX - 150}px, ${mouseY - 150}px)`,
        backdropFilter: 'blur(10px)'
      }"
    >
      <h1>404</h1>
      <p>前面的区域，以后再来探索吧~</p>
      <div class="arrow">↓</div>
      <button @click="goHome" class="home-button">返回主页</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'

const router = useRouter()
const mouseX = ref(0)
const mouseY = ref(0)
const imageLoaded = ref(false)
const imageError = ref(false)

// 404背景图片列表
const bgImages = [
  '/images/404/404-background-1.jpg',
  '/images/404/404-background-2.jpg',
  '/images/404/404-background-3.jpg',
  '/images/404/404-background-4.jpg',
  '/images/404/404-background-5.jpg',
  '/images/404/404-background-6.jpg',
  '/images/404/404-background-7.jpg',
  '/images/404/404-background-8.jpg'
]

// 随机选择背景图片
const randomBgImage = ref(bgImages[Math.floor(Math.random() * bgImages.length)])

const goHome = () => {
  // 强制刷新页面以确保正确加载主应用
  window.location.href = '/'
}

const handleMouseMove = (e) => {
  // 计算鼠标在屏幕中心的比例位置 (-0.5到0.5)
  const mouseXPercent = (e.clientX / window.innerWidth) - 0.5
  const mouseYPercent = (e.clientY / window.innerHeight) - 0.5
  
  // 视差效果 - 背景反向轻微移动 (5%)，限制移动范围
  const maxOffset = 8 // 最大偏移量
  const bgX = -mouseXPercent * 20 // 移动幅度
  const bgY = -mouseYPercent * 20
  
  // 悬浮框跟随移动 (10%)
  const boxX = mouseXPercent * 100
  const boxY = mouseYPercent * 100
  
  // 应用视差效果
  mouseX.value = window.innerWidth / 2 + boxX
  mouseY.value = window.innerHeight / 2 + boxY
  
  // 更新背景位置
  const bg = document.querySelector('.background-image')
  if (bg) {
    bg.style.transform = `translate(${bgX}px, ${bgY}px)`
  }
}

// 添加移动端触摸支持
const handleTouchMove = (e) => {
  const touch = e.touches[0]
  handleMouseMove({
    clientX: touch.clientX,
    clientY: touch.clientY
  })
}

onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  window.addEventListener('touchmove', handleTouchMove)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  window.removeEventListener('touchmove', handleTouchMove)
})
</script>

<style scoped>
.not-found {
  position: relative;
  height: 100vh;
  overflow: hidden;
}

.not-found::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)),
    url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noise)" opacity="0.2"/></svg>');
  z-index: 0;
}

.fixed-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
  filter: blur(2px);
}

.background-image {
  position: absolute;
  width: 120%;
  height: 120%;
  object-fit: cover;
  z-index: 0;
  transition: transform 0.5s ease-out;
  transform-origin: center;
  transform: translate(-10%, -10%);
  -webkit-mask-image: radial-gradient(circle, white 80%, transparent 100%);
  mask-image: radial-gradient(circle, white 80%, transparent 100%);
}

.floating-box {
  position: absolute;
  width: 300px;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 16px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-align: center;
  z-index: 1;
  transition: transform 0.1s ease-out;
}

h1 {
  font-size: 4rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 1rem;
}

p {
  font-size: 1.5rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 2rem;
}

.arrow {
  font-size: 2rem;
  color: white;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

.home-button {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.3);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  backdrop-filter: blur(5px);
}

.home-button:hover {
  background: rgba(255, 255, 255, 0.5);
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}
</style>
