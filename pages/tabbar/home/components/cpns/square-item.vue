<template>
	<view class="square-show">
		<!-- 头部信息 -->
		<view class="top" v-if="listType === 1 && item.companion_info">
			<view class="top-left">
				<!-- 头像 -->
				<view class="avatar" >
					<u-avatar :src="$imgBaseUrl + item.companion_info.avatar" size="38" shape="circle" mode="aspectFill"></u-avatar>
				</view>

				<!-- 介绍 -->
				<view class="info">
					<view class="info-one">
						<view class="name">{{ item.companion_info.nickname }}</view>
						<view class="introduce" :style="getGenderStyle(item.companion_info.gender)">
							<image :src="getGenderIcon(item.companion_info.gender)" mode="widthFix" class="gender-icon"></image>
							<text class="introduce-title">{{ item.companion_info.age }}岁</text>
						</view>
						<view class="introduce" style="background: rgba(62, 178, 240, 1)">
							<text class="introduce-title">{{ item.companion_info.height }}cm</text>
						</view>
						<view class="introduce" style="background: linear-gradient(180deg, rgba(155, 59, 235, 1) 0%, rgba(230, 126, 188, 1) 100%);">
							<text class="introduce-title">{{ item.companion_info.weight }}kg</text>
						</view>
					</view>

					<view class="info-two">
						<view class="">{{ item.companion_info.tags.join('、') }}</view>
					</view>
				</view>
			</view>
			
			<!-- 立即邀约按钮 -->
			<view class="invite-btn" @tap="handleInvite(item)">
				立即邀约
			</view>
		</view>

		<!-- 文案 -->
		<view class="copywriting" >
			<view >
				{{ item.moments_info.content }}
			</view>

			<!-- 照片 -->
			<view >
				<PictureDisplay v-if="item.moments_info?.file_list" :list="item.moments_info?.file_list"
					:topicList="item.moments_info?.topic_list" ></PictureDisplay>
			</view>
		</view>

		<!-- 底部 -->
		<view class="foot">
			<!-- <view class="" @tap="shareToggle(item)">
				<image src="@/static/square/share@3x.png" mode="widthFix" class="foot-image"></image>
			</view> -->
			 <view></view>
			<view class="foot-right">
				<!-- 点赞 -->
				<view class="icon-item">
					<image v-if="!item.moments_info.is_praised" src="@/static/square/love.png" mode=""
						class="foot-image" @tap="handlePraise(item)">
					</image>
					<image v-if="item.moments_info.is_praised" src="@/static/square/active-love.png" mode=""
						class="foot-image" @tap="handlePraise(item)">
					</image>
					<view class="icon-title">{{ item.moments_info.praise_num || 0 }}</view>
				</view>
				<!-- 评论 -->
				<view class="icon-item icon-item-center" @tap="toRecord(item)">
					<image src="~@/static/square/message.png" mode="" class="foot-image"></image>
					<view class="icon-title">{{ item.moments_info.comments_num || 0 }}</view>
				</view>
				<!-- 打招呼 -->
			<!-- 	<view class="icon-item" @tap="sayHello(item)">
					<image src="~@/static/square/em@3x.png" mode="widthFix" class="foot-image"></image>
					<view class="icon-title">打招呼</view>
				</view> -->
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref
	} from 'vue'
	import {
		onLoad,
		onHide
	} from '@dcloudio/uni-app'
	import PictureDisplay from '@/components/common/PictureDisplay.vue'
	import { praiseMoment } from '@/api/discover.js'
	
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
	const props = defineProps({
		item: {
			type: Object,
			default: () => {},
		},
		listType: {
			type: Number,
			default: 1
		},
		userLocation: {
			type: Object,
			default: null
		},
		cityStore: {
			type: Object,
			default: null
		}
	})

	const emit = defineEmits(["changeShowVip", "playVideo"])

	// 获取性别图标
	const getGenderIcon = (gender) => {
		return gender === '女' ? '/static/find/nd_icon.png' : '/static/find/nand_icon.png'
	}

	// 获取性别样式
	const getGenderStyle = (gender) => {
		if (gender === "女") { // 女性
			return {
				
				background: 'rgba(252, 139, 198, 1)'
			}
		} else { // 男性
			return {
				
				background: 'rgba(19, 98, 235, 1)'
			}
		}
	}


	// 去评论
	const toRecord = (item) => {
		uni.navigateTo({
			url: '/subPackages/record/comment',
			success(res) {
				// 通过eventChannel向被打开页面传送数据
				res.eventChannel.emit('getRecord', {
					data: item
				})
			}
		})
	}

	// 去详情
	const toDetail = (item) => {
		// 只有推荐列表（listType === 1）且有友伴师信息时才跳转详情
		if (props.listType === 1 && item.companion_info) {
			uni.navigateTo({
				url: '/pages/detail/detail',
				animationType: 'slide-in-bottom',
				animationDuration: 200,
				success(res) {
					res.eventChannel.emit('getUserId', {
						val: item.companion_info.id,
						square: 'square'
					})
				}
			})
		}
	}

	// 点赞
	const handlePraise = async (val) => {
		try {
			// 先更新本地状态，提供即时反馈
			const wasPraised = val.moments_info.is_praised
			val.moments_info.is_praised = !wasPraised
			
			if (val.moments_info.is_praised) {
				val.moments_info.praise_num = safeNumberOperation(val.moments_info.praise_num, 'add', 1)
			} else {
				val.moments_info.praise_num = safeNumberOperation(val.moments_info.praise_num, 'subtract', 1)
			}
			
			// 调用API接口
			const response = await praiseMoment({
				target_id: val.moments_info.moments_id
			})
			
			if (response.data && response.data.code === 0) {
				// API调用成功，本地状态已经更新
				console.log('点赞成功')
			} else {
				// API调用失败，回滚本地状态
				val.moments_info.is_praised = wasPraised
				if (wasPraised) {
					val.moments_info.praise_num = safeNumberOperation(val.moments_info.praise_num, 'add', 1)
				} else {
					val.moments_info.praise_num = safeNumberOperation(val.moments_info.praise_num, 'subtract', 1)
				}
				
				uni.showToast({
					title: '点赞失败，请重试',
					icon: 'none'
				})
			}
		} catch (error) {
			console.error('点赞失败:', error)
			// 发生错误，回滚本地状态
			const wasPraised = val.moments_info.is_praised
			val.moments_info.is_praised = !wasPraised
			if (wasPraised) {
				val.moments_info.praise_num = safeNumberOperation(val.moments_info.praise_num, 'add', 1)
			} else {
				val.moments_info.praise_num = safeNumberOperation(val.moments_info.praise_num, 'subtract', 1)
			}
			
			uni.showToast({
				title: '网络错误，请重试',
				icon: 'none'
			})
		}
	}

	// 分享
	const shareToggle = (item) => {
		uni.showToast({
			title: '分享功能开发中',
			icon: 'none'
		})
	}

	// 打招呼
	const sayHello = async (val) => {
		emit('changeShowVip', val)
	}

	// 立即邀约
	const handleInvite = async (item) => {
		try {
			// 获取友伴师信息
			const companionInfo = item.companion_info
			if (!companionInfo || !companionInfo.service_areas || companionInfo.service_areas.length === 0) {
				uni.showToast({
					title: '该友伴师暂无可服务区域',
					icon: 'none'
				})
				return
			}

			// 如果只有一个服务区域，直接使用
			if (companionInfo.service_areas.length === 1) {
				const cityCode = companionInfo.service_areas[0]
				await navigateToDetail(companionInfo.id, cityCode)
				return
			}

			// 使用传入的定位信息
			if (props.userLocation) {
				// 有定位，计算最近的城市
				const nearestCityCode = await findNearestCity(companionInfo.service_areas, props.userLocation.latitude, props.userLocation.longitude)
				await navigateToDetail(companionInfo.id, nearestCityCode, props.userLocation.latitude, props.userLocation.longitude)
			} else {
				// 没有定位，使用第一个服务区域
				const cityCode = companionInfo.service_areas[0]
				await navigateToDetail(companionInfo.id, cityCode)
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
		if (props.cityStore.cityList.length === 0) {
			await props.cityStore.loadCityList()
		}
		console.log('城市列表:', props.cityStore.cityList)
		console.log('城市列表serviceAreas:', serviceAreas)
		// 从城市列表中找到服务区域对应的城市
		const serviceCities = props.cityStore.cityList.filter(city => 
			serviceAreas.includes(city.code.toString())
		)
		
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
				const distance = props.cityStore.calculateDistance(
					userLat,
					userLng,
					city.latitude,
					city.longitude
				)
				
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
		let url = '/subPackages/friend/detail?id=' + partnerId + '&city_code=' + cityCode
		
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
	.square-show {
		margin: 0 24rpx 40rpx;

		.top {
			padding-top: 20rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;

			.top-left {
				display: flex;
			}
    // 强调色（渐变结束色）- 活跃感 + 情绪点缀（心动值图标、红点提醒）
			.invite-btn {
				background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
				color: white;
				border-radius: 32rpx;
				padding: 12rpx 24rpx;
				font-size: 24rpx;
				font-weight: 700;
				
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
						padding: 0rpx 14rpx;
					    box-sizing: border-box;
						border-radius: 9999rpx;
						display: flex;
						align-items: center;
						justify-content: center;

						.gender-icon {
							width: 18rpx;
							height:  18rpx;
							margin-right: 10rpx;
						}

						.introduce-title {
							font-size: 16rpx;
							font-weight: 500;
							color: rgba(255, 255, 255, 1);
						}
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
		}

		.copywriting {
			padding-left: 90rpx;
			padding-top: 20rpx;
			padding-right: 20rpx;
			font-size: 24rpx;
			color: rgba(26, 26, 26, 1);
			box-sizing: border-box;
			overflow: hidden;
		}

		.foot {
			margin-top: 20rpx;
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-left: 90rpx;

			.foot-image {
				width: 44rpx;
				height: 44rpx;
			}

			.foot-right {
				display: flex;
			}

			.icon-item {
				display: flex;
				justify-content: center;
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
				margin-right: 60rpx;
			}
		}
	}
</style>
