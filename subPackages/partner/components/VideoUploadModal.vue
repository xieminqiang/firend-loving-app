<template>
  <!-- 视频上传弹框 -->
  <view v-if="show" class="video-upload-overlay" @click="handleOverlayClick">
    <view class="video-upload-container" @click.stop>
      <!-- 弹框头部 -->
      <view class="modal-header">
        <view class="header-content">
          <view class="header-icon">🎬</view>
          <view class="header-text">
            <text class="modal-title">上传自我介绍视频</text>
            <text class="modal-subtitle">展示你的专业能力和个人魅力</text>
          </view>
        </view>
        <view class="close-btn" @click="handleClose">
          <text class="close-icon">✕</text>
        </view>
      </view>

      <!-- 弹框内容 -->
      <view class="modal-content">
        <!-- 视频状态显示 -->
        <view class="video-status-section" v-if="applicationInfo && applicationInfo.intro_video_url">
          <view class="status-badge" :class="getStatusBadgeClass(applicationInfo.video_review_status)">
            <text class="status-text">{{ getVideoStatusText(applicationInfo.video_review_status) }}</text>
          </view>
          <text class="status-desc">{{ getVideoStatusDesc(applicationInfo.video_review_status) }}</text>
        </view>

        <!-- 视频预览区域 -->
        <view class="video-preview-section">
          <!-- 已有视频时显示预览 -->
          <view v-if="videoUrl && videoUrl != ''" class="video-preview">
            <video 
              :src="videoUrl" 
              class="preview-video"
              controls
              show-center-play-btn
              show-play-btn
              show-fullscreen-btn
              show-progress
              enable-progress-gesture
            ></video>
            <view class="video-actions">
              <view class="video-action-btn replace-btn" @click="selectVideo">
                <text class="video-btn-text">重新上传</text>
              </view>
            </view>
          </view>
          
          <!-- 无视频时显示上传区域 -->
          <view v-else class="video-upload-area" @click="selectVideo">
            <view class="upload-content">
              <view class="upload-icon">📹</view>
              <text class="upload-title">上传自我介绍视频</text>
              <text class="upload-desc">支持MP4格式，时长3-60秒</text>
              <view class="upload-requirements">
                <text class="requirement-item">• 视频时长：3-60秒</text>
                <text class="requirement-item">• 文件大小：不超过500MB</text>
                <text class="requirement-item">• 格式要求：MP4</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 上传进度 -->
        <view v-if="isUploading" class="upload-progress">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: uploadProgress + '%' }"></view>
          </view>
          <text class="progress-text">上传中... {{ uploadProgress }}%</text>
        </view>
      </view>

      <!-- 弹框底部 -->
      <view class="modal-footer">
        <view class="footer-actions">
          <view class="cancel-btn" @click="handleClose">
            <text class="modal-btn-text">取消</text>
          </view>
          <view 
            class="submit-btn" 
            :class="{ disabled: !videoUrl || isUploading }"
            @click="submitVideo"
          >
            <text class="modal-btn-text" v-if="applicationInfo && applicationInfo.intro_video_url" >{{ isUploading ? '上传中...' : '重新提交' }}</text>
            <text class="modal-btn-text" v-else >{{ isUploading ? '上传中...' : '提交审核' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import { uploadCompanionVideo } from '@/api/user.js'
import { uploadFile, getUploadResult } from '@/api/file.js'

// 定义props
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  applicationInfo: {
    type: Object,
    default: null
  }
})

// 定义emits
const emit = defineEmits(['close', 'success'])

// 视频上传相关状态
const videoUrl = ref('')
const isUploading = ref(false)
const uploadProgress = ref(0)

// 监听show变化，初始化视频URL
watch(() => props.show, (newVal) => {
  if (newVal && props.applicationInfo && props.applicationInfo.intro_video_url) {
    videoUrl.value = props.applicationInfo.intro_video_url
  } else if (!newVal) {
    // 关闭时重置状态
    if (!props.applicationInfo?.intro_video_url) {
      videoUrl.value = ''
    }
    isUploading.value = false
    uploadProgress.value = 0
  }
})

