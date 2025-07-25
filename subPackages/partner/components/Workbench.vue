<template>
    <view class="workbench-content">
    
      <!-- 上线/下线状态控制 -->
      <view class="status-control">
        <view class="status-card" :class="{ 'online': isOnline }">
          <!-- 左侧：状态信息和头像 -->
          <view class="status-left">
            <!-- 头像显示 -->
            <view class="avatar-container" v-if="applicationInfo && applicationInfo.photos && applicationInfo.photos.length > 0">
              <image :src="applicationInfo.photos[0]" class="avatar-img" mode="aspectFill" />
            </view>
            
            <view class="status-info">
              <view class="status-indicator">
                <view class="status-dot" :class="{ 'active': isOnline }"></view>
                <text class="status-text">{{ isOnline ? '已上线' : '已下线' }}</text>
              </view>
              <text class="status-desc">{{ isOnline ? '正在接单中' : '暂停接单' }}</text>
            </view>
          </view>
          
          <!-- 右侧：切换按钮 -->
          <view class="status-right">
            <view class="toggle-button" :class="{ 'online': isOnline }" @click="toggleStatus">
              <view class="toggle-icon">
                <view class="icon-container">
                  <view class="icon-play" v-if="!isOnline"></view>
                  <view class="icon-pause" v-if="isOnline"></view>
                </view>
              </view>
              <text class="toggle-text">{{ isOnline ? '下线休息' : '开始上线' }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 位置管理 -->
      <view class="location-management">
        <view class="location-card">
          <view class="location-content">
            <view class="flex-between">
              <view class="location-header">
              <image class="location-icon" src="@/static/icons/partner/dizhi.png" mode="aspectFit" />
              <text class="location-title">当前位置</text>
            </view>
            <view class="location-actions">
              <view class="action-btn refresh-btn" @click="refreshLocation">
                <image class="btn-icon" src="@/static/icons/partner/shuaxin.png" mode="aspectFit" />
                <text class="location-btn-text">刷新位置</text>
              </view>
              <view class="action-btn select-btn" @click="selectLocation">
                <image class="btn-icon" src="@/static/icons/partner/shoudong.png" mode="aspectFit" />
                <text class="location-btn-text">手动选择</text>
              </view>
            </view>
              </view>
           
            <view class="location-info">
              <text class="location-address">{{ currentLocation || '正在获取位置...' }}</text>
              <text class="location-time">{{ locationUpdateTime }}</text>
            </view>
           
          </view>
        </view>
      </view>
      
      <!-- 最近订单 -->
      <view class="recent-orders">
        <view class="section-header">
          <text class="section-title">最近订单</text>
          <text class="view-all" @click="viewAllOrders">查看全部</text>
        </view>
        <view class="empty-orders">
          <view class="empty-icon">📦</view>
          <text class="empty-text">暂无订单</text>
          <text class="empty-desc">开始接单，获得收入</text>
        </view>
      </view>
    </view>
  
  <!-- 视频上传弹框 -->
  <VideoUploadModal 
    :show="showVideoUploadModal" 
    :applicationInfo="applicationInfo"
    @close="hideVideoUploadModal"
    @success="handleVideoUploadSuccess"
  />
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { getCurrentLocationAddress, getCacheStatus } from '@/utils/location.js'
import { updateCompanionOnlineStatus } from '@/api/user.js'
import { processAddress, analyzeAddress } from '@/utils/address.js'
import VideoUploadModal from './VideoUploadModal.vue'

// 定义props
const props = defineProps({
  applicationInfo: {
    type: Object,
    default: null
  }
})

// 状态管理
const isOnline = ref(false)
const currentLocation = ref('')
const locationUpdateTime = ref('')
const isInitialized = ref(false)
const isUpdatingStatus = ref(false) // 防止重复点击

// 视频上传相关状态
const showVideoUploadModal = ref(false)

// 计算属性：检查applicationInfo是否有效
const hasValidApplicationInfo = computed(() => {
  return props.applicationInfo && typeof props.applicationInfo === 'object'
})

// 从applicationInfo中获取默认的在线状态
const initOnlineStatus = () => {
  if (hasValidApplicationInfo.value && typeof props.applicationInfo.is_online !== 'undefined') {
    isOnline.value = props.applicationInfo.is_online === 1
    console.log('从applicationInfo获取在线状态:', isOnline.value, '原始值:', props.applicationInfo.is_online)
  } else {
    isOnline.value = false
    console.log('使用默认在线状态: 下线')
  }
}

// 初始化组件
const initializeComponent = async () => {
  if (isInitialized.value) {
    console.log('组件已经初始化过，跳过重复初始化')
    return
  }
  
  console.log('开始初始化Workbench组件')
  
  // 等待下一个tick确保DOM更新
  await nextTick()
  
  // 初始化在线状态
  initOnlineStatus()
  
  // 获取位置信息（不强制刷新）
  getLocationInfo()
  
  isInitialized.value = true
  console.log('Workbench组件初始化完成')
}

// 监听applicationInfo变化
watch(() => props.applicationInfo, (newVal, oldVal) => {
  console.log('applicationInfo发生变化:', { old: oldVal, new: newVal })
  
  if (newVal && hasValidApplicationInfo.value) {
    // 如果组件已经初始化过，只更新在线状态
    if (isInitialized.value) {
      console.log('组件已初始化，只更新在线状态')
      initOnlineStatus()
    } else {
      // 首次初始化
      initializeComponent()
    }
  }
}, { immediate: true, deep: true })

// 切换上线/下线状态
const toggleStatus = async () => {
  if (isUpdatingStatus.value) {
    console.log('正在更新状态，忽略重复点击')
    return
  }
  
  const newStatus = !isOnline.value
  const statusText = newStatus ? '上线' : '下线'
  
  // 检查是否需要上传视频
  if (newStatus && hasValidApplicationInfo.value && props.applicationInfo.can_accept_orders === 'N') {
    // 检查是否已有视频且已通过审核
    if (!props.applicationInfo.intro_video_url || props.applicationInfo.video_review_status !== 'approved') {
      // 显示视频上传弹框
      showVideoUploadModal.value = true
      // 如果有现有视频，显示在预览区域
      if (props.applicationInfo.intro_video_url) {
        videoUrl.value = props.applicationInfo.intro_video_url
      }
      return
    }
  }
  
  uni.showModal({
    title: `确认${statusText}`,
    content: newStatus ? '上线后将开始接收订单，确认上线吗？' : '下线后将停止接收订单，确认下线吗？',
    success: async (res) => {
      if (res.confirm) {
        await updateOnlineStatus(newStatus)
      }
    }
  })
}

// 更新在线状态到服务器
const updateOnlineStatus = async (newStatus) => {
  isUpdatingStatus.value = true
  
  try {
    // 获取当前位置信息
    let locationInfo = null
    
    if (newStatus) {
      // 上线时需要获取位置信息
      uni.showLoading({ title: '获取位置中...' })
      
      try {
        locationInfo = await getCurrentLocationAddress(false) // 强制刷新位置
        console.log('获取位置成功:', locationInfo)
      } catch (error) {
        console.error('获取位置失败:', error)
        uni.hideLoading()
        uni.showToast({
          title: '获取位置失败，无法上线',
          icon: 'none'
        })
        return
      }
    } else {
      // 下线时可以使用缓存的位置信息
      const cacheStatus = getCacheStatus()
      if (cacheStatus.hasCache) {
        locationInfo = {
          latitude: cacheStatus.coordinates.latitude,
          longitude: cacheStatus.coordinates.longitude,
          address: cacheStatus.address
        }
      }
    }
    
    // 处理地址字符串
    const processedAddress = processAddress(locationInfo ? locationInfo.address : '')
    
    // 准备请求数据
    const requestData = {
      is_online: newStatus ? 1 : 0,
      latitude: locationInfo ? locationInfo.latitude : null,
      longitude: locationInfo ? locationInfo.longitude : null,
      location_text: processedAddress
    }
    
    // 添加详细的调试信息
    console.log('准备更新在线状态:', requestData)
  
    
    // 调用API更新状态
    const response = await updateCompanionOnlineStatus(requestData)
     console.log('在线', response )
    if (response.data && response.data.code === 0) {
      // 更新成功
      isOnline.value = newStatus
      
      // 更新位置显示
      if (locationInfo) {
        currentLocation.value = locationInfo.address
        locationUpdateTime.value = new Date().toLocaleTimeString()
      }
      
      uni.hideLoading()
      uni.showToast({
        title: newStatus ? '已上线，开始接单' : '已下线，暂停接单',
       icon: 'none'
      })
      
      console.log('在线状态更新成功:', response.data)
    } else {
      // 更新失败
      uni.hideLoading()
      uni.showToast({
        title: response.data?.msg || '状态更新失败',
       icon: 'none'
      })
      console.error('在线状态更新失败:', response.data)
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '网络错误，请重试',
       icon: 'none'
    })
    console.error('更新在线状态失败:', error)
  } finally {
    isUpdatingStatus.value = false
  }
}

