<template>
  <view class="partner-container" v-if="userStore.switch == 1">

    
    <!-- 主内容区域 -->
    <view class="main-content">
      <!-- 加载状态 -->
      <view v-if="!dataReady" class="loading-container">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 页面内容 - 使用scroll-view实现下拉刷新 -->
      <scroll-view
        v-else
        class="content-scroll"
        scroll-y="true"
        :refresher-enabled="true"
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
        @refresherrestore="onRefreshRestore"
        @refresherabort="onRefreshAbort"
      >
        <view class="scroll-content">
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
              <Profile :applicationInfo="applicationInfo" />
            </swiper-item>
          </swiper>
        </view>
      </scroll-view>
    </view>
    
    <!-- 底部TabBar -->
    <view v-if="dataReady" class="tab-bar">
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
          :src="currentTabIndex === 1 ? '/static/icons/tabbar/profile-fill.png' : '/static/icons/tabbar/profile.png'"
          class="tab-icon"
          mode="aspectFit"
        />
        <text class="tab-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Workbench from './components/Workbench.vue'
import Profile from './components/Profile.vue'
import { getApplicatioInfo } from '@/api/user.js'
import { useLevelStore } from '@/stores/level.js'
import { useUserStore } from '@/stores/user.js'
// 用户状态管理
const userStore = useUserStore()
const levelStore = useLevelStore()

// 状态栏高度
const statusBarHeight = ref(0)

// 当前选中的Tab索引
const currentTabIndex = ref(0)

// 申请信息
const applicationInfo = ref(null)

// 数据加载状态
const dataReady = ref(false)

// 下拉刷新状态
const refreshing = ref(false)

onMounted(() => {
  // 获取系统信息
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 0
  
  // 加载申请信息
  loadApplicationInfo()
  
  // 监听申请状态变化事件
  uni.$on('applicationStatusChanged', handleApplicationStatusChanged)
  
  // 监听刷新申请信息事件
  uni.$on('refreshApplicationInfo', handleRefreshApplicationInfo)
})

onUnmounted(() => {
  // 移除事件监听
  uni.$off('applicationStatusChanged', handleApplicationStatusChanged)
  uni.$off('refreshApplicationInfo', handleRefreshApplicationInfo)
})

// 处理申请状态变化事件
const handleApplicationStatusChanged = (event) => {
  console.log('收到申请状态变化事件:', event)
  
  if (event.type === 'video_uploaded') {
    // 视频上传成功，刷新申请信息
    console.log('视频上传成功，刷新申请信息')
    loadApplicationInfo()
    
    // 清除等级列表缓存，确保获取最新的等级信息
    levelStore.clearServiceLevels()
    
    // 显示成功提示
    // uni.showToast({
    //   title: event.message || '操作成功',
    //   icon: 'none'
    // })
  }
}

// 处理刷新申请信息事件
const handleRefreshApplicationInfo = () => {
  console.log('收到刷新申请信息事件')
  loadApplicationInfo()
}

// 下拉刷新处理
const onRefresh = async () => {
  console.log('开始下拉刷新')
  refreshing.value = true
  
  try {
    // 重新加载申请信息
    await loadApplicationInfo()
    
 
  } catch (error) {
    console.error('下拉刷新失败:', error)
    
    // 显示刷新失败提示
    uni.showToast({
      title: '刷新失败，请重试',
      icon: 'error',
      duration: 2000
    })
  } finally {
    // 延迟结束刷新状态，让用户看到刷新完成
    setTimeout(() => {
      refreshing.value = false
    }, 500)
  }
}

// 刷新状态恢复
const onRefreshRestore = () => {
  console.log('刷新状态恢复')
}

// 刷新状态中止
const onRefreshAbort = () => {
  console.log('刷新状态中止')
  refreshing.value = false
}

// 加载申请信息
const loadApplicationInfo = async () => {
  try {
    console.log('开始请求申请信息')
    const response = await getApplicatioInfo()
    console.log('申请信息请求成功:', response)
    
    if (response.data && response.data.code === 0) {
      applicationInfo.value = response.data.data
      console.log('申请信息:', applicationInfo.value)
      
      // 数据加载完成，设置准备状态
      dataReady.value = true
      console.log('数据准备完成，可以渲染Workbench组件')
    } else {
      console.warn('获取申请信息失败:', response.data?.msg || '未知错误')
      // 即使失败也要设置准备状态，避免无限加载
      dataReady.value = true
      
      // 抛出错误，让调用方知道刷新失败
      throw new Error(response.data?.msg || '获取申请信息失败')
    }
  } catch (error) {
    console.error('获取申请信息失败:', error)
    // 即使失败也要设置准备状态，避免无限加载
    dataReady.value = true
    
    // 重新抛出错误
    throw error
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

// 加载状态样式
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #F7F8FA;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #E5E5E5;
  border-top: 4rpx solid #7363FF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: #666666;
  font-weight: 500;
}

// 内容滚动区域
.content-scroll {
  height: 100%;
  background: #F7F8FA;
}

.scroll-content {
  min-height: 100%;
}

.content-swiper {
  height: calc(100vh - 88rpx - 60rpx);
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