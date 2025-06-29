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
          <Workbench :applicationInfo="applicationInfo" />
        </swiper-item>
        
        <!-- 我的页面 -->
        <swiper-item>
          <Profile />
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
import Workbench from './components/Workbench.vue'
import Profile from './components/Profile.vue'
import { getApplicatioInfo } from '@/api/user.js'

// 状态栏高度
const statusBarHeight = ref(0)

// 当前选中的Tab索引
const currentTabIndex = ref(0)

// 申请信息
const applicationInfo = ref(null)

onMounted(() => {
  // 获取系统信息
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 0
  
  // 加载申请信息
  loadApplicationInfo()
})

// 加载申请信息
const loadApplicationInfo = async () => {
  try {
    console.log('开始请求申请信息')
    const response = await getApplicatioInfo()
    console.log('申请信息请求成功:', response)
    
    if (response.data && response.data.code === 0) {
      applicationInfo.value = response.data.data
      console.log('申请信息:', applicationInfo.value)
    } else {
      console.warn('获取申请信息失败:', response.data?.msg || '未知错误')
    }
  } catch (error) {
    console.error('获取申请信息失败:', error)
  }
}

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
</script>

<style lang="scss" scoped>
.partner-container {
  height: 100vh;
  background: #F7F8FA;
  display: flex;
  flex-direction: column;
}

.status-bar {
  background: #FFFFFF;
}

.nav-bar {
  background: #FFFFFF;
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
  color: #1A1A1A;
  font-weight: 500;
  margin-left: 8rpx;
}

.nav-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
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

/* 底部TabBar样式 */
.tab-bar {
  background: #FFFFFF;
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
  color: #666666;
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
  color: #7363FF;
  font-weight: 600;
}
</style> 