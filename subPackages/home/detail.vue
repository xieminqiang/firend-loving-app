<template>
  <view class="detail-container">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在加载详情...</text>
    </view>

    <!-- 详情内容 -->
    <scroll-view v-else-if="!error" class="detail-content" scroll-y="true">
      <!-- 返回按钮 -->
      <view class="back-button" @click="goBack">
        <image src="@/static/icons/common/arrow-left.png" class="back-icon" mode="aspectFit" />
      </view>

      <!-- 服务头图 -->
      <view class="hero-section" @click="previewImage">
        <image 
          :src="$imgBaseUrl + serviceDetail.image_url" 
          class="hero-image" 
          mode="aspectFill"
          @error="onImageError"
        />
      </view>

      <!-- 服务信息 -->
      <view class="service-info-section">
        <view class="service-header">
          <view class="title-price-row">
            <text class="service-title">{{ serviceDetail.name || '服务详情' }}</text>
            <view class="price-info" v-if="serviceDetail.min_price">
              <text class="price-text">
                ¥{{ serviceDetail.min_price }}
                <text class="price-suffix-small" v-if="priceTemplate.unit">/{{ priceTemplate.unit }}</text>
                <text class="price-suffix-small">起</text>
              </text>
            </view>
          </view>
        </view>

        <!-- 服务标签 -->
        <view class="service-tags" v-if="serviceDetail.tags && serviceDetail.tags.length > 0">
          <text v-for="tag in serviceDetail.tags" :key="tag" class="service-tag">{{ tag }}</text>
        </view>
      </view>

      <!-- 价格选择 -->
      <view class="price-section" v-if="priceTemplate && priceTemplate.levels && priceTemplate.levels.length > 0">
        <view class="section-header">
          <image src="@/static/icons/friend/fw_star.png" class="header-icon" mode="aspectFit" />
          <text class="section-title">服务等级</text>
        </view>
        
        <view class="price-grid">
          <view 
            v-for="level in priceTemplate.levels" 
            :key="level.id"
            class="price-item"
          >
            <view class="level-info">
              <view class="level-header">
                <text class="level-name">{{ level.level_name }}</text>
                <view class="level-badge" v-if="level.level_order <= 2">
                  <text class="badge-text">{{ level.level_order === 1 ? '入门' : '推荐' }}</text>
                </view>
              </view>
            </view>
            <view class="level-price">
              <text class="price-amount">¥{{ level.price }}</text>
              <text class="price-unit">/{{ level.unit }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 服务说明 -->
      <view class="service-description-section">
        <view class="section-header">
          <image src="@/static/icons/friend/tag.png" class="header-icon" mode="aspectFit" />
          <text class="section-title">服务说明</text>
        </view>
        <view class="description-content">
          <text class="description-text">{{ serviceDetail.description || '暂无详细说明' }}</text>
        </view>
      </view>



      <!-- 底部占位 -->
      <view class="bottom-placeholder"></view>
    </scroll-view>

    <!-- 底部预约按钮 -->
    <view class="bottom-section" v-if="!loading && !error">
      <view class="action-buttons">
        <view class="book-btn" @click="bookService">
          <text>立即预约</text>
        </view>
      </view>
    </view>

    <!-- 错误提示 -->
    <view v-if="error" class="error-container">
      <image src="/static/images/empty.png" class="error-icon" mode="aspectFit" />
      <text class="error-text">{{ error }}</text>
      <view class="retry-btn" @click="loadData">
        <text>重试</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getServiceDetail, getPriceTemplateDetail } from '@/api/home.js'

// 页面参数
const params = ref({})
const loading = ref(true)
const error = ref('')

// 数据
const serviceDetail = ref({})
const priceTemplate = ref({})

// 页面加载
onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  params.value = currentPage.options || {}
  
  console.log('详情页参数:', params.value)
  
  if (!params.value.id) {
    error.value = '缺少服务ID参数'
    loading.value = false
    return
  }
  
  loadData()
})

// 加载数据
const loadData = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // 加载服务详情
    const serviceRes = await getServiceDetail(params.value.id)
    
    if (serviceRes.data && serviceRes.data.code === 0) {
      serviceDetail.value = serviceRes.data.data
      
      // 优先使用传递过来的price_template_id，如果没有则使用服务详情中的
      const templateId = params.value.price_template_id || serviceDetail.value.price_template_id
      if (templateId) {
        console.log('加载价格模板详情, ID:', templateId)
        try {
          const templateRes = await getPriceTemplateDetail(templateId)
          if (templateRes.data && templateRes.data.code === 0) {
            priceTemplate.value = templateRes.data.data
            console.log('价格模板加载成功:', priceTemplate.value)
          } else {
            console.warn('价格模板接口返回错误:', templateRes.data)
          }
        } catch (templateError) {
          console.warn('获取价格模板失败:', templateError)
        }
      } else {
        console.log('没有价格模板ID，跳过价格模板加载')
      }
    } else {
      throw new Error((serviceRes.data && serviceRes.data.message) || '获取服务详情失败')
    }
    
  } catch (err) {
    console.error('加载数据失败:', err)
    error.value = err.message || '加载失败，请重试'
  } finally {
    loading.value = false
  }
}

