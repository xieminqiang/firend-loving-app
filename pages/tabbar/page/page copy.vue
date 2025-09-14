<template>
  <view class="page">
    <!-- 顶部固定区域：只保留logo和城市选择器 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <!-- 顶部区域：logo和城市选择器 -->
      <view class="header-top">
        <view class="logo-container">
          				<text class="logo">随伴行</text>
          <text class="logo-tag">提供精选服务</text>
        </view>
        <CitySelector @click="showCityPicker = true" />
      </view>
    </view>
   
    <!-- 可滚动内容区域 -->
     <view class="main-content">
      <scroll-view 
      class="scroll-container" 
      scroll-y="true" 
      refresher-enabled="true"
      refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @refresherrestore="onRefreshRestore"
    >


      <!-- 页面内容 -->
      <view class="content-section">
        <!-- 服务列表 -->
        <view class="service-list-soul">
          <!-- 加载状态 -->
          <view v-if="dataLoading" class="loading-state">
            <view class="loading-spinner"></view>
            <text class="loading-text">加载中...</text>
          </view>
          
          <!-- 服务列表 -->
          <view v-else-if="services.length > 0">
            <view v-for="item in services" :key="item.service_id" class="service-card-soul" @click="goToDetail(item)">
              <view class="service-img-wrap">
                <image :src="$imgBaseUrl + item.service_image_url" class="service-img-soul" mode="aspectFill" />
              </view>
              <view class="service-info-soul">
                <text class="service-title-soul">{{ item.service_name }}</text>
                <view class="service-tags-soul">
                  <text v-for="tag in item.service_tags" :key="tag" class="tag-soul">{{ tag }}</text>
                </view>
                <view class="service-actions-soul">
                  <view class="price-info">
                    <text class="price-amount">¥{{ item.price || 0 }}</text>
                    <text class="price-unit">/{{ item.unit || '小时' }}起</text>
                  </view>
                  <view class="order-btn-soul" >
                    <text>立即预约</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          
          <!-- 空状态 - 只在加载完成后且没有数据时显示 -->
          <view v-else-if="dataLoaded && services.length === 0" class="empty-state">
            <image src="/static/images/empty.png" class="empty-icon" mode="aspectFit" />
            <text class="empty-text">暂无服务</text>
            <text class="empty-desc">更多精彩服务即将上线</text>
          </view>
        </view>
      </view>
     
    </scroll-view>

     </view>

    <!-- 城市选择弹窗 -->
    <CityPicker 
      v-model:visible="showCityPicker" 
      @city-selected="onCitySelected"
    /> 
	<mq-tabbar currentTab="home1"></mq-tabbar>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { getCityServices } from '@/api/friends.js'
import { useCityStore } from '@/stores/city.js'
import CitySelector from '@/components/common/CitySelector.vue'
import CityPicker from '@/components/common/CityPicker.vue'
import { useUserStore } from '@/stores/user.js'
// 用户状态管理
const userStore = useUserStore()
// 状态栏高度适配
const statusBarHeight = ref(0)
const navBarHeight = ref(44) // 默认导航栏高度
function requestBackgroundLocation() {
 
}

// 获取系统信息
onMounted(async () => {
  const systemInfo = uni.getSystemInfoSync()
  statusBarHeight.value = systemInfo.statusBarHeight || 0
  
  // 不同平台的导航栏高度适配
  // #ifdef MP-WEIXIN
  navBarHeight.value = 44
  // #endif
  // #ifdef APP-PLUS
  navBarHeight.value = 44
  // #endif
  // #ifdef H5
  navBarHeight.value = 0 // H5不需要导航栏高度
  // #endif
  


  // 初始化城市数据（获取位置和加载城市列表）
  await cityStore.initCityData()
  
  // 只加载当前选中的选项卡数据（默认"服务"）
  await loadCityServicesData()
})

// 获取全局城市store
const cityStore = useCityStore()

// 使用全局store的计算属性
const city = computed(() => cityStore.currentCity)
const currentCityCode = computed(() => cityStore.currentCityCode)
const cityList = computed(() => cityStore.cityList)
const cityIndex = computed(() => cityStore.cityIndex)