// 获取位置信息（不强制刷新）
const getLocationInfo = () => {
  const cacheStatus = getCacheStatus()
  
  // 如果有有效缓存，直接使用
  if (cacheStatus.hasCache && cacheStatus.isValid) {
    currentLocation.value = cacheStatus.address
    locationUpdateTime.value = new Date(cacheStatus.timestamp).toLocaleTimeString()
    console.log('使用缓存位置信息:', cacheStatus.address)
    console.log('使用缓存:', cacheStatus)
    if (isOnline.value) {
      updateLocationToServer(cacheStatus.coordinates.latitude, cacheStatus.coordinates.longitude, cacheStatus.address)
    }
    return
  }
  
  // 没有有效缓存时，获取位置
  getCurrentLocationAddress(false)
    .then(locationInfo => {
      currentLocation.value = locationInfo.address
      locationUpdateTime.value = new Date().toLocaleTimeString()
      console.log('获取位置成功', locationInfo)
      
      // 如果用户已上线，更新位置信息到服务器
      if (isOnline.value) {
        updateLocationToServer(locationInfo.latitude, locationInfo.longitude, locationInfo.address)
      }
    })
    .catch(err => {
      console.error('获取位置失败:', err)
      // 如果获取失败，显示默认信息
      currentLocation.value = '位置获取失败'
      locationUpdateTime.value = '获取失败'
    })
}

