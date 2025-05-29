import fetch from 'node-fetch'

// 简单的API密钥验证
const validateApiKey = (headers) => {
  const apiKey = headers['x-api-key']
  return apiKey === process.env.INTERNAL_API_KEY
}

export default async (req, res) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET')
  
  try {
    const path = req.url.split('?')[0]
    
    if (path === '/api/weather/location') {
      if (!validateApiKey(req.headers)) {
        return res.status(401).json({ error: 'Unauthorized' })
      }
      
      const response = await fetch(`https://restapi.amap.com/v3/ip?key=${process.env.AMAP_KEY}`)
      const data = await response.json()
      return res.status(200).json(data)
    }
    
    if (path === '/api/weather/info') {
      if (!validateApiKey(req.headers)) {
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
