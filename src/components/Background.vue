<template>
  <div :class="store.backgroundShow ? 'cover show' : 'cover'">
    <img
      v-show="store.imgLoadStatus"
      :src="bgUrl"
      class="bg"
      alt="cover"
      @load="imgLoadComplete"
      @error="imgLoadError"
      @animationend="imgAnimationEnd"
    />
    <div :class="store.backgroundShow ? 'gray hidden' : 'gray'" />
    
    <!-- 加载状态提示 -->
    <Transition name="fade">
      <div v-if="loadingState" class="loading-tip">
        {{ loadingState }}
      </div>
    </Transition>
    
    <Transition name="fade" mode="out-in">
      <a
        v-if="store.backgroundShow && store.coverType != '3'"
        class="down"
        :href="bgUrl"
        target="_blank"
      >
        下载壁纸
      </a>
    </Transition>
  </div>
</template>

<script setup>
import { mainStore } from "@/store";
import { Error, Loading } from "@icon-park/vue-next";
import { nextTick, ref } from "vue";

const store = mainStore();
const bgUrl = ref(null);
const imgTimeout = ref(null);
const loadingState = ref(null); // 加载状态提示
const emit = defineEmits(["loadComplete"]);

// 壁纸随机数
// 请依据文件夹内的图片个数修改 Math.random() 后面的第一个数字
const bgRandom = Math.floor(Math.random() * 10 + 1);

// 二次元壁纸API列表
const acgApis = [
  "https://api.vvhan.com/api/wallpaper/acg",
  "https://www.dmoe.cc/random.php",
  "https://api.ixiaowai.cn/api/api.php",
  "https://api.btstu.cn/sjbz/?lx=dongman"
];

// 显示加载提示
const showLoading = (message) => {
  loadingState.value = message;
  console.log(message);
};

// 清除加载提示
const clearLoading = () => {
  loadingState.value = null;
};

// 尝试加载图片
const tryLoadImage = async (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = `${url}?t=${Date.now()}`; // 添加时间戳防止缓存
  });
};

// 更换壁纸链接
const changeBg = async (type) => {
  showLoading("正在切换壁纸...");
  
  try {
    if (type == 0) {
      // 本地壁纸
      bgUrl.value = `/images/background${bgRandom}.jpg?t=${Date.now()}`;
      showLoading(`正在加载本地壁纸...`);
    } else if (type == 1) {
      // 必应壁纸
      showLoading("正在加载必应壁纸...");
      bgUrl.value = `https://api.dujin.org/bing/1920.php?t=${Date.now()}`;
    } else if (type == 2) {
      // VVHan风景壁纸
      showLoading("正在加载风景壁纸...");
      bgUrl.value = `https://api.vvhan.com/api/wallpaper/views?t=${Date.now()}`;
    } else if (type == 3) {
      // 二次元壁纸 - 尝试多个API
      showLoading("开始尝试加载二次元壁纸...");
      
      let success = false;
      
      // 尝试所有API直到成功
      for (let i = 0; i < acgApis.length; i++) {
        const api = acgApis[i];
        showLoading(`正在尝试获取源 ${i + 1}/${acgApis.length} ...`);
        
        const isAvailable = await tryLoadImage(api);
        
        if (isAvailable) {
          bgUrl.value = `${api}?t=${Date.now()}`;
          showLoading(`源 ${i + 1} 可用，正在加载壁纸...`);
          success = true;
          break;
        } else {
          showLoading(`源 ${i + 1} 不可用，尝试下一个...`);
        }
      }
      
      // 所有API都失败，回退到本地
      if (!success) {
        showLoading("所有二次元壁纸API均不可用，回退到本地壁纸");
        ElMessage({
          message: "所有壁纸API均加载失败，已切换回默认",
          icon: h(Error, {
            theme: "filled",
            fill: "#efefef",
          }),
        });
        bgUrl.value = `/images/background${bgRandom}.jpg?t=${Date.now()}`;
      }
    }
  } catch (error) {
    showLoading(`壁纸切换失败: ${error.message}`);
    ElMessage({
      message: `壁纸切换失败: ${error.message}`,
      icon: h(Error, {
        theme: "filled",
        fill: "#efefef",
      }),
    });
  }
};

// 图片加载完成
const imgLoadComplete = () => {
  console.log("壁纸加载成功:", bgUrl.value);
  showLoading("壁纸加载成功！");
  
  // 延迟清除提示，让用户看到成功消息
  setTimeout(() => {
    clearLoading();
  }, 1500);
  
  imgTimeout.value = setTimeout(
    () => {
      store.setImgLoadStatus(true);
    },
    Math.floor(Math.random() * (600 - 300 + 1)) + 300,
  );
};

// 图片动画完成
const imgAnimationEnd = () => {
  console.log("壁纸加载且动画完成");
  // 加载完成事件
  emit("loadComplete");
};

// 图片显示失败
const imgLoadError = async (e) => {
  console.error("壁纸加载失败：", bgUrl.value, "错误详情:", e);
  showLoading("壁纸加载失败，正在回退...");
  
  // 无论什么类型的壁纸，加载失败都回退到本地
  ElMessage({
    message: "壁纸加载失败，已临时切换回默认",
    icon: h(Error, {
      theme: "filled",
      fill: "#efefef",
    }),
  });
  
  await nextTick();
  bgUrl.value = `/images/background${bgRandom}.jpg?t=${Date.now()}`;
  
  // 延迟清除提示
  setTimeout(() => {
    clearLoading();
  }, 1500);
};

// 监听壁纸切换或强制更新
watch(
  () => [store.coverType, store.forceBgUpdate],
  async () => {
    await changeBg(store.coverType);
  }
);

onMounted(() => {
  // 只在 mounted 时加载壁纸
  changeBg(store.coverType);
});

onBeforeUnmount(() => {
  clearTimeout(imgTimeout.value);
});
</script>

<style lang="scss" scoped>
.cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: 0.25s;
  z-index: -1;

  &.show {
    z-index: 1;
  }

  .bg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    backface-visibility: hidden;
    filter: blur(20px) brightness(0.3);
    transition:
      filter 0.3s,
      transform 0.3s;
    animation: fade-blur-in 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    animation-delay: 0.45s;
  }
  
  .gray {
    opacity: 1;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-image: radial-gradient(rgba(0, 0, 0, 0) 0, rgba(0, 0, 0, 0.5) 100%),
      radial-gradient(rgba(0, 0, 0, 0) 33%, rgba(0, 0, 0, 0.3) 166%);

    transition: 1.5s;
    &.hidden {
      opacity: 0;
      transition: 1.5s;
    }
  }
  
  .down {
    font-size: 16px;
    color: white;
    position: absolute;
    bottom: 30px;
    left: 0;
    right: 0;
    margin: 0 auto;
    display: block;
    padding: 20px 26px;
    border-radius: 8px;
    background-color: #00000030;
    width: 120px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
      transform: scale(1.05);
      background-color: #00000060;
    }
    &:active {
      transform: scale(1);
    }
  }
  
  .loading-tip {
    position: absolute;
    top: 3%;
    left: 8%;
    transform: translate(-50%, -50%);
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 13px;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 8px;
    
    &::before {
      content: "";
      display: inline-block;
      width: 13px;
      height: 13px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
    }

    .loading-icon {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s linear infinite;
    }
    
    .loading-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
