<template>
  <view class="home-container">
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

     
    >
      <!-- 轮播banner -->
      <view class="banner-container">
        <view class="banner-swiper" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
          <view class="banner-track" :style="{ transform: `translateX(-${currentBanner * 100}%)` }">
            <view v-for="(b, idx) in banners" :key="idx" class="banner-slide-img">
              <image :src="b.img" class="banner-img-full" mode="aspectFill" />
              <view class="banner-img-content">
                <view class="banner-content-wrapper">
                  <text class="banner-title-img">{{ b.title }}</text>
                  <text class="banner-subtitle-img">{{ b.subtitle }}</text>
                  <view class="banner-action-hint">
                    <text class="action-text">了解更多</text>
                    <text class="action-arrow">→</text>
                  </view>
                </view>
              </view>
            </view>
          </view>
          <view class="banner-controls">
            <view class="banner-dots">
              <text 
                v-for="(_, index) in banners" 
                :key="index" 
                :class="['dot', { active: currentBanner === index }]" 
                @click="currentBanner = index"
              ></text>
            </view>
          </view>
        </view>
      </view>

      <!-- 服务选项卡 -->
      <view class="category-tabs">
        <view 
          v-for="tab in serviceTabs" 
          :key="tab" 
          :class="['category-tab', {active: serviceTab === tab}]" 
          @click="switchServiceTab(tab)"
        >
          <text>{{ tab }}</text>
          <view class="tab-indicator" v-if="serviceTab === tab"></view>
        </view>
      </view>

      <!-- 页面内容 -->
      <view class="content-section">
        <!-- 服务选项卡滑动容器 -->
        <swiper
          class="tab-content-swiper"
          :current="currentTabIndex"
          @change="onSwiperChange"
          :indicator-dots="false"
          :circular="false"
          :autoplay="false"
          :duration="300"
        >
          <!-- 每个选项卡的内容 -->
          <swiper-item v-for="tab in serviceTabs" :key="tab">
            <scroll-view 
              class="tab-scroll-view" 
              scroll-y="true"
              refresher-enabled="true"
              :refresher-triggered="refreshing"
              @refresherrefresh="onRefresh(tab)"
              @refresherrestore="onRefreshRestore"
            >
              <view class="service-list-soul">
                <!-- 加载状态 -->
                <view v-if="dataLoading[tab]" class="loading-state">
                  <view class="loading-spinner"></view>
                  <text class="loading-text">加载中...</text>
                </view>
                
                <!-- 服务列表 -->
                <view v-else-if="getTabServiceItems(tab).length > 0">
                  <view v-for="item in getTabServiceItems(tab)" :key="item.id" class="service-card-soul" @click="navigateToServiceDetail(item.id)">
                    <view class="service-img-wrap">
                      <image :src="$imgBaseUrl + item.img" class="service-img-soul" mode="aspectFill" />
                    </view>
                    <view class="service-info-soul">
                      <text class="service-title-soul">{{ item.name }}</text>
                      <view class="service-tags-soul">
                        <text v-for="tag in item.tags" :key="tag" class="tag-soul">{{ tag }}</text>
                      </view>
                      <view class="service-actions-soul">
                        <view class="price-info">
                          <text class="price-amount">¥{{ item.min_price || 0 }}</text>
                          <text class="price-unit">/{{ item.unit }}起</text>
                        </view>
                        <view class="order-btn-soul" >
                          <text>立即预约</text>
                        </view>
                      </view>
                    </view>
                  </view>
                </view>
                
                <!-- 空状态 - 只在加载完成后且没有数据时显示 -->
                <view v-else-if="dataLoaded[tab] && getTabServiceItems(tab).length === 0" class="empty-state">
                  <image src="/static/images/empty.png" class="empty-icon" mode="aspectFit" />
                  <text class="empty-text">暂无{{ tab }}服务</text>
                  <text class="empty-desc">更多精彩服务即将上线</text>
                </view>
              </view>
            </scroll-view>
          </swiper-item>
        </swiper>
      </view>
     
    </scroll-view>

     </view>

    <!-- 城市选择弹窗 -->
    <CityPicker 
      v-model:visible="showCityPicker" 
      @city-selected="onCitySelected"
    />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { getHotRecommendServices } from '@/api/home.js'
import { useCityStore } from '@/stores/city.js'
import CitySelector from '@/components/common/CitySelector.vue'
import CityPicker from '@/components/common/CityPicker.vue'

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
  
  // 自动轮播
  bannerTimer = setInterval(() => {
    nextBanner()
  }, 5000)

  // 初始化城市数据（获取位置和加载城市列表）
  await cityStore.initCityData()
  
  // 只加载当前选中的选项卡数据（默认"服务"）
  await loadSingleTabData(serviceTab.value)
})

