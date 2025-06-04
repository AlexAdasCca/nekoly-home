<template>
  <router-view v-slot="{ Component }">
    <Transition name="fade" mode="out-in">
      <div>
        <component :is="Component" />
      </div>
    </Transition>
  </router-view>
</template>


<script setup>
//import { mainStore } from "@/store";
import cursorInit from "@/utils/cursor.js";

// const store = mainStore();

onMounted(() => {
  // 自定义鼠标
  cursorInit();

  // 屏蔽右键
  document.oncontextmenu = () => {
    ElMessage({
      message: "为了浏览体验，本站禁用右键",
      grouping: true,
      duration: 2000,
    });
    return false;
  };
});
</script>
