<template>
  <view class="data-select-container">


      
      <!-- 星期选择器 -->
      <view class="week-selector">
        <view 
          v-for="(day, index) in weekDays" 
          :key="day.key"
          class="day-item"
          :class="{ 
            'active': selectedDay === index,
            'today': isToday(index)
          }"
          @click="selectDay(index)"
        >
          <text class="day-name">{{ day.name }}</text>
          <text class="day-status">{{ getDayStatus(index) }}</text>
        </view>
      </view>
      
      <!-- 时间网格 -->
      <view class="time-grid-container">
        <view class="time-grid-header">
          <text class="grid-title">{{ getSelectedDayName() }} 时间段设置</text>
          <view class="quick-actions">
            <view class="action-btn" @click="setAllAvailable">全部可约</view>
            <view class="action-btn" @click="setAllUnavailable">全部休息</view>
          </view>
        </view>
        
        <view class="time-grid" :style="{ height: (timeGridHeight ) + 'px' }">
          <view 
            v-for="(timeSlot, timeKey) in getCurrentDaySchedule()" 
            :key="timeKey"
            class="time-slot"
            :class="getTimeSlotClass(timeSlot)"
            @click="toggleTimeSlot(timeKey)"
          >
            <text class="time-text">{{ timeKey }}</text>
            <text class="status-text">{{ getStatusText(timeSlot) }}</text>
          </view>
        </view>
      </view>
      
      <!-- 底部固定区域 -->
      <view class="bottom-fixed">
        <!-- 状态说明 -->
        <view class="status-legend">
          <view class="legend-item">
            <view class="legend-color available"></view>
            <text class="legend-text">可约</text>
          </view>
                  <view class="legend-item">
          <view class="legend-color unavailable"></view>
          <text class="legend-text">休息</text>
        </view>
                  <!-- <view class="legend-item">
          <view class="legend-color booked"></view>
          <text class="legend-text">已约</text>
        </view> -->
        </view>
        
        <!-- 保存按钮 -->
        <view class="save-section">
          <view class="save-btn" @click="saveSchedule">
            <text class="save-text">保存设置</text>
          </view>
        </view>
      </view>
    </view>

</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getCompanionSchedule, saveCompanionSchedule } from '@/api/user.js'

// 响应式数据
const companion_id = ref(null)
const loading = ref(true)
const selectedDay = ref(0) // 默认选中周一
const scheduleData = ref([])
const timeGridHeight = ref(0) // 时间网格高度
const originalScheduleData = ref([]) // 保存原始数据，用于比较是否有修改

// 星期数据
const weekDays = ref([
  { key: 'monday', name: '周一' },
  { key: 'tuesday', name: '周二' },
  { key: 'wednesday', name: '周三' },
  { key: 'thursday', name: '周四' },
  { key: 'friday', name: '周五' },
  { key: 'saturday', name: '周六' },
  { key: 'sunday', name: '周日' }
])

// 获取页面参数
const getPageParams = () => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options
  
  if (options.companion_id) {
    companion_id.value = parseInt(options.companion_id)
    console.log('获取到companion_id:', companion_id.value)
  } else {
    console.error('未获取到companion_id参数')
    uni.showToast({
      title: '参数错误',
      icon: 'none'
    })
  }
}

