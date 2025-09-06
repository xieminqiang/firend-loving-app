<template>
	<view class="square-love">
		<view class="love-content">
			<text>喜欢的人功能开发中...</text>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'
</script>

<style lang="scss" scoped>
	.square-love {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		
		.love-content {
			color: #999;
			font-size: 28rpx;
		}
	}
</style>
