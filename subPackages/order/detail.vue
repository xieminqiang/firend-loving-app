<template>
  <view class="order-detail-container">
    <scroll-view 
      scroll-y="true" 
      class="scroll-content" 
    >
      <!-- 订单状态进度条 -->
      <view class="status-progress">
        <view class="progress-header">
          <text class="progress-title">订单进度</text>
          <text class="current-status" :class="getStatusClass(orderDetail.status)">{{ getStatusText(orderDetail.status) }}</text>
        </view>
        
        <view class="progress-steps">
          <view 
            v-for="(step, index) in progressSteps" 
            :key="index"
            class="progress-step"
            :class="getStepClass(step.status)"
          >
            <view class="step-icon">
              <text class="icon-text">{{ step.icon }}</text>
            </view>
            <view class="step-content">
              <text class="step-title">{{ step.title }}</text>
            </view>
            <view 
              v-if="index < progressSteps.length - 1" 
              class="step-connector"
              :class="getConnectorClass(step.status, progressSteps[index + 1].status)"
            ></view>
          </view>
        </view>
      </view>



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
              <text class="detail-label">友伴信息：</text>
              <view class="companion-info">
                <image 
                  :src="orderDetail?.companion?.avatar" 
                  class="companion-avatar" 
                  mode="aspectFill"
                />
                <text class="detail-value">{{ orderDetail?.companion?.nickname}}</text>
              </view>
            </view>
            <view class="detail-item">
              <text class="detail-label">服务地址：</text>
              <text class="detail-value">{{ orderDetail.service_address }}</text>
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
          v-for="(action, index) in getOrderActions(orderDetail.status)" 
          :key="index"
          class="action-btn"
          :class="action.type"
          @click="handleOrderAction(action.action, orderDetail)"
        >
          <text class="action-text">{{ action.text }}</text>
          <!-- #ifdef MP-WEIXIN -->
          <button v-if="action.text === '联系客服'" open-type="contact" class="kf_btn" @tap.stop></button>
          <!-- #endif -->
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrderDetail, orderParams } from '@/api/order.js'
import { useCityStore } from '@/stores/city.js'

// 订单详情数据
const orderDetail = ref({})
const orderId = ref(null)
const cityStore = useCityStore()

// 进度步骤配置
const progressSteps = ref([
  { title: '友伴接单', icon: '✓', status: 'pending' },
  { title: '友伴出发', icon: '✓', status: 'pending' },
  { title: '友伴到达', icon: '✓', status: 'pending' },
  { title: '开始服务', icon: '✓', status: 'pending' },
  { title: '服务完成', icon: '✓', status: 'pending' }
])

// 页面加载
onLoad((options) => {
  if (options.orderId) {
    orderId.value = options.orderId
    loadOrderDetail()
  }
})

// 加载订单详情
const loadOrderDetail = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    
    const response = await getOrderDetail({ order_id: Number(orderId.value)})
     console.log(response.data)
    if (response.data.code === 0) {
      // 合并订单信息和日志数据
      orderDetail.value = {
        ...response.data.data.order,
        logs: response.data.data.logs || []
      }
      updateProgressSteps()
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

// 更新进度步骤
const updateProgressSteps = () => {
  const logs = orderDetail.value.logs || []

  // 重置所有步骤为未完成状态
  progressSteps.value.forEach(step => {
    step.status = 'pending'
  })

  // 根据日志数据更新进度步骤
  // 步骤1：友伴接单11 - 查找状态为11的日志
  const acceptLog = logs.find(log => log.status === 11)
  if (acceptLog) {
    progressSteps.value[0].status = 'completed'
  }
  
  // 步骤2：友伴出发 - 查找状态为3的日志
  const departLog = logs.find(log => log.status === 3)
  if (departLog) {
    progressSteps.value[1].status = 'completed'
  }
  
  // 步骤3：友伴到达 - 查找状态为4的日志
  const arriveLog = logs.find(log => log.status === 4)
  if (arriveLog) {
    progressSteps.value[2].status = 'completed'
  }
  
  // 步骤4：开始服务 - 查找状态为5的日志
  const startLog = logs.find(log => log.status === 5)
  if (startLog) {
    progressSteps.value[3].status = 'completed'
  }
  
  // 步骤5：服务完成 - 查找状态为6的日志
  const completeLog = logs.find(log => log.status === 6)
  if (completeLog) {
    progressSteps.value[4].status = 'completed'
  }
}

// 获取步骤样式类
const getStepClass = (status) => {
  return status
}

// 获取连接线样式类
const getConnectorClass = (currentStatus, nextStatus) => {
  if (currentStatus === 'completed') {
    return 'completed'
  }
  return 'pending'
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
    8: 'status-refunded',     // 已退款
    9: 'status-refunding',    // 退款中
    10: 'status-cancelled',   // 超时取消
    11: 'status-to-serve'     // 待服务（已确认待开始出发）
  }
  return statusMap[status] || 'status-default'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    1: '待付款',
    2: '等待接单',
    3: '友伴已出发',
    4: '友伴已到达',
    5: '进行中',
    6: '已完成',
    7: '已取消',
    8: '已退款',
    9: '退款中',
    10: '超时取消',
    11: '已接单，等待出发'
  }
  return statusMap[status] || '未知状态'
}

