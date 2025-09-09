<template>
  <view class="submit-order-container">
    <scroll-view 
      scroll-y="true" 
      class="scroll-content" 
    >
      <!-- 地址选择 -->
      <view class="section-card">
        <view class="section-item" @click="selectAddress">
          <view class="item-left">
            <image src="/static/icons/friend/yuan_dingwei.png" class="item-icon" mode="aspectFit" />
            <text class="item-text" :class="{ 'selected': selectedAddress !== '请选择地址' }">{{ selectedAddress }}</text>
          </view>
          <image src="/static/icons/common/arrow-right.png" class="arrow-icon" mode="aspectFit" />
        </view>
      </view>

      <!-- 服务时间和出行方式 -->
      <view class="section-card">
        <view class="section-item" @click="selectServiceTime">
          <view class="item-left">
            <text class="item-text">服务时间</text>
          </view>
          <view class="item-right">
            <text class="time-text">{{ serviceTime }}</text>
            <image src="/static/icons/common/arrow-right.png" class="arrow-icon" mode="aspectFit" />
          </view>
        </view>
        <view class="section-item">
          <view class="item-left">
            <text class="item-text">出行方式</text>
          </view>
          <view class="item-right">
            <view class="radio-group">
              <view class="radio-item" @click="selectTravelMethod('taxi')">
                <view class="radio-circle" :class="{ active: travelMethod === 'taxi' }">
                  <view v-if="travelMethod === 'taxi'" class="radio-dot"></view>
                </view>
                <text class="radio-text">出租车</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 服务项目 -->
      <view class="section-card " v-if="serviceInfo?.service">
        <view class="service-item">
          <image :src="$imgBaseUrl + serviceInfo?.service?.image_url" class="service-img" mode="aspectFill" />
          <view class="service-info">
            <text class="service-title">{{ serviceInfo?.service?.name }}</text>
            <view class="service-price-row">
              <text class="service-price">¥{{ serviceInfo?.price_info?.unit_price }}</text>
              <text class="service-duration">/ {{ serviceInfo?.price_info?.unit}}</text>
            </view>
            <text class="service-provider">{{ params.nickname}}</text>
          </view>
          <view class="quantity-selector">
            <view 
              class="quantity-btn minus" 
              :class="{ disabled: quantity <= (serviceInfo?.price_info?.min_quantity || 1) }"
              @click="decreaseQuantity"
            >
              <image src="/static/icons/friend/del_icon.png" class="quantity-icon" mode="aspectFit" />
            </view>
            <text class="quantity-text">{{ quantity }}</text>
            <view class="quantity-btn plus" @click="increaseQuantity">
              <image src="/static/icons/friend/add_icon.png" class="quantity-icon" mode="aspectFit" />
            </view>
          </view>
        </view>
      </view>

      <!-- 费用 -->
      <view class="section-card">
                <view class="section-item">
          <view class="item-left">
            <text class="item-text">往返车费</text>
          </view>
          <view class="item-right">
            <text class="fare-text">¥{{ roundTripFare.toFixed(2) }}</text>
          </view>
        </view>
        <view class="fare-detail">
          <text class="fare-detail-text">全程共{{ totalDistance }}km，出租出行收取来回车费，1km内，起步10元。里程计价1.5元/km</text>
         
        </view>
      </view>

      <!-- 订单备注 -->
      <view class="section-card">
        <view class="section-item">
          <view class="item-left">
            <text class="item-text">订单备注</text>
          </view>
          <view class="item-right">
            <input 
              v-model="orderNotes" 
              placeholder="请输入备注信息" 
              class="notes-input"
              maxlength="200"
            />
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部提交按钮 -->
    <view class="action-buttons">
      <view class="action-container">
        <view class="price-summary">
          <text class="total-price">合计: ¥{{ totalPrice.toFixed(2) }}</text>
        </view>
        <view class="submit-btn" @click="submitOrder">
          提交订单
        </view>
      </view>
    </view>

        <!-- 时间选择弹框 -->
    <uni-popup ref="timePickerPopup" type="bottom" :mask-click="true" @close="showTimePicker = false" round="20">
      <view class="time-picker-content">
        <!-- 日期导航栏 -->
        <view class="day-filter">
          <scroll-view 
            class="day-scroll" 
            scroll-x="true" 
            show-scrollbar="false" 
            :scroll-left="dayScrollLeft" 
            :scroll-with-animation="dayScrollWithAnimation"
          >
            <view class="day-tabs">
              <view 
                v-for="(day, index) in availableSchedule" 
                :key="index"
                class="day-tab"
                :class="{ active: selectedDayIndex === index }"
                @click="switchDay(index)"
              >
                <text class="day-name">{{ day.day_name }}</text>
                <text class="day-date">{{ day.date }}</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 时间段列表 -->
        <view class="time-slots-container">
          <view class="time-slots-grid">
            <view 
              v-for="(timeSlot, index) in getCurrentDayTimeSlots()" 
              :key="index"
              class="time-slot-item"
              :class="{ 
                'available': timeSlot.status === 1,
                'unavailable': timeSlot.status === 2,
                'selected': selectedTimeSlot === timeSlot
              }"
              @click="selectTimeSlot(timeSlot)"
            >
              <text class="time-text">{{ timeSlot.time }}</text>
             
            </view>
         
          </view>
          <view style="height: 40rpx;"></view>
        </view>


      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { getServiceInfo, calculateDistance, getCompanionAvailableSchedule, createOrderV2, orderParams } from '@/api/order.js'
