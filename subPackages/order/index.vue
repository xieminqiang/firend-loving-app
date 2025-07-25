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
          <!-- 订单头部（重构：左侧服务名和描述，右侧状态） -->
          <view class="order-header">
            <view class="order-info">
              <text class="service-name">{{ order.service_name }}</text>
              <!-- <text class="service-desc">{{ order.service_address }}</text> -->
            </view>
            <view class="order-status" :class="getStatusClass(order.status)">
              <text class="status-text">{{ getStatusText(order.status) }}</text>
            </view>
          </view>

          <!-- 服务信息和订单金额 -->
          <view class="service-amount-row">
            <view class="service-info">
              <image :src="$imgBaseUrl + order.service_image_url" class="service-image" mode="aspectFill" />
              <view class="service-details">
                <view class="service-meta">
                  
                  <text class="service-price">¥{{ order.unit_price }}/{{ order.unit }}</text>
                  <text class="service-duration">x{{ order.quantity }}</text>
                </view>
                <view class="order-amount">
              <text class="amount-label">{{ getAmountLabel(order.status) }}</text>
              <text class="amount-value">¥{{ order.total_amount }}</text>
            </view>
              </view>
            </view>
           
          </view>

          <!-- 下单时间 -->
          <view class="order-time-info">
            <text class="time-label">下单时间</text>
            <text class="time-value">{{ formatTime(order.created_at) }}</text>
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
import { getOrderList } from '@/api/order.js'

// 用户状态管理
const userStore = useUserStore()

// 页面状态
const currentStatus = ref('all')
const isRefreshing = ref(false)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(20)

// 订单列表数据缓存
const orderListCache = ref({})
const orderList = ref([])

// 状态筛选标签
const statusTabs = ref([
  { label: '全部', value: 'all', count: 0 },
  { label: '待付款', value: 'pending_payment', count: 0 },
  { label: '待服务', value: 'pending_service', count: 0 },
  { label: '进行中', value: 'in_service', count: 0 },
  { label: '已完成', value: 'completed', count: 0 }
])



onMounted(() => {
  // 首次加载时只加载当前状态的数据，计数会在loadOrderList中自动更新
  loadOrderList()
})

// 切换状态筛选
const switchStatus = async (status) => {
  if (currentStatus.value === status) return // 避免重复切换
  
  currentStatus.value = status
  
  // 检查缓存中是否已有该状态的数据
  if (orderListCache.value[status]) {
    // 从缓存恢复数据
    orderList.value = orderListCache.value[status].list
    page.value = orderListCache.value[status].page
    hasMore.value = orderListCache.value[status].hasMore
  } else {
    // 缓存中没有数据，需要请求
    page.value = 1
    hasMore.value = true
    orderList.value = []
    
    try {
      await loadOrderList()
    } catch (error) {
      console.error('切换状态失败:', error)
    }
  }
}

// 加载订单列表
const loadOrderList = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    const params = {
      page: page.value,
      page_size: pageSize.value,
      status_group: currentStatus.value
    }
    
    const response = await getOrderList(params)
    console.log("response.data",response.data)
    if (response.data.code === 0) {
      const { list, total } = response.data.data

      
      if (page.value === 1) {
        orderList.value = list || []
        // 更新当前状态的计数
        updateCurrentStatusCount(total)
      } else {
        orderList.value.push(...(list || []))
      }
      
      hasMore.value = orderList.value.length < total
      
      // 缓存当前状态的数据
      orderListCache.value[currentStatus.value] = {
        list: [...orderList.value],
        page: page.value,
        hasMore: hasMore.value
      }
    } else {
      throw new Error(response.msg || '获取订单列表失败')
    }
  } catch (error) {
    console.error('加载订单列表失败:', error)
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 更新当前状态的计数（不需要额外API请求）
const updateCurrentStatusCount = (total) => {
  const currentTab = statusTabs.value.find(tab => tab.value === currentStatus.value)
  if (currentTab) {
    currentTab.count = total || 0
  }
}

// 更新状态计数（用于需要单独获取计数的场景）
const updateStatusCounts = async () => {
  try {
    // 只更新当前状态的计数，避免重复请求
    const currentTab = statusTabs.value.find(tab => tab.value === currentStatus.value)
    if (currentTab) {
      const response = await getOrderList({ page: 1, page_size: 1, status_group: currentStatus.value })
      if (response.data.code === 0) {
        currentTab.count = response.data.data?.total || 0
      }
    }
  } catch (error) {
    console.error('更新状态计数失败:', error)
  }
}

// 下拉刷新
const onRefresh = async () => {
  if (isRefreshing.value) return // 防止重复刷新
  
  isRefreshing.value = true
  page.value = 1
  hasMore.value = true
  
  // 清除当前状态的缓存，强制重新加载
  delete orderListCache.value[currentStatus.value]
  
  try {
    await loadOrderList()
    
    // 模拟加载时间，确保用户能看到刷新动画
    await new Promise(resolve => setTimeout(resolve, 800))
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
    1: 'status-pending',      // 待付款
    2: 'status-to-serve',     // 待服务（已支付待确认）
    3: 'status-to-serve',     // 待服务（已确认待到达）
    4: 'status-to-serve',     // 待服务（已到达待开始）
    5: 'status-in-progress',  // 进行中
    6: 'status-completed'     // 已完成
  }
  return statusMap[status] || 'status-default'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    1: '待付款',
    2: '待服务',
    3: '待服务',
    4: '待服务',
    5: '进行中',
    6: '已完成'
  }
  return statusMap[status] || '未知状态'
}

