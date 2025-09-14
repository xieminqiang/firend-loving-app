<template>
	<view class="container">
		<view class="settings-list">
			<!-- 头像设置 - 仅登录时显示 -->
			<view v-if="isLogin" class="setting-item" @click="handleAvatarSetting">
				<view class="setting-content flex-between">
					<text class="setting-text">头像设置</text>
					<view class="setting-right flex">
						<view class="user-avatar-container">
							<image v-if="userInfo.head_img" 
							    :src="$imgBaseUrl + userInfo.head_img"
								class="user-avatar-display" 
								mode="aspectFill" />
							<view v-else class="user-avatar-placeholder">
								<text class="avatar-placeholder-text">头</text>
							</view>
						</view>
						<image class="arrow-icon" src="@/static/icons/profile/me_right.png" mode="aspectFit"></image>
					</view>
				</view>
				<view class="divider"></view>
			</view>


			
			
			<!-- 用户昵称 - 仅登录时显示 -->
			<view v-if="isLogin" class="setting-item" @click="handleAvatarSetting">
				<view class="setting-content flex-between">
					<text class="setting-text">昵称</text>
					<view class="setting-right flex">
						<text class="user-nickname">{{ userInfo.nick_name || '未设置昵称' }}</text>
						<image class="arrow-icon" src="@/static/icons/profile/me_right.png" mode="aspectFit"></image>
					</view>
				</view>
				<view class="divider"></view>
			</view> 
			
			
			<!-- 隐私政策 -->
			<view class="setting-item" @click="handlePrivacyPolicy">
				<view class="setting-content flex-between">
					<text class="setting-text">隐私政策</text>
					<image class="arrow-icon" src="@/static/icons/profile/me_right.png" mode="aspectFit"></image>
				</view>
				<view class="divider"></view>
			</view>
			
			<!-- 用户协议 -->
			<view class="setting-item" @click="handleUserAgreement">
				<view class="setting-content flex-between">
					<text class="setting-text">平台服务协议</text>
					<image class="arrow-icon" src="@/static/icons/profile/me_right.png" mode="aspectFit"></image>
				</view>
				<view class="divider"></view>
			</view>
			
			<!-- 关于我们 -->
			<!-- <view class="setting-item" @click="handleAboutUs">
				<view class="setting-content flex-between">
					<text class="setting-text">关于我们</text>
					<image class="arrow-icon" src="@/static/icons/profile/me_right.png" mode="aspectFit"></image>
				</view>
			</view> -->
		</view>
		
		<!-- 退出登录按钮 -->
		<view class="footer-container" v-if="isLogin">
			<view class="logout-btn flex-center" @click="outLogin">
				<text class="logout-text">退出登录</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
	ref,
	reactive,
	computed,
	onMounted,
	onUnmounted
} from 'vue'
import {
	onShow,
	onLoad
} from '@dcloudio/uni-app';
	import { useUserStore } from '@/stores/user.js'
import { useLevelStore } from '@/stores/level.js'
import { updateUserBasicInfo } from '@/api/user.js'

