<template>
  <view class="record-container">
    <scroll-view 
      scroll-y 
      class="scroll-container"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <!-- 提现记录列表 -->
      <view class="withdraw-records-list">
        <view 
          v-for="(item, index) in withdrawRecords" 
          :key="index" 
          class="record-item"
          @click="goToRecordDetail(item)"
        >
          <!-- 左侧图标 -->
          <view class="record-icon-section">
            <view class="record-icon">
              <image 
                src="/static/icons/profile/yue.png" 
                class="icon-image" 
                mode="aspectFit"
              />
            </view>
          </view>
          
          <!-- 中间提现信息 -->
          <view class="record-info-section">
            <view class="record-description">提现到微信零钱</view>
            <view class="record-time">{{ formatTime(item.created_at) }}</view>
          </view>
          
          <!-- 右侧金额和状态 -->
          <view class="record-amount-section">
            <view class="amount-text">-{{ formatAmount(item.amount) }}</view>
            <view class="status-text">
              <text v-if="item.transfer_state === 'FAIL' && item.fail_reason === 'OVERDUE_CLOSE'">
                超时未完成确认收款，余额已退回
              </text>
              <text v-else-if="item.transfer_state === 'FAIL'">
                提现失败
              </text>
              <text v-else>
                {{ item.transfer_state_desc || '' }}
              </text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 加载更多提示 -->
      <view v-if="hasMore && !loading" class="load-more">
        <text class="load-more-text">上拉加载更多</text>
      </view>
      
      <!-- 加载中提示 -->
      <view v-if="loading && currentPage > 1" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 没有更多数据提示 -->
      <view v-if="!hasMore && withdrawRecords.length > 0" class="no-more">
        <text class="no-more-text">没有更多数据了</text>
      </view>
      
      <!-- 空状态 -->
      <view v-if="withdrawRecords.length === 0 && !loading" class="empty-state">
        <text class="empty-text">暂无提现记录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getWithdrawRecords } from '@/api/user.js'

// 响应式数据
const withdrawRecords = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const refreshing = ref(false)
const loading = ref(false)
const hasMore = ref(true)

// 获取提现记录
const fetchWithdrawRecords = async () => {
  loading.value = true
  try {
    const result = await getWithdrawRecords({
      page: currentPage.value,
      page_size: pageSize.value
    })
    if (result.data && result.data.code === 0) {
      // 从响应中提取list数组
      const newData = result.data.data?.list || []
      
      if (currentPage.value === 1) {
        // 第一页：替换数据
        withdrawRecords.value = newData
      } else {
        // 其他页：追加数据
        withdrawRecords.value = [...withdrawRecords.value, ...newData]
      }
      
      console.log('提现记录:', withdrawRecords.value)
      hasMore.value = newData.length === pageSize.value // 判断是否还有更多数据
    } else {
      hasMore.value = false // 没有更多数据
    }
  } catch (error) {
    console.error('获取提现记录失败:', error)
  } finally {
    loading.value = false
  }
}

// 刷新数据
const onRefresh = async () => {
  refreshing.value = true
  try {
    // 重置到第一页
    currentPage.value = 1
    await fetchWithdrawRecords()
  } catch (error) {
    uni.showToast({
      title: '刷新失败',
      icon: 'none',
      duration: 1500
    })
  } finally {
    refreshing.value = false
  }
}

// 加载更多数据
const onLoadMore = async () => {
  if (loading.value || !hasMore.value) return
  currentPage.value++
  await fetchWithdrawRecords()
}

// 跳转到提现记录详情
const goToRecordDetail = (item) => {
  uni.navigateTo({
    url: `/subPackages/balance/record-detail?data=${encodeURIComponent(JSON.stringify(item))}`
  })
}

// 格式化金额（分转元）
const formatAmount = (amountInCents) => {
  if (!amountInCents && amountInCents !== 0) return '0.00'
  return (amountInCents / 100).toFixed(2)
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
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
  fetchWithdrawRecords()
})
</script>

<style lang="scss" scoped>
.record-container {
  background: #ffffff;
  height: 100vh;
}

.scroll-container {
  height: 100%;
}

.withdraw-records-list { 
  padding: 0rpx 20rpx;
  
  .record-item {
    display: flex;
    align-items: center;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .record-icon-section {
    margin-right: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .record-icon {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8rpx;
      
      .icon-image {
        width: 60rpx;
        height: 60rpx;
        border-radius: 30rpx;
      }
    }
  }
  
  .record-info-section {
    flex: 1;
    margin-right: 20rpx;
    
    .record-description {
      font-size: 28rpx;
      color: #1a1a1a;
      margin-bottom: 8rpx;
      font-weight: 500;
    }
    
    .record-time {
      font-size: 24rpx;
      color: #666666;
    }
  }
  
  .record-amount-section {
    text-align: right;
    
    .amount-text {
      font-size: 32rpx;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 8rpx;
    }
    
    .status-text {
      font-size: 24rpx;
      color: #666666;
    }
  }
}

.load-more, .loading-more, .no-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #999999;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
  
  .empty-text {
    font-size: 28rpx;
    color: #999999;
  }
}
</style>