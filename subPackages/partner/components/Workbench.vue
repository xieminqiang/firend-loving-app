<template>
    <scroll-view class="workbench-content" scroll-y="true" refresher-enabled="true" :refresher-triggered="isRefreshing" @refresherrefresh="onRefresh" @refresherrestore="onRefreshRestore">
    
      <!-- 上线/下线状态控制 -->
      <view class="status-control">
        <view class="status-card" :class="{ 'online': isOnline }">
          <!-- 左侧：状态信息和头像 -->
          <view class="status-left">
            <!-- 头像显示 -->
            <view class="avatar-container" v-if="applicationInfo && applicationInfo.avatar">
              <image :src="$imgBaseUrl + applicationInfo.avatar" class="avatar-img" mode="aspectFill" />
            </view>
            
            <view class="status-info">
              <view class="status-indicator">
                <view class="status-dot" :class="{ 'active': isOnline }"></view>
                <text class="status-text">{{ isOnline ? '已上线' : '已下线' }}</text>
              </view>
              <text class="status-desc">{{ isOnline ? '正在接单中' : '暂停接单' }}</text>
            </view>
          </view>
          
          <!-- 右侧：切换按钮 -->
          <view class="status-right">
            <view class="toggle-button" :class="{ 'online': isOnline }" @click="toggleStatus">
          <!--    <view class="toggle-icon">
                <view class="icon-container">
                  <view class="icon-play" v-if="!isOnline"></view>
                  <view class="icon-pause" v-if="isOnline"></view>
                </view>
              </view> -->
              <text class="toggle-text">{{ isOnline ? '下线休息' : '开始上线' }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 位置管理 -->
      <view class="status-control">
        <view class="location-card">
          <view class="location-content">
            <view class="flex-between">
        <!--      <view class="location-header">
              <image class="location-icon" src="@/static/icons/partner/dizhi.png" mode="aspectFit" />
              <text class="location-title">当前位置</text>
            </view> -->
            <view class="location-actions">
              <view class="action-btn refresh-btn" @click="refreshLocation">
                <image class="btn-icon" src="@/static/icons/partner/shuaxin.png" mode="aspectFit" />
                <text class="location-btn-text">刷新位置</text>
              </view>
              <view class="action-btn select-btn" @click="selectLocation">
                <image class="btn-icon" src="@/static/icons/partner/shoudong.png" mode="aspectFit" />
                <text class="location-btn-text">手动选择</text>
              </view>
            </view>
              </view>
           
            <view class="location-info">
              <text class="location-address">{{ currentLocation || '正在获取位置...' }}</text>
            
            </view>
           
          </view>
        </view>
      </view>
      
      <!-- 日期安排 -->
      <view class="schedule-control">
          <view class="schedule-card" @click="goToDataSelect">
            <view class="schedule-header">
              <view class="schedule-title">
                <image class="schedule-icon" src="@/static/icons/profile/riqi.png" mode="aspectFit" />
                <text>日期安排</text>
              </view>
              <text class="schedule-status" :class="{ 'loading': scheduleLoading }">{{ currentScheduleStatus }}</text>
            </view>
          <view class="schedule-content">
            <text class="schedule-desc">{{ todaySchedule }}</text>
            <view class="schedule-actions">
              <view class="schedule-btn">设置时间</view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 最近订单 -->
      <view class="recent-orders">
        <view class="section-header">
          <text class="section-title">最近订单</text>
          <text class="view-all" @click="viewAllOrders">查看全部</text>
        </view>
        
        <!-- 加载状态 -->
        <view v-if="recentOrdersLoading" class="loading-orders">
          <text class="loading-text">加载中...</text>
        </view>
        
        <!-- 空状态 -->
        <view v-else-if="recentOrders.length === 0" class="empty-orders">
          <image src="@/static/images/empty.png" class="empty-icon" mode="aspectFit" />
          <text class="empty-text">暂无订单</text>
          <text class="empty-desc">开始接单，获得收入</text>
        </view>
        
        <!-- 订单列表 -->
        <view v-else class="order-list">
          <view 
            v-for="order in recentOrders" 
            :key="order.id"
            class="order-item"
            @click="navigateToOrderDetail(order.id)"
          >
            <!-- 订单头部 -->
            <view class="order-header">
              <view class="order-info">
                <text class="order-time">{{ formatOrderTime(order.created_at) }}</text>
              </view>
              <view class="order-status" :class="getOrderStatusClass(order.status)">
                <text class="status-text">{{ getOrderStatusText(order.status) }}</text>
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
            
            <!-- 服务地址和时间 -->
            <view v-if="[2, 3, 4, 5, 11].includes(order.status)" class="service-location-time">
              <view class="location-info" v-if="order.user">
                <text class="location-label">服务信息：</text>
                <text class="location-value">{{ order?.user?.nick_name }} {{ order?.user?.phone }}</text>
              </view>
              <view class="location-info">
                <text class="location-label">服务地址：</text>
                <view class="location-value-container">
                  <text class="location-value">{{ order.service_address }}</text>
                  <view class="location-actions">
                    <view class="nav-btn" @click.stop="openLocation(order)">
                      <text class="nav-text">导航</text>
                    </view>
                  </view>
                </view>
              </view>
              <view class="location-info">
                <text class="location-label">预约时间：</text>
                <text class="location-value">{{ formatServiceDateTime(order.service_date, order.service_time) }}</text>
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
        </view>

      </view>
       <view style="height: 180rpx;"></view>
    </scroll-view>
  
  <!-- 视频上传弹框 -->
  <VideoUploadModal 
    :show="showVideoUploadModal" 
    :applicationInfo="applicationInfo"
    @close="hideVideoUploadModal"
    @success="handleVideoUploadSuccess"
  />
  

</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick, onUnmounted } from 'vue'
import { getCurrentLocationAddress, getCacheStatus } from '../utils/location.js'
import { updateCompanionOnlineStatus, getCompanionSchedule } from '@/api/user.js'
import { 
  getCompanionActiveOrders,
  acceptCompanionOrder,
  rejectCompanionOrder,
  arrivedCompanionOrder,
  departCompanionOrder,
  endCompanionService
} from '@/api/order.js'
import { processAddress, analyzeAddress } from '../utils/address.js'
import VideoUploadModal from './VideoUploadModal.vue'

