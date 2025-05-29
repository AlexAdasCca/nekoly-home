import fetch from 'node-fetch'

// 验证请求有效性
const validateRequest = (headers) => {
  try {
    const token = headers['x-auth-token']
    const clientTime = parseInt(headers['x-utc-minutes'])
    
    // 使用明确的UTC时间戳
    const serverTime = Math.floor(new Date().getTime() / 60000)
    console.log('时间验证 - 客户端:', clientTime, '服务端:', serverTime)
    
    // 验证时间戳(允许±5分钟误差)
    if (Math.abs(serverTime - clientTime) > 5) {
      console.log('时间验证失败: 差异', Math.abs(serverTime - clientTime), '分钟')
      return false
    }

    // 验证令牌格式
    try {
      const decoded = decodeURIComponent(atob(token))
      const [timestamp] = decoded.split(':')
      if (parseInt(timestamp) !== clientTime) {
        console.log('令牌时间戳不匹配')
        return false
      }
    } catch (error) {
      console.log('令牌解析失败:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('验证过程中出错:', error)
    return false
  }
}

export default async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  
  try {
    const path = req.url.split('?')[0]
    
    if (path === '/api/weather/location') {
      if (!validateRequest(req.headers)) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      
      const response = await fetch(`https://restapi.amap.com/v3/ip?key=${process.env.AMAP_KEY}`)
      const data = await response.json()
      return res.status(200).json(data)
    }
    
    if (path === '/api/weather/info') {
      if (!validateRequest(req.headers)) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      
      const { city } = req.query
      if (!city) {
        return res.status(400).json({ error: 'City parameter is required' })
      }
      
      const response = await fetch(
        `https://restapi.amap.com/v3/weather/weatherInfo?key=${process.env.AMAP_KEY}&city=${city}`
      )
      const data = await response.json()
      return res.status(200).json(data)
    }
    
    return res.status(404).json({ error: 'Not Found' })
  } catch (error) {
    console.error('API error:', error)
    return res.status(500).json({ error: 'Internal Server Error' })
  }
}
