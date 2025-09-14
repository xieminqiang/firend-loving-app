<template>
  <view class="profile-container">
    <!-- 可滚动内容区域 -->
    <scroll-view 
      class="scroll-container" 
      scroll-y="true"
      refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @refresherrestore="onRefreshRestore"
    >

      <!-- 顶部个人信息区 -->
      <view class="profile-header" :style="{ paddingTop: statusBarHeight + 'px' }" >
          <!-- 已登录状态 -->
          <view v-if="isLoggedIn" class="user-profile" @click="navigateToUserDetail">
            <view class="avatar-container">
              <view class="avatar-circle">
                <image v-if="userInfo.head_img" :src="$imgBaseUrl + userInfo.head_img" class="avatar-img" mode="aspectFill" />
                <text v-else class="avatar-placeholder">{{ userInfo.nickname || '' }}</text>
                <view class="avatar-border"></view>
              </view>
              <view class="online-indicator"></view>
            </view>
            <view class="user-details">
              <view class="name-row">
                <view class="user-name">{{ userInfo.nick_name|| '' }}</view>
            
              </view>
              <view class="user-phone">{{ formatPhone(userInfo.phone) || '未绑定手机号' }}</view>
              
            </view>
          </view>

          <!-- 未登录状态 -->
          <view v-else class="login-prompt">
            <view class="prompt-content">
              
              <!-- 文字内容 -->
              <view class="prompt-text">
                <!-- <view class="welcome-title">Hi~ 欢迎来到随伴行</view> -->
                <view class="welcome-subtitle">登录后解锁更多精彩功能</view>
              </view>
              
                            <!-- 功能亮点 -->
              <view class="quick-benefits">
                <view class="benefit-item">
                  <image src="@/static/icons/profile/heart.png" class="benefit-icon" mode="aspectFit" />
                  <text class="benefit-text">兴趣匹配</text>
                </view>
                <view class="benefit-item">
                  <image src="@/static/icons/profile/clock.png" class="benefit-icon" mode="aspectFit" />
                  <text class="benefit-text">快速预约</text>
                </view>
                <view class="benefit-item">
                  <image src="@/static/icons/profile/shield.png" class="benefit-icon" mode="aspectFit" />
                  <text class="benefit-text">安全保障</text>
                </view>
              </view>
              
              <!-- 登录按钮 -->
              <view class="login-btn" @click="navigateToLogin">
                <view class="btn-shine"></view>
                <text class="login-btn-text">立即登录</text>
      
              </view>
            </view>
          </view>
        </view>
      <!-- 页面内容 -->
      <view class="profile-content">
      
        <!-- 订单管理 -->
        <view class="section-container">
          <view class="section-header">
            <text class="section-title">订单管理</text>
            <view class="view-all" @click="navigateToOrders('all')">
              <text class="view-all-text">查看全部</text>
              <image src="@/static/icons/common/arrow-right.png" class="view-all-arrow" mode="aspectFit" />
            </view>
          </view>
          <view class="orders-grid">
            <view class="order-item" @click="navigateToOrders('pending_payment')">
              <view class="order-icon">
                <image src="@/static/icons/profile/dai_order.png" class="order-icon-img" mode="aspectFit" />
                <text v-if="orderCounts.pending > 0" class="order-badge">{{ orderCounts.pending }}</text>
              </view>
              <text class="order-text">待付款</text>
            </view>
            <view class="order-item" @click="navigateToOrders('pending_service')">
              <view class="order-icon">
                <image src="@/static/icons/profile/daifuwu.png" class="order-icon-img" mode="aspectFit" />
                <text v-if="orderCounts.pending_service > 0" class="order-badge">{{ orderCounts.pending_service }}</text>
              </view>
              <text class="order-text">待服务</text>
            </view>
            <view class="order-item" @click="navigateToOrders('in_service')">
              <view class="order-icon">
                <image src="@/static/icons/profile/fwzh.png" class="order-icon-img" mode="aspectFit" />
                <text v-if="orderCounts.inProgress > 0" class="order-badge">{{ orderCounts.inProgress }}</text>
              </view>
              <text class="order-text">进行中</text>
            </view>
            <view class="order-item" @click="navigateToOrders('completed')">
              <view class="order-icon">
                <image src="@/static/icons/profile/yiwancheng.png" class="order-icon-img" mode="aspectFit" />
              </view>
              <text class="order-text">已完成</text>
            </view>
          </view>
        </view>
        
        <!-- 推广中心 -->
 <!--       <view class="promotion-banner" @click="navigateToPromotion">
          <view class="promotion-content">
            <view class="promotion-info">
              <text class="promotion-title">邀请好友 得奖励</text>
              <text class="promotion-desc">每邀请1位新用户可获得<text class="highlight">30元</text>奖励</text>
            </view>
            <view class="promotion-btn">
              <image src="@/static/icons/profile/share.png" class="promotion-icon" mode="aspectFit" />
              <text class="promotion-btn-text">立即邀请</text>
            </view>
          </view>
        </view> -->
        

        
        <!-- 设置列表 -->
        <view class="settings-list">
 
          <view class="setting-item" @click="navigateToCustomerService">
            <view class="setting-icon">
              <image src="@/static/icons/profile/kefu.png" class="setting-icon-img" mode="aspectFit" />
            </view>
            <text class="setting-text">联系客服</text>
            <image src="@/static/icons/common/arrow-right.png" class="setting-arrow" mode="aspectFit" />
            <!-- #ifdef MP-WEIXIN -->
            <button open-type="contact" class="kf_btn" @tap.stop></button>
            <!-- #endif -->
          </view>
          <view class="setting-item" @click="navigateToSystemSettings">
            <view class="setting-icon">
              <image src="@/static/icons/profile/settings.png" class="setting-icon-img" mode="aspectFit" />
            </view>
            <text class="setting-text">系统设置</text>
            <image src="@/static/icons/common/arrow-right.png" class="setting-arrow" mode="aspectFit" />
          </view>
        </view>
        
        <view class="app-version">
          随伴行
        </view>
      </view>
    </scroll-view>  

  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted,  computed } from 'vue'

