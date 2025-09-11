<template>
	<view class="square" >
		<square-nav></square-nav>

		<!-- 动态列表内容 -->
		<scroll-view :scroll-top="scrollTop" scroll-y="true" class="scroll-Y" 
			:refresher-triggered="triggered" :refresher-enabled="true" :scroll-with-animation="true" :show-scrollbar="true"
			 :enable-back-to-top="true" @scroll="handleScroll" @scrolltolower="lower"
			@refresherrefresh="onRefresh" @refresherrestore="onRestore"
			>
			<view class="scroll-Y-item">
				<u-list height="100%">
					<u-list-item v-for="(item, index) in momentsList" :key="index">
						<square-item 
							:item="item" 
							:listType="listTypeDesc" 
							:userLocation="userLocation"
							:cityStore="cityStore"
							@changeShowVip="handleSayHello" 
							@playVideo="handlePlayVideo">
						</square-item>
					</u-list-item>  
					<view style="height: 200rpx;"></view>
				</u-list>
			</view>
		</scroll-view>

		<!-- 回到顶部 -->
		<view class="example" v-show="oldScrollTop > 1000" @tap="goTop">
			<uni-transition ref="ani" custom-class="transition" mode-class="slide-right" class="goTopBox"
				:show="oldScrollTop > 1000">
				<image class="go-top-icon" src="@/static/square/go-top.png" mode=""></image>
			</uni-transition>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted,
		nextTick,
		watch
	} from 'vue'
	import { useCityStore } from '@/stores/city.js'
	import { useUserStore } from '@/stores/user.js'
	import { getMomentsList } from '@/api/discover.js'
	
	import squareNav from './cpns/square-nav'
	import squareItem from './cpns/square-item'
	import squareLove from './cpns/square-love'

	// 修复：直接定义图片URL字符串，而不是使用import
	const imageSrc = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/img/cum/squarebg.png"

	// 定义emit事件
	const emit = defineEmits(['playVideo'])

	// 图片加载状态管理
	const imageLoaded = ref(false)

	// 城市存储
	const cityStore = useCityStore()
	
	// 用户状态管理
	const userStore = useUserStore()
	
	// 定位相关状态
	const userLocation = ref(null)
	const locationLoading = ref(false)

	// 动态列表数据
	const momentsList = ref([])
	const loading = ref(false)
	const hasMore = ref(true)
	
	// 分页参数
	const pageParams = ref({
		page: 1,
		page_size: 20
	})

	// 滚动相关状态
	const scrollTop = ref(0)
	const oldScrollTop = ref(0)
	const _freshing = ref(false)
	const triggered = ref(false)

	// 计算背景样式
	const backgroundStyle = computed(() => {
		if (imageLoaded.value) {
			// 图片加载成功时显示背景图片
			return {
				backgroundImage: `url(${imageSrc})`,
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat'
			}
		}
		
		// 图片加载中时使用默认背景
		return {
			background: '#ffffff'
		}
	})

	// 获取用户定位
	const getUserLocation = () => {
		return new Promise((resolve) => {
			locationLoading.value = true
			uni.getLocation({ 
				 type: 'wgs84',
				success: (res) => {
					console.log('获取位置成功:', res)
					userLocation.value = {
						latitude: res.latitude,
						longitude: res.longitude
					}
					locationLoading.value = false
					resolve({
						latitude: res.latitude,
						longitude: res.longitude
					})
				},
				fail: (err) => {
					console.log('获取位置失败:', err)
					userLocation.value = null
					locationLoading.value = false
					resolve(null)
				}
			})
		})
	}

	// 预加载图片
	const preloadImage = () => {
		// 重置状态
		imageLoaded.value = false
		
		// 在mini-program环境中，使用uni.getImageInfo替代Image构造函数
		// #ifdef MP
		uni.getImageInfo({
			src: imageSrc,
			success: () => {
				console.log('背景图片加载成功')
				imageLoaded.value = true
			},
			fail: (err) => {
				console.error('背景图片加载失败:', err)
			}
		})
		// #endif
		
		// #ifndef MP
		// 在非mini-program环境中使用Image构造函数
		const img = new Image()
		img.onload = () => {
			console.log('背景图片加载成功')
			imageLoaded.value = true
		}
		img.onerror = (err) => {
			console.error('背景图片加载失败:', err)
		}
		img.src = imageSrc
		// #endif
	}

	// u-tabs 需要的数据结构
	const tabsList = ref([
		{
			name: '动态',
			value: 1
		},
		{
			name: '喜欢的人',
			value: 2
		}
	])

	// 当前选中的tab索引
	const currentTabIndex = ref(0)

	// tabs样式切换 (保持兼容性)
	const isActive = ref(true)

	// tabs绑定的value值
	const listType = ref(1)

	// tabs绑定的描述
	const listTypeDesc = ref(1) // 1.推荐 2.喜欢
	
	// 登录状态检查
	const isLoggedIn = computed(() => {
		return userStore.userInfo && Object.keys(userStore.userInfo).length > 0 && userStore.token
	})

	// 获取动态列表数据
	const getMomentsListData = async (page = 1) => {
		console.log('开始获取动态列表数据，参数:', {
			page,
			listType: listTypeDesc.value,
			loading: loading.value
		})
		
		if (loading.value) return
		
		try {
			loading.value = true
			
			const params = {
				list_type: listTypeDesc.value, // 1: 推荐列表 2: 喜欢列表 3: 个人动态
				page: page,
				page_size: pageParams.value.page_size
			}
			
			console.log('调用API参数:', params)
			const response = await getMomentsList(params)
			console.log('API响应:', response)
			
			if (response.data && response.data.code === 0) {
				const newData = response.data.data.moments_list || []
				console.log('获取到的数据:', newData)
				
				if (page === 1) {
					momentsList.value = newData
				} else {
					momentsList.value = [...momentsList.value, ...newData]
				}
				
				// 判断是否还有更多数据
				hasMore.value = newData.length === pageParams.value.page_size
				
				// 如果还有数据，页码+1
				if (hasMore.value) {
					pageParams.value.page++
				}
			} else {
				console.error('API返回错误:', response)
			}
		} catch (error) {
			console.error('获取动态列表失败:', error)
			uni.showToast({
				icon: 'none',
				title: '获取数据失败，请重试'
			})
		} finally {
			loading.value = false
		}
	}

	// 处理视频播放
	const handlePlayVideo = (videoPath) => { 
		console.log('播放视频:', videoPath)
		emit('playVideo', videoPath)
	}

	// 处理打招呼
	const handleSayHello = async (val) => {
		console.log('打招呼:', val)
		// 这里可以添加打招呼的逻辑
	}
	
	// 跳转到登录页面
	const navigateToLogin = () => {
		uni.navigateTo({
			url: '/subPackages/login/index'
		})
	}
	
	// 检查登录状态并处理
	const checkLoginStatus = () => {
		if (!isLoggedIn.value) {
			uni.showModal({
				title: '提示',
				content: '请先登录后再查看动态',
				confirmText: '去登录',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						navigateToLogin()
					}
				}
			})
			return false
		}
		return true
	}

	// 滚动处理
	const handleScroll = (e) => {
		oldScrollTop.value = e.detail.scrollTop
	}

	// 监听页面滚动到底部
	const lower = () => {
		if (hasMore.value && !loading.value) {
			getMomentsListData(pageParams.value.page)
		}
	}

	// 回到顶部
	const goTop = (e) => {
		// 解决view层不同步的问题
		scrollTop.value = oldScrollTop.value
		nextTick(() => {
			scrollTop.value = 0
		})
	}

	// 下拉刷新
	const onRefresh = async () => {
		console.log('刷新中~');
		if (_freshing.value) return;
		
		// 检查登录状态
		if (!checkLoginStatus()) {
			triggered.value = false;
			return;
		}
		
		_freshing.value = true;
		triggered.value = true;
		// 获取动态列表的数据
		await getMomentsListData(1)
		_freshing.value = false;
		triggered.value = false;
	}

	// 自定义下拉刷新被复位
	const onRestore = () => {
		triggered.value = 'restore';
	}

	// 初始化数据
	const initData = async () => {
		console.log('discover组件初始化数据')
		
		// 检查登录状态
		if (!checkLoginStatus()) {
			return
		}
		
		_freshing.value = false;  
		pageParams.value.page = 1
		
		// 预加载背景图片
		console.log('onShow0')
		preloadImage()
		
		console.log('onShow1')
		// 获取用户定位
	    getUserLocation()
		console.log('onShow2')
		// 获取动态列表数据
		await getMomentsListData(1)
		
		console.log('discover组件显示，当前状态:', {
			isActive: isActive.value,
			listType: listType.value,
			listTypeDesc: listTypeDesc.value,
			userLocation: userLocation.value
		})
	}

	// 组件挂载时初始化数据
	onMounted(async() => {
		console.log('discover组件挂载完成')
		await initData()
	})

	// 监听组件是否可见，用于处理tab切换时的数据刷新
	const isVisible = ref(false)
	
	// 暴露方法供父组件调用
	const showComponent = async () => {
		console.log('discover组件被显示')
		isVisible.value = true
		// 每次显示时刷新数据，initData内部已包含登录检查
		await initData()
	}
	
	const hideComponent = () => {
		console.log('discover组件被隐藏')
		isVisible.value = false
	}
	
	// 暴露方法给父组件
	defineExpose({
		showComponent,
		hideComponent,
		initData
	})

	// u-tabs 切换事件处理
	const handleTabChange = (item) => {
		console.log('Tab切换:', item)
		
		// 检查登录状态
		if (!checkLoginStatus()) {
			return
		}
		
		currentTabIndex.value = item.index
		listType.value = item.value
		
		// 更新 isActive 状态 (保持兼容性)
		isActive.value = item.value === 1
		
		// 更新 listTypeDesc
		if (item.value === 1) {
			listTypeDesc.value = 1  // 1: 推荐列表（包含友伴师信息）
		} else if (item.value === 2) {
			listTypeDesc.value = 2  // 2: 喜欢列表（暂不包含友伴师信息）
		}
		
		// 切换tab时重新获取数据
		pageParams.value.page = 1
		getMomentsListData(1)
	}

	// 保持原有的 changeIsActive 函数以兼容其他可能的调用
	const changeIsActive = (index) => {
		// 找到对应的tab项
		const tabItem = tabsList.value.find(tab => tab.value === index)
		if (tabItem) {
			const tabIndex = tabsList.value.findIndex(tab => tab.value === index)
			handleTabChange({ index: tabIndex, value: index })
		}
	}
