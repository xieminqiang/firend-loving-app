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
                <image v-if="userInfo.avatar" :src="userInfo.avatar" class="avatar-img" mode="aspectFill" />
                <text v-else class="avatar-placeholder">{{ userInfo.nickname?.charAt(0) || '用' }}</text>
                <view class="avatar-border"></view>
              </view>
              <view class="online-indicator"></view>
            </view>
            <view class="user-details">
              <view class="name-row">
                <view class="user-name">{{ userInfo.nickname || '随伴行用户' }}</view>
                <view class="profile-arrow">
                  <image src="@/static/icons/common/arrow-right.png" class="arrow-icon" mode="aspectFit" />
                </view>
              </view>
              <view class="user-phone">{{ formatPhone(userInfo.phone) || '未绑定手机号' }}</view>
              <view class="user-auth">
                <view class="level-progress">
                  <view class="level-bar">
                    <view class="level-progress-inner" :style="{ width: userInfo.levelProgress + '%' }"></view>
                    <view class="level-glow"></view>
                  </view>
                  <text class="level-text">Lv.{{ userInfo.level || 1 }}</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 未登录状态 -->
          <view v-else class="login-prompt">
            <!-- 装饰性背景元素 -->
            <view class="bg-decoration">
              <view class="floating-dot dot-1"></view>
              <view class="floating-dot dot-2"></view>
              <view class="floating-dot dot-3"></view>
              <view class="floating-dot dot-4"></view>
              <view class="floating-stars">
                <view class="star star-1">✨</view>
                <view class="star star-2">💫</view>
                <view class="star star-3">⭐</view>
              </view>
            </view>
            
            <view class="prompt-content">
              
              <!-- 文字内容 -->
              <view class="prompt-text">
                <!-- <view class="welcome-title">Hi~ 欢迎来到随伴行</view> -->
                <view class="welcome-subtitle">登录后解锁更多精彩功能</view>
              </view>
              
              <!-- 功能亮点 -->
              <view class="quick-benefits">
                <view class="benefit-item">
                  <view class="benefit-icon-wrapper">
                    <image src="@/static/icons/profile/heart.png" class="benefit-icon" mode="aspectFit" />
                    <view class="icon-glow"></view>
                  </view>
                  <text class="benefit-text">兴趣匹配</text>
                </view>
                <view class="benefit-item">
                  <view class="benefit-icon-wrapper">
                    <image src="@/static/icons/profile/clock.png" class="benefit-icon" mode="aspectFit" />
                    <view class="icon-glow"></view>
                  </view>
                  <text class="benefit-text">快速预约</text>
                </view>
                <view class="benefit-item">
                  <view class="benefit-icon-wrapper">
                    <image src="@/static/icons/profile/shield.png" class="benefit-icon" mode="aspectFit" />
                    <view class="icon-glow"></view>
                  </view>
                  <text class="benefit-text">安全保障</text>
                </view>
              </view>
              
              <!-- 登录按钮 -->
              <view class="login-btn" @click="navigateToLogin">
                <view class="btn-shine"></view>
                <text class="login-btn-text">立即登录</text>
                <image src="@/static/icons/common/jiantou.png" class="login-arrow" mode="aspectFit" />
              </view>
            </view>
          </view>
        </view>
      <!-- 页面内容 -->
      <view class="profile-content">
      

        <!-- 快捷功能区 -->
        <view class="quick-actions">
          <view class="action-item" @click="handleActionClick('wallet')">
            <view class="action-icon wallet-icon">
              <image src="@/static/icons/profile/wallet.png" class="icon-img" mode="aspectFit" />
            </view>
            <text class="action-text">我的钱包</text>
          </view>
          <view class="action-item" @click="handleActionClick('coupons')">
            <view class="action-icon coupon-icon">
              <image src="@/static/icons/profile/coupon.png" class="icon-img" mode="aspectFit" />
              <text v-if="couponsCount > 0" class="action-badge">{{ couponsCount }}</text>
            </view>
            <text class="action-text">优惠券</text>
          </view>
          <view class="action-item" @click="handleActionClick('favorites')">
            <view class="action-icon favorite-icon">
              <image src="@/static/icons/profile/heart.png" class="icon-img" mode="aspectFit" />
            </view>
            <text class="action-text">我的收藏</text>
          </view>
          <view class="action-item" @click="handleActionClick('history')">
            <view class="action-icon history-icon">
              <image src="@/static/icons/profile/history.png" class="icon-img" mode="aspectFit" />
            </view>
            <text class="action-text">浏览历史</text>
          </view>
        </view>

        <!-- 账户余额卡片 -->
        <view class="account-card">
          <view class="card-header">
            <text class="card-title">账户余额(元)</text>
            <view class="view-details" @click="navigateToBillDetails">
              <text class="details-text">账单明细</text>
              <image src="@/static/icons/common/arrow-right.png" class="details-arrow" mode="aspectFit" />
            </view>
          </view>
          <view class="balance-amount">¥ {{ accountBalance }}</view>
          <view class="card-actions">
            <view class="action-btn withdraw-btn" @click="handleWithdraw">
              <text>立即提现</text>
            </view>
            <view class="action-btn recharge-btn" @click="handleRecharge">
              <text>充值</text>
            </view>
          </view>
        </view>
        
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
            <view class="order-item" @click="navigateToOrders('pending')">
              <view class="order-icon">
                <image src="@/static/icons/profile/credit-card.png" class="order-icon-img" mode="aspectFit" />
                <text v-if="orderCounts.pending > 0" class="order-badge">{{ orderCounts.pending }}</text>
              </view>
              <text class="order-text">待付款</text>
            </view>
            <view class="order-item" @click="navigateToOrders('to-serve')">
              <view class="order-icon">
                <image src="@/static/icons/profile/heart.png" class="order-icon-img" mode="aspectFit" />
              </view>
              <text class="order-text">待服务</text>
            </view>
            <view class="order-item" @click="navigateToOrders('in-progress')">
              <view class="order-icon">
                <image src="@/static/icons/profile/clock.png" class="order-icon-img" mode="aspectFit" />
                <text v-if="orderCounts.inProgress > 0" class="order-badge">{{ orderCounts.inProgress }}</text>
              </view>
              <text class="order-text">进行中</text>
            </view>
            <view class="order-item" @click="navigateToOrders('completed')">
              <view class="order-icon">
                <image src="@/static/icons/profile/check.png" class="order-icon-img" mode="aspectFit" />
              </view>
              <text class="order-text">已完成</text>
            </view>
            <view class="order-item" @click="navigateToOrders('to-review')">
              <view class="order-icon">
                <image src="@/static/icons/profile/comment.png" class="order-icon-img" mode="aspectFit" />
                <text v-if="orderCounts.toReview > 0" class="order-badge">{{ orderCounts.toReview }}</text>
              </view>
              <text class="order-text">待评价</text>
            </view>
          </view>
        </view>
        
        <!-- 推广中心 -->
        <view class="promotion-banner" @click="navigateToPromotion">
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
        </view>
        
        <!-- 常用功能 -->
        <view class="section-container">
          <view class="section-header">
            <text class="section-title">常用功能</text>
          </view>
          <view class="features-grid">
            <view class="feature-item" @click="navigateToReportReward">
              <view class="feature-icon">
                <image src="@/static/icons/profile/megaphone.png" class="feature-icon-img" mode="aspectFit" />
              </view>
              <text class="feature-text">举报有奖</text>
            </view>
            <view class="feature-item" @click="navigateToPartnerRegistration">
              <view class="feature-icon">
                <image src="@/static/icons/profile/flag.png" class="feature-icon-img" mode="aspectFit" />
              </view>
              <text class="feature-text" v-if="applicationInfo && applicationInfo.status && applicationInfo.status === 'approved'">友伴端</text>
              <text class="feature-text" v-else>友伴入驻</text>
            </view>
            <view class="feature-item" @click="navigateToCooperation">
              <view class="feature-icon">
                <image src="@/static/icons/profile/handshake.png" class="feature-icon-img" mode="aspectFit" />
              </view>
              <text class="feature-text">合作加盟</text>
            </view>
            <view class="feature-item" @click="handleEmergencyCall">
              <view class="feature-icon">
                <image src="@/static/icons/profile/warning.png" class="feature-icon-img" mode="aspectFit" />
              </view>
              <text class="feature-text">一键报警</text>
            </view>
            <view class="feature-item" @click="navigateToHelp">
              <view class="feature-icon">
                <image src="@/static/icons/profile/help.png" class="feature-icon-img" mode="aspectFit" />
              </view>
              <text class="feature-text">帮助中心</text>
            </view>
            <view class="feature-item" @click="navigateToRefund">
              <view class="feature-icon">
                <image src="@/static/icons/profile/refund.png" class="feature-icon-img" mode="aspectFit" />
              </view>
              <text class="feature-text">退款售后</text>
            </view>
          </view>
        </view>
        
        <!-- 设置列表 -->
        <view class="settings-list">
          <view class="setting-item" @click="navigateToPrivacySettings">
            <view class="setting-icon">
              <image src="@/static/icons/profile/shield.png" class="setting-icon-img" mode="aspectFit" />
            </view>
            <text class="setting-text">隐私设置</text>
            <image src="@/static/icons/common/arrow-right.png" class="setting-arrow" mode="aspectFit" />
          </view>
          <view class="setting-item" @click="navigateToNotificationSettings">
            <view class="setting-icon">
              <image src="@/static/icons/profile/bell.png" class="setting-icon-img" mode="aspectFit" />
            </view>
            <text class="setting-text">消息通知</text>
            <image src="@/static/icons/common/arrow-right.png" class="setting-arrow" mode="aspectFit" />
          </view>
          <view class="setting-item" @click="navigateToCustomerService">
            <view class="setting-icon">
              <image src="@/static/icons/profile/headset.png" class="setting-icon-img" mode="aspectFit" />
            </view>
            <text class="setting-text">联系客服</text>
            <image src="@/static/icons/common/arrow-right.png" class="setting-arrow" mode="aspectFit" />
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
          随伴行 v1.0.0
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { getUserInfo, getApplicatioInfo } from '@/api/user.js'

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
  return {
    nickname: '用户昵称',
    phone: '150****1947',
    city: '南昌市',
    avatar: '',
    realNameAuth: false,
    level: 1,
    levelProgress: 10
  }
})

