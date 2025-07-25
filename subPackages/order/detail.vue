<template>
  <view class="order-container">
    <!-- 状态筛选栏 -->
    <view class="status-filter">
      <scroll-view class="filter-scroll" scroll-x="true" show-scrollbar="false">
        <view class="filter-tabs">
          <view 
            v-for="(tab, index) in statusTabs" 
            :key="index"
            class="filter-tab"
            :class="{ active: currentStatus === tab.value }"
            @click="switchStatus(tab.value)"
          >
            <text class="tab-text">{{ tab.label }}</text>
            <view v-if="tab.count > 0" class="tab-badge">{{ tab.count }}</view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 订单列表 -->
    <scroll-view 
      class="order-list"
      scroll-y="true"
      refresher-enabled="true"
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh"
      @refresherrestore="onRefreshRestore"
      @scrolltolower="loadMore"
    >
      <!-- 空状态 -->
      <view v-if="orderList.length === 0 && !isLoading" class="empty-state">
        <image src="@/static/images/empty.png" class="empty-image" mode="aspectFit" />
        <text class="empty-text">暂无订单</text>
        <text class="empty-desc">快去发现更多精彩服务吧</text>
      </view>

      <!-- 订单卡片列表 -->
      <view v-else class="order-cards">
        <view 
          v-for="order in orderList" 
          :key="order.id"
          class="order-card"
          @click="navigateToDetail(order.id)"
        >
          <!-- 订单头部 -->
          <view class="order-header">
            <view class="order-info">
              <text class="order-number">订单号：{{ order.orderNo }}</text>
              <text class="order-time">{{ formatTime(order.createTime) }}</text>
            </view>
            <view class="order-status" :class="getStatusClass(order.status)">
              <text class="status-text">{{ getStatusText(order.status) }}</text>
            </view>
          </view>

          <!-- 服务信息 -->
          <view class="service-info">
            <image :src="order.serviceImage" class="service-image" mode="aspectFill" />
            <view class="service-details">
              <text class="service-name">{{ order.serviceName }}</text>
              <text class="service-desc">{{ order.serviceDesc }}</text>
              <view class="service-meta">
                <text class="service-duration">{{ order.duration }}分钟</text>
                <text class="service-price">¥{{ order.price }}</text>
              </view>
            </view>
          </view>

          <!-- 友伴师信息 -->
          <view v-if="order.partner" class="partner-info">
            <image :src="order.partner.avatar" class="partner-avatar" mode="aspectFill" />
            <view class="partner-details">
              <text class="partner-name">{{ order.partner.name }}</text>
              <view class="partner-rating">
                <text class="rating-text">{{ order.partner.rating }}分</text>
                <text class="rating-count">({{ order.partner.orderCount }}单)</text>
              </view>
            </view>
          </view>

          <!-- 订单金额 -->
          <view class="order-amount">
            <text class="amount-label">订单金额</text>
            <text class="amount-value">¥{{ order.totalAmount }}</text>
          </view>

          <!-- 操作按钮 -->
          <view class="order-actions">
            <view 
              v-for="(action, actionIndex) in getOrderActions(order.status)" 
              :key="actionIndex"
              class="action-btn"
              :class="action.type"
              @click.stop="handleOrderAction(action.action, order)"
            >
              <text class="action-text">{{ action.text }}</text>
            </view>
          </view>
        </view>

        <!-- 加载更多 -->
        <view v-if="hasMore && orderList.length > 0" class="load-more">
          <text v-if="isLoadingMore" class="loading-text">加载中...</text>
          <text v-else class="load-more-text">上拉加载更多</text>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user.js'

// 用户状态管理
const userStore = useUserStore()

// 页面状态
const currentStatus = ref('all')
const isRefreshing = ref(false)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(10)

// 订单列表数据
const orderList = ref([])

// 状态筛选标签
const statusTabs = ref([
  { label: '全部', value: 'all', count: 0 },
  { label: '待付款', value: 'pending', count: 0 },
  { label: '待服务', value: 'to-serve', count: 0 },
  { label: '进行中', value: 'in-progress', count: 0 },
  { label: '已完成', value: 'completed', count: 0 },
  { label: '待评价', value: 'to-review', count: 0 }
])

