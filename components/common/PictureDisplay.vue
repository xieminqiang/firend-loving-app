<template>
	<view class="picture-display">
		<!-- 照片 -->
		<template v-if="props.list.length === 1">
			<view class="trends-one">
				<template v-if="list[0].is_video">
					<view class="video-container">
						<video class="trends-video-one" :src="proxy.$imgBaseUrl + list[0].path" 
							:controls="false" :show-center-play-btn="false"  :show-fullscreen-btn="false" :show-progress="false" :enable-progress-gesture="false"
							@tap="playVideoFullscreen(proxy.$imgBaseUrl + list[0].path)">
						</video>
						<view class="play-icon-overlay">
							<image src="/static/find/play.png" mode="widthFix" class="play-icon"></image>
						</view>
					</view>
				</template>

				<template v-if="!list[0].is_video">
					<image class="trends-image-one" :src="proxy.$imgBaseUrl + list[0].path" mode="aspectFill"
						@tap.stop="showImage(proxy.$imgBaseUrl + list[0].path, 0)"></image>
				</template>
			</view>
		</template>

		<template v-if="props.list.length === 2">
			<view class="trends-two">
				<template v-for="(item, index) in list" :key="index">
					<template v-if="item.is_video">
						<view class="video-container">
							<video class="trends-video-two" :src="proxy.$imgBaseUrl + item.path" 
								:controls="false" :show-center-play-btn="false" :show-fullscreen-btn="false" :show-progress="false" :enable-progress-gesture="false"
								@tap="playVideoFullscreen(proxy.$imgBaseUrl + item.path)">
							</video>
							<view class="play-icon-overlay">
								<image src="/static/find/play.png" mode="widthFix" class="play-icon"></image>
							</view>
						</view>
					</template>
					<template v-if="!item.is_video">
						<image class="trends-image-two" :src="proxy.$imgBaseUrl + item.path" mode="aspectFill"
							@tap.stop="showImage(proxy.$imgBaseUrl + item.path, index)">
						</image>
					</template>
				</template>
			</view>
		</template>

		<template v-if="props.list.length === 3">
			<view class="trends">
				<template v-for="(item, index) in list" :key="index">
					<template v-if="item.is_video">
						<view class="video-container">
							<video class="trends-video" :src="proxy.$imgBaseUrl + item.path" 
								:controls="false" :show-center-play-btn="false" :show-play-btn="false" :show-fullscreen-btn="false" :show-progress="false" :enable-progress-gesture="false"
								@tap="playVideoFullscreen(proxy.$imgBaseUrl + item.path)">
							</video>
							<view class="play-icon-overlay">
								<image src="/static/find/play.png" mode="widthFix" class="play-icon"></image>
							</view>
						</view>
					</template>
					<template v-if="!item.is_video">
						<image class="trends-image" :src="proxy.$imgBaseUrl + item.path" mode="aspectFill"
							@tap.stop="showImage(proxy.$imgBaseUrl + item.path, index)">
						</image>
					</template>
				</template>
			</view>
		</template>

		<template v-if="props.list.length === 4">
			<view class="trends-four">
				<template v-for="(item, index) in list" :key="index">
					<template v-if="item.is_video">
						<view class="video-container">
							<video class="trends-video-four" :src="proxy.$imgBaseUrl + item.path" 
								:controls="false" :show-center-play-btn="false" :show-play-btn="false" :show-fullscreen-btn="false" :show-progress="false" :enable-progress-gesture="false"
								@tap="playVideoFullscreen(proxy.$imgBaseUrl + item.path)">
							</video>
							<view class="play-icon-overlay">
								<image src="/static/find/play.png" mode="widthFix" class="play-icon"></image>
							</view>
						</view>
					</template>
					<template v-if="!item.is_video">
						<image class="trends-image-four" :src="proxy.$imgBaseUrl + item.path" mode="aspectFill"
							@tap.stop="showImage(proxy.$imgBaseUrl + item.path, index)">
						</image>
					</template>
				</template>
			</view>
		</template>

		<view class="hotspot">
			<template v-for="itemTopicList in topicList" :key="itemTopicList">
				<view class="hotspot-title">{{itemTopicList.topic_desc}}</view>
			</template>
		</view>



	</view>
</template>

