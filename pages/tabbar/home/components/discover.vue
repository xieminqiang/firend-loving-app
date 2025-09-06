<template>
	<view class="square" >


		<square-nav></square-nav>

	<!-- 	<view class="square-recommend">
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
					fontSize: '24rpx'
				}"
				:inactiveStyle="{
					color: '#1A1A1A',
					fontWeight: '400',
					fontSize: '24rpx'
				}"
				itemStyle="padding: 12rpx 22rpx; height: auto; border-radius: 30rpx;"
			></u-tabs>
		</view> -->

		<!-- 根据isActive状态显示不同组件 -->
	<!-- 	<view v-show="isActive" class="show-item">
			<square-trends-item :listType="listTypeDesc" @playVideo="handlePlayVideo"></square-trends-item>
		</view>		 -->
			<square-trends-item 
				:listType="listTypeDesc" 
				:userLocation="userLocation"
				:cityStore="cityStore"
				@playVideo="handlePlayVideo">
			</square-trends-item>
		<!-- <view v-show="!isActive" class="show-item">
			<square-love></square-love>
		</view>		
		 -->
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted
	} from 'vue'
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app'
	import { useCityStore } from '@/stores/city.js'
	

	import squareNav from './cpns/square-nav'
	import squareTrendsItem from './cpns/square-trends-item'
	import squareLove from './cpns/square-love'

	// 修复：直接定义图片URL字符串，而不是使用import
	const imageSrc = "https://sbx-server.oss-cn-shenzhen.aliyuncs.com/img/cum/squarebg.png"

	// 定义emit事件
	const emit = defineEmits(['playVideo'])

	// 图片加载状态管理
	const imageLoaded = ref(false)

	// 城市存储
	const cityStore = useCityStore()
	
	// 定位相关状态
	const userLocation = ref(null)
	const locationLoading = ref(false)

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
				type: 'gcj02',
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

	onShow(async () => {
		// 预加载背景图片
		preloadImage()
		
		// 获取用户定位
		await getUserLocation()
		
		console.log('discover组件显示，当前状态:', {
			isActive: isActive.value,
			listType: listType.value,
			listTypeDesc: listTypeDesc.value,
			userLocation: userLocation.value
		})
	})

	// 组件挂载时也预加载图片
	onMounted(() => {
		console.log('discover组件挂载完成')
		// 确保组件挂载时也预加载图片
		preloadImage()
	})

	// u-tabs 切换事件处理
	const handleTabChange = (item) => {
		console.log('Tab切换:', item)
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

	// 处理视频播放
	const handlePlayVideo = (videoPath) => {
		console.log('播放视频3:', videoPath)
		// 直接触发事件，让父组件监听
		emit('playVideo', videoPath)
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
</style>