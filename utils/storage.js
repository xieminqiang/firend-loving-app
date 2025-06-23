/**
 * 本地存储封装
 */

// 存储数据
export const setStorage = (key, data) => {
  try {
    uni.setStorageSync(key, data)
    return true
  } catch (error) {
    console.error('存储数据失败:', error)
    return false
  }
}

// 获取数据
export const getStorage = (key, defaultValue = null) => {
  try {
    const data = uni.getStorageSync(key)
    return data || defaultValue
  } catch (error) {
    console.error('获取数据失败:', error)
    return defaultValue
  }
}

// 删除数据
export const removeStorage = (key) => {
  try {
    uni.removeStorageSync(key)
    return true
  } catch (error) {
    console.error('删除数据失败:', error)
    return false
  }
}

// 清空所有数据
export const clearStorage = () => {
  try {
    uni.clearStorageSync()
    return true
  } catch (error) {
    console.error('清空数据失败:', error)
    return false
  }
}

// 获取存储信息
export const getStorageInfo = () => {
  try {
    return uni.getStorageInfoSync()
  } catch (error) {
    console.error('获取存储信息失败:', error)
    return null
  }
} 