// 处理遮罩层点击
const handleOverlayClick = () => {
  handleClose()
}

// 关闭弹框
const handleClose = () => {
  emit('close')
}

// 选择视频
const selectVideo = () => {
  // 重置当前选择的视频URL
  videoUrl.value = ''
  
  uni.chooseVideo({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    maxDuration: 60,
    camera: 'back',
    success: async (res) => {
      const tempFilePath = res.tempFilePath
      const duration = res.duration
      const size = res.size
      
      // 验证视频时长
      if (duration < 3 || duration > 60) {
        uni.showToast({
          title: '视频时长必须在3-60秒之间',
          icon: 'none'
        })
        return
      }
      
      // 验证文件大小（500MB = 500 * 1024 * 1024 bytes）
      if (size > 500 * 1024 * 1024) {
        uni.showToast({
          title: '视频文件大小不能超过500MB',
          icon: 'none'
        })
        return
      }
      
      // 显示上传进度
      uni.showLoading({
        title: '上传中...',
        mask: true
      })
      
      try {
        // 获取文件信息
        const fileInfo = await getFileInfo(tempFilePath)
        
        // 上传文件
        const uploadResult = await uploadFile({
          filePath: tempFilePath,
          name: `intro_video_${Date.now()}.${fileInfo.extension}`
        })
        
        // 解析上传结果
        const fileData = getUploadResult(uploadResult)
        if (!fileData || !fileData.url) {
          throw new Error('上传结果解析失败')
        }
        
        // 设置视频URL
        videoUrl.value = "https://sygx-server-bucket-admin.oss-cn-shanghai.aliyuncs.com" + fileData.url
        uni.hideLoading()
      } catch (error) {
        uni.hideLoading()
        console.error('视频上传失败:', error)
        uni.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        })
      }
    },
    fail: (error) => {
      console.error('选择视频失败:', error)
      if (error.errMsg && !error.errMsg.includes('cancel')) {
        uni.showToast({
          title: '选择视频失败',
          icon: 'none'
        })
      }
    }
  })
}

// 提交视频
const submitVideo = async () => {
  if (!videoUrl.value) {
    uni.showToast({
      title: '请先选择视频',
      icon: 'none'
    })
    return
  }
  
  if (isUploading.value) {
    return
  }
  
  try {
    uni.showLoading({ title: '提交审核中...' })
    
    const response = await uploadCompanionVideo({
      intro_video_url: videoUrl.value
    })
    
    // 如果执行到这里，说明请求成功且没有业务错误
    uni.hideLoading()
    uni.showToast({
      title: '视频提交成功，等待审核',
      icon: 'success'
    })
    
    // 关闭弹框
    handleClose()
    
    // 发送成功事件
    emit('success', {
      type: 'video_uploaded',
      message: '视频已提交审核'
    })
    
  } catch (error) {
    uni.hideLoading()
    console.error('提交视频失败:', error)
    // 网络错误或其他未处理的错误
    if (!error.data) {
      uni.showToast({
        title: '提交失败，请重试',
        icon: 'none'
      })
    }
  }
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
        const extension = filePath.split('.').pop().toLowerCase() || 'mp4'
        resolve({
          size: 0,
          extension: extension
        })
      }
    })
  })
}

// 获取视频状态文本
const getVideoStatusText = (status) => {
  switch (status) {
    case 'pending':
      return '待审核'
    case 'approved':
      return '已通过'
    case 'rejected':
      return '已拒绝'
    default:
      return '未知状态'
  }
}