const userStore = useUserStore()
const levelStore = useLevelStore()   
	
	// 使用computed响应式计算登录状态
	const isLogin = computed(() => {
		return userStore.userInfo && Object.keys(userStore.userInfo).length > 0
	})
	
	// 获取用户信息
	const userInfo = computed(() => userStore.userInfo || {})
	
	// 监听登录成功事件
	const handleLoginSuccess = (data) => {
		console.log('设置页面收到登录成功事件:', data)
		// 这里可以添加额外的处理逻辑，比如刷新页面数据
	}
	
	onMounted(() => {
		// 监听登录成功事件
		uni.$on('loginSuccess', handleLoginSuccess)
	})
	
	onUnmounted(() => {
		// 移除事件监听
		uni.$off('loginSuccess', handleLoginSuccess)
	})
	
	onLoad(async () => {
		console.log('设置页面载入')
		console.log('当前用户信息:', userStore.userInfo)
		console.log('登录状态:', isLogin.value)
		console.log('用户昵称:', userInfo.value?.nickname)
		console.log('用户头像:', userInfo.value?.avatar)
	});
	
	// 头像选择处理
	const onChooseAvatar = async (e) => {
		console.log('头像选择事件触发:', e)
		console.log('事件详情:', e.detail)
		
		if (!isLogin.value) {
			uni.showModal({
				title: '提示',
				content: '请先登录后再设置头像',
				confirmText: '去登录',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						uni.navigateTo({
							url: '/subPackages/login/index'
						})
					}
				}
			})
			return
		}
		
		try {
			const { avatarUrl } = e.detail
			console.log('选择的头像:', avatarUrl)
			
			// 显示加载提示
			uni.showLoading({
				title: '上传中...'
			})
			
			// 调用接口更新头像
			const result = await updateUserBasicInfo({
				head_img: avatarUrl
			})
			
			if (result.code === 200) {
				// 更新本地用户信息
				userStore.updateUserInfo({
					...userStore.userInfo,
					head_img: avatarUrl
				})
				
				uni.showToast({
					title: '头像更新成功',
					icon: 'success'
				})
			} else {
				uni.showToast({
					title: result.message || '头像更新失败',
					icon: 'none'
				})
			}
		} catch (error) {
			console.error('头像更新失败:', error)
			uni.showToast({
				title: '头像更新失败',
				icon: 'none'
			})
		} finally {
			uni.hideLoading()
		}
	}
	
	const handleAvatarSetting = () => {
		if (!isLogin.value) {
			uni.showModal({
				title: '提示',
				content: '请先登录后再设置头像',
				confirmText: '去登录',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						uni.navigateTo({
							url: '/subPackages/login/index'
						})
					}
				}
			})
			return
		}
		
		uni.navigateTo({
			url: '/subPackages/settings/pages/index/edit'
		})
	}
	
	const handleNicknameSetting = () => {
		if (!isLogin.value) {
			uni.showModal({
				title: '提示',
				content: '请先登录后再设置昵称',
				confirmText: '去登录',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						uni.navigateTo({
							url: '/subPackages/login/index'
						})
					}
				}
			})
			return
		}
		
		uni.navigateTo({
			url: '/subPackages/settings/pages/index/edit'
		})
	}
	
	const handlePrivacyPolicy = () => {
		uni.navigateTo({
			url: '/subPackages/login/policy'
		})
	}
	
	const handleUserAgreement = () => {
		uni.navigateTo({
			url: '/subPackages/login/agreement'
		})
	}
	
	const handleAboutUs = () => {
		uni.showToast({
			title: '关于我们页面开发中',
			icon: 'none'
		})
	}
	
	const outLogin = () => {
		uni.showModal({
		  title: '提示',
		  content: '确认退出登录？',
		  success: async function (res) {
		    if (!res.confirm) {
		      return;
		    }
		   
		    
		    // 发送退出登录事件，通知其他页面刷新
		    uni.$emit('logoutSuccess')
		    
		    uni.showToast({
		      title: '已退出登录',
		      icon: 'success'
		    })
		    
		    // 返回上一页
		    setTimeout(() => {
		      uni.navigateBack({
		        delta: 1
		      });
			   
		    // 清除用户信息
		    userStore.clearUserInfo()
		    // 清除等级列表缓存，确保下次登录时获取最新数据
		    levelStore.clearServiceLevels()
		    }, 1000)
		  },
		});
	};
</script>

<style lang="scss" scoped>
	@import "@/styles/variables.scss";
	@import "@/styles/common.scss";
	
	.container {
		width: 100vw;
		min-height: 100vh;
		background-color: $bg-color-secondary;
		padding: 0;
	}
	
	.settings-list {
		margin-top: $spacing-base;
		background-color: $bg-color-primary;
		border-radius: $border-radius-lg;
		margin-left: $spacing-base;
		margin-right: $spacing-base;
		overflow: hidden;
		box-shadow: $box-shadow-light;
	}
	
	.setting-item {
		position: relative;
		
		&:first-child {
			.setting-content {
				padding-top: $spacing-lg;
			}
		}
		
		&:last-child {
			.setting-content {
				padding-bottom: $spacing-lg;
			}
			.divider {
				display: none;
			}
		}
	}
	
	.setting-content {
		padding: $spacing-base $spacing-lg;
		min-height: 100rpx;
		transition: background-color $animation-duration-fast;
		
		&:active {
			background-color: $bg-color-secondary;
		}
	}
	
	.setting-right {
		align-items: center;
		gap: 10rpx;
	}
	
	.user-avatar-container {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;

		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		background: $bg-color-secondary;
	}
	
	.user-avatar-display {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}
	
	.user-avatar-placeholder {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, rgba(115, 99, 255, 0.1) 0%, rgba(255, 105, 222, 0.1) 100%);
	}
	
	.avatar-placeholder-text {
		color: $text-color-secondary;
		font-size: 20rpx;
		font-weight: 500;
	}
	
	.setting-text {
		color: $text-color-primary;
		font-size: $font-size-base;
		font-weight: 500;
		line-height: 1.4;
	}
	
	.user-nickname {
		color: $text-color-secondary;
		font-size: $font-size-base;
		font-weight: 400;
		max-width: 240rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	.arrow-icon {
		width: 28rpx;
		height: 28rpx;
	}
	
	.avatar-choose-btn {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		line-height: 1;
		z-index: 10;
		
		&::after {
			border: none;
		}
	}
	
	.divider {
		height: 1rpx;
		background-color: $border-color-light;
		margin-left: $spacing-lg;
		margin-right: $spacing-lg;
	}
	
	.footer-container {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: $spacing-base;
		background-color: $bg-color-primary;
	    box-sizing: border-box;
		padding-bottom: calc(#{$spacing-base} + env(safe-area-inset-bottom));
		z-index: $z-index-fixed;
	}
	
	.logout-btn {
		width: 100%;
		height: 88rpx;
		background-color: $bg-color-tertiary;
		border-radius: $border-radius-xl;
		transition: all $animation-duration-fast;
		
		&:active {
			background-color: #E8E8E8;
			transform: scale(0.98);
		}
	}
	
	.logout-text {
		color: $text-color-primary;
		font-size: $font-size-base;
		font-weight: 500;
	}
</style>