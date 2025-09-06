<template>
    <scroll-view class="personal-data-container" scroll-y="true">
      <!-- 优化后的头部信息区 -->
      <view class="profile-header-block">
        <view class="header-row">
                      <view class="left-group">
              <view class="avatar-wrap">
              <image :src="proxy.$imgBaseUrl + user.avatar" class="avatar" mode="aspectFill" />
              <view class="online-dot"></view>
            </view>
            <view class="profile-meta">
              <view class="nickname-row">
                <text class="nickname">{{ user.nickname }}</text>
                <image v-if="user.verified && currentLevel" :src="currentLevel?.icon_url" class="verified-icon" mode="aspectFit" />
                <text v-if="currentLevel?.level_name" class="level-tag">{{ currentLevel?.level_name }}</text>
              </view>
             <view class="user-tags" v-if="user.tags && user.tags.length > 0">
                <text v-for="tag in user.tags" :key="tag" class="user-tag">{{ tag }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <!-- 轮播图及服务标签 -->
      <view class="carousel-header-wrap">
       <view class="profile-meta-topbar">
          <view class="meta-left">
            <image :src="user.gender === '女' ? '/static/icons/friend/white_nv.png' : '/static/icons/friend/white_nan.png'" class="meta-topbar-icon" mode="aspectFit" />
            <text>{{ user.age }}岁 | {{ user.weight }}kg | {{ user.height }}cm</text>
          </view>
          <view class="meta-right" v-if="user.distance !== ''">
            <image src="/static/icons/friend/white_dingwei.png" class="meta-topbar-icon" mode="aspectFit" />
            <text>{{ user.distance }}</text>
          </view>
        </view>
        <swiper class="banner-swiper-inner" :indicator-dots="true" :autoplay="true" :interval="4000" :duration="500">
          <swiper-item v-for="(item, idx) in banners" :key="idx">
            <image 
              :src="proxy.$imgBaseUrl + item.img" 
              class="banner-img" 
              mode="aspectFill"
              @click="previewImage(idx)"
            />
          </swiper-item>
        </swiper>
        <!-- 轮播图下方服务标签 -->
       <view class="service-tags-bar">
          <view class="service-tag-item">
            <image src="/static/icons/profile/handshake.png" class="service-tag-icon" mode="aspectFit" />
            <text>真人面试</text>
          </view>
          <view class="service-tag-item">
            <image src="/static/icons/profile/credit-card.png" class="service-tag-icon" mode="aspectFit" />
            <text>实名认证</text>
          </view>
          <view class="service-tag-item">
            <image src="/static/icons/profile/lse_icon.png" class="service-tag-icon" mode="aspectFit" />
            <text>绿色服务</text>
          </view>
        </view>
      </view>
      <!-- 顶部tab栏和内容区 -->
     <view class="profile-tabs">
        <view
          v-for="(tab, idx) in tabs"
          :key="tab"
          :class="['profile-tab', { active: activeTab === idx }]"
          @click="switchTab(idx)"
        >
          <text>{{ tab }}</text>
          <view v-if="activeTab === idx" class="tab-underline"></view>
        </view>
      </view>
      <view class="profile-tab-content">
        <!-- 提供项目 -->
        <view v-show="activeTab === 0">
          <view v-if="services.length > 0" class="service-list">
          <view class="service-item" v-for="item in services" :key="item.title">
            <image  :src="proxy.$imgBaseUrl + item.service_image_url"  class="service-img" mode="aspectFill" />
            <view class="service-info">
              <view class="service-title-row">
                <text class="service-title">{{ item.service_name}}</text>
              </view>
              <view class="service-tags">
                <text v-for="tag in item.service_tags" :key="tag" class="service-tag">{{ tag }}</text>
              </view>
              <view class="service-bottom-row">
                <text class="service-price">{{ item.price }}元/{{ item.unit || '小时' }}起</text>
                <view class="order-btn" @click="goToSubmit(item)">去下单</view>
              </view>
            </view>
          </view>
        </view>
          <view v-else class="empty-state-profile">
            <image src="/static/images/empty.png" class="empty-icon" mode="aspectFit" />
            <text class="empty-text-profile">~暂无服务项目~</text>
          </view>
        </view>
        <!-- TA的动态 -->
        <view v-show="activeTab === 1">
          <view v-if="momentsLoading" class="loading-state">
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
                  <view class="foot-set" @tap="setTrends(item)">
                    <image src="@/static/my/more@3x.png" mode="widthFix" class="foot-image"></image>
                    <view class="foot-status">{{ item.moments_info?.moments_status?.title }}</view>
                  </view>
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
          </view>
          <view v-else class="empty-state-profile">
            <image src="/static/images/empty.png" class="empty-icon" mode="aspectFit" />
            <text class="empty-text-profile">~暂无动态~</text>
          </view>
        </view>
        <!-- 客户评价 -->
        <view v-show="activeTab === 2">
          <view v-if="comments.length > 0">
            <view v-for="(comment, idx) in comments" :key="idx" class="comment-card">
              <view class="comment-header">
                <image :src="comment.avatar" class="comment-avatar" mode="aspectFill" />
                <view class="comment-user">
                  <text class="comment-name">{{ comment.name }}</text>
                  <view class="comment-stars">
                    <text v-for="n in 5" :key="n" :class="['star', { filled: n <= comment.stars }]">★</text>
                    <text class="comment-rate">{{ comment.stars >= 4 ? '好评' : '中评' }}</text>
                  </view>
                </view>
              </view>
              <view class="comment-tags">
                <text v-for="tag in comment.tags" :key="tag" class="comment-tag">{{ tag }}</text>
              </view>
              <view class="comment-content">{{ comment.content }}</view>
              <view class="comment-date">{{ comment.date }}</view>
            </view>
          </view>
          <view v-else class="empty-state-profile">
            <image src="/static/images/empty.png" class="empty-icon" mode="aspectFit" />
            <text class="empty-text-profile">~暂无评价~</text>
          </view>
        </view>
      </view> 
       <view style="height: 50rpx;"></view>
    </scroll-view>
  </template>
  
  <script setup>
import { ref, computed, onMounted, getCurrentInstance } from 'vue'
import { getCityServices } from '@/api/friends.js'
import { getMomentsByCompanion, praiseMoment } from '@/api/discover.js'
import { useLevelStore } from '@/stores/level.js'
import { useUserStore } from '@/stores/user.js'
import PictureDisplay from '@/components/common/PictureDisplay.vue'

  // 获取页面参数
  const params = ref({})

  // 获取当前实例以访问全局属性
  const { proxy } = getCurrentInstance()

  // 获取level store
  const levelStore = useLevelStore()
  
  // 用户状态管理
  const userStore = useUserStore()
  
  // 登录状态判断
  const isLoggedIn = computed(() => {
    return userStore.userInfo && Object.keys(userStore.userInfo).length > 0
  })
  
  // 用户信息
  const userInfo = computed(() => {
    if (isLoggedIn.value) {
      return userStore.userInfo
    }
  })
  
  // 导航到登录页面
  const navigateToLogin = () => {
    uni.navigateTo({
      url: '/subPackages/login/index'
    })
  }

  const tabs = ['提供项目', 'TA的动态', '客户评价']
  const activeTab = ref(0)
  function switchTab(idx) {
    activeTab.value = idx
  }

const user = ref({})
const banners = ref([])
const services = ref([])
const momentsList = ref([])
const momentsLoading = ref(false)

  // 计算当前等级信息
  const currentLevel = computed(() => {
    if (!user.value.level_order || !levelStore.sortedServiceLevels.length) {
      return null
    }
    return levelStore.sortedServiceLevels.find(level => level.level_order === user.value.level_order)
  })

  const comments = [

  ]

  // 跳转到提交订单页面
  // 传递参数说明：
  // service_id: 服务项目ID
  // price_template_id: 价格模板ID
  // application_id: 友伴师ID
  // level_order: 友伴师等级序号
  // nickname: 友伴师昵称
  const goToSubmit = (item) => {
    // 检查登录状态
    if (!isLoggedIn.value) {
      uni.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 2000
      })
      navigateToLogin()
      return
    }
    
    uni.navigateTo({
      url: `/subPackages/order/submit?service_id=${item.service_id}&price_template_id=${item.price_template_id || ''}&companion_id=${params.value.id}&level_order=${user.value.level_order || ''}&nickname=${user.value.nickname}`
    })
  }

  // 获取城市服务信息
