<template>
	<view class="release" v-if="userStore.switch == 1">
		<view class="release-nav">
			<view @tap="toBack">
				<u-icon color="#000" size="24" name="close"></u-icon>
			</view>
			<view class="nav-title">发布</view>
			<view class="nav-placeholder"></view>
		</view>

		<view class="connect">
			<u--textarea v-model="textareaValue" class="textarea" placeholder="请输入内容" border="bottom"></u--textarea>

			<view class="topic">
				<template v-for="item in release.topics" :key="item.topic_id">
					<view class="topBtn" type="default">{{item.topic_desc}}</view>
				</template>
			</view>

			<!-- 图片/视频上传区域 -->
			<view class="upload-section">
				<view class="upload-title">添加图片/视频</view>
				<view class="upload-grid">
					<!-- 已上传的媒体文件 -->
				<view 
					v-for="(item, index) in mediaList" 
					:key="index"
					class="media-item"
					:class="{ 
						'video-item': item.type === 'video'
					}"
				>
						<!-- 视频使用video控件 -->
						<video
							v-if="item.type === 'video'"
							:src="proxy.$imgBaseUrl + item.url"
							class="media-video"
							controls
							show-center-play-btn
							show-play-btn
							show-fullscreen-btn
							show-progress
							enable-progress-gesture
							@click="previewMedia(index)"
						></video>
						<!-- 图片使用image控件 -->
						<image
							v-else
							:src="proxy.$imgBaseUrl + item.url" 
							class="media-image" 
							mode="aspectFill"
							@click="previewMedia(index)"
						/>
						
	
						
						<!-- 删除按钮 -->
						<view class="delete-btn" @click="deleteMedia(index)">
							<u-icon name="close" color="#fff" size="16"></u-icon>
						</view>
					</view>
					
					<!-- 添加按钮 -->
					<view 
						v-if="mediaList.length < maxMediaCount" 
						class="add-media-btn"
						@click="showMediaPicker"
					>
						<u-icon name="plus" color="#999" size="32"></u-icon>
						<text class="add-text">添加</text>
					</view>
				</view>
			</view>

			<view class="connect-topic">
				<view class="add-topic"># 加话题</view>
				<scroll-view class="topic-list" scroll-x="true">
					<view 
						class="topic-item" 
						:class="{
							active: existTopicId.indexOf(item.topic_id) > -1
						}" 
						v-for="item in topicList" 
						:key="item.topic_id"
						@tap="avtiveTopic(item)"
					> 
						{{item.topic_desc}}
					</view>
				</scroll-view>
			</view>
		</view>

		<!-- 定位 -->
		<view class="address-now" @tap="changeAddress">
			<image class="address-image" src="~@/static/icons/friend/address_re.png" mode=""></image>
			<view class="address-now-desc">{{hasLocationDesc === '' ? '不显示位置': hasLocationDesc}}</view>
		</view>





		<!-- 媒体选择器 -->
		<u-action-sheet 
			:show="showMediaActionSheet" 
			:actions="mediaActions" 
			@close="showMediaActionSheet = false"
			@select="onMediaActionSelect"
		></u-action-sheet>

		<!-- 底部固定发布按钮 -->
		<view class="bottom-submit-section">
			<view class="submit-button-container">
				<view 
					class="bottom-submit-btn" 
					:class="{ disabled: isSubmitting || !canSubmit }"
					@click="onSubmit"
				>
					<view class="submit-btn-content">
						<view v-if="isSubmitting" class="submit-loading">
							<view class="loading-dots">
								<view class="dot"></view>
								<view class="dot"></view>
								<view class="dot"></view>
							</view>
						</view>
						<text class="submit-btn-text" v-if="!isSubmitting">发布</text>
						<text class="submit-btn-text" v-else>发布中...</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		onLoad
	} from '@dcloudio/uni-app'
	import {
		ref,
		reactive,
		computed,
		nextTick,
		getCurrentInstance
	} from 'vue'
	import {
	getMomentsRequest,
	pushMoments
} from '@/api/discover.js'
	import {
		uploadFile,
		getUploadResult
	} from '@/api/file.js'
	import { useUserStore } from '@/stores/user.js'
	// 用户状态管理
	const userStore = useUserStore()
	// 获取当前实例以访问全局属性
	const { proxy } = getCurrentInstance()
	
	// 模拟数据，仅用于页面展示

	const topicList = ref([])

	// 模拟位置数据
	const hasLongitude = ref(116.397128)
	const hasLatitude = ref(39.916527)
	const hasLocationDesc = ref('')

	

	onLoad(() => {
		// 页面加载完成，调用接口获取数据
		console.log('发布页面加载完成')
		loadMomentsRequest()
	})
	

	// 加载动态请求数据
	const loadMomentsRequest = async () => {
		try {
		
			
			const response = await getMomentsRequest()
			
			if (response.data.code === 0) {
				topicList.value = response.data.data.topic_list || []
			
			} else {
				console.warn('获取动态请求数据失败:', response.data.msg)
			}
		} catch (error) {
		
		} finally {
			uni.hideLoading()
		}
	}

	const popupShow = ref(false)
	const release = reactive({
		imgList: [],
		content: '',
		status: 1,
		location: "",
		location_desc: "",
		topics: [],
		object_keys: []
	})

	// 媒体文件相关
	const mediaList = ref([])
	const maxMediaCount = 9
	const showMediaActionSheet = ref(false)
	const mediaActions = [
		{ name: '拍照', value: 'camera' },
		{ name: '从相册选择', value: 'album' },
		{ name: '拍摄视频', value: 'video' }
	]

	// 显示媒体选择器
	const showMediaPicker = () => {
		showMediaActionSheet.value = true
	}

	// 处理媒体选择
	const onMediaActionSelect = (action) => {
		showMediaActionSheet.value = false
		
		switch (action.value) {
			case 'camera':
				chooseImage('camera')
				break
			case 'album':
				chooseImage('album')
				break
			case 'video':
				chooseVideo()
				break
		}
	}

	// 选择图片
	const chooseImage = (sourceType) => {
		uni.chooseImage({
			count: maxMediaCount - mediaList.value.length,
			sourceType: [sourceType],
			sizeType: ['compressed'],
			success: (res) => {
				handleImageSuccess(res.tempFilePaths)
			},
			fail: (err) => {
				console.error('选择图片失败:', err)
				uni.showToast({
					title: '选择图片失败',
					icon: 'none'
				})
			}
		})
	}

	// 选择视频
	const chooseVideo = () => {
		uni.chooseVideo({
			sourceType: ['album', 'camera'],
			maxDuration: 60,
			camera: 'back',
			success: (res) => {
				handleVideoSuccess(res)
			},
			fail: (err) => {
				console.error('选择视频失败:', err)
				uni.showToast({
					title: '选择视频失败',
					icon: 'none'
				})
			}
		})
	}

	// 处理图片选择成功
	const handleImageSuccess = async (tempFilePaths) => {
		for (const path of tempFilePaths) {
			// 添加到媒体列表，状态为上传中
			const mediaItem = {
				type: 'image',
				url: path,
				status: 'uploading',
				filePath: path,
				fileName: path.split('/').pop() || 'image.jpg'
			}
		
			   uni.showLoading({ title: '上传中...' })
			// 开始上传文件
			try {
				const uploadResult = await uploadFile({
					filePath: path,
					name: mediaItem.fileName
				})
				
				// 获取上传结果
				const fileInfo = getUploadResult(uploadResult) 
				uni.hideLoading()
				if (fileInfo) {
					// 更新媒体项信息
					mediaItem.status = 'success'
					mediaItem.objectKey = fileInfo.objectKey
					mediaItem.url = fileInfo.url
					mediaItem.uploadedUrl = fileInfo.url
						mediaList.value.push(mediaItem)
					console.log('图片上传成功:', fileInfo)
				} else {
					throw new Error('上传结果解析失败')
				}
			} catch (error) {
				console.error('图片上传失败:', error)
				mediaItem.status = 'failed'
				mediaItem.errorMsg = error.message
				
				uni.showToast({
					title: '图片上传失败',
					icon: 'none'
				})
			}
		}
	}

	// 处理视频选择成功
	const handleVideoSuccess = async (videoRes) => {
		// 添加到媒体列表，状态为上传中
		const mediaItem = {
			type: 'video',
			url: videoRes.tempFilePath,
			cover: videoRes.thumbTempFilePath,
			duration: videoRes.duration,
			size: videoRes.size,
			status: 'uploading',
			filePath: videoRes.tempFilePath,
			fileName: videoRes.tempFilePath.split('/').pop() || 'video.mp4'
		}
	      uni.showLoading({ title: '上传中...' })
		
		// 开始上传视频文件
		try {
			const uploadResult = await uploadFile({
				filePath: videoRes.tempFilePath,
				name: mediaItem.fileName
			})
			
			// 获取上传结果
			const fileInfo = getUploadResult(uploadResult) 
			 uni.hideLoading()
			if (fileInfo) {
				// 更新媒体项信息
				mediaItem.status = 'success'
				mediaItem.objectKey = fileInfo.objectKey
				mediaItem.url = fileInfo.url
				mediaItem.uploadedUrl = fileInfo.url
				mediaItem.cover = fileInfo.cover || videoRes.thumbTempFilePath
				mediaList.value.push(mediaItem)
				console.log('视频上传成功:', fileInfo)
			} else {
				throw new Error('上传结果解析失败')
			}
		} catch (error) {
			console.error('视频上传失败:', error)
			mediaItem.status = 'failed'
			mediaItem.errorMsg = error.message
			
			uni.showToast({
				title: '视频上传失败',
				icon: 'none'
			})
		}
	}

	// 预览媒体
	const previewMedia = (index) => {
		const item = mediaList.value[index]
		if (item.type === 'image') {
			// 获取所有图片的URL，用于预览
			const imageItems = mediaList.value.filter(m => m.type === 'image')
			const urls = imageItems.map(m => proxy.$imgBaseUrl + m.url)
			const currentIndex = imageItems.findIndex(m => m === item)
			
			uni.previewImage({
				urls: urls,
				current: currentIndex >= 0 ? currentIndex : 0,
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
		} else if (item.type === 'video') {
			// 视频直接在当前页面播放，不需要跳转
			console.log('视频播放:', item.url)
		}
	}

	// 删除媒体
	const deleteMedia = (index) => {
		uni.showModal({
			title: '提示',
			content: '确定要删除这个文件吗？',
			success: (res) => {
				if (res.confirm) {
					mediaList.value.splice(index, 1)
				}
			}
		})
	}
	
	// 重新上传失败的媒体文件
	const retryUpload = async (index) => {
		const item = mediaList.value[index]
		if (item.status !== 'failed') return
		
		// 重置状态为上传中
		item.status = 'uploading'
		
		try {
			const uploadResult = await uploadFile({
				filePath: item.filePath,
				name: item.fileName
			})
			
			// 获取上传结果
			const fileInfo = getUploadResult(uploadResult)
			if (fileInfo) {
				// 更新媒体项信息
				item.status = 'success'
				item.objectKey = fileInfo.objectKey
				item.url = fileInfo.url
				item.uploadedUrl = fileInfo.url
				if (item.type === 'video') {
					item.cover = fileInfo.cover || item.cover
				}
				console.log('重新上传成功:', fileInfo)
				
				uni.showToast({
					title: '重新上传成功',
					icon: 'success'
				})
			} else {
				throw new Error('上传结果解析失败')
			}
		} catch (error) {
			console.error('重新上传失败:', error)
			item.status = 'failed'
			item.errorMsg = error.message
			
			uni.showToast({
				title: '重新上传失败',
				icon: 'none'
			})
		}
	}

	const textareaValue = ref("")
	const isSubmitting = ref(false)
	
	// 计算属性：是否可以提交
	const canSubmit = computed(() => {
		return textareaValue.value.trim().length > 0
	})

	// 获取话题
	const existTopicId = computed(() => release.topics.map(item => item.topic_id))

	//添加话题 
	const avtiveTopic = (item) => {
		let itemIndex = release.topics.indexOf(item)
		if (itemIndex === -1) {
			release.topics.push(item)
		}
		if (itemIndex !== -1) {
			release.topics.splice(itemIndex, 1);
		}
	}

	// 选择地址
	const changeAddress = () => {
		// #ifdef MP-WEIXIN
		uni.chooseLocation({
			success: (res) => {
				const address = res.address || res.name || '已选择位置'
				console.log('手动选择位置', res)
				
				// 更新显示
				hasLocationDesc.value = address
				hasLongitude.value = res.longitude
				hasLatitude.value = res.latitude
				
				// uni.showToast({
				// 	title: '位置选择成功',
				// 	icon: 'success',
				// 	duration: 1500
				// })
			},
			fail: (err) => {
				if (err.errMsg && err.errMsg.indexOf('cancel') === -1) {
					uni.showToast({
						title: '获取位置失败',
						icon: 'none'
					})
					console.error('获取位置失败:', err.errMsg)
				}
			}
		})
		// #endif
		// #ifndef MP-WEIXIN
		uni.showToast({
			title: '请在微信小程序中使用地图选点',
			icon: 'none'
		})
		// #endif
	}

	// 提交
	const onSubmit = async () => {
		if (!canSubmit.value || isSubmitting.value) {
			return
		}

		isSubmitting.value = true

		// 处理媒体文件，区分图片和视频
		const processedMediaList = mediaList.value
			.filter(item => item.status === 'success') // 只包含上传成功的文件
			.map(item => {
				if (item.type === 'image') {
					return {
						media_type: 1, // 1: 图片
						object_key: item.objectKey,
						url: item.uploadedUrl,
						file_name: item.fileName
					}
				} else if (item.type === 'video') {
					return {
						media_type: 2, // 2: 视频
						object_key: item.objectKey,
						url: item.uploadedUrl,
						file_name: item.fileName,
						cover: item.cover,
						duration: item.duration,
						size: item.size
					}
				}
			})
			.filter(Boolean) // 过滤掉undefined项

		// 提取object_keys
		const objectKeys = processedMediaList.map(item => item.object_key).filter(Boolean)

		// 处理topics，只保留需要的字段
		const processedTopics = release.topics.map(topic => ({
			topic_id: topic.topic_id,
			topic_desc: topic.topic_desc,
			topic_icon: topic.topic_icon
		}))

		let data = {
			content: textareaValue.value, //内容
			status: 1, // 写死为1：广场可见
			location: `${hasLongitude.value},${hasLatitude.value}`, //定位
			location_desc: hasLocationDesc.value, //定位描述
			topics: processedTopics,
			object_keys: objectKeys,
			media_list: processedMediaList, // 处理后的媒体列表，区分图片和视频
			// 分别统计图片和视频数量
			image_count: processedMediaList.filter(item => item.media_type === 1).length,
			video_count: processedMediaList.filter(item => item.media_type === 2).length
		}

		console.log('发布参数:', data);

		try {
			uni.showLoading({ title: '发布中...' })
			
			const response = await pushMoments(data)
			
			if (response.data.code === 0) {
				uni.showToast({
					title: '发布成功',
					icon: 'success',
					duration: 2000
				})
				
				// 发布成功后返回上一页
				setTimeout(() => {
					uni.navigateBack({
						delta: 1
					})
				}, 2000)
			} else {
				uni.showToast({
					title: response.data.msg || '发布失败',
					icon: 'none',
					duration: 2000
				})
			}
		} catch (error) {
			console.error('发布失败:', error)
			uni.showToast({
				title: '发布失败，请重试',
				icon: 'none',
				duration: 2000
			})
		} finally {
			uni.hideLoading()
			isSubmitting.value = false
		}
	}

	const toBack = () => {
		uni.navigateBack({
			delta: 1
		})
	}
</script>

<style lang="scss" scoped>
	.release {
		padding-top: 96rpx;
		padding-bottom: 120rpx; /* 为底部按钮留出空间 */

		.release-nav { 
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin: 0 24rpx;
			position: relative;
			height: 88rpx;
			
			.nav-title {
				font-size: 32rpx;
				font-weight: 600;
				color: #1A1A1A;
				letter-spacing: 0.5rpx;
			}
			
			.nav-placeholder {
				width: 24rpx; /* 与关闭按钮宽度一致，保持居中 */
			}
		}

		.connect {
			margin-top: 52rpx;
			padding: 0 24rpx;
			
			/* 全局textarea背景透明 */
			:deep(textarea) {
				background: transparent !important;
				background-color: transparent !important;
				background-image: none !important;
			}
			
			/* 小程序特定样式 */
			:deep(.u-textarea) {
				background: transparent !important;
			}
			
			:deep(.u-textarea__field) {
				background: transparent !important;
				background-color: transparent !important;
			}

						:deep(.textarea) {
				background: transparent !important;
				
				/* 小程序textarea背景透明 - 覆盖所有可能的背景 */
				:deep(.u-textarea__field) {
					background: transparent !important;
					background-color: transparent !important;
					background-image: none !important;
				}
				
				:deep(.u-textarea__field__textarea) {
					background: transparent !important;
					background-color: transparent !important;
					background-image: none !important;
				}
				
				/* 直接设置textarea元素 */
				:deep(textarea) {
					background: transparent !important;
					background-color: transparent !important;
					background-image: none !important;
				}
				
				/* 覆盖可能的边框和阴影 */
				:deep(.u-textarea__field) {
					border: none !important;
					box-shadow: none !important;
				}
				
				/* 强制覆盖内联样式 */
				:deep(.u-textarea__field) {
					background: transparent !important;
					background-color: transparent !important;
					background-image: none !important;
				}
				
				.ql-editor::before {
					font-size: 24rpx;
					font-weight: 500;
					color: #999;
					font-style: normal;
				}

				.ql-editor {
					font-size: 24rpx;
					font-weight: 500;
					color: #1a1a1a;
				}
			}

			// 上传区域样式
			.upload-section {
				margin: 20rpx 0;

				.upload-title {
					font-size: 24rpx;
					color: #666;
					margin-bottom: 16rpx;
					font-weight: 500;
				}

				.upload-grid {
					display: grid;
					grid-template-columns: repeat(3, 1fr);
					gap: 12rpx;
				}

				.media-item {
					position: relative;
					aspect-ratio: 1;
					border-radius: 12rpx;
					overflow: hidden;
					box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);

					&.video-item {
						.media-image {
							width: 100%;
							height: 100%;
						}
					}
				}

				.media-image {
					width: 100%;
					height: 100%;
					object-fit: cover;
				}

				.media-video {
					width: 100%;
					height: 100%;
					border-radius: 12rpx;
					object-fit: cover;
					/* 视频控件样式优化 */
					background: #000;
				}
				
				/* 视频控件在小尺寸下的优化 */
				.media-video::-webkit-media-controls {
					opacity: 0;
					transition: opacity 0.3s;
				}
				
				.media-video:hover::-webkit-media-controls {
					opacity: 1;
				}

				.delete-btn {
					position: absolute;
					top: 8rpx;
					right: 8rpx;
					background: rgba(0, 0, 0, 0.6);
					border-radius: 50%;
					width: 40rpx;
					height: 40rpx;
					display: flex;
					align-items: center;
					justify-content: center;
				}
				
				/* 上传状态样式 */
				.upload-status {
					position: absolute;
					top: 50%;
					left: 50%;
					transform: translate(-50%, -50%);
					width: 60rpx;
					height: 60rpx;
					border-radius: 50%;
					display: flex;
					align-items: center;
					justify-content: center;
					z-index: 10;
				}
				
				.upload-status.uploading {
					background: rgba(115, 99, 255, 0.8);
					animation: rotate 1s linear infinite;
				}
				
				.upload-status.failed {
					background: rgba(255, 71, 87, 0.8);
				}
				
				@keyframes rotate {
					from { transform: translate(-50%, -50%) rotate(0deg); }
					to { transform: translate(-50%, -50%) rotate(360deg); }
				}

				.add-media-btn {
					aspect-ratio: 1;
					border: 2rpx dashed #ddd;
					border-radius: 12rpx;
					display: flex;
					flex-direction: column;
					align-items: center;
					justify-content: center;
					background: #f8f9fe;
					color: #999;

					.add-text {
						font-size: 22rpx;
						margin-top: 8rpx;
					}
				}
			}

			.connect-topic {
				display: flex;
				align-items: center;
				margin-top: 20rpx;

				.add-topic {
					flex-shrink: 0;
					width: 130rpx;
					height: 40rpx;
					margin-right: 12rpx;
					line-height: 40rpx;
					text-align: center;
					border-radius: 24rpx;
					background: rgba(234, 233, 247, 1);
					font-size: 20rpx;
					font-weight: 600;
					color: rgba(115, 99, 255, 1);
				}

				.topic-list {
					width: 100%;
					white-space: nowrap;

					.topic-item {
						padding: 9rpx 20rpx;
						display: inline-block;
						text-align: center;
						font-size: 20rpx;
						margin-right: 12rpx;
						border-radius: 24rpx;
						background: rgba(242, 242, 242, 1);

						&.active {
							color: #7363FF;
							background: #EAE9F7;
						}

						&:last-child {
							margin-right: 180rpx;
						}
					}
				}
			}
		}

		.topic {
			margin-bottom: 8rpx;
			display: flex;
			flex-wrap: wrap;
			justify-content: flex-start;
		
			.topBtn {
				margin-right: 10rpx;
				padding: 10rpx;
				color: rgb(115, 99, 255);
				border: 1rpx solid #999;
				font-size: 20rpx;
				border-radius: 10rpx;
			}
		}

		// 定位
		.address-now {
			margin: 20rpx 24rpx;
			padding: 12rpx 24rpx;
		
			border-radius:6rpx;
			background: rgba(242, 242, 242, 1);
			display: flex;
			align-items: center;
			justify-content: center;
            box-sizing: border-box;
			.address-image {
				width: 28rpx;
				height: 28rpx;
			}

			.address-now-desc {
				margin-left: 10rpx;
				font-size: 24rpx;
				font-weight: 500;
				color: rgba(26, 26, 26, 1);
			}
		}



		// 发布设置
		.publish-setting {
			padding-top: 32rpx;

			.title {
				font-size: 28rpx;
				font-weight: 500;
				text-align: center;
			}

			.status-list {
				display: flex;
				flex-direction: column;
				margin-top: 46rpx;
				padding: 0 16rpx;

				.status-item {
					margin-top: 40rpx;
					padding-left: 12rpx;
					display: flex;
					justify-content: space-between;
					align-items: center;
					height: 70rpx;

					.left {
						display: flex;
						flex-direction: column;
						justify-content: space-between;
						height: 100%;

						.name {
							font-size: 24rpx;
							font-weight: 500;
							color: #1a1a1a;
						}

						.desc {
							font-size: 20rpx;
							color: #999;
						}
					}
				}
			}
		}
	}

	/* 底部提交按钮样式 */
	.bottom-submit-section {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 248, 250, 0.95) 100%);
	
		padding: 20rpx 20rpx calc(20rpx + env(safe-area-inset-bottom));
		border-top: 1rpx solid rgba(115, 99, 255, 0.1);
	
		z-index: 100;
	}

	.submit-button-container {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.bottom-submit-btn {
		width: 100%;
		max-width: 660rpx;
		background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
		border-radius: 24rpx;
		padding: 20rpx 32rpx;
		transition: all 0.3s ease;
		
		
		&:active:not(.disabled) {
			transform: scale(0.95);
		
		}
		
		&.disabled {
			opacity: 0.6;
			transform: none !important;
		
		}
	}

	.submit-btn-content {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.submit-loading {
		width: 40rpx;
		height: 40rpx;
		margin-right: 12rpx;
		border: 4rpx solid rgba(255, 255, 255, 0.3);
		border-top: 4rpx solid rgba(255, 255, 255, 0.6);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.submit-btn-text {
		font-size: 28rpx;
		color: #FFFFFF;
		font-weight: 600;
		letter-spacing: 0.5rpx;
	}

	.loading-dots {
		display: flex;
		justify-content: space-between;
		width: 40rpx;
		height: 12rpx;
	}

	.dot {
		width: 8rpx;
		height: 8rpx;
		background: white;
		border-radius: 50%;
		animation: blink 1s linear infinite;
	}

	@keyframes blink {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
</style>