// 获取视频状态描述
const getVideoStatusDesc = (status) => {
  switch (status) {
    case 'pending':
      return '您的视频正在审核中，请耐心等待'
    case 'approved':
      return '视频审核已通过，可以正常上线接单'
    case 'rejected':
      return props.applicationInfo.remark != "" ? ('原因：' + props.applicationInfo.remark):'视频审核未通过，请重新上传'
    default:
      return '请上传自我介绍视频'
  }
}

// 获取状态标签样式类
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending':
      return 'status-pending'
    case 'approved':
      return 'status-approved'
    case 'rejected':
      return 'status-rejected'
    default:
      return ''
  }
}
</script>

<style lang="scss" scoped>
// 视频上传弹框样式
.video-upload-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8rpx);
  -webkit-backdrop-filter: blur(8rpx);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    transform: translateY(100rpx);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}

.video-upload-container {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 248, 250, 0.95) 100%);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-radius: 32rpx;
  width: 85%;
  max-width: 640rpx;
  max-height: 80vh;
  box-shadow: 0 20rpx 60rpx rgba(115, 99, 255, 0.2);
  border: 1rpx solid rgba(115, 99, 255, 0.1);
  animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 32rpx 32rpx 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  border-bottom: 1rpx solid rgba(115, 99, 255, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.header-icon {
  width: 60rpx;
  height: 60rpx;
  background: linear-gradient(135deg, rgba(115, 99, 255, 0.1) 0%, rgba(255, 105, 222, 0.1) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  margin-right: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(115, 99, 255, 0.2);
}

.header-text {
  flex: 1;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8rpx;
  display: block;
  line-height: 1.3;
}

.modal-subtitle {
  font-size: 24rpx;
  color: #666666;
  display: block;
  line-height: 1.4;
}

.close-btn {
  width: 48rpx;
  height: 48rpx;
  background: linear-gradient(135deg, rgba(115, 99, 255, 0.1) 0%, rgba(255, 255, 255, 0.8) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #666666;
  font-weight: 600;
  transition: all 0.3s;
  border: 1rpx solid rgba(115, 99, 255, 0.15);
  flex-shrink: 0;
  
  &:active {
    transform: scale(0.9);
    background: linear-gradient(135deg, rgba(115, 99, 255, 0.15) 0%, rgba(255, 255, 255, 0.9) 100%);
  }
}

.close-icon {
  font-size: 24rpx;
  font-weight: 600;
}

.modal-content {
  flex: 1;
  padding: 24rpx 32rpx;
  overflow-y: auto;
}

.video-status-section {
  margin-bottom: 32rpx;
  padding: 20rpx;
  background: linear-gradient(135deg, rgba(115, 99, 255, 0.05) 0%, rgba(255, 105, 222, 0.05) 100%);
  border-radius: 16rpx;
  border: 1rpx solid rgba(115, 99, 255, 0.1);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  margin-bottom: 12rpx;
  font-size: 24rpx;
  font-weight: 600;
  
  &.status-pending {
    background: linear-gradient(135deg, rgba(255, 149, 0, 0.1) 0%, rgba(255, 149, 0, 0.2) 100%);
    color: #FF9500;
    border: 1rpx solid rgba(255, 149, 0, 0.3);
  }
  
  &.status-approved {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.2) 100%);
    color: #4CAF50;
    border: 1rpx solid rgba(76, 175, 80, 0.3);
  }
  
  &.status-rejected {
    background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.2) 100%);
    color: #F44336;
    border: 1rpx solid rgba(244, 67, 54, 0.3);
  }
}

.status-text {
  font-size: 24rpx;
  font-weight: 600;
}

.status-desc {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.4;
  display: block;
}

.video-preview-section {
  margin-bottom: 32rpx;
}

.video-preview {
  position: relative;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 20rpx;
}

.preview-video {
  width: 100%;
  height: 300rpx;
  object-fit: cover;
  background: #000000;
}

.video-actions {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  display: flex;
  gap: 12rpx;
}