import {
	onShow,
	onLoad
} from '@dcloudio/uni-app';

import { getUserInfo, getApplicatioInfo } from '@/api/user.js'
import { getOrderCount } from '@/api/order.js'
import { useUserStore } from '@/stores/user.js'
// 用户状态管理
const userStore = useUserStore()

// 状态栏高度适配
const statusBarHeight = ref(0)

// 下拉刷新状态
const isRefreshing = ref(false)

// 申请信息状态
const applicationInfo = ref(null)
const applicationStatus = ref('')

// 登录状态判断
const isLoggedIn = computed(() => {
  return userStore.userInfo && Object.keys(userStore.userInfo).length > 0
})

// 用户信息
const userInfo = computed(() => {
  if (isLoggedIn.value) {
    return userStore.userInfo
  }

}) 

// 数据状态
const orderCounts = ref({
  pending: 0,
  inProgress: 0
})

// 监听登录成功事件
const handleLoginSuccess = (data) => {
  console.log('收到登录成功事件:', data)
  // 重新加载用户数据
  loadUserData()
  // 获取订单数量
  loadOrderCount()
}

// 监听退出登录事件
const handleLogoutSuccess = () => {
  console.log('收到退出登录事件')
  // 清除本地数据，状态会自动更新
  orderCounts.value = {
    pending: 0,
    inProgress: 0
  }
  // 清除申请信息
  applicationInfo.value = null
  applicationStatus.value = ''
}

// 监听申请状态变化事件
const handleApplicationStatusChanged = (data) => {
  console.log('收到申请状态变化事件:', data)
  // 刷新申请信息
  loadApplicationInfo()
  
  // 显示刷新成功提示
  // uni.showToast({
  //   title: '申请信息已更新',
  //   icon: 'success',
  //   duration: 2000
  // })
}