// 获取金额标签文本
const getAmountLabel = (status) => {
  if (status === 1) {
    return '需付款：'
  } else if (status === 2 || status === 3 || status === 4 || status === 5 || status === 6) {
    return '实付款：'
  } else {
    return '订单金额：'
  }
}

// 获取订单操作按钮
const getOrderActions = (status) => {
  const actionMap = {
    1: [ // 待付款
      { text: '取消订单', action: 'cancel', type: 'secondary' },
      { text: '立即支付', action: 'pay', type: 'primary' }
    ],
    2: [ // 待服务（已支付待确认）
      { text: '取消订单', action: 'cancel', type: 'secondary' },
      { text: '联系友伴师', action: 'contact', type: 'primary' }
    ],
    3: [ // 待服务（已确认待到达）
      { text: '取消订单', action: 'cancel', type: 'secondary' },
      { text: '联系友伴师', action: 'contact', type: 'primary' }
    ],
    4: [ // 待服务（已到达待开始）
      { text: '取消订单', action: 'cancel', type: 'secondary' },
      { text: '联系友伴师', action: 'contact', type: 'primary' }
    ],
    5: [ // 进行中
      { text: '续钟', action: 'extend', type: 'primary' },
      { text: '联系友伴师', action: 'contact', type: 'secondary' }
    ],
    6: [ // 已完成
      { text: '再次预约', action: 'rebook', type: 'primary' }
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
  if (order.companion_id) {
    uni.showModal({
      title: '联系友伴师',
      content: `是否拨打友伴师 #${order.companion_id} 的电话？`,
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
  
  // 格式化为 YYYY-MM-DD HH:mm 格式
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}
</script>

<style lang="scss" scoped>
.order-container {
  height: 100vh;
  background-color: #F7F8FA;
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  height: 0;
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
  padding: 20rpx;
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
  font-size: 24rpx;
  font-weight: 500;
}

.status-pending {
  color: #ff6b35;
}

.status-to-serve {
  color: #007bff;
}

.status-in-progress {
  color: #28a745;
}

.status-completed {
  color: #6c757d;
}



/* 服务信息和订单金额行 */
.service-amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

/* 服务信息 */
.service-info {
  display: flex;
  align-items: flex-start;
  flex: 1;
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
  flex-direction: column;
}

.service-meta {
  display: flex;
  justify-content: space-between;
  gap: 8rpx;
  align-items: flex-start;
}

.service-duration {
  font-size: 26rpx;
  color: #1a1a1a;
}

.service-price {
  font-size: 28rpx;
  color: #1a1a1a;
  font-weight: 600;
}

/* 下单时间信息 */
.order-time-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.time-label {
  font-size: 26rpx;
  color: #666666;
}

.time-value {
  font-size: 26rpx;
  color: #999999;
}

/* 订单金额 */
.order-amount {
  display: flex;
  align-items: flex-end;
  text-align: right;
  align-self: flex-end;
  margin-top: 30rpx;
}

.amount-label {
  font-size: 26rpx;
  color: #666666;
}

.amount-value {
  font-size: 30rpx;
  color: #f43f5e;
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
  border-radius: 99999rpx;
  font-size: 26rpx;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1rpx solid;
  box-sizing: border-box;
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
