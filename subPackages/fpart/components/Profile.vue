<template>
    <view class="profile-content">
      <!-- 个人信息 -->
      <view class="profile-header" @click="goToDataEdit">
        <view class="avatar-container">
          <image 
            v-if="applicationInfo && applicationInfo.avatar"
            :src="$imgBaseUrl + applicationInfo.avatar" 
            class="avatar-img" 
            mode="aspectFill" 
          />
          <view v-else class="avatar-placeholder"></view>
        </view>
        <view class="profile-info">
          <text class="profile-name">{{ applicationInfo?.nickname || '友伴用户' }}</text>
          
          <!-- 等级信息 -->
          <view class="level-info" v-if="currentLevel" @click="goToLevelPage">
            <image :src="currentLevel.icon_url" class="level-icon" mode="aspectFit" />
            <text class="level-name">{{ currentLevel.level_name }}陪伴师</text>
            <text class="commission-rate">分成比例 {{ (currentLevel.commission_rate * 100).toFixed(0) }}%</text>
          </view>
          
          <!-- 成长值信息 -->
          <view class="growth-info" v-if="applicationInfo?.growth_value !== undefined">
            <text class="growth-text">成长值：{{ applicationInfo.growth_value || 0 }}</text>
          </view>
          
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
      <!-- 功能列表 -->
              <view class="function-list">
                  <view class="function-item" @click="handleFunctionClick('balance')">
          <image src="@/static/icons/profile/zhanghuyue.png" class="function-icon-img" mode="aspectFit" />
          <text class="function-text">我的余额</text>
          <text class="balance-display">¥{{ formatBalance(applicationInfo?.available_balance || 0) }}</text>
          <image src="@/static/icons/common/arrow-right.png" class="setting-arrow" mode="aspectFit" />
        </view>
        <view class="function-item" @click="handleFunctionClick('orders')">
          <image src="@/static/icons/profile/dingdan.png" class="function-icon-img" mode="aspectFit" />
          <text class="function-text">我的订单</text>
          <image src="@/static/icons/common/arrow-right.png" class="setting-arrow" mode="aspectFit" />
        </view>
        <view class="function-item" @click="handleFunctionClick('publish')">
          <image src="@/static/icons/partner/me_dt.png" class="function-icon-img" mode="aspectFit" />
          <text class="function-text">我的发布</text>
          <image src="@/static/icons/common/arrow-right.png" class="setting-arrow" mode="aspectFit" />
        </view>
        <view class="function-item" @click="handleFunctionClick('level')">
          <image src="@/static/icons/profile/dengji.png" class="function-icon-img" mode="aspectFit" />
          <text class="function-text">友伴等级说明</text>
          <image src="@/static/icons/common/arrow-right.png" class="setting-arrow" mode="aspectFit" />
        </view>
      </view>
    </view>
    
    <!-- 发动态入口 -->
      <view class="release-content" @click="toRelease" v-if="applicationInfo && applicationInfo.can_accept_orders == 'Y'">
        <image src="@/static/icons/partner/add_dt.png" class="release-icon" mode="aspectFit" />
        <text class="release-text">分享你的动态</text>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import VideoUploadModal from './VideoUploadModal.vue'
import { useLevelStore } from '@/stores/level.js'


// 定义props
const props = defineProps({
  applicationInfo: {
    type: Object,
    default: null
  }
})

// 获取全局level store
const levelStore = useLevelStore()

// 视频上传弹框状态
const showVideoUploadModal = ref(false)



// 计算当前等级信息
const currentLevel = computed(() => {
  if (!props.applicationInfo?.level_order || !levelStore.sortedServiceLevels.length) {
    return null
  }
  return levelStore.sortedServiceLevels.find(level => level.level_order === props.applicationInfo.level_order)
})

// 获取接单状态样式类
const getOrderStatusClass = (canAcceptOrders) => {
  return canAcceptOrders === 'Y' ? 'status-success' : 'status-warning'
}

// 格式化余额显示（分转元，保持精度）
const formatBalance = (balanceInCents) => {
  if (!balanceInCents && balanceInCents !== 0) return '0.00'
  // 使用数学运算避免浮点数精度问题
  const yuan = Math.floor(balanceInCents / 100)
  const fen = balanceInCents % 100
  
  if (fen === 0) {
    return yuan + '.00'
  } else if (fen < 10) {
    return yuan + '.0' + fen
  } else {
    return yuan + '.' + fen
  }
}

