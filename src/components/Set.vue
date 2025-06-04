<template>
  <div class="setting">
    <el-collapse class="collapse" v-model="activeName" accordion>
      <el-collapse-item title="个性壁纸" name="1">
        <div class="bg-set">
          <el-radio-group v-model="coverType" text-color="#ffffff" @change="radioChange">
            <el-radio value="0" size="large" border>默认壁纸</el-radio>
            <el-radio value="1" size="large" border>每日一图</el-radio>
            <el-radio value="2" size="large" border>随机风景</el-radio>
            <el-radio value="3" size="large" border>随机动漫</el-radio>
          </el-radio-group>
          <el-button 
            class="update-btn" 
            type="primary" 
            size="small" 
            @click="updateNow"
            :disabled="isUpdating"
          >
            立即更新
          </el-button>
        </div>
      </el-collapse-item>
      <el-collapse-item title="个性化调整" name="2">
        <div class="item">
          <span class="text">建站日期显示</span>
          <el-switch
            v-model="siteStartShow"
            inline-prompt
            :active-icon="CheckSmall"
            :inactive-icon="CloseSmall"
          />
        </div>
        <div class="item">
          <span class="text">音乐点击是否打开面板</span>
          <el-switch
            v-model="musicClick"
            inline-prompt
            :active-icon="CheckSmall"
            :inactive-icon="CloseSmall"
          />
        </div>
        <div class="item">
          <span class="text">底栏歌词显示</span>
          <el-switch
            v-model="playerLrcShow"
            inline-prompt
            :active-icon="CheckSmall"
            :inactive-icon="CloseSmall"
          />
        </div>
        <div class="item">
          <span class="text">底栏背景模糊</span>
          <el-switch
            v-model="footerBlur"
            inline-prompt
            :active-icon="CheckSmall"
            :inactive-icon="CloseSmall"
          />
        </div>
      </el-collapse-item>
      <el-collapse-item title="播放器配置" name="3">
        <div class="item">
          <span class="text">自动播放</span>
          <el-switch
            v-model="playerAutoplay"
            inline-prompt
            :active-icon="CheckSmall"
            :inactive-icon="CloseSmall"
          />
        </div>
        <div class="item">
          <span class="text">随机播放</span>
          <el-switch
            v-model="playerOrder"
            inline-prompt
            :active-icon="CheckSmall"
            :inactive-icon="CloseSmall"
            active-value="random"
            inactive-value="list"
          />
        </div>
        <div class="item">
          <span class="text">循环模式</span>
          <el-radio-group v-model="playerLoop" size="small" text-color="#FFFFFF">
            <el-radio value="all" border>列表</el-radio>
            <el-radio value="one" border>单曲</el-radio>
            <el-radio value="none" border>不循环</el-radio>
          </el-radio-group>
        </div>
      </el-collapse-item>
      <el-collapse-item title="其他设置" name="4">
        <div class="item">
          <el-button 
            class="force-refresh-btn"
            size="small" 
            @click="forceRefresh"
          >
            清除数据
          </el-button>
          <span class="tip-text">遇到显示问题时使用</span>
          <el-dialog
            v-model="showForceDialog"
            title="请选择清除范围"
            class="force-refresh-dialog"
            width="400px"
            :close-on-click-modal="false"
          >
            <el-checkbox-group v-model="selectedOptions" class="refresh-checkboxes">
              <el-checkbox label="cache">清除浏览器缓存 (Caches)</el-checkbox>
              <el-checkbox label="localStorage">清除本地存储 (LocalStorage)</el-checkbox>
              <el-checkbox label="sessionStorage">清除会话存储 (SessionStorage)</el-checkbox>
              <el-checkbox label="forceRefresh">强制刷新页面 (Force-refresh)</el-checkbox>
            </el-checkbox-group>

            <el-input
              v-model="confirmText"
              placeholder="请输入『确认清除数据』以继续操作"
              :error="confirmError"
              size="small"
              clearable
              style="margin-top: 20px"
            />

            <template #footer>
              <el-button @click="showForceDialog = false">取消</el-button>
              <el-button
                type="primary"
                @click="handleConfirmClick"
                :disabled="selectedOptions.length === 0"
              >
                执行选中
              </el-button>
            </template>
          </el-dialog>

        </div>
        <div style="height: 40px;"></div>
        <div class="item" style="margin-top: 20px;">
          <span style="color: rgba(255,255,255,0.5); font-size: 14px; display: block; text-align: center; width: 100%;">
            设置内容待增加
          </span>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup>
import { CheckSmall, CloseSmall, SuccessPicture, Loading } from "@icon-park/vue-next";
import { mainStore } from "@/store";
import { storeToRefs } from "pinia";

const store = mainStore();
const {
  coverType,
  siteStartShow,
  musicClick,
  playerLrcShow,
  footerBlur,
  playerAutoplay,
  playerOrder,
  playerLoop,
} = storeToRefs(store);

// 默认选中项
const activeName = ref("1");

const lastUpdateTime = ref(0);
const isUpdating = ref(false);