// 模拟订单数据
const mockOrders = [
  {
    id: 1,
    orderNo: 'SBX20241201001',
    status: 'pending',
    createTime: '2024-12-01 14:30:00',
    serviceName: '陪伴聊天',
    serviceDesc: '专业陪伴，温暖聊天',
    serviceImage: '/static/images/empty.png',
    duration: 60,
    price: 100,
    totalAmount: 100,
    partner: null
  },
  {
    id: 2,
    orderNo: 'SBX20241201002',
    status: 'to-serve',
    createTime: '2024-12-01 15:00:00',
    serviceName: '约会陪伴',
    serviceDesc: '浪漫约会，美好回忆',
    serviceImage: '/static/images/empty.png',
    duration: 120,
    price: 200,
    totalAmount: 200,
    partner: {
      name: '小美',
      avatar: '/static/images/empty.png',
      rating: 4.8,
      orderCount: 156
    }
  },
  {
    id: 3,
    orderNo: 'SBX20241201003',
    status: 'in-progress',
    createTime: '2024-12-01 16:00:00',
    serviceName: '逛街陪伴',
    serviceDesc: '购物达人，时尚搭配',
    serviceImage: '/static/images/empty.png',
    duration: 90,
    price: 150,
    totalAmount: 150,
    partner: {
      name: '小丽',
      avatar: '/static/images/empty.png',
      rating: 4.9,
      orderCount: 89
    }
  },
  {
    id: 4,
    orderNo: 'SBX20241201004',
    status: 'completed',
    createTime: '2024-12-01 17:00:00',
    serviceName: '电影陪伴',
    serviceDesc: '观影体验，情感交流',
    serviceImage: '/static/images/empty.png',
    duration: 150,
    price: 180,
    totalAmount: 180,
    partner: {
      name: '小芳',
      avatar: '/static/images/empty.png',
      rating: 4.7,
      orderCount: 234
    }
  },
  {
    id: 5,
    orderNo: 'SBX20241201005',
    status: 'to-review',
    createTime: '2024-12-01 18:00:00',
    serviceName: '咖啡陪伴',
    serviceDesc: '轻松聊天，心情愉悦',
    serviceImage: '/static/images/empty.png',
    duration: 60,
    price: 80,
    totalAmount: 80,
    partner: {
      name: '小雅',
      avatar: '/static/images/empty.png',
      rating: 4.6,
      orderCount: 67
    }
  }
]

onMounted(() => {
  loadOrderList()
  updateStatusCounts()
})

// 切换状态筛选
const switchStatus = (status) => {
  currentStatus.value = status
  page.value = 1
  hasMore.value = true
  orderList.value = []
  loadOrderList()
}

// 加载订单列表
const loadOrderList = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    // 模拟API请求
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 根据状态筛选订单
    let filteredOrders = mockOrders
    if (currentStatus.value !== 'all') {
      filteredOrders = mockOrders.filter(order => order.status === currentStatus.value)
    }
    
    // 分页处理
    const start = (page.value - 1) * pageSize.value
    const end = start + pageSize.value
    const pageOrders = filteredOrders.slice(start, end)
    
    if (page.value === 1) {
      orderList.value = pageOrders
    } else {
      orderList.value.push(...pageOrders)
    }
    
    hasMore.value = pageOrders.length === pageSize.value
  } catch (error) {
    console.error('加载订单列表失败:', error)
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 更新状态计数
const updateStatusCounts = () => {
  statusTabs.value.forEach(tab => {
    if (tab.value === 'all') {
      tab.count = mockOrders.length
    } else {
      tab.count = mockOrders.filter(order => order.status === tab.value).length
    }
  })
}

// 下拉刷新
const onRefresh = async () => {
  isRefreshing.value = true
  page.value = 1
  hasMore.value = true
  
  try {
    await loadOrderList()
    updateStatusCounts()
  } catch (error) {
    console.error('刷新失败:', error)
  } finally {
    isRefreshing.value = false
  }
}

const onRefreshRestore = () => {
  isRefreshing.value = false
}

// 加载更多
const loadMore = async () => {
  if (isLoadingMore.value || !hasMore.value) return
  
  isLoadingMore.value = true
  page.value++
  
  try {
    await loadOrderList()
  } catch (error) {
    console.error('加载更多失败:', error)
    page.value--
  } finally {
    isLoadingMore.value = false
  }
}

// 获取状态样式类
const getStatusClass = (status) => {
  const statusMap = {
    'pending': 'status-pending',
    'to-serve': 'status-to-serve',
    'in-progress': 'status-in-progress',
    'completed': 'status-completed',
    'to-review': 'status-to-review'
  }
  return statusMap[status] || 'status-default'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'pending': '待付款',
    'to-serve': '待服务',
    'in-progress': '进行中',
    'completed': '已完成',
    'to-review': '待评价'
  }
  return statusMap[status] || '未知状态'
}

