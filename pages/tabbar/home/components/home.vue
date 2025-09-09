<template>
	<view class="home-container" v-if="userStore.switch === 1">
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
	 
	  	  <!-- 服务选项卡 - 移到scroll-view外层，不跟随滚动 -->
	  <view class="category-tabs">
		<u-tabs
		  :list="tabsList"
		  :current="currentTabIndex"
		  @change="handleTabChange"
		  lineWidth="20"
		  lineHeight="2"
		  :lineColor="`linear-gradient(90deg, rgba(115, 99, 255, 1) 0%, rgba(255, 105, 222, 1) 100%)`"
		  :activeStyle="{
			color: '#7363FF',
			fontWeight: '500',
			fontSize: '28rpx',
		
		  }"
		  :inactiveStyle="{
			color: '#1A1A1A',
			fontWeight: '400',
			fontSize: '28rpx',
				
		  }"
		  itemStyle="padding: 16rpx 50rpx; height: auto; border-radius: 30rpx;"
		></u-tabs>
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
				@scrolltolower="onScrollToLower(tab)"
			  >
				<view class="service-list-soul">
				  <!-- 顶部加载指示器 - 只在有数据且正在加载时显示 -->
				
				  <!-- 服务列表 - 优先显示数据，加载期间也显示 -->
				  <view v-if="getTabServiceItems(tab).length > 0">
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
					
					<!-- 底部加载更多指示器 -->
					<view v-if="pagination[tab].hasMore" class="load-more-indicator">
					  <view v-if="loadingMore[tab]" class="loading-more">
						<view class="loading-spinner-small"></view>
						<text class="loading-text-small">加载中...</text>
					  </view>
					  <view v-else class="load-more-text">
						<text>上拉加载更多</text>
					  </view>
					</view>
					
					<!-- 没有更多数据提示 -->
					<view v-else class="no-more-data">
						<text>没有更多数据了</text>
					</view>
				  </view>
				  
				  <!-- 空状态 - 只在加载完成后且没有数据时显示 -->
				  <view v-else-if="dataLoaded[tab] && getTabServiceItems(tab).length === 0" class="empty-state">
					<image src="/static/images/empty.png" class="empty-icon" mode="aspectFit" />
					<text class="empty-text">暂无{{ tab }}服务</text>
					<text class="empty-desc">更多精彩服务即将上线</text>
				  </view>
				  
				  <!-- 首次加载状态 - 只在没有数据且正在加载时显示 -->
				  <view v-else-if="dataLoading[tab] && getTabServiceItems(tab).length === 0" class="loading-state">
					<view class="loading-spinner"></view>
					<text class="loading-text">加载中...</text>
				  </view>
				</view>
			  </scroll-view>
			</swiper-item>
		  </swiper>
		</view>
	   
	   
	   
	   	   <view style="height: 160rpx;"></view>

  
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
  
  
  console.log('home组件挂载完成')
  
  
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
	
	// 只加载当前选中的选项卡数据（默认"娱乐"）
	await loadSingleTabData(serviceTab.value)
  })
  
  // 获取全局城市store
  const cityStore = useCityStore()
  
  // 使用全局store的计算属性
  const city = computed(() => cityStore.currentCity)
  const currentCityCode = computed(() => cityStore.currentCityCode)
  const cityList = computed(() => cityStore.cityList)
  const cityIndex = computed(() => cityStore.cityIndex)
  
  
  const serviceTab = ref('娱乐')
  const serviceTabs = ['服务', '娱乐', '运动']
  // const serviceTabs = ['服务']
  
  // u-tabs 需要的数据格式
  const tabsList = computed(() => {
    return serviceTabs.map(tab => ({
      name: tab
    }))
  })
  // 页面卸载时清除定时器
  onUnmounted(() => {
	if (swiperChangeTimer) {
	  clearTimeout(swiperChangeTimer)
	}
  })
  
  
  
  // 城市选择 - 使用全局store
  function onCityChange(e) {
	cityStore.selectCity(e.detail.value)
  }
  
  
  
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
  
  // 添加分页状态管理
  const pagination = ref({
	'服务': { page: 1, hasMore: true },
	'娱乐': { page: 1, hasMore: true },
	'运动': { page: 1, hasMore: true }
  })
  
  // 上拉加载状态
  const loadingMore = ref({
	'服务': false,
	'娱乐': false,
	'运动': false
  })
  
  // 加载单个选项卡的服务数据 - 添加城市代码参数和强制刷新参数
  const loadSingleTabData = async (tab, forceRefresh = false) => {
	// 添加参数验证
	if (!tab) {
	  console.error('loadSingleTabData: tab parameter is required')
	  return
	}
	
	// 确保 pagination 对象中有对应的 tab
	if (!pagination.value[tab]) {
	  console.log(`初始化 ${tab} 的分页状态`)
	  pagination.value[tab] = { page: 1, hasMore: true }
	}
	
	// 如果已经加载过且不是重新加载，直接返回（除非强制刷新）
	if (dataLoaded.value[tab] && !dataLoading.value[tab] && !forceRefresh) {
	  console.log(`${tab}数据已缓存，跳过加载`)
	  return
	}
	
	// 强制刷新时清除缓存状态
	if (forceRefresh) {
	  dataLoaded.value[tab] = false
	  console.log(`强制刷新${tab}，清除缓存状态`)
	}
	
	dataLoading.value[tab] = true
	console.log(`开始加载${tab}服务数据，当前城市代码:`, currentCityCode.value, forceRefresh ? '(强制刷新)' : '')
	
	try {
	  const requestParams = {
		category: getTabCategoryId(tab),
		page_size: 10,
		city_code: currentCityCode.value, // 传递当前选中城市的代码
		page: pagination.value[tab].page // 传递当前页码
	  }
	  
	  console.log(`${tab}服务请求参数:`, requestParams)
	  
	  const response = await getHotRecommendServices(requestParams)
	  
	  if (response.data && response.data.code === 0 && response.data.data && response.data.data.list) {
		// 转换API数据格式为模板需要的格式，并过滤掉id为3和5的服务
		const originalCount = response.data.data.list.length
		const newData = response.data.data.list
		  .filter(item => item.id !== 3 && item.id !== 5) // 过滤掉id为3和5的服务
		  .map(item => ({
			id: item.id,
			name: item.name,
			desc: item.description,
			tags: item.tags || [],
			img: item.image_url || '/static/images/service-default.png',
			min_price: item.min_price || 0,
			unit: item.unit || '次', // 添加单位字段
			price_template_id: item.price_template_id // 添加价格模板ID
		  }))
		
		console.log(`${tab}服务数据过滤: 原始${originalCount}条，过滤后${newData.length}条`)
		
		// 只有在强制刷新时才替换数据，否则保留现有数据
		if (forceRefresh) {
		  console.log(`${tab}强制刷新前页码: ${pagination.value[tab].page}`)
		  allServiceItems.value[tab] = newData
		  pagination.value[tab].page = 1 // 强制刷新后重置页码
		  pagination.value[tab].hasMore = true // 强制刷新后重置加载更多状态
		  console.log(`${tab}服务数据强制刷新成功，共${newData.length}条，重置后页码: ${pagination.value[tab].page}`)
		} else {
		  // 初始加载时，直接替换数据，不增加页码
		  allServiceItems.value[tab] = newData
		  pagination.value[tab].hasMore = newData.length === 10 // 判断是否还有更多数据
		  console.log(`${tab}服务数据初始加载成功，共${newData.length}条`)
		}
	  } else {
		// API返回数据为空，但不清空现有数据（除非是强制刷新）
		if (forceRefresh) {
		  allServiceItems.value[tab] = []
		  pagination.value[tab].page = 1 // 强制刷新后重置页码
		  pagination.value[tab].hasMore = true // 强制刷新后重置加载更多状态
		  console.log(`${tab}服务数据强制刷新为空`)
		} else {
		  console.log(`${tab}服务数据为空，保留现有数据`)
		}
	  }
	  dataLoaded.value[tab] = true
	} catch (error) {
	  console.error(`获取${tab}服务数据失败:`, error)
	  // 请求失败时，只有在强制刷新时才清空数据
	  if (forceRefresh) {
		allServiceItems.value[tab] = []
		pagination.value[tab].page = 1 // 强制刷新后重置页码
		pagination.value[tab].hasMore = true // 强制刷新后重置加载更多状态
		console.log(`${tab}强制刷新失败，清空数据`)
	  } else {
		console.log(`${tab}数据加载失败，保留现有数据`)
	  }
	  dataLoaded.value[tab] = true
	} finally {
	  dataLoading.value[tab] = false
	}
  }
  
  // 加载更多数据（上拉加载）
  const loadMoreData = async (tab) => {
	// 添加参数验证
	if (!tab) {
	  console.error('loadMoreData: tab parameter is required')
	  return
	}
	
	// 确保 pagination 对象中有对应的 tab
	if (!pagination.value[tab]) {
	  console.log(`初始化 ${tab} 的分页状态`)
	  pagination.value[tab] = { page: 1, hasMore: true }
	}
	
	// 如果没有更多数据或正在加载，直接返回
	if (!pagination.value[tab].hasMore || loadingMore.value[tab] || dataLoading.value[tab]) {
	  console.log(`${tab}没有更多数据或正在加载中，跳过加载`)
	  return
	}
	
	loadingMore.value[tab] = true
	console.log(`开始加载更多${tab}数据，当前页码: ${pagination.value[tab].page}`)
	
	try {
	  const requestParams = {
		category: getTabCategoryId(tab),
		page_size: 10,
		city_code: currentCityCode.value,
		page: pagination.value[tab].page + 1 // 加载下一页
	  }
	  
	  console.log(`${tab}加载更多请求参数:`, requestParams)
	  
	  const response = await getHotRecommendServices(requestParams)
	  
	  if (response.data && response.data.code === 0 && response.data.data && response.data.data.list) {
		// 转换API数据格式并过滤掉id为3和5的服务
		const originalCount = response.data.data.list.length
		const newData = response.data.data.list
		  .filter(item => item.id !== 3 && item.id !== 5) // 过滤掉id为3和5的服务
		  .map(item => ({
			id: item.id,
			name: item.name,
			desc: item.description,
			tags: item.tags || [],
			img: item.image_url || '/static/images/service-default.png',
			min_price: item.min_price || 0,
			unit: item.unit || '次',
			price_template_id: item.price_template_id
		  }))
		
		console.log(`${tab}加载更多数据过滤: 原始${originalCount}条，过滤后${newData.length}条`)
		
		// 追加新数据
		const existingIds = new Set(allServiceItems.value[tab].map(item => item.id))
		const uniqueNewData = newData.filter(item => !existingIds.has(item.id))
		
		if (uniqueNewData.length > 0) {
		  allServiceItems.value[tab] = [...allServiceItems.value[tab], ...uniqueNewData]
		  pagination.value[tab].page++
		  pagination.value[tab].hasMore = newData.length === 10 // 如果返回的数据少于10条，说明没有更多了
		  console.log(`${tab}加载更多成功，新增${uniqueNewData.length}条，当前页码: ${pagination.value[tab].page}`)
		} else {
		  // 没有新数据，标记为没有更多
		  pagination.value[tab].hasMore = false
		  console.log(`${tab}没有更多新数据`)
		}
	  } else {
		// API返回数据为空，标记为没有更多
		pagination.value[tab].hasMore = false
		console.log(`${tab}加载更多返回空数据`)
	  }
	} catch (error) {
	  console.error(`加载更多${tab}数据失败:`, error)
	} finally {
	  loadingMore.value[tab] = false
	}
  }
  
  // 加载所有选项卡的服务数据 - 重新加载时清除缓存
  const loadAllServicesData = async () => {
	console.log('重新加载所有选项卡数据')
	// 清除所有加载状态，强制重新加载
	Object.keys(dataLoaded.value).forEach(tab => {
	  dataLoaded.value[tab] = false
	  // 确保 pagination 对象中有对应的 tab
	  if (!pagination.value[tab]) {
		pagination.value[tab] = { page: 1, hasMore: true }
	  }
	  pagination.value[tab].page = 1 // 强制刷新后重置页码
	  pagination.value[tab].hasMore = true // 强制刷新后重置加载更多状态
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
  
  // 当前选项卡索引 - 默认选中"娱乐"选项卡（索引1）
  const currentTabIndex = ref(1)
  
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
  
  // u-tabs 切换处理函数
  const handleTabChange = async (item) => {
	// u-tabs 传递的是对象，包含 name, rect, index 等属性
	let index, newTab
	
	if (typeof item === 'object' && item !== null) {
	  // 如果是对象，使用 index 属性
	  index = item.index
	  newTab = item.name
	} else if (typeof item === 'number') {
	  // 如果是数字，直接使用
	  index = item
	  newTab = serviceTabs[index]
	} else {
	  console.error('Invalid tab change item:', item)
	  return
	}
	
	// 添加边界检查
	if (index < 0 || index >= serviceTabs.length) {
	  console.error('Invalid tab index:', index)
	  return
	}
	
	if (!newTab) {
	  console.error('Tab not found for index:', index, 'item:', item)
	  return
	}
	
	console.log('Tab changed to:', newTab, 'index:', index)
	await switchServiceTab(newTab)
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
	console.log(`下拉刷新触发，当前tab: ${tab}, 当前serviceTab: ${serviceTab.value}`)
	
	// 添加参数验证
	if (!tab) {
	  console.error('onRefresh: tab parameter is required')
	  return
	}
	
	// 确保 pagination 对象中有对应的 tab
	if (!pagination.value[tab]) {
	  console.log(`初始化 ${tab} 的分页状态`)
	  pagination.value[tab] = { page: 1, hasMore: true }
	}
	
	// 防止重复刷新和非当前选项卡刷新
	if (isRefreshing.value || tab !== serviceTab.value) {
	  console.log(`刷新被阻止: isRefreshing=${isRefreshing.value}, tab不匹配=${tab !== serviceTab.value}`)
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
	  console.log(`下拉刷新${tab}选项卡数据，刷新前页码: ${pagination.value[tab].page}`)
	  
	  // 手动重置页码，确保下拉刷新时页码为1
	  pagination.value[tab].page = 1
	  console.log(`手动重置页码为1: ${pagination.value[tab].page}`)
	  
	  await loadSingleTabData(tab, true)
	  console.log(`下拉刷新${tab}选项卡数据完成，刷新后页码: ${pagination.value[tab].page}`)
	  
	  // 再次确保页码为1
	  if (pagination.value[tab].page !== 1) {
		console.warn(`页码重置失败，手动强制设置为1`)
		pagination.value[tab].page = 1
	  }
	  
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
  
  // 上拉加载处理
  const onScrollToLower = async (tab) => {
	console.log(`上拉加载触发，当前tab: ${tab}`)
	await loadMoreData(tab)
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
	
	height: 100vh;
	display: flex;
	flex-direction: column;
}

  /* 顶部区域 - 现在只包含logo */
  .header {

	padding: 20rpx 24rpx 20rpx 24rpx;
	border-bottom: none;

	border-radius: 0 0 32rpx 32rpx;
	position: relative;
	overflow: hidden;
	box-sizing: border-box;
	
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
  
  
  
  
  
  /* 服务标签区域 - 现在在scroll-view外层，不跟随滚动 */
  .category-tabs {
	margin: 12rpx 32rpx 8rpx; /* 减少下边距从20rpx到8rpx */
	position: relative;
	z-index: 2;
	display: flex;
	justify-content: center;
	align-items: center;
  }
  
  /* 内容区域 */
  .content-section {
	padding: 0rpx 24rpx; /* 减少上边距从12rpx到4rpx */
	position: relative;
	
	
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
	height: calc(100vh - 400rpx); /* 调整高度，为固定的category-tabs预留空间 */
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
	border-radius: 24rpx;
	padding: 24rpx;
	position: relative;
	overflow: hidden;
	margin-bottom: 20rpx;
   background: #ffffff;

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
  
  /* 顶部加载指示器样式 */
  .top-loading-indicator {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20rpx;
	background: rgba(255, 255, 255, 0.9);
	border-radius: 20rpx;
	margin-bottom: 20rpx;
	backdrop-filter: blur(10rpx);
	-webkit-backdrop-filter: blur(10rpx);
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
	border: 1rpx solid rgba(130, 160, 216, 0.1);
  }
  
  .loading-spinner-small {
	width: 32rpx;
	height: 32rpx;
	border: 3rpx solid #f0f0f0;
	border-top: 3rpx solid #7363ff;
	border-radius: 50%;
	animation: spin 1s linear infinite;
	margin-right: 16rpx;
  }
  
  .loading-text-small {
	font-size: 24rpx;
	color: #666666;
	font-weight: 500;
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
  
  /* 加载更多指示器样式 */
  .load-more-indicator {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 40rpx 20rpx;
	margin-top: 20rpx;
  }
  
  .loading-more {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 16rpx;
  }
  
  .load-more-text {
	font-size: 24rpx;
	color: $text-color-secondary;
	font-weight: 500;
	padding: 16rpx 32rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, rgba(130, 160, 216, 0.05) 0%, rgba(255, 255, 255, 0.8) 100%);
	border: 1rpx solid rgba(130, 160, 216, 0.1);
	backdrop-filter: blur(10rpx);
	-webkit-backdrop-filter: blur(10rpx);
  }
  
  .no-more-data {
	text-align: center;
	padding: 40rpx 20rpx;
	margin-top: 20rpx;
  }
  
  .no-more-data text {
	font-size: 24rpx;
	color: $text-color-secondary;
	font-weight: 500;
	padding: 16rpx 32rpx;
	border-radius: 20rpx;
	background: linear-gradient(135deg, rgba(130, 160, 216, 0.03) 0%, rgba(255, 255, 255, 0.6) 100%);
	border: 1rpx solid rgba(130, 160, 216, 0.08);
  }
  </style> 