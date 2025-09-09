<template>
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
						:listType="listType" 
						:userLocation="userLocation"
						:cityStore="cityStore"
						@changeShowVip="handleSayHello" 
						@playVideo="handlePlayVideo">
					</square-item>
				</u-list-item>  
				<view style="height: 250rpx;"></view>
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
</template>

<script setup>
	import {
		ref,
		nextTick,
		onMounted,
		watch
	} from 'vue'
	import {
		onLoad, 
		onShow
	} from '@dcloudio/uni-app'
	import { getMomentsList } from '@/api/discover.js'
	import squareItem from './square-item'

	// 定义 props
	const props = defineProps({
		listType: {
			type: Number,
			default: 1
		},
		userLocation: {
			type: Object,
			default: null
		},
		cityStore: {
			type: Object,
			default: null
		}
	})

	// 动态列表数据
	const momentsList = ref([])
	const loading = ref(false)
	const hasMore = ref(true)
	
	// 分页参数
	const pageParams = ref({
		page: 1,
		page_size: 20
	})

	const scrollTop = ref(0)
	const oldScrollTop = ref(0)
	const _freshing = ref(false)
	const triggered = ref(false)
	
	const emit = defineEmits(["changeSayHello", "playVideo"])

	onLoad(() => {
		console.log('获取数据888')
		_freshing.value = false;  
		pageParams.value.page = 1
		// 重新获取数据
	
	})

	onShow(() => {
		console.log('onShow')
		// 重新获取数据
		getMomentsListData(1)
	})

	// 处理视频播放
	const handlePlayVideo = (videoPath) => { 
		console.log('播放视频2:', videoPath)
		emit('playVideo', videoPath)
	}

	// 获取动态列表数据
	const getMomentsListData = async (page = 1) => {
		console.log('开始获取动态列表数据，参数:', {
			page,
			listType: props.listType,
			loading: loading.value
		})
		
		if (loading.value) return
		
		try {
			loading.value = true
			
			const params = {
				list_type: props.listType, // 1: 推荐列表 2: 喜欢列表 3: 个人动态
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

	//监听listType变化，重新获取数据
	// watch(() => props.listType, (newVal, oldVal) => {
	// 	console.log('listType变化:', oldVal, '->', newVal)
	// 	console.log('newVal获取数据获取数据获取数据', newVal)
	// 	if (newVal) {
	// 		// 重置分页参数
	// 		pageParams.value.page = 1
	// 		// 重新获取数据
	// 		getMomentsListData(1)
	// 	}
	// }, { immediate: true })

	const handleScroll = (e) => {
		oldScrollTop.value = e.detail.scrollTop
	}

	// 监听页面滚动到底部
	const lower = () => {
		if (hasMore.value && !loading.value) {
			getMomentsListData(pageParams.value.page)
		}
	}

	const goTop = (e) => {
		// 解决view层不同步的问题
		scrollTop.value = oldScrollTop.value
		nextTick(() => {
			scrollTop.value = 0
		})
	}

	const onRefresh = async () => {
		console.log('刷新中~');
		if (_freshing.value) return;
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
		// console.log("onRestore");
	}

	

	const handleSayHello = async (val) => {
		emit('changeSayHello', val)
	}
</script>

<style lang="scss" scoped>
	.scroll-Y {
		height: 100%;
		overflow: hidden;
	}

	.scroll-Y-item {
		// padding-bottom: 180rpx;
	}

	.example {
		z-index: 99999;
		background: transparent;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed;
		right: 10rpx;
		bottom: 200rpx;
	}

	.goTopBox {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		position: fixed;
		right: 10rpx;
		bottom: 350rpx;
	}

	.go-top-icon {
		width: 100rpx;
		height: 100rpx;
	}
</style>