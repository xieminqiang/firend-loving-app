<template>
  <view class="evaluate-detail-container">
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
                <text class="card-subtitle">订单服务详情</text>
              </view>
            </view>
          </view>
          
          <view class="service-info">
            <image :src="proxy.$imgBaseUrl + orderInfo.service_image" class="service-image" mode="aspectFill" />
            <view class="service-details">
              <text class="service-name">{{ orderInfo.service_name }}</text>
              <view class="service-meta">
                <text class="service-price">¥{{ orderInfo.unit_price }}/{{ orderInfo.unit }}</text>
                <text class="service-quantity">x{{ orderInfo.quantity }}</text>
              </view>
              <view class="service-amount">
                <text class="amount-label">订单金额：</text>
                <text class="amount-value">¥{{ orderInfo.total_amount }}</text>
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
                <text class="card-subtitle">您的真实体验感受</text>
              </view>
            </view>
          </view>
          
          <view class="evaluate-content">
            <!-- 评分显示 -->
            <view class="rating-display">
              <text class="rating-label">服务评分：</text>
              <view class="rating-stars">
                <view 
                  v-for="i in 5" 
                  :key="i"
                  class="star-item"
                  :class="{ active: i <= commentInfo.rating }"
                >
                  <text class="star-text">★</text>
                </view>
              </view>
              <text class="rating-text">{{ commentInfo.rating }}分</text>
            </view>
            
            <!-- 评价文字 -->
            <view class="comment-text-section">
              <text class="comment-label">评价内容：</text>
              <view class="comment-content">
                <text class="comment-text">{{ commentInfo.comment || '暂无评价内容' }}</text>
              </view>
            </view>
            
            <!-- 评价图片 -->
            <view v-if="commentInfo.comment_images && commentInfo.comment_images.length > 0" class="comment-images-section">
              <text class="images-label">评价图片：</text>
              <view class="comment-images">
                <view 
                  v-for="(image, index) in commentInfo.comment_images" 
                  :key="index"
                  class="comment-image-item"
                  @click="previewImage(index)"
                >
                  <image :src="proxy.$imgBaseUrl + image" class="comment-image" mode="aspectFill" />
                </view>
              </view>
            </view>
            
            <!-- 评价时间 -->
            <view class="comment-time-section">
              <text class="time-label">评价时间：</text>
              <text class="time-value">{{ formatTime(commentInfo.created_at) }}</text>
            </view>
            
            <!-- 匿名标识 -->
            <view v-if="commentInfo.is_anonymous" class="anonymous-badge">
              <text class="anonymous-text">匿名评价</text>
            </view>
          </view>
        </view>

        <!-- 友伴师回复卡片 -->
        <view v-if="commentInfo.companion_reply" class="reply-card modern-card">
          <view class="card-header">
            <view class="header-content">
              <view class="section-indicator reply-indicator"></view>
              <view class="header-text">
                <text class="card-title">回复</text>
                <text class="card-subtitle">感谢您的评价</text>
              </view>
            </view>
          </view>
          
          <view class="reply-content">
            <!-- 友伴师信息 -->
            <view class="companion-info">
              <image 
                :src="proxy.$imgBaseUrl + commentInfo.companion_reply.companion_avatar" 
                class="companion-avatar" 
                mode="aspectFill"
              />
              <view class="companion-details">
                <text class="companion-name">{{ commentInfo.companion_reply.companion_nickname }}</text>
                <text class="reply-time">{{ formatTime(commentInfo.companion_reply.created_at) }}</text>
              </view>
            </view>
            
            <!-- 回复内容 -->
            <view class="reply-text-section">
              <view class="reply-content-box">
                <text class="reply-text">{{ commentInfo.companion_reply.comment }}</text>
              </view>
            </view>
            
            <!-- 回复图片 -->
            <view v-if="commentInfo.companion_reply.comment_images && commentInfo.companion_reply.comment_images.length > 0" class="reply-images-section">
              <view class="reply-images">
                <view 
                  v-for="(image, index) in commentInfo.companion_reply.comment_images" 
                  :key="index"
                  class="reply-image-item"
                  @click="previewReplyImage(index)"
                >
                  <image :src="proxy.$imgBaseUrl + image" class="reply-image" mode="aspectFill" />
                </view>
              </view>
            </view>
          </view>
        </view>

        <view style="height: 200rpx;"></view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrderDetail, getOrderCommentList } from '@/api/order.js'

// 获取全局属性
const { proxy } = getCurrentInstance()

// 页面参数
const orderId = ref('')

// 订单信息
const orderInfo = ref({})

// 评价信息
const commentInfo = ref({
  rating: 0,
  comment: '',
  comment_images: [],
  created_at: '',
  is_anonymous: false
})

// 页面加载
onLoad((options) => {
  if (options.orderId) {
    orderId.value = options.orderId
    loadOrderDetail()
    loadCommentList()
  }
})

// 加载订单详情
const loadOrderDetail = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    
    const response = await getOrderDetail({ order_id: Number(orderId.value) })
    
    if (response.data.code === 0) {
      const orderData = response.data.data.order
      
      // 设置订单信息
      orderInfo.value = {
        service_name: orderData.service_name,
        service_image: orderData.service_image_url,
        unit_price: orderData.unit_price,
        unit: orderData.unit,
        quantity: orderData.quantity,
        total_amount: orderData.total_amount
      }
      
      console.log('订单详情加载成功:', orderData)
      
      // 加载评价列表
      
    } else {
      throw new Error(response.data.msg || '获取订单详情失败')
    }
  } catch (error) {
    console.error('加载订单详情失败:', error)
    uni.showToast({
      title: error.message || '加载失败',
      icon: 'none'
    })
  } finally {
    uni.hideLoading()
  }
}