onMounted(() => {
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  
  // 初始化用户数据
  loadUserData()
  
  // 监听登录成功事件
  uni.$on('loginSuccess', handleLoginSuccess)
  
  // 监听退出登录事件
  uni.$on('logoutSuccess', handleLogoutSuccess)
  
  // 监听申请状态变化事件
  uni.$on('applicationStatusChanged', handleApplicationStatusChanged)
})

onShow(() => {
  // 页面显示时，如果已登录则获取订单数量
  if (isLoggedIn.value) {
    loadOrderCount()
  }
})

onUnmounted(() => {
  // 移除事件监听
  uni.$off('loginSuccess', handleLoginSuccess)
  uni.$off('logoutSuccess', handleLogoutSuccess)
  uni.$off('applicationStatusChanged', handleApplicationStatusChanged)
})

// 加载用户数据
const loadUserData = async () => {
  console.log('开始加载用户数据 - isLoggedIn:', isLoggedIn.value)
  console.log('当前用户状态:', userStore.userInfo)
  
  // 只有登录状态下才请求用户信息
  if (isLoggedIn.value) {
    try {
      console.log('用户已登录，开始请求用户信息')
      const response = await getUserInfo()
      console.log('用户信息请求成功:', response)
      
      // 判断请求是否成功
      if (response.data && response.data.code === 0) {
        const userData = response.data.data
        console.log('解析用户数据:', userData)
        
   const userInfo = {
     ...userData,
     access_token: userStore.userInfo.access_token || '',
     refresh_token: userStore.userInfo.refresh_token || '',
    
   }
   
   // 更新用户状态
    userStore.setUserInfo(userInfo)
        
     
     
     
      } else {
        console.warn('获取用户信息失败:', response.data?.msg || '未知错误')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }

    // 加载申请信息
    await loadApplicationInfo()
    // 加载订单数量
    await loadOrderCount()
  } else {
    console.log('用户未登录，跳过获取用户信息')
  }
}

// 加载申请信息
const loadApplicationInfo = async () => {
  try {
    console.log('开始请求申请信息')
    const response = await getApplicatioInfo()
    console.log('申请信息请求成功:', response)
    
    if (response.data && response.data.code === 0) {
      applicationInfo.value = response.data.data
    
    } 
  } catch (error) {
    
  }
}

// 加载订单数量统计
const loadOrderCount = async () => {
  try {
    console.log('开始请求订单数量统计')
    const response = await getOrderCount()
    console.log('订单数量统计请求成功:', response)
    
    if (response.data && response.data.code === 0) {
      const data = response.data.data
      console.log('待服务订单数:', data.pending_service_count)
      console.log('待付款订单数:', data.pending_payment_count)
      console.log('进行中订单数:', data.in_service_count)
      
      // 更新订单数量
      orderCounts.value = {
        pending: data.pending_payment_count || 0,
        pending_service: data.pending_service_count || 0,
        inProgress: data.in_service_count || 0
      }
    }
  } catch (error) {
    console.error('获取订单数量失败:', error)
  }
}

// 导航到登录页面
const navigateToLogin = () => {
  uni.navigateTo({
    url: '/subPackages/login/index'
  })
}



// 导航方法
// const navigateToUserDetail = () => {
//   uni.navigateTo({
//     url: '/subPackages/login/index'
//   })
// }

	const navigateToUserDetail = () => {
		if (!isLoggedIn.value) {
			uni.showModal({
				title: '提示',
				content: '请先登录后再设置头像',
				confirmText: '去登录',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						uni.navigateTo({
							url: '/subPackages/login/index'
						})
					}
				}
			})
			return
		}
		
		uni.navigateTo({
			url: '/subPackages/settings/pages/index/edit'
		})
	}

