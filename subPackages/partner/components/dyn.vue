<template>
  <scroll-view 
    class="dyn-container" 
    scroll-y="true"
    @scrolltolower="onScrollToLower"
    :refresher-enabled="true"
    :refresher-triggered="refreshing"
    @refresherrefresh="onRefresh"
    :lower-threshold="100">
    <!-- 动态列表 -->
    <view v-if="momentsLoading && momentsList.length === 0" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>
    <view v-else-if="momentsList.length > 0" class="moments-list">
      <view v-for="(item, index) in momentsList" :key="index" class="moment-item">
        <view class="moment-left">
          <view class="moment-day">{{ item.moments_info?.time_date }}</view>
          <view class="moment-time">{{ item.moments_info?.time_time }}</view>
        </view>
        <view class="moment-right">
          <!-- 文案 -->
          <view class="copywriting">
            <view>{{ item.moments_info?.content }}</view>
            
            <!-- 照片 -->
            <view>
              <PictureDisplay v-if="item.moments_info?.file_list" :list="item.moments_info?.file_list"
                :topicList="item.moments_info?.topic_list" @playVideo="handlePlayVideo"></PictureDisplay>
            </view>
          </view>
          
          <!-- 底部 -->
          <view class="foot">
            <view class="foot-right">
              <!-- 点赞 -->
              <view class="icon-item">
                <image v-if="!item.moments_info?.is_praised" src="@/static/square/love.png" mode=""
                  class="foot-image" @tap="handlePraise(item)">
                </image>
                <image v-if="item.moments_info?.is_praised" src="@/static/square/active-love.png" mode=""
                  class="foot-image" @tap="handlePraise(item)">
                </image>
                <view class="icon-title">{{ item.moments_info?.praise_num || 0 }}</view>
              </view>
              <!-- 评论 -->
              <view class="icon-item icon-item-center" @tap="toRecord(item)">
                <image src="@/static/square/message.png" mode="" class="foot-image"></image>
                <view class="icon-title">{{ item.moments_info?.comments_num || 0 }}</view>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 加载更多状态 -->
      <view v-if="loadingMore" class="load-more-state">
        <text class="load-more-text">加载中...</text>
      </view>
      <view v-else-if="noMoreData && momentsList.length > 0" class="no-more-state">
        <text class="no-more-text">~ 没有更多了 ~</text>
      </view>
    </view>
    <view v-else class="empty-state-profile">
      <image src="/static/images/empty.png" class="empty-icon" mode="aspectFit" />
      <text class="empty-text-profile">~暂无发布内容~</text>
    </view>

    <!-- 视频播放弹框 -->
    <u-popup :show="popupShow" mode="center" :safeAreaInsetBottom="false">
      <view class="video-popup-content">
        <video 
          class="video-player" 
          :src="currentVideoPath" 
          :controls="false" 
          :show-center-play-btn="false"
          :show-fullscreen-btn="false"
          :show-progress="true"
          :enable-progress-gesture="true"
          autoplay>
        </video>
        <!-- 关闭按钮 -->
        <view class="close-btn" @tap="closeVideoPopup">
          <image src="/static/find/close2.png" mode="widthFix" class="close-icon"></image>
        </view>
      </view>
    </u-popup>
  </scroll-view>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { getMomentsByCompanion, praiseMoment } from '@/api/discover.js'
import PictureDisplay from '@/components/common/PictureDisplay.vue'

// 获取页面参数
const params = ref({})

// 获取当前实例以访问全局属性
const { proxy } = getCurrentInstance()

// 动态列表数据
const momentsList = ref([])
const momentsLoading = ref(false)

// 分页相关状态
const currentPage = ref(1)
const pageSize = ref(20)
const loadingMore = ref(false)
const noMoreData = ref(false)
const refreshing = ref(false)

// 视频播放弹框相关状态
const popupShow = ref(false)
const currentVideoPath = ref('')

// 获取友伴师动态列表
const getMomentsData = async (isRefresh = false) => {
  if (!params.value.companion_id) return
  
  try {
    if (isRefresh) {
      refreshing.value = true
      currentPage.value = 1
      noMoreData.value = false
    } else if (currentPage.value === 1) {
      momentsLoading.value = true
    } else {
      loadingMore.value = true
    }
    
    const requestParams = {
      companion_id: parseInt(params.value.companion_id),
      page: currentPage.value,
      page_size: pageSize.value
    }
    
    const response = await getMomentsByCompanion(requestParams)
    console.log('动态列表响应:', response)
    
    if (response.data && response.data.code === 0) {
      const data = response.data.data
      if (data && data.moments_list) {
        if (isRefresh || currentPage.value === 1) {
          // 刷新或首次加载，替换数据
          momentsList.value = data.moments_list
        } else {
          // 加载更多，追加数据
          momentsList.value = [...momentsList.value, ...data.moments_list]
        }
        
        // 判断是否还有更多数据
        if (data.moments_list.length < pageSize.value) {
          noMoreData.value = true
        }
        
        console.log('动态列表数据:', momentsList.value)
      }
    } else {
      console.error('获取动态列表失败:', response.data?.message || '未知错误')
      if (!isRefresh && currentPage.value > 1) {
        // 加载更多失败时，回退页码
        currentPage.value--
      }
    }
  } catch (error) {
    console.error('获取动态列表异常:', error)
    if (!isRefresh && currentPage.value > 1) {
      // 加载更多失败时，回退页码
      currentPage.value--
    }
  } finally {
    momentsLoading.value = false
    loadingMore.value = false
    refreshing.value = false
  }
}