// 壁纸切换
const radioChange = () => {
  ElMessage({
    message: "壁纸更换成功",
    icon: h(SuccessPicture, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
};

// 强制刷新框架
const showForceDialog = ref(false)
const selectedOptions = ref(['cache', 'localStorage', 'sessionStorage', 'forceRefresh'])
const confirmText = ref("")
const requiredConfirmText = "确认清除数据"
const confirmError = ref(false)


const forceRefresh = () => {
  confirmText.value = "";
  confirmError.value = false;
  showForceDialog.value = true;
};

const handleConfirmClick = () => {
  if (confirmText.value !== requiredConfirmText) {
    confirmError.value = true;
    ElMessage.error("请正确输入『确认清除数据』以继续操作");
    return;
  }
  confirmError.value = false;
  confirmForceRefresh();
};

const confirmForceRefresh = () => {
  const options = selectedOptions.value;

  ElMessage({
    message: `正在清除选中的数据: ${options.join(', ')}...`,
    type: 'warning'
  });

  setTimeout(() => {
    // 清除缓存
    if (options.includes('cache') && 'caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name));
      });
    }

    if (options.includes('localStorage')) localStorage.clear();
    if (options.includes('sessionStorage')) sessionStorage.clear();

    if (options.includes('forceRefresh') || options.includes('cache')) {
      const baseUrl = window.location.href.split('?')[0];
      window.location.href = `${baseUrl}?_=${Date.now()}`;
    } else {
      showForceDialog.value = false;
      confirmText.value = "";
      ElMessage.success('清除完成');
    }
  }, 500);
};

// 立即更新壁纸
  const updateNow = () => {
    const now = Date.now();
    const cooldown = 5000; // 5秒冷却时间
    
    // 检查冷却状态
    if (lastUpdateTime.value && now - lastUpdateTime.value < cooldown) {
      const messages = [
        "别急嘛~让壁纸喘口气",
        "点太快啦，稍等片刻再试",
        "壁纸正在赶来的路上，请耐心等待",
        "休息5秒钟，马上回来",
        "手速太快了，慢一点啦~"
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      ElMessage({
        message: randomMsg,
        icon: h(Loading, {
          theme: "filled",
          fill: "#efefef",
        }),
      });
      return;
    }
    
    // 开始更新
    isUpdating.value = true;
    lastUpdateTime.value = now;
    
    // 触发壁纸更新
    store.triggerBgUpdate();
    radioChange();
    
    // 重置更新状态
    setTimeout(() => {
      isUpdating.value = false;
    }, 1000);
  };
</script>

<style lang="scss">
/* 不是 scoped！必须是全局作用域 */
.force-refresh-dialog {
  background: rgba(40, 40, 40, 0.95);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #ddd;

  .el-dialog__header {
    .el-dialog__title {
      color: #fff !important;
    }
  }

  .el-message-box__title {
    color: #fff;
  }

  .el-message-box__content {
    color: #ddd;

    p, span, div {
      color: #ddd !important;
    }
  }

  .el-button--primary {
    background-color: #f56c6c !important;
    border-color: #f56c6c !important;
    color: #fff !important;

    &:hover {
      background-color: #f78989 !important;
      border-color: #f78989 !important;
    }
  }

  .el-button:not(.el-button--primary) {
    background-color: rgba(230, 162, 60, 0.1) !important;
    border-color: #e6a23c !important;
    color: #e6a23c !important;

    &:hover {
      background-color: rgba(230, 162, 60, 0.2) !important;
      color: #fff !important;
    }
  }

  :deep(.el-message-box__input) {
    label.el-message-box__checkbox {
      background-color: rgba(0, 0, 0, 0.7); // 深灰色背景
      border-radius: 6px;
      padding: 6px 10px;
      display: flex;
      align-items: center;

      input[type="checkbox"] {
        appearance: none;
        width: 16px;
        height: 16px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        background-color: rgba(255, 255, 255, 0.1);
        margin-right: 8px;
        cursor: pointer;

        &:checked {
          background-color: #f56c6c; // 红色选中状态
          border-color: #f56c6c;
        }
      }

      span.el-message-box__checkbox-label {
        color: #ffffff; // 白色文字
        font-size: 14px;
      }
    }
  }
}

.force-refresh-dialog .el-input {
  margin-top: 10px;
}
</style>


<style lang="scss" scoped>

.force-refresh-btn {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.9);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    color: #fff;
  }
  
  &:active {
    background-color: rgba(255, 255, 255, 0.05);
  }
}

.setting {
  .collapse {
    border-radius: 8px;
    --el-collapse-content-bg-color: #ffffff10;
    border-color: transparent;
    overflow: hidden;

    :deep(.el-collapse-item__header) {
      background-color: #ffffff30;
      color: #fff;
      font-size: 15px;
      padding-left: 18px;
      border-color: transparent;
    }

    :deep(.el-collapse-item__wrap) {
      border-color: transparent;

      .el-collapse-item__content {
        padding: 20px;
        
        .bg-set {
          display: flex;
          flex-direction: column;
          gap: 16px;
          
          .update-btn {
            align-self: flex-end;
            background: #ffffff26;
            border-color: transparent;
            
            &:hover {
              background: #ffffff40;
            }
            
            &:active {
              background: #ffffff20;
            }
            
            &.is-disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
          }
        }
        .item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          font-size: 14px;
          .el-switch__core {
            border-color: transparent;
            background-color: #ffffff30;
          }
          .el-radio-group {
            .el-radio {
              margin: 2px 10px 2px 0;
              border-radius: 5px;

              &:last-child {
                margin-right: 0;
              }
            }
          }
        }
        .el-radio-group {
          justify-content: space-between;

          .el-radio {
            margin: 10px 16px;
            background: #ffffff26;
            border: 2px solid transparent;
            border-radius: 8px;

            .el-radio__label {
              color: #fff;
            }

            .el-radio__inner {
              background: #ffffff06 !important;
              border: 2px solid #eeeeee !important;
            }

            &.is-checked {
              background: #ffffff06 !important;
              border: 2px solid #eeeeee !important;
            }

            .is-checked {
              .el-radio__inner {
                background-color: #ffffff30 !important;
                border-color: #fff !important;
              }

              & + .el-radio__label {
                color: #fff !important;
              }
            }
          }
        }
      }
    }
  }
}
</style>