// 数据状态
const accountBalance = ref('0.00')
const couponsCount = ref(3)
const orderCounts = ref({
  pending: 2,
  inProgress: 1,
  toReview: 3
})

// 监听登录成功事件
const handleLoginSuccess = (data) => {
  console.log('收到登录成功事件:', data)
  // 重新加载用户数据
  loadUserData()
}

// 监听退出登录事件
const handleLogoutSuccess = () => {
  console.log('收到退出登录事件')
  // 清除本地数据，状态会自动更新
  accountBalance.value = '0.00'
  couponsCount.value = 0
  orderCounts.value = {
    pending: 0,
    inProgress: 0,
    toReview: 0
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
        
        // 构造用户信息对象，映射字段名
        const userInfo = {
          nickname: userData.nick_name || '',
          phone: userData.phone || '',
          avatar: userData.head_img || '',
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
      
      // 根据申请状态设置显示文本
      if (applicationInfo.value) {
        // 根据返回的status字段设置状态
        switch (applicationInfo.value.status) {
          case 'pending':
            applicationStatus.value = '审核中'
            break
          case 'approved':
            applicationStatus.value = '已通过'
            break
          case 'rejected':
            applicationStatus.value = '已拒绝'
            break
          default:
            applicationStatus.value = '未知状态'
        }
      } else {
        applicationStatus.value = '未申请'
      }
    } else if (response.data && response.data.code === 6002) {
      // 申请记录不存在的情况
      console.log('申请记录不存在，设置为未申请状态')
      applicationInfo.value = null
      applicationStatus.value = '未申请'
    } else {
      console.warn('获取申请信息失败:', response.data?.msg || '未知错误')
      applicationStatus.value = '获取失败'
      applicationInfo.value = null
    }
  } catch (error) {
    console.error('获取申请信息失败:', error)
    applicationStatus.value = '获取失败'
    applicationInfo.value = null
  }
}