// 刷新位置
const refreshLocation = () => {
  uni.showLoading({
    title: '更新位置中'
  })
  
  getCurrentLocationAddress(false) // 不强制刷新
    .then(locationInfo => {
      // 更新显示
      currentLocation.value = locationInfo.address
      locationUpdateTime.value = new Date().toLocaleTimeString()
      console.log('位置更新成功', locationInfo)
      uni.hideLoading()
      uni.showToast({
        title: '位置更新成功',
        icon: 'none'
      })
      
      // 如果用户已上线，更新位置信息到服务器
      if (isOnline.value) {
        updateLocationToServer(locationInfo.latitude, locationInfo.longitude, locationInfo.address)
      }
    })
    .catch(err => {
      uni.hideLoading()
      uni.showToast({
        title: '获取位置失败',
        icon: 'none'
      })
      console.error('获取位置失败:', err)
    })
}

// 更新位置信息到服务器
const updateLocationToServer = async (latitude, longitude, address) => {
  if (!isOnline.value) {
    console.log('用户未上线，不更新位置信息')
    return
  }
  
  try {
    // 处理地址字符串
    const processedAddress = processAddress(address)
    
    const requestData = {
      is_online: isOnline.value ? 1 : 0,
      latitude: latitude,
      longitude: longitude,
      location_text: processedAddress
    }
    
    console.log('准备更新位置信息到服务器:', requestData)
    console.log('位置描述分析:', analyzeAddress(address))
    
    const response = await updateCompanionOnlineStatus(requestData)
    
    if (response.data && response.data.code === 0) {
      console.log('位置信息更新成功:', response.data)
    } else {
      console.error('位置信息更新失败:', response.data?.msg)
    }
  } catch (error) {
    console.error('位置信息更新API调用失败:', error)
  }
}

// 手动选择位置
const selectLocation = () => {
  // #ifdef MP-WEIXIN
  uni.chooseLocation({
    success: async (res) => {
      const address = res.address || res.name || '已选择位置'
      console.log('手动选择位置', res)
      
      // 更新显示
      currentLocation.value = address
      locationUpdateTime.value = new Date().toLocaleTimeString()
      
      // 如果用户已上线，更新位置信息到服务器
      if (isOnline.value) {
        await updateLocationToServer(res.latitude, res.longitude, address)
      }
    },
    fail: (err) => {
      if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
        uni.showToast({
          title: '获取位置失败',
          icon: 'none'
        })
        console.error('获取位置失败:', err.errMsg)
      }
    }
  })
  // #endif
  // #ifndef MP-WEIXIN
  uni.showToast({
    title: '请在微信小程序中使用地图选点',
    icon: 'none'
  })
  // #endif
}

// 查看全部订单
const viewAllOrders = () => {
  uni.showToast({
    title: '订单列表功能开发中',
    icon: 'none'
  })
}

// 视频上传相关方法
const hideVideoUploadModal = () => {
  showVideoUploadModal.value = false
}

// 处理视频上传成功
const handleVideoUploadSuccess = (data) => {
  console.log('视频上传成功:', data)
  // 发送事件通知父组件刷新数据
  uni.$emit('applicationStatusChanged', data)
}



// 页面加载时的处理
onMounted(() => {
  console.log('Workbench组件mounted，applicationInfo状态:', {
    hasApplicationInfo: !!props.applicationInfo,
    applicationInfo: props.applicationInfo
  })
  
  // 如果applicationInfo已经存在，立即初始化
  if (hasValidApplicationInfo.value) {
    initializeComponent()
  } else {
    console.log('applicationInfo还未准备好，等待watch触发初始化')
  }
})
</script>

<style lang="scss" scoped>
.workbench-content {
  padding: 32rpx;
}

.workbench-header {
  margin-bottom: 32rpx;
}

.workbench-title {
  font-size: 46rpx;
  font-weight: 700;
  color: #1A1A1A;
  display: block;
 
}

