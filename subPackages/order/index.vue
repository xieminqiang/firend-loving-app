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
          <!-- 订单头部信息 -->
          <view class="order-header">
            <view class="order-left">
              <view class="partner-avatar">
                <image :src="order.partnerAvatar" mode="aspectFill" />
                <view class="partner-rating" v-if="order.partnerRating">
                  <text class="rating-text">{{ order.partnerRating }}</text>
                  <text class="star-icon">★</text>
                </view>
              </view>
              <view class="partner-info">
                <view class="partner-name">
                  <text>{{ order.partnerName }}</text>
                  <text class="partner-badge" v-if="order.isSuperPartner">超级友伴</text>
                </view>
                <text class="order-time">{{ order.createTime }}</text>
              </view>
            </view>
            <view class="order-status" :class="getStatusClass(order.status)">
              <text class="status-text">{{ getStatusText(order.status) }}</text>
            </view>
          </view>

          <!-- 订单内容 -->
          <view class="order-content">
            <view class="service-info">
              <text class="service-name">{{ order.serviceName }}</text>
              <text class="service-price">¥{{ order.price.toFixed(2) }}</text>
            </view>
            
            <!-- 服务标签 -->
            <view class="service-tags" v-if="order.tags && order.tags.length > 0">
              <text class="service-tag" v-for="(tag, index) in order.tags" :key="index">{{ tag }}</text>
            </view>

            <view class="service-details">
              <view class="detail-item">
                <text class="detail-label">时长：</text>
                <text class="detail-value">{{ order.duration }}小时</text>
              </view>
              <view class="detail-item">
                <text class="detail-label">预约时间：</text>
                <text class="detail-value">{{ order.appointmentTime }}</text>
              </view>
              <view class="detail-item" v-if="order.location">
                <text class="detail-label">服务地点：</text>
                <text class="detail-value">{{ order.location }}</text>
              </view>
              <view class="detail-item" v-if="order.orderNote">
                <text class="detail-label">备注：</text>
                <text class="detail-value note-text">{{ order.orderNote }}</text>
              </view>
            </view>

            <!-- 进度展示 -->
            <view class="order-progress" v-if="order.status === 'in-progress' && order.progress">
              <view class="progress-header">
                <text>服务进度</text>
                <text>{{ order.progress }}%</text>
              </view>
              <view class="progress-bar">
                <view class="progress-inner" :style="{width: order.progress + '%'}"></view>
              </view>
            </view>
          </view>

          <!-- 订单底部操作 -->
          <view class="order-footer">
            <view class="order-amount">
              <text class="amount-label">实付款</text>
              <text class="amount-value">¥{{ order.totalAmount.toFixed(2) }}</text>
              <text class="amount-detail" v-if="order.discount > 0">已优惠¥{{ order.discount.toFixed(2) }}</text>
            </view>
            <view class="order-actions">
              <!-- 根据状态显示不同按钮 -->
              <template v-if="order.status === 'pending'">
                <view class="countdown" v-if="order.expireTime">
                  <text class="countdown-label">支付剩余时间:</text>
                  <text class="countdown-value">{{ order.expireTime }}</text>
                </view>
                <view class="action-btn cancel-btn" @click.stop="handleCancelOrder(order)">取消订单</view>
                <view class="action-btn primary-btn" @click.stop="handlePayOrder(order)">立即支付</view>
              </template>
              <template v-else-if="order.status === 'to-serve'">
                <view class="action-btn default-btn" @click.stop="handleContactPartner(order)">
                  <text class="icon">💬</text> 联系友伴
                </view>
                <view class="action-btn primary-btn" @click.stop="handleModifyOrder(order)">修改订单</view>
              </template>
              <template v-else-if="order.status === 'in-progress'">
                <view class="action-btn default-btn" @click.stop="handleContactPartner(order)">
                  <text class="icon">💬</text> 联系友伴
                </view>
                <view class="action-btn primary-btn" @click.stop="handleConfirmComplete(order)">确认完成</view>
              </template>
              <template v-else-if="order.status === 'completed'">
                <view class="action-btn default-btn" @click.stop="handleOrderAgain(order)">再次预约</view>
                <view class="action-btn primary-btn" @click.stop="navigateToDetail(order.id)">查看详情</view>
              </template>
              <template v-else-if="order.status === 'to-review'">
                <view class="action-btn default-btn" @click.stop="handleOrderAgain(order)">再次预约</view>
                <view class="action-btn primary-btn" @click.stop="handleReviewOrder(order)">
                  <text class="icon">⭐</text> 立即评价
                </view>
              </template>
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
    id: 'O20230001',
    partnerName: '小王',
    partnerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80',
    partnerRating: 4.9,
    isSuperPartner: true,
    serviceName: '家居顾问 - 高级套餐',
    tags: ['专业指导', '首次优惠'],
    createTime: '2023-09-01 14:30',
    status: 'pending',
    price: 150,
    duration: 2,
    appointmentTime: '2023-09-10 10:00',
    location: '用户指定地点',
    totalAmount: 300,
    discount: 50,
    expireTime: '23:45:30',
    orderNote: ''
  },
  {
    id: 'O20230002',
    partnerName: '张琳',
    partnerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
    partnerRating: 4.8,
    serviceName: '摄影师 - 人像写真',
    tags: ['室外拍摄', '提供化妆'],
    createTime: '2023-08-25 09:15',
    status: 'to-serve',
    price: 200,
    duration: 1.5,
    appointmentTime: '2023-09-05 14:00',
    location: '市中心摄影棚',
    totalAmount: 300,
    discount: 0,
    orderNote: ''
  },
  {
    id: 'O20230003',
    partnerName: '李明',
    partnerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
    partnerRating: 4.7,
    serviceName: 'K歌达人 - 专业指导',
    tags: ['一对一指导', '录音'],
    createTime: '2023-08-20 18:30',
    status: 'in-progress',
    price: 120,
    duration: 3,
    appointmentTime: '2023-09-02 19:00',
    location: '城西KTV',
    totalAmount: 360,
    discount: 0,
    progress: 75,
    orderNote: '需要提前准备歌单'
  },
  {
    id: 'O20230004',
    partnerName: '王芳',
    partnerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
    partnerRating: 5.0,
    isSuperPartner: true,
    serviceName: '心理咨询 - 标准课程',
    tags: ['资深心理师', '保密咨询'],
    createTime: '2023-08-15 10:00',
    status: 'completed',
    price: 300,
    duration: 1,
    appointmentTime: '2023-08-20 15:30',
    location: '线上视频',
    totalAmount: 300,
    discount: 0,
    orderNote: ''
  },
  {
    id: 'O20230005',
    partnerName: '陈磊',
    partnerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
    partnerRating: 4.6,
    serviceName: '健身教练 - 私人定制',
    tags: ['器械训练', '体能提升'],
    createTime: '2023-08-10 08:45',
    status: 'to-review',
    price: 180,
    duration: 1.5,
    appointmentTime: '2023-08-18 10:00',
    location: '悦动健身中心',
    totalAmount: 270,
    discount: 0,
    orderNote: ''
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

// 处理订单操作
const handleModifyOrder = (order) => {
  console.log('修改订单', order.id)
  uni.showToast({
    title: '修改订单功能开发中',
    icon: 'none'
  })
}

const handleConfirmComplete = (order) => {
  console.log('确认完成', order.id)
  uni.showModal({
    title: '确认完成',
    content: '确认服务已完成吗？',
    confirmText: '确认',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '服务已完成',
          icon: 'success'
        })
        // 刷新列表
        onRefresh()
      }
    }
  })
}