import { sendSubscribeMessage, getCompanionWxOpenId } from '@/api/user.js'

// 页面参数
const params = ref({})

// 表单数据
const serviceTime = ref('')
const travelMethod = ref('taxi')
const quantity = ref(1)
const roundTripFare = ref(0.00)
const totalDistance = ref(0)
const orderNotes = ref('')

// 时间选择相关数据
const showTimePicker = ref(false)
const availableSchedule = ref([])
const selectedDayIndex = ref(0)
const selectedTimeSlot = ref(null)
const dayScrollLeft = ref(0)
const dayScrollWithAnimation = ref(false)
const timePickerPopup = ref(null)

// 地址选择相关数据
const selectedAddress = ref('请选择地址')
const selectedLocation = ref(null)

// 服务信息
const serviceInfo = ref({

})

// 友伴师微信信息
const companionWxInfo = ref({
  wx_open_id: '',
  nickname: ''
})

// 计算总价
const totalPrice = computed(() => {
  const servicePrice = serviceInfo.value?.price_info?.unit_price * quantity.value || 0
  const total = servicePrice + roundTripFare.value
  return Number(total.toFixed(2))
})

// 加载服务信息
const loadServiceInfo = async () => {
  try {
    const { service_id, level_order, companion_id, price_template_id } = params.value
    
    if (!service_id || !level_order || !companion_id || !price_template_id) {
      console.warn('缺少必要的参数')
      return
    }
    
    const response = await getServiceInfo({
      service_id: Number(service_id)    ,
      level_order: Number(level_order),
      companion_id: Number(companion_id),
      price_template_id: Number(price_template_id)
    })
    console.log("response.data",response.data)
    if (response.data.code === 0) {
      const data = response.data.data
      // 更新服务信息
      serviceInfo.value = data
      
      // 设置默认数量为最小数量
      const minQuantity = data?.price_info?.min_quantity || 1
      quantity.value = minQuantity
    } else {
      throw new Error(response.data.msg || '获取服务信息失败')
    }
  } catch (error) {
    console.error('加载服务信息失败:', error)
    uni.showToast({
      title: error.message || '加载服务信息失败',
      icon: 'none'
    })
  }
}