const navigateToOrders = (status) => {
  console.log('跳转到订单页面，状态:', status)
  const encodedStatus = encodeURIComponent(status)
  uni.navigateTo({
    url: `/subPackages/order/index?status=${encodedStatus}`
  })
}

const navigateToPromotion = () => {
  uni.navigateTo({
    url: '/subPackages/profile/promotion/index'
  })
}

const navigateToPartnerRegistration = () => {
  // 根据申请状态跳转到不同页面
  if (applicationInfo.value && applicationInfo.value.status === 'approved') {
    // 已通过，跳转到友伴端
    uni.navigateTo({
      url: '/subPackages/fpart/index'
    })
  } else {
    // 其他状态，跳转到友伴入驻申请页面
    uni.navigateTo({
      url: '/subPackages/py/apply/index'
    })
  }
}



const navigateToCustomerService = () => {
  uni.navigateTo({
    url: '/subPackages/profile/customer-service/index'
  })
}

const navigateToSystemSettings = () => {
  uni.navigateTo({
    url: '/subPackages/settings/pages/index/index'
  })
}



// 下拉刷新处理
const onRefresh = async () => {
  console.log('开始下拉刷新')
  isRefreshing.value = true
  
  try {
    await loadUserData()
    
    // 模拟加载时间，确保用户能看到刷新动画
    await new Promise(resolve => setTimeout(resolve, 800))
    
   
  } catch (error) {
    console.error('刷新失败:', error)
    uni.showToast({
      title: '刷新失败',
      icon: 'none',
      duration: 1500
    })
  } finally {
    isRefreshing.value = false
  }
}

const onRefreshRestore = () => {
  console.log('刷新动画结束')
  isRefreshing.value = false
}

// 暴露刷新方法供父组件调用
const refreshCurrentTab = async () => {
  console.log('Profile组件刷新方法被调用')
  
  try {
    // 重新加载用户数据
    await loadUserData()
    return true
  } catch (error) {
    console.error('Profile组件刷新失败:', error)
    throw error
  }
}

// 格式化手机号
const formatPhone = (phone) => {
  if (!phone) return '未绑定手机号'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 暴露方法供父组件使用
defineExpose({
  refreshCurrentTab
})

</script>

<style lang="scss" scoped>
.profile-container {
  height: 100vh;
  background-color: #F7F8FA;
  display: flex;
  flex-direction: column;
}

/* 顶部个人信息区 - 保留品牌渐变 */
.profile-header {
  padding: 30rpx 0 30rpx;
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  color: #FFFFFF;
  border-radius: 0 0 40rpx 40rpx;
  box-shadow: 0 8rpx 32rpx rgba(115, 99, 255, 0.15);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

/* 已登录状态样式 */
.user-profile {
  display: flex;
  align-items: center;
  padding: 0 32rpx;
}

.user-details {
  flex: 1;
  margin-right: 16rpx;
}

.name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #FFFFFF;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  line-height: 1.3;
  flex: 1;
}

.user-phone {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 16rpx;
  font-weight: 400;
  line-height: 1.4;
}

/* .user-auth removed */

/* 未登录状态样式 */
.login-prompt {
  position: relative;
  z-index: 10;
  min-height: 260rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 32rpx;
}



.prompt-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  z-index: 5;
  width: 100%;
}

.prompt-avatar {
  position: relative;
  margin-bottom: 24rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-placeholder-large {
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.18);
  border: 2rpx solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
  backdrop-filter: blur(15rpx);
  overflow: hidden;
  position: relative;
  z-index: 2;
}

.avatar-text {
  font-size: 56rpx;
  opacity: 0.9;
  filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.1));
}

.avatar-glow {
  position: absolute;
  top: -12rpx;
  left: -12rpx;
  right: -12rpx;
  bottom: -12rpx;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse-glow 2.5s ease-in-out infinite;
  z-index: 1;
}