// 获取订单操作按钮
const getOrderActions = (status) => {
  const actionMap = {
    'pending': [
      { text: '取消订单', action: 'cancel', type: 'secondary' },
      { text: '立即支付', action: 'pay', type: 'primary' }
    ],
    'to-serve': [
      { text: '取消订单', action: 'cancel', type: 'secondary' },
      { text: '联系友伴师', action: 'contact', type: 'primary' }
    ],
    'in-progress': [
      { text: '续钟', action: 'extend', type: 'primary' },
      { text: '联系友伴师', action: 'contact', type: 'secondary' }
    ],
    'completed': [
      { text: '再次预约', action: 'rebook', type: 'primary' }
    ],
    'to-review': [
      { text: '立即评价', action: 'review', type: 'primary' }
    ]
  }
  return actionMap[status] || []
}

// 处理订单操作
const handleOrderAction = (action, order) => {
  switch (action) {
    case 'cancel':
      handleCancelOrder(order)
      break
    case 'pay':
      handlePayOrder(order)
      break
    case 'contact':
      handleContactPartner(order)
      break
    case 'extend':
      handleExtendOrder(order)
      break
    case 'rebook':
      handleRebookOrder(order)
      break
    case 'review':
      handleReviewOrder(order)
      break
  }
}

// 取消订单
const handleCancelOrder = (order) => {
  uni.showModal({
    title: '取消订单',
    content: '确定要取消这个订单吗？',
    confirmText: '确定取消',
    cancelText: '再想想',
    success: (res) => {
      if (res.confirm) {
        // 调用取消订单API
        uni.showToast({
          title: '订单已取消',
          icon: 'success'
        })
        // 刷新列表
        onRefresh()
      }
    }
  })
}

// 支付订单
const handlePayOrder = (order) => {
  uni.navigateTo({
    url: `/subPackages/order/payment?orderId=${order.id}`
  })
}

// 联系友伴师
const handleContactPartner = (order) => {
  if (order.partner) {
    uni.showModal({
      title: '联系友伴师',
      content: `是否拨打 ${order.partner.name} 的电话？`,
      confirmText: '拨打',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 这里应该调用友伴师的电话
          uni.makePhoneCall({
            phoneNumber: '13800138000'
          })
        }
      }
    })
  }
}

// 续钟
const handleExtendOrder = (order) => {
  uni.navigateTo({
    url: `/subPackages/order/extend?orderId=${order.id}`
  })
}

// 再次预约
const handleRebookOrder = (order) => {
  uni.navigateTo({
    url: `/subPackages/order/rebook?orderId=${order.id}`
  })
}

// 评价订单
const handleReviewOrder = (order) => {
  uni.navigateTo({
    url: `/subPackages/order/review?orderId=${order.id}`
  })
}

// 跳转到订单详情
const navigateToDetail = (orderId) => {
  uni.navigateTo({
    url: `/subPackages/order/detail?orderId=${orderId}`
  })
}

// 格式化时间
const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now - date
  
  // 小于1分钟
  if (diff < 60000) {
    return '刚刚'
  }
  // 小于1小时
  if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  }
  // 小于24小时
  if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  }
  // 大于24小时
  return date.toLocaleDateString()
}
</script>

