<template>
	<view class="container">
		<!-- 主要内容区域 -->
		<view class="content">
			<!-- 头像编辑区域 -->
			<view class="avatar-section">
				<view class="avatar-container" @click="chooseAvatar">
					<image v-if="tempUserInfo.head_img" 
						:src="tempUserInfo.head_img.startsWith('http') ? tempUserInfo.head_img : $imgBaseUrl + tempUserInfo.head_img"
						class="avatar-image" 
						mode="aspectFill" />
					<view v-else class="avatar-placeholder">
						<text class="placeholder-text">头</text>
					</view>
				</view>
				<text class="avatar-tip">点击头像更换</text>
			</view>
			
			<!-- 昵称编辑区域 -->
			<view class="nickname-section">
				<view class="input-group">
					<text class="input-label">昵称</text>
					<input 
						class="nickname-input"
						v-model="tempUserInfo.nick_name"
						placeholder="请输入昵称"
						maxlength="20"
						@input="onNicknameInput"
					/>
					<text class="char-count">{{ tempUserInfo.nick_name.length }}/20</text>
				</view>
				
			
			</view> 
            	<!-- 保存按钮 -->
				<view class="save-section">
					<button class="save-btn" @click="saveChanges">
						<text class="save-text">保存</text>
					</button>
				</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user.js'
import { updateUserBasicInfo } from '@/api/user.js'
import { uploadFile, getUploadResult } from '@/api/file.js'

const userStore = useUserStore()

// 获取用户信息
const userInfo = computed(() => userStore.userInfo || {})

// 临时用户信息，用于编辑
const tempUserInfo = reactive({
	head_img: '',
	nick_name: ''
})

// 原始用户信息，用于比较是否有变化
const originalUserInfo = ref({})

// 是否有变化
const hasChanges = computed(() => {
	return tempUserInfo.head_img !== originalUserInfo.value.head_img ||
		   tempUserInfo.nick_name !== originalUserInfo.value.nick_name
})

onLoad(() => {
	// 获取当前用户信息
	const currentUserInfo = userStore.userInfo || {}
	originalUserInfo.value = { ...currentUserInfo }
	
	// 初始化临时数据 - 确保头像路径正确
	tempUserInfo.head_img = currentUserInfo.head_img || ''
	tempUserInfo.nick_name = currentUserInfo.nick_name || ''
	
	console.log('当前用户头像:', currentUserInfo.head_img)
	console.log('临时头像数据:', tempUserInfo.head_img)
})

// 返回上一页
const goBack = () => {
	if (hasChanges.value) {
		uni.showModal({
			title: '提示',
			content: '有未保存的更改，确定要离开吗？',
			success: (res) => {
				if (res.confirm) {
					uni.navigateBack()
				}
			}
		})
	} else {
		uni.navigateBack()
	}
}

// 头像选择处理
const chooseAvatar = () => {
	uni.chooseImage({
		count: 1, // 只选择1张图片
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: async (res) => {
			const filePath = res.tempFilePaths[0]
			console.log('选择的头像:', filePath)
			
			// 显示上传进度
			uni.showLoading({
				title: '上传中...',
				mask: true
			})
			
			try {
				// 获取文件信息
				const fileInfo = await getFileInfo(filePath)
				console.log("fileInfo", fileInfo)
				console.log("filePath", filePath)
				
				if (!fileInfo || !fileInfo.extension) {
					throw new Error('无法获取文件信息')
				}
				
				// 上传文件
				const uploadResult = await uploadFile({
					filePath: filePath,
					name: `avatar_${Date.now()}.${fileInfo.extension}`
				})
				
				// 解析上传结果
				const fileData = getUploadResult(uploadResult)
				if (!fileData || !fileData.url) {
					throw new Error('上传结果解析失败')
				}
				
				// 更新临时头像为上传后的URL
				tempUserInfo.head_img = fileData.url
				
				uni.showToast({
					title: '头像上传成功',
					icon: 'success'
				})
				
			} catch (uploadError) {
				console.error('头像上传失败:', uploadError)
				uni.showToast({
					title: '头像上传失败，请重试',
					icon: 'none'
				})
			} finally {
				uni.hideLoading()
			}
		},
		fail: (error) => {
			console.error('选择头像失败:', error)
			uni.showToast({
				title: '选择头像失败',
				icon: 'none'
			})
		}
	})
}