</script>

<style lang="scss">
	.square {
		width: 100%;
		height: 100vh;
		overflow: hidden;
		position: relative;
		box-sizing: border-box;
		background: url("https://sbx-server.oss-cn-shenzhen.aliyuncs.com/img/cum/squarebg.png") no-repeat center center;
		background-size: cover;
		
		.fallback-background {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			z-index: -1;
		}

		.square-recommend {
			margin: 32rpx 24rpx;
			width: 30%;
			// 移除 flex 布局，让 u-tabs 自己处理布局
		}




		.goTopBox {
			width: 100rpx;
			height: 100rpx;
			// background-image: linear-gradient(180deg, rgba(115, 99, 255, 1) 0%, rgba(255, 105, 222, 1) 100%);
			border-radius: 50%;
			display: flex;
			justify-content: center;
			align-items: center;
			position: fixed;
			right: 10rpx;
			bottom: 350rpx;
		}
	}

	.example {
		z-index: 99999;
		// width: 100rpx;
		// height: 100rpx;
		background: transparent;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed;
		right: 10rpx;
		bottom: 200rpx;
	}

	.transition-button {
		/* #ifndef APP-NVUE */
		width: 100%;
		/* #endif */
		flex: 1;
		margin-bottom: 10px;
	}

	/* #ifndef APP-NVUE */
	.example ::v-deep .transition {
		display: flex;
		justify-content: center;
		align-items: center;
		// width: 100rpx;
		// height: 100rpx;
		border-radius: 50%;
		text-align: center;
		// background-image: linear-gradient(180deg, rgba(115, 99, 255, 1) 0%, rgba(255, 105, 222, 1) 100%);
		// box-shadow: 0 0 5px 1px rgba(0, 0, 0, 0.2);
	}

	/* #endif */

	.go-top-icon {
		width: 100rpx;
		height: 100rpx;
	}
	
	.show-item {
		height: calc(100% - 120rpx);
		overflow: hidden;
	}

	.scroll-Y {
		height: 100%;
		overflow: hidden;
	}

	.scroll-Y-item {
		padding-bottom: 100rpx;
	}
</style>