const handleOrderAgain = (order) => {
  console.log('再次预约', order.id)
  uni.showToast({
    title: '再次预约功能开发中',
    icon: 'none'
  })
}

// 取消订单
const handleCancelOrder = (order) => {
  uni.showModal({
    title: '取消订单',
    content: `确定要取消订单 ${order.id} 吗？`,
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
  console.log('支付订单', order.id)
  uni.showToast({
    title: '支付功能开发中',
    icon: 'none'
  })
}

// 联系友伴师
const handleContactPartner = (order) => {
  uni.showModal({
    title: '联系友伴师',
    content: `是否拨打 ${order.partnerName} 的电话？`,
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

// 续钟
const handleExtendOrder = (order) => {
  console.log('续钟', order.id)
  uni.showToast({
    title: '续钟功能开发中',
    icon: 'none'
  })
}

// 再次预约
const handleRebookOrder = (order) => {
  console.log('再次预约', order.id)
  uni.showToast({
    title: '再次预约功能开发中',
    icon: 'none'
  })
}

// 评价订单
const handleReviewOrder = (order) => {
  console.log('评价订单', order.id)
  uni.showToast({
    title: '评价功能开发中',
    icon: 'none'
  })
}

// 跳转到订单详情
const navigateToDetail = (orderId) => {
  console.log('查看订单详情', orderId)
  uni.showToast({
    title: '订单详情功能开发中',
    icon: 'none'
  })
}

// 格式化时间
const formatTime = (timeStr) => {
  return timeStr // 直接返回时间字符串，因为已经是格式化好的
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
  flex-shrink: 0;
}

.filter-scroll {
  white-space: nowrap;
}

.filter-tabs {
  display: flex;
  padding: 24rpx 0;
  justify-content: space-around;
}

.filter-tab {
  display: flex;
  align-items: center;
  padding: 12rpx 16rpx;
  transition: all 0.3s ease;
  position: relative;
  flex: 1;
  justify-content: center;
}

.filter-tab.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50rpx;
  height: 6rpx;
  background: #7363FF;
  border-radius: 3rpx;
}

.tab-text {
  font-size: 28rpx;
  font-weight: 500;
  color: #666666;
  transition: color 0.3s ease;
}

.filter-tab.active .tab-text {
  color: #7363FF;
  font-weight: 600;
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
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.1);
  border: 1rpx solid #f0f0f0;
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.order-left {
  display: flex;
  align-items: center;
}

.partner-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 24rpx;
  border: 1rpx solid #eee;
  position: relative;
}

.partner-avatar image {
  width: 100%;
  height: 100%;
}

.partner-rating {
  position: absolute;
  bottom: -4rpx;
  right: -4rpx;
  background: #ffbb00;
  color: white;
  border-radius: 20rpx;
  font-size: 20rpx;
  padding: 2rpx 8rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.2);
  font-weight: 600;
}

.rating-text {
  font-size: 20rpx;
  margin-right: 4rpx;
}

.star-icon {
  font-size: 16rpx;
}

.partner-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
  display: flex;
  align-items: center;
}

.partner-badge {
  font-size: 20rpx;
  background: linear-gradient(90deg, #7363FF 0%, #8b5cf6 100%);
  color: white;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  margin-left: 12rpx;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-status {
  font-size: 28rpx;
  font-weight: 500;
}

.status-pending {
  color: #f59e0b;
}

.status-to-serve {
  color: #7363FF;
}

.status-in-progress {
  color: #3b82f6;
}

.status-completed {
  color: #10b981;
}

.status-to-review {
  color: #ec4899;
}

.status-cancelled {
  color: #9ca3af;
}

/* 订单内容 */
.order-content {
  padding: 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.service-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.service-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.service-price {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

/* 服务标签 */
.service-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.service-tag {
  background: #f0f2fd;
  border-radius: 20rpx;
  padding: 4rpx 16rpx;
  font-size: 22rpx;
  color: #7363FF;
}

.service-details {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.detail-item {
  font-size: 26rpx;
  color: #666;
}

.detail-label {
  color: #999;
  margin-right: 8rpx;
}

.note-text {
  color: #777;
  font-style: italic;
}

/* 进度条 */
.order-progress {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx dashed #eee;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 12rpx;
}

.progress-bar {
  height: 12rpx;
  background: #f0f2fd;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background: linear-gradient(90deg, #7363FF 0%, #8b5cf6 100%);
  border-radius: 6rpx;
}

/* 订单底部 */
.order-footer {
  padding: 32rpx;
}

.order-amount {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 32rpx;
}

.amount-label {
  font-size: 28rpx;
  color: #666;
  margin-right: 16rpx;
}

.amount-value {
  font-size: 36rpx;
  font-weight: 600;
  color: #f43f5e;
}

.amount-detail {
  font-size: 24rpx;
  color: #999;
  margin-left: 16rpx;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 24rpx;
  align-items: center;
  flex-wrap: wrap;
}

.countdown {
  padding: 8rpx 16rpx;
  background: #fff5f5;
  color: #f43f5e;
  border-radius: 20rpx;
  font-size: 24rpx;
  margin-right: auto;
}

.countdown-label {
  margin-right: 8rpx;
}

.countdown-value {
  font-weight: 600;
}

.action-btn {
  padding: 16rpx 32rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;
  cursor: pointer;
  border: 1rpx solid;
  display: flex;
  align-items: center;
}

.action-btn .icon {
  margin-right: 8rpx;
}

.cancel-btn {
  border: 1rpx solid #d1d5db;
  background: white;
  color: #6b7280;
}

.default-btn {
  border: 1rpx solid #d1d5db;
  background: white;
  color: #6b7280;
}

.primary-btn {
  background: linear-gradient(90deg, #7363FF 0%, #8b5cf6 100%);
  color: white;
  box-shadow: 0 4rpx 16rpx rgba(115, 99, 255, 0.2);
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