// 定义props
const props = defineProps({
  applicationInfo: {
    type: Object,
    default: null
  }
})

// 状态管理
const isOnline = ref(false)
const currentLocation = ref('')
const locationUpdateTime = ref('')
const isInitialized = ref(false)
const isUpdatingStatus = ref(false) // 防止重复点击

// 视频上传相关状态
const showVideoUploadModal = ref(false)

// 日期安排相关状态
const scheduleData = ref([])
const scheduleLoading = ref(false)

// 最近订单相关状态
const recentOrders = ref([])
const recentOrdersLoading = ref(false)

// 刷新相关状态
const isRefreshing = ref(false)

// 计算属性：检查applicationInfo是否有效
const hasValidApplicationInfo = computed(() => {
  return props.applicationInfo && typeof props.applicationInfo === 'object'
})

// 获取今日的日期数据
const getTodayScheduleData = () => {
  if (!scheduleData.value || scheduleData.value.length === 0) {
    return null
  }
  
  // 查找今天的数据
  const todayData = scheduleData.value.find(item => item.is_today === true)
  return todayData
}

// 计算今日可约时间段数量
const getTodayAvailableSlots = () => {
  const todayData = getTodayScheduleData()
  if (!todayData || !todayData.schedule) {
    return 0
  }
  
  return Object.values(todayData.schedule).filter(status => status === 1).length
}

// 计算今日已约时间段数量
const getTodayBookedSlots = () => {
  const todayData = getTodayScheduleData()
  if (!todayData || !todayData.schedule) {
    return 0
  }
  
  return Object.values(todayData.schedule).filter(status => status === 3).length
}

// 日期安排相关计算属性
const currentScheduleStatus = computed(() => {
  if (scheduleLoading.value) {
    return '加载中...'
  }
  
  const todayData = getTodayScheduleData()
  if (!todayData) {
    return '未设置'
  }
  
  const availableCount = getTodayAvailableSlots()
  const bookedCount = getTodayBookedSlots()
  
  if (bookedCount > 0) {
    return `${bookedCount}个已约`
  } else if (availableCount === 48) {
    return '全天可约'
  } else if (availableCount === 0) {
    return '全天休息'
  } else {
    return `${availableCount}个可约`
  }
})

const todaySchedule = computed(() => {
  if (scheduleLoading.value) {
    return '正在加载今日安排...'
  }
  
  const todayData = getTodayScheduleData()
  if (!todayData) {
    return '今日未设置时间安排'
  }
  
  const availableCount = getTodayAvailableSlots()
  const bookedCount = getTodayBookedSlots()
  
  if (bookedCount > 0) {
    return `今日有${bookedCount}个时间点已被预约`
  } else if (availableCount === 48) {
    return '今日全天可接单'
  } else if (availableCount === 0) {
    return '今日休息，暂停接单'
  } else {
    return `今日可接单 ${availableCount}个时间点`
  }
})

// 从applicationInfo中获取默认的在线状态
const initOnlineStatus = () => {
  if (hasValidApplicationInfo.value && typeof props.applicationInfo.is_online !== 'undefined') {
    isOnline.value = props.applicationInfo.is_online === 1
    console.log('从applicationInfo获取在线状态:', isOnline.value, '原始值:', props.applicationInfo.is_online)
  } else {
    isOnline.value = false
    console.log('使用默认在线状态: 下线')
  }
}

