<template>
	<view class="my-trends-item">
		<view class="left">
			<view class="top-day">{{itemData.moments_info?.time_date}}</view>
			<view class="top-time">{{itemData.moments_info?.time_time}}</view>
		</view>
		<view class="right">
			<view class="right-title">{{itemData.moments_info?.content}}</view>

			<picture-display v-if="itemData.moments_info?.file_list" :list="itemData.moments_info?.file_list"
				:topicList="itemData.moments_info?.topic_list"></picture-display>

			<!-- 底部 -->
			<view class="foot">
				<view class="foot-set" @tap="setTrends(itemData)">
					<image src="@/static/my/more@3x.png" mode="widthFix" class="foot-image"></image>
					<view class="foot-status">{{itemData.moments_info.moments_status.title}}</view>
				</view>
				<view class="foot-right">
					<!-- 点赞 -->
					<view class="icon-item">
						<image v-if="!itemData.moments_info.is_praised" src="@/static/square/love.png" mode=""
							class="foot-image" @tap="handlePraise(itemData)">
						</image>
						<image v-if="itemData.moments_info.is_praised" src="@/static/square/active-love.png" mode=""
							class="foot-image" @tap="handlePraise(itemData)">
						</image>
						<view class="icon-title">{{ itemData.moments_info.praise_num }}</view>
					</view>
					<!-- 评论 -->
					<view class="icon-item icon-item-center" @tap="toRecord(itemData)">
					<!-- <view class="icon-item icon-item-center" @tap="editShow = true"> -->
						<image src="@/static/square/message.png" mode="" class="foot-image"></image>
						<view class="icon-title">{{itemData.moments_info?.comments_num}}</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	const props = defineProps({
		itemData: {
			type: Object,
			default: () => {}
		}
	})

	const emit = defineEmits(['changeTrends', 'changePraise'])

	// 点赞
	const handlePraise = async (val) => {
		emit('changePraise', val)
	}

	// 去详情
	const toRecord = (item) => {
		uni.navigateTo({
			url: '/pages/square/record/record',
			success(res) {
				// 通过eventChannel向被打开页面传送数据
				res.eventChannel.emit('getRecord', {
					data: item,
					isMy: true
				})
			}
		})
	}

	// 设置动态
	const setTrends = (item) => {
		emit('changeTrends', item)
	}
</script>

<style lang="scss" scoped>
	.my-trends-item {
		padding: 40rpx 24rpx 20rpx;
		background-color: #ffffff;
		display: flex;

		.left {
			display: flex;
			flex-direction: column;

			.top-day {
				font-size: 32rpx;
				font-weight: 400;
				color: #b3b3b3;
			}

			.top-time {
				font-size: 20rpx;
				font-weight: 300;
				color: #b3b3b3;
			}
		}

		.right {
			width: 100%;
			margin-left: 24rpx;

			.right-title {
				font-size: 24rpx;
				font-weight: 500;
				color: rgba(26, 26, 26, 1);
			}
		}
	}

	.foot {
		margin-top: 38rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.foot-image {
			width: 44rpx;
			height: 44rpx;
		}

		.foot-set {
			display: flex;
			align-items: center;

			.foot-status {
				margin-left: 14rpx;
				font-size: 20rpx;
				color: #ccc;
			}
		}

		.foot-right {
			display: flex;
		}

		.icon-item {
			margin-right: 20rpx;
			display: flex;
			align-items: center;
		}

		.icon-title {
			margin-left: 12rpx;
			font-size: 20rpx;
			font-weight: 500;
			color: rgba(153, 153, 153, 1);
		}

		.icon-item-center {
			margin-left: 50rpx;
			margin-right: 20rpx;
		}
	}
</style>