.prompt-text {
  margin-bottom: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.welcome-title {
  font-size: 36rpx;
  font-weight: 700;
  margin-bottom: 12rpx;
  color: #FFFFFF;
  letter-spacing: 1.5rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  line-height: 1.3;
}

.welcome-subtitle {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.5;
  font-weight: 500;
  max-width: 400rpx;
}

.quick-benefits {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32rpx;
  gap: 60rpx;
  flex-wrap: wrap;
}

.benefit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80rpx;
}

.benefit-icon {
  width: 40rpx;
  height: 40rpx;
  filter: brightness(0) saturate(100%) invert(100%);
  opacity: 0.9;
  transition: all 0.3s ease;
  margin-bottom: 10rpx;
}

.benefit-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  white-space: nowrap;
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.25);
  border: 1rpx solid rgba(255, 255, 255, 0.35);
  border-radius:999rpx;
  padding: 10rpx 28rpx;

  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);

  position: relative;
  overflow: hidden;
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.15), 
    transparent
  );
  animation: shine 1.5s ease-in-out infinite;
  z-index: 10;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.15), 
    transparent
  );
  transition: left 0.6s ease;
}

.login-btn:active {
  transform: scale(0.96);
  background: rgba(255, 255, 255, 0.35);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.18);
}

.login-btn:active::before {
  left: 100%;
}

.login-btn-text {
  font-size: 28rpx;
  font-weight: 600;
  color: #FFFFFF;
 
}

.login-arrow {
  width: 34rpx;
  height: 34rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;
  backdrop-filter: blur(10rpx);
  margin-left: 12rpx;
  padding: 4rpx;

}

.user-profile:active .profile-arrow {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(0.9);
}

.arrow-icon {
  width: 18rpx;
  height: 18rpx;
  filter: brightness(0) saturate(100%) invert(100%);
  opacity: 0.8;
}



@keyframes pulse-glow {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.08);
  }
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.1);
  }
}

@keyframes shine {
  0% {
    left: -100%;
  }
  50% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}

.avatar-container {
  position: relative;
  margin-right: 32rpx;
}

.avatar-circle {
  width: 140rpx;
  height: 140rpx;
  background: rgba(255, 255, 255, 0.15);
  border: 3rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 64rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.user-profile:active .avatar-circle {
  transform: scale(0.95);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  color: #FFFFFF;
  font-weight: 600;
  font-size: 48rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
}

.avatar-border {
  position: absolute;
  top: -3rpx;
  left: -3rpx;
  right: -3rpx;
  bottom: -3rpx;
  border: 2rpx solid transparent;
  border-radius: 50%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.4));
  background-clip: border-box;
  animation: border-glow 3s ease-in-out infinite;
}

.online-indicator {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 28rpx;
  height: 28rpx;
  background: #4CAF50;
  border: 3rpx solid white;
  border-radius: 50%;
  box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.4);
  animation: online-pulse 2s ease-in-out infinite;
}

.location-icon {
  margin-right: 4rpx;
  font-size: 22rpx;
}

.auth-tag {
  display: flex;
  align-items: center;
  padding: 4rpx 8rpx;
  border-radius: 12rpx;
  background: rgba(255, 255, 255, 0.15);
  font-size: 22rpx;
  transition: all 0.3s ease;
}

.auth-tag.auth-verified {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

.level-progress {
  display: flex;
  align-items: center;
}

.level-bar {
  position: relative;
  width: 120rpx;
  height: 6rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3rpx;
  margin-right: 12rpx;
  overflow: hidden;
}

.level-progress-inner {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 3rpx;
}

.level-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.6));
  animation: glow-pulse 2s ease-in-out infinite;
  z-index: 1;
}

.level-text {
  font-size: 24rpx;
}

.profile-arrow {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  transition: all 0.3s ease;
  flex-shrink: 0;
  backdrop-filter: blur(10rpx);
  margin-left: 12rpx;
}