.workbench-subtitle {
  font-size: 28rpx;
  color: #1A1A1A;
  display: block;
}

// 状态控制样式
.status-control {
  margin-bottom: 32rpx;
}

.status-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #f0f0f0;
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  

  
  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  }
}

.status-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0; // 防止flex子元素溢出
}

.status-info {
  margin-left: 20rpx;
  flex: 1;
  min-width: 0; // 防止文本溢出
}

.status-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #CCCCCC;
  margin-right: 12rpx;
  transition: all 0.3s ease;
  position: relative;
  
  &.active {
    background: #4CAF50;
    box-shadow: 0 0 8rpx rgba(76, 175, 80, 0.4);
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 8rpx;
      height: 8rpx;
      background: #FFFFFF;
      border-radius: 50%;
    }
  }
}

.status-text {
  font-size: 28rpx;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.3s ease;
  
  // 下线状态
  &:not(.online) {
    color: #666666;
  }
  
  // 上线状态
  .online & {
    color: #4CAF50;
  }
}

.status-desc {
  font-size: 24rpx;
  color: #666666;
  display: block;
  white-space: nowrap;
}

// 头像样式
.avatar-container {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 3rpx solid #7363FF;
  box-shadow: 0 4rpx 12rpx rgba(115, 99, 255, 0.3);
  flex-shrink: 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.3);
  }
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-right {
  display: flex;
  align-items: center;
  margin-left: 20rpx;
  flex-shrink: 0;
}

.toggle-button {
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 50000rpx;
  padding: 16rpx 28rpx;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  position: relative;
  overflow: hidden;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &.online {
    background: linear-gradient(135deg, #F44336 0%, #FF5722 100%);
    border: none;
    
    &::before {
      left: 100%;
    }
    
    .toggle-icon {
      transform: scale(1.1);
    }
    
    .icon-play {
      transform: scale(0.8);
    }
    
    .icon-pause::before,
    .icon-pause::after {
      transform: scale(1.2);
    }
  }
  
  &:active {
    transform: scale(0.96);
    
    &::before {
      left: 100%;
    }
    
    .toggle-icon {
      transform: scale(0.9);
    }
  }
}

.toggle-icon {
  margin-right: 8rpx;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-container {
  width: 32rpx;
  height: 32rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-play {
  width: 0;
  height: 0;
  border-left: 14rpx solid #FFFFFF;
  border-top: 10rpx solid transparent;
  border-bottom: 10rpx solid transparent;
  margin-left: 3rpx;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.2));
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: -10rpx;
    left: -14rpx;
    width: 0;
    height: 0;
    border-left: 14rpx solid rgba(255, 255, 255, 0.3);
    border-top: 10rpx solid transparent;
    border-bottom: 10rpx solid transparent;
    z-index: -1;
  }
}

.icon-pause {
  display: flex;
  gap: 6rpx;
  align-items: center;
  justify-content: center;
  position: relative;
}

.icon-pause::before,
.icon-pause::after {
  content: '';
  width: 5rpx;
  height: 18rpx;
  background: #FFFFFF;
  border-radius: 3rpx;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3rpx;
    z-index: -1;
  }
}

.toggle-text {
  color: #FFFFFF;
  font-size: 26rpx;
  font-weight: 600;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

// 位置管理样式
.location-management {
  margin-bottom: 32rpx;
}

.location-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #f0f0f0;
}

.location-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.location-header {
  display: flex;
  align-items: center;
}

.location-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 6rpx;

}

.location-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.location-info {
  margin-top: 20rpx;
}

.location-address {
  font-size: 26rpx;
  color: #1A1A1A;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.location-time {
  font-size: 22rpx;
  color: #999999;
  display: block;
}

.location-actions {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  margin-top: 8rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 20rpx;
  border-radius: 10rpx;
  border: 1rpx solid #E5E5E5;
  background: #F7F8FA;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:active {
    transform: scale(0.96);
    background: #F0F0F0;
  }
}

.refresh-btn {
  border-color: #5AC8FA;
  background: rgba(90, 200, 250, 0.1);
}

.select-btn {
  border-color: #FF9500;
  background: rgba(255, 149, 0, 0.1);
}

.btn-icon {
  width: 28rpx;
  height: 28rpx;
  margin-right: 8rpx;
  display: inline-block;
  vertical-align: middle;
}

.location-btn-text {
  font-size: 24rpx;
  color: #1A1A1A;
  font-weight: 500;
}

.recent-orders {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #f0f0f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.view-all {
  font-size: 24rpx;
  color: #7363FF;
  font-weight: 500;
}

.empty-orders {
  text-align: center;
  padding: 60rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
  display: block;
  opacity: 0.6;
}

.empty-text {
  font-size: 28rpx;
  color: #1A1A1A;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #666666;
  display: block;
}


</style> 