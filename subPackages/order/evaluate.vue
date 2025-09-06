<template>
    <view class="evaluate-container">
      <!-- 主内容区域 -->
      <view class="main-content">
        <scroll-view 
          class="scroll-container" 
          scroll-y="true"
        >
          <!-- 服务信息卡片 -->
          <view class="service-card modern-card">
            <view class="card-header">
              <view class="header-content">
                <view class="section-indicator"></view>
                <view class="header-text">
                  <text class="card-title">服务信息</text>
                  <text class="card-subtitle">为这次服务体验打分</text>
                </view>
              </view>
            </view>
            
            <view class="service-info">
              <image :src="$imgBaseUrl + serviceImage" class="service-image" mode="aspectFill" />
              <view class="service-details">
                <text class="service-name">{{ serviceName }}</text>
                <view class="rating-section">
                  <text class="rating-label">服务评分：</text>
                  <u-rate
                    v-model="rating" 
                    color="#999999" 
                    active-color="#7363FF" 
                    :is-fill="false"
                    size="20"
                 ></u-rate>
                  <text class="rating-text">{{ rating }}分</text>
                </view>
              </view>
            </view>
          </view>
  
          <!-- 评价内容卡片 -->
          <view class="evaluate-card modern-card">
            <view class="card-header">
              <view class="header-content">
                <view class="section-indicator"></view>
                <view class="header-text">
                  <text class="card-title">评价内容</text>
                  <text class="card-subtitle">分享真实体验，助力他人选伴</text>
                </view>
              </view>
            </view>
            
            <view class="evaluate-content">
              <!-- 评价输入框 -->
              <view class="input-section">
                <textarea 
                  v-model="evaluateText"
                  placeholder="请分享您的服务体验感受..." 
                  placeholder-class="input-placeholder"
                  class="evaluate-textarea"
                  maxlength="200"
                  :show-confirm-bar="false"
                />
                <view class="char-count">{{ evaluateText.length }}/200</view>
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
                    <image :src="$imgBaseUrl + photo" class="photo-img" mode="aspectFill" />
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
  
          <!-- 匿名设置卡片 -->
          <view class="anonymous-card modern-card">
            <view class="card-header">
              <view class="header-content">
                <view class="section-indicator"></view>
                <view class="header-text">
                  <text class="card-title">评价设置</text>
                  <text class="card-subtitle">保护您的隐私</text>
                </view>
              </view>
            </view>
            
            <view class="anonymous-setting">
              <view class="setting-item" @click="toggleAnonymous">
                <view class="setting-left">
            
                  <view class="setting-text">
                    <text class="setting-title">匿名评价</text>
                    <text class="setting-desc">隐藏用户名称、头像</text>
                  </view>
                </view>
                <view class="setting-toggle" :class="{ active: isAnonymous }">
                  <view class="toggle-circle"></view>
                </view>
              </view>
            </view>
          </view>
  
          <view style="height: 200rpx;"></view>
        </scroll-view>
      </view>
  
      <!-- 底部固定提交按钮 -->
      <view class="bottom-submit-section">
        <view class="submit-button-container">
          <view 
            class="bottom-submit-btn" 
            :class="{ disabled: isSubmitting || !canSubmit }"
            @click="submitEvaluate"
          >
            <view class="submit-btn-content">
              <view v-if="isSubmitting" class="submit-loading">
                <view class="loading-dots">
                  <view class="dot"></view>
                  <view class="dot"></view>
                  <view class="dot"></view>
                </view>
              </view>
  
              <text class="submit-btn-text" v-if="!isSubmitting">提交评价</text>
              <text class="submit-btn-text" v-else>提交中...</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { uploadFile, getUploadResult } from '@/api/file.js'
