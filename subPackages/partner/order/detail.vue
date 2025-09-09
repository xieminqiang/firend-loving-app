<template>
  <view class="order-detail-container">
    <scroll-view 
      scroll-y="true" 
      class="scroll-content" 
    >


      <!-- 服务信息 -->
      <view class="service-section">
        <view class="section-header">
          <text class="section-title">服务信息</text>
        </view>
        
        <view class="service-card">
          <view class="service-info">
            <image :src="$imgBaseUrl + orderDetail.service_image_url" class="service-image" mode="aspectFill" />
            <view class="service-details">
              <text class="service-name">{{ orderDetail.service_name }}</text>
              <view class="service-meta">
                <text class="service-price">¥{{ orderDetail.unit_price }}/{{ orderDetail.unit }}</text>
                <text class="service-quantity">x{{ orderDetail.quantity }}</text>
              </view>
              <view class="service-amount">
                <view></view>
                 <view>
                  <text class="amount-label">订单金额：</text>
                  <text class="amount-value">¥{{ orderDetail.total_amount }}</text>
                 </view>
              </view>
            </view>
          </view>
          
          <!-- 服务地址和时间 -->
          <view class="service-details-info">
            <view class="detail-item">
              <text class="detail-label">服务信息：</text>
              <view class="customer-info">
                <text class="detail-value">{{ orderDetail?.user?.nick_name }} {{ orderDetail?.user?.phone }}</text>
              </view>
            </view>
            <view class="detail-item">
              <text class="detail-label">服务地址：</text>
              <view class="detail-value-container">
                <text class="detail-value">{{ orderDetail.service_address }}</text>
                <view class="location-actions" v-if="[2, 3, 4, 5, 11].includes(orderDetail.status)">
                  <view class="nav-btn" @click="openLocation(orderDetail)">
                    <text class="nav-text">导航</text>
                  </view>
                </view>
              </view>
            </view>
            <view class="detail-item">
              <text class="detail-label">预约时间：</text>
              <text class="detail-value">{{ formatServiceDateTime(orderDetail.service_date, orderDetail.service_time) }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 订单信息 -->
      <view class="order-info-section">
        <view class="section-header">
          <text class="section-title">订单信息</text>
        </view>
        
        <view class="detail-card">
          <view class="detail-item">
            <text class="detail-label">订单号：</text>
            <view class="detail-value-container">
              <text class="detail-value-order">{{ orderDetail.order_no}}</text>
              <image 
                src="/static/icons/common/copy.png" 
                class="copy-icon" 
                @click="copyOrderNo(orderDetail.order_no)"
                mode="aspectFit"
              />
            </view>
          </view>
          <view v-if="orderDetail.start_time" class="detail-item">
            <text class="detail-label">开始时间：</text>
            <text class="detail-value">{{ formatTime(orderDetail.start_time) }}</text>
          </view>
          <view v-if="orderDetail.end_time" class="detail-item">
            <text class="detail-label">结束时间：</text>
            <text class="detail-value">{{ formatTime(orderDetail.end_time) }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">下单时间：</text>
            <text class="detail-value">{{ formatTime(orderDetail.created_at) }}</text>
          </view>
          <view v-if="orderDetail.payment_time" class="detail-item">
            <text class="detail-label">支付时间：</text>
            <text class="detail-value">{{ formatTime(orderDetail.payment_time) }}</text>
          </view>
          <view v-if="orderDetail.remark" class="detail-item">
            <text class="detail-label">备注：</text>
            <text class="detail-value remark-text">{{ orderDetail.remark }}</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 操作按钮 -->
    <view class="action-buttons">
      <view class="action-container">
        <view 
          v-for="(action, index) in getOrderActions(orderDetail.status, orderDetail)" 
          :key="index"
          class="action-btn"
          :class="action.type"
          @click="handleOrderAction(action.action, orderDetail)"
        >
          <text class="action-text">{{ action.text }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { 
  getCompanionOrderDetail,
  acceptCompanionOrder,
  rejectCompanionOrder,
  arrivedCompanionOrder,
  departCompanionOrder,
  startCompanionService,
  endCompanionService,
  deleteCompanionOrder
} from '@/api/order.js'
import { useUserStore } from '@/stores/user.js'
// 用户状态管理
const userStore = useUserStore()
// 订单详情数据
const orderDetail = ref({})
const orderId = ref(null)
const companionId = ref(null)



// 页面加载
onLoad((options) => {
  // 检查登录状态
  if (!userStore.userInfo || Object.keys(userStore.userInfo).length === 0 || !userStore.token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateTo({
        url: '/subPackages/login/index'
      })
    }, 1500)
    return
  }
  
  if (options.orderId) {
    orderId.value = options.orderId
  }
  if (options.companion_id) {
      companionId.value = options.companion_id
  }
  loadOrderDetail()
})

// 加载订单详情
const loadOrderDetail = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    
    const response = await getCompanionOrderDetail({ 
      order_id: Number(orderId.value),
      companion_id: Number(companionId.value)
    })
    
    if (response.data.code === 0) {
      // 合并订单信息和日志数据
      orderDetail.value = {
        ...response.data.data.order,
        logs: response.data.data.logs || []
      }
    } else {
      throw new Error(response.data.msg || '获取订单详情失败')
    }
  } catch (error) {
    console.error('加载订单详情失败:', error)
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
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
    6: 'status-completed',    // 已完成
    7: 'status-cancelled',    // 已取消
    8: 'status-cancelled',    // 已取消（原已退款）
    9: 'status-cancelled',    // 已取消（原退款中）
    11: 'status-to-serve'     // 待服务（已确认待开始出发）
  }
  return statusMap[status] || 'status-default'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    1: '待付款',
    2: '等待接单',
    3: '我已出发',
    4: '已到达，等待开始服务',
    5: '服务中',
    6: '已完成',
    7: '已取消',
    8: '已取消',
    9: '已取消',
    11: '待服务'
  }
  return statusMap[status] || '未知状态'
}

