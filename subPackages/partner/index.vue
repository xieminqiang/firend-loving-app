<template>
  <view class="partner-container">
    <!-- 顶部状态栏适配 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <image src="@/static/icons/common/arrow-left.png" class="back-icon" mode="aspectFit" />
        <text class="back-text">返回</text>
      </view>
      <text class="nav-title">友伴端</text>
      <view class="nav-placeholder"></view>
    </view>
    
    <!-- 主内容区域 -->
    <view class="main-content">
      <!-- 页面内容 -->
      <swiper
        class="content-swiper"
        :current="currentTabIndex"
        @change="onSwiperChange"
        :indicator-dots="false"
        :circular="false"
        :autoplay="false"
        :duration="300"
      >
        <!-- 工作台页面 -->
        <swiper-item>
          <scroll-view class="tab-scroll-view" scroll-y="true">
            <view class="workbench-content">
              <view class="workbench-header">
                <text class="workbench-title">工作台</text>
                <text class="workbench-subtitle">欢迎来到友伴端工作台</text>
              </view>
              
              <!-- 统计卡片 -->
              <view class="stats-grid">
                <view class="stat-card">
                  <view class="stat-icon">📊</view>
                  <text class="stat-number">0</text>
                  <text class="stat-label">今日订单</text>
                </view>
                <view class="stat-card">
                  <view class="stat-icon">💰</view>
                  <text class="stat-number">¥0.00</text>
                  <text class="stat-label">今日收入</text>
                </view>
                <view class="stat-card">
                  <view class="stat-icon">⭐</view>
                  <text class="stat-number">0</text>
                  <text class="stat-label">服务评分</text>
                </view>
                <view class="stat-card">
                  <view class="stat-icon">👥</view>
                  <text class="stat-number">0</text>
                  <text class="stat-label">服务客户</text>
                </view>
              </view>
              
              <!-- 快捷功能 -->
              <view class="quick-actions">
                <view class="action-item">
                  <view class="action-icon">📝</view>
                  <text class="action-text">接单设置</text>
                </view>
                <view class="action-item">
                  <view class="action-icon">📅</view>
                  <text class="action-text">排班管理</text>
                </view>
                <view class="action-item">
                  <view class="action-icon">📱</view>
                  <text class="action-text">消息中心</text>
                </view>
                <view class="action-item">
                  <view class="action-icon">📋</view>
                  <text class="action-text">服务记录</text>
                </view>
              </view>
              
              <!-- 最近订单 -->
              <view class="recent-orders">
                <view class="section-header">
                  <text class="section-title">最近订单</text>
                  <text class="view-all">查看全部</text>
                </view>
                <view class="empty-orders">
                  <view class="empty-icon">📦</view>
                  <text class="empty-text">暂无订单</text>
                  <text class="empty-desc">开始接单，获得收入</text>
                </view>
              </view>
            </view>
          </scroll-view>
        </swiper-item>
        
        <!-- 我的页面 -->
        <swiper-item>
          <scroll-view class="tab-scroll-view" scroll-y="true">
            <view class="profile-content">
              <!-- 个人信息 -->
              <view class="profile-header" @click="goToDataEdit">
                <view class="avatar-container">
                  <view class="avatar-placeholder">👤</view>
                </view>
                <view class="profile-info">
                  <text class="profile-name">友伴用户</text>
                  <text class="profile-id">ID: 000000</text>
                  <view class="profile-status">
                    <view class="status-dot"></view>
                    <text class="status-text">未认证</text>
                  </view>
                </view>
              </view>
              
              <!-- 账户信息 -->
              <view class="account-info">
                <view class="balance-card">
                  <text class="balance-label">账户余额</text>
                  <text class="balance-amount">¥0.00</text>
                  <view class="balance-actions">
                    <text class="action-btn">提现</text>
                    <text class="action-btn">明细</text>
                  </view>
                </view>
              </view>
              
              <!-- 功能列表 -->
              <view class="function-list">
                <view class="function-item">
                  <view class="function-icon">📋</view>
                  <text class="function-text">我的服务</text>
                    <image src="@/static/icons/common/arrow-right.png" class="setting-arrow" mode="aspectFit" />
                </view>
                <view class="function-item">
                  <view class="function-icon">⭐</view>
                  <text class="function-text">我的评价</text>
                  <image src="@/static/icons/common/arrow-right.png" class="setting-arrow" mode="aspectFit" />
                </view>
                <view class="function-item">
                  <view class="function-icon">📊</view>
                  <text class="function-text">数据统计</text>
                  <image src="@/static/icons/common/arrow-right.png" class="setting-arrow" mode="aspectFit" />
                </view>
                <view class="function-item">
                  <view class="function-icon">⚙️</view>
                  <text class="function-text">设置</text>
                  <image src="@/static/icons/common/arrow-right.png" class="setting-arrow" mode="aspectFit" />
                </view>
              </view>
            </view>
          </scroll-view>
        </swiper-item>
      </swiper>
    </view>
    
    <!-- 底部TabBar -->
    <view class="tab-bar">
      <view 
        class="tab-item" 
        :class="{ active: currentTabIndex === 0 }"
        @click="switchTab(0)"
      >
        <image 
          :src="currentTabIndex === 0 ? '/static/icons/tabbar/grid-fill.png' : '/static/icons/tabbar/grid.png'"
          class="tab-icon"
          mode="aspectFit"
        />
        <text class="tab-text">工作台</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: currentTabIndex === 1 }"
        @click="switchTab(1)"
      >
        <image 
          :src="currentTabIndex === 1 ? '/static/icons/tabbar/account-fill.png' : '/static/icons/tabbar/account.png'"
          class="tab-icon"
          mode="aspectFit"
        />
        <text class="tab-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 状态栏高度
