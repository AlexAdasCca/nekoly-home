<template>
  <div class="more-content">
    <div 
      class="title"
      @click="toggleExpand"
    >
      <book-open theme="two-tone" size="24" :fill="['#efefef', '#00000020']" />
      <span>技术足迹</span>
      <component 
        :is="isExpanded ? Up : Down" 
        theme="two-tone" 
        size="18"
        class="expand-icon"
      />
    </div>

    <div v-if="!isExpanded" class="preview-content">
      <div class="content-section">
        <ul class="learning-list">
          <li v-for="(item, index) in learningItems.slice(0, 3)" :key="index">
            <div class="preview-row">
              <span class="date">{{ item.date }}</span>
              <span class="topic">{{ item.topic }}</span>
              <span class="progress preview-text">{{ item.progress }}%</span>
            </div>
          </li>
        </ul>
        <div class="ellipsis">...</div>
      </div>
    </div>

    <Teleport to="body">
      <transition name="fade">
        <div 
          v-if="isExpanded"
          class="modal-overlay"
          @click.self="toggleExpand"
        >
          <div class="modal-content">
            <div class="content-section">
              <h3>近期学习</h3>
              <div class="learning-container">
                <div v-for="(item, index) in learningItems" :key="index" class="learning-item">
                  <div class="item-row">
                    <span class="date">{{ item.date }}</span>
                    <span class="topic">{{ item.topic }}</span>
                    <div class="progress-container">
                      <span class="progress-value">{{ item.progress }}%</span>
                      <el-progress 
                        :percentage="item.progress" 
                        :stroke-width="12"
                        :show-text="false"
                        style="flex:1;min-width:60px"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="content-section">
              <h3>技术里程碑</h3>
              <el-timeline>
                <el-timeline-item
                  v-for="(milestone, index) in milestones"
                  :key="index"
                  :timestamp="milestone.date"
                >
                  <span style="color: white">{{ milestone.event }}</span>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { BookOpen, Down, Up } from "@icon-park/vue-next";
import { ref } from "vue";
import moreContentData from "@/assets/moreContent.json";

const learningItems = ref(moreContentData.learningItems);
const milestones = ref(moreContentData.milestones);
const isExpanded = ref(false);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<style lang="scss" scoped>
.more-content {
  width: 100%;
  isolation: isolate;
  
  .preview-content {
    contain: content;
    width: 100%;
    overflow: visible;
    
    .content-section {
      width: 100%;
      min-width: max-content;
      
      .learning-list {
        width: 100%;
        
        li {
          width: 100%;
          
          .preview-row {
            display: grid;
            grid-template-columns: 4rem minmax(0, 1fr) 4rem;
            gap: 1rem;
            min-width: 100%;
            
            > * {
              min-width: 0;
            }
            
            .date {
              width: 4rem;
              margin-right: 1rem;
            }
            
            .topic {
              padding: 0 0.5rem;
            }
          }
        }
      }
    }
  }
  
  .title {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 1rem 0 1.5rem;
    font-size: 1.1rem;
    cursor: pointer;
    
    .i-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-right: 6px;
    }

    .expand-icon {
      margin-left: auto;
      opacity: 0.6;
      transition: all 0.3s;
      
      &:hover {
        opacity: 1;
      }
    }
  }
}

.preview-text {
  min-width: 3.5rem;
  text-align: right;
  font-size: 0.9rem;
  opacity: 0.8;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-left: auto;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 2rem;
  width: 80%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  
  .content-section {
    margin-bottom: 2rem;
    
    h3 {
      margin-bottom: 1rem;
      font-size: 1rem;
      color: var(--el-text-color-regular);
    }

      .learning-container {
        width: 100%;
        
        .learning-item {
          margin-bottom: 0.8rem;
          
          .item-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            
            .date {
              width: 2.5rem;
              opacity: 0.7;
              font-size: 0.8rem;
              flex-shrink: 0;
            }
            
            .topic {
              flex: 1;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              min-width: 0;
            }
            
            .progress-container {
              display: flex;
              align-items: center;
              gap: 0.3rem;
              width: 15rem;
              flex-shrink: 0;
              
              .progress-value {
                color: white;
                width: 3rem;
                text-align: right;
              }
              
              .el-progress {
                min-width: 6rem;
              }
            }
          }
        }
      }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