// 获取订单操作按钮
const getOrderActions = (status, order) => {
  const actionMap = {
    2: [ // 已支付待确认
      { text: '拒绝', action: 'reject', type: 'secondary' },
      { text: '接单', action: 'accept', type: 'primary' }
    ],
    3: [ // 已确认待到达
      { text: '电话联系', action: 'contact', type: 'secondary' },
      { text: '我已到达服务地点', action: 'arrived', type: 'primary' }
    ],
    4: [ // 已到达待开始
      { text: '电话联系', action: 'call', type: 'secondary' }
    ],
    5: [ // 服务中
      { text: '电话联系', action: 'contact', type: 'secondary' },
      { text: '结束服务', action: 'end', type: 'primary' }
    ],
    6: [ // 已完成
      ...(order.is_comment === 1 ? [{ text: '查看评价', action: 'review', type: 'secondary' }] : []),
      { text: '删除订单', action: 'delete', type: 'secondary' }
    ],
    7: [ // 已取消
      { text: '删除订单', action: 'delete', type: 'secondary' }
    ],
    8: [ // 已取消（原已退款）
      { text: '删除订单', action: 'delete', type: 'secondary' }
    ],
    9: [ // 已取消（原退款中）
      { text: '订单已取消，给客户退款中', action: 'info', type: 'info' }
    ],
    11: [ // 已确认待开始出发
      { text: '电话联系', action: 'contact', type: 'secondary' },
      { text: '我已出发', action: 'depart', type: 'depart' }
    ]
  }
  return actionMap[status] || []
}

// 处理订单操作
const handleOrderAction = (action, order) => {
  switch (action) {
    case 'contact':
      handleContactCustomer(order)
      break
    case 'accept':
      handleAcceptOrder(order)
      break
    case 'reject':
      handleRejectOrder(order)
      break
    case 'arrived':
      handleArrived(order)
      break
    case 'depart':
      handleDepart(order)
      break
    case 'call':
      handleCallCustomer(order)
      break
    case 'start':
      handleStartService(order)
      break
    case 'end':
      handleEndService(order)
      break
    case 'review':
      handleViewReview(order)
      break
    case 'rebook':
      handleRebookService(order)
      break
    case 'delete':
      handleDeleteOrder(order)
      break
    case 'info':
      // 信息提示，不执行任何操作
      break
  }
}

// 电话联系客户
const handleContactCustomer = (order) => {
  if (order.user && order.user.phone) {
    uni.showModal({
      title: '电话联系',
      content: `是否拨打客户 ${order.user.nick_name} 的电话？`,
      confirmText: '拨打',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          uni.makePhoneCall({
            phoneNumber: order.user.phone
          })
        }
      }
    })
  }
}

