<template>
  <view class="order-container">
    <!-- 订单列表滑动容器 -->
    <view class="order-content">
      <scroll-view 
        class="order-scroll-view" 
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
          <text class="empty-text">暂无退款订单</text>
          <text class="empty-desc">您还没有退款相关的订单</text>
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
                <text class="order-time">{{ formatTime(order.created_at) }}</text>
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
                  <text class="service-name">{{ order.service_name }}</text>
                  <view class="service-meta">
                    <text class="service-price">¥{{ order.unit_price }}/{{ order.unit }}</text>
                    <text class="service-duration">x{{ order.quantity }}</text>
                  </view>
                  <view class="order-amount">
                    <text class="amount-label">订单金额：</text>
                    <text class="amount-value">¥{{ order.total_amount }}</text>
                  </view>
                </view>
              </view>
            </view>

            <!-- 操作按钮 -->
            <view class="order-actions">
              <view 
                v-for="(action, actionIndex) in getOrderActions(order.status, order)" 
                :key="actionIndex"
                class="action-btn"
                :class="action.type"
                @click.stop="handleOrderAction(action.action, order)"
              >
                <text class="action-text">{{ action.text }}</text>
                <!-- #ifdef MP-WEIXIN -->
                <button v-if="action.text === '联系客服'" open-type="contact" class="kf_btn" @tap.stop></button>
                <!-- #endif -->
              </view>
            </view>
          </view>

          <!-- 加载更多 -->
          <view v-if="hasMore && orderList.length > 0" class="load-more">
            <text v-if="isLoadingMore" class="loading-text">加载中...</text>
          </view>
        </view>
        <view style="height: 50rpx;"></view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user.js'
import { getRefundOrderList, deleteOrder, applyRefund, applyRefundAfterDeparture, startService, orderParams, getCompanionPhone } from '@/api/order.js'

// 用户状态管理
const userStore = useUserStore()

// 页面状态
const isRefreshing = ref(false)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(20)

// 订单列表数据
const orderList = ref([])

// 页面卸载时清除事件监听器
onUnmounted(() => {
  uni.$off('orderStatusChanged')
  uni.$off('orderOrderDeleted')
})

// 页面挂载时添加事件监听器
onMounted(() => {
  // 监听订单状态变化事件
  uni.$on('orderStatusChanged', handleOrderStatusChanged)
  
  // 监听订单删除事件
  uni.$on('orderOrderDeleted', handleOrderDeleted)
})

// 处理页面参数
onLoad((options) => {
  console.log('退款页面加载')
  // 加载退款相关订单数据
  loadRefundOrders()
})

// 加载退款订单列表
const loadRefundOrders = async () => {
  if (isLoading.value) return
  
  isLoading.value = true
  
  try {
    const params = {
      page: page.value,
      page_size: pageSize.value
    }
    
    const response = await getRefundOrderList(params)
    console.log("退款订单响应:", response.data)
    
    if (response.data.code === 0) {
      const { list, total } = response.data.data
      
      if (page.value === 1) {
        orderList.value = list || []
      } else {
        orderList.value.push(...(list || []))
      }
      
      hasMore.value = orderList.value.length < total
    } else {
      throw new Error(response.data.msg || '获取退款订单列表失败')
    }
  } catch (error) {
    console.error('加载退款订单列表失败:', error)
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none'
    })
  } finally {
    isLoading.value = false
  }
}

// 下拉刷新
const onRefresh = async () => {
  if (isRefreshing.value) return
  
  isRefreshing.value = true
  page.value = 1
  hasMore.value = true
  
  try {
    await loadRefundOrders()
    
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
    await loadRefundOrders()
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
    8: 'status-refunded',     // 已退款
    9: 'status-refunding',    // 退款中
  }
  return statusMap[status] || 'status-default'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    8: '已退款',
    9: '退款中',
  }
  return statusMap[status] || '未知状态'
}

// 获取订单操作按钮
const getOrderActions = (status, order = null) => {
  const actionMap = {
    8: [ // 已退款
      { text: '删除订单', action: 'delete', type: 'secondary' }
    ],
    9: [ // 退款中
      { text: '联系客服', action: 'contact', type: 'primary' }
    ]
  }
  return actionMap[status] || []
}

