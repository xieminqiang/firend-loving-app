<template>
  <view class="data-edition-container">
    <!-- 顶部状态栏适配 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>
    
    <!-- 顶部导航栏 -->
    <view class="nav-bar">
      <view class="back-btn" @click="goBack">
        <image src="@/static/icons/common/arrow-left.png" class="back-icon" mode="aspectFit" />
        <text class="back-text">返回</text>
      </view>
      <text class="nav-title">资料编辑</text>
      <view class="nav-placeholder"></view>
    </view>
    
    <!-- 主内容区域 -->
    <view class="main-content">
      <view class="content-placeholder">
        <text class="placeholder-text">资料编辑功能开发中...</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 状态栏高度
const statusBarHeight = ref(0)

onMounted(() => {
  // 获取系统信息
  const info = uni.getSystemInfoSync()
  statusBarHeight.value = info.statusBarHeight || 0
})

// 返回上一步
const goBack = () => {
  uni.navigateBack()
}
</script>

<style lang="scss" scoped>
.data-edition-container {
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-placeholder {
  text-align: center;
}

.placeholder-text {
  font-size: 28rpx;
  color: #666666;
  font-weight: 500;
}
</style> 