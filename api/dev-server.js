import express from 'express'
import weatherApi from './weather.js'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
const port = 3001

// 允许的源列表
const allowedOrigins = [
  'http://localhost:4173', // Vite预览服务器
  'http://localhost:3000'  // Vite开发服务器
]

// 配置CORS中间件
app.use((req, res, next) => {
  const origin = req.headers.origin
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key')
  }
  next()
})

app.use(express.json())

// 处理预检请求
app.options('/api/weather/:path*', (req, res) => {
  res.sendStatus(200)
})

// 代理Vercel风格的API路由
app.all('/api/weather/:path*', (req, res) => {
  // 转换请求格式适配Vercel函数
  const vercelReq = {
    url: req.url,
    method: req.method,
    headers: req.headers,
    query: req.query
  }
  
  const vercelRes = {
    statusCode: 200,
    setHeader: (key, value) => res.set(key, value),
    json: (data) => res.status(vercelRes.statusCode).json(data),
    status: (code) => {
      vercelRes.statusCode = code
      return vercelRes
    }
  }

  weatherApi(vercelReq, vercelRes)
})

app.listen(port, () => {
  console.log(`Local API server running at http://localhost:${port}`)
  console.log(`Test endpoints:
  - GET http://localhost:${port}/api/weather/location
  - GET http://localhost:${port}/api/weather/info?city=城市编码`)
})