// 加载评价列表
const loadCommentList = async () => {
  try {
    const response = await getOrderCommentList({ order_id: Number(orderId.value) })
    
    if (response.data.code === 0) {
      const commentList = response.data.data.list || []
      
      // 分离用户评价和友伴师回复
      const userComment = commentList.find(item => item.is_companion === 0)
      const companionReply = commentList.find(item => item.is_companion === 1)
      
      if (userComment) {
        commentInfo.value = {
          rating: userComment.rating || 5,
          comment: userComment.comment || '',
          comment_images: userComment.comment_images || [],
          created_at: userComment.comment_time || userComment.updated_at || '',
          is_anonymous: userComment.is_anonymous === 1,
          user_nickname: userComment.user_nickname || userComment.user_name || '用户',
          user_avatar: userComment.head_image || ''
        }
      }
      
      // 保存友伴师回复信息
      if (companionReply) {
        commentInfo.value.companion_reply = {
          comment: companionReply.comment || '',
          comment_images: companionReply.comment_images || [],
          created_at: companionReply.comment_time || companionReply.updated_at || '',
          companion_nickname: companionReply.user_nickname || companionReply.user_name || '友伴师',
          companion_avatar: companionReply.companion_img || ''
        }
      }
      
      console.log('评价列表加载成功:', commentList)
      console.log('处理后的评价信息:', commentInfo.value)
    } else {
      console.warn('获取评价列表失败:', response.data.message)
    }
  } catch (error) {
    console.error('加载评价列表失败:', error)
  }
}

// 预览图片
const previewImage = (index) => {
  console.log('commentInfo.value.comment_images', commentInfo.value.comment_images)
  const urls = commentInfo.value.comment_images.map(img => proxy.$imgBaseUrl + img)
  uni.previewImage({
    urls: urls,
    current: index
  })
}

// 预览友伴师回复图片
const previewReplyImage = (index) => {
  const urls = commentInfo.value.companion_reply.comment_images.map(img => proxy.$imgBaseUrl + img)
  uni.previewImage({
    urls: urls,
    current: index
  })
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return '未知时间'
  
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
.evaluate-detail-container {
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

.service-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.service-price {
  font-size: 26rpx;
  color: #666666;
}

.service-quantity {
  font-size: 26rpx;
  color: #666666;
}

.service-amount {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.amount-label {
  font-size: 26rpx;
  color: #666666;
}

.amount-value {
  font-size: 28rpx;
  color: #f43f5e;
  font-weight: 600;
}

/* 评价内容样式 */
.evaluate-content {
  padding: 20rpx;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 24rpx;
}

.rating-label {
  font-size: 24rpx;
  color: #666666;
  font-weight: 500;
}

.rating-stars {
  display: flex;
  gap: 4rpx;
}

.star-item {
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.active .star-text {
    color: #FFD700;
  }
}

.star-text {
  font-size: 28rpx;
  color: #E0E0E0;
  transition: color 0.3s ease;
}

.rating-text {
  font-size: 24rpx;
  color: #7363FF;
  font-weight: 600;
}

.comment-text-section {
  margin-bottom: 24rpx;
}

.comment-label {
  font-size: 24rpx;
  color: #666666;
  font-weight: 500;
  margin-bottom: 12rpx;
  display: block;
}

.comment-content {
  background: #f8f9fe;
  border-radius: 12rpx;
  padding: 16rpx;
  border: 1rpx solid #e9ecf5;
}

.comment-text {
  font-size: 26rpx;
  color: #1A1A1A;
  line-height: 1.6;
}

.comment-images-section {
  margin-bottom: 24rpx;
}

.images-label {
  font-size: 24rpx;
  color: #666666;
  font-weight: 500;
  margin-bottom: 12rpx;
  display: block;
}

.comment-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.comment-image-item {
  aspect-ratio: 1;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.comment-image {
  width: 100%;
  height: 100%;
}

.comment-time-section {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.time-label {
  font-size: 24rpx;
  color: #666666;
  font-weight: 500;
}

.time-value {
  font-size: 24rpx;
  color: #999999;
}

.anonymous-badge {
  display: inline-block;
  background: rgba(115, 99, 255, 0.1);
  border: 1rpx solid rgba(115, 99, 255, 0.2);
  border-radius: 16rpx;
  padding: 8rpx 16rpx;
  align-self: flex-start;
}

.anonymous-text {
  font-size: 22rpx;
  color: #7363FF;
  font-weight: 500;
}

/* 友伴师回复卡片样式 */
.reply-card {
  margin-top: 20rpx;
}

.reply-indicator {
  background: linear-gradient(135deg, #FF69DE 0%, #FF8C42 100%);
}

.reply-content {
  padding: 20rpx;
}

.companion-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.companion-avatar {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.companion-details {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.companion-name {
  font-size: 26rpx;
  color: #1A1A1A;
  font-weight: 500;
}

.reply-time {
  font-size: 22rpx;
  color: #999999;
}

.reply-text-section {
  margin-bottom: 20rpx;
}

.reply-content-box {
  background: #f8f9fe;
  border-radius: 12rpx;
  padding: 16rpx;
  border: 1rpx solid #e9ecf5;
  border-left: 4rpx solid #FF69DE;
}

.reply-text {
  font-size: 26rpx;
  color: #1A1A1A;
  line-height: 1.6;
}

.reply-images-section {
  margin-top: 16rpx;
}

.reply-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.reply-image-item {
  aspect-ratio: 1;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.reply-image {
  width: 100%;
  height: 100%;
}
</style>
