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
            :class="{ active: currentTabIndex === index }"
            @click="switchStatus(tab.value)"
          >
            <text class="tab-text">{{ tab.label }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 订单列表滑动容器 -->
    <view class="order-content">
      <swiper
        class="order-swiper"
        :current="currentTabIndex"
        @change="onSwiperChange"
        :indicator-dots="false"
        :circular="false"
        :autoplay="false"
        :duration="300"
      >
        <!-- 每个状态选项卡的内容 -->
        <swiper-item v-for="tab in statusTabs" :key="tab.value">
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
            <view v-if="getTabOrderList(tab.value).length === 0 && !isLoading" class="empty-state">
              <image src="@/static/images/empty.png" class="empty-image" mode="aspectFit" />
              <text class="empty-text">暂无订单</text>
              <text class="empty-desc">快去发现更多精彩服务吧</text>
            </view>

            <!-- 订单卡片列表 -->
            <view v-else class="order-cards">
              <view 
                v-for="order in getTabOrderList(tab.value)" 
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
                    <text class="amount-label">{{ getAmountLabel(order.status) }}</text>
                    <text class="amount-value">¥{{ order.total_amount }}</text>
                  </view>
                    </view>
                  </view>
                 
                </view>

                <!-- 状态4的提示语 -->
                <view v-if="order.status === 4" class="tip-container">
                  <view class="auto-start-tip">
                    <image src="@/static/icons/common/shijian.png" class="tip-icon" mode="aspectFit" />
                    <text class="tip-text">友伴师已到达，5分钟后将自动开始计时服务</text>
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
              <view v-if="hasMore && getTabOrderList(tab.value).length > 0" class="load-more">
                <text v-if="isLoadingMore" class="loading-text">加载中...</text>
                <!-- <text v-else class="load-more-text">上拉加载更多</text> -->
              </view>
            </view>
             <view style="height: 50rpx;"></view>
		  
		  
		  </scroll-view>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user.js'
import { useCityStore } from '@/stores/city.js'
import { getOrderList, cancelOrder, deleteOrder, applyRefund, applyRefundAfterDeparture, startService, orderParams, getCompanionPhone } from '@/api/order.js'

// 用户状态管理
const userStore = useUserStore()
const cityStore = useCityStore()

// 页面状态
const currentStatus = ref('all')
const currentTabIndex = ref(0)
const isRefreshing = ref(false)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const hasMore = ref(true)
const page = ref(1)
const pageSize = ref(20)

// 订单列表数据缓存 - 为每个状态维护独立的列表
const orderListCache = ref({})
const orderListData = ref({
  'all': [],
  'pending_payment': [],
  'pending_service': [],
  'in_service': [],
  'completed': [],
  'cancelled': [],
  'refunded': [],
  'refunding': []
})

// 防抖定时器
let swiperChangeTimer = null

// 页面卸载时清除定时器
onUnmounted(() => {
  if (swiperChangeTimer) {
    clearTimeout(swiperChangeTimer)
  }
  
  // 移除事件监听器
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

// 状态筛选标签
const statusTabs = ref([
  { label: '全部', value: 'all', count: 0 },
  { label: '待付款', value: 'pending_payment', count: 0 },
  { label: '待服务', value: 'pending_service', count: 0 },
  { label: '进行中', value: 'in_service', count: 0 },
  { label: '已完成', value: 'completed', count: 0 },
  // { label: '已取消', value: 'cancelled', count: 0 },
  // { label: '已退款', value: 'refunded', count: 0 },
  // { label: '退款中', value: 'refunding', count: 0 }
])

// 处理页面参数
onLoad((options) => {
  console.log('订单页面接收到的参数:', options)
  if (options.status) {
    console.log('设置订单状态为:', options.status)
    currentStatus.value = options.status
    // 设置对应的选项卡索引
    const statusIndex = statusTabs.value.findIndex(tab => tab.value === options.status)
    if (statusIndex !== -1) {
      currentTabIndex.value = statusIndex
    }
    // 重置页面状态
    page.value = 1
    hasMore.value = true
    // 清除缓存，强制重新加载
    delete orderListCache.value[options.status]
  } else {
    console.log('没有传递状态参数，使用默认状态: all')
    currentStatus.value = 'all'
    currentTabIndex.value = 0
  }
  
  // 在onLoad中加载数据，这是唯一的数据加载入口
  console.log('onLoad中加载数据，当前状态:', currentStatus.value)
  loadOrderList()
})

// 监听状态变化
watch(currentStatus, (newStatus, oldStatus) => {
  console.log('状态变化:', oldStatus, '->', newStatus)
})

// 切换状态筛选
const switchStatus = async (status) => {
  if (currentStatus.value === status) return // 避免重复切换
  
  currentStatus.value = status
  const statusIndex = statusTabs.value.findIndex(tab => tab.value === status)
  if (statusIndex !== -1) {
    currentTabIndex.value = statusIndex
  }
  
  // 检查缓存中是否已有该状态的数据
  if (orderListCache.value[status]) {
    // 从缓存恢复数据
    orderListData.value[status] = orderListCache.value[status].list
    page.value = orderListCache.value[status].page
    hasMore.value = orderListCache.value[status].hasMore
  } else {
    // 缓存中没有数据，需要请求
    page.value = 1
    hasMore.value = true
    orderListData.value[status] = []
    
    try {
      await loadOrderList()
    } catch (error) {
      console.error('切换状态失败:', error)
    }
  }
}

// swiper滑动改变时的处理
const onSwiperChange = async (e) => {
  const index = e.detail.current
  const newStatus = statusTabs.value[index].value
  const oldStatus = currentStatus.value
  
  currentTabIndex.value = index
  currentStatus.value = newStatus
  
  // 清除之前的定时器
  if (swiperChangeTimer) {
    clearTimeout(swiperChangeTimer)
  }
  
  // 如果切换到新的状态且该状态未加载数据，则延迟加载数据（防抖）
  if (oldStatus !== newStatus && !orderListCache.value[newStatus]) {
    swiperChangeTimer = setTimeout(async () => {
      page.value = 1
      hasMore.value = true
      orderListData.value[newStatus] = []
      await loadOrderList()
    }, 300) // 300ms防抖延迟
  }
}

// 获取指定状态的订单列表
const getTabOrderList = (status) => {
  return orderListData.value[status] || []
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
        orderListData.value[currentStatus.value] = list || []
        // 更新当前状态的计数
        updateCurrentStatusCount(total)
      } else {
        orderListData.value[currentStatus.value].push(...(list || []))
      }
      
      hasMore.value = orderListData.value[currentStatus.value].length < total
      
      // 缓存当前状态的数据
      orderListCache.value[currentStatus.value] = {
        list: [...orderListData.value[currentStatus.value]],
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

// 获取金额标签文本
const getAmountLabel = (status) => {
  if (status === 1) {
    return '需付款：'
  } else if (status === 2 || status === 3 || status === 4 || status === 5 || status === 6 || status === 11) {
    return '实付款：'
  } else {
    return '订单金额：'
  }
}

// 获取订单操作按钮
const getOrderActions = (status, order = null) => {
  const actionMap = {
    1: [ // 待付款
      { text: '取消订单', action: 'cancel', type: 'secondary' },
      { text: '立即支付', action: 'pay', type: 'primary' }
    ],
    2: [ // 待服务（已支付待确认）
      { text: '申请退款', action: 'refund', type: 'secondary' },
      { text: '联系友伴', action: 'contact', type: 'primary' }
    ],
    3: [ // 待服务（已确认待到达）
      { text: '申请退款', action: 'refund', type: 'secondary' },
      { text: '联系友伴', action: 'contact', type: 'primary' }
    ],
    4: [ // 待服务（已到达待开始）
      { text: '申请退款', action: 'refund', type: 'secondary' },
      { text: '开始服务', action: 'start', type: 'start' }
    ],
    5: [ // 进行中
      // { text: '续钟', action: 'extend', type: 'primary' },
      { text: '联系友伴', action: 'contact', type: 'secondary' }
    ],
    6: [ // 已完成
      { text: order && order.is_comment === 1 ? '查看评价' : '去评价', action: order && order.is_comment === 1 ? 'viewComment' : 'evaluate', type: 'primary' },
      { text: '再次预约', action: 'rebook', type: 'secondary' }
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
    10: [ // 超时取消
      { text: '删除订单', action: 'delete', type: 'secondary' }
    ],
    11: [ // 待服务（已确认待开始出发）
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
      // 根据订单状态选择不同的退款处理方式
      if (order.status === 3) {
        handleApplyRefundAfterDeparture(order)
      } else if (order.status === 4) {
        handleApplyRefundAfterArrival(order)
      } else {
        handleApplyRefund(order)
      }
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
    case 'delete':
      handleDeleteOrder(order)
      break
    case 'start':
      handleStartService(order)
      break
    case 'evaluate':
      handleEvaluateOrder(order)
      break
    case 'viewComment':
      handleViewComment(order)
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
    success: async (res) => {
      if (res.confirm) {
        try {
          // 显示加载提示
          uni.showLoading({
            title: '取消中...'
          })
          
          // 调用取消订单API
          const cancelData = {
            order_id: order.id,
            cancel_reason: '用户取消'
          }
          
          const response = await cancelOrder(cancelData)
          
          if (response.data.code === 0) {
            uni.showToast({
              title: '订单已取消',
              icon: 'success'
            })
            // 刷新列表
            onRefresh()
          } else {
            throw new Error(response.data.msg || '取消订单失败')
          }
        } catch (error) {
          console.error('取消订单失败:', error)
          uni.showToast({
            title: error.message || '取消订单失败',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 申请退款
const handleApplyRefund = (order) => {
  uni.showModal({
    title: '申请退款',
    content: '确定要申请退款吗？',
    confirmText: '继续退款',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 显示加载提示
          uni.showLoading({
            title: '申请中...'
          })
          
          // 调用申请退款API
          const refundData = {
            order_id: order.id,
            refund_reason: '用户申请退款'
          }
          
          const response = await applyRefund(refundData)
          
          if (response.data.code === 0) {
            uni.showToast({
              title: '退款申请已提交',
              icon: 'success'
            })
            // 刷新列表
            onRefresh()
          } else {
            throw new Error(response.data.msg || '申请退款失败')
          }
        } catch (error) {
          console.error('申请退款失败:', error)
          uni.showToast({
            title: error.message || '申请退款失败',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 申请退款（出发后）
const handleApplyRefundAfterDeparture = (order) => {
  uni.showModal({
    title: '申请退款',
    content: '确定要申请退款吗？由于对方已出发，退款时将扣除来回程车费。',
    confirmText: '继续退款',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 显示加载提示
          uni.showLoading({
            title: '申请中...'
          })
          
          // 调用申请退款API（出发后）
          const refundData = {
            order_id: order.id,
            refund_reason: '部分退款，扣除来回程车费'
          }
          
          const response = await applyRefundAfterDeparture(refundData)
          
          if (response.data.code === 0) {
            uni.showToast({
              title: '退款申请已提交',
              icon: 'success'
            })
            // 刷新列表
            onRefresh()
          } else {
            throw new Error(response.data.msg || '申请退款失败')
          }
        } catch (error) {
          console.error('申请退款失败:', error)
          uni.showToast({
            title: error.message || '申请退款失败',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
      }
    }
  })
}

// 申请退款（到达后）
const handleApplyRefundAfterArrival = (order) => {
  uni.showModal({
    title: '申请退款',
    content: '确定要申请退款吗？由于对方已到达，退款时将扣除友伴师来回程车费。',
    confirmText: '申请退款',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 显示加载提示
          uni.showLoading({
            title: '申请中...'
          })
          
          // 调用申请退款API（到达后）
          const refundData = {
            order_id: order.id,
            refund_reason: '部分退款，扣除友伴师来回程车费'
          }
          
          const response = await applyRefundAfterDeparture(refundData)
          
          if (response.data.code === 0) {
            uni.showToast({
              title: '退款申请已提交',
              icon: 'success'
            })
            // 刷新列表
            onRefresh()
          } else {
            throw new Error(response.data.msg || '申请退款失败')
          }
        } catch (error) {
          console.error('申请退款失败:', error)
          uni.showToast({
            title: error.message || '申请退款失败',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
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
          // 支付成功后刷新列表
          setTimeout(() => {
            onRefresh()
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

// 开始计时服务
const handleStartService = (order) => {
  uni.showModal({
    title: '开始服务',
    content: '确认友伴师已到达并开始服务吗？',
    confirmText: '开始服务',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
        try {
          // 显示加载提示
          uni.showLoading({
            title: '处理中...'
          })
          
          // 调用开始计时API
          const startData = {
            order_id: order.id
          }
          
          const response = await startService(startData)
          
          if (response.data.code === 0) {
            uni.showToast({
              title: '服务已开始',
              icon: 'success'
            })
            // 刷新列表
            onRefresh()
          } else {
            throw new Error(response.data.msg || '开始服务失败')
          }
        } catch (error) {
          console.error('开始服务失败:', error)
          uni.showToast({
            title: error.message || '开始服务失败',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
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
    let url = '/subPackages/py/detail?id=' + order.companion_id + '&city_code=' + cityStore.currentCityCode
    
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

// 去评价订单
const handleEvaluateOrder = (order) => {
  // 跳转到评价页面，传递必要参数
  uni.navigateTo({
    url: `/subPackages/order/evaluate?orderId=${order.id}&serviceName=${encodeURIComponent(order.service_name)}&serviceImage=${encodeURIComponent(order.service_image_url)}`
  })
}

// 查看评价
const handleViewComment = (order) => {
  // 跳转到评价详情页面
  uni.navigateTo({
    url: `/subPackages/order/evaluate-detail?orderId=${order.id}`
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
          
          // 调用删除订单API
          const deleteData = {
            order_id: order.id
          }
          
          const response = await deleteOrder(deleteData)
          
          if (response.data.code === 0) {
            // 前端移除
            orderListData.value[currentStatus.value] = orderListData.value[currentStatus.value].filter(o => o.id !== order.id)
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
  
  if (type === 'cancel') {
    // 订单被取消，需要从当前状态列表中移除
    // 并添加到已取消状态列表中
    updateOrderStatus(orderId, status)
  }
}

// 处理订单删除事件
const handleOrderDeleted = (data) => {
  console.log('收到订单删除事件:', data)
  
  const { orderId, status } = data
  
  // 从所有状态列表中移除该订单
  removeOrderFromAllStatus(orderId)
}

// 更新订单状态
const updateOrderStatus = (orderId, newStatus) => {
  // 从所有状态列表中查找并移除该订单
  let foundOrder = null
  
  Object.keys(orderListData.value).forEach(statusKey => {
    const orderIndex = orderListData.value[statusKey].findIndex(order => order.id === orderId)
    if (orderIndex !== -1) {
      foundOrder = orderListData.value[statusKey][orderIndex]
      orderListData.value[statusKey].splice(orderIndex, 1)
    }
  })
  
  // 如果找到了订单，根据新状态添加到对应列表
  if (foundOrder) {
    foundOrder.status = newStatus
    
    // 根据新状态添加到对应列表
    if (newStatus === 7) { // 已取消
      orderListData.value.cancelled.unshift(foundOrder)
    } else if (newStatus === 8) { // 已退款
      orderListData.value.refunded.unshift(foundOrder)
    } else if (newStatus === 9) { // 退款中
      orderListData.value.refunding.unshift(foundOrder)
    }
    
    // 更新缓存
    updateOrderListCache()
  }
}

// 从所有状态列表中移除订单
const removeOrderFromAllStatus = (orderId) => {
  Object.keys(orderListData.value).forEach(statusKey => {
    const orderIndex = orderListData.value[statusKey].findIndex(order => order.id === orderId)
    if (orderIndex !== -1) {
      orderListData.value[statusKey].splice(orderIndex, 1)
    }
  })
  
  // 更新缓存
  updateOrderListCache()
}

// 更新订单列表缓存
const updateOrderListCache = () => {
  Object.keys(orderListData.value).forEach(statusKey => {
    if (orderListCache.value[statusKey]) {
      orderListCache.value[statusKey].list = [...orderListData.value[statusKey]]
    }
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
  padding: 0rpx 10rpx 24rpx 0;
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

/* 订单列表滑动容器 */
.order-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.order-swiper {
  flex: 1;
  height: 100%;
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

.order-number {
  font-size: 28rpx;
  color: #1A1A1A;
  font-weight: 500;
  margin-bottom: 8rpx;
  display: block;
}

.order-time {
  font-size: 26rpx;
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

.status-cancelled {
  color: #b0b0b0;
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
  // align-items: flex-end;
  // text-align: right;
  // align-self: flex-end;
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

.action-btn.start {
  background: #F44336;
  color: #FFFFFF;
  border-color: #F44336;
}

.action-btn.start:active {
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

/* 提示容器 */
.tip-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20rpx;
}

/* 自动开始服务提示 */
.auto-start-tip {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 1rpx solid #ffc107;
  border-radius: 12rpx;
  padding: 12rpx 16rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: fit-content;
  gap: 8rpx;
}

.tip-icon {
  width: 34rpx;
  height: 34rpx;
  flex-shrink: 0;
}
.tip-text {
  font-size: 24rpx;
  color: #856404;
  font-weight: 500;
  text-align: center;
  line-height: 1.4;
  white-space: nowrap;
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
