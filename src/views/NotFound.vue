<template>
  <div class="not-found">
    <div class="container">
      <h1>404</h1>
      <p>前面的区域，以后再来探索吧~</p>
      <img 
        src="../public/images/background1.jpg" 
        alt="404 image"
        class="not-found-image"
      />
      <button @click="goHome" class="home-button">返回首页</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  text-align: center;
  background-color: #f5f5f5;
}

.container {
  max-width: 600px;
  padding: 2rem;
}

h1 {
  font-size: 4rem;
  color: #ff4757;
  margin-bottom: 1rem;
}

p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
}

.not-found-image {
  max-width: 100%;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.home-button {
  padding: 0.75rem 1.5rem;
  background-color: #ff4757;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.home-button:hover {
  background-color: #ff6b81;
}
</style>
