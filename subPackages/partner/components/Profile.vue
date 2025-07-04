<template>
    <view class="profile-content">
      <!-- 个人信息 -->
      <view class="profile-header" @click="goToDataEdit">
        <view class="avatar-container">
          <image 
            v-if="applicationInfo && applicationInfo.photos && applicationInfo.photos.length > 0"
            :src="applicationInfo.photos[0]" 
            class="avatar-img" 
            mode="aspectFill" 
          />
          <view v-else class="avatar-placeholder">👤</view>
        </view>
        <view class="profile-info">
          <text class="profile-name">{{ applicationInfo?.nickname || '友伴用户' }}</text>
          
          <view class="order-status" v-if="applicationInfo && applicationInfo.can_accept_orders == 'N'">
            <view class="order-status-content">
              <text class="order-status-text" :class="getOrderStatusClass(applicationInfo.can_accept_orders)">
                {{ applicationInfo.can_accept_orders_name || '--' }}
              </text>
              <view class="upload-video-btn" @click.stop="showVideoUpload">
                <text class="upload-btn-text">上传视频</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 右侧箭头 -->
        <image src="@/static/icons/common/arrow-right.png" class="profile-arrow" mode="aspectFit" />
      </view>
      
      <!-- 账户信息 -->
      <view class="account-info">
        <view class="balance-card">
          <text class="balance-label">账户余额</text>
          <text class="balance-amount">¥0.00</text>
          <view class="balance-actions">
            <text class="action-btn" @click="handleBalanceAction('withdraw')">提现</text>
            <text class="action-btn" @click="handleBalanceAction('detail')">明细</text>
          </view>
        </view>
      </view>
      
      <!-- 功能列表 -->
      <view class="function-list">
        <view class="function-item" @click="handleFunctionClick('service')">
          <view class="function-icon">📋</view>
          <text class="function-text">我的服务</text>
          <image src="@/static/icons/common/arrow-right.png" class="setting-arrow" mode="aspectFit" />
        </view>
        <view class="function-item" @click="handleFunctionClick('review')">
          <view class="function-icon">⭐</view>
          <text class="function-text">我的评价</text>
          <image src="@/static/icons/common/arrow-right.png" class="setting-arrow" mode="aspectFit" />
        </view>
        <view class="function-item" @click="handleFunctionClick('statistics')">
          <view class="function-icon">📊</view>
          <text class="function-text">数据统计</text>
          <image src="@/static/icons/common/arrow-right.png" class="setting-arrow" mode="aspectFit" />
        </view>
        <view class="function-item" @click="handleFunctionClick('settings')">
          <view class="function-icon">⚙️</view>
          <text class="function-text">设置</text>
          <image src="@/static/icons/common/arrow-right.png" class="setting-arrow" mode="aspectFit" />
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
import { ref } from 'vue'
import VideoUploadModal from './VideoUploadModal.vue'

// 定义props
const props = defineProps({
  applicationInfo: {
    type: Object,
    default: null
  }
})

// 视频上传弹框状态
const showVideoUploadModal = ref(false)



// 获取接单状态样式类
const getOrderStatusClass = (canAcceptOrders) => {
  return canAcceptOrders === 'Y' ? 'status-success' : 'status-warning'
}

// 跳转到资料编辑页面
const goToDataEdit = () => {
  uni.navigateTo({
    url: '/subPackages/partner/DataEdetion/index'
  })
}

// 处理余额操作
const handleBalanceAction = (action) => {
  switch (action) {
    case 'withdraw':
      uni.showToast({
        title: '提现功能开发中',
        icon: 'none'
      })
      break
    case 'detail':
      uni.showToast({
        title: '明细功能开发中',
        icon: 'none'
      })
      break
  }
}

// 处理功能点击
const handleFunctionClick = (functionName) => {
  switch (functionName) {
    case 'service':
      uni.showToast({
        title: '我的服务功能开发中',
        icon: 'none'
      })
      break
    case 'review':
      uni.showToast({
        title: '我的评价功能开发中',
        icon: 'none'
      })
      break
    case 'statistics':
      uni.showToast({
        title: '数据统计功能开发中',
        icon: 'none'
      })
      break
    case 'settings':
      uni.showToast({
        title: '设置功能开发中',
        icon: 'none'
      })
      break
  }
}

// 显示视频上传弹框
const showVideoUpload = () => {
  showVideoUploadModal.value = true
}

// 隐藏视频上传弹框
const hideVideoUploadModal = () => {
  showVideoUploadModal.value = false
}

// 处理视频上传成功
const handleVideoUploadSuccess = (data) => {
  console.log('视频上传成功:', data)
  // 发送事件通知父组件刷新数据
  uni.$emit('applicationStatusChanged', data)
}
</script>

<style lang="scss" scoped>
.profile-content {
  padding: 32rpx;
}

.profile-header {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #f0f0f0;
  display: flex;
  align-items: center;
}

.avatar-container {
  margin-right: 24rpx;
}

.avatar-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 2rpx solid #e9ecef;
}

.avatar-placeholder {
  width: 120rpx;
  height: 120rpx;
  background: #f8f9fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  border: 2rpx solid #e9ecef;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 34rpx;
  font-weight: 600;
  color: #1A1A1A;
  display: block;
 
}

.profile-id {
  font-size: 24rpx;
  color: #666666;
  display: block;
  margin-bottom: 12rpx;
}



.order-status {
  margin-top: 8rpx;
}

.order-status-content {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.order-status-text {
  font-size: 22rpx;
  font-weight: 500;
  padding: 8rpx 16rpx;
  border-radius: 4rpx;
  background: rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.order-status-text.status-success {
  color: #28a745;
  background: rgba(40, 167, 69, 0.1);
}

.order-status-text.status-warning {
  color: #ffc107;
  background: rgba(255, 193, 7, 0.1);
}

.upload-video-btn {
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 12rpx rgba(115, 99, 255, 0.3);
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 2rpx 8rpx rgba(115, 99, 255, 0.4);
  }
}

.upload-btn-text {
  font-size: 20rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.account-info {
  margin-bottom: 24rpx;
}

.balance-card {
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 20rpx;
  padding: 32rpx;
  color: white;
  text-align: center;
}

.balance-label {
  font-size: 28rpx;
  opacity: 0.9;
  display: block;
  margin-bottom: 16rpx;
}

.balance-amount {
  font-size: 48rpx;
  font-weight: 700;
  display: block;
  margin-bottom: 24rpx;
}

.balance-actions {
  display: flex;
  justify-content: center;
  gap: 32rpx;
}

.action-btn {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 24rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  font-weight: 500;
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s;
}

.action-btn:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.96);
}

.function-list {
  background: #FFFFFF;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #f0f0f0;
}

.function-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: all 0.2s;
}

.function-item:last-child {
  border-bottom: none;
}

.function-item:active {
  background: #f8f9fa;
}

.function-icon {
  font-size: 40rpx;
  margin-right: 24rpx;
}

.function-text {
  flex: 1;
  font-size: 28rpx;
  color: #1A1A1A;
  font-weight: 500;
}

.setting-arrow {
  width: 32rpx;
  height: 32rpx;
}

.profile-arrow {
  width: 32rpx;
  height: 32rpx;
}
</style> 