const getCityServicesData = async () => {
  try {
    const requestParams = {
      city_code: params.value.city_code,
      application_id: params.value.id
    }
    
    // 添加经纬度参数
    if (params.value.latitude && params.value.longitude) {
      requestParams.latitude = parseFloat(params.value.latitude)
      requestParams.longitude = parseFloat(params.value.longitude)
    }
    
    const response = await getCityServices(requestParams)
      
      console.log('城市服务信息响应:', response)
      
      if (response.data && response.data.code === 0) {
        // 处理返回的数据
        const data = response.data.data
        console.log('城市服务数据:', data)
        
        // 更新用户信息
        if (data) {
                  user.value = {
          avatar: data.avatar,
          nickname: data.nickname || '未知用户',
          verified: true,
       
          age: data.age ,
          weight: data.weight ,
          height: data.height,
          distance: data.distance ,
          tags: data.tags || [], // 添加用户标签
          level_order: data.level_order, // 添加等级序号
          levelIcon: '', // 先设为空，通过computed获取
          gender: data.gender || '' // 添加性别字段
        }
          
          // 更新轮播图数据
          if (data.photos && data.photos.length > 0) {
            banners.value = data.photos.map(photo => ({
              img: photo
            }))
          }
          
          // 更新服务列表数据
          if (data.services && data.services.length > 0) {
            services.value = data.services
          }
       

        }
      } else {
        console.error('获取城市服务失败:', response.data?.message || '未知错误')
      }
    } catch (error) {
      console.error('获取城市服务异常:', error)
    }
  }

  // 获取友伴师动态列表
  const getMomentsData = async () => {
    if (!params.value.id) return
    
    try {
      momentsLoading.value = true
      const requestParams = {
        companion_id: parseInt(params.value.id),
        page: 1,
        page_size: 10
      }
      
      const response = await getMomentsByCompanion(requestParams)
      console.log('动态列表响应:', response)
      
      if (response.data && response.data.code === 0) {
        const data = response.data.data
        if (data && data.moments_list) {
          momentsList.value = data.moments_list
          console.log('动态列表数据:', momentsList.value)
        }
      } else {
        console.error('获取动态列表失败:', response.data?.message || '未知错误')
      }
    } catch (error) {
      console.error('获取动态列表异常:', error)
    } finally {
      momentsLoading.value = false
    }
  }

  // 预览图片
  const previewImage = (index) => {
    uni.previewImage({
      urls: banners.value.map(item => proxy.$imgBaseUrl + item.img),
      current: proxy.$imgBaseUrl + banners.value[index].img,
      indicator: 'number',
      loop: true,
      show: true,
      success: function(res) {
        console.log('图片预览成功', res);
      },
      fail: function(err) {
        console.error('图片预览失败', err);
      }
    });
  };

  // 预览动态图片
  const previewMomentImage = (index, fileList) => {
    const imageUrls = fileList
      .filter(file => !file.is_video)
      .map(file => file.path);
    
    if (imageUrls.length > 0) {
      uni.previewImage({
        urls: imageUrls,
        current: imageUrls[index],
        indicator: 'number',
        loop: true,
        show: true,
        success: function(res) {
          console.log('动态图片预览成功', res);
        },
        fail: function(err) {
          console.error('动态图片预览失败', err);
        }
      });
    }
  };

  // 处理视频播放
  const handlePlayVideo = (videoPath) => { 
    console.log('播放视频:', videoPath)
    // 可以在这里添加视频播放逻辑
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

  // 设置动态
  const setTrends = (item) => {
    // 可以在这里添加设置动态的逻辑
    console.log('设置动态:', item)
  }


  onMounted(async () => {
  // 确保服务等级列表已加载
  await levelStore.fetchServiceLevels()
  
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  params.value = currentPage.options || {}
  
  console.log('页面参数:', params.value)
  console.log('经纬度参数:', {
    latitude: params.value.latitude,
    longitude: params.value.longitude
  })
  
  // 调用城市服务接口
  if (params.value.id && params.value.city_code) {
    getCityServicesData()
  }
  
  // 调用动态列表接口
  if (params.value.id) {
    getMomentsData()
  }
})
  </script>
  
  <style scoped>
  .personal-data-container {
    background: #fff;
    height: 100vh;
    font-family: 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  }
  .profile-header-block {
    margin-top: 0;

    border-radius: 0 0 32rpx 32rpx;
    box-shadow: 0 4rpx 24rpx rgba(115,99,255,0.06);
    padding: 0rpx 0rpx 24rpx 20rpx;
    margin-bottom: 0;
    position: relative;
    z-index: 11;
  }
  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .left-group {
    display: flex;
    align-items: flex-start;
    flex: 1;
    min-width: 0;
    padding-right: 20rpx; /* 为胶囊按钮留出空间 */
  }

  .avatar-wrap {
    position: relative;
    margin-right: 18rpx;
  }
  .avatar {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
 
    object-fit: cover;

  }
  .online-dot {
    position: absolute;
    right: 6rpx;
    bottom: 6rpx;
    width: 16rpx;
    height: 16rpx;
    background: #19c37c;
    border: 2rpx solid #fff;
    border-radius: 50%;
  }
  .profile-meta {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    min-width: 0;
    flex: 1;
  }
  .nickname-row {
    display: flex;
    align-items: center;
    gap: 10rpx;
  }
  .nickname {
    font-size: 26rpx;
    font-weight: 600;
    color: #222;
    margin-right: 4rpx;
    max-width: 200rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .verified-icon {
    width:40rpx;
    height: 40rpx;
   
  }
  .level-tag {
    background: linear-gradient(90deg, #7363FF 0%, #FF69DE 100%);
    color: #fff;
    border-radius: 8rpx;
    padding: 2rpx 10rpx;
    font-size: 18rpx;
  }
  
  .user-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    margin-top: 8rpx;
    max-width: 100%;
    word-break: break-all;
    margin-right: 20rpx;
  }
  
  .user-tag {
    font-size: 18rpx;
    color: #7363FF;
    background: rgba(115, 99, 255, 0.1);
    padding: 4rpx 10rpx;
    border-radius: 12rpx;
    border: 1rpx solid rgba(115, 99, 255, 0.2);
    white-space: nowrap;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .carousel-header-wrap {
    position: relative;
    width: 100%;
  }
  .banner-swiper-inner {
    width: 100%;
    height: 420rpx;
    overflow: hidden;
  }
  .banner-img {
    width: 100%;
    height: 420rpx;
    object-fit: cover;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  .banner-img:active {
    transform: scale(0.98);
  }
  .profile-meta-topbar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 12;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24rpx;
    height: 56rpx;
    background: rgba(0,0,0,0.38);
    color: #fff;
    font-size: 26rpx;
    font-weight: 500;
    box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.10);
    backdrop-filter: blur(8rpx);
  }
  .meta-left, .meta-right {
    display: flex;
    align-items: center;
    gap: 8rpx;
    font-size: 24rpx;
  }
  .meta-topbar-icon {
    width: 28rpx;
    height: 28rpx;
  }
  .service-tags-bar {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 9;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: rgba(0,0,0,0.38);
    padding: 18rpx 0 12rpx 0;
    backdrop-filter: blur(8rpx);
  }
  .service-tag-item {
    display: flex;
    align-items: center;
    gap: 8rpx;
    color: #fff;
    font-size: 24rpx;
    font-weight: 500;
  }
  .service-tag-icon {
    width: 32rpx;
    height: 32rpx;
  }
  .service-section {
    margin-top: 24rpx;
    padding: 0 24rpx;
  }
  .service-tabs {
    display: flex;
    border-bottom: 2rpx solid #f0f0f0;
    margin-bottom: 18rpx;
  }
  .tab {
    font-size: 28rpx;
    color: #888;
    margin-right: 32rpx;
    padding-bottom: 12rpx;
  }
  .tab.active {
    color: #7363FF;
    border-bottom: 4rpx solid #7363FF;
    font-weight: 600;
  }
  .service-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
  }
  .service-item {
    display: flex;
    background: #faf9ff;
    border-radius: 18rpx;
    box-shadow: 0 2rpx 8rpx rgba(115, 99, 255, 0.06);
    padding: 18rpx;
    align-items: center;
  }
  .service-img {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    object-fit: cover;
    margin-right: 18rpx;
  }
  .service-info {
    flex: 1;
  }
  .service-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8rpx;
  }
  .service-title {
    font-size: 28rpx;
    font-weight: 600;
  }
  .service-hot {
    font-size: 20rpx;
    color: #ff4757;
    margin-left: 12rpx;
  }
  .service-tags {
    display: flex;
    gap: 12rpx;
    margin-bottom: 8rpx;
  }
  .service-tag {
    font-size: 18rpx;
    background: linear-gradient(135deg, rgba(108, 117, 125, 0.08) 0%, rgba(248, 249, 250, 0.6) 100%);
    color: #495057;
    padding: 2rpx 10rpx;
    border-radius: 16rpx;
    font-weight: 600;
    border: 1rpx solid rgba(108, 117, 125, 0.12);
    backdrop-filter: blur(8rpx);
    -webkit-backdrop-filter: blur(8rpx);
    transition: all 0.3s;
  }
  .service-tag:active {
    transform: scale(0.95);
    background: linear-gradient(135deg, rgba(255, 105, 222, 0.1) 0%, rgba(255, 255, 255, 0.8) 100%);
    color: #FF69DE;
    border-color: rgba(255, 105, 222, 0.2);
  }
  .service-bottom-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .service-price {
    font-size: 24rpx;
    color: #ff4757;
    font-weight: 600;
  }
  .order-btn {
    padding: 12rpx 36rpx;
    background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
    color: #fff;
    font-weight: 600;
    font-size: 26rpx;
    border-radius: 9999rpx;
    box-shadow: 0 4rpx 12rpx rgba(115,99,255,0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 160rpx;
    min-height: 56rpx;
    border: none;
    margin-left: 18rpx;
    transition: background 0.2s;
  }
  .order-btn:active {
    opacity: 0.85;
  }
  .profile-tabs {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    border-radius: 24rpx;
    margin: 0rpx 24rpx 0 24rpx;
    box-shadow: 0 4rpx 24rpx rgba(115,99,255,0.06);
    padding: 0 8rpx;
 
  }
  .profile-tab {
    flex: 1;
    text-align: center;
    font-size: 30rpx;
    color: #888;
    font-weight: 500;
    position: relative;
    padding: 24rpx 0 18rpx 0;
    transition: color 0.2s;
  }
  .profile-tab.active {
    color: #7363FF;
    font-weight: 700;
  }
  .tab-underline {
    position: absolute;
    left: 25%;
    bottom: 10rpx;
    width: 50%;
    height: 6rpx;
    background: linear-gradient(90deg, #7363FF 0%, #FF69DE 100%);
    border-radius: 3rpx;
  }
  .profile-tab-content {
    min-height: 320rpx;
    background: #fff;
    border-radius: 24rpx;
    margin: 0 24rpx 24rpx 24rpx;
    box-shadow: 0 4rpx 24rpx rgba(115,99,255,0.06);
    padding: 24rpx 0 0 0;
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
  .comment-card {
    background: #fff;
    border-radius: 24rpx;
    box-shadow: 0 4rpx 24rpx rgba(115,99,255,0.06);
    margin-bottom: 28rpx;
    padding: 32rpx 28rpx 18rpx 28rpx;
  }
  .comment-header {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;
  }
  .comment-avatar {
    width: 64rpx;
    height: 64rpx;
    border-radius: 50%;
    margin-right: 18rpx;
    background: #f5f6ff;
  }
  .comment-user {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  .comment-name {
    font-size: 28rpx;
    color: #222;
    font-weight: 600;
  }
  .comment-stars {
    display: flex;
    align-items: center;
    margin-top: 2rpx;
  }
  .star {
    font-size: 26rpx;
    color: #e0e0e0;
    margin-right: 2rpx;
  }
  .star.filled {
    color: #FFB400;
  }
  .comment-rate {
    font-size: 22rpx;
    color: #7363FF;
    margin-left: 10rpx;
    font-weight: 500;
  }
  .comment-tags {
    display: flex;
    gap: 12rpx;
    margin-bottom: 8rpx;
  }
  .comment-tag {
    font-size: 22rpx;
    background: linear-gradient(135deg, #f5f6ff 0%, #f8f9fb 100%);
    color: #7363FF;
    padding: 4rpx 16rpx;
    border-radius: 16rpx;
    font-weight: 500;
  }
  .comment-content {
    font-size: 26rpx;
    color: #333;
    margin-bottom: 8rpx;
  }
  .comment-date {
    font-size: 22rpx;
    color: #bbb;
    text-align: right;
  }
  .bottom-fixed-btn {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 99;
    background: #fff;
    box-shadow: 0 -2rpx 12rpx rgba(115,99,255,0.06);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 24rpx 0 env(safe-area-inset-bottom, 24rpx) 0;
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
    padding: 40rpx 0 20rpx;
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
    margin-top: 38rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-left: 0;
  }
  .foot-image {
    width: 44rpx;
    height: 44rpx;
  }
  .foot-set {
    display: flex;
    align-items: center;
  }
  .foot-status {
    margin-left: 14rpx;
    font-size: 20rpx;
    color: #ccc;
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
  </style> 