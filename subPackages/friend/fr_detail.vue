<template>
    <view class="fr-detail">

  
      <!-- 服务图片区域 -->
      <view class="service-image-section">
        <image 
          :src="$imgBaseUrl + serviceData.service_image_url" 
          class="service-image" 
          mode="aspectFill"
          @error="onImageError"
        />
        <view class="image-overlay">
          <view class="service-price-tag">
            <text class="price-symbol">¥</text>
            <text class="price-amount">{{ serviceData.price || 0 }}</text>
            <text class="price-unit">/{{ serviceData.unit || '小时' }}起</text>
          </view>
        </view>
      </view>
  
      <!-- 服务信息区域 -->
      <view class="service-info-section">
        <view class="service-header">
          <text class="service-title">{{ serviceData.service_name }}</text>
        </view>
  
        <!-- 服务标签 -->
        <view class="service-tags" v-if="serviceData.service_tags && serviceData.service_tags.length > 0">
          <text 
            v-for="(tag, index) in serviceData.service_tags" 
            :key="index" 
            class="tag-item"
          >
            {{ tag }}
          </text>
        </view>
  
        <!-- 服务描述 -->
        <view class="service-description">
          <text class="description-title">服务介绍</text>
          <text class="description-content">
            我们提供专业的{{ serviceData.service_name }}服务，确保您获得最优质的体验。
            我们的服务人员都经过专业培训，具备丰富的经验，能够为您提供贴心、周到的服务。
          </text>
        </view>
  
        <!-- 服务特色 -->
        <view class="service-features">
          <text class="features-title">服务特色</text>
          <view class="feature-list">
            <view class="feature-item">
              <text class="feature-icon">✓</text>
              <text class="feature-text">专业认证</text>
            </view>
            <view class="feature-item">
              <text class="feature-icon">✓</text>
              <text class="feature-text">安全保障</text>
            </view>
            <view class="feature-item">
              <text class="feature-icon">✓</text>
              <text class="feature-text">品质保证</text>
            </view>
            <view class="feature-item">
              <text class="feature-icon">✓</text>
              <text class="feature-text">售后无忧</text>
            </view>
          </view>
        </view>
      </view>
  
      <!-- 底部操作区域 -->
      <view class="bottom-actions">
        <view class="action-buttons">
          <view class="order-btn" @click="goToOrder">
            <text class="btn-text">立即下单</text>
          </view>
        </view>
      </view>
    </view>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue'
  import { useUserStore } from '@/stores/user.js'
  
  // 用户状态管理
  const userStore = useUserStore()
  
  // 服务数据
  const serviceData = ref({
    service_id: '',
    price_template_id: '',
    companion_id: '',
    level_order: '',
    nickname: '',
    service_name: '',
    service_image_url: '',
    price: 0,
    unit: '小时',
    service_tags: []
  })
  
  // 获取页面参数
  onMounted(() => {
    // 获取页面参数
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const options = currentPage.options
    
    if (options) {
      serviceData.value = {
        service_id: options.service_id || '',
        price_template_id: options.price_template_id || '',
        companion_id: options.companion_id || '',
        level_order: options.level_order || '',
        nickname: options.nickname || '',
        service_name: decodeURIComponent(options.service_name || ''),
        service_image_url: decodeURIComponent(options.service_image_url || ''),
        price: parseFloat(options.price) || 0,
        unit: options.unit || '小时',
        service_tags: options.service_tags ? JSON.parse(decodeURIComponent(options.service_tags)) : []
      }
    }
    
    console.log('服务详情数据:', serviceData.value)
  })
  
  // 图片加载失败处理
  const onImageError = () => {
    console.log('图片加载失败')
  }
  
  // 去下单
  const goToOrder = () => {
    // 检查登录状态
    if (!userStore.token) {
      uni.showModal({
        title: '提示',
        content: '请先登录后再下单',
        confirmText: '去登录',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 跳转到登录页面
            uni.navigateTo({
              url: '/subPackages/login/index'
            })
          }
        }
      })
      return
    }
    
    // 已登录，跳转到下单页面
    console.log('跳转到下单页面，服务信息:', serviceData.value)
    uni.navigateTo({
      url: `/subPackages/order/submit?service_id=${serviceData.value.service_id}&price_template_id=${serviceData.value.price_template_id || ''}&companion_id=${serviceData.value.companion_id || 15}&level_order=${serviceData.value.level_order || ''}&nickname=${serviceData.value.nickname || ''}`
    })
  }
  </script>
  
  <style lang="scss" scoped>
  @import "@/styles/variables.scss";
  
  .fr-detail {
    min-height: 100vh;
    background: $bg-color-secondary;
  }
  
  /* 服务图片区域 */
  .service-image-section {
    position: relative;
    margin-top: 0;
    height: 500rpx;
    overflow: hidden;
  }
  
  .service-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .image-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
    padding: 40rpx 24rpx;
  }

  .service-price-tag {
    display: flex;
    align-items: baseline;
    background: rgba(255, 255, 255, 0.95);
    padding: 16rpx 24rpx;
    border-radius: 24rpx;
    backdrop-filter: blur(10rpx);
    -webkit-backdrop-filter: blur(10rpx);
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  }

  .price-symbol {
    font-size: 24rpx;
    color: $pricelight-color;
    font-weight: 600;
  }

  .price-amount {
    font-size: 36rpx;
    color: $pricelight-color;
    font-weight: 700;
    margin: 0 4rpx;
  }

  .price-unit {
    font-size: 20rpx;
    color: $text-color-secondary;
    font-weight: 500;
  }

  /* 服务信息区域 */
  .service-info-section {
    background: $bg-color-primary;
    border-radius: 32rpx 32rpx 0 0;
    margin-top: -32rpx;
    padding: 40rpx 24rpx;
    position: relative;
    z-index: 10;
  }

  .service-header {
    margin-bottom: 24rpx;
  }

  .service-title {
    font-size: 36rpx;
    font-weight: 700;
    color: $text-color-primary;
    line-height: 1.4;
  }

  /* 服务标签 */
  .service-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 32rpx;
  }

  .tag-item {
    background: linear-gradient(135deg, rgba(115, 99, 255, 0.08) 0%, rgba(255, 255, 255, 0.8) 100%);
    color: $primary-color;
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 22rpx;
    font-weight: 600;
    border: 1rpx solid rgba(115, 99, 255, 0.15);
  }

  /* 服务描述 */
  .service-description {
    margin-bottom: 32rpx;
  }

  .description-title {
    font-size: 28rpx;
    font-weight: 600;
    color: $text-color-primary;
    margin-bottom: 16rpx;
    display: block;
  }

  .description-content {
    font-size: 26rpx;
    color: $text-color-secondary;
    line-height: 1.6;
    display: block;
  }

  /* 服务特色 */
  .service-features {
    margin-bottom: 32rpx;
  }

  .features-title {
    font-size: 28rpx;
    font-weight: 600;
    color: $text-color-primary;
    margin-bottom: 20rpx;
    display: block;
  }

  .feature-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20rpx;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .feature-icon {
    width: 32rpx;
    height: 32rpx;
    background: linear-gradient(135deg, $primary-color 0%, $highlight-color 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20rpx;
    font-weight: bold;
  }

  .feature-text {
    font-size: 24rpx;
    color: $text-color-secondary;
    font-weight: 500;
  }

  /* 底部操作区域 */
  .bottom-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: $bg-color-primary;
    padding: 24rpx;
    border-top: 1rpx solid rgba(0, 0, 0, 0.06);
    box-shadow: 0 -8rpx 24rpx rgba(0, 0, 0, 0.08);
  }

  .action-buttons {
    display: flex;
    justify-content: center;
  }

  .order-btn {
    width: 100%;
    background: linear-gradient(135deg, $primary-color 0%, $highlight-color 100%);
    border-radius: 32rpx;
    padding: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8rpx 24rpx rgba(115, 99, 255, 0.25);
    transition: all 0.3s;
  }

  .order-btn:active {
    transform: scale(0.95);
    box-shadow: 0 12rpx 32rpx rgba(115, 99, 255, 0.35);
  }

  .btn-text {
    color: white;
    font-size: 28rpx;
    font-weight: 600;
  }
</style>