import { createOrderComment } from '@/api/order.js'
  
  // 页面参数
  const orderId = ref('')
  const serviceName = ref('')
  const serviceImage = ref('')
  
  // 评价数据
  const rating = ref(5)
  const evaluateText = ref('')
  const photos = ref([])
  const isAnonymous = ref(false)
  
  // 提交状态
  const isSubmitting = ref(false)
  
  // 计算属性：是否可以提交
  const canSubmit = computed(() => {
    return rating.value > 0 && evaluateText.value.trim().length > 0
  })
  
  // 页面加载
  onLoad((options) => {
    if (options.orderId) {
      orderId.value = options.orderId
    }
    if (options.serviceName) {
      serviceName.value = decodeURIComponent(options.serviceName)
    }
    if (options.serviceImage) {
      serviceImage.value = decodeURIComponent(options.serviceImage)
    }
  })
  
  // 切换匿名设置
  const toggleAnonymous = () => {
    isAnonymous.value = !isAnonymous.value
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
                name: `evaluate_${Date.now()}_${index}.${fileInfo.extension}`
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
    uni.previewImage({
      urls: photos.value,
      current: index
    })
  }
  
  // 删除图片
  const deletePhoto = (index) => {
    photos.value.splice(index, 1)
  }
  
  // 提交评价
  const submitEvaluate = async () => {
    if (!canSubmit.value || isSubmitting.value) {
      return
    }
  
    isSubmitting.value = true
    
    try {
      // 构建评价数据，按照API接口要求
      const evaluateData = {
        order_id: parseInt(orderId.value),
        rating: rating.value,
        comment: evaluateText.value.trim(),
        comment_images: photos.value,
        is_anonymous: isAnonymous.value ? 1 : 0
      }
      
      console.log('提交评价数据:', evaluateData)
      
      // 调用评价提交API
      const response = await createOrderComment(evaluateData)
      
      if (response.data && response.data.code === 0) {
        uni.showToast({
          title: '评价提交成功',
            icon: 'none',
          duration: 2000
        })
        
        // 延迟返回上一页
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } else {
        throw new Error(response.data?.msg || '评价提交失败')
      }
      
    } catch (error) {
      console.error('提交评价失败:', error)
      uni.showToast({
        title: error.data?.msg || '提交失败，请重试',
        icon: 'none'
      })
    } finally {
      isSubmitting.value = false
    }
  }
  </script>
  
  <style lang="scss" scoped>
  .evaluate-container {
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
  
  /* 服务信息样式 */
  .service-info {
    display: flex;
    gap: 20rpx;
    padding: 20rpx;
  }
  
  .service-image {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    flex-shrink: 0;
  }
  
  .service-details {
    flex: 1;
  }
  
  .service-name {
    font-size: 28rpx;
    color: #1A1A1A;
    font-weight: 500;
    margin-bottom: 16rpx;
    display: block;
  }
  
  .rating-section {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }
  
  .rating-label {
    font-size: 24rpx;
    color: #666666;
    font-weight: 500;
  }
  
  .rating-text {
    font-size: 24rpx;
    color: #7363FF;
    font-weight: 600;
  }
  
  /* 评价内容样式 */
  .evaluate-content {
    padding: 20rpx;
  }
  
  .input-section {
    position: relative;
    margin-bottom: 24rpx;
  }
  
  .evaluate-textarea {
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
  
  .evaluate-textarea:focus {
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
  
  /* 匿名设置样式 */
  .anonymous-setting {
    padding: 20rpx;
  }
  
  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 0;
  }
  
  .setting-left {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }
  
  .setting-icon {
    width: 32rpx;
    height: 32rpx;
    opacity: 0.7;
  }
  
  .setting-text {
    display: flex;
    flex-direction: column;
  }
  
  .setting-title {
    font-size: 26rpx;
    color: #1A1A1A;
    font-weight: 500;
    margin-bottom: 4rpx;
  }
  
  .setting-desc {
    font-size: 22rpx;
    color: #999999;
  }
  
  .setting-toggle {
    width: 80rpx;
    height: 40rpx;
    background: #e9ecef;
    border-radius: 20rpx;
    position: relative;
    transition: all 0.3s ease;
    
    &.active {
      background: #7363FF;
      
      .toggle-circle {
        transform: translateX(40rpx);
      }
    }
  }
  
  .toggle-circle {
    width: 36rpx;
    height: 36rpx;
    background: white;
    border-radius: 50%;
    position: absolute;
    top: 2rpx;
    left: 2rpx;
    transition: all 0.3s ease;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
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