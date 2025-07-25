import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getCityList } from '@/api/home.js'

export const useCityStore = defineStore('city', () => {
  // 城市列表数据
  const cityList = ref([])
  const cityIndex = ref(0)
  const userLocation = ref(null)
  
  // 计算当前选中的城市
  const currentCity = computed(() => {
    if (cityList.value.length > 0) {
      return cityList.value[cityIndex.value]?.name || '选择区域'
    }
    return '选择区域'
  })
  
  // 计算当前选中城市的代码
  const currentCityCode = computed(() => {
    if (cityList.value.length > 0) {
      return cityList.value[cityIndex.value]?.code || null
    }
    return null
  })
  
  // 计算两点之间的距离（使用Haversine公式）
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }
  
  // 获取用户当前位置
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      uni.getLocation({
        type: 'gcj02',
        success: (res) => {
          console.log('获取位置成功:', res)
          userLocation.value = {
            latitude: res.latitude,
            longitude: res.longitude
          }
          resolve(res)
        },
        fail: (err) => {
          console.log('获取位置失败:', err)
          resolve(null)
        }
      })
    })
  }
  
  // 根据位置选择最近的城市
  const selectNearestCity = () => {
    if (!userLocation.value || cityList.value.length === 0) {
      // 如果没有位置信息或城市列表为空，选择第一个城市
      cityIndex.value = 0
      return
    }
    
    let nearestIndex = 0
    let minDistance = Infinity
    
    cityList.value.forEach((city, index) => {
      if (city.latitude && city.longitude) {
        const distance = calculateDistance(
          userLocation.value.latitude,
          userLocation.value.longitude,
          city.latitude,
          city.longitude
        )
        
        if (distance < minDistance) {
          minDistance = distance
          nearestIndex = index
        }
      }
    })
    
    cityIndex.value = nearestIndex
    console.log(`选择最近的城市: ${cityList.value[nearestIndex].name}, 距离: ${minDistance.toFixed(2)}km`)
  }
  
  // 加载城市列表
  const loadCityList = async () => {
    try {
      const response = await getCityList()
      
      if (response.data && response.data.code === 0 && response.data.data) {
        // 转换API数据格式为组件需要的格式
        cityList.value = response.data.data.map(city => ({
          name: city.name,
          code: city.city_code,
          latitude: parseFloat(city.lat) || null,
          longitude: parseFloat(city.lng) || null
        }))
        
        console.log('原始城市数据:', response.data.data)
        console.log('处理后的城市数据:', cityList.value)
        
        // 如果有城市数据，根据位置选择最近的城市
        if (cityList.value.length > 0) {
          selectNearestCity()
        }
        
        console.log('城市列表加载成功:', cityList.value)
      } else {
        console.warn('获取城市列表失败，使用默认城市列表')
        cityList.value = []
      }
    } catch (error) {
      console.error('获取城市列表失败:', error)
      cityList.value = []
    }
  }
  
  // 手动选择城市
  const selectCity = async (index) => {
    if (index >= 0 && index < cityList.value.length) {
      cityIndex.value = index
      console.log(`手动选择城市: ${cityList.value[index].name}`)
    }
  }
  
  // 根据城市名称选择城市
  const selectCityByName = (cityName) => {
    const index = cityList.value.findIndex(city => city.name === cityName)
    if (index !== -1) {
      cityIndex.value = index
      console.log(`根据名称选择城市: ${cityName}`)
    }
  }
  
  // 初始化城市数据
  const initCityData = async () => {
    // 获取用户位置
    await getUserLocation()
    
    // 加载城市列表
    await loadCityList()
  }
  
  return {
    // 状态
    cityList,
    cityIndex,
    userLocation,
    
    // 计算属性
    currentCity,
    currentCityCode,
    
    // 方法
    calculateDistance,
    getUserLocation,
    selectNearestCity,
    loadCityList,
    selectCity,
    selectCityByName,
    initCityData
  }
}, {
  persist: {
    key: 'city-store',
    storage: {
      getItem(key) {
        return uni.getStorageSync(key)
      },
      setItem(key, value) {
        uni.setStorageSync(key, value)
      }
    }
  }
}) 