.user-profile:active .profile-arrow {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(0.9);
}

.arrow-icon {
  width: 18rpx;
  height: 18rpx;
  filter: brightness(0) saturate(100%) invert(100%);
  opacity: 0.8;
}

/* 可滚动内容区域 */
.scroll-container {
  width: 100%;
  height: 100%;
}

/* 页面内容 */
.profile-content {
  padding: 32rpx;
  padding-bottom: 80rpx;
}





/* 通用区块样式 - 简化设计 */
.section-container {
  background: #FFFFFF;

  padding: 20rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;

}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.view-all {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  color: #666666;
  padding: 4rpx 10rpx;
  border-radius: 12rpx;
  background: #f8f9fa;
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.96);
    background: #e9ecef;
  }
}

.view-all-text {
  margin-right: 6rpx;
}

.view-all-arrow {
  width: 18rpx;
  height: 18rpx;
 
}

/* 订单管理 - 简化设计 */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0 16rpx;
}

.order-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 0;
  transition: all 0.2s;
 
}

.order-item:active {
  transform: scale(0.96);
}

.order-icon {
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12rpx;
  transition: all 0.2s;
}

.order-icon-img {
  width: 58rpx;
  height: 58rpx;


}

.order-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: linear-gradient(135deg, #ff4757 0%, #ff3742 100%);
  color: #FFFFFF;
  font-size: 20rpx;
  font-weight: 600;
  border-radius: 50%;
  min-width: 28rpx;
  height: 28rpx;
  display: flex;
  justify-content: center;
  align-items: center;

  z-index: 10;

}

.order-text {
  font-size: 24rpx;
  color: #666666;
  font-weight: 400;
}

/* 推广中心 */
.promotion-banner {
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 24rpx rgba(115, 99, 255, 0.15);
  position: relative;
  overflow: hidden;
}

.promotion-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  z-index: 1;
}

.promotion-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}

.promotion-info {
  flex: 1;
}

.promotion-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 8rpx;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

.promotion-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.4;
}

.highlight {
  color: #FFD700;
  font-weight: 600;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.2);
}

.promotion-btn {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.2);
  border: 1rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 24rpx;
  padding: 12rpx 20rpx;
  backdrop-filter: blur(10rpx);
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.promotion-banner:active .promotion-btn {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}

.promotion-icon {
  width: 24rpx;
  height: 24rpx;
  filter: brightness(0) saturate(100%) invert(100%);
  margin-right: 8rpx;
}

.promotion-btn-text {
  font-size: 24rpx;
  color: #FFFFFF;
  font-weight: 500;
}



/* 设置列表 */
.settings-list {
  background: #FFFFFF;

  border-radius: 20rpx;
  margin-bottom: 20rpx;

  overflow: hidden;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 28rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: all 0.2s;
  position: relative;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:active {
  background: #f8f9fa;

}

.setting-icon {

  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 16rpx;
  transition: all 0.2s;
}

.setting-item:active .setting-icon {
  background: #e9ecef;
}

.setting-icon-img {
  width: 36rpx;
  height: 36rpx;

}

.setting-text {
  flex: 1;
  font-size: 28rpx;
  color: #1A1A1A;
  font-weight: 400;
}

.setting-arrow {
  width: 32rpx;
  height:  32rpx;

}

/* 微信客服透明覆盖按钮 */
.kf_btn {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background: transparent !important;
  opacity: 0;
  border: none;
  z-index: 5;
}
.kf_btn::after {
  border: none;
}

/* 应用版本 */
.app-version {
  text-align: center;
  font-size: 24rpx;
  color: #999999;
  padding: 40rpx 0;
  background: transparent;
}

/* 动画效果 */
@keyframes border-glow {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

@keyframes online-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes badge-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes badge-glow {
  0% {
    opacity: 0.3;
  }
  100% {
    opacity: 0.6;
  }
}
</style> 