// 返回上级
const goBack = () => {
  uni.navigateBack()
}

// 图片加载错误处理
const onImageError = () => {
  console.log('图片加载失败')
}

// 预览图片
const previewImage = () => {
  if (serviceDetail.value && serviceDetail.value.image_url) {
    // 直接使用配置的图片基础URL
    const imgBaseUrl = 'https://sbx-server.oss-cn-shenzhen.aliyuncs.com'
    
    const imageUrl = serviceDetail.value.image_url.startsWith('http') 
      ? serviceDetail.value.image_url 
      : imgBaseUrl + serviceDetail.value.image_url
    
    console.log('预览图片URL:', imageUrl)
    
    uni.previewImage({
      urls: [imageUrl],
      current: imageUrl,
      success: () => {
        console.log('图片预览成功')
      },
      fail: (err) => {
        console.error('图片预览失败:', err)
        uni.showToast({
          title: '图片预览失败',
          icon: 'none'
        })
      }
    })
  } else {
    uni.showToast({
      title: '图片加载中，请稍后再试',
      icon: 'none'
    })
  }
}
// 预约服务
const bookService = () => {
  // 跳转到友伴选择页面，传递服务ID
  uni.navigateTo({
    url: `/subPackages/friend/friend-select?service_id=${serviceDetail.value.id}`
  })
}
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
@import "@/styles/mixins.scss";

.detail-container {
  min-height: 100vh;
  background: $bg-color-secondary;
  position: relative;
}

// 加载状态
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 0 40rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid rgba($primary-color, 0.2);
  border-top: 4rpx solid $primary-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: $text-color-secondary;
  text-align: center;
}

// 错误状态
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 0 40rpx;
}

.error-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 32rpx;
  opacity: 0.6;
}

.error-text {
  font-size: 28rpx;
  color: $text-color-secondary;
  text-align: center;
  margin-bottom: 40rpx;
  line-height: 1.5;
}

.retry-btn {
  background: linear-gradient(135deg, $primary-color 0%, $highlight-color 100%);
  color: white;
  padding: 16rpx 40rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba($primary-color, 0.3);
  
  &:active {
    transform: scale(0.98);
  }
}

// 详情内容
.detail-content {
  height: 100vh;
  padding-bottom: 200rpx;
}

// 返回按钮
.back-button {
  position: fixed;
  top: 60rpx;
  left: 24rpx;
  width: 64rpx;
  height: 64rpx;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  
  &:active {
    transform: scale(0.95);
  }
}

.back-icon {
  width: 32rpx;
  height: 32rpx;
  filter: brightness(0) invert(1);
}

// 头图区域
.hero-section {
  position: relative;
  height: 500rpx;
  overflow: hidden;
 
  

}

.hero-image {
  width: 100%;
  height: 100%;
  

}





// 服务信息区域
.service-info-section {
  background: $bg-color-primary;
  margin: -20rpx 0 0 0;
  padding: 40rpx 24rpx 32rpx;
  border-radius: 20rpx 20rpx 0 0;
  position: relative;
  z-index: 2;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.service-header {
  margin-bottom: 24rpx;
}

.title-price-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16rpx;
  gap: 16rpx;
}

.service-title {
  font-size: 36rpx;
  font-weight: 700;
  color: $text-color-primary;
  line-height: 1.3;
  letter-spacing: 0.5rpx;
  flex: 1;
  min-width: 0;
}

.price-info {
  flex-shrink: 0;
  align-self: flex-end;
}

.price-text {
  font-size: 30rpx;
  font-weight: 700;
   color:$pricelight-color;
  line-height: 1.2;
  white-space: nowrap;
  text-shadow: 0 1rpx 3rpx rgba(255, 111, 97, 0.15);
}

.price-suffix-small {
  font-size: 20rpx;
  font-weight: 500;
  color: $text-color-secondary;

}

.service-stats {
  display: flex;
  gap: 24rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stat-icon {
  width: 28rpx;
  height: 28rpx;
  opacity: 0.8;
}

.stat-text {
  font-size: 24rpx;
  color: $text-color-secondary;
  font-weight: 500;
}

.service-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;

}

