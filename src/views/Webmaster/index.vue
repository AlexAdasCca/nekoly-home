<template>
  <div class="webmaster-wrapper">
    <!-- 粒子背景 -->
    <vue-particles id="tsparticles" :key="particlesKey" :options="particlesOption" />

    <!-- 控制面板 + 折叠按钮 -->
    <div class="theme-toggle-wrapper" ref="toggleWrapper">
      <div class="toggle-button" @click="showSettings = !showSettings">
        ⚙️
      </div>

      <transition name="fade-slide">
        <div class="theme-selector" v-if="showSettings">
          <div>
            <strong>主题颜色：</strong>
            <label v-for="(color, name) in themeColors" :key="name">
              <input type="radio" v-model="theme" :value="name" />
              {{ name }}
            </label>
          </div>
          <div style="margin-top: 8px;">
            <strong>粒子效果：</strong>
            <select v-model="effect">
              <option value="classic">经典</option>
              <option value="stars">星空</option>
              <option value="ripples">涟漪</option>
            </select>
          </div>
        </div>
      </transition>
    </div>

    <!-- 页面内容 -->
    <div class="webmaster" ref="webmasterContainer">
      <div class="header">
        <router-link to="/" class="back-home">
          ← 返回首页
        </router-link>
        <h1>站长工具</h1>
        <p>实用的网站管理工具集合</p>
      </div>

      <div class="tools-container">
        <el-row :gutter="20">
          <el-col
            v-for="(tool, index) in tools"
            :key="index"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
          >
            <div class="tool-card cards" @click="openTool(tool)">
              <div class="icon">
                <Icon size="28">
                  <component :is="toolIcons[tool.icon]" />
                </Icon>
              </div>
              <div class="content">
                <h3>{{ tool.name }}</h3>
                <p class="desc">{{ tool.desc }}</p>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    
    <!-- 返回顶部按钮 -->
    <transition name="fade">
      <button 
        v-show="showBackToTop" 
        @click="scrollToTop"
        class="back-to-top"
      >
        ↑
      </button>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Icon } from '@vicons/utils'
import { Tools, Code, Server, Database, Globe } from '@vicons/fa'
import webmasterTools from '@/assets/webmasterTools.json'

const tools = webmasterTools
const toolIcons = { Tools, Code, Server, Database, Globe }

const openTool = (tool) => {
  if (tool.link) window.open(tool.link, '_blank')
}

// 折叠面板开关
const showSettings = ref(false)
const toggleWrapper = ref(null)

function handleClickOutside(event) {
  if (toggleWrapper.value && !toggleWrapper.value.contains(event.target)) {
    showSettings.value = false
  }
}

const showBackToTop = ref(false)
const webmasterContainer = ref(null)

const scrollToTop = () => {
  webmasterContainer.value.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const handleScroll = () => {
  console.log('Scroll position:', webmasterContainer.value.scrollTop)
  showBackToTop.value = webmasterContainer.value.scrollTop > 100
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  webmasterContainer.value.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  webmasterContainer.value.removeEventListener('scroll', handleScroll)
})

// 主题颜色及背景
const themeColors = {
  米黄色: '#f5deb3',
  浅绿色: '#a8d5ba',
  素雅白: '#f5f5f5',
  高级黑: '#1a1a1a'
}

const themeBgMap = {
  米黄色: '#fef9f0',
  浅绿色: '#eef8f3',
  素雅白: '#ffffff',
  高级黑: '#121212'
}

const theme = ref('高级黑')
const effect = ref('classic')

// 动态颜色
const textColor = ref('')
const descColor = ref('')
const bgColor = ref('')

function getTextColors(themeName) {
  const colorMap = {
    米黄色: { text: '#2e2e2e', desc: '#4f4f4f' },
    浅绿色: { text: '#1f3a2f', desc: '#3e5c52' },
    素雅白: { text: '#2c2c2c', desc: '#555555' },
    高级黑: { text: '#ffffff', desc: '#cccccc' }
  }
  return colorMap[themeName] || { text: '#ffffff', desc: '#aaaaaa' }
}

function applyThemeColors(themeName) {
  const { text, desc } = getTextColors(themeName)
  const bg = themeBgMap[themeName] || '#000000'
  textColor.value = text
  descColor.value = desc
  bgColor.value = bg

  document.documentElement.style.setProperty('--text-color', text)
  document.documentElement.style.setProperty('--desc-color', desc)
  document.documentElement.style.setProperty('--bg-color', bg)
  const cardMap = {
    米黄色: { card: '#ffffffcc', shadow: '0 6px 16px rgba(0,0,0,0.1)' },
    浅绿色: { card: '#ffffffcc', shadow: '0 6px 16px rgba(0,0,0,0.12)' },
    素雅白: { card: '#ffffff', shadow: '0 6px 16px rgba(0,0,0,0.12)' },
    高级黑: { card: 'rgba(255,255,255,0.05)', shadow: '0 10px 20px rgba(255,255,255,0.2)' }
  }
  const cardTheme = cardMap[themeName] || cardMap['高级黑']
  document.documentElement.style.setProperty('--card-bg', cardTheme.card)
  document.documentElement.style.setProperty('--card-hover-shadow', cardTheme.shadow)
}

watch([theme, effect], ([newTheme, newEffect]) => {
  applyThemeColors(newTheme)
  particlesOption.value = getParticlesConfig(
    themeColors[newTheme],
    newEffect,
    getParticleColor(newTheme)
  )
  particlesKey.value++
})