// 获取全局城市store
const cityStore = useCityStore()

// 使用全局store的计算属性
const city = computed(() => cityStore.currentCity)
const currentCityCode = computed(() => cityStore.currentCityCode)
const cityList = computed(() => cityStore.cityList)
const cityIndex = computed(() => cityStore.cityIndex)

// 轮播相关数据
const currentBanner = ref(0)
const serviceTab = ref('服务')
const serviceTabs = ['服务', '娱乐', '运动']

// 页面卸载时清除定时器
let bannerTimer = null
onUnmounted(() => {
  if (bannerTimer) {
    clearInterval(bannerTimer)
  }
  if (swiperChangeTimer) {
    clearTimeout(swiperChangeTimer)
  }
})

function nextBanner() {
  if (currentBanner.value < banners.length - 1) {
    currentBanner.value++
  } else {
    currentBanner.value = 0
  }
}

function prevBanner() {
  if (currentBanner.value > 0) {
    currentBanner.value--
  } else {
    currentBanner.value = banners.length - 1
  }
}

// 城市选择 - 使用全局store
function onCityChange(e) {
  cityStore.selectCity(e.detail.value)
}

// Banner data
const banners = [
  {
    title: '友伴招募',
    subtitle: '挑战高薪 | 男女不限',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: '监督举报',
    subtitle: '平台禁止私下交易',
    img: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
  },
  {
    title: '全国热招',
    subtitle: '城市独家运营商',
    img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
  }
]

// 为每个选项卡存储数据
const allServiceItems = ref({
  '服务': [],
  '娱乐': [],
  '运动': []
})

// 数据加载状态 - 添加loading状态
const dataLoaded = ref({
  '服务': false,
  '娱乐': false,
  '运动': false
})

const dataLoading = ref({
  '服务': false,
  '娱乐': false,
  '运动': false
})

// 加载单个选项卡的服务数据 - 添加城市代码参数和强制刷新参数
const loadSingleTabData = async (tab, forceRefresh = false) => {
  // 如果已经加载过且不是重新加载，直接返回（除非强制刷新）
  if (dataLoaded.value[tab] && !dataLoading.value[tab] && !forceRefresh) {
    console.log(`${tab}数据已缓存，跳过加载`)
    return
  }
  
  dataLoading.value[tab] = true
  console.log(`开始加载${tab}服务数据，当前城市代码:`, currentCityCode.value, forceRefresh ? '(强制刷新)' : '')
  
  try {
    const requestParams = {
      category: getTabCategoryId(tab),
      page_size: 10,
      city_code: currentCityCode.value // 传递当前选中城市的代码
    }
    
    console.log(`${tab}服务请求参数:`, requestParams)
    
    const response = await getHotRecommendServices(requestParams)
    
    if (response.data && response.data.code === 0 && response.data.data && response.data.data.list) {
      // 转换API数据格式为模板需要的格式
      allServiceItems.value[tab] = response.data.data.list.map(item => ({
        id: item.id,
        name: item.name,
        desc: item.description,
        tags: item.tags || [],
        img: item.image_url || '/static/images/service-default.png',
        min_price: item.min_price || 0,
        unit: item.unit || '次', // 添加单位字段
        price_template_id: item.price_template_id // 添加价格模板ID
      }))
      
      console.log(`${tab}服务数据加载成功，共${allServiceItems.value[tab].length}条`)
    } else {
      // API返回数据为空
      allServiceItems.value[tab] = []
      console.log(`${tab}服务数据为空`)
    }
    dataLoaded.value[tab] = true
  } catch (error) {
    console.error(`获取${tab}服务数据失败:`, error)
    // 请求失败，清空数据
    allServiceItems.value[tab] = []
    dataLoaded.value[tab] = true
  } finally {
    dataLoading.value[tab] = false
  }
}

// 加载所有选项卡的服务数据 - 重新加载时清除缓存
const loadAllServicesData = async () => {
  console.log('重新加载所有选项卡数据')
  // 清除所有加载状态，强制重新加载
  Object.keys(dataLoaded.value).forEach(tab => {
    dataLoaded.value[tab] = false
  })
  
  // 只加载当前选中的选项卡
  await loadSingleTabData(serviceTab.value)
}

// 获取tab对应的分类ID
const getTabCategoryId = (tabName) => {
  switch(tabName) {
    case '服务': return 1
    case '娱乐': return 2
    case '运动': return 3
    default: return 0
  }
}

