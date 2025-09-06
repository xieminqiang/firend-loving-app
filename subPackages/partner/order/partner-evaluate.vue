<template>
    <view class="partner-evaluate-container">
      <!-- 主内容区域 -->
      <view class="main-content">
        <scroll-view 
          class="scroll-container" 
          scroll-y="true"
        >
          <!-- 用户评价卡片 -->
          <view class="user-comment-card modern-card">
            <view class="card-header">
              <view class="header-content">
                <view class="section-indicator"></view>
                <view class="header-text">
                  <text class="card-title">用户评价</text>
                  <text class="card-subtitle">查看用户的服务体验反馈</text>
                </view>
              </view>
            </view>
            
            <view class="comment-content">
              <!-- 评分显示 -->
              <view class="rating-display">
                <text class="rating-label">用户评分：</text>
                <view class="stars">
                  <text 
                    v-for="i in 5" 
                    :key="i" 
                    class="star"
                    :class="{ active: i <= userComment.rating }"
                  >★</text>
                </view>
                <text class="rating-text">{{ userComment.rating }}分</text>
              </view>
              
              <!-- 评价文字 -->
              <view class="comment-text-section">
                <text class="comment-text">{{ userComment.comment }}</text>
              </view>
              
              <!-- 评价图片 -->
              <view v-if="userComment.comment_images && userComment.comment_images.length > 0" class="comment-images-section">
                <view class="images-grid">
                  <view 
                    v-for="(image, index) in userComment.comment_images" 
                    :key="index"
                    class="image-item"
                    @click="previewUserImage(index)"
                  >
                    <image :src="proxy.$imgBaseUrl + image" class="comment-image" mode="aspectFill" />
                  </view>
                </view>
              </view>
              
              <!-- 评价时间 -->
              <view class="comment-time">
                <text class="time-text">{{ formatTime(userComment.comment_time) }}</text>
              </view>
            </view>
          </view>
  
          <!-- 友伴师回复卡片 -->
          <view v-if="companionReply" class="companion-reply-card modern-card">
            <view class="card-header">
              <view class="header-content">
                <view class="section-indicator reply-indicator"></view>
                <view class="header-text">
                  <text class="card-title">我的回复</text>
                  <text class="card-subtitle">您已回复此评价</text>
                </view>
              </view>
            </view>
            
            <view class="reply-content">
              <view class="reply-text-section">
                <text class="reply-text">{{ companionReply.comment }}</text>
              </view>
              
              <!-- 回复图片 -->
              <view v-if="companionReply.comment_images && companionReply.comment_images.length > 0" class="reply-images-section">
                <view class="images-grid">
                  <view 
                    v-for="(image, index) in companionReply.comment_images" 
                    :key="index"
                    class="image-item"
                    @click="previewReplyImage(index)"
                  >
                    <image :src="proxy.$imgBaseUrl + image" class="reply-image" mode="aspectFill" />
                  </view>
                </view>
              </view>
              
              <!-- 回复时间 -->
              <view class="reply-time">
                <text class="time-text">{{ formatTime(companionReply.comment_time) }}</text>
              </view>
            </view>
          </view>
  
          <!-- 回复输入卡片 -->
          <view v-if="!companionReply" class="reply-input-card modern-card">
            <view class="card-header">
              <view class="header-content">
                <view class="section-indicator"></view>
                <view class="header-text">
                  <text class="card-title">回复评价</text>
                  <text class="card-subtitle">感谢用户评价，及时回复提升服务质量</text>
                </view>
              </view>
            </view>
            
            <view class="reply-input-content">
              <!-- 回复输入框 -->
              <view class="input-section">
                <textarea 
                  v-model="replyText"
                  placeholder="请回复用户的评价，表达感谢或说明情况..." 
                  placeholder-class="input-placeholder"
                  class="reply-textarea"
                  maxlength="200"
                  :show-confirm-bar="false"
                />
                <view class="char-count">{{ replyText.length }}/200</view>
              </view>
              
              <!-- 图片上传区域 -->
              <view class="photo-section">
                <view class="photo-title">
                  <text class="title-text">上传图片</text>
                  <text class="title-desc">最多上传3张图片</text>
                </view>
                
                <view class="photo-gallery">
                  <view 
                    class="photo-item" 
                    v-for="(photo, index) in photos" 
                    :key="index"
                    @click="previewPhoto(index)"
                  >
                    <image :src="proxy.$imgBaseUrl + photo" class="photo-img" mode="aspectFill" />
                    <view class="photo-overlay">
                      <view class="photo-remove" @click.stop="deletePhoto(index)">
                        <text class="remove-text">×</text>
                      </view>
                    </view>
                  </view>
                  
                  <view 
                    class="photo-add" 
                    v-if="photos.length < 3"
                    @click="addPhoto"
                  >
                    <view class="add-content">
                      <view class="add-icon-circle">
                        <image src="@/static/icons/common/add_icon.png" class="add-icon" mode="aspectFit" />
                      </view>
                      <text class="add-text">添加图片</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>
  
          <view style="height: 200rpx;"></view>
        </scroll-view>
      </view>
  
      <!-- 底部固定提交按钮 -->
      <view v-if="!companionReply" class="bottom-submit-section">
        <view class="submit-button-container">
          <view 
            class="bottom-submit-btn" 
            :class="{ disabled: isSubmitting || !canSubmit }"
            @click="submitReply"
          >
            <view class="submit-btn-content">
              <view v-if="isSubmitting" class="submit-loading">
                <view class="loading-dots">
                  <view class="dot"></view>
                  <view class="dot"></view>
                  <view class="dot"></view>
                </view>
              </view>
  
              <text class="submit-btn-text" v-if="!isSubmitting">提交回复</text>
              <text class="submit-btn-text" v-else>提交中...</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </template>
  
  <script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { uploadFile, getUploadResult } from '@/api/file.js'