// 导航到登录页面
const navigateToLogin = () => {
  uni.navigateTo({
    url: '/subPackages/login/index'
  })
}

// 处理功能点击（需要登录验证）
const handleActionClick = (action) => {
  if (!isLoggedIn.value) {
    uni.showModal({
      title: '提示',
      content: '请先登录后再使用此功能',
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          navigateToLogin()
        }
      }
    })
    return
  }
  
  // 已登录，执行对应功能
  switch (action) {
    case 'wallet':
      navigateToWallet()
      break
    case 'coupons':
      navigateToCoupons()
      break
    case 'favorites':
      navigateToFavorites()
      break
    case 'history':
      navigateToHistory()
      break
  }
}

// 导航方法
const navigateToUserDetail = () => {
  uni.navigateTo({
    url: '/subPackages/login/index'
  })
}

const navigateToWallet = () => {
  uni.navigateTo({
    url: '/subPackages/profile/wallet/index'
  })
}

const navigateToCoupons = () => {
  uni.navigateTo({
    url: '/subPackages/profile/coupons/index'
  })
}

const navigateToFavorites = () => {
  uni.navigateTo({
    url: '/subPackages/profile/favorites/index'
  })
}

const navigateToHistory = () => {
  uni.navigateTo({
    url: '/subPackages/profile/history/index'
  })
}

