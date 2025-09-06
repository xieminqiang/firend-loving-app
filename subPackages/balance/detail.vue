<template>
  <view class="detail-container">
    <scroll-view 
      scroll-y 
      class="scroll-container"
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoadMore"
    >
      <!-- 余额明细列表 -->
      <view class="balance-logs-list">
        <view 
          v-for="(item, index) in balanceLogs" 
          :key="index" 
          class="log-item"
          @click="goToDetailRe(item)"
        >
          <!-- 左侧图标和子文本 -->
          <view class="log-icon-section">
            <view class="log-icon">
              <image 
                :src="item.change_amount > 0 ? '/static/icons/common/chongzhi.png' : '/static/icons/common/koukuan.png'" 
                class="icon-image" 
                mode="aspectFit"
              />
            </view>
          </view>
          
          <!-- 中间交易描述和时间 -->
          <view class="log-info-section">
            <view class="log-description">{{ item.remark || '' }}</view>
            <view class="log-time">{{ formatTime(item.created_at) }}</view>
          </view>
          
          <!-- 右侧金额 -->
          <view class="log-amount-section">
            <text 
              class="amount-text" 
              :class="{ 'positive': item.change_amount > 0, 'negative': item.change_amount < 0 }"
            >
              {{ item.change_amount > 0 ? '+' : '' }}{{ formatAmount(item.change_amount) }}
            </text>
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
      <view v-if="!hasMore && balanceLogs.length > 0" class="no-more">
        <text class="no-more-text">没有更多数据了</text>
      </view>
      
      <!-- 空状态 -->
      <view v-if="balanceLogs.length === 0 && !loading" class="empty-state">
        <text class="empty-text">暂无余额明细</text>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getBalanceLogs } from '@/api/user.js'

// 响应式数据
const balanceLogs = ref([])
const currentPage = ref(1)
const pageSize = ref(20)
const refreshing = ref(false)
const loading = ref(false)
const hasMore = ref(true) // 新增：用于判断是否还有更多数据

// 获取余额明细
const fetchBalanceLogs = async () => {
  loading.value = true
  try {
    const result = await getBalanceLogs({
      page: currentPage.value,
      page_size: pageSize.value
    })
    if (result.data && result.data.code === 0) {
      // 从响应中提取list数组
      const newData = result.data.data?.list || []
      
      if (currentPage.value === 1) {
        // 第一页：替换数据
        balanceLogs.value = newData
      } else {
        // 其他页：追加数据
        balanceLogs.value = [...balanceLogs.value, ...newData]
      }
      
      console.log('余额明细:', balanceLogs.value)
      hasMore.value = newData.length === pageSize.value // 判断是否还有更多数据
    } else {
      hasMore.value = false // 没有更多数据
    }
  } catch (error) {
    console.error('获取余额明细失败:', error)
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
    await fetchBalanceLogs()
 
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
  await fetchBalanceLogs()
}

// 跳转到余额明细详情
const goToDetailRe = (item) => {
  uni.navigateTo({
    url: `/subPackages/balance/detaril-re?data=${encodeURIComponent(JSON.stringify(item))}`
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
  fetchBalanceLogs()
})
</script>

<style lang="scss" scoped>
.detail-container {
  
  background: #ffffff;
  height: 100vh;
}

.scroll-container {
  height: 100%;
}

.balance-logs-list { 
    padding: 0rpx 20rpx;
  .log-item {
    display: flex;
    align-items: center;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  .log-icon-section {
    margin-right: 20rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .log-icon {
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
  
  .log-info-section {
    flex: 1;
    margin-right: 20rpx;
    
    .log-description {
      font-size: 28rpx;
      color: #1a1a1a;
      margin-bottom: 8rpx;
      font-weight: 500;
    }
    
    .log-time {
      font-size: 24rpx;
      color: #666666;
    }
  }
  
  .log-amount-section {
    .amount-text {
      font-size: 32rpx;
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