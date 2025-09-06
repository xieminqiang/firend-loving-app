<template>
  <view class="about-container">
    <view class="header">
      <text class="title">关于我们</text>
    </view>
    <view class="content">
      <text class="placeholder">关于我们页面待开发</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 页面数据
const appInfo = ref({})

onMounted(() => {
  console.log('关于我们页面加载完成')
})
</script>

<style lang="scss" scoped>
.about-container {
  min-height: 100vh;
  background-color: #F8F8F8;
  
  .header {
    padding: 20rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #eee;
    
    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
  }
  
  .content {
    padding: 40rpx 20rpx;
    text-align: center;
    
    .placeholder {
      color: #999;
      font-size: 28rpx;
    }
  }
}
</style> 