const navigateToBillDetails = () => {
  uni.navigateTo({
    url: '/subPackages/profile/bill-details/index'
  })
}

const navigateToOrders = (status) => {
  uni.navigateTo({
    url: `/subPackages/profile/orders/index?status=${status}`
  })
}

const navigateToPromotion = () => {
  uni.navigateTo({
    url: '/subPackages/profile/promotion/index'
  })
}

const navigateToReportReward = () => {
  uni.navigateTo({
    url: '/subPackages/profile/report-reward/index'
  })
}

const navigateToPartnerRegistration = () => {
  // 根据申请状态跳转到不同页面
  if (applicationInfo.value && applicationInfo.value.status === 'approved') {
    // 已通过，跳转到友伴端
    uni.navigateTo({
      url: '/subPackages/partner/index'
    })
  } else {
    // 其他状态，跳转到友伴入驻申请页面
    uni.navigateTo({
      url: '/subPackages/friend/apply/index'
    })
  }
}

const navigateToCooperation = () => {
  uni.navigateTo({
    url: '/subPackages/profile/cooperation/index'
  })
}

const navigateToHelp = () => {
  uni.navigateTo({
    url: '/subPackages/profile/help/index'
  })
}

const navigateToRefund = () => {
  uni.navigateTo({
    url: '/subPackages/profile/refund/index'
  })
}

const navigateToPrivacySettings = () => {
  uni.navigateTo({
    url: '/subPackages/profile/privacy-settings/index'
  })
}

const navigateToNotificationSettings = () => {
  uni.navigateTo({
    url: '/subPackages/profile/notification-settings/index'
  })
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

// 操作方法
const handleWithdraw = () => {
  if (!isLoggedIn.value) {
    uni.showModal({
      title: '提示',
      content: '请先登录后再使用此功能',
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          navigateToLogin()
        }
      }
    })
    return
  }
  
  uni.showToast({
    title: '提现功能待开发',
    icon: 'none'
  })
}

const handleRecharge = () => {
  if (!isLoggedIn.value) {
    uni.showModal({
      title: '提示',
      content: '请先登录后再使用此功能',
      confirmText: '去登录',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          navigateToLogin()
        }
      }
    })
    return
  }
  
  uni.showToast({
    title: '充值功能待开发',
    icon: 'none'
  })
}

