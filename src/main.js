import { createApp } from "vue";
import "@/style/style.scss";
import App from "@/App.vue";
import router from "@/router";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import "swiper/css";
import Particles from '@tsparticles/vue3'
import { loadFull } from 'tsparticles'

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.use(Particles, {
  init: async (engine) => {
    await loadFull(engine) // you can load the full tsParticles library from "tsparticles" if you need it
    // loadSlim 轻量级的
    // await loadSlim(engine) // or you can load the slim version from "tsparticles-slim" if don't need Shapes or Animations
  }
})
app.mount("#app");

// PWA
navigator.serviceWorker.addEventListener("controllerchange", () => {
  // 弹出更新提醒
  console.log("站点已更新，刷新后生效");
  ElMessage("站点已更新，刷新后生效");
});