// 当前选项卡索引
const currentTabIndex = ref(0)

// 防抖定时器
let swiperChangeTimer = null

// 切换服务tab - 优化为懒加载
const switchServiceTab = async (tab) => {
  const oldTab = serviceTab.value
  const newTab = tab
  
  serviceTab.value = newTab
  currentTabIndex.value = serviceTabs.indexOf(newTab)
  
  // 如果切换到新的tab且该tab未加载数据，则加载数据
  if (oldTab !== newTab && !dataLoaded.value[newTab]) {
    await loadSingleTabData(newTab)
  }
}

// swiper滑动改变时的处理（检查数据加载状态）
const onSwiperChange = async (e) => {
  const index = e.detail.current
  const newTab = serviceTabs[index]
  const oldTab = serviceTab.value
  
  currentTabIndex.value = index
  serviceTab.value = newTab
  
  // 清除之前的定时器
  if (swiperChangeTimer) {
    clearTimeout(swiperChangeTimer)
  }
  
  // 如果切换到新的tab且该tab未加载数据，则延迟加载数据（防抖）
  if (oldTab !== newTab && !dataLoaded.value[newTab]) {
    swiperChangeTimer = setTimeout(async () => {
      await loadSingleTabData(newTab)
    }, 300) // 300ms防抖延迟
  }
}

// 获取指定选项卡的服务数据
const getTabServiceItems = (tab) => {
  return allServiceItems.value[tab] || []
}

// 触摸事件处理
let touchStartX = 0
let touchEndX = 0

function onTouchStart(e) {
  touchStartX = e.touches[0].clientX
}

function onTouchMove(e) {
  touchEndX = e.touches[0].clientX
}

function onTouchEnd() {
  if (touchEndX === 0) return
  if (touchEndX - touchStartX > 50 && currentBanner.value > 0) {
    currentBanner.value--
  } else if (touchStartX - touchEndX > 50 && currentBanner.value < banners.length - 1) {
    currentBanner.value++
  }
  touchStartX = 0
  touchEndX = 0
}

// 跳转到服务详情页功能
function navigateToServiceDetail(serviceId) {
  console.log('跳转到服务详情页, ID:', serviceId)
  
  // 获取当前服务项的数据
  const currentTabItems = getTabServiceItems(serviceTab.value)
  const serviceItem = currentTabItems.find(item => item.id === serviceId)
  
  // 构建URL参数
  let url = `/subPackages/home/detail?id=${serviceId}`
  if (serviceItem && serviceItem.price_template_id) {
    url += `&price_template_id=${serviceItem.price_template_id}`
  }
  
  console.log('跳转URL:', url)
  uni.navigateTo({
    url: url
  })
}

// 预约服务
function orderService(item) {
  console.log('预约服务:', item.name)
  uni.showToast({
    title: `预约${item.name}成功`,
    icon: 'success'
  })
}

// 下拉刷新状态
const refreshing = ref(false)
const isRefreshing = ref(false) // 防止重复刷新

// 下拉刷新处理
const onRefresh = async (tab) => {
  // 防止重复刷新和非当前选项卡刷新
  if (isRefreshing.value || tab !== serviceTab.value) {
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
    console.log(`下拉刷新${tab}选项卡数据`)
    await loadSingleTabData(tab, false)
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
    loadAllServicesData()
  }
}


</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";



.home-container {
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



/* Banner 容器 - 现在在scroll-view内部 */
.banner-container {
  margin: 20rpx 24rpx;
  position: relative;
  z-index: 2;
}

/* Banner 轮播 */
.banner-swiper {
  position: relative;
  overflow: hidden;
  margin-bottom: 24rpx;
  border-radius: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(130, 160, 216, 0.1);
  background: linear-gradient(135deg, rgba(130, 160, 216, 0.02) 0%, rgba(255, 111, 97, 0.01) 100%);
  padding: 3rpx;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(130, 160, 216, 0.06) 0%, rgba(255, 111, 97, 0.03) 100%);
    border-radius: 24rpx;
    z-index: 0;
  }
}

.banner-track {
  display: flex;
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  z-index: 1;
  gap: 20rpx;
}

.banner-slide-img {
  width: 100%;
  flex-shrink: 0;
  position: relative;
  border-radius: 28rpx;
  overflow: hidden;
}

.banner-img-full {
  width: 100%;
  height: 300rpx;
  border-radius: 21rpx;
}

.banner-img-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 0;
  z-index: 2;
  border-radius: 0 0 28rpx 28rpx;
}