<style lang="scss" scoped>
.order-container {
  height: 100vh;
  background-color: #F7F8FA;
  display: flex;
  flex-direction: column;
}

/* 状态筛选栏 */
.status-filter {
  background: #FFFFFF;
  border-bottom: 1rpx solid #f0f0f0;
  padding: 0 32rpx;
  flex-shrink: 0;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-tabs {
  display: flex;
  padding: 24rpx 0;
}

.filter-tab {
  display: flex;
  align-items: center;
  padding: 12rpx 24rpx;
  margin-right: 16rpx;
  border-radius: 24rpx;
  background: #f8f9fa;
  border: 1rpx solid #e9ecef;
  transition: all 0.3s ease;
  position: relative;
  flex-shrink: 0;
}

.filter-tab.active {
  background: #7363FF;
  border-color: #7363FF;
  color: #FFFFFF;
}

.tab-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #666666;
}

.filter-tab.active .tab-text {
  color: #FFFFFF;
}

.tab-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: #ff4757;
  color: #FFFFFF;
  font-size: 20rpx;
  font-weight: 600;
  border-radius: 50%;
  min-width: 28rpx;
  height: 28rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2rpx solid #FFFFFF;
}

/* 订单列表 */
.order-list {
  flex: 1;
  padding: 24rpx;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-image {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 32rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 32rpx;
  color: #999999;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #cccccc;
}

/* 订单卡片 */
.order-cards {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.order-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #f0f0f0;
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.order-info {
  flex: 1;
}

.order-number {
  font-size: 28rpx;
  color: #1A1A1A;
  font-weight: 500;
  margin-bottom: 8rpx;
  display: block;
}

.order-time {
  font-size: 24rpx;
  color: #999999;
}

.order-status {
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-to-serve {
  background: #d1ecf1;
  color: #0c5460;
}

.status-in-progress {
  background: #d4edda;
  color: #155724;
}

.status-completed {
  background: #d1e7dd;
  color: #0f5132;
}

.status-to-review {
  background: #f8d7da;
  color: #721c24;
}

/* 服务信息 */
.service-info {
  display: flex;
  margin-bottom: 24rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.service-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.service-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.service-name {
  font-size: 30rpx;
  color: #1A1A1A;
  font-weight: 600;
  margin-bottom: 8rpx;
}

.service-desc {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 16rpx;
  line-height: 1.4;
}

.service-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.service-duration {
  font-size: 24rpx;
  color: #999999;
}

.service-price {
  font-size: 28rpx;
  color: #7363FF;
  font-weight: 600;
}

/* 友伴师信息 */
.partner-info {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.partner-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.partner-details {
  flex: 1;
}

.partner-name {
  font-size: 28rpx;
  color: #1A1A1A;
  font-weight: 500;
  margin-bottom: 8rpx;
  display: block;
}

.partner-rating {
  display: flex;
  align-items: center;
}

.rating-text {
  font-size: 24rpx;
  color: #ff9500;
  font-weight: 500;
  margin-right: 8rpx;
}

.rating-count {
  font-size: 22rpx;
  color: #999999;
}

/* 订单金额 */
.order-amount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.amount-label {
  font-size: 28rpx;
  color: #666666;
}

.amount-value {
  font-size: 32rpx;
  color: #1A1A1A;
  font-weight: 600;
}

/* 操作按钮 */
.order-actions {
  display: flex;
  gap: 16rpx;
  justify-content: flex-end;
}

.action-btn {
  padding: 16rpx 32rpx;
  border-radius: 24rpx;
  font-size: 26rpx;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1rpx solid;
}

.action-btn.primary {
  background: #7363FF;
  color: #FFFFFF;
  border-color: #7363FF;
}

.action-btn.primary:active {
  background: #6354e6;
  transform: scale(0.96);
}

.action-btn.secondary {
  background: #FFFFFF;
  color: #666666;
  border-color: #e9ecef;
}

.action-btn.secondary:active {
  background: #f8f9fa;
  transform: scale(0.96);
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 32rpx 0;
}

.loading-text,
.load-more-text {
  font-size: 26rpx;
  color: #999999;
}
</style>
