<template>
  <view class="account-container">
    <view class="header">
      <text class="title">账户设置</text>
    </view>
    <view class="content">
      <text class="placeholder">账户设置功能待开发</text>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 页面数据
const accountInfo = ref({})

onMounted(() => {
  console.log('账户设置页面加载完成')
})
</script>

<style lang="scss" scoped>
.account-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  
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