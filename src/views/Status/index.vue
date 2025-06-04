<template>
  <div class="status-page">
    <div class="status-header">
      <h1>我的状态</h1>
      <p>更新并分享您当前的状态</p>
    </div>

    <div class="current-status">
      <h2>当前状态</h2>
      <div class="status-display">
        <div class="status-dot" :class="statusClass"></div>
        <span class="status-text">{{ store.authorStatus }}</span>
        <span v-if="store.authorStatusMessage" class="status-message">({{ store.authorStatusMessage }})</span>
      </div>
    </div>

    <div class="status-form">
      <h2>更新状态</h2>
      <div class="status-options">
        <button 
          v-for="status in statusOptions" 
          :key="status.value"
          @click="selectStatus(status.value)"
          :class="{ active: selectedStatus === status.value }"
        >
          {{ status.label }}
        </button>
      </div>
      <div class="status-message-input">
        <input 
          v-model="statusMessage" 
          type="text" 
          placeholder="添加状态说明 (可选)"
          @keyup.enter="updateStatus"
        >
      </div>
      <button @click="updateStatus" class="update-button">
        更新状态
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { mainStore } from '@/store'

const store = mainStore()
const selectedStatus = ref(store.authorStatus || '在线')
const statusMessage = ref(store.authorStatusMessage || '')

const statusOptions = [
  { value: '在线', label: '在线' },
  { value: '忙碌', label: '忙碌中' },
  { value: '离开', label: '暂时离开' },
  { value: '睡觉', label: '睡觉中' },
  { value: '勿扰', label: '请勿打扰' }
]

const statusClass = computed(() => {
  return {
    'online': store.authorStatus === '在线',
    'busy': store.authorStatus === '忙碌',
    'away': store.authorStatus === '离开',
    'sleeping': store.authorStatus === '睡觉',
    'dnd': store.authorStatus === '勿扰'
  }
})

const selectStatus = (status) => {
  selectedStatus.value = status
}

const updateStatus = () => {
  store.setAuthorStatus(selectedStatus.value, statusMessage.value)
}
</script>

<style scoped>
.status-page {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  color: white;
}

.status-header {
  text-align: center;
  margin-bottom: 2rem;
}

.status-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.current-status {
  margin-bottom: 2rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.status-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-dot.online {
  background-color: #42b983;
}

.status-dot.busy {
  background-color: #ffc107;
}

.status-dot.away {
  background-color: #ff9800;
}

.status-dot.sleeping {
  background-color: #9c27b0;
}

.status-dot.dnd {
  background-color: #f44336;
}

.status-text {
  font-size: 1.2rem;
}

.status-message {
  color: rgba(255, 255, 255, 0.7);
}

.status-form {
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.status-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.status-options button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.status-options button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.status-options button.active {
  background: #42b983;
}

.status-message-input {
  margin: 1rem 0;
}

.status-message-input input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
  color: white;
}

.update-button {
  width: 100%;
  padding: 0.75rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
}

.update-button:hover {
  background: #3aa876;
}
</style>
