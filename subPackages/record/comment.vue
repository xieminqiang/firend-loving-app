<template>
	<view class="comment">
		<view class="comment_top">
			<!-- 头部信息 -->
			<view class="top">
				<view class="top-left">
					<!-- 头像 -->
					<view class="avatar" @click="toDetail()">
						<u-avatar :src="$imgBaseUrl + userInfoComment.head_img" size="38" shape="circle" mode="aspectFill"></u-avatar>
					</view>
					<!-- 介绍 -->
					<view class="info">
						<view class="info-one">
							<view class="name">{{ userInfoComment.nick_name }}</view>
							<template v-if="userInfoComment.icon_list">
								<view class="flex">
									<block v-for="item in userInfoComment.icon_list" :key="item">
										<view class="introduce" :style="{background:`${item.icon?.color}`}">
											<image v-if="item.icon.icon" class="image" :src="item.icon?.icon"
												mode="widthFix">
											</image>
											<text class="introduce-title">{{ item.data }}</text>
										</view>
									</block>
								</view>
							</template>
						</view>
					</view>
				</view>
				
				<!-- 立即邀约按钮 -->
				<!-- <view class="invite-btn" @tap="handleInvite()">
					立即邀约
				</view> -->
			</view>
		</view>

		<view class="flex-box">
			<scroll-view :scroll-top="scrollTop" scroll-y="true" class="scroll-Y" scroll-anchoring
				:lower-threshold="300" :scroll-with-animation="true" :show-scrollbar="true" :enable-back-to-top="true"
				@scroll="handleScroll" @scrolltolower="lowerComment">
				<!-- 动态内容 -->
				<view class="moment-content">
					<view class="moment-text">{{ momentsInfoComment.content }}</view>
					
					<!-- 图片/视频展示 -->
					<view v-if="momentsInfoComment.file_list && momentsInfoComment.file_list.length > 0" class="moment-media">
						<PictureDisplay :list="momentsInfoComment.file_list" :topicList="momentsInfoComment.topic_list"></PictureDisplay>
					</view>
					
				
					
					<view class="moment-actions">
						<view class="action-item" @tap="handlePraise({target_id: momentsInfoComment.moments_id})">
							<image v-if="!momentsInfoComment.is_praised" src="@/static/square/love.png" class="action-icon"></image>
							<image v-if="momentsInfoComment.is_praised" src="@/static/square/active-love.png" class="action-icon"></image>
							<text class="action-text">{{ momentsInfoComment.praise_num || 0 }}</text>
						</view>
					<!-- 	<view class="action-item" @tap="handleSayHello(userInfoComment.user_id)">
							<image src="@/static/square/em@3x.png" class="action-icon"></image>
							<text class="action-text">打招呼</text>
						</view> -->
					</view>
				</view>
				<!-- 评论区 -->
				<view v-if="commentDataLoaded" class="comment-section">
					<view class="title">
						<text>全部评论({{ totalComment }}条)</text>
					</view>
					<view v-if="totalComment == 0" class="no-record">
						<image class="no-record-image" src="~@/static/square/no-record.png" mode=""></image>
						<view class="no-record-title">还没有评论丫，抢先发表一下吧！</view>
					</view>

					<view v-else class="comment-list">
						<view class="comment-item" v-for="item in commentListData" :key="item.comments_id">
							<!-- 一级评论 -->
							<view class="main" @tap="reply(item)">
								<view class="left" @tap.stop="toDetailItem(item)">
									<u-avatar :src="$imgBaseUrl + (momentsInfoComment.user_id === item.user_id ? userInfoComment.head_img : item.head_img)" size="32" shape="circle" mode="aspectFill"></u-avatar>
								</view>
								<view class="right">
									<view class="username">
										<text>{{momentsInfoComment.user_id === item.user_id ? userInfoComment.nick_name : item.nick_name}}</text>
									</view>
									<view class="comment-content">
										<text>{{item.content}}</text>
									</view>
									<view class="option">
										<view class="left">
											<text class="time">{{item.content_time}}</text>
											<text class="reply-btn" @tap="reply(item)">回复</text>
										</view>
									</view>
								</view>
							</view>

							<!-- 二级评论 -->
							<view class="reply-list" v-for="it in item.comments_list" :key="it.comments_id">
								<view class="reply-item" @tap="reply(it)">
									<view class="left" @tap.stop="toDetailItem(it)">
										<u-avatar :src="$imgBaseUrl + (momentsInfoComment.user_id === it.user_id ? userInfoComment.head_img : it.head_img)" size="22" shape="circle"></u-avatar>
									</view>
									<view class="right">
										<view class="username">
											<text class="reply-username">{{momentsInfoComment.user_id === it.user_id ? userInfoComment.nick_name : it.nick_name}}</text>
											<image src="@/static/square/reply@3x.png" mode="aspectFill"></image>
											<text class="main-username">{{momentsInfoComment.user_id === it.reply_user_id ? userInfoComment.nick_name : it.reply_nick_name}}</text>
										</view>
										<view class="comment-content">
											<text>{{it.content}}</text>
										</view>
										<view class="option">
											<view class="left">
												<text class="time">{{it.content_time}}</text>
												<text class="reply-btn" @tap="reply(it)">回复</text>
											</view>
										</view>
									</view>
								</view>
							</view>

							<view v-if="item.has_more" class="expand" @tap="handleHasMore(item)">
								<view class="line"></view>
								<text>展开更多回复</text>
								<u-icon name="arrow-down" color="#7363FF" size="14"></u-icon>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
			<view @touchmove.prevent class="chatting" @tap="handleShowOneReply">
				<u-input :placeholder="replyCommentsName" border="surround" :value="rplContent" @focus="handleFocus"
					@blur="handleBlur" fontSize='24rpx' color='#1a1a1a' shape='circle' :adjustPosition="true" disabled
					:customStyle="{
							paddingLeft:'24rpx',
							background:'#F2F2F2'
						}">
				</u-input>
			</view>
		</view>
	</view>

	<!-- 评论回复弹框 -->
	<u-popup 
		:show="showOneReply" 
		round="10" 
		@close="handleClosePopup"
		:closeOnClickOverlay="true"
		:closeOnClickModal="true"
		:zIndex="999"
		:overlay="true"
		:overlayStyle="{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }"
		:duration="300"
		:mode="'bottom'"
		:safeAreaInsetBottom="true"
		:customStyle="{
			transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			transform: showOneReply ? 'translateY(0)' : 'translateY(100%)'
		}"
	>
		<view @touchmove.prevent class="popup-container">
			<!-- 拖拽指示条 -->
			<view class="drag-indicator" @touchstart="handleDragStart" @touchmove="handleDragMove" @touchend="handleDragEnd"></view>
			
			<!-- 输入区域 -->
			<view class="popup-input-area">
				<view class="input-wrapper">
					<u-input 
						:focus="showOneReply && inputFocus" 
						:placeholder="replyCommentsName" 
						border="surround" 
						v-model="rplContent"
						@focus="handleInputFocus" 
						@blur="handleInputBlur" 
						@input="handleInputChange"
						fontSize='24rpx' 
						color='#1a1a1a' 
						shape='circle'
						:adjustPosition="true" 
						:customStyle="{
							paddingLeft:'24rpx',
							background:'#F2F2F2',
							transition: 'all 0.2s ease'
						}"
					>
					</u-input>
					
					<!-- 发送按钮 -->
					<view 
						class="send-btn" 
						:class="{ 'send-btn-active': rplContent.trim() }"
						@tap="handleReleaseComment"
					>
						<text class="send-text">发送</text>
					</view>
				</view>
			</view>
		</view>
	</u-popup>