.video-action-btn {
  padding: 12rpx 20rpx;
  border-radius: 24rpx;
  font-size: 22rpx;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10rpx);
  -webkit-backdrop-filter: blur(10rpx);
  
  &.replace-btn {
    background: rgba(115, 99, 255, 0.9);
    color: #FFFFFF;
    border: 1rpx solid rgba(255, 255, 255, 0.2);
  }
  
  &.delete-btn {
    background: rgba(244, 67, 54, 0.9);
    color: #FFFFFF;
    border: 1rpx solid rgba(255, 255, 255, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.video-btn-text {
  font-size: 22rpx;
  font-weight: 500;
}

.video-upload-area {
  border: 3rpx dashed rgba(115, 99, 255, 0.3);
  border-radius: 20rpx;
  background: linear-gradient(135deg, rgba(115, 99, 255, 0.02) 0%, rgba(255, 105, 222, 0.02) 100%);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:active {
    transform: scale(0.98);
    border-color: #7363FF;
    background: linear-gradient(135deg, rgba(115, 99, 255, 0.05) 0%, rgba(255, 105, 222, 0.05) 100%);
  }
}

.upload-content {
  padding: 60rpx 40rpx;
  text-align: center;
}

.upload-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
  display: block;
  opacity: 0.8;
}

.upload-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 12rpx;
  display: block;
}

.upload-desc {
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 24rpx;
  display: block;
}

.upload-requirements {
  text-align: left;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12rpx;
  padding: 20rpx;
  border: 1rpx solid rgba(115, 99, 255, 0.1);
}

.requirement-item {
  font-size: 22rpx;
  color: #666666;
  margin-bottom: 8rpx;
  display: block;
  line-height: 1.4;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.upload-progress {
  margin-bottom: 24rpx;
}

.progress-bar {
  background: rgba(115, 99, 255, 0.1);
  border-radius: 12rpx;
  height: 8rpx;
  overflow: hidden;
  margin-bottom: 12rpx;
  position: relative;
}

.progress-fill {
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  height: 100%;
  border-radius: 12rpx;
  transition: width 0.3s ease;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    animation: shimmer 2s infinite;
  }
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  font-size: 24rpx;
  color: #1A1A1A;
  font-weight: 500;
  text-align: center;
  display: block;
}

.modal-footer {
  padding: 24rpx 32rpx 32rpx;
  border-top: 1rpx solid rgba(115, 99, 255, 0.1);
  background: rgba(255, 255, 255, 0.8);
}

.footer-actions {
  display: flex;
  gap: 20rpx;
}

.cancel-btn {
  flex: 1;
  height: 80rpx;
  background: linear-gradient(135deg, rgba(248, 249, 254, 0.8) 0%, rgba(240, 240, 240, 0.8) 100%);
  border: 1rpx solid rgba(115, 99, 255, 0.2);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 500;
  color: #666666;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  backdrop-filter: blur(10rpx);
  -webkit-backdrop-filter: blur(10rpx);
  
  &:active {
    transform: scale(0.96);
    background: linear-gradient(135deg, rgba(240, 240, 240, 0.9) 0%, rgba(230, 230, 230, 0.9) 100%);
  }
}

.submit-btn {
  flex: 2;
  height: 80rpx;
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  color: #FFFFFF;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: 0 6rpx 20rpx rgba(115, 99, 255, 0.3);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  &.disabled {
    background: linear-gradient(135deg, #CCCCCC 0%, #BBBBBB 100%);
    box-shadow: 0 3rpx 12rpx rgba(0, 0, 0, 0.1);
    color: #999999;
    
    &::before {
      display: none;
    }
  }
  
  &:active:not(.disabled) {
    transform: scale(0.96);
    box-shadow: 0 4rpx 16rpx rgba(115, 99, 255, 0.4);
    
    &::before {
      left: 100%;
    }
  }
}

.modal-btn-text {
  font-size: 28rpx;
  font-weight: 600;
  position: relative;
  z-index: 2;
}
</style> 