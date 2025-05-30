<template>
  <div 
    class="announcement-container"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @mousedown="startDrag"
    @touchstart="startDrag"
  >
  <div class="floating-ball" @click="handleBallClick">
      <span>公告</span>
    </div>

    <div class="announcement-modal" v-if="isExpanded" @click.self="toggleExpand">
      <div class="announcement-content">
        <div class="modal-header">
          <h2>公告中心</h2>
          <button class="close-btn" @click="toggleExpand">×</button>
        </div>

        <div class="tab-container">
          <button 
            v-for="tab in tabs"
            :key="tab.id"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            {{ tab.name }}
          </button>
        </div>

        <div v-if="!currentAnnouncement" class="announcement-grid">
          <div 
            v-for="item in filteredAnnouncements"
            :key="item.id"
            class="announcement-card"
            @click="fetchAnnouncementDetail(item.id)"
          >
            <div class="card-header">
              <span class="tag" :class="item.category">{{ getCategoryName(item.category) }}</span>
              <span class="date">{{ formatDate(item.date) }}</span>
            </div>
            <h3 class="title">{{ item.title }}</h3>
            <p class="author">发布者: {{ item.author }}</p>
          </div>
        </div>

        <div v-else class="announcement-detail">
          <div class="detail-header">
            <button @click="backToList">← 返回列表</button>
            <div class="meta">
              <span class="tag" :class="currentAnnouncement.category">{{ getCategoryName(currentAnnouncement.category) }}</span>
              <span class="date">{{ formatDate(currentAnnouncement.date) }}</span>
              <span class="author">{{ currentAnnouncement.author }}</span>
            </div>
            <h2>{{ currentAnnouncement.title }}</h2>
          </div>
          <div class="markdown-content" v-html="renderedContent"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, computed, h, inject } from 'vue'
import { marked } from 'marked'
import { ElMessage } from 'element-plus'
import { Error } from '@icon-park/vue-next'

