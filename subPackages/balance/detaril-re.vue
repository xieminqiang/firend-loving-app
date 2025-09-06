<template>
  <view class="detail-container">
    <!-- 交易状态卡片 -->
    <view class="status-card">
      <view class="status-icon">
        <image 
          :src="recordData.change_amount > 0 ? '/static/icons/common/chongzhi.png' : '/static/icons/common/koukuan.png'" 
          class="icon-image" 
          mode="aspectFit"
        />
      </view>
      <view class="status-info">
        <view class="status-title">
          {{ recordData.change_amount > 0 ? '收入' : '支出' }}
        </view>
        <view class="status-amount" :class="{ 'positive': recordData.change_amount > 0, 'negative': recordData.change_amount < 0 }">
          {{ recordData.change_amount > 0 ? '+' : '' }}{{ formatAmount(recordData.change_amount) }}
        </view>
        <view class="status-text">{{ recordData.remark || '交易记录' }}</view>
      </view>
    </view>

    <!-- 详细信息列表 -->
    <view class="info-list">
      <view class="info-item">
        <view class="info-label">商户单号</view>
        <view class="info-value">{{ recordData.out_bill_no || '暂无' }}</view>
      </view>
      
      <view class="info-item">
        <view class="info-label">更新时间</view>
        <view class="info-value">{{ formatTime(recordData.created_at) }}</view>
      </view>
      
   
      <view class="info-item">
        <view class="info-label">交易金额</view>
        <view class="info-value amount" :class="{ 'positive': recordData.change_amount > 0, 'negative': recordData.change_amount < 0 }">
          ¥{{ formatAmount(Math.abs(recordData.change_amount)) }}
        </view>
      </view>
      
    
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式数据
const recordData = ref({})

// 获取页面参数
const getPageData = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const data = currentPage.options?.data
  
  if (data) {
    try {
      recordData.value = JSON.parse(decodeURIComponent(data))
      console.log('余额明细详情:', recordData.value)
    } catch (error) {
      console.error('解析数据失败:', error)
      uni.showToast({
        title: '数据解析失败',
        icon: 'none'
      })
    }
  }
}

// 格式化金额（分转元）
const formatAmount = (amountInCents) => {
  if (!amountInCents && amountInCents !== 0) return '0.00'
  return (amountInCents / 100).toFixed(2)
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return '暂无'
  const date = new Date(timeStr)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString()
  const day = date.getDate().toString()
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${year}年${month}月${day}日 ${hour}:${minute}`
}

// 组件挂载时获取数据
onMounted(() => {
  getPageData()
})
</script>

<style lang="scss" scoped>
.detail-container {
  background: #f8f8f8;
  min-height: 100vh;
  padding: 20rpx;
}

.status-card {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  
  .status-icon {
    margin-right: 30rpx;
    
    .icon-image {
      width: 80rpx;
      height: 80rpx;
      border-radius: 40rpx;
    }
  }
  
  .status-info {
    flex: 1;
    
    .status-title {
      font-size: 28rpx;
      color: #666666;
      margin-bottom: 16rpx;
    }
    
    .status-amount {
      font-size: 48rpx;
      font-weight: 700;
      margin-bottom: 16rpx;
      
      &.positive {
        color: #ffa502;
      }
      
      &.negative {
        color: #1a1a1a;
      }
    }
    
    .status-text {
      font-size: 24rpx;
      color: #666666;
    }
  }
}

.info-list {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 0 40rpx;
  
  .info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
    
    .info-label {
      font-size: 28rpx;
      color: #666666;
      font-weight: 500;
    }
    
    .info-value {
      font-size: 28rpx;
      color: #1a1a1a;
      text-align: right;
      max-width: 400rpx;
      word-break: break-all;
      
      &.amount {
        font-weight: 600;
        
        &.positive {
          color: #ffa502;
        }
        
        &.negative {
          color: #1a1a1a;
        }
      }
    }
  }
}
</style>