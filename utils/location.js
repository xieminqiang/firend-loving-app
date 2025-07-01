/**
 * 位置工具类
 * 提供跨平台的逆地理编码功能
 */

// 位置缓存
let locationCache = {
  latitude: null,
  longitude: null,
  address: '',
  timestamp: 0
}

// 缓存有效期（毫秒）- 30分钟
const CACHE_DURATION = 5 * 60 * 1000

// 位置变化阈值（米）- 如果位置变化小于此值，使用缓存地址
const LOCATION_THRESHOLD = 100

/**
 * 计算两点之间的距离（米）
 * @param {number} lat1 - 第一个点的纬度
 * @param {number} lng1 - 第一个点的经度
 * @param {number} lat2 - 第二个点的纬度
 * @param {number} lng2 - 第二个点的经度
 * @returns {number} 距离（米）
 */
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000 // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * 检查位置是否发生显著变化
 * @param {number} newLat - 新纬度
 * @param {number} newLng - 新经度
 * @returns {boolean} 是否发生显著变化
 */
const isLocationSignificantlyChanged = (newLat, newLng) => {
  if (!locationCache.latitude || !locationCache.longitude) {
    return true // 没有缓存，需要获取新地址
  }
  
  const distance = calculateDistance(
    locationCache.latitude, 
    locationCache.longitude, 
    newLat, 
    newLng
  )
  
  return distance > LOCATION_THRESHOLD
}

/**
 * 检查缓存是否有效
 * @returns {boolean} 缓存是否有效
 */
const isCacheValid = () => {
  if (!locationCache.timestamp) {
    return false
  }
  
  const now = Date.now()
  return (now - locationCache.timestamp) < CACHE_DURATION
}

/**
 * 根据经纬度获取详细地址
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @param {boolean} forceRefresh - 是否强制刷新，忽略缓存
 * @returns {Promise<string>} 详细地址
 */
export function getAddressFromLocation(latitude, longitude, forceRefresh = false) {
  return new Promise((resolve, reject) => {
    if (!latitude || !longitude) {
      reject(new Error('经纬度参数不能为空'))
      return
    }

    // 检查是否需要调用API
    const shouldCallAPI = forceRefresh || 
                         !isCacheValid() || 
                         isLocationSignificantlyChanged(latitude, longitude)

    if (!shouldCallAPI && locationCache.address) {
      console.log('使用缓存地址，位置变化不大:', locationCache.address)
      resolve(locationCache.address)
      return
    }

    console.log('调用腾讯地图API获取地址:', latitude, longitude)
    
    // 直接使用uni.request调用腾讯地图API
    uni.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1/',
      method: 'GET',
      data: {
        key: '4Z3BZ-4JXCJ-EFNFY-DIL4V-6KKKH-YHF6Z',
        location: `${latitude},${longitude}`,
        output: 'json'
      },
      success: (res) => {
        console.log('腾讯地图API响应:', res)
        if (res.statusCode === 200 && res.data && res.data.status === 0 && res.data.result && res.data.result.address) {
          // 更新缓存
          locationCache = {
            latitude: latitude,
            longitude: longitude,
            address: res.data.result.address,
            timestamp: Date.now()
          }
          resolve(res.data.result.address)
        } else {
          // 如果获取详细地址失败，返回经纬度信息
          const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          // 更新缓存
          locationCache = {
            latitude: latitude,
            longitude: longitude,
            address: fallbackAddress,
            timestamp: Date.now()
          }
          resolve(fallbackAddress)
        }
      },
      fail: (err) => {
        console.error('腾讯地图API调用失败:', err)
        // 返回经纬度信息作为备选
        const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        // 更新缓存
        locationCache = {
          latitude: latitude,
          longitude: longitude,
          address: fallbackAddress,
          timestamp: Date.now()
        }
        resolve(fallbackAddress)
      }
    })
  })
}

/**
 * 获取当前位置的详细地址
 * @param {boolean} forceRefresh - 是否强制刷新，忽略缓存
 * @returns {Promise<Object>} 包含经纬度和地址的对象
 */
export function getCurrentLocationAddress(forceRefresh = false) {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: 'gcj02',
      success: (res) => {
        console.log('获取位置成功:', res)
        const { latitude, longitude } = res
        
        // 检查是否需要调用地址API
        const shouldCallAPI = forceRefresh || 
                             !isCacheValid() || 
                             isLocationSignificantlyChanged(latitude, longitude)

        if (!shouldCallAPI && locationCache.address) {
          console.log('使用缓存地址，位置变化不大')
          resolve({
            latitude,
            longitude,
            address: locationCache.address
          })
          return
        }
        
        // 使用腾讯地图API获取详细地址
        getAddressFromLocation(latitude, longitude, forceRefresh)
          .then(address => {
            resolve({
              latitude,
              longitude,
              address
            })
          })
          .catch(err => {
            console.error('获取地址失败:', err)
            // 即使获取地址失败，也返回位置信息
            resolve({
              latitude,
              longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            })
          })
      },
      fail: (err) => {
        console.error('获取位置失败:', err)
        reject(new Error('获取位置失败: ' + (err.errMsg || err.message || '未知错误')))
      }
    })
  })
}

/**
 * 清除位置缓存
 */
export function clearLocationCache() {
  locationCache = {
    latitude: null,
    longitude: null,
    address: '',
    timestamp: 0
  }
  console.log('位置缓存已清除')
}

/**
 * 获取缓存状态信息
 * @returns {Object} 缓存状态
 */
export function getCacheStatus() {
  return {
    hasCache: !!locationCache.address,
    isValid: isCacheValid(),
    timestamp: locationCache.timestamp,
    address: locationCache.address,
    coordinates: {
      latitude: locationCache.latitude,
      longitude: locationCache.longitude
    }
  }
}

/**
 * 格式化距离显示
 * @param {number} distance - 距离（米）
 * @returns {string} 格式化后的距离
 */
export const formatDistance = (distance) => {
  if (distance < 1000) {
    return `${Math.round(distance)}米`
  } else {
    return `${(distance / 1000).toFixed(1)}公里`
  }
} 