// 获取友伴师微信 openid
const loadCompanionWxInfo = async () => {
  try {
    const { companion_id } = params.value
    
    if (!companion_id) {
      console.warn('缺少友伴师ID参数')
      return
    }
    
    const response = await getCompanionWxOpenId({
      companion_id: Number(companion_id)
    })
    
    console.log('友伴师微信信息:', response.data)
    
    if (response.data && response.data.code === 0) {
      const data = response.data.data
      companionWxInfo.value = {
        wx_open_id: data.wx_open_id || '',
        nickname: data.nickname || ''
      }
      console.log('友伴师微信openid:', data.wx_open_id)
    } else {
      console.error('获取友伴师微信信息失败:', response.data?.message)
    }
  } catch (error) {
    console.error('获取友伴师微信信息失败:', error)
  }
}

// 选择地址
const selectAddress = () => {
  // #ifdef MP-WEIXIN
  uni.chooseLocation({
    success: async (res) => {
      const address = res.address || res.name || '已选择位置'
      console.log('手动选择位置', res)
      
      // 更新显示
      selectedAddress.value = address
      selectedLocation.value = {
        latitude: res.latitude,
        longitude: res.longitude,
        address: address
      }
      
      // 调用计算距离接口
      await calculateOrderDistance(res.latitude, res.longitude)
      
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

// 选择服务时间
const selectServiceTime = () => {
  if (availableSchedule.value.length === 0) {
    uni.showToast({
      title: '暂无可用时间',
      icon: 'none'
    })
    return
  }
  
  // 自动选择第一个有可用时间段的日期
  selectedDayIndex.value = getFirstAvailableDayIndex()
  
  showTimePicker.value = true
  
  // 初始化日期导航滚动位置
  nextTick(() => {
    dayScrollWithAnimation.value = false;
    dayScrollLeft.value = 0;
    // 打开弹框
    timePickerPopup.value.open();
  });
}



// 切换选中的日期
const switchDay = (index) => {
  selectedDayIndex.value = index
  selectedTimeSlot.value = null
  
  // 开启滚动动画
  dayScrollWithAnimation.value = true
  
  // 延迟执行滚动，确保DOM更新完成
  nextTick(() => {
    // 计算导航项的实际宽度（包括padding）
    const itemWidth = uni.upx2px(140); // 每个导航项的宽度（rpx转px）
    const containerWidth = uni.getWindowInfo().windowWidth;
    const padding = uni.upx2px(40); // 左右padding
    const availableWidth = containerWidth - padding;
    
    // 计算可视区域可以显示的导航项数量（估算值）
    const visibleItems = Math.floor(availableWidth / itemWidth * 0.8);
    
    if (index > 2) {
      // 计算最佳滚动位置：保持选中项稍微偏左，让用户可以看到右侧还有导航项
      // 这里我们让选中的导航项位于可视区域的1/3处
      const scrollPos = Math.max(0, index * itemWidth - visibleItems * itemWidth / 3);
      dayScrollLeft.value = scrollPos;
    } else {
      // 如果是前几个导航项，滚回开始位置
      dayScrollLeft.value = 0;
    }
    
    // 滚动完成后关闭动画（可选，保持动画开启也可以）
    setTimeout(() => {
      dayScrollWithAnimation.value = false;
    }, 300);
  });
}

// 选择时间段
const selectTimeSlot = (timeSlot) => {
  if (timeSlot.status !== 1) return // 只能选择可约的时间段
  
  selectedTimeSlot.value = timeSlot
  const selectedDay = availableSchedule.value[selectedDayIndex.value]
  serviceTime.value = `${selectedDay.day_name} ${selectedDay.date} ${timeSlot.time}`
  timePickerPopup.value.close()
  showTimePicker.value = false
}

// 获取第一个有可用时间段的日期索引
const getFirstAvailableDayIndex = () => {
  if (availableSchedule.value.length === 0) return 0
  
  for (let i = 0; i < availableSchedule.value.length; i++) {
    const daySchedule = availableSchedule.value[i]
    const timeSlots = daySchedule?.time_slots || []
    const hasAvailableSlots = timeSlots.some(slot => slot.status === 1)
    
    if (hasAvailableSlots) {
      return i
    }
  }
  
  return 0 // 如果没有找到有可用时间段的日期，返回第一个
}

// 获取当前选中日期的可用时间段
const getCurrentDayTimeSlots = () => {
  if (availableSchedule.value.length === 0) return []
  return availableSchedule.value[selectedDayIndex.value]?.time_slots || []
}

// 选择出行方式
const selectTravelMethod = (method) => {
  travelMethod.value = method
}

// 增加数量
const increaseQuantity = () => {
  quantity.value++
}

// 减少数量
const decreaseQuantity = () => {
  const minQuantity = serviceInfo.value?.price_info?.min_quantity || 1
  if (quantity.value > minQuantity) {
    quantity.value--
  }
}

// 计算订单距离
const calculateOrderDistance = async (userLatitude, userLongitude) => {
  try {
    const requestData = {
      companion_id: Number(params.value.companion_id),
      user_latitude: userLatitude,
      user_longitude: userLongitude
    }
    
    console.log('计算距离请求参数:', requestData)
    
    const response = await calculateDistance(requestData)
    
    if (response.data && response.data.code === 0) {
      const result = response.data.data
      console.log('距离计算结果:', result)
      
      // 更新距离和车费信息
      if (result.distance !== undefined) {
        totalDistance.value = result.distance
      }
      if (result.transport_fee !== undefined) {
        // 车费 = transport_fee * 2，注意计算精度
        roundTripFare.value = Number((result.transport_fee * 2).toFixed(2))
      }
      
   
    } else {
      console.error('计算距离失败:', response.data?.msg)
      uni.showToast({
        title: response.data?.msg || '计算距离失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('计算距离接口调用失败:', error)
    uni.showToast({
      title: '计算距离失败，请重试',
      icon: 'none'
    })
  }
}

// 查看计费规则
const viewBillingRules = () => {
  uni.showToast({
    title: '查看计费规则功能',
    icon: 'none'
  })
}

// 请求订阅消息权限
const requestSubscribeMessage = async () => {
  const tmplIds = [
    'vrMAJmeAOA0j3yRGX6AjNEJxqaJ2mvERTFlV89fK3GA',
    'zovIGlvjM10gOUEZjOB-lOQwISsM0PLqfMtIJPbWf4Y'
  ]
  
  try {
    console.log('开始请求订阅消息权限')
    
    const res = await new Promise((resolve, reject) => {
      uni.requestSubscribeMessage({
        tmplIds: tmplIds,
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
    let acceptedCount = 0
    let rejectedCount = 0
    let allAccepted = true
    
    tmplIds.forEach(tmplId => {
      if (res[tmplId] === 'accept') {
        acceptedCount++
      } else if (res[tmplId] === 'reject') {
        rejectedCount++
        allAccepted = false
      } else {
        // 用户点击了关闭按钮或其他情况，视为未授权
        allAccepted = false
      }
    })
    
    if (acceptedCount > 0) {
      console.log('用户同意订阅消息')
      uni.showToast({
        title: '已开启订单提醒',
        icon: 'success'
      })
    }
    
    if (rejectedCount > 0) {
      console.log('用户拒绝订阅消息')
      // 引导用户去设置页面重新授权
      return new Promise((resolve) => {
        uni.showModal({
          title: '订单提醒权限',
          content: '为了您能及时接收订单状态通知，是否去设置页面重新授权？',
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
                      tmplIds: tmplIds,
                      success: (subscribeRes) => {
                        console.log('重新授权成功:', subscribeRes)
                        // 检查重新授权的结果
                        let reAcceptedCount = 0
                        let reAllAccepted = true
                        tmplIds.forEach(tmplId => {
                          if (subscribeRes[tmplId] === 'accept') {
                            reAcceptedCount++
                          } else {
                            reAllAccepted = false
                          }
                        })
                        
                        if (reAcceptedCount > 0) {
                          uni.showToast({
                            title: '已开启订单提醒',
                            icon: 'success'
                          })
                        }
                        
                        resolve(reAllAccepted)
                      },
                      fail: (err) => {
                        console.log('重新授权失败:', err)
                        resolve(false)
                      }
                    })
                  } else {
                    uni.showToast({
                      title: '未开启订单提醒',
                      icon: 'none'
                    })
                    resolve(false)
                  }
                },
                fail: (err) => {
                  console.error('打开设置页面失败:', err)
                  resolve(false)
                }
              })
            } else {
              uni.showToast({
                title: '未开启订单提醒',
                icon: 'none'
              })
              resolve(false)
            }
          }
        })
      })
    }
    
    if (acceptedCount === 0 && rejectedCount === 0) {
      // 其他情况（如用户点击了关闭按钮等）
      console.log('用户未明确选择订阅消息')
      uni.showToast({
        title: '未开启订单提醒',
        icon: 'none'
      })
      return false
    }
    
    return allAccepted
  } catch (error) {
    console.error('订阅消息请求异常:', error)
    uni.showToast({
      title: '订阅消息请求失败',
      icon: 'none'
    })
    return false
  }
}

// 提交订单
const submitOrder = async () => {
  // 验证地址是否已选择
  if (selectedAddress.value === '请选择地址') {
    uni.showToast({
      title: '请先选择服务地址',
      icon: 'none'
    })
    return
  }
  
  // 验证服务时间是否已选择
  if (!serviceTime.value) {
    uni.showToast({
      title: '请先选择服务时间',
      icon: 'none'
    })
    return
  }
  
  // 先请求订阅消息权限
  const subscribeResult = await requestSubscribeMessage()
  
  // 检查订阅消息授权结果，如果有模板未授权成功，则阻止支付
  if (subscribeResult === false) {
    uni.showModal({
      title: '提示',
      content: '为了确保您能及时接收订单状态通知，请先开启订阅消息权限后再提交订单',
      showCancel: false,
      confirmText: '我知道了'
    })
    return
  }
  
  // 解析服务时间，提取日期和时间段
  // 格式可能是 "周一 2024-01-15 09:00" 或 "2024-01-15 09:00"
  const timeMatch = serviceTime.value.match(/(\d{4}-\d{2}-\d{2})\s+(.+)/)
  if (!timeMatch) {
    uni.showToast({
      title: '服务时间格式错误',
      icon: 'none'
    })
    return
  }
  
  const serviceDate = timeMatch[1] // YYYY-MM-DD
  const serviceTimeSlot = timeMatch[2] // 时间段
  
  const orderData = {
    companion_id: Number(params.value.companion_id),
    service_id: Number(params.value.service_id),
    level_order: Number(params.value.level_order),
    price_template_id: Number(params.value.price_template_id),
    quantity: quantity.value,
    service_address: selectedAddress.value,
    service_date: serviceDate,
    service_time: serviceTimeSlot,
    remark: orderNotes.value,
    user_latitude: selectedLocation.value?.latitude,
    user_longitude: selectedLocation.value?.longitude
  }
  
  console.log('提交订单数据:', orderData)
  
  uni.showLoading({
    title: '提交中...'
  })
  
  try {
    // 调用创建订单接口
    const response = await createOrderV2(orderData)
    
    if (response.data.code === 0) {
      console.log('订单创建成功:', response.data)
      
      // 调用订单创建成功接口
      try {
        const orderParamsData = {
          order_id: response.data.data.order_id,
          payment_method: 1
        }
        const paramsResponse = await orderParams(orderParamsData)
        
        if (paramsResponse.data.code === 0) {
          // 调用微信支付
          uni.requestPayment({
            provider: 'wxpay',
            ...paramsResponse.data.data.pay_params,
            success: async (res) => {
              console.log('支付成功', res);
              uni.showToast({
                title: '支付成功',
                icon: 'success',
              });
              
              // 发送订阅消息
              try {
                // 检查是否有友伴师的微信openid
                if (!companionWxInfo.value.wx_open_id) {
                  console.warn('友伴师微信openid为空，跳过订阅消息发送')
                  return
                }
                
                const subscribeData = {
                  to_user: companionWxInfo.value.wx_open_id, // 使用真实的友伴师openid
                  template_id: "vrMAJmeAOA0j3yRGX6AjNCOvfgzlJp8T1wWLucyCwKc",
                 
                  page: `subPackages/partner/order/detail?orderId=${response.data.data.order_id}&companion_id=${params.value.companion_id}`,
                  data: {
                    phrase4: {
                      value: "待接单"
                    },
                    thing3: {
                      value: serviceInfo.value?.service?.name || "服务"
                    },
                    character_string10: {
                      value: serviceDate + " " + serviceTimeSlot
                    },
                    character_string1: {
                      value: paramsResponse.data.data.order_no
                    },
                    thing15: {
                      value: selectedAddress.value
                    }
                  }
                }
                
                await sendSubscribeMessage(subscribeData)
                console.log('订阅消息发送成功，发送给友伴师:', companionWxInfo.value.nickname)
              } catch (error) {
                console.error('发送订阅消息失败:', error)
                // 订阅消息发送失败不影响主流程，只记录错误
              }
              
              // 支付成功后返回上一层
              setTimeout(() => {
                uni.navigateBack()
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
        console.error('获取支付参数失败:', error)
        uni.showToast({
          title: error.message || '获取支付参数失败',
          icon: 'none'
        })
      }
    } else {
      throw new Error(response.data.msg || '创建订单失败')
    }
  } catch (error) {
    console.error('提交订单失败:', error)
    uni.showToast({
      title: error.message || '提交订单失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  params.value = currentPage.options || {}
  
  console.log('订单提交页面参数:', params.value)
  
  // 加载服务信息
  loadServiceInfo()
  
  // 获取友伴师微信信息
  loadCompanionWxInfo()
  
  // 调用友伴师可用时间安排接口
  if (params.value.companion_id) {
    getCompanionAvailableSchedule(Number(params.value.companion_id))
      .then(response => {
        console.log('友伴师可用时间安排:', response)
        if (response.data && response.data.code === 0) {
          availableSchedule.value = response.data.data.schedule || []
          // 自动选择第一个有可用时间段的日期
          if (availableSchedule.value.length > 0) {
            selectedDayIndex.value = getFirstAvailableDayIndex()
          }
        }
      })
      .catch(error => {
        console.error('获取友伴师可用时间安排失败:', error)
      })
  }
})
</script>

<style scoped>
.submit-order-container {
  min-height: 100vh;
  background: #F8F8F8;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.scroll-content {
  height: calc(100vh - 120rpx);
  padding-bottom: 20rpx;
}

.section-card {
  background: #fff;
  margin: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;

}

.section-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding:  24rpx;

}

.section-item:last-child {
  border-bottom: none;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.item-icon {
  width: 40rpx;
  height: 40rpx;
}

.item-text {
  font-size: 28rpx;
  color: #1a1a1a;
  font-weight: 500;
}


.item-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.arrow-icon {
  width: 30rpx;
  height: 30rpx;
}

.time-text {
  font-size: 28rpx;
  color: #7363FF;
  font-weight: 500;
}

.radio-group {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.radio-circle {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.radio-circle.active {
  border-color: #7363FF;
}

.radio-dot {
  width: 16rpx;
  height: 16rpx;
  background: #7363FF;
  border-radius: 50%;
}

.radio-text {
  font-size: 28rpx;
  color: #333;
}

.service-card {
  margin-top: 32rpx;
}

.service-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  gap: 20rpx;
}

.service-img {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
  object-fit: cover;
}

.service-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.service-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #1a1a1a;
}

.service-price-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.service-price {
  font-size: 32rpx;
  color: #ff4757;
  font-weight: 600;
}

.service-duration {
  font-size: 24rpx;
  color: #666;
}

.service-provider {
  font-size: 24rpx;
  color: #999;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.quantity-btn {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.quantity-btn.minus {
  background: #f0f0f0;
}

.quantity-btn.plus {
  background: #7363FF;
}

.quantity-btn:active:not(.disabled) {
  transform: scale(0.9);
}

.quantity-btn.disabled {
  opacity: 0.4;
  background: #e0e0e0;
}

.quantity-icon {
  width: 100%;
  height: 100%;
}

.quantity-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  min-width: 40rpx;
  text-align: center;
}

.fare-text {
  font-size: 28rpx;
  color: #ff4757;
  font-weight: 500;
}

.fare-detail {
  padding: 0 24rpx 24rpx 24rpx;
}

.fare-detail-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}

.fare-link {
  font-size: 24rpx;
  color: #7363FF;
  text-decoration: underline;
}

.notes-input {
  flex: 1;
  font-size: 28rpx;
  color: #1a1a1a;
  border: none;
  outline: none;
  background: transparent;
  text-align: right;
}

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
  justify-content: space-between;
  align-items: center;
}

.price-summary {
  flex: 1;
}

.total-price {
  font-size: 32rpx;
  color: #ff4757;
  font-weight: 600;
}

.submit-btn {
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  color: #fff;
  padding: 16rpx 32rpx;
  border-radius: 99999rpx;
  font-size: 26rpx;
  font-weight: 500;
  box-shadow: 0 4rpx 12rpx rgba(115, 99, 255, 0.3);
  transition: all 0.3s ease;
  border: 1rpx solid transparent;
  box-sizing: border-box;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120rpx;
}

.submit-btn:active {
  background: linear-gradient(135deg, #6354e6 0%, #e55cc8 100%);
  transform: scale(0.96);
}

/* 时间选择弹框样式 */
.time-picker-content {
  background: #ffffff;
  border-radius: 20rpx 20rpx 0 0;
  width: 100%;
  height: 75vh;
  position: relative;
  z-index: 1001;
}

/* uni-popup 弹框圆角样式 */
:deep(.uni-popup) {
  border-radius: 20rpx 20rpx 0 0 !important;
}


/* 日期导航栏 */
.day-filter {
  background: #FFFFFF;
  border-bottom: 1rpx solid #f0f0f0;
  border-radius: 20rpx 20rpx 0 0

}

.day-scroll {
  white-space: nowrap;
}

.day-tabs {
  display: flex;
  align-items: center;
  height: 120rpx;
  white-space: nowrap;
  padding-left: 10rpx;
  padding-right: 20rpx;
  box-sizing: border-box;
  position: relative;
}

.day-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 20rpx;
  box-sizing: border-box;
  height: 45rpx;
  flex-shrink: 0;
  min-width: fit-content;
}

/* 去掉下划线 */

.day-name {
  font-size: 26rpx;
  font-weight: 400;
  color: #798079;
  transition: color 0.3s ease;
}

.day-date {
  font-size: 20rpx;
  color: #999999;
  transition: color 0.3s ease;
  margin-top: 4rpx;
}

.day-tab.active .day-name {
  font-size: 26rpx;
  font-weight: 700;
  color: #059C00;
}

.day-tab.active .day-date {
  color: #059C00;
}

/* 时间段容器 */
.time-slots-container {
  padding: 32rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16rpx;
}

.time-slot-item {
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 16rpx 8rpx;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.time-slot-item:active {
  transform: scale(0.95);
}

.time-slot-item.available {
  background: #ffffff;
  border-color: #e9ecef;
}

.time-slot-item.available:hover {
  border-color: #7363FF;
}

.time-slot-item.unavailable {
  background: #f8f9fa;
  border-color: #e9ecef;
  opacity: 0.6;
  cursor: not-allowed;
}

.time-slot-item.unavailable .time-text,
.time-slot-item.unavailable .status-text {
  color: #cccccc;
}

.time-slot-item.selected {
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-color: #7363FF;
  box-shadow: 0 4rpx 16rpx rgba(115, 99, 255, 0.3);
}

.time-slot-item.selected .time-text,
.time-slot-item.selected .status-text {
  color: #ffffff;
}

.time-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #1a1a1a;
  display: block;
  margin-bottom: 4rpx;
}

.status-text {
  font-size: 20rpx;
  color: #666666;
  display: block;
}


</style> 