.service-tag {
  font-size: 20rpx;
  background: linear-gradient(135deg, rgba(108, 117, 125, 0.08) 0%, rgba(248, 249, 250, 0.6) 100%);
  color: #495057;
  padding: 4rpx 12rpx;
  border-radius: 16rpx;
  font-weight: 600;
  border: 1rpx solid rgba(108, 117, 125, 0.12);
  backdrop-filter: blur(8rpx);
  -webkit-backdrop-filter: blur(8rpx);
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.95);
    background: linear-gradient(135deg, rgba(255, 105, 222, 0.1) 0%, rgba(255, 255, 255, 0.8) 100%);
    color: $highlight-color;
    border-color: rgba(255, 105, 222, 0.2);
  }
}

.description-text {
  font-size: 28rpx;
  color: $text-color-secondary;
  line-height: 1.6;
  word-break: break-all;
}

// 价格选择区域
.price-section {
  background: $bg-color-primary;
  margin: 20rpx 24rpx;
  padding: 32rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.header-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 12rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
  color: $text-color-primary;
}

.price-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16rpx;
}

.price-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20rpx 12rpx;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(247, 248, 250, 0.5) 100%);
  border: 2rpx solid rgba(0, 0, 0, 0.06);
  border-radius: 20rpx;
  transition: all 0.3s;
  position: relative;
  
  &:active {
    transform: scale(0.98);
  }
}

.level-info {
  width: 100%;
  margin-bottom: 12rpx;
}

.level-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8rpx;
  flex-wrap: wrap;
  gap: 6rpx;
}

.level-name {
  font-size: 26rpx;
  font-weight: 700;
  color: $text-color-primary;
}

.level-badge {
  background: linear-gradient(135deg, $highlight-color 0%, #FF8A65 100%);
  color: white;
  padding: 2rpx 8rpx;
  border-radius: 10rpx;
  font-size: 18rpx;
  font-weight: 600;
}

.badge-text {
  font-size: 18rpx;
}

.level-desc {
  font-size: 22rpx;
  color: $text-color-secondary;
}

.level-price {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.price-amount {
  font-size: 36rpx;
  font-weight: 700;
  color:$pricelight-color;
}

.price-unit {
  font-size: 24rpx;
  color: $text-color-secondary;
  margin-left: 4rpx;
}



// 服务优势区域
.features-section {
  background: $bg-color-primary;
  margin: 0 24rpx 20rpx;
  padding: 32rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(0, 0, 0, 0.04);
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 16rpx;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(247, 248, 250, 0.3) 100%);
  border-radius: 16rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.04);
}

.feature-icon {
  width: 40rpx;
  height: 40rpx;
  margin-bottom: 12rpx;
  opacity: 0.8;
}

.feature-text {
  font-size: 24rpx;
  color: $text-color-primary;
  font-weight: 600;
  text-align: center;
}

.bottom-placeholder {
  height: 200rpx;
}

// 底部区域
.bottom-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 248, 250, 0.95) 100%);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  padding: 24rpx 24rpx calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.price-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  padding: 16rpx 20rpx;
  background: linear-gradient(135deg, rgba($primary-color, 0.05) 0%, rgba($highlight-color, 0.02) 100%);
  border-radius: 16rpx;
  border: 1rpx solid rgba($primary-color, 0.1);
}

.summary-text {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.summary-label {
  font-size: 24rpx;
  color: $text-color-secondary;
}

.summary-value {
  font-size: 26rpx;
  color: $text-color-primary;
  font-weight: 600;
}

.summary-price {
  font-size: 28rpx;
  font-weight: 700;
  color: $highlight-color;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
}

.book-btn {
  flex: 1;
  background: linear-gradient(135deg, $primary-color 0%, $highlight-color 100%);
  color: white;
  padding: 16rpx 24rpx;
  border-radius: 32rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 700;
  box-shadow: 0 8rpx 24rpx rgba($primary-color, 0.3);
  transition: all 0.3s;
  
  &:active:not(.disabled) {
    transform: scale(0.98);
    box-shadow: 0 12rpx 32rpx rgba($primary-color, 0.4);
  }
  
  &.disabled {
    opacity: 0.5;
    background: linear-gradient(135deg, #CCCCCC 0%, #999999 100%);
    box-shadow: none;
  }
}

// 服务说明区域
.service-description-section {
  background: $bg-color-primary;
  margin: 20rpx 24rpx;
  padding: 32rpx;
  border-radius: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  border: 1rpx solid rgba(0, 0, 0, 0.04);
}

.description-content {
  padding-top: 24rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.06);
}
</style>