// 处理订单操作
const handleOrderAction = (action, order) => {
  switch (action) {
    case 'contact':
      handleContactPartner(order)
      break
    case 'delete':
      handleDeleteOrder(order)
      break
  }
}

// 联系友伴师
const handleContactPartner = async (order) => {
  console.log(order)
  if (order.companion_id) {
    try {
      // 显示加载提示
      uni.showLoading({
        title: '获取电话中...'
      })
      
      // 调用获取友伴师电话API
      const phoneData = {
        companion_id: order.companion_id
      }
      
      const response = await getCompanionPhone(phoneData)
      
      if (response.data.code === 0) {
        const phoneNumber = response.data.data.phone
        uni.hideLoading()
        
        uni.showModal({
          title: '联系友伴师',
          content: `是否拨打友伴师的电话？\n${phoneNumber}`,
          confirmText: '拨打',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) {
              uni.makePhoneCall({
                phoneNumber: phoneNumber
              })
            }
          }
        })
      } else {
        throw new Error(response.data.msg || '获取友伴师电话失败')
      }
    } catch (error) {
      console.error('获取友伴师电话失败:', error)
      uni.hideLoading()
      uni.showToast({
        title: error.message || '获取友伴师电话失败',
        icon: 'none'
      })
    }
  } else {
    uni.showToast({
      title: '友伴师信息不存在',
      icon: 'none'
    })
  }
}

// 删除订单
const handleDeleteOrder = (order) => {
  uni.showModal({
    title: '删除订单',
    content: '确定要删除这个订单吗？删除后不可恢复。',
    confirmText: '删除',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({
            title: '删除中...'
          })
          
          // 调用删除订单API
          const deleteData = {
            order_id: order.id
          }
          
          const response = await deleteOrder(deleteData)
          
          if (response.data.code === 0) {
            // 前端移除
            orderList.value = orderList.value.filter(o => o.id !== order.id)
            uni.showToast({
              title: '订单已删除',
              icon: 'success'
            })
          } else {
            throw new Error(response.data.msg || '删除订单失败')
          }
        } catch (error) {
          console.error('删除订单失败:', error)
          uni.showToast({
            title: error.message || '删除订单失败',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 跳转到订单详情
const navigateToDetail = (orderId) => {
  uni.navigateTo({
    url: `/subPackages/order/detail?orderId=${orderId}`
  })
}

// 处理订单状态变化事件
const handleOrderStatusChanged = (data) => {
  console.log('收到订单状态变化事件:', data)
  
  // 更新对应状态的订单列表
  const { type, orderId, status } = data
  
  if (type === 'refund') {
    // 订单状态变为退款相关，需要更新列表
    updateOrderStatus(orderId, status)
  }
}

// 处理订单删除事件
const handleOrderDeleted = (data) => {
  console.log('收到订单删除事件:', data)
  
  const { orderId } = data
  
  // 从列表中移除该订单
  orderList.value = orderList.value.filter(order => order.id !== orderId)
}

// 更新订单状态
const updateOrderStatus = (orderId, newStatus) => {
  // 查找并更新订单状态
  const orderIndex = orderList.value.findIndex(order => order.id === orderId)
  if (orderIndex !== -1) {
    orderList.value[orderIndex].status = newStatus
  }
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

/* 订单列表滑动容器 */
.order-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.order-scroll-view {
  height: 100%;
  padding: 0 24rpx;
  box-sizing: border-box;
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
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #cccccc;
}

/* 订单卡片 */
.order-cards {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 20rpx;
}

.order-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 20rpx;
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

.order-time {
  font-size: 26rpx;
  color: #999999;
}

.order-status {
  font-size: 24rpx;
  font-weight: 500;
}

.status-refunded {
  color: #00bcd4;
}

.status-refunding {
  color: #ff9800;
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

.service-name {
  font-size: 28rpx;
  color: #1A1A1A;
  margin-bottom: 8rpx;
  display: block;
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
  font-size: 26rpx;
  color: #1a1a1a;
}

/* 订单金额 */
.order-amount {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 40rpx;
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
  border: 1rpx solid transparent;
  box-sizing: border-box;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
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

/* 微信客服透明覆盖按钮 */
.kf_btn {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background: transparent !important;
  opacity: 0;
  border: none;
  z-index: 5;
}

.kf_btn::after {
  border: none;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 32rpx 0;
}

.loading-text {
  font-size: 26rpx;
  color: #999999;
}
</style>