// 服务数据
const services = ref([])

// 用户数据（从接口获取）
const user = ref({})

// 数据加载状态
const dataLoaded = ref(false)
const dataLoading = ref(false)

// 页面卸载时清除定时器
onUnmounted(() => {
  // 清理工作
})



// 城市选择 - 使用全局store
function onCityChange(e) {
  cityStore.selectCity(e.detail.value)
}

// 加载城市服务数据
const loadCityServicesData = async () => {
  try {
    dataLoading.value = true
    console.log('开始加载城市服务数据，当前城市代码:', currentCityCode.value)
    
    const requestParams = {
      city_code: currentCityCode.value,
      application_id: 15 // 写死为15
    }
    
    console.log('城市服务请求参数:', requestParams)
    
    const response = await getCityServices(requestParams)
    
    if (response.data && response.data.code === 0 && response.data.data) {
      const data = response.data.data
      console.log('城市服务数据:', data)
      
      // 更新用户信息（参考detail页面的逻辑）
      if (data) {
        user.value = {
          avatar: data.avatar,
          nickname: data.nickname || '未知用户',
          verified: true,
          age: data.age,
          weight: data.weight,
          height: data.height,
          distance: data.distance,
          tags: data.tags || [],
          level_order: data.level_order,
          levelIcon: '',
          gender: data.gender || '',
          application_id: data.application_id || 15 // 使用接口返回的application_id，如果没有则使用默认值15
        }
      }
      
      // 更新服务列表数据
      if (data.services && data.services.length > 0) {
        services.value = data.services
        console.log('服务数据加载成功，共', services.value.length, '条')
      } else {
        services.value = []
        console.log('服务数据为空')
      }
    } else {
      console.error('获取城市服务失败:', response.data?.message || '未知错误')
      services.value = []
    }
    dataLoaded.value = true
  } catch (error) {
    console.error('获取城市服务异常:', error)
    services.value = []
    dataLoaded.value = true
  } finally {
    dataLoading.value = false
  }
}

// 跳转到服务详情页面
const goToDetail = (item) => {  
	console.log('跳转到服务详情页面，服务信息:', item)
	uni.navigateTo({
		url: `/subPackages/py/fr_detail?service_id=${item.service_id}&price_template_id=${item.price_template_id || ''}&companion_id=${user.value.application_id || 15}&level_order=${user.value.level_order || ''}&nickname=${user.value.nickname || ''}&service_name=${encodeURIComponent(item.service_name)}&service_image_url=${encodeURIComponent(item.service_image_url)}&price=${item.price || 0}&unit=${item.unit || '小时'}&service_tags=${encodeURIComponent(JSON.stringify(item.service_tags || []))}`
	})
}

// 下拉刷新状态
const refreshing = ref(false)
const isRefreshing = ref(false) // 防止重复刷新

// 下拉刷新处理
const onRefresh = async () => {
  // 防止重复刷新
  if (isRefreshing.value) {
    return
  }
  
  isRefreshing.value = true
  refreshing.value = true
  
  try {
    // 检查城市列表是否为空，如果为空则重新加载
    if (cityStore.cityList.length === 0) {
      console.log('城市列表为空，重新加载城市列表')
      await cityStore.loadCityList()
    }
    
    // 下拉刷新时强制重新加载数据
    console.log('下拉刷新服务数据')
    await loadCityServicesData()
    // 模拟加载时间，确保用户能看到刷新动画
    await new Promise(resolve => setTimeout(resolve, 800))
  } catch (error) {
    console.error('刷新失败:', error)
  } finally {
    // 确保刷新状态被重置
    refreshing.value = false
    isRefreshing.value = false
  }
}

// 刷新完成处理
const onRefreshRestore = () => {
  refreshing.value = false
  isRefreshing.value = false
}

// 自定义城市选择
const showCityPicker = ref(false)

function onCitySelected(index) {
  const oldCityIndex = cityStore.cityIndex
  
  // 如果城市发生变化，重新加载所有选项卡的数据
  if (oldCityIndex !== index) {
    console.log(`手动选择城市: ${cityStore.cityList[index].name}`)
    loadCityServicesData()
  }
}


</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";