// 跳转到资料编辑页面
const goToDataEdit = () => {
  uni.navigateTo({
    url: '/subPackages/fpart/DataEdetion/index'
  })
}

// 跳转到等级说明页面
const goToLevelPage = () => {
  uni.navigateTo({
    url: '/subPackages/fpart/level/index'
  })
}







// 取消提现
const cancelWithdraw = () => {
  showWithdrawModal.value = false
  withdrawAmount.value = ''
}

// 处理功能点击
const handleFunctionClick = (functionName) => {
  switch (functionName) {
    case 'balance':
      uni.navigateTo({
        url: '/subPackages/balance/index'
      })
      break
    case 'orders':
      uni.navigateTo({
        url: `/subPackages/fpart/order/index?companion_id=${props.applicationInfo?.id || ''}`
      })
      break
    case 'publish':
      uni.navigateTo({
        url: `/subPackages/fpart/components/dyn?companion_id=${props.applicationInfo?.id || ''}`
      })
      break
    case 'level':
      uni.navigateTo({
        url: '/subPackages/fpart/level/index'
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

// 跳转到发动态页面
const toRelease = async () => {
  uni.navigateTo({
    url: '/subPackages/dt/index'
  })
}

// 生命周期
onMounted(async () => {
  // 确保服务等级列表已加载
  await levelStore.fetchServiceLevels()
  
  // 监听资料更新事件
  uni.$on('applicationStatusChanged', handleApplicationStatusChanged)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  uni.$off('applicationStatusChanged', handleApplicationStatusChanged)
})

// 处理申请状态变化事件
const handleApplicationStatusChanged = (data) => {
  console.log('收到申请状态变化事件:', data)
  
  // 发送事件通知父组件刷新数据
  uni.$emit('refreshApplicationInfo')
  
  // 显示成功提示
  if (data.status === 'updated') {
    uni.showToast({
      title: data.message || '资料更新成功',
      icon: 'success',
      duration: 2000
    })
  }
}
</script>

<style lang="scss" scoped>
.profile-content {
  padding: 20rpx;
}

.profile-header {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;

  display: flex;
  align-items: center;
}

.avatar-container {
  margin-right: 20rpx;
}

.avatar-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;

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
  margin-bottom: 12rpx;
}

.profile-id {
  font-size: 24rpx;
  color: #666666;
  display: block;
  margin-bottom: 12rpx;
}

.level-info {
  display: inline-flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
  padding: 8rpx 12rpx;
  background: linear-gradient(135deg, rgba(115, 99, 255, 0.08) 0%, rgba(255, 105, 222, 0.06) 100%);
  border-radius: 16rpx;
  border: 1rpx solid rgba(115, 99, 255, 0.12);
  margin-right: 20rpx;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
    background: linear-gradient(135deg, rgba(115, 99, 255, 0.12) 0%, rgba(255, 105, 222, 0.08) 100%);
  }
}

.level-icon {
  width: 32rpx;
  height: 32rpx;
}

.level-name {
  font-size: 24rpx;
  font-weight: 600;
  color: #7363FF;
}

.commission-rate {
  font-size: 20rpx;
  color: #FF69DE;
  font-weight: 500;
  margin-left: auto;
}

.growth-info {
  margin-bottom: 8rpx;
}

.growth-text {
  font-size: 22rpx;
  color: #666666;
  background: rgba(115, 99, 255, 0.05);
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
  border: 1rpx solid rgba(115, 99, 255, 0.1);
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



.function-list {
  background: #FFFFFF;
  border-radius: 20rpx;

}

.function-item {
  display: flex;
  align-items: center;
  padding: 28rpx;
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

.function-icon-img {
  width: 40rpx;
  height: 40rpx;
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

.balance-display {
  font-size: 28rpx;
  font-weight: 600;
  color: #07c160;
  margin-right: 10rpx;

}

.profile-arrow {
  width: 32rpx;
  height: 32rpx;
}



.release-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;
  margin-left: 20rpx;
  margin-right: 20rpx;

  background: #FFFFFF;
  border-radius: 20rpx;
  box-sizing: border-box;
}


.release-icon {
  width: 20px;
  height: 20px;
  margin-right: 12rpx;
}

.release-text {
  font-size: 28rpx;
  color: #7363FF;
  font-weight: 500;
}


</style> 