// 获取订单操作按钮
const getOrderActions = (status) => {
  const actionMap = {
    1: [ // 待支付
      { text: '取消订单', action: 'cancel', type: 'secondary' },
      { text: '立即支付', action: 'pay', type: 'primary' }
    ],
    2: [ // 已支付待确认
      { text: '申请退款', action: 'refund', type: 'secondary' },
      { text: '联系友伴', action: 'contact', type: 'primary' }
    ],
    3: [ // 已出发待到达
      { text: '申请退款', action: 'refund', type: 'secondary' },
      { text: '联系友伴', action: 'contact', type: 'primary' }
    ],
    4: [ // 已到达待开始
      { text: '申请退款', action: 'refund', type: 'secondary' },
      { text: '开始服务', action: 'start', type: 'start' }
    ],
    5: [ // 服务中
      { text: '续钟', action: 'extend', type: 'primary' },
      { text: '联系友伴', action: 'contact', type: 'secondary' }
    ],
    6: [ // 已完成
      { text: '再次预约', action: 'rebook', type: 'primary' }
    ],
    7: [ // 已取消
      { text: '删除订单', action: 'delete', type: 'secondary' }
    ],
    8: [ // 已退款
      { text: '删除订单', action: 'delete', type: 'secondary' }
    ],
    9: [ // 退款中
      { text: '联系客服', action: 'contact', type: 'primary' }
    ],
    10: [ // 订单超时取消
      { text: '删除订单', action: 'delete', type: 'secondary' }
    ],
    11: [ // 已确认待开始出发
      { text: '申请退款', action: 'refund', type: 'secondary' },
      { text: '联系友伴', action: 'contact', type: 'primary' }
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
    case 'refund':
      handleApplyRefund(order)
      break
    case 'pay':
      handlePayOrder(order)
      break
    case 'contact':
      // 联系友伴功能已移除
      uni.showToast({
        title: '联系功能暂不可用',
        icon: 'none'
      })
      break
    case 'extend':
      handleExtendOrder(order)
      break
    case 'rebook':
      handleRebookOrder(order)
      break
    case 'delete':
      handleDeleteOrder(order)
      break
    case 'start':
      handleStartService(order)
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
        // 这里调用取消订单API
        uni.showToast({
          title: '订单已取消',
          icon: 'success'
        })
      }
    }
  })
}

// 申请退款
const handleApplyRefund = (order) => {
  uni.showModal({
    title: '申请退款',
    content: '确定要申请退款吗？',
    confirmText: '申请退款',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        // 这里调用申请退款API
        uni.showToast({
          title: '退款申请已提交',
          icon: 'success'
        })
      }
    }
  })
}

