import CryptoJS from 'crypto-js'

/**
 * 加密数据
 * @param {string} data - 要加密的数据
 * @param {string} key - 加密密钥
 * @param {string} iv - 初始向量
 * @returns {string} 加密后的字符串
 */
export function encrypt(data, key, iv) {
  const encrypted = CryptoJS.AES.encrypt(
    data,
    CryptoJS.enc.Utf8.parse(key),
    {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  )
  return encrypted.toString()
}

/**
 * 解密数据
 * @param {string} data - 要解密的数据
 * @param {string} key - 解密密钥
 * @param {string} iv - 初始向量
 * @returns {string} 解密后的字符串
 */
export function decrypt(data, key, iv) {
  const decrypted = CryptoJS.AES.decrypt(
    data,
    CryptoJS.enc.Utf8.parse(key),
    {
      iv: CryptoJS.enc.Utf8.parse(iv),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }
  )
  return decrypted.toString(CryptoJS.enc.Utf8)
}

/**
 * 生成随机密钥
 * @param {number} length - 密钥长度(16/24/32)
 * @returns {string} 随机密钥
 */
export function generateRandomKey(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
