/**
 * 地址处理工具函数
 */

/**
 * 处理地址字符串，确保符合后端验证规则
 * @param {string} address - 原始地址字符串
 * @param {number} maxLength - 最大长度限制，默认255
 * @returns {string} 处理后的地址字符串
 */
export function processAddress(address, maxLength = 255) {
  if (!address || typeof address !== 'string') {
    return ''
  }
  
  // 移除首尾空格
  let processedAddress = address.trim()
  
  // 移除不可见字符（控制字符）
  processedAddress = processedAddress.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
  
  // 移除多余的空白字符
  processedAddress = processedAddress.replace(/\s+/g, ' ')
  
  // 如果长度超过限制，进行截断
  if (processedAddress.length > maxLength) {
    console.warn(`地址长度超过${maxLength}字符，进行截断处理`)
    console.log('- 原始地址:', address)
    console.log('- 原始长度:', address.length)
    console.log('- 处理后地址:', processedAddress)
    console.log('- 处理后长度:', processedAddress.length)
    
    processedAddress = processedAddress.substring(0, maxLength)
    console.log('- 截断后地址:', processedAddress)
    console.log('- 截断后长度:', processedAddress.length)
  }
  
  return processedAddress
}

/**
 * 分析地址字符串的详细信息
 * @param {string} address - 地址字符串
 * @returns {object} 分析结果
 */
export function analyzeAddress(address) {
  if (!address || typeof address !== 'string') {
    return {
      length: 0,
      byteLength: 0,
      hasHiddenChars: false,
      charCodes: [],
      processed: ''
    }
  }
  
  const processed = processAddress(address)
  // 使用简单的字节长度计算，兼容小程序环境
  const byteLength = getByteLength(processed)
  const hasHiddenChars = /[\u0000-\u001F\u007F-\u009F]/.test(address)
  const charCodes = Array.from(processed).map(char => char.charCodeAt(0))
  
  return {
    original: address,
    originalLength: address.length,
    length: processed.length,
    byteLength,
    hasHiddenChars,
    charCodes,
    processed
  }
}

/**
 * 计算字符串的字节长度（兼容小程序环境）
 * @param {string} str - 字符串
 * @returns {number} 字节长度
 */
function getByteLength(str) {
  if (!str) return 0
  
  let length = 0
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i)
    // 根据Unicode码点计算字节长度
    if (code <= 0x7F) {
      length += 1  // ASCII字符
    } else if (code <= 0x7FF) {
      length += 2  // 2字节字符
    } else if (code <= 0xFFFF) {
      length += 3  // 3字节字符
    } else {
      length += 4  // 4字节字符（如emoji）
    }
  }
  return length
}

/**
 * 验证地址是否符合后端要求
 * @param {string} address - 地址字符串
 * @param {number} maxLength - 最大长度限制，默认255
 * @returns {object} 验证结果
 */
export function validateAddress(address, maxLength = 255) {
  const analysis = analyzeAddress(address)
  const isValid = analysis.length <= maxLength && !analysis.hasHiddenChars
  
  return {
    isValid,
    analysis,
    error: isValid ? null : `地址长度超过${maxLength}字符或包含无效字符`
  }
} 