// 初始化组件
const initializeComponent = async () => {
  if (isInitialized.value) {
    console.log('组件已经初始化过，跳过重复初始化')
    return
  }
  
  console.log('开始初始化Workbench组件')
  
  // 等待下一个tick确保DOM更新
  await nextTick()
  
  // 初始化在线状态
  initOnlineStatus()
  
  // 获取位置信息（不强制刷新）
  getLocationInfo()
  
  // 获取日期安排数据
  await fetchScheduleData()
  
  // 获取最近订单数据
  await fetchRecentOrders()
  
  isInitialized.value = true
  console.log('Workbench组件初始化完成')
}

// 监听applicationInfo变化
watch(() => props.applicationInfo, (newVal, oldVal) => {
  console.log('applicationInfo发生变化:', { old: oldVal, new: newVal })
  
  if (newVal && hasValidApplicationInfo.value) {
    // 如果组件已经初始化过，只更新在线状态、日期安排数据和最近订单数据
    if (isInitialized.value) {
      console.log('组件已初始化，更新在线状态、日期安排数据和最近订单数据')
      initOnlineStatus()
      fetchScheduleData()
      fetchRecentOrders()
    } else {
      // 首次初始化
      initializeComponent()
    }
  }
}, { immediate: true, deep: true })

// 切换上线/下线状态
const toggleStatus = async () => {
  if (isUpdatingStatus.value) {
    console.log('正在更新状态，忽略重复点击')
    return
  }
  
  const newStatus = !isOnline.value
  const statusText = newStatus ? '上线' : '下线'
  
  // 检查是否需要上传视频
  if (newStatus && hasValidApplicationInfo.value && props.applicationInfo.can_accept_orders === 'N') {
    // 检查是否已有视频且已通过审核
    if (!props.applicationInfo.intro_video_url || props.applicationInfo.video_review_status !== 'approved') {
      // 显示视频上传弹框
      showVideoUploadModal.value = true
      return
    }
  }
  
  uni.showModal({
    title: `确认${statusText}`,
    content: newStatus ? '上线后将开始接收订单，确认上线吗？' : '下线后将停止接收订单，确认下线吗？',
    success: async (res) => {
      if (res.confirm) {
        // 如果是上线操作，先请求订阅消息权限
        if (newStatus) {
          await requestSubscribeMessage()
        }
        await updateOnlineStatus(newStatus)
      }
    }
  })
}

// 更新在线状态到服务器
const updateOnlineStatus = async (newStatus) => {
  isUpdatingStatus.value = true
  
  try {
    // 获取当前位置信息
    let locationInfo = null
    
    if (newStatus) {
      // 上线时需要获取位置信息
      uni.showLoading({ title: '获取位置中...' })
      
      try {
        locationInfo = await getCurrentLocationAddress(false) // 强制刷新位置
        console.log('获取位置成功:', locationInfo)
      } catch (error) {
        console.error('获取位置失败:', error)
        uni.hideLoading()
        uni.showToast({
          title: '获取位置失败，无法上线',
          icon: 'none'
        })
        return
      }
    } else {
      // 下线时可以使用缓存的位置信息
      const cacheStatus = getCacheStatus()
      if (cacheStatus.hasCache) {
        locationInfo = {
          latitude: cacheStatus.coordinates.latitude,
          longitude: cacheStatus.coordinates.longitude,
          address: cacheStatus.address
        }
      }
    }
    
    // 处理地址字符串
    const processedAddress = processAddress(locationInfo ? locationInfo.address : '')
    
    // 准备请求数据
    const requestData = {
      is_online: newStatus ? 1 : 0,
      latitude: locationInfo ? locationInfo.latitude : null,
      longitude: locationInfo ? locationInfo.longitude : null,
      location_text: processedAddress
    }
    
    // 添加详细的调试信息
    console.log('准备更新在线状态:', requestData)
  
    
    // 调用API更新状态
    const response = await updateCompanionOnlineStatus(requestData)
     console.log('在线', response )
    if (response.data && response.data.code === 0) {
      // 更新成功
      isOnline.value = newStatus
      
      // 更新位置显示
      if (locationInfo) {
        currentLocation.value = locationInfo.address
        locationUpdateTime.value = new Date().toLocaleTimeString()
      }
      
      uni.hideLoading()
      uni.showToast({
        title: newStatus ? '已上线，开始接单' : '已下线，暂停接单',
       icon: 'none'
      })
      
      console.log('在线状态更新成功:', response.data)
    } else {
      // 更新失败
      uni.hideLoading()
      uni.showToast({
        title: response.data?.msg || '状态更新失败',
       icon: 'none'
      })
      console.error('在线状态更新失败:', response.data)
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '网络错误，请重试',
       icon: 'none'
    })
    console.error('更新在线状态失败:', error)
  } finally {
    isUpdatingStatus.value = false
  }
}

