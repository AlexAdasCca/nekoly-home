import { createApp } from 'vue'
import NotFound from '@/views/NotFound.vue'
import router from '@/router'

const app = createApp(NotFound)
app.use(router)
app.mount('#app')