// 支付订单
const handlePayOrder = async (order) => {
  try {
    // 显示加载提示
    uni.showLoading({
      title: '处理中...'
    })
    
    // 调用支付参数接口
    const orderParamsData = {
      order_id: order.id,
      payment_method: 1
    }
    
    const paramsResponse = await orderParams(orderParamsData)
    
    if (paramsResponse.data.code === 0) {
      // 调用微信支付
      uni.requestPayment({
        provider: 'wxpay',
        ...paramsResponse.data.data.pay_params,
        success: (res) => {
          console.log('支付成功', res);
          uni.showToast({
            title: '支付成功',
            icon: 'success',
          });
          // 支付成功后刷新订单详情
          setTimeout(() => {
            loadOrderDetail()
          }, 1500)
        },
        fail: (err) => {
          console.error('支付失败', JSON.stringify(err));
          uni.showToast({
            title: '支付失败',
            icon: 'none'
          })
        },
      });
    } else {
      throw new Error(paramsResponse.data.msg || '获取支付参数失败')
    }
  } catch (error) {
    console.error('支付失败:', error)
    uni.showToast({
      title: error.message || '支付失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 开始服务
const handleStartService = (order) => {
  uni.showModal({
    title: '开始服务',
    content: '确认友伴师已到达并开始服务吗？',
    confirmText: '开始服务',
    cancelText: '取消',
    success: (res) => {
      if (res.confirm) {
        // 这里调用开始服务API
        uni.showToast({
          title: '服务已开始',
          icon: 'success'
        })
      }
    }
  })
}

// 续钟
const handleExtendOrder = (order) => {
  uni.navigateTo({
    url: `/subPackages/order/extend?orderId=${order.id}`
  })
}

// 再次预约
const handleRebookOrder = (order) => {
  if (order.companion_id) {
    let url = '/subPackages/friend/detail?id=' + order.companion_id + '&city_code=' + cityStore.currentCityCode
    
    uni.navigateTo({
      url: url
    })
  } else {
    uni.showToast({
      title: '友伴信息不存在',
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
    success: (res) => {
      if (res.confirm) {
        // 这里调用删除订单API
        uni.showToast({
          title: '订单已删除',
          icon: 'success'
        })
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

/* 订单状态进度条 */
.status-progress {
  background: #FFFFFF;
  margin: 20rpx;
  border-radius: 20rpx;
  padding: 30rpx;

}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.progress-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #1A1A1A;
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



.current-status {
  font-size: 24rpx;
  font-weight: 400;
}

/* 状态颜色样式 */
.current-status.status-pending {
  color: #ff6b35;
}

.current-status.status-to-serve {
  color: #007bff;
}

.current-status.status-in-progress {
  color: #28a745;
}

.current-status.status-completed {
  color: #6c757d;
}

.current-status.status-cancelled {
  color: #b0b0b0;
}

.current-status.status-refunded {
  color: #00bcd4;
}

.current-status.status-refunding {
  color: #ff9800;
}

.progress-steps {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 8rpx;
}

.progress-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  gap: 16rpx;
  position: relative;
}

.step-icon {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  z-index: 2;
}

.step-icon .icon-text {
  font-size: 18rpx;
  font-weight: bold;
}

.progress-step.completed .step-icon {
  background: #4CAF50;
  color: #FFFFFF;
}



.progress-step.pending .step-icon {
  background: #E0E0E0;
  color: #999999;
}

.step-content {
  text-align: center;
}

.step-title {
  font-size: 24rpx;
  color: #1A1A1A;
  font-weight: 500;
  display: block;
}

.step-connector {
  position: absolute;
  top: 16rpx;
  left: calc(70% + 16rpx);
  width: 40%;
  height: 2rpx;
  background-color: #E0E0E0;
  z-index: 1;
}

.step-connector.completed {
  background-color: #4CAF50;
}

.step-connector.pending {
  background-color: #E0E0E0;
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

.detail-value {
  font-size: 24rpx;
  color: #1A1A1A;
  flex: 1;

}
.detail-value-order {
  font-size: 24rpx;
  color: #1A1A1A;


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

/* 友伴信息样式 */
.companion-info {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 12rpx;
}

.companion-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  flex-shrink: 0;
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

.action-btn.start {
  background: #F44336;
  color: #FFFFFF;
  border-color: #F44336;
}

.action-btn.start:active {
  background: #d32f2f;
  transform: scale(0.96);
}

.action-btn.danger {
  background: #F44336;
  color: #FFFFFF;
  border-color: #F44336;
}

.action-btn.danger:active {
  background: #d32f2f;
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


</style>