// 获取位置信息（不强制刷新）
const getLocationInfo = () => {
  const cacheStatus = getCacheStatus()
  
  // 如果有有效缓存，直接使用
  if (cacheStatus.hasCache && cacheStatus.isValid) {
    currentLocation.value = cacheStatus.address
    locationUpdateTime.value = new Date(cacheStatus.timestamp).toLocaleTimeString()
    console.log('使用缓存位置信息:', cacheStatus.address)
    console.log('使用缓存:', cacheStatus)
     updateLocationToServer(cacheStatus.coordinates.latitude, cacheStatus.coordinates.longitude, cacheStatus.address)
    return
  }
  
  // 没有有效缓存时，获取位置
  getCurrentLocationAddress(false)
    .then(locationInfo => {
      currentLocation.value = locationInfo.address
      locationUpdateTime.value = new Date().toLocaleTimeString()
      console.log('获取位置成功', locationInfo)
      
      // 更新位置信息到服务器
      updateLocationToServer(locationInfo.latitude, locationInfo.longitude, locationInfo.address)
    })
    .catch(err => {
      console.error('获取位置失败:', err)
      // 如果获取失败，显示默认信息
      currentLocation.value = '位置获取失败'
      locationUpdateTime.value = '获取失败'
    })
}

// 刷新位置
const refreshLocation = () => {
  uni.showLoading({
    title: '更新位置中'
  })
  
  getCurrentLocationAddress(false) // 不强制刷新
    .then(locationInfo => {
      // 更新显示
      currentLocation.value = locationInfo.address
      locationUpdateTime.value = new Date().toLocaleTimeString()
      console.log('位置更新成功', locationInfo)
      uni.hideLoading()
      uni.showToast({
        title: '位置更新成功',
        icon: 'none'
      })
      
   

        updateLocationToServer(locationInfo.latitude, locationInfo.longitude, locationInfo.address)
     
    })
    .catch(err => {
      uni.hideLoading()
      uni.showToast({
        title: '获取位置失败',
        icon: 'none'
      })
      console.error('获取位置失败:', err)
    })
}

// 更新位置信息到服务器
const updateLocationToServer = async (latitude, longitude, address) => {

  try {
    // 处理地址字符串
    const processedAddress = processAddress(address)
    
    const requestData = {
      is_online: isOnline.value ? 1 : 0,
      latitude: latitude,
      longitude: longitude,
      location_text: processedAddress
    }
    
    console.log('准备更新位置信息到服务器:', requestData)
    console.log('位置描述分析:', analyzeAddress(address))
    
    const response = await updateCompanionOnlineStatus(requestData)
    
    if (response.data && response.data.code === 0) {
      console.log('位置信息更新成功:', response.data)
    } else {
      console.error('位置信息更新失败:', response.data?.msg)
    }
  } catch (error) {
    console.error('位置信息更新API调用失败:', error)
  }
}

// 手动选择位置
const selectLocation = () => {
  // #ifdef MP-WEIXIN
  uni.chooseLocation({
    success: async (res) => {
      const address = res.address || res.name || '已选择位置'
      console.log('手动选择位置', res)
      
      // 更新显示
      currentLocation.value = address
      locationUpdateTime.value = new Date().toLocaleTimeString()
      
      // 如果用户已上线，更新位置信息到服务器
      await updateLocationToServer(res.latitude, res.longitude, address)
    },
    fail: (err) => {
      if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
        uni.showToast({
          title: '获取位置失败',
          icon: 'none'
        })
        console.error('获取位置失败:', err.errMsg)
      }
    }
  })
  // #endif
  // #ifndef MP-WEIXIN
  uni.showToast({
    title: '请在微信小程序中使用地图选点',
    icon: 'none'
  })
  // #endif
}

// 查看全部订单
const viewAllOrders = () => {
  // 确保有applicationInfo和id
  if (!props.applicationInfo || !props.applicationInfo.id) {
    uni.showToast({
      title: '用户信息不完整',
      icon: 'none'
    })
    return
  }
  
  uni.navigateTo({
    url: `/subPackages/partner/order/index?companion_id=${props.applicationInfo.id}`
  })
}