// 处理视频播放
const handlePlayVideo = (videoPath) => { 
  console.log('播放视频:', videoPath)
  currentVideoPath.value = videoPath
  popupShow.value = true
}

// 关闭视频弹框
const closeVideoPopup = () => {
  popupShow.value = false
  currentVideoPath.value = ''
}

// 点赞处理
const handlePraise = async (val) => {
  try {
    // 先更新本地状态，提供即时反馈
    const wasPraised = val.moments_info.is_praised
    val.moments_info.is_praised = !wasPraised
    
    if (val.moments_info.is_praised) {
      val.moments_info.praise_num = parseInt(val.moments_info.praise_num) + 1
    } else {
      val.moments_info.praise_num = Math.max(0, parseInt(val.moments_info.praise_num) - 1)
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
        val.moments_info.praise_num = parseInt(val.moments_info.praise_num) + 1
      } else {
        val.moments_info.praise_num = Math.max(0, parseInt(val.moments_info.praise_num) - 1)
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
      val.moments_info.praise_num = parseInt(val.moments_info.praise_num) + 1
    } else {
      val.moments_info.praise_num = Math.max(0, parseInt(val.moments_info.praise_num) - 1)
    }
    
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    })
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

// 上拉加载更多
const onScrollToLower = () => {
  console.log('触发上拉加载')
  if (loadingMore.value || noMoreData.value) {
    return
  }
  
  currentPage.value++
  getMomentsData()
}

// 下拉刷新
const onRefresh = () => {
  console.log('触发下拉刷新')
  getMomentsData(true)
}


onMounted(async () => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  params.value = currentPage.options || {}
  
  console.log('页面参数:', params.value)
  
  // 调用动态列表接口
  if (params.value.companion_id) {
    getMomentsData()
  }
})
</script>

<style scoped>
.dyn-container {
  background: #fff;
  height: 100vh;
  font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
}


/* 动态列表样式 */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #999;
}

.moments-list {
  padding: 0 24rpx;
}

.moment-item {
  display: flex;
  padding: 20rpx 0 20rpx 0rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.moment-item:last-child {
  border-bottom: none;
}

.moment-left {
  display: flex;
  flex-direction: column;
  margin-right: 24rpx;
  min-width: 120rpx;
}

.moment-day {
  font-size: 32rpx;
  font-weight: 400;
  color: #b3b3b3;
  margin-bottom: 4rpx;
}

.moment-time {
  font-size: 20rpx;
  font-weight: 300;
  color: #b3b3b3;
}

.moment-right {
  flex: 1;
  min-width: 0;
}

.copywriting {
  padding-left: 0;
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
  justify-content: flex-end;
  align-items: center;
  margin-left: 0;
}

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
  margin-right: 20rpx;
}

.empty-state-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 60rpx;
  text-align: center;
}

.empty-icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 32rpx;
  opacity: 0.6;
}

.empty-text-profile {
  font-size: 28rpx;
  color: #9999;
  font-weight: 600;
  margin-bottom: 16rpx;
}

/* 加载更多状态样式 */
.load-more-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx 0;
}

.load-more-text {
  font-size: 24rpx;
  color: #999;
}

.no-more-state {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx 0;
}

.no-more-text {
  font-size: 24rpx;
  color: #ccc;
}

/* 视频播放弹框样式 */
.video-popup-content {
  width: 100vw;
  background: transparent;
  padding: 0;
  margin: 0;
}

.video-player {
  width: 100vw;
  height: 100vh;
  background: transparent;
  border: none;
  outline: none;
  display: block;
}

.close-btn {
  position: absolute;
  bottom: 40rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 1);
  border-radius: 50%;
}

.close-icon {
  width: 40rpx;
  height: 40rpx;
}

/* 确保u-popup没有默认样式 */
:deep(.u-popup__content) {
  background-color: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
}

/* 确保视频元素没有默认样式 */
:deep(video) {
  background-color: transparent !important;
  border: none !important;
  outline: none !important;
  vertical-align: top !important;
}
</style>