function getParticleColor(themeName) {
  return getTextColors(themeName).text
}

applyThemeColors(theme.value)

const particlesKey = ref(0)

function getParticlesConfig(bgColor, style, dotColor) {
  switch (style) {
    case 'stars':
      return {
        background: { color: { value: bgColor } },
        particles: {
          number: { value: 160, density: { enable: true } },
          color: { value: dotColor },
          shape: { type: 'star' },
          opacity: { value: 0.7 },
          size: { value: 3 },
          move: { enable: true, speed: 1, direction: 'top', outModes: 'out' }
        },
        detectRetina: true
      }
    case 'ripples':
      return {
        background: { color: { value: bgColor } },
        particles: {
          number: { value: 100 },
          color: { value: dotColor },
          shape: { type: 'circle' },
          opacity: { value: 0.4 },
          size: { value: { min: 1, max: 6 } },
          move: { enable: true, speed: 2, direction: 'none', outModes: 'bounce' },
          links: {
            enable: true,
            distance: 150,
            color: dotColor,
            opacity: 0.4,
            width: 1
          }
        },
        detectRetina: true
      }
    case 'classic':
    default:
      return {
        background: { color: { value: bgColor } },
        fpsLimit: 60,
        particles: {
          number: { value: 80, density: { enable: true } },
          color: { value: dotColor },
          links: {
            enable: true,
            distance: 130,
            color: dotColor,
            opacity: 0.5,
            width: 1
          },
          move: {
            enable: true,
            speed: 1.5,
            outModes: 'bounce'
          },
          shape: { type: 'circle' },
          size: { value: { min: 1, max: 4 } },
          opacity: { value: 0.5 }
        },
        interactivity: {
          events: {
            onClick: { enable: true, mode: 'push' },
            onHover: { enable: true, mode: 'repulse' },
            resize: true
          },
          modes: {
            push: { quantity: 4 },
            repulse: { distance: 200, duration: 0.4 }
          }
        },
        detectRetina: true
      }
  }
}

const particlesOption = ref(
  getParticlesConfig(themeColors[theme.value], effect.value, getParticleColor(theme.value))
)
</script>

<style lang="scss">
:root {
  --text-color: #ffffff;
  --desc-color: #aaaaaa;
  --bg-color: #000000;
  --card-bg: rgba(255, 255, 255, 0.05);
  --card-hover-shadow: 0 10px 20px rgba(255, 255, 255, 0.2);
}

  .webmaster-wrapper {
    position: relative;
    min-height: 100vh;
    scroll-behavior: smooth;

  #tsparticles {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 0;
    width: 100%;
    height: 100%;
  }

  .theme-toggle-wrapper {
    position: fixed;
    top: 15px;
    right: 15px;
    z-index: 15;

    .toggle-button {
      background: rgba(0, 0, 0, 0.5);
      color: white;
      padding: 6px 10px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 18px;
      margin-bottom: 8px;
      text-align: center;
      transition: background 0.3s;

      &:hover {
        background: rgba(0, 0, 0, 0.7);
      }
    }
  }

  .theme-selector {
    background: rgba(0, 0, 0, 0.5);
    padding: 12px 16px;
    border-radius: 12px;
    color: white;
    font-size: 14px;
    line-height: 1.8;

    label {
      margin-right: 10px;
      input {
        margin-right: 4px;
      }
    }

    select {
      margin-top: 4px;
      padding: 4px 6px;
      border-radius: 6px;
      border: none;
      font-size: 14px;
      background-color: #f0f0f0;
      color: #222;
      appearance: none; // 防止部分浏览器使用系统样式
    }
  }

  .webmaster {
    position: relative;
    z-index: 1;
    padding: 20px;
    padding-top: 40px;
    padding-bottom: 40px;
    max-width: 1200px;
    max-height: calc(100vh - 120px);
    margin: 60px auto 0 auto;
    color: var(--text-color);
    background-color: var(--bg-color);
    border-radius: 10px;
    overflow-y: auto;

    .header {
      text-align: center;
      margin-bottom: 30px;

      h1 {
        font-size: 2.2rem;
        margin-bottom: 10px;
        color: var(--text-color);
      }

      p {
        font-size: 1.1rem;
        color: var(--desc-color);
      }
    }

    .tools-container {
      margin-top: 20px;
    }

    .tool-card {
      height: 120px;
      margin-bottom: 20px;
      padding: 15px;
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: all 0.3s;
      background: var(--card-bg);
      border-radius: 10px;

      &:hover {
        transform: translateY(-5px);
        box-shadow: var(--card-hover-shadow);
      }

      .icon {
        margin-right: 15px;
        color: #42b983;
      }

      .content {
        h3 {
          margin: 0 0 5px 0;
          font-size: 1.2rem;
          color: var(--text-color);
        }

        .desc {
          margin: 0;
          font-size: 0.9rem;
          color: var(--desc-color);
        }
      }
    }
  }
}

.theme-selector select {
  margin-top: 4px;
  padding: 4px 6px;
  border-radius: 6px;
  border: none;
  font-size: 14px;

  background-color: #f5f5f5 !important;
  color: #222 !important;

  // 避免系统默认样式干扰（有些浏览器如 Firefox）
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

.theme-selector select option {
  background-color: #f5f5f5;
  color: #222;
}

// 动画效果
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

// 返回顶部按钮样式
.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  font-size: 20px;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: scale(1.1);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
