<!--
公告组件 (Announcement)

功能概述：
- 提供可拖拽的浮动公告按钮
- 点击按钮展开公告面板
- 支持分类查看公告（全部/新闻/更新/活动）
- 公告详情支持Markdown格式渲染
- 从远程API动态获取公告数据

数据格式规范：

1. 公告列表API (VITE_ANNOUNCEMENT_LIST_CODE 环境变量指定)
   - 返回格式: Array<AnnouncementItem>
   - AnnouncementItem 结构:
     {
       id: string       // 必填，文章唯一ID
       title: string    // 必填，公告标题(不超过50字)
       category?: string // 可选，分类标识(news|update|event)
       date?: string    // 可选，发布日期(ISO格式: YYYY-MM-DD)
       author?: string  // 可选，发布者(不超过20字)
       content?: string // 可选，详情页Markdown内容
     }

2. 公告详情API规范
   - 通过rlid访问: `https://textdb.online/{rlid}`
   - 返回格式: 
     {
       "aid": "",       // 文章ID(可选)
       "rlid": "",      // 文章唯一ID(必填)
       "title": "",     // 标题(必填)
       "content": "",   // 详细内容(必填)
       "tags": [],      // 标签数组(可选)
       "date": "",      // 发布日期(可选)
       "author": ""     // 发布者(可选)
     }

3. Markdown内容格式要求:
   - 支持标准Markdown语法
   - 可包含标题(#)、列表(-/*)、链接、图片等
   - 图片建议使用绝对URL
   - 代码块使用```包裹
   - 建议段落之间空一行

4. 分类规范:
   - news: 新闻公告(蓝色)
   - update: 更新日志(黄色) 
   - event: 活动公告(粉色)
   - 未指定分类默认为news

使用示例：
1. 在.env文件中配置公告列表API代码:
   VITE_ANNOUNCEMENT_LIST_CODE=your_list_code

2. 在模板中使用:
   <Announcement />

样式定制：
- 通过修改scoped样式可自定义:
  - 浮动球体(.floating-ball)
  - 公告面板(.announcement-content)
  - 分类标签(.tag)
  - 详情内容(.markdown-content)
-->
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
              <!-- 公告文章标签 -->
              <template v-if="currentAnnouncement.tags && currentAnnouncement.tags.length">
                <span class="tags">
                  <span v-for="tag in currentAnnouncement.tags" :key="tag" class="tag-label">#{{ tag }}</span>
                </span>
              </template>
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
import { ref, computed, h } from 'vue'
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

    const stopDrag = (_e: MouseEvent | TouchEvent) => {
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
    interface AnnouncementItem {
      id: string       // 列表项ID
      aid?: string     // 文章ID
      rlid?: string    // 详情查询ID
      title: string
      category?: string
      date?: string
      author?: string
      summary?: string // 列表简介内容
      content?: string // 详情完整内容
      tags?: string[]  // 文章标签
    }

    const announcementList = ref<AnnouncementItem[]>([])
    const currentAnnouncement = ref<AnnouncementItem | null>(null)
    const content = ref('')
    const listCode = import.meta.env.VITE_ANNOUNCEMENT_LIST_CODE || ''

    const filteredAnnouncements = computed(() => {
      if (activeTab.value === 'all') return announcementList.value
      return announcementList.value.filter(item => item.category === activeTab.value)
    })

    const getCategoryName = (category?: string) => {
      if (!category) return '其他'
      const tab = tabs.find(t => t.id === category)
      return tab ? tab.name : '其他'
    }

    const formatDate = (dateStr?: string) => {
      if (!dateStr) return ''
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
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format from API')
        }
        announcementList.value = data.map(item => ({
          id: item.id,
          rlid: item.rlid, // 保存详情查询ID
          title: item.title,
          category: item.category || 'news',
          date: item.date || new Date().toISOString().split('T')[0],
          author: item.author || '管理员',
          summary: item.content // 列表简介内容
        }))
      } catch (error) {
        console.error('获取公告列表失败:', error)
        ElMessage({
          message: `获取公告列表失败: ${error.message}`,
          grouping: true,
          icon: h(Error, {
            theme: "filled",
            fill: "#efefef",
          }),
        })
        // 设置空数组避免UI错误
        announcementList.value = []
      }
    }

    const fetchAnnouncementDetail = async (rlid: string) => {
      try {
        const response = await fetch(`https://textdb.online/${rlid}`)
        const data = await response.json()
        if (!data.rlid) throw new Error('Invalid response format')
        
        currentAnnouncement.value = {
          id: data.rlid, // 使用rlid作为主ID
          aid: data.aid,
          rlid: data.rlid,
          title: data.title,
          date: data.date,
          author: data.author,
          tags: data.tags
        }
        content.value = data.content // 详情内容
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
      handleBallClick
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

.tag-label {
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  color: #eee;
  margin-left: 5px;
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