.banner-content-wrapper {
  padding: 48rpx 40rpx 40rpx;
  background: linear-gradient(to top, 
    rgba(0,0,0,0.6) 0%, 
    rgba(0,0,0,0.3) 40%,
    transparent 70%);
  border-radius: 0 0 28rpx 28rpx;
  backdrop-filter: blur(8rpx);
  -webkit-backdrop-filter: blur(8rpx);
  box-sizing: border-box;
}

.banner-title-img {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: white;
  text-shadow: 0 2rpx 12rpx rgba(0,0,0,0.4);
  margin-bottom: 12rpx;
  letter-spacing: 1rpx;
}

.banner-subtitle-img {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1rpx 6rpx rgba(0,0,0,0.3);
  margin-bottom: 24rpx;
  line-height: 1.4;
}

.banner-action-hint {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10rpx);
  -webkit-backdrop-filter: blur(10rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  border-radius: 24rpx;
  padding: 12rpx 20rpx;
  width: fit-content;
  transition: all 0.3s;
  
  &:active {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(0.98);
  }
}

.action-text {
  font-size: 24rpx;
  color: white;
  font-weight: 500;
  margin-right: 8rpx;
}

.action-arrow {
  font-size: 24rpx;
  color: white;
  font-weight: 600;
  transition: transform 0.3s;
}

.banner-action-hint:active .action-arrow {
  transform: translateX(4rpx);
}

.banner-controls {
  position: absolute;
  bottom: 20rpx;
  left: 0;
  width: 100%;
  z-index: 10;
}

.banner-dots {
  display: flex;
  justify-content: center;
  position: relative;
  z-index: 5;
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(16rpx) saturate(1.2);
  -webkit-backdrop-filter: blur(16rpx) saturate(1.2);
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
  width: fit-content;
  margin: 0 auto;
  border: 1rpx solid rgba(255, 255, 255, 0.1);
}

.dot {
  width: 8rpx;
  height: 8rpx;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  margin: 0 6rpx;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
}

.dot.active {
  width: 32rpx;
  height: 8rpx;
  border-radius: 4rpx;
  background: linear-gradient(90deg, white 0%, rgba(255, 255, 255, 0.8) 100%);
  box-shadow: 0 2rpx 8rpx rgba(255, 255, 255, 0.3);
}

/* 服务标签区域 - 现在在scroll-view内部 */
.category-tabs {
  display: flex;
  justify-content: space-around;
  margin: 12rpx 32rpx 8rpx; /* 减少下边距从20rpx到8rpx */
  position: relative;
  padding: 6rpx;
  border-radius: 24rpx;
  z-index: 2;
  background: linear-gradient(135deg, rgba(130, 160, 216, 0.05) 0%, rgba(255, 255, 255, 0.7) 100%);
  backdrop-filter: blur(15rpx);
  -webkit-backdrop-filter: blur(15rpx);
  border: 1rpx solid rgba(130, 160, 216, 0.08);
  box-shadow: 0 4rpx 20rpx rgba(130, 160, 216, 0.06);
}

.category-tab {
  flex: 1;
  text-align: center;
  padding: 14rpx 0 20rpx; /* 增加底部padding为指示器留出空间 */
  font-size: 28rpx;
  font-weight: 500;
  color: $text-color-secondary;
  position: relative;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border-radius: 18rpx;
  margin: 0 3rpx;
  
  &:active {
    transform: scale(0.98);
  }
}

.category-tab.active {
  color: $primary-color;
  font-weight: 700;
  background: linear-gradient(135deg, rgba(130, 160, 216, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%);
  box-shadow: 0 2rpx 12rpx rgba(130, 160, 216, 0.12);
  transform: translateY(-1rpx);
}

.tab-indicator {
  position: absolute;
  bottom: 6rpx; /* 调整位置，确保不被裁剪 */
  left: 25%;
  width: 50%;
  height: 4rpx; /* 增加高度，让指示器更明显 */
  background: linear-gradient(90deg, $primary-color 0%, $highlight-color 100%);
  border-radius: 2rpx;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 1rpx 6rpx rgba(130, 160, 216, 0.3);
  z-index: 2; /* 确保在最上层 */
}

/* 内容区域 */
.content-section {
  padding: 4rpx 24rpx 24rpx; /* 减少上边距从12rpx到4rpx */
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

/* 选项卡内容滑动容器 */
.tab-content-swiper {
  height: calc(100vh - 360rpx); /* 根据实际情况调整高度 */
  width: 100%;
}

.tab-scroll-view {
  height: 100%;
  width: 100%;
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