<template>
	<view class="video-show">
		<template v-if="videoUrl">
			<video class="video" id="myVideo" :src="videoUrl" autoplay :controls="true" 
					:show-center-play-btn="false"
					:show-fullscreen-btn="false"
					:show-progress="true"
					:enable-progress-gesture="true"
					:show-play-btn="false"
					:show-loading="true"
				@fullscreenchange="fullscreenchange"
				></video>
			
			<!-- 关闭按钮和提示文本容器 -->
			<view class="close-container" @click="closeVideo">
				<view class="close-btn" >
					<image src="/static/find/close2.png" mode="widthFix" class="close-icon"></image>
				</view>
				
				<!-- 左滑关闭提示文本 -->
				<view class="swipe-hint">
					<text class="swipe-text">左滑关闭</text>
				</view>
			</view>
		</template>
	</view>
</template>

<script setup>
	import {
		ref,
		getCurrentInstance
	} from 'vue'
	import {
		onLoad,
	} from '@dcloudio/uni-app'

	const videoUrl = ref('')

	// $instance => this
	const $instance = ref(getCurrentInstance().proxy)

	onLoad(() => {
		const eventChannel = $instance.value.getOpenerEventChannel();
		// 监听videoUrl事件，获取上一页面通过eventChannel传送到当前页面的数据
		eventChannel.on('videoUrl', function(data) {
			// console.log(data, 'videoUrl')
			videoUrl.value = data.data
		})
	})

	// 关闭视频
	const closeVideo = () => {
		videoUrl.value = ''
		uni.navigateBack({
			delta: 1
		})
	}

	// 处理视频点击事件
	const handleVideoTap = () => {
		// 可以在这里添加暂停/播放逻辑
		console.log('视频被点击')
	}

	// 关闭全屏
	// const fullscreenchange = (e) => {
	// 	videoUrl.value = ''
	// 	uni.navigateBack({
	// 		delta: 1
	// 	})
	// }
</script>

<style lang="scss">
	.video-show {
		width: 100%;
		height: 100vh;
		background-color: #1a1a1a;
		position: relative;

		.video {
			width: 100%;
			height: 100%;
		}

		.close-container {
			position: fixed;
			top: 40rpx;
			left: 0px;
		
			display: flex;
			align-items: center;
			
			z-index: 99999;
		}

		.close-btn {
			width: 80rpx;
			height: 100rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			background: rgba(0, 0, 0, 0.6);
			border-radius: 50%;
			pointer-events: auto;
			backdrop-filter: blur(10px);
			-webkit-backdrop-filter: blur(10px);

			.close-icon {
				width: 40rpx;
				height: 40rpx;
				filter: brightness(0) invert(1);
			}
		}

		.swipe-hint {
			pointer-events: none;

			.swipe-text {
				color: rgba(255, 255, 255, 0.8);
				font-size: 28rpx;
				background: rgba(0, 0, 0, 0.6);
			
				backdrop-filter: blur(10px);
				-webkit-backdrop-filter: blur(10px);
			}
		}
	}
</style>