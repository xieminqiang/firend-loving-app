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
                <text class="empty-desc">继续努力，订单会越来越多的</text>
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
  
                
  
                  <!-- 服务信息 -->
                  <view class="service-info">
                    <image :src="$imgBaseUrl + order.service_image_url" class="service-image" mode="aspectFill" />
                    <view class="service-details">
                      <text class="service-name">{{ order.service_name }}</text>
                      <view class="service-meta">
                        <text class="service-price">¥{{ order.unit_price }}/{{ order.unit }}</text>
                        <text class="service-duration">x{{ order.quantity }}</text>
                      </view>
                      <view class="service-amount">
                        <text class="amount-label">总金额：</text>
                        <text class="amount-value">¥{{ order.total_amount }}</text>
                      </view>
                    </view>
                  </view>
  
                  <!-- 服务信息 服务地址和时间 -->
                  <view v-if="[2, 3, 4, 5, 11].includes(order.status)" class="service-location-time">

                    <view class="location-info" v-if="order.status != 2 && order.user">
                      <text class="location-label">服务信息：</text>
                      <text class="location-value">{{ order?.user?.nick_name }}  {{ order?.user?.phone }}</text>
                    </view>
                    <view class="location-info">
                      <text class="location-label">服务地址：</text>
                      <text class="location-value">{{ order.service_address }}</text>
                    </view>
                    <view class="time-info">
                      <text class="time-label">预约时间：</text>
                      <text class="time-value">{{ formatServiceDateTime(order.service_date, order.service_time) }}</text>
                    </view>
                  </view>

                  <!-- 状态4的提示语 -->
                  <view v-if="order.status === 4" class="tip-container">
                    <view class="auto-start-tip">
                      <image src="@/static/icons/common/shijian.png" class="tip-icon" mode="aspectFit" />
                      <text class="tip-text">您已到达服务地点，5分钟后将自动开始计时服务</text>
                    </view>
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
                <view v-if="hasMore && getTabOrderList(tab.value).length > 0" class="load-more">
                  <text v-if="isLoadingMore" class="loading-text">加载中...</text>
                </view>
              </view>
            </scroll-view>
          </swiper-item>
        </swiper>
      </view>
    </view>
  </template>
  
  <script setup>
  import { ref, computed, watch, onUnmounted } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { 
  getCompanionOrderList, 
  deleteCompanionOrder,
  acceptCompanionOrder,
  rejectCompanionOrder,
  arrivedCompanionOrder,
  departCompanionOrder,
  startCompanionService,
  endCompanionService
} from '@/api/order.js'
  
  // 页面状态
  const currentStatus = ref('all')
  const currentTabIndex = ref(0)
  const isRefreshing = ref(false)
  const isLoading = ref(false)
  const isLoadingMore = ref(false)
  const hasMore = ref(true)
  const page = ref(1)
  const pageSize = ref(20)
  const companionId = ref(null)
  
  // 订单列表数据缓存 - 为每个状态维护独立的列表
  const orderListCache = ref({})
  const orderListData = ref({
    'all': [],
    'pending_accept': [],
    'pending_service': [],
    'in_service': [],
    'completed': []
  })
  
  // 防抖定时器
  let swiperChangeTimer = null
  
  // 页面卸载时清除定时器
  onUnmounted(() => {
    if (swiperChangeTimer) {
      clearTimeout(swiperChangeTimer)
    }
  })
  
  // 状态筛选标签
  const statusTabs = ref([
    { label: '全部', value: 'all', count: 0 },
    { label: '待接单', value: 'pending_accept', count: 0 },
    { label: '待服务', value: 'pending_service', count: 0 },
    { label: '服务中', value: 'in_service', count: 0 },
    { label: '已完成', value: 'completed', count: 0 }
  ])
  
  // 处理页面参数
  onLoad((options) => {
    console.log('友伴订单页面接收到的参数:', options)
    
    // 保存companion_id
    if (options.companion_id) {
      console.log('设置companion_id为:', options.companion_id)
      companionId.value = options.companion_id
    }
    
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
    
    // 在onLoad中加载数据
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
        companion_id: Number(companionId.value)
      }
      
      // 根据状态添加不同的参数
      if (currentStatus.value === 'all') {
        // 全部状态不传状态参数
      } else if (currentStatus.value === 'pending_accept') {
        params.status = 2
      } else if (currentStatus.value === 'pending_service') {
        params.status_group = 'pending_service'
      } else if (currentStatus.value === 'in_service') {
        params.status = 5
      } else if (currentStatus.value === 'completed') {
        params.status = 6
      }
      
      const response = await getCompanionOrderList(params)
      console.log("response.data", response.data)
      
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
        throw new Error(response.data.msg || '获取订单列表失败')
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
  
  // 更新当前状态的计数
  const updateCurrentStatusCount = (total) => {
    const currentTab = statusTabs.value.find(tab => tab.value === currentStatus.value)
    if (currentTab) {
      currentTab.count = total || 0
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
      2: 'status-to-serve',     // 已支付待确认
      3: 'status-to-serve',     // 已确认待到达
      4: 'status-to-serve',     // 已到达待开始
      5: 'status-in-progress',  // 进行中
      6: 'status-completed',    // 已完成
      7: 'status-cancelled',    // 已取消
      8: 'status-cancelled',    // 已取消（原已退款）
      9: 'status-cancelled',    // 已取消（原退款中）
      11: 'status-to-serve'     // 已确认待开始出发
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
  const getOrderActions = (status) => {
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
        { text: '查看评价', action: 'review', type: 'secondary' },
        { text: '删除订单', action: 'delete', type: 'secondary' }
        // { text: '再次服务', action: 'rebook', type: 'primary' }
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
              
              // 跳转到待服务状态
              const pendingServiceIndex = statusTabs.value.findIndex(tab => tab.value === 'pending_service')
              if (pendingServiceIndex !== -1) {
                currentTabIndex.value = pendingServiceIndex
                currentStatus.value = 'pending_service'
              }
              
              // 清除待服务状态的缓存，强制重新加载
              delete orderListCache.value['pending_service']
              
              // 刷新待服务状态的列表
              page.value = 1
              hasMore.value = true
              orderListData.value['pending_service'] = []
              await loadOrderList()
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
              
              // 刷新列表
              onRefresh()
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
              
              // 刷新列表
              onRefresh()
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
              
              // 刷新列表
              onRefresh()
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
              companion_id: companionId.value
            })
            
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
              companion_id: companionId.value
            })
            
            if (response.data.code === 0) {
              uni.showToast({
                title: '服务已结束',
                icon: 'success'
              })
              
              // 刷新列表
              onRefresh()
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
      url: `/subPackages/partner/review?orderId=${order.id}`
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
            
            // 调用删除订单API
            const deleteData = {
              order_id: order.id,
              companion_id: companionId.value
            }
            
            const response = await deleteCompanionOrder(deleteData)
            
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
  
  // 跳转到订单详情
  const navigateToDetail = (orderId) => {
    // uni.navigateTo({
    //   url: `/subPackages/partner/order/detail?orderId=${orderId}`
    // })
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
  
  // 格式化服务时间
  const formatServiceTime = (timeStr) => {
    if (!timeStr) return '待确认'
    
    const date = new Date(timeStr)
    
    // 格式化为 MM-DD HH:mm 格式
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${month}-${day} ${hours}:${minutes}`
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
    padding:0 24rpx;
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
    gap: 20rpx;
    margin-top: 20rpx;
  }
  
  .order-card {
    background: #FFFFFF;
    border-radius: 16rpx;
    padding: 24rpx;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
    border: 1rpx solid #f0f0f0;
  }
  
  /* 订单头部 */
  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
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
  
  /* 客户信息 */
  .customer-info {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
  }
  
  .customer-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 16rpx;
  }
  
  .customer-details {
    flex: 1;
  }
  
  .customer-name {
    font-size: 28rpx;
    color: #1A1A1A;
    font-weight: 500;
    margin-bottom: 4rpx;
    display: block;
  }
  
  .customer-phone {
    font-size: 24rpx;
    color: #666666;
  }
  
  /* 服务信息 */
  .service-info {
    display: flex;
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
  }
  
  .service-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
    flex-shrink: 0;
  }
  
  .service-details {
    flex: 1;
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
    align-items: center;
    margin-bottom: 8rpx;
  }
  
  .service-price {
    font-size: 26rpx;
    color: #1a1a1a;
  }
  
  .service-duration {
    font-size: 26rpx;
    color: #1a1a1a;
  }
  
  .service-amount {
    display: flex;
    align-items: center;
    margin-top: 8rpx;
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
  
  /* 服务地址和时间 */
  .service-location-time {
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
  }
  
  .location-info,
  .time-info {
    display: flex;
    align-items: flex-start;
    margin-bottom: 12rpx;
  }
  
  .location-info:last-child,
  .time-info:last-child {
    margin-bottom: 0;
  }
  
  .location-label,
  .time-label {
    font-size: 26rpx;
    color: #666666;
    min-width: 140rpx;
    flex-shrink: 0;
  }
  
  .location-value,
  .time-value {
    font-size: 26rpx;
    color: #1a1a1a;
    flex: 1;
    word-break: break-all;
    line-height: 1.4;
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

.action-btn.depart {
  background: #4CAF50;
  color: #FFFFFF;
  border-color: #4CAF50;
}

.action-btn.depart:active {
  background: #45a049;
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
    display: flex;
    justify-content: center;
    padding: 32rpx 0;
  }
  
  .loading-text {
    font-size: 26rpx;
    color: #999999;
  }
</style>