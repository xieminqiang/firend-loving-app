<template>
	<view class="record">
		<view class="record_top">
			<nav-com class="nav-com">
				<template #left>
					<view class="nav-com-left">
						<image class="nav-com-image" src="~@/static/square/back.png" mode="" @tap="toBack"></image>
					</view>
				</template>
				<template #center>
					<text>记录</text>
				</template>
				<template #right>
					<view class="nav-com-right"></view>
				</template>
			</nav-com>
			<!-- 头部信息 -->
			<view class="top">
				<view class="top-left">
					<!-- 头像 -->
					<view class="avatar" @click="toDetail()">
						<u-avatar :src="userInfoRcord.head_img" size="38" shape="circle"></u-avatar>
					</view>
					<!-- 介绍 -->
					<view class="info">
						<view class="info-one">
							<view class="name">{{ userInfoRcord.nick_name }}</view>
							<template v-if="userInfoRcord.icon_list">
								<block v-for="item in userInfoRcord.icon_list" :key="item">
									<view class="introduce" :style="{background:`${item.icon?.color}`}">
										<image v-if="item.icon.icon" class="image" :src="item.icon?.icon"
											mode="widthFix">
										</image>
										<text class="introduce-title">{{ item.data }}</text>
									</view>
								</block>
							</template>
						</view>
					</view>
				</view>
				<!-- 喜欢 -->
				<view v-show="!momentsInfoRcord.is_liked" class="like" @tap="likePerson">喜欢</view>
			</view>
		</view>

		<view class="flex-box">
			<scroll-view :scroll-top="scrollTop" scroll-y="true" class="scroll-Y" scroll-anchoring
				:lower-threshold="300" :scroll-with-animation="true" :show-scrollbar="true" :enable-back-to-top="true"
				@scroll="handleScroll" @scrolltolower="lowerRecord">
				<!-- 图片 -->
				<record-item :momentsInfoRcordData="momentsInfoRcord" :userInfoRcord="userInfoRcord"
					@changeShowOneReply="handleShowOneReply" @changeSayHello="handleSayHello" @changePraise="handlePraise"></record-item>
				<!-- 评论区 -->
				<view class="comment">
					<view class="title">
						<text>全部评论({{ totalRecord }}条)</text>
					</view>
					<view v-if="totalRecord == 0" class="no-record">
						<image class="no-record-image" src="~@/static/square/no-record.png" mode=""></image>
						<view class="no-record-title">还没有评论丫，抢先发表一下吧！</view>
					</view>

					<view v-else class="comment-list">
						<view class="commment-item" v-for="(item, index) in commentListData" :key="item.comments_id">
							<!-- 一级评论 -->
							<view class="main" @tap="reply(item)">
								<view class="left" @tap.stop="toDetailItem(item)">
									<u-avatar :src="item.head_img" size="32" shape="circle"></u-avatar>
								</view>
								<view class="right">
									<view class="username">
										<text>{{item.nick_name}}</text>
									</view>
									<view class="comment-content">
										<text>{{item.content}}</text>
									</view>
									<view class="option">
										<view class="left">
											<text class="time">{{item.content_time}}</text>
											<text class="reply-btn" @tap="reply(item)">回复</text>
										</view>
										<!-- <view class="like">
												<image v-if="item.is_praised" src="@/static/square/active-love.png"
													class="like-image" @tap="handleLove(item)"></image>
												<image v-if="!item.is_praised" src="@/static/square/love.png" class="like-image"
													@tap="handleLove(item)"></image>
												<text class="num">{{item?.praise_num}}</text>
											</view> -->
									</view>
								</view>
							</view>

							<!-- 二级评论 -->
							<view class="reply-list" v-for="(it, index) in item.comments_list" :key="it.comments_id">
								<view class="reply-item" @tap="reply(it)">
									<view class="left" tap.stop="toDetailItem(it)">
										<u-avatar :src="it.head_img" size="22" shape="circle"></u-avatar>
									</view>
									<view class="right">
										<view class="username">
											<text class="reply-username">{{it.nick_name}}</text>
											<image src="@/static/square/reply@3x.png" mode=""></image>
											<text class="main-username">{{it.reply_nick_name}}</text>
										</view>
										<view class="comment-content">
											<text>{{it.content}}</text>
										</view>
										<view class="option">
											<view class="left">
												<text class="time">{{it.content_time}}</text>
												<text class="reply-btn" @tap="reply(it)">回复</text>
											</view>
											<!-- <view class="like">
													<image src="@/static/square/love.png" class="like-image"></image>
													<text class="num">{{it?.praise_num}}</text>
												</view> -->
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
				<u-input :placeholder="replyCommentsName" border="surround" v-model="rplContent" @focus="handleFocus"
					@blur="handleBlur" fontSize='24rpx' color='#1a1a1a' shape='circle' :adjustPosition="true" disabled
					:customStyle="{
							background:'#F2F2F2'
						}">
				</u-input>
			</view>
		</view>
	</view>

	<!-- 回复区 -->
	<view @touchmove.prevent>
		<u-popup :show="replyShow" @close="replyShow = false" round='20' closeOnClickOverlay>
			<view class="reply-popup">
				<view class="arrow-bottom" @tap="replyShow = false">
					<image src="@/static/record/arrow-bottom@2x.png"></image>
				</view>
				<view class="title">
					<text>回复评论({{totalMoreRecord}}条)</text>
				</view>
				<view class="main-item" @tap="replyTwo(hasMoreData)">
					<view class="left" @tap.stop="toDetailMroe(hasMoreData)">
						<u-avatar :src="hasMoreData.head_img" size="22" shape="circle"></u-avatar>
					</view>
					<view class="right">
						<view class="username">
							<text class="main-username">{{hasMoreData.nick_name}}</text>
						</view>
						<view class="comment-content">
							<text>{{hasMoreData.content}}</text>
						</view>
						<view class="option">
							<view class="left">
								<text class="time">{{hasMoreData.content_time}}</text>
								<text class="reply-btn" @tap="replyTwo(hasMoreData)">回复</text>
							</view>
							<!-- <view class="like">
								<image src="@/static/square/love.png" class="like-image"></image>
								<text class="num">{{hasMoreData?.praise_num}}</text>
							</view> -->
						</view>
					</view>
				</view>
				<view class="line"></view>

				<scroll-view :scroll-top="scrollTop" scroll-y="true" class="scroll-Y-reply" @scrolltolower="lower">
					<view class="reply-box">
						<template v-for="ite in momentsListRecordData" :key="ite.comments_id">
							<view class="reply-item" @tap="replyTwo(ite)">
								<view class="left" @tap.stop="toDetailItem(ite)">
									<u-avatar :src="ite.head_img" size="22" shape="circle"></u-avatar>
								</view>
								<view class="right">
									<view class="username">
										<text class="reply-username">{{ite.nick_name}}</text>
										<image src="/static/square/reply@3x.png" mode=""></image>
										<text class="main-username">{{ite.reply_nick_name}}</text>
									</view>
									<view class="comment-content">
										<text>{{ite.content}}</text>
									</view>
									<view class="option">
										<view class="left">
											<text class="time">{{ite.content_time}}</text>
											<text class="reply-btn" @tap="replyTwo(ite)">回复</text>
										</view>
										<view class="like">
											<!-- <image src="@/static/square/love.png" class="like-image"></image>
											<text class="num">{{ite?.praise_num}}</text> -->
										</view>
									</view>
								</view>
							</view>
						</template>
					</view>
				</scroll-view>
				<!-- 二级评论聊天框 -->
				<view class="chatting-more">
					<u-input :focus="sendBtnShowTwo" :placeholder="replyCommentsNameTwo" border="surround"
						v-model="contentTwo" @blur="handleBlurTwo" :adjustPosition="true" fontSize='24rpx'
						color='#1a1a1a' shape='circle' :customStyle="{
							background:'#F2F2F2'
						}">
					</u-input>
					<view v-show="contentTwo" class="send-btn-show" @tap="handleReleaseCommentTwo">
						<text>发送</text>
					</view>
				</view>
			</view>
		</u-popup>
	</view>

	<!-- 分享 -->
	<share-cpn :show="isShare" :shareData="shareData" @changeShowShare="handleShowShare"></share-cpn>

	<!-- 开启会员 -->
	<show-vip :isShow="showVIP" :showDesc="showDesc" @changeShowVip="handleShowVip"></show-vip>
	
	<!-- 今日打招呼次数已用完 -->
	<show-hello :isShow="showHelloOne" :goodsId="goodsId" @changeShowHello="handleShowHello"></show-hello>

	<!-- 一级评论回复 -->
	<u-popup :show="showOneReply" round="10" @close="showOneReply = false">
		<view @touchmove.prevent class="chatting">
			<u-input :focus="showOneReply" :placeholder="replyCommentsName" border="surround" v-model="rplContent"
				@focus="handleFocus" @blur="handleBlur" fontSize='24rpx' color='#1a1a1a' shape='circle'
				:adjustPosition="true" :customStyle="{
					background:'#F2F2F2'
				}">
			</u-input>
			<view v-show="rplContent" class="send-btn-show" @tap="handleReleaseComment">
				<text>发送</text>
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
		onReachBottom,
	} from '@dcloudio/uni-app'
	import {
		// 获取用户评论数据
		commentList,
		momentComment,
		getMoretCommentList
	} from '@/service/square.js'
	import {
		storeToRefs
	} from 'pinia'
	import {
		useSquareStore
	} from '@/store/square.js'
	import {
		getGreetNum
	} from '@/service/find.js'
	import {
		praiseMoment
	} from '@/service/square.js'
	import {
		// 喜欢/不喜欢/撤回用户
		attitudePerson
	} from '@/service/find.js'

	const squareStore = useSquareStore()

	const {
		location,
		locationDesc,
		squareRecommendData,
		squareRecommendLoveData,
		isShare,
		shareData
	} = storeToRefs(squareStore)

	const $instance = ref(getCurrentInstance().proxy)

	const scrollTop = ref(0)

	const oldScrollTop = ref(0)

	// 动态id
	const momentsId = ref('')

	// 分页页数
	const pageRecord = ref(1)

	// 全部评论条数
	const totalRecord = ref(0)

	// 用户信息
	const userInfoRcord = ref({})

	// 评论数据
	const commentListData = ref([])

	// 评论数据
	const momentsInfoRcord = ref([])

	// 评论内容
	const rplContent = ref('')

	// 二级评论内容
	const contentTwo = ref('')

	// 被评论用户的id
	const replyCommentsId = ref('')

	// 回复对象名称
	const replyCommentsName = ref('友好发言，文明聊天')

	// 二级评论用户id
	const replyCommentsIdTwo = ref('')

	// 二级评论用户名字
	const replyCommentsNameTwo = ref('')

	// 查看更多的二级用户id
	const saveCommentsId = ref('')

	// 查看更多的二级用户名称
	const saveCommentsName = ref('')

	// 更多评论条数
	const totalMoreRecord = ref(0)

	// 更多评论数据
	const momentsListRecordData = ref([])

	// 更多评论页数
	const pageMoreRecord = ref(1)

	// 查看更多的基本数据
	const hasMoreData = ref({})

	// 是否展开更多
	const replyShow = ref(false)

	// 一级评论框
	const showOneReply = ref(false)

	// 二级评论框
	const sendBtnShowTwo = ref(false)

	const showVIP = ref(false)

	const showDesc = ref('')
	
	const showHelloOne = ref(false)
	
	const goodsId = ref('')

	onLoad((options) => {
		const eventChannel = $instance.value.getOpenerEventChannel();
		eventChannel.on('getRecord', async (data) => {
			momentsId.value = data.data.moments_info.moments_id
			getData(1)
		})
		replyCommentsId.value = ''
		replyCommentsName.value = '友好发言，文明聊天'
	})

	// 获取数据
	const getData = async (val) => {
		let parameter = {
			moments_id: momentsId.value,
			page: val,
			page_size: 10
		}
		const res = await commentList(parameter)
		totalRecord.value = res.data.data.total
		userInfoRcord.value = res.data.data.user_info || {}
		momentsInfoRcord.value = res.data.data.moments_info || {}
		if (res.data.data.page == 1) {
			commentListData.value = res.data.data.comments_list || []
		} else {
			if (res.data.data.comments_list.length != 0) {
				commentListData.value.push(...res.data.data.comments_list)
				pageRecord.value = res.data.data.page
			}
		}
	}

	// 监听页面滚动到底部
	const lowerRecord = () => {
		console.log('监听页面滚动到底部');
		getData(pageRecord.value + 1)
	}

	// 获取被评论用户的ID 
	const reply = (val) => {
		replyCommentsId.value = val.comments_id
		replyCommentsName.value = '回复@' + val.nick_name
		showOneReply.value = true
	}

	// 获取二级评论被评论用户的ID
	const replyTwo = (val) => {
		replyCommentsIdTwo.value = val.comments_id
		replyCommentsNameTwo.value = '回复@' + val.nick_name
		sendBtnShowTwo.value = true
	}

	// 发布评论
	const handleReleaseComment = () => {
		squareStore.getMomentComment()
		showOneReply.value = false
		let parameter = {
			moments_id: momentsInfoRcord.value.moments_id, //动态id
			reply_comments_id: replyCommentsId.value, //评论id
			content: rplContent.value, //评论内容
			location: location.value, //定位
			location_desc: locationDesc.value //定位描述
		}
		momentComment(parameter).then((res) => {
			if (res.data.code === 0) {
				uni.showToast({
					title: '评论成功!',
					icon: 'none',
					duration: 500
				});
				rplContent.value = ''
				if (replyCommentsId.value != '') {
					commentListData.value.forEach((item) => {
						if (item.comments_id == res.data.data.res_data.parent_id) {
							item.comments_list.push(res.data.data.res_data)
						}
					})
					replyCommentsId.value = ''
					replyCommentsName.value = '友好发言，文明聊天'
				} else {
					commentListData.value.unshift(res.data.data.res_data)
				}
				// 修改总条数
				totalRecord.value = res.data.data.res_data.total
				if (momentsInfoRcord.value.moments_id == res.data.data.res_data
					.moments_id) {
					momentsInfoRcord.value.comments_num = res.data.data.res_data
						.total
				}
				squareRecommendData.value.forEach(item => {
					if (item.moments_info.moments_id == res.data.data.res_data
						.moments_id) {
						item.moments_info.comments_num = res.data.data.res_data
							.total
					}
				})
				squareRecommendLoveData.value.forEach(item => {
					if (item.moments_info.moments_id == res.data.data.res_data
						.moments_id) {
						item.moments_info.comments_num = res.data.data.res_data
							.total
					}
				})
			} else {
				uni.showToast({
					title: '评论失败!',
					icon: 'none',
					duration: 500
				});
			}
		})
	}

	// 发布二级评论
	const handleReleaseCommentTwo = () => {
		squareStore.getMomentComment()
		let parameter = {
			moments_id: momentsInfoRcord.value.moments_id, //动态id
			reply_comments_id: replyCommentsIdTwo.value, //评论id
			content: contentTwo.value, //评论内容
			location: location.value, //定位
			location_desc: locationDesc.value //定位描述
		}
		momentComment(parameter).then((res) => {
			console.log(res, 'resresres');
			if (res.data.code === 0) {
				momentsListRecordData.value.unshift(res.data.data.res_data)
				replyCommentsIdTwo.value = saveCommentsId.value
				replyCommentsNameTwo.value = '回复@' + saveCommentsName.value
				contentTwo.value = ''
				totalMoreRecord.value = totalMoreRecord.value + 1
				uni.showToast({
					title: '评论成功!',
					duration: 500
				});
				totalRecord.value = res.data.data.res_data.total
				// 修改总条数
				if (momentsInfoRcord.value.moments_id == res.data.data.res_data
					.moments_id) {
					momentsInfoRcord.value.comments_num = res.data.data.res_data
						.total
				}
				squareRecommendData.value.forEach(item => {
					if (item.moments_info.moments_id == res.data.data.res_data
						.moments_id) {
						item.moments_info.comments_num = res.data.data.res_data
							.total
					}
				})
				squareRecommendLoveData.value.forEach(item => {
					if (item.moments_info.moments_id == res.data.data.res_data
						.moments_id) {
						item.moments_info.comments_num = res.data.data.res_data
							.total
					}
				})
			} else {
				uni.showToast({
					title: '评论失败!',
					duration: 500
				});
			}
		})
	}

	// 获取数据
	const getDataTwo = async (val) => {
		let parameter = {
			comments_id: replyCommentsIdTwo.value,
			page: val,
			page_size: 10
		}
		const res = await getMoretCommentList(parameter)
		totalMoreRecord.value = res.data.data.total
		if (res.data.data.page == 1) {
			momentsListRecordData.value = res.data.data.more_list || []
		} else {
			if (res.data.data.more_list.length != 0) {
				momentsListRecordData.value.push(...res.data.data.more_list)
				pageMoreRecord.value = res.data.data.page
			}
		}
	}

	// 是否展开更多
	const handleHasMore = (val) => {
		hasMoreData.value = val
		replyCommentsIdTwo.value = val.comments_id
		replyCommentsNameTwo.value = '回复@' + val.nick_name
		saveCommentsId.value = val.comments_id
		saveCommentsName.value = val.nick_name
		getDataTwo(1)
		replyShow.value = true;
	}

	// 展开更多里面的触底加载更多
	const lower = () => {
		console.log('展开更多里面的触底加载更多');
		getDataTwo(pageMoreRecord.value + 1)
	}

	const goTop = (e) => {
		// 解决view层不同步的问题
		scrollTop.value = oldScrollTop.value
		nextTick(() => {
			scrollTop.value = 0
		})
	}

	const handleScroll = (e) => {
		oldScrollTop.value = e.detail.scrollTop
	}

	// 关闭键盘
	const handleBlur = () => {
	}

	// 关闭二级键盘
	const handleBlurTwo = () => {
		sendBtnShowTwo.value = false
	}

	// 聚焦键盘
	const handleFocus = (e) => {
	}

	// 去详情
	const toDetail = () => {
		uni.navigateTo({
			url: '/pages/detail/detail',
			animationType: 'slide-in-bottom',
			animationDuration: 200,
			success(res) {
				res.eventChannel.emit('getUserId', {
					val: userInfoRcord.value.user_id,
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

	const toDetailMroe = (hasMoreData) => {
		uni.navigateTo({
			url: '/pages/detail/detail',
			animationType: 'slide-in-bottom',
			animationDuration: 200,
			success(res) {
				res.eventChannel.emit('getUserId', {
					val: hasMoreData.user_id,
				})
			}
		})
	}

	const toBack = () => {
		uni.navigateBack({
			delta: 1
		})
	}

	// 喜欢用户
	const likePerson = async () => {
		let data = {
			attitude_user_id: userInfoRcord.value.user_id,
			attitude_type: "like"
		}
		const res = await attitudePerson(data)
		if (res.data.code == 0) {
			if (momentsInfoRcord.value.user_id == userInfoRcord.value.user_id) {
				momentsInfoRcord.value.is_liked = true
			}
			if (res.data.data.pairing_info?.is_pairing) {
				let likeUserInfo = res.data.data.pairing_info
				uni.navigateTo({
					url: '/pages/mate/matching-successful/matching-successful',
					animationType: 'zoom-fade-out',
					animationDuration: 200,
					success(res) {
						res.eventChannel.emit('userPairingInfo', {
							data: likeUserInfo
						})
					}
				})
			}
			squareRecommendData.value.forEach(item => {
				if (item.user_info.user_id == userInfoRcord.value.user_id) {
					item.moments_info.is_liked = true
				}
			})
		}
	}

	// 分享
	const handleShowShare = (val) => {
		squareStore.changeIsShareClose(val)
	}

	// 回复一级评论
	const handleShowOneReply = () => {
		showOneReply.value = true
	}

	const handleSayHello = async (val) => {
		const result = await getGreetNum()
		if (result.data.code == 0) {
			uni.navigateTo({
				url: '/pages/say-hello/say-hello',
				animationType: 'slide-in-bottom',
				animationDuration: 200,
				success: function(res) {
					// 通过eventChannel向被打开页面传送数据
					res.eventChannel.emit('sayHelloUserId', {
						sayHelloUserId: val
					})
				}
			})
		}
		if (result.data.code == 4003) {
			showDesc.value = result.data.show
			showVIP.value = true
		}
		if (result.data.code == 4008) {
			goodsId.value = result.data.data
			showHelloOne.value = true
		}
	}
	
	// 点赞
	const handlePraise = async (val) => {
		const res = await praiseMoment(val)
		if (res.data.code === 0) {
			momentsInfoRcord.value.is_praised = res.data.data.is_praised
			momentsInfoRcord.value.praise_num = res.data.data.count
			squareRecommendData.value.forEach(item => {
				if (item.moments_info.moments_id == val.target_id) {
					item.moments_info.is_praised = res.data.data.is_praised
					item.moments_info.praise_num = res.data.data.count
				}
			})
			squareRecommendLoveData.value.forEach(item => {
				if (item.moments_info.moments_id == val.target_id) {
					item.moments_info.is_praised = res.data.data.is_praised
					item.moments_info.praise_num = res.data.data.count
				}
			})
		} else {
			uni.showToast({
				title: res.data.msg,
				duration: 1500
			});
		}
	}

	const handleShowVip = () => {
		showVIP.value = false
		showDesc.value = ''
	}
	
	const handleShowHello = () => {
		showHelloOne.value = false
	}
</script>

<style lang="scss" scoped>
	.record {
		height: 100vh;
		overflow: hidden !important;
		display: flex;
		flex-direction: column;
	}

	.record_top {}

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

				.name {
					margin-left: 20rpx;
					font-size: 24rpx;
					font-weight: 700;
					color: rgba(0, 0, 0, 1);
				}

				.introduce {
					margin-left: 12rpx;
					padding: 4rpx 10rpx;
					height: 20rpx;
					border-radius: 19rpx;
					@include cctFlex(row, space-evenly, center);

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

				.show {
					margin-left: 12rpx;
					padding: 4rpx 10rpx;
					width: 100rpx;
					height: 28rpx;
					border-radius: 19rpx;
					background: #3eb2f0;
					@include cctFlex(row, space-evenly, center);

					.image {
						width: 20rpx;
						height: 20rpx;
					}

					.shwo-title {
						font-size: 16rpx;
						font-weight: 500;
						letter-spacing: 0rpx;
						color: rgba(255, 255, 255, 1);
					}
				}

				.category {
					margin-left: 12rpx;
					padding: 4rpx 10rpx;
					width: 72rpx;
					height: 28rpx;
					border-radius: 19rpx;
					background: linear-gradient(180deg, rgba(155, 59, 235, 1) 0%, rgba(230, 126, 188, 1) 100%);
					font-size: 16rpx;
					font-weight: 500;
					color: rgba(255, 255, 255, 1);
					@include cctFlex(row, center, center);
				}
			}

			.info-two {
				margin-left: 20rpx;
				margin-top: 14rpx;
				font-size: 20rpx;
				font-weight: 400;
				color: rgba(153, 153, 153, 1);
			}
		}

		.like {
			width: 84rpx;
			padding: 10rpx 0rpx;
			border-radius: 23rpx;
			border: 1px solid rgba(204, 204, 204, 1);
			@include cctFlex(row, center, center);
			font-size: 20rpx;
			font-weight: 700;
			color: #fff;
			background: #7363FF;
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

	.popupShow {
		overflow: hidden;
		position: fixed;
	}

	.right {
		display: flex;
		align-items: center;
		justify-content: center;

		.right-image {
			width: 48rpx;
		}
	}

	.content-wrapper {
		// 580
		height: 89vh;
	}

	.connect {
		width: 100%;
		border-bottom: 1rpx solid #F2F2F2;
		margin-top: 40rpx;
		margin-bottom: 28rpx;
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

				.like {
					display: flex;
					align-items: center;

					image {
						width: 32rpx;
						height: 32rpx;
						margin-right: 12rpx;
					}

					.num {
						font-size: 20rpx;
						color: #999;
					}
				}
			}
		}
	}

	// 评论区
	.comment {
		padding: 0 24rpx;

		.title {
			margin-bottom: 20rpx;
			font-size: 24rpx;
			font-weight: 500;
		}

		.comment-list {
			// margin-right: 24rpx;
			padding-bottom: 180rpx;
			display: flex;
			flex-direction: column;
			// row-gap: 34rpx;

			.main {
				@include comment-item;
				margin-bottom: 32rpx;

				&:active {
					background: linear-gradient(90deg, rgba(242, 242, 242, 0) 0%, rgba(242, 242, 242, 1) 54.17%, rgba(242, 242, 242, 0) 100%);
				}
			}

			.reply-list {
				margin-top: 16rpx;
				display: flex;
				flex-direction: column;
				// row-gap: 32rpx;
				margin-left: 76rpx;

				.reply-item {
					@include comment-item;

					.right {
						.username {
							display: flex;
							align-items: center;

							image {
								transform: translateY(2rpx);
								width: 11rpx;
								height: 13.5rpx;
								margin: 0 12rpx;
							}
						}
					}

					&:active {
						background: linear-gradient(90deg, rgba(242, 242, 242, 0) 0%, rgba(242, 242, 242, 1) 54.17%, rgba(242, 242, 242, 0) 100%);
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

	// 回复区
	.reply-popup {
		height: 80vh;
		padding-bottom: 120rpx;

		.arrow-bottom {
			text-align: center;

			image {
				width: 56rpx;
				height: 56rpx;

			}
		}

		.title {
			margin-bottom: 40rpx;
			text-align: center;
			font-size: 24rpx;
			font-weight: 500;
		}

		.main-item {
			@include comment-item;
			padding-left: 24rpx;
			padding-right: 40rpx;
		}

		.line {
			width: 100%;
			height: 2rpx;
			background-color: #F2F2F2;
			margin: 32rpx 0;
		}

		.reply-item {
			@include comment-item;
			padding-left: 24rpx;
			padding-right: 40rpx;

			&:not(:last-child) {
				margin-bottom: 32rpx;
			}

			&:active {
				background: linear-gradient(90deg, rgba(242, 242, 242, 0) 0%, rgba(242, 242, 242, 1) 54.17%, rgba(242, 242, 242, 0) 100%);
			}
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

		.image {
			width: 44rpx;
			height: 44rpx;
			margin-left: 32rpx;
			margin-right: 28rpx;
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
			line-height: 56rpx;
		}
	}

	.chatting-more {
		position: fixed;
		left: 0;
		bottom: 0;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
		z-index: 10990;
		width: 100%;
		height: 100rpx;
		padding: 16rpx 22rpx;
		background-color: #fff;
		box-shadow: 0px -0.2px 0.5px rgba(229, 229, 229, 1);
		border-top: 2rpx solid #fff;

		:deep(.u-input) {
			box-sizing: border-box;
			flex: 1;
			height: 68rpx;
		}

		.image {
			width: 44rpx;
			height: 44rpx;
			margin-left: 32rpx;
			margin-right: 28rpx;
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
			line-height: 56rpx;
		}
	}

	.reply-box {
		// flex: 1;
		padding-bottom: 320rpx;
	}

	.scroll-Y-reply {
		height: 100%;
		overflow: hidden;
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
</style>