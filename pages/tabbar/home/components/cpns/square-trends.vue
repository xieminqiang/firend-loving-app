<template>
	<scroll-view :scroll-top="scrollTop" scroll-y="true" class="scroll-Y" scroll-anchoring :lower-threshold="500"
		:refresher-triggered="triggered" :refresher-enabled="true" :scroll-with-animation="true" :show-scrollbar="true"
		refresher-background="#F7FDFF" :enable-back-to-top="true" @scroll="handleScroll" @scrolltolower="lower"
		@refresherpulling="onPulling" @refresherrefresh="onRefresh" @refresherrestore="onRestore"
		@refresherabort="onAbort">
		<view class="scroll-Y-item">
			<!-- <template v-for="item in squareRecommendData" :key="item">
					<square-show :item="item"></square-show>
				</template> -->
			<u-list height="100%">
				<u-list-item v-for="(item, index) in squareRecommendData" :key="index">
					<square-show :item="item" @changeShowVip="handleSayHello"></square-show>
				</u-list-item>
			</u-list>
		</view>
	</scroll-view>

	<!-- 回到顶部 -->
	<!-- <view class="example" v-show="oldScrollTop > 1000" @tap="goTop">
		<uni-transition ref="ani" custom-class="transition" mode-class="slide-right" class="goTopBox"
			:show="oldScrollTop > 1000">
			<image class="go-top-icon" src="@/static/square/go-top.png" mode=""></image>
		</uni-transition>
	</view> -->
</template>

<script setup>
	import {
		ref,
		nextTick,
		onMounted
	} from 'vue'
	import {
		onLoad,
	} from '@dcloudio/uni-app'
	import {
		storeToRefs
	} from 'pinia'
	import {
		useSquareStore
	} from '@/store/square.js'

	import squareShow from './square-show'

	const squareStore = useSquareStore()

	const {
		squareRecommendData
	} = storeToRefs(squareStore)

	const scrollTop = ref(0)

	const oldScrollTop = ref(0)

	const _freshing = ref(false)

	const triggered = ref(false)
	
	const emit = defineEmits(["changeSayHello"])

	onLoad(() => {
		_freshing.value = false;
		// 获取动态列表的数据
		squareStore.getMomentsListTrends(1)
	})

	const handleScroll = (e) => {
		oldScrollTop.value = e.detail.scrollTop
	}

	// 监听页面滚动到底部
	const lower = () => {
		squareStore.changePageTrends()
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
		await squareStore.getMomentsListTrends(1)
		_freshing.value = false;
		triggered.value = false;
	}

	// 自定义下拉刷新控件被下拉
	const onPulling = (e) => {
		// console.log("onpulling", e);
	}

	// 自定义下拉刷新被复位
	const onRestore = () => {
		triggered.value = 'restore';
		// console.log("onRestore");
	}

	// 自定义下拉刷新被中止
	const onAbort = () => {
		// console.log("onAbort");
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
</style>