// 调用接口获取数据
const callScheduleAPI = async () => {
  if (!companion_id.value) {
    console.error('companion_id为空，无法调用接口')
    return
  }
  
  try {
    console.log('开始调用getCompanionSchedule接口，companion_id:', companion_id.value)
    
    let obj = {
      "companion_id": companion_id.value,
    }
    console.log('obj:', obj)
    const response = await getCompanionSchedule(obj)
    console.log('接口调用成功:', response)
    
    if (response.data && response.data.code === 0) {
      scheduleData.value = response.data.data
      // 深拷贝保存原始数据
      originalScheduleData.value = JSON.parse(JSON.stringify(response.data.data))
      console.log('解析后的数据:', scheduleData.value)
      
      // 设置默认选中的星期
      setDefaultSelectedDay()
    } else {
      uni.showToast({
        title: response.data?.msg || '获取数据失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('接口调用失败:', error)
    uni.showToast({
      title: '网络错误',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 设置默认选中的星期
const setDefaultSelectedDay = () => {
  // 查找今天的数据
  const todayData = scheduleData.value.find(item => item.is_today === true)
  
  if (todayData) {
    // 找到今天，设置为选中状态
    selectedDay.value = todayData.day_of_week - 1 // 转换为数组索引 (0-6)
    console.log('设置为今天:', todayData.day_of_week, '选中索引:', selectedDay.value)
  } else {
    // 没找到今天的数据，默认选中周一
    selectedDay.value = 0
    console.log('未找到今天数据，默认选中周一')
  }
}

// 选择星期
const selectDay = (index) => {
  // 如果切换星期，重置当前星期的数据为原始状态
  if (selectedDay.value !== index) {
    resetCurrentDayData()
  }
  selectedDay.value = index
}

// 重置当前星期的数据为原始状态
const resetCurrentDayData = () => {
  const currentDayOfWeek = selectedDay.value + 1
  const originalDayData = originalScheduleData.value.find(item => item.day_of_week === currentDayOfWeek)
  const currentDayData = scheduleData.value.find(item => item.day_of_week === currentDayOfWeek)
  
  if (originalDayData && currentDayData) {
    // 将当前数据重置为原始数据
    currentDayData.schedule = JSON.parse(JSON.stringify(originalDayData.schedule))
    console.log('重置星期数据:', currentDayOfWeek, '为原始状态')
  }
}

// 判断是否是今天
const isToday = (index) => {
  const dayOfWeek = index + 1
  const dayData = scheduleData.value.find(item => item.day_of_week === dayOfWeek)
  return dayData ? dayData.is_today : false
}

// 获取选中星期的名称
const getSelectedDayName = () => {
  return weekDays.value[selectedDay.value].name
}

// 获取当前选中星期的数据
const getCurrentDaySchedule = () => {
  const dayOfWeek = selectedDay.value + 1 // 转换为后端格式 (1-7)
  const dayData = scheduleData.value.find(item => item.day_of_week === dayOfWeek)
  return dayData ? dayData.schedule : {}
}

// 获取星期状态
const getDayStatus = (index) => {
  const dayOfWeek = index + 1
  const dayData = scheduleData.value.find(item => item.day_of_week === dayOfWeek)
  if (!dayData) return '未设置'
  
  const schedule = dayData.schedule
  const availableCount = Object.values(schedule).filter(v => v === 1).length
  const bookedCount = Object.values(schedule).filter(v => v === 3).length
  
  let statusText = ''
  if (bookedCount > 0) {
    statusText = `${bookedCount}个已约`
  } else if (availableCount === 48) {
    statusText = '全天可约'
  } else if (availableCount === 0) {
    statusText = '全天休息'
  } else {
    statusText = `${availableCount}个可约`
  }
  
  // 如果是今天，添加"今天"标识
  if (dayData.is_today) {
    statusText =  statusText
  }
  
  return statusText
}

// 获取时间段样式类
const getTimeSlotClass = (status) => {
  switch (status) {
    case 1: return 'available'
    case 2: return 'unavailable'
    case 3: return 'booked'
    default: return 'unavailable'
  }
}

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 1: return '可约'
    case 2: return '休息'
    case 3: return '已约'
    default: return '休息'
  }
}

// 切换时间段状态
const toggleTimeSlot = (timeKey) => {
  const dayOfWeek = selectedDay.value + 1
  const dayData = scheduleData.value.find(item => item.day_of_week === dayOfWeek)
  
  if (!dayData) return
  
  const currentStatus = dayData.schedule[timeKey]
  
  // 已约状态不能修改
  if (currentStatus === 3) {
    uni.showToast({
      title: '已约时间段不能修改',
      icon: 'none'
    })
    return
  }
  
  // 切换可约/不可约状态
  dayData.schedule[timeKey] = currentStatus === 1 ? 2 : 1
}

// 设置全部可约
const setAllAvailable = () => {
  const dayOfWeek = selectedDay.value + 1
  const dayData = scheduleData.value.find(item => item.day_of_week === dayOfWeek)
  
  if (!dayData) return
  
  Object.keys(dayData.schedule).forEach(timeKey => {
    if (dayData.schedule[timeKey] !== 3) { // 已约的不修改
      dayData.schedule[timeKey] = 1
    }
  })
}

// 设置全部不可约
const setAllUnavailable = () => {
  const dayOfWeek = selectedDay.value + 1
  const dayData = scheduleData.value.find(item => item.day_of_week === dayOfWeek)
  
  if (!dayData) return
  
  Object.keys(dayData.schedule).forEach(timeKey => {
    if (dayData.schedule[timeKey] !== 3) { // 已约的不修改
      dayData.schedule[timeKey] = 2
    }
  })
}

// 保存设置
const saveSchedule = async () => {
  if (!companion_id.value) {
    uni.showToast({
      title: '用户信息不完整',
      icon: 'none'
    })
    return
  }
  
  // 获取当前选中的星期数据
  const dayOfWeek = selectedDay.value + 1
  const dayData = scheduleData.value.find(item => item.day_of_week === dayOfWeek)
  
  if (!dayData) {
    uni.showToast({
      title: '未找到当前星期的数据',
      icon: 'none'
    })
    return
  }
  
  // 检查是否有修改
  const originalDayData = originalScheduleData.value.find(item => item.day_of_week === dayOfWeek)
  if (originalDayData && JSON.stringify(originalDayData.schedule) === JSON.stringify(dayData.schedule)) {
    uni.showToast({
      title: '没有修改内容',
      icon: 'none'
    })
    return
  }
  
  // 准备保存数据
  const saveData = {
    companion_id: companion_id.value,
    day_of_week: dayOfWeek,
    schedule: dayData.schedule
  }
  
  console.log('准备保存的数据:', saveData)
  
  try {
    uni.showLoading({
      title: '保存中...'
    })
    
    const response = await saveCompanionSchedule(saveData)
    
    uni.hideLoading()
    
    if (response.data && response.data.code === 0) {
      // 保存成功后，更新原始数据中对应星期的数据
      const originalIndex = originalScheduleData.value.findIndex(item => item.day_of_week === dayOfWeek)
      if (originalIndex !== -1) {
        originalScheduleData.value[originalIndex] = JSON.parse(JSON.stringify(dayData))
      }
      
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      })
      console.log('保存成功:', response.data)
      
      // 发送事件通知Workbench组件刷新日期安排数据
      uni.$emit('scheduleDataUpdated', {
        companion_id: companion_id.value,
        day_of_week: dayOfWeek,
        schedule: dayData.schedule
      })
    } else {
      uni.showToast({
        title: response.data?.msg || '保存失败',
        icon: 'none'
      })
      console.error('保存失败:', response.data)
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    })
    console.error('保存接口调用失败:', error)
  }
}

// 计算时间网格高度
const calculateTimeGridHeight = () => {
  // 获取系统信息
  const systemInfo = uni.getSystemInfoSync()
  const screenHeight = systemInfo.windowHeight



  
  timeGridHeight.value = screenHeight - 10
  console.log('timeGridHeight.value:', timeGridHeight.value)
  uni.createSelectorQuery()
			.select('.time-grid-header') // 选择器
			.boundingClientRect(rect => {
				if (rect) {
                    //  console.log('rect:', rect.bottom)
                  timeGridHeight.value = timeGridHeight.value - rect.bottom 
                    }
			})
			.exec()

            uni.createSelectorQuery()
			.select('.bottom-fixed') // 选择器
			.boundingClientRect(rect => {
				if (rect) {
                     console.log('rect:', rect.height)
                    //  bottomFixedHeight = rect.height
                 timeGridHeight.value = timeGridHeight.value - rect.height
                    
				}
			})
			.exec()

}

// 页面加载时执行
onMounted(() => {
  console.log('DataSelect组件mounted')
  getPageParams()
  callScheduleAPI()
  calculateTimeGridHeight()
})
</script>

<style lang="scss" scoped>
.data-select-container {
  height: 100vh;
  background: #ffffff;
  padding: 20rpx;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666666;
}


.header {
  text-align: center;
  margin-bottom: 30rpx;
}

.title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1a1a1a;
  display: block;
  margin-bottom: 8rpx;
}

.subtitle {
  font-size: 24rpx;
  color: #666666;
  display: block;
}

// 星期选择器
.week-selector {
  display: flex;
  gap: 12rpx;
  margin-bottom: 40rpx;
  flex-wrap: wrap;
}

.day-item {
  flex: 1;
  min-width: 120rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 10rpx 16rpx;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.active {
    background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
    border-color: #7363FF;
    box-shadow: 0 4rpx 16rpx rgba(115, 99, 255, 0.3);
  }
  
  // 今天的特殊样式
  &.today {
    border-color: #FF9500;
    background: linear-gradient(135deg, #FF9500 0%, #FF5722 100%);
    
    .day-name, .day-status {
      color: #ffffff;
    }
    
    &::before {
      content: '今天';
      position: absolute;
      top: -8rpx;
      right: -8rpx;
      background: #FF5722;
      color: #ffffff;
      font-size: 18rpx;
      padding: 2rpx 8rpx;
      border-radius: 8rpx;
      font-weight: 600;
    }
  }
}

.day-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1a1a1a;
  display: block;
  margin-bottom: 4rpx;
  
  .day-item.active & {
    color: #ffffff;
  }
}

.day-status {
  font-size: 20rpx;
  color: #666666;
  display: block;
  
  .day-item.active & {
    color: rgba(255, 255, 255, 0.8);
  }
}

// 时间网格容器
.time-grid-container {
  margin-bottom: 0rpx;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.time-grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.grid-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.quick-actions {
  display: flex;
  gap: 12rpx;
}

.action-btn {
  background: #f8f9fa;
  border: 1rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 8rpx 16rpx;
  font-size: 22rpx;
  color: #666666;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
    background: #e9ecef;
  }
}

// 时间网格
.time-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12rpx;
  overflow-y: auto;
  overflow-x: hidden;
  
  // 自定义滚动条样式
  &::-webkit-scrollbar {
    width: 6rpx;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3rpx;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3rpx;
    
    &:hover {
      background: #a8a8a8;
    }
  }
}