const handleEmergencyCall = () => {
  uni.showModal({
    title: '一键报警',
    content: '是否拨打紧急电话 110？',
    confirmText: '拨打',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        uni.makePhoneCall({
          phoneNumber: '110'
        })
      }
    }
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

// 格式化手机号
const formatPhone = (phone) => {
  if (!phone) return '未绑定手机号'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 获取友伴入驻文本
const getPartnerText = () => {
  if (applicationStatus.value === '审核中') {
    return '友伴入驻'
  } else if (applicationStatus.value === '已通过') {
    return '友伴端'
  } else if (applicationStatus.value === '已拒绝') {
    return '友伴入驻'
  } else {
    return '友伴入驻'
  }
}
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
  padding: 32rpx 0 40rpx;
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

.user-auth {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

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

.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.floating-dot {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  animation: float-dot 4s ease-in-out infinite;
  backdrop-filter: blur(4rpx);
}

.dot-1 {
  width: 24rpx;
  height: 24rpx;
  top: 15%;
  left: 12%;
  animation-delay: 0s;
}

.dot-2 {
  width: 18rpx;
  height: 18rpx;
  top: 35%;
  right: 18%;
  animation-delay: 1.5s;
}

.dot-3 {
  width: 16rpx;
  height: 16rpx;
  bottom: 25%;
  left: 22%;
  animation-delay: 3s;
}

.dot-4 {
  width: 14rpx;
  height: 14rpx;
  top: 55%;
  left: 30%;
  animation-delay: 4.5s;
}

.floating-stars {
  position: absolute;
  top: 10%;
  left: 20%;
  right: 10%;
  bottom: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 10rpx;
}

.star {
  font-size: 20rpx;
  opacity: 0.8;
  animation: float-star 3s ease-in-out infinite;
}

.star-1 {
  animation-delay: 0s;
}

.star-2 {
  animation-delay: 1s;
}

.star-3 {
  animation-delay: 2s;
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
  gap: 48rpx;
  flex-wrap: wrap;
}

.benefit-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80rpx;
}

.benefit-icon-wrapper {
  position: relative;
  width: 36rpx;
  height: 36rpx;
  margin-bottom: 10rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
}

.benefit-icon {
  width: 36rpx;
  height: 36rpx;
  filter: brightness(0) saturate(100%) invert(100%);
  opacity: 0.9;
  transition: all 0.3s ease;
}

.benefit-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  white-space: nowrap;
}

.icon-glow {
  position: absolute;
  top: -4rpx;
  left: -4rpx;
  right: -4rpx;
  bottom: -4rpx;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  animation: glow-pulse 2s ease-in-out infinite;
  z-index: 1;
}

.login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.25);
  border: 1rpx solid rgba(255, 255, 255, 0.35);
  border-radius: 36rpx;
  padding: 20rpx 40rpx;
  backdrop-filter: blur(15rpx);
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.12);
  min-width: 240rpx;
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
  margin-right: 12rpx;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
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

/* 动画效果优化 */
@keyframes float-dot {
  0%, 100% {
    transform: translateY(0px) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-12rpx) scale(1.15);
    opacity: 1;
  }
}

@keyframes float-star {
  0%, 100% {
    transform: translateY(0px) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-8rpx) scale(1.05);
    opacity: 1;
  }
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

/* 快捷功能区 - 简化设计 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: #FFFFFF;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  padding: 32rpx 0;
  margin-bottom: 24rpx;
  border: 1rpx solid #f0f0f0;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s;
  
  &:active {
    transform: scale(0.96);
  }
}

.action-icon {
  position: relative;
  width: 72rpx;
  height: 72rpx;
  border-radius: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12rpx;
  transition: all 0.2s;
}

/* 功能图标配色 - 使用简约单色 */
.wallet-icon {
  background: #f8f9fa;
  border: 1rpx solid #e9ecef;
}

.coupon-icon {
  background: #f8f9fa;
  border: 1rpx solid #e9ecef;
}

.favorite-icon {
  background: #f8f9fa;
  border: 1rpx solid #e9ecef;
}

.history-icon {
  background: #f8f9fa;
  border: 1rpx solid #e9ecef;
}

.icon-img {
  width: 32rpx;
  height: 32rpx;
  filter: brightness(0) saturate(100%) invert(42%) sepia(12%) saturate(1142%) hue-rotate(184deg) brightness(97%) contrast(90%);
}

.action-badge {
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
  box-shadow: 0 4rpx 12rpx rgba(255, 71, 87, 0.4);
  border: 2rpx solid rgba(255, 255, 255, 0.9);
  animation: badge-pulse 2s ease-in-out infinite;
  z-index: 10;
  
  &::before {
    content: '';
    position: absolute;
    top: -2rpx;
    left: -2rpx;
    right: -2rpx;
    bottom: -2rpx;
    background: linear-gradient(135deg, rgba(255, 71, 87, 0.3) 0%, rgba(255, 55, 66, 0.3) 100%);
    border-radius: 50%;
    z-index: -1;
    animation: badge-glow 2s ease-in-out infinite alternate;
  }
}

.action-text {
  font-size: 24rpx;
  color: #666666;
  font-weight: 400;
}

/* 账户余额卡片 - 极简设计 */
.account-card {
  background: #FFFFFF;
  border: 1rpx solid #f0f0f0;
  padding: 32rpx;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 16rpx;
}

.card-title {
  font-weight: 500;
  color: #1A1A1A;
}

.view-details {
  display: flex;
  align-items: center;
  color: #666666;
  font-size: 24rpx;
  padding: 4rpx 8rpx;
  border-radius: 12rpx;
  background: #f8f9fa;
  transition: all 0.2s;
}

.view-details:active {
  background: #e9ecef;
  transform: scale(0.96);
}