// 跳转到订单详情
const navigateToOrderDetail = (orderId) => {
  uni.navigateTo({
    url: `/subPackages/partner/order/detail?orderId=${orderId}&companion_id=${props.applicationInfo.id}`
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
    case 'end':
      handleEndService(order)
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
            companion_id: Number(props.applicationInfo.id)
          })
          
          if (response.data.code === 0) {
            uni.showToast({
              title: '接单成功',
              icon: 'success'
            })
            
            // 刷新最近订单数据
            await fetchRecentOrders()
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
            companion_id: Number(props.applicationInfo.id)
          })
          
          if (response.data.code === 0) {
            uni.showToast({
              title: '已拒绝订单',
              icon: 'success'
            })
            
            // 刷新最近订单数据
            await fetchRecentOrders()
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
            companion_id: Number(props.applicationInfo.id)
          })
          
          if (response.data.code === 0) {
            uni.showToast({
              title: '已确认到达',
              icon: 'success'
            })
            
            // 刷新最近订单数据
            await fetchRecentOrders()
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
            companion_id: Number(props.applicationInfo.id)
          })
          
          if (response.data.code === 0) {
            uni.showToast({
              title: '已确认出发',
              icon: 'success'
            })
            
            // 刷新最近订单数据
            await fetchRecentOrders()
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
            companion_id: Number(props.applicationInfo.id)
          })
          
          if (response.data.code === 0) {
            uni.showToast({
              title: '服务已结束',
              icon: 'success'
            })
            
            // 刷新最近订单数据
            await fetchRecentOrders()
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

// 请求订阅消息权限
const requestSubscribeMessage = async () => {
  const tmplId = 'vrMAJmeAOA0j3yRGX6AjNCOvfgzlJp8T1wWLucyCwKc'
  
  try {
    console.log('开始请求订阅消息权限')
    
    const res = await new Promise((resolve, reject) => {
      uni.requestSubscribeMessage({
        tmplIds: [tmplId],
        success: (result) => {
          console.log('订阅消息请求结果:', result)
          resolve(result)
        },
        fail: (error) => {
          console.error('订阅消息请求失败:', error)
          reject(error)
        }
      })
    })
    
    // 处理订阅结果
    if (res[tmplId] === 'accept') {
      console.log('用户同意订阅消息')
      uni.showToast({
        title: '已开启接单提醒',
        icon: 'success'
      })
    } else if (res[tmplId] === 'reject') {
      console.log('用户拒绝订阅消息')
      // 引导用户去设置页面重新授权
      uni.showModal({
        title: '接单提醒权限',
        content: '为了您能及时接收新订单通知，是否去设置页面重新授权？',
        confirmText: '去设置',
        cancelText: '暂不开启',
        success: (modalRes) => {
          if (modalRes.confirm) {
            // 打开设置页面
            uni.openSetting({
              success: (settingRes) => {
                // 检查用户是否开启了订阅消息权限
                if (settingRes.authSetting['scope.subscribeMessage']) {
                  // 用户同意订阅，再次请求
                  uni.requestSubscribeMessage({
                    tmplIds: [tmplId],
                    success: (subscribeRes) => {
                      console.log('重新授权成功:', subscribeRes)
                      uni.showToast({
                        title: '已开启接单提醒',
                        icon: 'success'
                      })
                    },
                    fail: (err) => {
                      console.log('重新授权失败:', err)
                    }
                  })
                } else {
                  uni.showToast({
                    title: '未开启接单提醒',
                    icon: 'none'
                  })
                }
              },
              fail: (err) => {
                console.error('打开设置页面失败:', err)
              }
            })
          } else {
            uni.showToast({
              title: '未开启接单提醒',
              icon: 'none'
            })
          }
        }
      })
    } else {
      // 其他情况（如用户点击了关闭按钮等）
      console.log('用户未明确选择订阅消息')
      uni.showToast({
        title: '未开启接单提醒',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('订阅消息请求异常:', error)
    // 即使订阅失败也不影响上线流程
    uni.showToast({
      title: '订阅消息请求失败',
      icon: 'none'
    })
  }
}

// 视频上传相关方法
const hideVideoUploadModal = () => {
  showVideoUploadModal.value = false
}

// 处理视频上传成功
const handleVideoUploadSuccess = (data) => {
  console.log('视频上传成功:', data)
  // 发送事件通知父组件刷新数据
  uni.$emit('applicationStatusChanged', data)
}

// 获取日期安排数据
const fetchScheduleData = async () => {
  if (!hasValidApplicationInfo.value || !props.applicationInfo.id) {
    console.log('applicationInfo不完整，跳过获取日期安排数据')
    return
  }
  
  // scheduleLoading.value = true
  
  try {
    console.log('开始获取日期安排数据，companion_id:', props.applicationInfo.id)
    
    const requestData = {
      companion_id: props.applicationInfo.id
    }
    
    const response = await getCompanionSchedule(requestData)
    console.log('日期安排数据获取成功:', response)
    
    if (response.data && response.data.code === 0) {
      scheduleData.value = response.data.data
      console.log('解析后的日期安排数据:', scheduleData.value)
    } else {
      console.error('获取日期安排数据失败:', response.data?.msg)
    }
  } catch (error) {
    console.error('获取日期安排数据接口调用失败:', error)
  } finally {
    scheduleLoading.value = false
  }
}

// 获取最近订单数据
const fetchRecentOrders = async () => {
  if (!hasValidApplicationInfo.value || !props.applicationInfo.id) {
    console.log('applicationInfo不完整，跳过获取最近订单数据')
    return
  }

  // recentOrdersLoading.value = true
  try {
    console.log('开始获取最近订单数据，companion_id:', props.applicationInfo.id)
    const requestData = {
      companion_id: Number(props.applicationInfo.id),
      page: 1, // 只获取第一页
      page_size: 10 // 获取10条
    }
    const response = await getCompanionActiveOrders(requestData)
    console.log('最近订单数据获取成功:', response)
    if (response.data && response.data.code === 0) {
      recentOrders.value = response.data.data.list
      console.log('解析后的最近订单数据:', recentOrders.value)
    } else {
      console.error('获取最近订单数据失败:', response.data?.msg)
    }
  } catch (error) {
    console.error('获取最近订单数据接口调用失败:', error)
  } finally {
    recentOrdersLoading.value = false
  }
}

// 日期安排相关方法
const goToDataSelect = () => {
  // 确保有applicationInfo和id
  if (!props.applicationInfo || !props.applicationInfo.id) {
    uni.showToast({
      title: '用户信息不完整',
      icon: 'none'
    })
    return
  }
  
  uni.navigateTo({
    url: `/subPackages/partner/components/DataSelect?companion_id=${props.applicationInfo.id}`
  })
}

// 刷新日期安排数据
const refreshScheduleData = async () => {
  await fetchScheduleData()
}

// 下拉刷新
const onRefresh = async () => {
  if (isRefreshing.value) return // 防止重复刷新
  
  isRefreshing.value = true
  
  try {
    // 并行刷新所有数据
    await Promise.all([
      fetchScheduleData(),
      fetchRecentOrders()
    ])
    
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

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const statusMap = {
    2: '等待接单',
    3: '我已出发',
    4: '已到达，等待开始服务',
    5: '服务中',
  	11: '待服务'
  }
  return statusMap[status] || '未知状态'
}

// 获取订单状态样式类
const getOrderStatusClass = (status) => {
  const statusMap = {
    2: 'status-pending',
    3: 'status-departing',
    4: 'status-arrived',
    5: 'status-serving',
    11: 'status-departing'
  }
  return statusMap[status] || 'status-default'
}

// 格式化订单时间
const formatOrderTime = (timeStr) => {
  if (!timeStr) return ''
  
  const date = new Date(timeStr)
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





// 页面加载时的处理
onMounted(() => {
  console.log('Workbench组件mounted，applicationInfo状态:', {
    hasApplicationInfo: !!props.applicationInfo,
    applicationInfo: props.applicationInfo
  })
  
  // 如果applicationInfo已经存在，立即初始化
  if (hasValidApplicationInfo.value) {
    initializeComponent()
  } else {
    console.log('applicationInfo还未准备好，等待watch触发初始化')
  }
  
  // 监听日期安排数据更新事件
  uni.$on('scheduleDataUpdated', handleScheduleDataUpdated)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  uni.$off('scheduleDataUpdated', handleScheduleDataUpdated)
})

// 处理日期安排数据更新事件
const handleScheduleDataUpdated = async (data) => {
  console.log('收到日期安排数据更新事件:', data)
  
  // 检查是否是当前用户的数据
  if (data.companion_id === props.applicationInfo?.id) {
    console.log('刷新日期安排数据')
    await fetchScheduleData()
  }
}
</script>

<style lang="scss" scoped>
.workbench-content {
  padding: 20rpx;
  height: 100vh;
  box-sizing: border-box;
}



// 状态控制样式
.status-control {
  margin-bottom: 20rpx;
}

.status-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 28rpx;

  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  overflow: hidden;
  

}

.status-left {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0; // 防止flex子元素溢出
}

.status-info {
  margin-left: 20rpx;
  flex: 1;
  min-width: 0; // 防止文本溢出
}

.status-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #CCCCCC;
  margin-right: 12rpx;
  transition: all 0.3s ease;
  position: relative;
  
  &.active {
    background: #4CAF50;
    box-shadow: 0 0 8rpx rgba(76, 175, 80, 0.4);
    
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 8rpx;
      height: 8rpx;
      background: #FFFFFF;
      border-radius: 50%;
    }
  }
}

.status-text {
  font-size: 28rpx;
  font-weight: 600;
  white-space: nowrap;
  transition: all 0.3s ease;
  
  // 下线状态
  &:not(.online) {
    color: #666666;
  }
  
  // 上线状态
  .online & {
    color: #4CAF50;
  }
}

.status-desc {
  font-size: 24rpx;
  color: #666666;
  display: block;
  white-space: nowrap;
}

// 头像样式
.avatar-container {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  overflow: hidden;

  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.3);
  }
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.status-right {
  display: flex;
  align-items: center;
  margin-left: 20rpx;
  flex-shrink: 0;
}

.toggle-button {
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 50000rpx;
  padding: 16rpx 28rpx;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  position: relative;
  overflow: hidden;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &.online {
    background: linear-gradient(135deg, #F44336 0%, #FF5722 100%);
    border: none;
    
    &::before {
      left: 100%;
    }
    
    .toggle-icon {
      transform: scale(1.1);
    }
    
    .icon-play {
      transform: scale(0.8);
    }
    
    .icon-pause::before,
    .icon-pause::after {
      transform: scale(1.2);
    }
  }
  
  &:active {
    transform: scale(0.96);
    
    &::before {
      left: 100%;
    }
    
    .toggle-icon {
      transform: scale(0.9);
    }
  }
}

.toggle-icon {
  margin-right: 8rpx;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-container {
  width: 32rpx;
  height: 32rpx;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-play {
  width: 0;
  height: 0;
  border-left: 14rpx solid #FFFFFF;
  border-top: 10rpx solid transparent;
  border-bottom: 10rpx solid transparent;
  margin-left: 3rpx;
  transition: all 0.3s ease;
  filter: drop-shadow(0 2rpx 4rpx rgba(0, 0, 0, 0.2));
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: -10rpx;
    left: -14rpx;
    width: 0;
    height: 0;
    border-left: 14rpx solid rgba(255, 255, 255, 0.3);
    border-top: 10rpx solid transparent;
    border-bottom: 10rpx solid transparent;
    z-index: -1;
  }
}

.icon-pause {
  display: flex;
  gap: 6rpx;
  align-items: center;
  justify-content: center;
  position: relative;
}

.icon-pause::before,
.icon-pause::after {
  content: '';
  width: 5rpx;
  height: 18rpx;
  background: #FFFFFF;
  border-radius: 3rpx;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.2);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3rpx;
    z-index: -1;
  }
}

.toggle-text {
  color: #FFFFFF;
  font-size: 26rpx;
  font-weight: 600;
  text-shadow: 0 1rpx 2rpx rgba(0, 0, 0, 0.1);
}

// 位置管理样式


.location-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 28rpx;
  
}

.location-content {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.location-header {
  display: flex;
  align-items: center;
}

.location-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 6rpx;

}

.location-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.location-info {
  margin-top: 0rpx;
}

.location-address {
  font-size: 26rpx;
  color: #1A1A1A;
  display: block;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.location-time {
  font-size: 22rpx;
  color: #999999;
  display: block;
}

.location-actions {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  margin-top: 8rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 20rpx;
  border-radius: 10rpx;
  border: 1rpx solid #E5E5E5;
  background: #F7F8FA;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:active {
    transform: scale(0.96);
    background: #F0F0F0;
  }
}

.refresh-btn {
  border-color: #5AC8FA;
  background: rgba(90, 200, 250, 0.1);
}

.select-btn {
  border-color: #FF9500;
  background: rgba(255, 149, 0, 0.1);
}

.btn-icon {
  width: 28rpx;
  height: 28rpx;
  margin-right: 8rpx;
  display: inline-block;
  vertical-align: middle;
}

.location-btn-text {
  font-size: 24rpx;
  color: #1A1A1A;
  font-weight: 500;
}

.recent-orders {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 28rpx;
  box-sizing: border-box;
}

.loading-orders {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999999;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-item {
  background: #FFFFFF;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #f0f0f0;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
}

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

.status-departing {
  color: #007bff;
}

.status-arrived {
  color: #007bff;
}

.status-serving {
  color: #28a745;
}

.status-default {
  color: #999999;
}

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
  font-weight: 500;
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

.service-location-time {
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.location-info,
.time-info {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
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
  
  .location-value-container {
    display: flex;
    align-items: center;
    flex: 1;
    gap: 16rpx;
  }
  
  .location-value-container .location-value {
    flex: 1;
    min-width: 0;
  }
  
  .location-actions {
    display: flex;
    align-items: center;
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
  
  .nav-icon {
    width: 24rpx;
    height: 24rpx;
    margin-right: 6rpx;
  }
  
  .nav-text {
    font-size: 22rpx;
    color: #FFFFFF;
    font-weight: 500;
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









.action-text {
  color: inherit;
  font-size: 26rpx;
  font-weight: 500;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.view-all {
  font-size: 24rpx;
  color: #7363FF;
  font-weight: 500;
}

.empty-orders {
  text-align: center;
  padding: 60rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 24rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 28rpx;
  color: #666666;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #666666;
  display: block;
}

// 日期安排样式
.schedule-control {
  margin-bottom: 20rpx;
}

.schedule-card {
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 28rpx;
  box-shadow: 0 4rpx 24rpx rgba(115,99,255,0.06);
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.schedule-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
  display: flex;
  align-items: center;
}

.schedule-icon {
  width: 36rpx;
  height:36rpx;
  margin-right: 8rpx;
}

.schedule-status {
  font-size: 24rpx;
  color: #4CAF50;
  background: rgba(76, 175, 80, 0.1);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  
  &.loading {
    color: #FF9500;
    background: rgba(255, 149, 0, 0.1);
    animation: pulse 1.5s ease-in-out infinite;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.schedule-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.schedule-desc {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.4;
}

.schedule-actions {
  display: flex;
  gap: 12rpx;
}

.schedule-btn, .quick-btn {
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  color: #FFFFFF;
  padding: 8rpx 16rpx;
  border-radius: 12rpx;
  font-size: 24rpx;
  font-weight: 500;
 
  

}

.quick-btn {
  background: linear-gradient(135deg, #FF9500 0%, #FF5722 100%);
}

.btn-text {
  color: #FFFFFF;
  font-size: 24rpx;
  font-weight: 500;
}































































/* uni-data-picker弹框样式优化 */
:deep(.uni-data-picker__popup) {
  border-radius: 20rpx 20rpx 0 0 !important;
}

:deep(.uni-data-picker__popup-header) {
  border-radius: 20rpx 20rpx 0 0 !important;
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%) !important;
}

:deep(.uni-data-picker__popup-content) {
  border-radius: 0 0 0 0 !important;
}

:deep(.uni-data-picker__popup-item) {
  font-size: 28rpx !important;
  color: #1A1A1A !important;
  font-weight: 500 !important;
}

:deep(.uni-data-picker__popup-item-selected) {
  color: #7363FF !important;
  font-weight: 600 !important;
}

.time-picker-content {
  background: #FFFFFF;
  border-radius: 20rpx;
  width: 85%;
  max-width: 640rpx;
  position: relative;
  z-index: 1001;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.15);
  animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40rpx) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.time-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid rgba(115, 99, 255, 0.1);
}

.time-picker-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.time-picker-body {
  padding: 40rpx 32rpx;
}

.time-input-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 40rpx;
  padding: 8rpx 0;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.time-label {
  font-size: 28rpx;
  color: #1A1A1A;
  font-weight: 500;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -4rpx;
    left: 0;
    width: 0;
    height: 2rpx;
    background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: 100%;
  }
}

.time-display {
  flex: 1;
  margin-left: 32rpx;
  background: linear-gradient(135deg, #f8f9fe 0%, #ffffff 100%);
  border: 2rpx solid #e9ecf5;
  border-radius: 20rpx;
  padding: 24rpx 28rpx;
  text-align: center;
  min-width: 160rpx;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  &:active {
    border-color: #7363FF;
    transform: scale(0.98);
  }
  
  /* 添加微妙的阴影效果 */
  box-shadow: 0 2rpx 8rpx rgba(115, 99, 255, 0.08);
}

.time-text {
  color: #1A1A1A;
  font-size: 28rpx;
  font-weight: 500;
}

.time-placeholder {
  color: #999999;
  font-size: 28rpx;
}



.time-picker-footer {
  display: flex;
  gap: 20rpx;
  padding: 28rpx 32rpx;
  border-top: 1rpx solid rgba(115, 99, 255, 0.1);
}

.cancel-btn, .confirm-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 16rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #f8f9fe;
  color: #666666;
  border: 2rpx solid #e9ecf5;
  
  &:active {
    background: #f0f0f0;
    transform: scale(0.98);
  }
}

.confirm-btn {
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  color: #FFFFFF;
  box-shadow: 0 6rpx 20rpx rgba(115, 99, 255, 0.3);
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(115, 99, 255, 0.4);
  }
}

// 时间选择弹框样式
.time-select-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

.time-select-content {
  background: #FFFFFF;
  border-radius: 20rpx 20rpx 0 0;
  width: 100%;
  max-height: 70%;
  position: relative;
  z-index: 1001;
  box-shadow: 0 -20rpx 60rpx rgba(0, 0, 0, 0.15);
  animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.time-select-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 32rpx;
  border-bottom: 1rpx solid rgba(115, 99, 255, 0.1);
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 20rpx 20rpx 0 0;
}

.time-select-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #FFFFFF;
}

.time-select-body {
  padding: 32rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.time-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.time-item {
  background: #F8F9FA;
  border: 2rpx solid #E5E5E5;
  border-radius: 16rpx;
  padding: 20rpx 16rpx;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.active {
    background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
    border-color: #7363FF;
    box-shadow: 0 4rpx 16rpx rgba(115, 99, 255, 0.3);
  }
}

.time-item-text {
  font-size: 26rpx;
  font-weight: 500;
  color: #1A1A1A;
  
  .time-item.active & {
    color: #FFFFFF;
  }
}

</style> 