</template>

<script setup>
	import {
		ref,
		getCurrentInstance,
	} from 'vue'
	import {
		onLoad,
	} from '@dcloudio/uni-app'
	import { getMomentsDetail, pushMomentComment, getMomentCommentList, getMoreMomentCommentList, praiseMoment } from '@/api/discover.js'
	import PictureDisplay from '@/components/common/PictureDisplay.vue'

	const $instance = ref(getCurrentInstance().proxy)

	// 定义props
	const props = defineProps({
		userLocation: {
			type: Object,
			default: null
		},
		cityStore: {
			type: Object,
			default: null
		}
	})

	const scrollTop = ref(0)
	const oldScrollTop = ref(0)

	// 动态id
	const momentsId = ref('')

	// 分页页数
	const pageComment = ref(1)

	// 全部评论条数
	const totalComment = ref(0)

	// 评论数据是否已加载
	const commentDataLoaded = ref(false)

	// 用户信息
	const userInfoComment = ref({})

	// 评论数据
	const commentListData = ref([])

	// 评论数据
	const momentsInfoComment = ref([])

	// 评论内容
	const rplContent = ref('')

	// 被评论用户的id
	const replyCommentsId = ref('')

	// 回复对象名称
	const replyCommentsName = ref('友好发言，文明聊天')

	// 一级评论框
	const showOneReply = ref(false)
	
	// 输入框聚焦状态
	const inputFocus = ref(false)
	
	// 拖拽相关状态
	const dragStartY = ref(0)
	const dragCurrentY = ref(0)
	const isDragging = ref(false)

	onLoad((options) => {
		const eventChannel = $instance.value.getOpenerEventChannel();
		eventChannel.on('getRecord', async (data) => {
			momentsId.value = data.data.moments_info.moments_id
			getData(1)
		})
		replyCommentsId.value = ''
		replyCommentsName.value = '友好发言，文明聊天'
	})

	// 获取数据 - 调用真实接口
	const getData = async (val) => {
		try {
			const response = await getMomentsDetail({
				moments_id: momentsId.value
			})
			
			if (response.data && response.data.code === 0) {
				const data = response.data.data
				
				// 更新用户信息
				if (data.companion_info) {
					userInfoComment.value = {
						user_id: data.companion_info.id,
						nick_name: data.companion_info.nickname,
						head_img: data.companion_info.avatar,
						icon_list: [
							{
								icon: { 
									color: data.companion_info.gender === '女' ? 'rgba(252, 139, 198, 1)' : 'rgba(19, 98, 235, 1)', 
									icon: data.companion_info.gender === '女' ? '/static/find/nd_icon.png' : '/static/find/nand_icon.png' 
								},
								data: `${data.companion_info.age}岁`
							},
							{
								icon: { color: 'rgba(62, 178, 240, 1)' },
								data: `${data.companion_info.height}cm`
							},
							{
								icon: { color: 'linear-gradient(180deg, rgba(155, 59, 235, 1) 0%, rgba(230, 126, 188, 1) 100%)' },
								data: `${data.companion_info.weight}kg`
							}
						]
					}
				}
				
				// 更新动态信息
				if (data.moments_info) {
					momentsInfoComment.value = data.moments_info
				}
				
				// 获取评论列表
				getCommentData(1)
				
			} else {
				console.error('获取动态详情失败:', response.data?.message)
				uni.showToast({
					title: '获取动态详情失败',
					icon: 'none'
				})
			}
		} catch (error) {
			console.error('获取动态详情出错:', error)
			uni.showToast({
				title: '网络错误，请重试',
				icon: 'none'
			})
		}
	}

	// 获取评论数据
	const getCommentData = async (page) => {
		try {
			const response = await getMomentCommentList({
				moments_id: momentsId.value,
				page: page,
				page_size: 10
			})
			
			if (response.data && response.data.code === 0) {
				const data = response.data.data
				
				if (page === 1) {
					commentListData.value = data.comments_list || []
					totalComment.value = data.total || 0
					commentDataLoaded.value = true
				} else {
					if (data.comments_list && data.comments_list.length > 0) {
						commentListData.value.push(...data.comments_list)
						pageComment.value = data.page
					}
				}
			} else {
				console.error('获取评论列表失败:', response.data?.message)
				// 如果接口失败，使用模拟数据作为备用
				useMockCommentData()
			}
		} catch (error) {
			console.error('获取评论列表出错:', error)
			// 如果接口失败，使用模拟数据作为备用
			useMockCommentData()
		}
	}

	
	const useMockCommentData = () => {
		commentListData.value = []
		totalComment.value = 0
		commentDataLoaded.value = true
	}

	// 监听页面滚动到底部
	const lowerComment = () => {
		console.log('监听页面滚动到底部');
		getCommentData(pageComment.value + 1)
	}

	// 获取被评论用户的ID 
	const reply = (val) => {
		replyCommentsId.value = val.comments_id
		replyCommentsName.value = '回复@' + val.nick_name
		showOneReply.value = true
	}

	// 发布
	const handleReleaseComment = async () => {

		
		
		
		// 更严格的验证逻辑
		const trimmedContent = rplContent.value || ''
		if (!trimmedContent) {
			console.log('输入内容为空，显示错误提示')
			uni.showToast({
				title: '请输入评论内容',
				icon: 'none',
				duration: 1000
			});
			return
		}
		
		try {
			const params = {
				moments_id: momentsId.value,
				content: rplContent.value
			}
			
			// 如果是回复评论，添加回复评论ID
			if (replyCommentsId.value) {
				params.reply_comments_id = replyCommentsId.value
			}
			
			const response = await pushMomentComment(params)
			
			if (response.data && response.data.code === 0) {
				const newComment = response.data.data.res_data
				
				if (replyCommentsId.value) {
					// 回复评论
					commentListData.value.forEach((item) => {
						if (item.comments_id == newComment.parent_id) {
							item.comments_list.push(newComment)
						}
					})
					replyCommentsId.value = ''
					replyCommentsName.value = '友好发言，文明聊天'
				} else {
					// 直接评论
					commentListData.value.unshift(newComment)
				}
				
				// 更新总评论数
				totalComment.value = newComment.total
				momentsInfoComment.value.comments_num = newComment.total
				
				// 清空输入框
				rplContent.value = ''
				handleClosePopup()
				uni.showToast({
					title: '评论成功!',
					icon: 'none',
					duration: 500
				});
			} else {
				uni.showToast({
					title: response.data?.message || '评论失败!',
					icon: 'none',
					duration: 1000
				});
			}
		} catch (error) {
			console.error('发布评论出错:', error)
			uni.showToast({
				title: '网络错误，请重试',
				icon: 'none',
				duration: 1000
			});
		}
	}

	// 是否展开更多
	const handleHasMore = async (val) => {
		console.log('展开更多回复', val)
		try {
			const response = await getMoreMomentCommentList({
				comments_id: val.comments_id,
				page: 1,
				page_size: 10
			})
			
			if (response.data && response.data.code === 0) {
				const data = response.data.data
				val.comments_list = data.more_list || []
				val.has_more = data.has_more || false
			} else {
				console.error('获取更多回复失败:', response.data?.message)
			}
		} catch (error) {
			console.error('获取更多回复出错:', error)
		}
	}

	const handleScroll = (e) => {
		oldScrollTop.value = e.detail.scrollTop
	}

	// 关闭键盘
	const handleBlur = () => {
	}

	// 聚焦键盘
	const handleFocus = (e) => {
	}
	
	// 输入框聚焦
	const handleInputFocus = (e) => {
		inputFocus.value = true
	}
	
	// 输入框失焦
	const handleInputBlur = (e) => {
		inputFocus.value = false
	}
	
	// 输入框内容变化
	const handleInputChange = (value) => {
		console.log('handleInputChange 被调用，接收到的值:', value)
		rplContent.value = value
		console.log('rplContent 更新为:', rplContent.value)
	}
	
	// 拖拽开始
	const handleDragStart = (e) => {
		isDragging.value = true
		dragStartY.value = e.touches[0].clientY
		dragCurrentY.value = e.touches[0].clientY
	}
	
	// 拖拽移动
	const handleDragMove = (e) => {
		if (!isDragging.value) return
		
		dragCurrentY.value = e.touches[0].clientY
		const deltaY = dragCurrentY.value - dragStartY.value
		
		// 只允许向下拖拽关闭
		if (deltaY > 0) {
			e.preventDefault()
		}
	}
	
	// 拖拽结束
	const handleDragEnd = (e) => {
		if (!isDragging.value) return
		
		const deltaY = dragCurrentY.value - dragStartY.value
		
		// 如果向下拖拽超过50px，则关闭弹框
		if (deltaY > 50) {
			handleClosePopup()
		}
		
		isDragging.value = false
		dragStartY.value = 0
		dragCurrentY.value = 0
	}

	// 去详情
	const toDetail = () => {
		uni.navigateTo({
			url: '/pages/detail/detail',
			animationType: 'slide-in-bottom',
			animationDuration: 200,
			success(res) {
				res.eventChannel.emit('getUserId', {
					val: userInfoComment.value.user_id,
				})
			}
		})
	}

	const toDetailItem = (item) => {
		uni.navigateTo({
			url: '/pages/detail/detail',
			animationType: 'slide-in-bottom',
			animationDuration: 200,
			success(res) {
				res.eventChannel.emit('getUserId', {
					val: item.user_id,
				})
			}
		})
	}

	const toBack = () => {
		uni.navigateBack({
			delta: 1
		})
	}

	// 喜欢用户 - 模拟功能
	const likePerson = () => {
		momentsInfoComment.value.is_liked = true
		uni.showToast({
			title: '喜欢成功!',
			icon: 'none',
			duration: 1000
		});
	}

	// 回复一级评论
	const handleShowOneReply = () => {
		showOneReply.value = true
		// 延迟聚焦，确保弹框完全显示后再聚焦
		setTimeout(() => {
			inputFocus.value = true
		}, 350)
	}
	
	// 关闭弹框
	const handleClosePopup = () => {
		inputFocus.value = false
		showOneReply.value = false
		// 清空输入内容
		rplContent.value = ''
		replyCommentsId.value = ''
		replyCommentsName.value = '友好发言，文明聊天'
	}

	const handleSayHello = (val) => {
		uni.showToast({
			title: '打招呼功能开发中',
			icon: 'none',
			duration: 1000
		});
	}
	
	// 安全的数字加减工具函数，处理字符串类型的数字
	const safeNumberOperation = (value, operation = 'add', amount = 1) => {
		// 将字符串转换为数字，如果转换失败则默认为0
		const numValue = parseInt(value) || 0
		
		if (operation === 'add') {
			return numValue + amount
		} else if (operation === 'subtract') {
			return Math.max(0, numValue - amount) // 确保不会小于0
		}
		
		return numValue
	}

	// 点赞功能
	const handlePraise = async (val) => {
		try {
			// 先更新本地状态，提供即时反馈
			const wasPraised = momentsInfoComment.value.is_praised
			momentsInfoComment.value.is_praised = !wasPraised
			
			if (momentsInfoComment.value.is_praised) {
				momentsInfoComment.value.praise_num = safeNumberOperation(momentsInfoComment.value.praise_num, 'add', 1)
			} else {
				momentsInfoComment.value.praise_num = safeNumberOperation(momentsInfoComment.value.praise_num, 'subtract', 1)
			}
			
			// 调用API接口
			const response = await praiseMoment({
				target_id: val.target_id
			})
			
			if (response.data && response.data.code === 0) {
				// API调用成功，本地状态已经更新
				console.log('点赞成功')
			} else {
				// API调用失败，回滚本地状态
				momentsInfoComment.value.is_praised = wasPraised
				if (wasPraised) {
					momentsInfoComment.value.praise_num = safeNumberOperation(momentsInfoComment.value.praise_num, 'add', 1)
				} else {
					momentsInfoComment.value.praise_num = safeNumberOperation(momentsInfoComment.value.praise_num, 'subtract', 1)
				}
				
				uni.showToast({
					title: '点赞失败，请重试',
					icon: 'none'
				})
			}
		} catch (error) {
			console.error('点赞失败:', error)
			// 发生错误，回滚本地状态
			const wasPraised = momentsInfoComment.value.is_praised
			momentsInfoComment.value.is_praised = !wasPraised
			if (wasPraised) {
				momentsInfoComment.value.praise_num = safeNumberOperation(momentsInfoComment.value.praise_num, 'add', 1)
			} else {
				momentsInfoComment.value.praise_num = safeNumberOperation(momentsInfoComment.value.praise_num, 'subtract', 1)
			}
			
			uni.showToast({
				title: '网络错误，请重试',
				icon: 'none'
			})
		}
	}

	// 立即邀约
	const handleInvite = async () => {
		try {
			// 获取友伴师信息
			const companionInfo = userInfoComment.value
			if (!companionInfo || !companionInfo.user_id) {
				uni.showToast({
					title: '用户信息不完整',
					icon: 'none'
				})
				return
			}

			// 模拟服务区域（实际应该从API获取）
			const serviceAreas = ['110100', '310100', '440100'] // 北京、上海、广州
			
			// 如果只有一个服务区域，直接使用
			if (serviceAreas.length === 1) {
				const cityCode = serviceAreas[0]
				await navigateToDetail(companionInfo.user_id, cityCode)
				return
			}

			// 使用传入的定位信息
			if (props.userLocation) {
				// 有定位，计算最近的城市
				const nearestCityCode = await findNearestCity(serviceAreas, props.userLocation.latitude, props.userLocation.longitude)
				await navigateToDetail(companionInfo.user_id, nearestCityCode, props.userLocation.latitude, props.userLocation.longitude)
			} else {
				// 没有定位，使用第一个服务区域
				const cityCode = serviceAreas[0]
				await navigateToDetail(companionInfo.user_id, cityCode)
			}
		} catch (error) {
			console.error('邀约失败:', error)
			uni.showToast({
				title: '邀约失败，请重试',
				icon: 'none'
			})
		}
	}

	// 根据服务区域找到最近的城市
	const findNearestCity = async (serviceAreas, userLat, userLng) => {
		// 确保城市列表已加载
		if (props.cityStore && props.cityStore.cityList.length === 0) {
			await props.cityStore.loadCityList()
		}
		console.log('城市列表:', props.cityStore?.cityList)
		console.log('城市列表serviceAreas:', serviceAreas)
		// 从城市列表中找到服务区域对应的城市
		const serviceCities = props.cityStore?.cityList.filter(city => 
			serviceAreas.includes(city.code.toString())
		) || []
		
		if (serviceCities.length === 0) {
			console.warn('未找到对应的服务城市，使用第一个服务区域')
			return serviceAreas[0]
		}
		
		// 如果只有一个服务城市，直接返回
		if (serviceCities.length === 1) {
			return serviceCities[0].code
		}
		
		// 计算距离，找到最近的城市
		let nearestCity = serviceCities[0]
		let minDistance = Infinity
		
		serviceCities.forEach(city => {
			if (city.latitude && city.longitude) {
				const distance = props.cityStore?.calculateDistance(
					userLat,
					userLng,
					city.latitude,
					city.longitude
				) || Infinity
				
				if (distance < minDistance) {
					minDistance = distance
					nearestCity = city
				}
			}
		})
		
		console.log(`选择最近的服务城市: ${nearestCity.name}, 距离: ${minDistance.toFixed(2)}km`)
		return nearestCity.code
	}

	// 跳转到详情页面
	const navigateToDetail = async (partnerId, cityCode, latitude = null, longitude = null) => {
		let url = '/subPackages/py/detail?id=' + partnerId + '&city_code=' + cityCode
		
		// 添加经纬度参数
		if (latitude && longitude) {
			url += '&latitude=' + latitude + '&longitude=' + longitude
		}
		
		uni.navigateTo({
			url: url
		})
	}