.details-text {
  margin-right: 6rpx;
}

.details-arrow {
  width: 16rpx;
  height: 16rpx;
  opacity: 0.6;
}

.balance-amount {
  font-size: 48rpx;
  font-weight: 600;
  margin: 16rpx 0 24rpx;
  color: #1A1A1A;
}

.card-actions {
  display: flex;
  gap: 30rpx;
}

.action-btn {
  flex: 1;
  padding: 16rpx 0;
  border-radius: 12rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 26rpx;
  font-weight: 500;
  transition: all 0.2s;
  min-height: 72rpx;
}

.withdraw-btn {
  background: #f8f9fa;
  color: #1A1A1A;
  border: 1rpx solid #e9ecef;
}

.withdraw-btn:active {
  background: #e9ecef;
  transform: scale(0.98);
}

.recharge-btn {
  background: #7363FF;
  color: white;
  border: 1rpx solid #7363FF;
}

.recharge-btn:active {
  background: #6354e6;
  transform: scale(0.98);
}

.btn-icon-wrapper {
  width: 24rpx;
  height: 24rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 8rpx;
}

.btn-icon-text {
  font-size: 16rpx;
  line-height: 1;
}

/* 通用区块样式 - 简化设计 */
.section-container {
  background: #FFFFFF;
  border: 1rpx solid #f0f0f0;
  padding: 24rpx;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
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
  padding: 4rpx 8rpx;
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
  width: 16rpx;
  height: 16rpx;
  opacity: 0.6;
}

/* 订单管理 - 简化设计 */
.orders-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
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
  width: 64rpx;
  height: 64rpx;
  background: #f8f9fa;
  border: 1rpx solid #e9ecef;
  border-radius: 12rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12rpx;
  transition: all 0.2s;
}

.order-item:active .order-icon {
  background: #e9ecef;
}

.order-icon-img {
  width: 28rpx;
  height: 28rpx;
  filter: brightness(0) saturate(100%) invert(42%) sepia(12%) saturate(1142%) hue-rotate(184deg) brightness(97%) contrast(90%);
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
  box-shadow: 0 4rpx 12rpx rgba(255, 71, 87, 0.4);
  border: 2rpx solid rgba(255, 255, 255, 0.9);
  animation: badge-pulse 2s ease-in-out infinite;
  z-index: 10;
  
  &::before {
    content: '';
    position: absolute;
    top: -2rpx;
    left: -2rpx;
    right: -2rpx;
    bottom: -2rpx;
    background: linear-gradient(135deg, rgba(255, 71, 87, 0.3) 0%, rgba(255, 55, 66, 0.3) 100%);
    border-radius: 50%;
    z-index: -1;
    animation: badge-glow 2s ease-in-out infinite alternate;
  }
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

/* 常用功能 - 简化设计 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx 16rpx;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.2s;
}

.feature-item:active {
  transform: scale(0.96);
}

.feature-icon {
  width: 72rpx;
  height: 72rpx;
  background: #f8f9fa;
  border: 1rpx solid #e9ecef;
  border-radius: 16rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12rpx;
  transition: all 0.2s;
}

.feature-item:active .feature-icon {
  background: #e9ecef;
}

.feature-icon-img {
  width: 32rpx;
  height: 32rpx;
  filter: brightness(0) saturate(100%) invert(42%) sepia(12%) saturate(1142%) hue-rotate(184deg) brightness(97%) contrast(90%);
}

.feature-text {
  font-size: 22rpx;
  color: #666666;
  font-weight: 400;
}

/* 设置列表 */
.settings-list {
  background: #FFFFFF;
  border: 1rpx solid #f0f0f0;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: all 0.2s;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item:active {
  background: #f8f9fa;
  transform: scale(0.98);
}

.setting-icon {
  width: 40rpx;
  height: 40rpx;
  background: #f8f9fa;
  border: 1rpx solid #e9ecef;
  border-radius: 8rpx;
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
  width: 20rpx;
  height: 20rpx;
  filter: brightness(0) saturate(100%) invert(42%) sepia(12%) saturate(1142%) hue-rotate(184deg) brightness(97%) contrast(90%);
}

.setting-text {
  flex: 1;
  font-size: 28rpx;
  color: #1A1A1A;
  font-weight: 400;
}

.setting-arrow {
  width: 16rpx;
  height: 16rpx;
  opacity: 0.6;
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