<script setup>
	import {
		ref,
		nextTick,
		getCurrentInstance,
		watch,
		onMounted
	} from "vue";
	import {
		onLoad,
		onBackPress
	} from '@dcloudio/uni-app'
	
	// 获取当前实例以访问全局属性
	const { proxy } = getCurrentInstance()
	

	
	const props = defineProps({
		list: {
			type: Array,
			default: () => []
		},
		topicList: {
			type: Array,
			default: () => []
		}
	})

	// 定义emit事件
	const emit = defineEmits(['playVideo'])

	// 禁止返回
	// onBackPress((options) => {
	// 	if (options.from == 'backbutton') {
	// 		saveShow.value = false
	// 		previewImage.value.show = false
	// 		close()
	// 		return true;
	// 	} else if (options.from == 'navigateBack') {
	// 		return false;
	// 	}
	// })

	// 预览图片
	const showImage = (item, index) => {
		// 过滤出只有图片的文件，排除视频
		const imageList = props.list.filter(img => !img.is_video)
		
		// 如果没有图片，直接返回
		if (imageList.length === 0) {
			uni.showToast({
				title: '没有可预览的图片',
				icon: 'none',
				duration: 1000
			})
			return
		}
		
		// 构建完整的图片URL数组
		const urls = imageList.map(img => {
			// 如果img.path已经是完整路径，直接使用；否则拼接$imgBaseUrl
			if (img.path.startsWith('http')) {
				return img.path
			}
			return proxy.$imgBaseUrl + img.path
		})
		
		// 计算当前图片在过滤后列表中的索引
		let currentIndex = 0
		if (index !== undefined) {
			// 找到当前点击的图片在过滤后列表中的位置
			const currentItem = props.list[index]
			if (currentItem && !currentItem.is_video) {
				currentIndex = imageList.findIndex(img => img.path === currentItem.path)
			}
		}
		
		uni.previewImage({
			urls: urls,
			current: currentIndex,
			indicator: 'number',
			loop: true,
			show: true,
			success: function(res) {
				console.log('图片预览成功', res);
			},
			fail: function(err) {
				console.error('图片预览失败', err);
			}
		});
	}
	
	// 点击视频播放
	const playVideoFullscreen = (videoPath) => {
		uni.navigateTo({
			url: '/subPackages/dt/video-show',
			animationType: 'zoom-fade-out',
			animationDuration: 200,
			success(res) {
				res.eventChannel.emit('videoUrl', {
					data: videoPath
				})
			}
		})
		// try {
		// 	console.log('尝试播放视频:', videoPath)
		// 	// 触发事件，让父组件处理弹框
		// 	emit('playVideo', videoPath)
		// } catch (error) {
		// 	console.error('视频播放失败:', error)
		// 	uni.showToast({
		// 		title: '视频播放失败',
		// 		icon: 'none',
		// 		duration: 1000
		// 	})
		// }
	}
	



</script>

<style lang="scss">
	.trends-one {
		padding-top: 6rpx;
		display: flex;
		justify-content: flex-start;
		flex-wrap: wrap;

		.trends-image-one {
			width: 340rpx;
			height: 520rpx;
			border-radius: 10rpx;
			position: relative;
		}

		.trends-video-one {
			width: 340rpx;
			height: 520rpx;
			border-radius: 10rpx;
			object-fit: cover;
		}
	}

	.trends-two {
		display: flex;
		justify-content: flex-start;
		flex-wrap: wrap;

		.trends-image-two {
			margin-right: 6rpx;
			margin-top: 6rpx;
			width: 240rpx;
			height: 240rpx;
			border-radius: 10rpx;
		}

		.trends-video-two {
			margin-right: 6rpx;
			margin-top: 6rpx;
			width: 240rpx;
			height: 240rpx;
			border-radius: 10rpx;
			object-fit: cover;
		}
	}

	.trends {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;

		.trends-image {
			margin-top: 20rpx;
			width: 198rpx;
			height: 198rpx;
			border-radius: 10rpx;

			&:nth-child(2) {
				margin-left: 6rpx;
				margin-right: 6rpx;
			}
		}

		.trends-video {
			margin-top: 20rpx;
			width: 198rpx;
			height: 198rpx;
			border-radius: 10rpx;
			object-fit: cover;

			&:nth-child(2) {
				margin-left: 6rpx;
				margin-right: 6rpx;
			}
		}
	}

	.trends-four {
		display: flex;
		justify-content: flex-start;
		flex-wrap: wrap;

		.trends-image-four {
			margin-right: 6rpx;
			margin-top: 6rpx;
			width: 240rpx;
			height: 240rpx;
			border-radius: 10rpx;
		}

		.trends-video-four {
			margin-right: 6rpx;
			margin-top: 6rpx;
			width: 240rpx;
			height: 240rpx;
			border-radius: 10rpx;
			object-fit: cover;
		}
	}

	.hotspot {
		margin-top: 20rpx;
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		justify-content: flex-start;

		.hotspot-title {
			margin-right: 20rpx;
			margin-bottom: 20rpx;
			font-size: 24rpx;
			color: rgba(115, 99, 255, 1);
		}
	}

	// 视频容器和播放图标样式
	.video-container {
		position: relative;
		display: inline-block;

		.play-icon-overlay {
			position: absolute;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			z-index: 10;
			pointer-events: none; // 确保点击事件能穿透到视频元素

			.play-icon {
				width: 60rpx;
				height: 60rpx;
				opacity: 0.8;
			}
		}
	}
	
	.my-shwo-cal-box {
		z-index: 99999 !important;
	}

	.my-shwo-cal {
		margin: 0 24rpx 24rpx;
		height: 100rpx;
		line-height: 100rpx;
		font-size: 28rpx;
		font-weight: 500;
		// color: #7363FF;
		text-align: center;
		background-color: #ffffff;
		border-radius: 20rpx;

		&:active {
			color: #7363FF;
			background-color: #f2f2f2;
		}
	}

	:deep(.u-popup__content) {
		background-color: transparent;
	}


</style>