import { createOrderComment, getOrderCommentList } from '@/api/order.js'

// 获取全局属性
const { proxy } = getCurrentInstance()
  
  // 页面参数
  const orderId = ref('')
  const companionId = ref('')
  
  // 评价数据
  const userComment = ref({})
  const companionReply = ref(null)
  const replyText = ref('')
  const photos = ref([])
  
  // 提交状态
  const isSubmitting = ref(false)
  
  // 计算属性：是否可以提交
  const canSubmit = computed(() => {
    return replyText.value.trim().length > 0
  })
  
  // 页面加载
  onLoad((options) => {
    if (options.orderId) {
      orderId.value = options.orderId
    }
    if (options.companion_id) {
      companionId.value = options.companion_id
    }
    loadCommentList()
  })
  
  // 加载评价列表
  const loadCommentList = async () => {
    try {
      uni.showLoading({ title: '加载中...' })
      
      const response = await getOrderCommentList({ order_id: Number(orderId.value) })
      
      if (response.data.code === 0) {
        const commentList = response.data.data.list || []
        
        // 分离用户评价和友伴师回复
        userComment.value = commentList.find(item => item.is_companion === 0) || {}
        companionReply.value = commentList.find(item => item.is_companion === 1) || null
        
        console.log('用户评价:', userComment.value)
        console.log('友伴师回复:', companionReply.value)
      } else {
        throw new Error(response.data.msg || '获取评价失败')
      }
    } catch (error) {
      console.error('加载评价失败:', error)
      uni.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      })
    } finally {
      uni.hideLoading()
    }
  }
  
  // 添加图片
  const addPhoto = () => {
    const maxCount = 3 - photos.value.length
    if (maxCount <= 0) {
      uni.showToast({
        title: '最多只能上传3张图片',
        icon: 'none'
      })
      return
    }
  
    uni.chooseImage({
      count: maxCount,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        // 显示上传进度
        uni.showLoading({
          title: '上传中...',
          mask: true
        })
  
        try {
          // 逐个上传文件
          const uploadPromises = res.tempFilePaths.map(async (filePath, index) => {
            try {
              // 获取文件信息
              const fileInfo = await getFileInfo(filePath)
              if (!fileInfo || !fileInfo.extension) {
                throw new Error('无法获取文件信息')
              }
              
              // 上传文件
              const uploadResult = await uploadFile({
                filePath: filePath,
                name: `reply_${Date.now()}_${index}.${fileInfo.extension}`
              })
  
              // 解析上传结果
              const fileData = getUploadResult(uploadResult)
              if (!fileData || !fileData.url) {
                throw new Error('上传结果解析失败')
              }
  
              // 返回上传后的URL
              return fileData.url
            } catch (error) {
              console.error(`第${index + 1}张图片上传失败:`, error)
              throw error
            }
          })
  
          // 等待所有文件上传完成
          const uploadedUrls = await Promise.all(uploadPromises)
          
          // 将上传成功的URL添加到图片数组
          photos.value.push(...uploadedUrls)
          
          uni.showToast({
            title: `成功上传${uploadedUrls.length}张图片`,
            icon: 'success'
          })
  
        } catch (error) {
          console.error('图片上传失败:', error)
          uni.showToast({
            title: '图片上传失败，请重试',
            icon: 'none'
          })
        } finally {
          uni.hideLoading()
        }
      },
      fail: (error) => {
        console.error('选择图片失败:', error)
        uni.showToast({
          title: '选择图片失败',
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
  
  // 预览图片
  const previewPhoto = (index) => {
    const urls = photos.value.map(photo => proxy.$imgBaseUrl + photo)
    uni.previewImage({
      urls: urls,
      current: index
    })
  }
  
  // 删除图片
  const deletePhoto = (index) => {
    photos.value.splice(index, 1)
  }
  
  // 预览用户评价图片
  const previewUserImage = (index) => {
    const urls = userComment.value.comment_images.map(img => proxy.$imgBaseUrl + img)
    uni.previewImage({
      urls: urls,
      current: index
    })
  }
  
  // 预览回复图片
  const previewReplyImage = (index) => {
    const urls = companionReply.value.comment_images.map(img => proxy.$imgBaseUrl + img)
    uni.previewImage({
      urls: urls,
      current: index
    })
  }
  
  // 提交回复
  const submitReply = async () => {
    if (!canSubmit.value || isSubmitting.value) {
      return
    }
  
    isSubmitting.value = true
    
    try {
      // 构建回复数据，按照API接口要求
      const replyData = {
        order_id: parseInt(orderId.value),
        rating: 0, // 友伴师回复不需要评分
        comment: replyText.value.trim(),
        comment_images: photos.value,
        is_anonymous: 0, // 友伴师回复不匿名
        is_companion: 1 // 标识这是友伴师回复
      }
      
      console.log('提交回复数据:', replyData)
      
      // 调用评价提交API
      const response = await createOrderComment(replyData)
      
      if (response.data && response.data.code === 0) {
        uni.showToast({
          title: '回复提交成功',
          icon: 'success',
          duration: 2000
        })
        
        // 延迟返回上一页
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } else {
        throw new Error(response.data?.msg || '回复提交失败')
      }
      
    } catch (error) {
      console.error('提交回复失败:', error)
      uni.showToast({
        title: error.data?.msg || '提交失败，请重试',
        icon: 'none'
      })
    } finally {
      isSubmitting.value = false
    }
  }
  
  // 格式化时间
  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    
    const date = new Date(timeStr)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }
  </script>
  
  <style lang="scss" scoped>
  .partner-evaluate-container {
    height: 100vh;
    background: linear-gradient(180deg, #f8f9fe 0%, #ffffff 100%);
    display: flex;
    flex-direction: column;
  }
  
  .main-content {
    flex: 1;
    overflow: hidden;
  }
  
  .scroll-container {
    width: 100%;
    height: 100%;
  }
  
  /* 现代卡片样式 */
  .modern-card {
    background: white;
    border-radius: 18rpx;
    margin: 20rpx;
    box-shadow: 0 4rpx 18rpx rgba(115, 99, 255, 0.06);
    border: 1rpx solid rgba(115, 99, 255, 0.08);
    overflow: hidden;
    position: relative;
  }
  
  .card-header {
    padding: 26rpx 20rpx 20rpx;
    display: flex;
    align-items: flex-start;
    position: relative;
    
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 20rpx;
      right: 20rpx;
      height: 1rpx;
      background: linear-gradient(90deg, rgba(115, 99, 255, 0.1) 0%, rgba(255, 105, 222, 0.1) 100%);
    }
  }
  
  .header-content {
    display: flex;
    align-items: center;
  }
  
  .section-indicator {
    width: 6rpx;
    height: 32rpx;
    background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
    border-radius: 3rpx;
    margin-right: 20rpx;
    box-shadow: 0 2rpx 8rpx rgba(115, 99, 255, 0.3);
    align-self: center;
  }
  
  .reply-indicator {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  }
  
  .header-text {
    flex: 1;
  }
  
  .card-title {
    font-size: 28rpx;
    font-weight: 500;
    color: #1A1A1A;
    margin-bottom: 6rpx;
    letter-spacing: 0.3rpx;
    line-height: 1.3;
  }
  
  .card-subtitle {
    font-size: 22rpx;
    color: #666666;
    opacity: 0.8;
    line-height: 1.4;
    margin-left: 20rpx;
  }
  
  /* 用户评价内容样式 */
  .comment-content {
    padding: 20rpx;
  }
  
  .rating-display {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 20rpx;
  }
  
  .rating-label {
    font-size: 24rpx;
    color: #666666;
    font-weight: 500;
  }
  
  .stars {
    display: flex;
    gap: 4rpx;
  }
  
  .star {
    font-size: 32rpx;
    color: #e0e0e0;
    transition: color 0.3s;
  }
  
  .star.active {
    color: #ffd700;
  }
  
  .rating-text {
    font-size: 24rpx;
    color: #7363FF;
    font-weight: 600;
  }
  
  .comment-text-section {
    margin-bottom: 20rpx;
  }
  
  .comment-text {
    font-size: 26rpx;
    color: #1A1A1A;
    line-height: 1.6;
    word-break: break-all;
  }
  
  .comment-images-section {
    margin-bottom: 20rpx;
  }
  
  .images-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12rpx;
  }
  
  .image-item {
    aspect-ratio: 1;
    border-radius: 12rpx;
    overflow: hidden;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  }
  
  .comment-image {
    width: 100%;
    height: 100%;
  }
  
  .comment-time {
    text-align: right;
  }
  
  .time-text {
    font-size: 22rpx;
    color: #999999;
  }
  
  /* 友伴师回复样式 */
  .reply-content {
    padding: 20rpx;
  }
  
  .reply-text-section {
    margin-bottom: 20rpx;
  }
  
  .reply-text {
    font-size: 26rpx;
    color: #1A1A1A;
    line-height: 1.6;
    word-break: break-all;
  }
  
  .reply-images-section {
    margin-bottom: 20rpx;
  }
  
  .reply-image {
    width: 100%;
    height: 100%;
  }
  
  .reply-time {
    text-align: right;
  }
  
  /* 回复输入样式 */
  .reply-input-content {
    padding: 20rpx;
  }
  
  .input-section {
    position: relative;
    margin-bottom: 24rpx;
  }
  
  .reply-textarea {
    width: 100%;
    height: 160rpx;
    background: #f8f9fe;
    border: 2rpx solid #e9ecf5;
    border-radius: 14rpx;
    padding: 20rpx;
    font-size: 26rpx;
    color: #1A1A1A;
    transition: all 0.3s;
    box-sizing: border-box;
  }
  
  .reply-textarea:focus {
    border-color: #7363FF;
    background: rgba(115, 99, 255, 0.05);
  }
  
  .char-count {
    position: absolute;
    bottom: 16rpx;
    right: 20rpx;
    font-size: 22rpx;
    color: #999999;
  }
  
  .input-placeholder {
    color: #999999;
    font-size: 26rpx;
  }
  
  /* 图片上传区域样式 */
  .photo-section {
    margin-top: 24rpx;
  }
  
  .photo-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16rpx;
  }
  
  .title-text {
    font-size: 24rpx;
    color: #1A1A1A;
    font-weight: 500;
  }
  
  .title-desc {
    font-size: 22rpx;
    color: #999999;
  }
  
  .photo-gallery {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14rpx;
  }
  
  .photo-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  }
  
  .photo-img {
    width: 100%;
    height: 100%;
  }
  
  .photo-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  .photo-item:active .photo-overlay {
    opacity: 0.8;
  }
  
  .photo-remove {
    position: absolute;
    top: 12rpx;
    right: 12rpx;
    width: 40rpx;
    height: 40rpx;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
  }
  
  .remove-text {
    font-size: 24rpx;
    color: #ff4757;
    font-weight: bold;
  }
  
  .photo-add {
    position: relative;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f8f9fe 0%, #ffffff 100%);
    border: 3rpx dashed rgba(115, 99, 255, 0.3);
    border-radius: 20rpx;
    transition: all 0.3s;
    overflow: hidden;
  }
  
  .photo-add:active {
    transform: scale(0.95);
    border-color: #7363FF;
    background: rgba(115, 99, 255, 0.05);
    
    .add-icon-circle {
      transform: scale(1.1);
    }
  }
  
  .add-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
  }
  
  .add-icon-circle {
    width: 70rpx;
    height: 70rpx;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .add-icon {
    width: 32rpx;
    height: 32rpx;
    opacity: 0.9;
  }
  
  .add-text {
    font-size: 24rpx;
    color: #666666;
    font-weight: 600;
    letter-spacing: 0.5rpx;
  }
  
  /* 底部提交按钮样式 */
  .bottom-submit-section {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 248, 250, 0.95) 100%);
    backdrop-filter: blur(20rpx);
    -webkit-backdrop-filter: blur(20rpx);
    padding: 20rpx 32rpx calc(20rpx + env(safe-area-inset-bottom));
    border-top: 1rpx solid rgba(115, 99, 255, 0.1);
    box-shadow: 0 -4rpx 20rpx rgba(115, 99, 255, 0.1);
    z-index: 100;
  }
  
  .submit-button-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .bottom-submit-btn {
    width: 100%;
    max-width: 600rpx;
    background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
    border-radius: 24rpx;
    padding: 20rpx 32rpx;
    transition: all 0.3s ease;
    box-shadow: 0 4rpx 12rpx rgba(115, 99, 255, 0.3);
    
    &:active:not(.disabled) {
      transform: scale(0.95);
      box-shadow: 0 2rpx 8rpx rgba(115, 99, 255, 0.4);
    }
    
    &.disabled {
      opacity: 0.6;
      transform: none !important;
      box-shadow: 0 2rpx 8rpx rgba(115, 99, 255, 0.2);
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