.page{
  background: $bg-color-secondary;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.main-content {
		flex: 1;
		display: flex;
		overflow: hidden;
		box-sizing: border-box;

	}
/* 滚动容器 */
.scroll-container {
 
  background: $bg-color-secondary;
  width: 100%;
  
  /* 隐藏滚动条 */
  &::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }
  
  /* iOS滚动优化 */
  -webkit-overflow-scrolling: touch;
  
  /* 滚动回弹效果 */
  overscroll-behavior: contain;
  
  /* 确保scroll-view正常工作 */
  position: relative;
  z-index: 1;
  
  /* 确保内容可以滚动到底部 */
  box-sizing: border-box;
}

/* 顶部区域 - 现在只包含logo */
.header {
  background: linear-gradient(135deg, $bg-color-primary 0%, rgba(247, 248, 250, 0.95) 100%);
  padding: 20rpx 24rpx 20rpx 24rpx;
  border-bottom: none;
  box-shadow: 0 6rpx 24rpx rgba(130, 160, 216, 0.05);
  border-radius: 0 0 32rpx 32rpx;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  box-sizing: border-box;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 240rpx;
    height: 240rpx;
    background: radial-gradient(circle, rgba(130, 160, 216, 0.06) 0%, rgba(167, 188, 231, 0.03) 50%, transparent 100%);
    border-radius: 50%;
    z-index: 1;
    animation: float 6s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -30%;
    left: -10%;
    width: 160rpx;
    height: 160rpx;
    background: radial-gradient(circle, rgba(255, 111, 97, 0.04) 0%, rgba(130, 160, 216, 0.02) 50%, transparent 100%);
    border-radius: 50%;
    z-index: 1;
    animation: float 8s ease-in-out infinite reverse;
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15rpx) rotate(180deg); }
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 2;
  height: 88rpx; /* 为胶囊按钮预留空间 */
  padding-right: 200rpx; /* 为胶囊按钮预留右侧空间 */
}

.logo-container {
  display: flex;
  flex-direction: column;
  position: relative;
}

.logo {
  font-size: 40rpx;
  font-weight: 700;
  background: linear-gradient(135deg, $primary-color 0%, $primary-hover 60%, $highlight-color 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 4rpx;
  text-shadow: none;
  letter-spacing: 2rpx;
  position: relative;

}

.logo-tag {
  font-size: 22rpx;
  color: $text-color-secondary;
  font-weight: 500;
  letter-spacing: 1rpx;
}







/* 内容区域 */
.content-section {
  padding: 24rpx; /* 调整上边距 */
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -80rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 160rpx;
    height: 160rpx;
    background: radial-gradient(circle, rgba(130, 160, 216, 0.02) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 0;
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  position: relative;
  z-index: 1;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-color-primary;
  position: relative;
  padding-left: 20rpx;
  letter-spacing: 0.5rpx;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6rpx;
  height: 28rpx;
  width: 6rpx;
  background: linear-gradient(to bottom, $primary-color 0%, $highlight-color 100%);
  border-radius: 6rpx;
  box-shadow: 0 2rpx 6rpx rgba(130, 160, 216, 0.25);
}

.section-more {
  font-size: 24rpx;
  color: #666666;
  font-weight: 600;
  padding: 6rpx 12rpx;
  border-radius: 16rpx;
  background: linear-gradient(135deg, rgba(102, 102, 102, 0.06) 0%, rgba(255, 255, 255, 0.8) 100%);
  border: 1rpx solid rgba(102, 102, 102, 0.12);
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.95);
    color: $primary-color;
    background: linear-gradient(135deg, rgba(115, 99, 255, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%);
    border-color: rgba(115, 99, 255, 0.15);
  }
}



/* 服务卡片列表 */
.service-list-soul {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  position: relative;
  z-index: 1;
  padding: 4rpx 0; /* 减少上下边距从12rpx到4rpx */
}

.service-card-soul {
  display: flex;
  background: linear-gradient(135deg, $bg-color-primary 0%, rgba(255, 255, 255, 0.98) 100%);
  border-radius: 24rpx;
  padding: 24rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.04);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 1rpx solid rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  position: relative;
  overflow: hidden;
  margin-bottom: 24rpx;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 80rpx;
    height: 80rpx;
    background: radial-gradient(circle, rgba(255, 105, 222, 0.03) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 0;
  }
  
  &:active {
    transform: translateY(-4rpx) scale(1.01);
    box-shadow: 0 12rpx 36rpx rgba(0, 0, 0, 0.08);
    border-color: rgba(255, 105, 222, 0.12);
  }
}

