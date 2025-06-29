<template>
  <scroll-view class="tab-scroll-view" scroll-y="true">
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
              <text class="toggle-text">{{ isOnline ? '下线' : '上线' }}</text>
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
                <text class="btn-text">刷新位置</text>
              </view>
              <view class="action-btn select-btn" @click="selectLocation">
                <image class="btn-icon" src="@/static/icons/partner/shoudong.png" mode="aspectFit" />
                <text class="btn-text">手动选择</text>
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
  </scroll-view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCurrentLocationAddress } from '@/utils/location.js'

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
const locationCache = ref({
  latitude: null,
  longitude: null,
  address: ''
})

// 切换上线/下线状态
const toggleStatus = () => {
  if (!isOnline.value) {
    // 上线操作
    uni.showModal({
      title: '确认上线',
      content: '上线后将开始接收订单，确认上线吗？',
      success: (res) => {
        if (res.confirm) {
          isOnline.value = true
          refreshLocation()
          uni.showToast({
            title: '已上线，开始接单',
            icon: 'success'
          })
        }
      }
    })
  } else {
    // 下线操作
    uni.showModal({
      title: '确认下线',
      content: '下线后将停止接收订单，确认下线吗？',
      success: (res) => {
        if (res.confirm) {
          isOnline.value = false
          uni.showToast({
            title: '已下线，暂停接单',
            icon: 'success'
          })
        }
      }
    })
  }
}

// 刷新位置
const refreshLocation = () => {
  uni.showLoading({
    title: '获取位置中...'
  })
  
  getCurrentLocationAddress()
    .then(locationInfo => {
      // 更新位置缓存
      locationCache.value.latitude = locationInfo.latitude
      locationCache.value.longitude = locationInfo.longitude
      locationCache.value.address = locationInfo.address
      
      // 更新显示
      currentLocation.value = locationInfo.address
      locationUpdateTime.value = new Date().toLocaleTimeString()
      console.log('位置更新成功', locationInfo)
      uni.hideLoading()
      uni.showToast({
        title: '位置更新成功',
        icon: 'success'
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
        icon: 'error'
      })
      console.error('获取位置失败:', err)
    })
}

// 更新位置信息到服务器
const updateLocationToServer = (latitude, longitude, address) => {
  // 调用后端API更新位置信息
  const requestData = {
    is_online: isOnline.value ? 1 : 0,
    latitude: latitude,
    longitude: longitude,
    location_text: address
  }
  
  // 这里需要导入API方法
  // updateCompanionOnlineStatus(requestData)
  //   .then(res => {
  //     if (res.code === 0) {
  //       console.log('位置更新成功:', res)
  //     } else {
  //       console.error('位置更新失败:', res.msg)
  //     }
  //   })
  //   .catch(err => {
  //     console.error('位置更新API调用失败:', err)
  //   })
}

// 手动选择位置
const selectLocation = () => {
  // #ifdef MP-WEIXIN
  uni.chooseLocation({
    success: (res) => {
      const address = res.address || res.name || '已选择位置'
      
      // 更新位置缓存
      locationCache.value.latitude = res.latitude
      locationCache.value.longitude = res.longitude
      locationCache.value.address = address
      
      // 更新显示
      currentLocation.value = address
      locationUpdateTime.value = new Date().toLocaleTimeString()
      
      // 如果用户已上线，更新位置信息到服务器
      if (isOnline.value) {
        updateLocationToServer(res.latitude, res.longitude, address)
      }
    },
    fail: (err) => {
      if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
        uni.showToast({
          title: '获取位置失败',
          icon: 'error'
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

// 页面加载时获取位置
onMounted(() => {
  refreshLocation()
})
</script>

<style lang="scss" scoped>
.tab-scroll-view {
  height: 100%;
  background: #F7F8FA;
}

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
  
  &.online {
    background: linear-gradient(135deg, rgba(115, 99, 255, 0.05) 0%, rgba(255, 105, 222, 0.05) 100%);
    border-color: #7363FF;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4rpx;
      background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
    }
  }
  
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
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
  white-space: nowrap;
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
  border-radius: 50rpx;
  padding: 20rpx 32rpx;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120rpx;
  position: relative;
  overflow: hidden;
  
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
  border-left: 12rpx solid #FFFFFF;
  border-top: 8rpx solid transparent;
  border-bottom: 8rpx solid transparent;
  margin-left: 2rpx;
  transition: all 0.3s ease;
}

.icon-pause {
  display: flex;
  gap: 4rpx;
  align-items: center;
  justify-content: center;
}

.icon-pause::before,
.icon-pause::after {
  content: '';
  width: 4rpx;
  height: 16rpx;
  background: #FFFFFF;
  border-radius: 2rpx;
  transition: all 0.3s ease;
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
  margin-right: 12rpx;
  display: inline-block;
  vertical-align: middle;
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

.btn-text {
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