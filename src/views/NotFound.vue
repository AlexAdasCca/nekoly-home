<template>
  <div class="not-found">
    <!-- 背景图片 -->
    <img 
      src="/images/background8.jpg" 
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
      <p>前面的区域，下次再来探索哦~</p>
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

const goHome = () => {
  // 强制刷新页面以确保正确加载主应用
  window.location.href = '/'
}

const handleMouseMove = (e) => {
  // 计算鼠标在屏幕中心的比例位置 (-0.5到0.5)
  const mouseXPercent = (e.clientX / window.innerWidth) - 0.5
  const mouseYPercent = (e.clientY / window.innerHeight) - 0.5
  
  // 视差效果 - 背景反向轻微移动 (5%)
  const bgX = -mouseXPercent * 50
  const bgY = -mouseYPercent * 50
  
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

.background-image {
  position: absolute;
  width: 110%; /* 扩大背景防止移动时露出边缘 */
  height: 110%;
  object-fit: cover;
  z-index: 0;
  transition: transform 0.5s ease-out;
  transform-origin: center;
}

.floating-box {
  position: absolute;
  width: 300px;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.2);
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