.service-img-wrap {
  width: 160rpx;
  height: 160rpx;
  border-radius: 20rpx;
  overflow: hidden;
  margin-right: 24rpx;
  flex-shrink: 0;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 105, 222, 0.06) 0%, transparent 50%);
    z-index: 1;
    border-radius: 20rpx;
  }
}

.service-rating {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  background: linear-gradient(135deg, $highlight-color 0%, #FF8A65 100%);
  color: white;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 20rpx;
  z-index: 3;
  backdrop-filter: blur(8rpx);
  -webkit-backdrop-filter: blur(8rpx);
  box-shadow: 0 3rpx 12rpx rgba(255, 111, 97, 0.25);
  font-weight: 600;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

.service-img-soul {
  width: 100%;
  height: 100%;
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 2;
  position: relative;
}

.service-img-wrap:active .service-img-soul {
  transform: scale(1.05);
}

.service-info-soul {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.service-title-soul {
  font-weight: 700;
  font-size: 32rpx;
  color: $text-color-primary;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0.5rpx;
  position: relative;
}

.service-desc-soul {
  font-size: 24rpx;
  color: $text-color-secondary;
  margin-bottom: 12rpx;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  font-weight: 400;
}

.service-tags-soul {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: auto;
  margin-top: 4rpx;
  gap: 8rpx;
}

.tag-soul {
  font-size: 20rpx;
  background: linear-gradient(135deg, rgba(108, 117, 125, 0.08) 0%, rgba(248, 249, 250, 0.6) 100%);
  color: #495057;
  padding: 4rpx 12rpx;
  border-radius: 16rpx;
  font-weight: 600;
  border: 1rpx solid rgba(108, 117, 125, 0.12);
  backdrop-filter: blur(8rpx);
  -webkit-backdrop-filter: blur(8rpx);
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.95);
    background: linear-gradient(135deg, rgba(255, 105, 222, 0.1) 0%, rgba(255, 255, 255, 0.8) 100%);
    color: $highlight-color;
    border-color: rgba(255, 105, 222, 0.2);
  }
}

.service-actions-soul {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
  padding-top: 12rpx;
  // border-top: 1rpx solid rgba(0, 0, 0, 0.06);
}

.price-info {
  display: flex;
  align-items: baseline;
  position: relative;
}

.price-amount {
  color:$pricelight-color;
  font-weight: 700;
  font-size: 30rpx;
  text-shadow: 0 1rpx 3rpx rgba(255, 111, 97, 0.15);
}

.price-unit {
  color: $text-color-secondary;
  font-size: 20rpx;
  margin-left: 4rpx;
  font-weight: 500;
}

.order-btn-soul {
  background: linear-gradient(135deg, $primary-color 0%, $highlight-color 100%);
  color: white;
  border-radius: 32rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 24rpx rgba(130, 160, 216, 0.25);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: none;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.5rpx;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
    transition: left 0.6s;
  }
  
  &:active {
    transform: translateY(-2rpx) scale(1.02);
    box-shadow: 0 12rpx 32rpx rgba(130, 160, 216, 0.35);
    background: linear-gradient(135deg, $primary-hover 0%, $primary-color 100%);
  }
  
  &:active::before {
    left: 100%;
  }
}



/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
  text-align: center;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 32rpx;
  opacity: 0.6;
}

.empty-text {
  font-size: 32rpx;
  color: $text-color-primary;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: $text-color-secondary;
  line-height: 1.4;
}

/* 底部安全区域 */
.bottom-safe-area {
  height: 120rpx; /* 增加高度，为TabBar和安全区域预留空间 */
  background: transparent;
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
  text-align: center;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #f0f0f0;
  border-top: 6rpx solid #7363ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 32rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: #666666;
  font-weight: 500;
}
</style> 