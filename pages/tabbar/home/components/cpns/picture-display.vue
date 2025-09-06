<template>
	<view class="picture-display">
		<!-- 图片展示 -->
		<view v-if="imageList.length > 0" class="image-grid">
			<view 
				v-for="(item, index) in imageList" 
				:key="index"
				class="image-item"
				@click="previewImage(index)"
			>
				<image 
					:src="item.path" 
					mode="aspectFill"
					class="image"
				/>
			</view>
		</view>
		
		<!-- 视频展示 -->
		<view v-if="videoList.length > 0" class="video-grid">
			<view 
				v-for="(item, index) in videoList" 
				:key="index"
				class="video-item"
				@click="playVideo(item)"
			>
				<video
					:src="item.path"
					:poster="item.poster || item.cover"
					class="video"
					controls
					show-center-play-btn
					show-play-btn
					show-fullscreen-btn
					show-progress
					enable-progress-gesture
				></video>
			</view>
		</view>
		
		<!-- 话题标签 -->
		<view v-if="topicList && topicList.length > 0" class="topic-tags">
			<view 
				v-for="topic in topicList" 
				:key="topic.topic_id"
				class="topic-tag"
			>
				#{{ topic.topic_desc }}
			</view>
		</view>
	</view>
</template>

<script setup>
	import { computed } from 'vue'

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

	// 分离图片和视频
	const imageList = computed(() => {
		return props.list.filter(item => !item.is_video)
	})
	
	const videoList = computed(() => {
		return props.list.filter(item => item.is_video)
	})

	// 预览图片
	const previewImage = (index) => {
		const urls = imageList.value.map(item => item.path)
		uni.previewImage({
			urls: urls,
			current: index,
			indicator: 'number',
			loop: true
		})
	}

	// 播放视频
	const playVideo = (item) => {
		// 视频直接在当前页面播放，不需要跳转
		console.log('播放视频:', item.path)
	}
</script>

<style lang="scss" scoped>
	.picture-display {
		margin-top: 20rpx;
		
		.image-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 8rpx;
			margin-bottom: 16rpx;
			
			.image-item {
				aspect-ratio: 1;
				border-radius: 8rpx;
				overflow: hidden;
				
				.image {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}
			}
		}
		
		.video-grid {
			margin-bottom: 16rpx;
			
			.video-item {
				border-radius: 8rpx;
				overflow: hidden;
				
				.video {
					width: 100%;
					height: 400rpx;
					object-fit: cover;
				}
			}
		}
		
		.topic-tags {
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;
			
			.topic-tag {
				padding: 8rpx 16rpx;
				background: rgba(115, 99, 255, 0.1);
				color: #7363FF;
				border-radius: 20rpx;
				font-size: 20rpx;
			}
		}
	}
</style>