const statusBarHeight = ref(0)

// 当前选中的Tab索引
const currentTabIndex = ref(0)

const primaryColor = '#7363FF'

onMounted(() => {
  // 获取系统信息
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 0
})

// 切换Tab
const switchTab = (index) => {
  currentTabIndex.value = index
}

// swiper滑动改变时的处理
const onSwiperChange = (e) => {
  currentTabIndex.value = e.detail.current
}

// 返回上一步
const goBack = () => {
  uni.navigateBack()
}

// 跳转到资料编辑页面
const goToDataEdit = () => {
  uni.navigateTo({
    url: '/subPackages/DataEdetion/index'
  })
}
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

.partner-container {
  height: 100vh;
  background: $bg-color-secondary;
  display: flex;
  flex-direction: column;
}

.status-bar {
  background: $bg-color-primary;
}

.nav-bar {
  background: $bg-color-primary;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.back-btn {
  display: flex;
  align-items: center;
  padding: 12rpx 16rpx;
  border-radius: 20rpx;
  background: rgba(0, 0, 0, 0.04);
  transition: all 0.2s;
}

.back-btn:active {
  background: rgba(0, 0, 0, 0.08);
  transform: scale(0.96);
}

.back-icon {
  width: 32rpx;
  height: 32rpx;
  opacity: 0.8;
}

.back-text {
  font-size: 26rpx;
  color: $text-color-primary;
  font-weight: 500;
  margin-left: 8rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $text-color-primary;
  text-align: center;
  flex: 1;
}

.nav-placeholder {
  width: 120rpx;
} 

.main-content {
  flex: 1;
  overflow: hidden;
}

.content-swiper {
  height: 100%;
}

.tab-scroll-view {
  height: 100%;
  background: $bg-color-secondary;
}

/* 工作台页面样式 */
.workbench-content {
  padding: 32rpx;
}

.workbench-header {
  margin-bottom: 32rpx;
}

.workbench-title {
  font-size: 48rpx;
  font-weight: 700;
  color: $text-color-primary;
  display: block;
  margin-bottom: 8rpx;
}

.workbench-subtitle {
  font-size: 28rpx;
  color: $text-color-secondary;
  display: block;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.stat-card {
  background: $bg-color-primary;
  border-radius: 20rpx;
  padding: 32rpx 24rpx;
  text-align: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #f0f0f0;
}

.stat-icon {
  font-size: 48rpx;
  margin-bottom: 16rpx;
  display: block;
}

.stat-number {
  font-size: 36rpx;
  font-weight: 700;
  color: $primary-color;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: $text-color-secondary;
  display: block;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24rpx;
  margin-bottom: 32rpx;
}

.action-item {
  background: $bg-color-primary;
  border-radius: 16rpx;
  padding: 24rpx 16rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid #f0f0f0;
  transition: all 0.2s;
}

.action-item:active {
  transform: scale(0.96);
  background: #f8f9fa;
}

.action-icon {
  font-size: 40rpx;
  margin-bottom: 12rpx;
  display: block;
}

.action-text {
  font-size: 24rpx;
  color: $text-color-primary;
  font-weight: 500;
}

.recent-orders {
  background: $bg-color-primary;
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
  color: $text-color-primary;
}

.view-all {
  font-size: 24rpx;
  color: $primary-color;
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
  color: $text-color-primary;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: $text-color-secondary;
  display: block;
}

/* 我的页面样式 */
.profile-content {
  padding: 32rpx;
}

.profile-header {
  background: $bg-color-primary;
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
  font-size: 36rpx;
  font-weight: 600;
  color: $text-color-primary;
  display: block;
  margin-bottom: 8rpx;
}

.profile-id {
  font-size: 24rpx;
  color: $text-color-secondary;
  display: block;
  margin-bottom: 12rpx;
}

.profile-status {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 12rpx;
  height: 12rpx;
  background: #ffc107;
  border-radius: 50%;
  margin-right: 8rpx;
}

.status-text {
  font-size: 24rpx;
  color: #ffc107;
  font-weight: 500;
}

.account-info {
  margin-bottom: 24rpx;
}

.balance-card {
  background: linear-gradient(135deg, $primary-color 0%, #FF69DE 100%);
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
  background: $bg-color-primary;
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
  color: $text-color-primary;
  font-weight: 500;
}

.setting-arrow {
  width: 32rpx;
  height: 32rpx;

}
/* 底部TabBar样式 */
.tab-bar {
  background: $bg-color-primary;
  border-top: 1rpx solid #f0f0f0;
  display: flex;
  align-items: center;

  box-sizing: border-box;
  /* 安全区域适配 - 有安全区域时使用safe-area-inset-bottom，没有时使用40rpx */
  padding-bottom: max(40rpx, env(safe-area-inset-bottom));
  padding-top: 10rpx;
  box-sizing: border-box;

}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;

  transition: all 0.3s;

  box-sizing: border-box;

}

.tab-item:active {
  transform: scale(0.95);
  
}

.tab-icon {
  width: 50rpx;
  height: 50rpx;

  transition: all 0.3s;
}

.tab-text {
  font-size: 22rpx;
  margin-top: 6rpx;
  color: $text-color-secondary;
  font-weight: 500;
  transition: all 0.3s;
  line-height: 1.2;
  /* 防止文字被截断 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.tab-item.active .tab-text {
  color: $primary-color;
  font-weight: 600;
}
</style> 