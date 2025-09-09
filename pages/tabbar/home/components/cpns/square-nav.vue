<template>
	<view class="square-nav">
		<template >
			<text class="title">发现</text>
		</template>
		<!-- <template >
			<view class="release"  @click="toRelease">
				<view class=""><u-icon name="plus" color="#ffffff"></u-icon></view>
				<text class="release-title">发布</text>
			</view>
		</template> -->
	</view>
</template>

<script setup>
	// import {
	// 	useSquareStore
	// } from '@/store/square.js'
	// import {
	// 	getLatitude,
	// 	getLongitude
	// } from '@/utils/index.js';
	
	// const squareStore = useSquareStore()
	
	const toRelease = async () => {
		uni.navigateTo({
			url: '/subPackages/dt/index'
		})
	}
</script>

<style lang="scss">
	.square-nav {
		padding: 80rpx 24rpx 20rpx 24rpx;
		display: flex;
		justify-content: space-between;
        margin-right: 220rpx;

		// background-color: #ffffff;
		.title {
			font-size: 44rpx;
			font-weight: 1000;
		
			line-height: 48rpx;
			color: transparent;
			background-clip: text;
			background-image: linear-gradient(180deg, rgba(115, 99, 255, 1) 0%, rgba(255, 105, 222, 1) 100%);
		}

		.release {
			width: 148rpx;
			height: 60rpx;
			border-radius: 30rpx;
			background: linear-gradient(90deg, rgba(115, 99, 255, 1) 0%, rgba(255, 105, 222, 1) 100%);
			display: flex;
			justify-content: space-evenly;
			align-items: center;

			.release-title {
				font-size: 28rpx;
				font-weight: 500;
				color: rgba(255, 255, 255, 1);
			}
		}
	}
</style>