export default {
  name: 'Announcement',
  setup() {
    const isExpanded = ref(false)
    const position = ref({ x: window.innerWidth - 80, y: window.innerHeight - 80 })
    const isDragging = ref(false)
    const wasDragged = ref(false)  // <-- 新增标志位
    const startPos = ref({ x: 0, y: 0 })

    const startDrag = (e: MouseEvent | TouchEvent) => {
      if (e instanceof MouseEvent && e.button !== 0) return
      
      e.stopPropagation()
      isDragging.value = true
      startPos.value = {
        x: e instanceof MouseEvent ? e.clientX : e.touches[0].clientX,
        y: e instanceof MouseEvent ? e.clientY : e.touches[0].clientY
      }
      document.addEventListener('mousemove', onDrag)
      document.addEventListener('touchmove', onDrag)
      document.addEventListener('mouseup', stopDrag)
      document.addEventListener('touchend', stopDrag)
    }

    const onDrag = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.value) return
      wasDragged.value = true  // <-- 标记为拖动

      const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
      const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY

      position.value = {
        x: Math.max(0, Math.min(window.innerWidth - 50, position.value.x + (clientX - startPos.value.x))),
        y: Math.max(0, Math.min(window.innerHeight - 50, position.value.y + (clientY - startPos.value.y)))
      }
      startPos.value = { x: clientX, y: clientY }
    }

    const stopDrag = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.value) return

      isDragging.value = false
      document.removeEventListener('mousemove', onDrag)
      document.removeEventListener('touchmove', onDrag)
      document.removeEventListener('mouseup', stopDrag)
      document.removeEventListener('touchend', stopDrag)

      // 延迟清除，避免 click 检测不到
      setTimeout(() => {
        wasDragged.value = false
      }, 100)
    }

    const handleBallClick = (e: MouseEvent) => {
      if (wasDragged.value) {
        e.preventDefault()
        return  // <-- 如果刚刚拖动过，不触发 toggleExpand
      }
      toggleExpand()
    }

    const tabs = [
      { id: 'all', name: '全部' },
      { id: 'news', name: '新闻' },
      { id: 'update', name: '更新' },
      { id: 'event', name: '活动' }
    ]
    const activeTab = ref('all')
    const announcementList = ref([])
    const currentAnnouncement = ref(null)
    const content = ref('')
    const listCode = import.meta.env.VITE_ANNOUNCEMENT_LIST_CODE || 'ZJ1JSFg3kqGY5ibKcbjHd5ca'

    const filteredAnnouncements = computed(() => {
      if (activeTab.value === 'all') return announcementList.value
      return announcementList.value.filter(item => item.category === activeTab.value)
    })

    const getCategoryName = (category) => {
      const tab = tabs.find(t => t.id === category)
      return tab ? tab.name : '其他'
    }

    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }

    const renderedContent = computed(() => {
      return marked.parse(content.value || '')
    })

    const toggleExpand = () => {
      isExpanded.value = !isExpanded.value
      if (isExpanded.value && !announcementList.value.length) {
        fetchAnnouncementList()
      }
    }

    const backToList = () => {
      currentAnnouncement.value = null
      content.value = ''
    }

    const notify = inject('notify', (msg) => {
      console.warn('Notification:', msg.message)
    })

     /**
     * 获取公告列表
     * 数据格式示例:
     * [
     *   {
     *     "id": "文章ID",  // 必填，如"146324194"
     *     "title": "公告标题",  // 必填
     *     "category": "news|update|event",  // 可选，分类
     *     "date": "2025-05-30",  // 可选，发布日期
     *     "author": "发布者",  // 可选
     *     "content": "Markdown格式内容"  // 详情页使用
     *   },
     *   ...
     * ]
     */
    const fetchAnnouncementList = async () => {
      try {
        const response = await fetch(`https://textdb.online/${listCode}`)
        const data = await response.json()
        announcementList.value = data.map(item => ({
          id: item.id,
          title: item.title,
          category: item.category || 'news',
          date: item.date || new Date().toISOString().split('T')[0],
          author: item.author || '管理员'
        }))
      } catch (error) {
        console.error('获取公告列表失败:', error)
        ElMessage({
          message: '获取公告列表失败，请稍后再试',
          grouping: true,
          icon: h(Error, {
            theme: "filled",
            fill: "#efefef",
          }),
        })
      }
    }

    const fetchAnnouncementDetail = async (id) => {
      try {
        const response = await fetch(`https://textdb.online/${id}`)
        const data = await response.json()
        currentAnnouncement.value = {
          id: data.id,
          title: data.title
        }
        content.value = data.content
      } catch (error) {
        console.error('获取公告详情失败:', error)
        ElMessage({
          message: '获取公告详情失败，请稍后再试',
          grouping: true,
          icon: h(Error, {
            theme: "filled",
            fill: "#efefef",
          }),
        })
        backToList()
      }
    }

    return {
      isExpanded,
      position,
      tabs,
      activeTab,
      filteredAnnouncements,
      announcementList,
      currentAnnouncement,
      renderedContent,
      toggleExpand,
      backToList,
      fetchAnnouncementDetail,
      startDrag,
      getCategoryName,
      formatDate,
      handleBallClick  // <-- 新增绑定
    }
  }
}
</script>


<style scoped>
.announcement-container {
  position: fixed;
  z-index: 1000;
  cursor: grab;
}

.announcement-container:active {
  cursor: grabbing;
}

.floating-ball {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #42b983;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.floating-ball:hover {
  transform: scale(1.1);
}

.announcement-content {
  width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  color: white;
}

.announcement-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
  background: rgba(0, 0, 0, 0.7);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  color: #fff;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  padding: 0 10px;
}

.tab-container {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.tab-container button {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-container button.active {
  background: rgba(66, 185, 131, 0.7);
}

.announcement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.announcement-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.announcement-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.tag.news {
  background: rgba(66, 185, 131, 0.2);
  color: #42b983;
}

.tag.update {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.tag.event {
  background: rgba(233, 30, 99, 0.2);
  color: #e91e63;
}

.date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.title {
  margin: 8px 0;
  color: #fff;
}

.author {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.detail-header {
  margin-bottom: 20px;
}

.detail-header button {
  background: none;
  border: none;
  color: #42b983;
  cursor: pointer;
  margin-bottom: 10px;
}

.detail-header h2 {
  margin: 10px 0;
  color: #fff;
}

.meta {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 5px;
  font-size: 14px;
}

.markdown-content {
  line-height: 1.6;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  margin-top: 1em;
  margin-bottom: 0.5em;
}

.markdown-content :deep(p) {
  margin: 0.5em 0;
}

.markdown-content :deep(a) {
  color: #42b983;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(code) {
  background-color: #f5f5f5;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
}

.markdown-content :deep(pre) {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 3px;
  overflow-x: auto;
}
</style>