</script>

<style lang="scss" scoped>
	.comment {
		height: 100vh;
		overflow: hidden !important;
		display: flex;
		background: #fff;
		flex-direction: column;
	}

	.comment_top {
		background-color: #fff;
	}


	.top {
		padding: 24rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;

		.top-left {
			display: flex;
			align-items: center;
		}

		.info { 
			.info-one {
				display: flex;
			     flex-direction: column;
               
				.name {
					margin-left: 20rpx;
					font-size: 24rpx;
					font-weight: 700;
					color: rgba(0, 0, 0, 1);
				}

				.introduce {
					margin-left: 12rpx;
					padding: 4rpx 10rpx;
					height: 28rpx;
					border-radius: 19rpx;
					display: flex;
					flex-direction: row;
					justify-content: space-evenly;
					align-items: center;

					.image {
						margin-right: 5rpx;
						width: 20rpx;
						height: 20rpx;
					}

					.introduce-title {
						font-size: 16rpx;
						font-weight: 500;
						color: rgba(255, 255, 255, 1);
					}
				}
			}
		}

		.like {
			width: 84rpx;
			padding: 10rpx 0rpx;
			border-radius: 23rpx;
			border: 1px solid rgba(204, 204, 204, 1);
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
			font-size: 20rpx;
			font-weight: 700;
			color: #fff;
			background: #7363FF;
		}

		.invite-btn {
			background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
			color: white;
			border-radius: 32rpx;
			padding: 12rpx 24rpx;
			font-size: 24rpx;
			font-weight: 700;
		}
	}

	.flex-box {
		height: 0;
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.scroll-Y {
		height: 0;
		flex: 1;
	}

	// 动态内容
	.moment-content {
		padding: 24rpx;
		border-bottom: 1rpx solid #F2F2F2;

		.moment-text {
			font-size: 24rpx;
			color: #1a1a1a;
			line-height: 1.5;
			margin-bottom: 20rpx;
		}

		.moment-media {
			margin: 20rpx 0;
		}

		.moment-topics {
			margin: 20rpx 0;
			display: flex;
			flex-wrap: wrap;
			gap: 12rpx;

			.topic-item {
				display: flex;
				align-items: center;
				padding: 8rpx 16rpx;
				background: rgba(115, 99, 255, 0.1);
				border-radius: 20rpx;
				border: 1rpx solid rgba(115, 99, 255, 0.3);

				.topic-icon {
					width: 24rpx;
					height: 24rpx;
					margin-right: 8rpx;
				}

				.topic-text {
					font-size: 20rpx;
					color: #7363FF;
					font-weight: 500;
				}
			}
		}

		.moment-actions {
			display: flex;
			align-items: center;
			gap: 40rpx;

			.action-item {
				display: flex;
				align-items: center;
				gap: 8rpx;

				.action-icon {
					width: 32rpx;
					height: 32rpx;
				}

				.action-text {
					font-size: 20rpx;
					color: #999;
				}
			}
		}
	}

	@mixin comment-item {
		display: flex;

		.left {
			margin-right: 12rpx;
		}

		.right {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: flex-start;

			.username {
				display: flex;
				align-items: center;
				margin-bottom: 8rpx;
				font-size: 20rpx;
				color: #999;

				image {
					transform: translateY(2rpx);
					width: 11rpx;
					height: 13.5rpx;
					margin: 0 12rpx;
				}
			}

			.comment-content {
				margin-bottom: 12rpx;
				width: 550rpx;
				word-wrap: break-word;
				font-size: 24rpx;
				color: #1a1a1a;
			}

			.option {
				display: flex;
				justify-content: space-between;
				align-items: center;
				width: 100%;

				.time {
					margin-right: 20rpx;
					font-size: 20rpx;
					color: #999;
				}

				.reply-btn {
					font-size: 20rpx;
					color: #666;
				}
			}
		}
	}

	// 评论区
	.comment-section {
		padding: 0 24rpx;
		 margin-top: 24rpx;
         box-sizing: border-box;
		.title {
			margin-bottom: 20rpx;
			font-size: 24rpx;
			font-weight: 500;
		}

		.comment-list {
			padding-bottom: 180rpx;
			display: flex;
			flex-direction: column;

			.comment-item {
				margin-bottom: 32rpx;

				.main {
					@include comment-item;
					margin-bottom: 16rpx;

					&:active {
						background: linear-gradient(90deg, rgba(242, 242, 242, 0) 0%, rgba(242, 242, 242, 1) 54.17%, rgba(242, 242, 242, 0) 100%);
					}
				}

				.reply-list {
					margin-top: 16rpx;
					display: flex;
					flex-direction: column;
					margin-left: 76rpx;

					.reply-item {
						@include comment-item;
						margin-bottom: 16rpx;

						&:active {
							background: linear-gradient(90deg, rgba(242, 242, 242, 0) 0%, rgba(242, 242, 242, 1) 54.17%, rgba(242, 242, 242, 0) 100%);
						}
					}
				}
			}
		}
	}

	.expand {
		margin-top: 32rpx;
		margin-left: 76rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 210rpx;

		.line {
			width: 44rpx;
			height: 2rpx;
			background-color: #7363FF;
		}

		text {
			font-size: 20rpx;
			color: #7363FF;
		}
	}

	// 聊天框
	.chatting {
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 16rpx 22rpx 34rpx;
		background-color: #ffffff;
		box-shadow: 0px -0.2px 0.5px rgba(229, 229, 229, 1);
		border-top: 2rpx solid #fff;

		:deep(.u-input) {
			box-sizing: border-box;
			flex: 1;
			height: 68rpx;
		}

		.send-btn-show {
			width: 100rpx;
			height: 56rpx;
			background-color: #7363FF;
			border-radius: 36rpx;
			color: #fff;
			font-size: 24rpx;
			font-weight: 500;
			text-align: center;
				margin-left: 20rpx;
			line-height: 56rpx; 
		}
	}

	.no-record {
		margin-top: 46rpx;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;

		.no-record-image {
			width: 140rpx;
			height: 140rpx;
		}

		.no-record-title {
			margin-top: 12rpx;
			font-size: 20rpx;
			font-weight: 400;
			color: rgba(153, 153, 153, 1);
		}
	}

	.nav-com-left {
		width: 170rpx;

		.nav-com-image {
			width: 48rpx;
			height: 48rpx;
		}
	}

	// 弹框容器样式
	.popup-container {
		background: #fff;
		border-radius: 20rpx 20rpx 0 0;
		overflow: hidden;
		position: relative;
	}

	// 拖拽指示条
	.drag-indicator {
		width: 60rpx;
		height: 6rpx;
		background: #E5E5E5;
		border-radius: 3rpx;
		margin: 16rpx auto 24rpx;
		transition: all 0.2s ease;
		
		&:active {
			background: #C0C0C0;
			transform: scale(1.1);
		}
	}

	// 弹框输入区域
	.popup-input-area {
		padding: 0 24rpx 40rpx;
		background: #fff;
	}

	.input-wrapper {
		display: flex;
		align-items: center;
		gap: 16rpx;
		position: relative;
	}

	// 发送按钮样式
	.send-btn {
		width: 100rpx;
		height: 56rpx;
		border-radius: 36rpx;
		background: #E5E5E5;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		transform: scale(0.9);
		opacity: 0.6;
		
		.send-text {
			font-size: 24rpx;
			color: #999;
			font-weight: 500;
			transition: all 0.3s ease;
		}
		
		&.send-btn-active {
			background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
			transform: scale(1);
			opacity: 1;
			box-shadow: 0 4rpx 12rpx rgba(115, 99, 255, 0.3);
			
			.send-text {
				color: #fff;
				font-weight: 600;
			}
		}
		
		&:active {
			transform: scale(0.95);
		}
	}

	// 弹框动画效果
	:deep(.u-popup) {
		.u-popup__content {
			transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
		}
		
		.u-popup__overlay {
			transition: all 0.3s ease !important;
		}
	}

	// 输入框聚焦时的样式
	:deep(.u-input) {
		&.u-input--focus {
			background: #fff !important;
			box-shadow: 0 0 0 2rpx rgba(115, 99, 255, 0.2) !important;
			transform: scale(1.02);
		}
	}
</style>