// 接单
const handleAcceptOrder = (order) => {
  uni.showModal({
    title: '确认接单',
    content: '确定要接受这个订单吗？',
    confirmText: '接单',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({
            title: '处理中...'
          })
          
          const response = await acceptCompanionOrder({ 
            order_id: order.id,
            companion_id: Number(companionId.value)
          })
          
          if (response.data.code === 0) {
            uni.showToast({
              title: '接单成功',
              icon: 'success'
            })
            
            // 刷新订单详情
            setTimeout(() => {
              loadOrderDetail()
            }, 1500)
          } else {
            throw new Error(response.data.msg || '接单失败')
          }
        } catch (error) {
          console.error('接单失败:', error)
          uni.showToast({
            title: error.message || '接单失败',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 拒绝订单
const handleRejectOrder = (order) => {
  uni.showModal({
    title: '拒绝订单',
    content: '确定要拒绝这个订单吗？',
    confirmText: '拒绝',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({
            title: '处理中...'
          })
          
          const response = await rejectCompanionOrder({ 
            order_id: order.id,
            companion_id: Number(companionId.value)
          })
          
          if (response.data.code === 0) {
            uni.showToast({
              title: '已拒绝订单',
              icon: 'success'
            })
            
            // 刷新订单详情
            setTimeout(() => {
              loadOrderDetail()
            }, 1500)
          } else {
            throw new Error(response.data.msg || '拒绝订单失败')
          }
        } catch (error) {
          console.error('拒绝订单失败:', error)
          uni.showToast({
            title: error.message || '操作失败',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 我已到达
const handleArrived = (order) => {
  uni.showModal({
    title: '确认到达',
    content: '确认您已到达服务地点？',
    confirmText: '确认',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({
            title: '更新中...'
          })
          
          const response = await arrivedCompanionOrder({ 
            order_id: order.id,
            companion_id: Number(companionId.value)
          })
          
          if (response.data.code === 0) {
            uni.showToast({
              title: '已确认到达',
              icon: 'success'
            })
            
            // 刷新订单详情
            setTimeout(() => {
              loadOrderDetail()
            }, 1500)
          } else {
            throw new Error(response.data.msg || '确认到达失败')
          }
        } catch (error) {
          console.error('确认到达失败:', error)
          uni.showToast({
            title: error.message || '操作失败',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 电话联系客户
const handleCallCustomer = (order) => {
  if (order.user && order.user.phone) {
    uni.showModal({
      title: '电话联系',
      content: `是否拨打客户 ${order.user.nick_name} 的电话？`,
      confirmText: '拨打',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          uni.makePhoneCall({
            phoneNumber: order.user.phone
          })
        }
      }
    })
  }
}

// 我已出发
const handleDepart = (order) => {
  uni.showModal({
    title: '确认出发',
    content: '确认您已开始出发前往服务地点？',
    confirmText: '确认',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({
            title: '更新中...'
          })
          
          const response = await departCompanionOrder({ 
            order_id: order.id,
            companion_id: Number(companionId.value)
          })
          
          if (response.data.code === 0) {
            uni.showToast({
              title: '已确认出发',
              icon: 'success'
            })
            
            // 刷新订单详情
            setTimeout(() => {
              loadOrderDetail()
            }, 1500)
          } else {
            throw new Error(response.data.msg || '确认出发失败')
          }
        } catch (error) {
          console.error('确认出发失败:', error)
          uni.showToast({
            title: error.message || '操作失败',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 开始服务
const handleStartService = (order) => {
  uni.showModal({
    title: '开始服务',
    content: '确定要开始服务吗？',
    confirmText: '开始',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({
            title: '更新中...'
          })
          
          const response = await startCompanionService({ 
            order_id: order.id,
            companion_id: Number(companionId.value)
          })
          
          if (response.data.code === 0) {
            uni.showToast({
              title: '服务已开始',
              icon: 'success'
            })
            
            // 刷新订单详情
            setTimeout(() => {
              loadOrderDetail()
            }, 1500)
          } else {
            throw new Error(response.data.msg || '开始服务失败')
          }
        } catch (error) {
          console.error('开始服务失败:', error)
          uni.showToast({
            title: error.message || '操作失败',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 结束服务
const handleEndService = (order) => {
  uni.showModal({
    title: '结束服务',
    content: '确定要结束服务吗？',
    confirmText: '结束',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({
            title: '更新中...'
          })
          
          const response = await endCompanionService({ 
            order_id: order.id,
            companion_id: Number(companionId.value)
          })
          
          if (response.data.code === 0) {
            uni.showToast({
              title: '服务已结束',
              icon: 'success'
            })
            
            // 刷新订单详情
            setTimeout(() => {
              loadOrderDetail()
            }, 1500)
          } else {
            throw new Error(response.data.msg || '结束服务失败')
          }
        } catch (error) {
          console.error('结束服务失败:', error)
          uni.showToast({
            title: error.message || '操作失败',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 查看评价
const handleViewReview = (order) => {
  uni.navigateTo({
    url: `/subPackages/partner/order/partner-evaluate?orderId=${order.id}&companion_id=${companionId.value}`
  })
}

// 再次服务
const handleRebookService = (order) => {
  uni.navigateTo({
    url: `/subPackages/partner/rebook?orderId=${order.id}`
  })
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
          
          const response = await deleteCompanionOrder({ 
            order_id: order.id,
            companion_id: Number(companionId.value)
          })
          
          if (response.data.code === 0) {
            uni.showToast({
              title: '订单已删除',
              icon: 'success'
            })
            
            // 返回上一页
            setTimeout(() => {
              uni.navigateBack()
            }, 1500)
          } else {
            throw new Error(response.data.msg || '删除订单失败')
          }
        } catch (error) {
          console.error('删除订单失败:', error)
          uni.showToast({
            title: error.message || '删除失败',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  
  const date = new Date(timeStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 复制订单号
const copyOrderNo = (orderNo) => {
  if (!orderNo) {
    uni.showToast({
      title: '订单号为空',
      icon: 'none'
    })
    return
  }
  
  uni.setClipboardData({
    data: orderNo,
    success: () => {
      uni.showToast({
        title: '订单号已复制',
        icon: 'success'
      })
    },
    fail: () => {
      uni.showToast({
        title: '复制失败',
        icon: 'none'
      })
    }
  })
}

// 打开导航
const openLocation = (order) => {
  if (order.user_latitude && order.user_longitude) {
    uni.openLocation({ 
      latitude: Number(order.user_latitude), //要去的纬度
      longitude: Number(order.user_longitude), //要去的经度 
      address: order.service_address, //要去的具体地址 
    })
  } else {
    uni.showToast({
      title: '暂无位置信息',
      icon: 'none'
    })
  }
}

// 格式化服务日期和时间
const formatServiceDateTime = (serviceDate, serviceTime) => {
  if (!serviceDate && !serviceTime) return '待确认'
  
  let result = ''
  
  // 处理服务日期
  if (serviceDate) {
    const date = new Date(serviceDate)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
    result += `${year}-${month}-${day} ${weekday}`
  }
  
  // 处理时间段
  if (serviceTime) {
    if (result) {
      result += ' '
    }
    result += serviceTime
  }
  
  return result || '待确认'
}
</script>

<style lang="scss" scoped>
.order-detail-container {
  min-height: 100vh;
  background-color: #F7F8FA;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.scroll-content {
  height: calc(100vh - 120rpx);
  padding-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #1A1A1A;
}

/* 服务信息 */
.service-section {
  background: #FFFFFF;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;
}

.service-card {
  margin-top: 24rpx;
}

.service-info {
  display: flex;
  gap: 20rpx;
}

.service-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.service-details {
  flex: 1;
}

.service-name {
  font-size: 28rpx;
  color: #1A1A1A;
  font-weight: 500;
  display: block;
  margin-bottom: 12rpx;
}

.service-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.service-price {
  font-size: 26rpx;
  color: #666666;
}

.service-quantity {
  font-size: 26rpx;
  color: #666666;
}

.service-amount {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.amount-label {
  font-size: 26rpx;
  color: #666666;
}

.amount-value {
  font-size: 28rpx;
  color: #f43f5e;
  font-weight: 600;
}

/* 服务详情信息 */
.service-details-info {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

/* 订单信息 */
.order-info-section {
  background: #FFFFFF;
  margin: 20rpx;
  border-radius: 16rpx;
  padding: 20rpx;
}

.detail-card {
  margin-top: 24rpx;
}

.detail-item {
  display: flex;
  margin-bottom: 16rpx;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 24rpx;
  color: #666666;
  min-width: 140rpx;
}

.detail-value-container {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 16rpx;
}

.detail-value-container .detail-value {
  flex: 1;
  min-width: 0;
}

.detail-value {
  font-size: 24rpx;
  color: #1A1A1A;
  flex: 1;
}

.detail-value-order {
  font-size: 24rpx;
  color: #1A1A1A;
}

.location-actions {
  display: flex;
  align-items: center;
  margin-left: 16rpx;
  flex-shrink: 0;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8rpx 16rpx;
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 20rpx;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
  }
}

.nav-text {
  font-size: 22rpx;
  color: #FFFFFF;
  font-weight: 500;
}

.copy-icon {
  width: 28rpx;
  height: 28rpx;
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.copy-icon:active {
  opacity: 1;
  transform: scale(0.9);
}

/* 客户信息样式 */
.customer-info {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 12rpx;
}

/* 操作按钮 */
.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, white 100%);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  padding: 24rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid rgba(115, 99, 255, 0.1);
  z-index: 100;
}

.action-container {
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
  min-width: 120rpx;
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

.action-btn.depart {
  background: #4CAF50;
  color: #FFFFFF;
  border-color: #4CAF50;
}

.action-btn.depart:active {
  background: #45a049;
  transform: scale(0.96);
}

.action-btn.info {
  background: transparent;
  color: #999999;
  border-color: transparent;
  cursor: default;
  padding: 16rpx 0;
}

.action-btn.info:active {
  background: transparent;
  transform: none;
}
</style>