// 获取文件信息
const getFileInfo = (filePath) => {
	return new Promise((resolve, reject) => {
		uni.getFileInfo({
			filePath: filePath,
			success: (res) => {
				// 从文件路径中提取扩展名
				const extension = filePath.split('.').pop().toLowerCase()
				resolve({
					size: res.size,
					extension: extension
				})
			},
			fail: (error) => {
				console.error('获取文件信息失败:', error)
				// 如果获取文件信息失败，使用默认扩展名
				const extension = filePath.split('.').pop().toLowerCase() || 'jpg'
				resolve({
					size: 0,
					extension: extension
				})
			}
		})
	})
}

// 昵称输入处理
const onNicknameInput = (e) => {
	const value = e.detail.value
	// 过滤特殊字符，只允许中文、英文、数字
	tempUserInfo.nick_name = value.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '')
}

// 保存更改
const saveChanges = async () => {
	if (!hasChanges.value) {
		uni.showToast({
			title: '没有更改需要保存',
			icon: 'none'
		})
		return
	}
	
	// 验证昵称
	if (!tempUserInfo.nick_name.trim()) {
		uni.showToast({
			title: '请输入昵称',
			icon: 'none'
		})
		return
	}
	
	if (tempUserInfo.nick_name.trim().length < 2) {
		uni.showToast({
			title: '昵称至少2个字符',
			icon: 'none'
		})
		return
	}
	
	try {
		uni.showLoading({
			title: '保存中...'
		})
		
		// 准备更新的数据
		const updateData = {}
		if (tempUserInfo.head_img !== originalUserInfo.value.head_img) {
			updateData.head_img = tempUserInfo.head_img
		}
		if (tempUserInfo.nick_name !== originalUserInfo.value.nick_name) {
			updateData.nick_name = tempUserInfo.nick_name
		}
		
		// 调用接口更新用户信息
		const result = await updateUserBasicInfo(updateData)
		console.log('保存结果:', result.data)
		if (result.data.code === 0) {
			// 更新本地用户信息
			userStore.setUserInfo({
				...userStore.userInfo,
				...updateData
			})
			
			// 更新原始数据
			originalUserInfo.value = { ...userStore.userInfo }
			
			uni.showToast({
				title: '保存成功',
				icon: 'success'
			})
			
			// 延迟返回上一页
			setTimeout(() => {
				uni.navigateBack()
			}, 1500)
		} else { 
            //报错1
			uni.showToast({
				title: result.data.msg || "保存失败或者与其他用户同名了",
				icon: 'none'
			})
		}
		} catch (error) { 
           //报错2
		console.error('保存失败:', error)
		
		// 处理业务错误（如昵称重复）
		if (error && error.data && error.data.code === 400) {
			uni.showToast({
				title: error.data.msg || "保存失败或者与其他用户同名了",
				icon: 'none'
			})
		} else {
			// 处理其他错误
			uni.showToast({
				title: "保存失败，请重试",
				icon: 'none'
			})
		}
	} finally {
		uni.hideLoading()
	}
}
</script>

<style lang="scss" scoped>
.container {
	width: 100vw;
	min-height: 100vh;
	background-color: #f8f8f8;
}

.content {
	margin-top: 32rpx;
	padding: 32rpx;
}



.avatar-section {

	margin-bottom: 32rpx;
	text-align: center;
}

.avatar-container {
	position: relative;
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
	margin: 0 auto 32rpx;
	overflow: hidden;

	display: flex;
	align-items: center;
	justify-content: center;
}

.avatar-image {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

.avatar-placeholder {
	width: 100%;
	height: 100%;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, rgba(115, 99, 255, 0.1) 0%, rgba(255, 105, 222, 0.1) 100%);
}

.placeholder-text {
	color: #999999;
	font-size: 40rpx;
	font-weight: 500;
}



.avatar-tip {
	color: #999999;
	font-size: 28rpx;
}

.nickname-section {
	background-color: #ffffff;
	border-radius: 16rpx;
	padding: 32rpx;

}

.input-group {
	position: relative;
}

.input-label {
	display: block;
	color: #333333;
	font-size: 32rpx;
	font-weight: 500;
	margin-bottom: 32rpx;
}

.nickname-input {
	width: 100%;
	height: 80rpx;
	background-color: #f8f8f8;
	border-radius: 12rpx;
	padding: 0 32rpx;
	color: #333333;
	font-size: 32rpx;
	box-sizing: border-box;
}

.char-count {
	position: absolute;
	right: 32rpx;
	bottom: 32rpx;
	color: #999999;
	font-size: 28rpx;
}

.save-section {
	margin-top: 48rpx;
}

.save-btn {
	width: 100%;
	height: 88rpx;
	background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
	border-radius: 16rpx;
	border: none;
	display: flex;
	align-items: center;
	justify-content: center;
	
	&::after {
		border: none;
	}
}

.save-text {
	color: #ffffff;
	font-size: 32rpx;
	font-weight: 500;
}
</style>