.time-slot {
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 16rpx 8rpx;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:active {
    transform: scale(0.95);
  }
  
  &.available {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    border-color: #4CAF50;
    box-shadow: 0 2rpx 8rpx rgba(76, 175, 80, 0.3);
    
    .time-text, .status-text {
      color: #ffffff;
    }
  }
  
  &.unavailable {
    background: #f8f9fa;
    border-color: #e9ecef;
    
    .time-text {
      color: #999999;
    }
    
    .status-text {
      color: #cccccc;
    }
  }
  
  &.booked {
    background: linear-gradient(135deg, #FF5722 0%, #f4511e 100%);
    border-color: #FF5722;
    box-shadow: 0 2rpx 8rpx rgba(255, 87, 34, 0.3);
    cursor: not-allowed;
    
    .time-text, .status-text {
      color: #ffffff;
    }
    
    &:active {
      transform: none;
    }
  }
}

.time-text {
  font-size: 22rpx;
  font-weight: 500;
  color: #1a1a1a;
  display: block;
  margin-bottom: 4rpx;
}

.status-text {
  font-size: 18rpx;
  color: #666666;
  display: block;
}

// 底部固定区域
.bottom-fixed {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 20rpx;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  z-index: 100;
}

// 状态说明
.status-legend {
  display: flex;
  justify-content: center;
  gap: 40rpx;
  margin-bottom: 20rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.legend-color {
  width: 24rpx;
  height: 24rpx;
  border-radius: 6rpx;
  
  &.available {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  }
  
  &.unavailable {
    background: #e9ecef;
  }
  
  &.booked {
    background: linear-gradient(135deg, #FF5722 0%, #f4511e 100%);
  }
}

.legend-text {
  font-size: 24rpx;
  color: #666666;
}

// 保存按钮
.save-section {
  text-align: center;
  margin-bottom: 20rpx; // 为安全区域留出空间
}

.save-btn {
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 16rpx;
  padding: 24rpx 40rpx;
  box-shadow: 0 6rpx 20rpx rgba(115, 99, 255, 0.3);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 16rpx rgba(115, 99, 255, 0.4);
  }
}

.save-text {
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
}
</style>