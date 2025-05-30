import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import CryptoJS from 'crypto-js'

const app = express()
const PORT = 3001

// 中间件
app.use(cors())
app.use(bodyParser.json())

/**
 * 生成随机密钥
 * @param {number} length - 密钥长度(16/24/32)
 * @returns {string} 随机密钥
 */
function generateKey(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * 加密数据
 * @param {string} data - 要加密的数据 
 * @param {string} key - 加密密钥
 * @param {string} iv - 初始向量
 * @returns {string} 加密结果
 */
function encrypt(data, key, iv) {
  return CryptoJS.AES.encrypt(
    data,
    CryptoJS.enc.Utf8.parse(key),
    {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  ).toString()
}

/**
 * 解密数据
 * @param {string} data - 要解密的数据
 * @param {string} key - 解密密钥
 * @param {string} iv - 初始向量
 * @returns {string} 解密结果
 */
function decrypt(data, key, iv) {
  return CryptoJS.AES.decrypt(
    data,
    CryptoJS.enc.Utf8.parse(key),
    {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  ).toString(CryptoJS.enc.Utf8)
}

// 生成密钥对
app.get('/generate-key', (req, res) => {
  const key = generateKey(32)
  const iv = generateKey(16)
  res.json({ key, iv })
})

// 加密API密钥
app.post('/encrypt', (req, res) => {
  const { apiKey, key, iv } = req.body
  if (!apiKey || !key || !iv) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }
  try {
    const encrypted = encrypt(apiKey, key, iv)
    res.json({ encrypted })
  } catch (error) {
    res.status(500).json({ error: 'Encryption failed' })
  }
})

// 解密API密钥(仅用于测试)
app.post('/decrypt', (req, res) => {
  const { encrypted, key, iv } = req.body
  if (!encrypted || !key || !iv) {
    return res.status(400).json({ error: 'Missing required parameters' })
  }
  try {
    const decrypted = decrypt(encrypted, key, iv)
    res.json({ decrypted }) 
  } catch (error) {
    res.status(500).json({ error: 'Decryption failed' })
  }
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`Encryption server running on http://localhost:${PORT}`)
  console.log('Available endpoints:')
  console.log(`- GET  /generate-key - 生成随机密钥和IV`)
  console.log(`- POST /encrypt - 加密API密钥`)
  console.log(`- POST /decrypt - 解密API密钥(测试用)`)
})
