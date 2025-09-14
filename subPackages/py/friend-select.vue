<template>
    <view class="friends-container" v-if="userStore.switch == 1">
      <!-- 顶部区域 -->
      <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
        <view class="header-top">
          <image src="@/static/icons/common/arrow-left.png" class="back-icon" mode="aspectFit" @click="handleBack" />
          <CitySelector @click="showCityPicker = true" />
          <view class="search-container" :style="{ paddingRight: safeAreaRight + 'px' }">
            <image src="@/static/icons/friend/search.png" class="search-icon" mode="aspectFit" />
            <input v-model="search" class="search-input" placeholder="搜索关键词" @input="onSearchInput" />
          </view>
        </view>
        

        
  
      </view>
  
      <!-- 友伴列表 -->
      <view class="main-content">
        <scroll-view 
          class="partner-list" 
          scroll-y="true"
          @scrolltolower="loadMore"
          refresher-enabled
          :refresher-triggered="isRefreshing"
          @refresherrefresh="onRefresh"
        >
          <!-- 加载状态 -->
          <view v-if="loading && !dataLoaded" class="loading-state">
            <view class="loading-spinner"></view>
            <text class="loading-text">加载中...</text>
          </view>
          
          <!-- 友伴列表 -->
          <view v-else-if="processedPartnersList.length > 0">
            <view v-for="p in processedPartnersList" :key="p.id" class="partner-card" @click="navigateToDetail(p.id)">
              <view class="avatar-wrapper">
                <image :src="p.avatar" class="avatar" mode="aspectFill" />
                <view v-if="p.online" class="status-dot"></view>
              </view>
              <view class="partner-info">
                <view class="partner-name">
                    {{ p.name }}
                   
                  </view>
                <view class="flex-between">
                 <view class="flex">
                  <view>
                    <image src="@/static/icons/friend/female.png" mode="aspectFit" class="gender-icon" v-if="p.gender === '女'" />
                    <image src="@/static/icons/friend/male.png" class="gender-icon" mode="aspectFit" v-else/>
                    </view>
                     <view class="partner-meta">{{ p.age }}  ·  {{p.height }}cm  ·  {{ p.weight  }}kg</view>
  
                  </view>
                  <view class="partner-meta-distance" >
                    <image src="/static/icons/friend/address.png" class="distance-icon" mode="aspectFit" />
                    <text>{{ p.distance }}</text>
                  </view>
  
                </view>
            
               <view class="partner-tags">
                  <text v-for="(tag, index) in p.visibleTags" :key="index" class="tag">{{ tag }}</text>
                  <text v-if="p.extraTags > 0" class="more-tags">+{{ p.extraTags }}</text>
                </view>
                <view class="partner-actions flex-between">
                  <view ></view>
                  <view class="schedule-btn" @click.stop="openServicePopup(p)">
                    <text>立即邀约</text>
                  </view>
                </view>
              </view>
            </view>
            <view style="height: 20rpx;"></view>
          </view>
          
          <!-- 空状态 - 只在加载完成后且没有数据时显示 -->
          <view v-else-if="dataLoaded && processedPartnersList.length === 0" class="empty-state">
            <image src="/static/images/empty.png" class="empty-icon" mode="aspectFit" />
            <text class="empty-text">暂无友伴</text>
            <text class="empty-desc">更多精彩友伴即将上线</text>
          </view>
        </scroll-view>
      </view>
  

  
      <!-- 城市选择弹窗 -->
      <CityPicker 
        v-model:visible="showCityPicker" 
        @city-selected="onCitySelected"
      />
  
      <!-- 服务选择弹窗 -->
      <uni-popup ref="servicePopup" type="bottom" :mask-click="true" @close="closeServicePopup" round="20" :safe-area="false">
        <view class="service-popup-content">
          <view class="service-popup-header">
            <text class="service-popup-title">选择服务项目</text>
            <view class="close-popup-btn" @click="closeServicePopup">
              <image src="@/static/icons/friend/close.png" class="close-popup-icon" mode="aspectFit" />
            </view>
          </view>
          <view class="service-popup-body">
            <scroll-view 
              class="service-scroll-view" 
              scroll-y="true"
              :scroll-top="scrollTop"
              :scroll-with-animation="true"
            >
              <view v-if="currentPartnerServices.length > 0" class="service-list">
                <view class="service-item" v-for="item in currentPartnerServices" :key="item.title">
                  <image :src="$imgBaseUrl + item.service_image_url" class="service-img" mode="aspectFill" />
                  <view class="service-info">
                    <text class="service-title">{{ item.service_name }}</text>
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
              <view v-else class="empty-service-state">
                <image src="/static/images/empty.png" class="empty-service-icon" mode="aspectFit" />
                <text class="empty-service-text">~暂无服务项目~</text>
              </view>
            </scroll-view>
          </view>
        </view>
      </uni-popup>
    </view>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { searchCompanions, getCityServices } from '@/api/friends.js'
  import { createOrder, orderParams } from '@/api/order.js'
  import { useLevelStore } from '@/stores/level.js'
  import { useCityStore } from '@/stores/city.js'
  import { useUserStore } from '@/stores/user.js'
  import CitySelector from '@/components/common/CitySelector.vue'
  import CityPicker from '@/components/common/CityPicker.vue'


  // 状态栏高度和胶囊按钮信息
  const statusBarHeight = ref(0)
  const menuButtonInfo = ref(null)
  const safeAreaRight = ref(0)
  
  // 页面数据
  const search = ref('')
  const isRefreshing = ref(false)
  const showCityPicker = ref(false)
  const serviceId = ref('') // 接收服务ID参数
  
  // 定位相关 - 使用全局store
  const latitude = computed(() => cityStore.userLocation?.latitude || null)
  const longitude = computed(() => cityStore.userLocation?.longitude || null)
  const locationPermission = ref(false)
  
  // 获取全局城市store
  const cityStore = useCityStore()
  
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
  
  // 城市相关数据 - 使用全局store
  const cityList = computed(() => cityStore.cityList)
  const selectedCity = computed(() => cityStore.currentCity)
  

  
  // 友伴数据
  const partnersList = ref([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(20)
  const loading = ref(false)
  const hasMore = ref(true)
  const dataLoaded = ref(false) // 数据是否已加载完成
  
  // 获取全局level store
  const levelStore = useLevelStore()
  
  // 处理标签显示
  const processedPartnersList = computed(function() {
    return partnersList.value.map(function(partner) {
      const visibleTags = partner.tags ? partner.tags.slice(0, 3) : []
      const extraTags = partner.tags && partner.tags.length > 3 ? partner.tags.length - 3 : 0
      return {
        ...partner,
        visibleTags,
        extraTags
      }
    })
  })
  

  
  // 服务选择弹窗相关数据
  const servicePopup = ref(null)
  const currentPartnerServices = ref([])
  const currentPartner = ref(null)
  const scrollTop = ref(0)
  
  // 打开服务选择弹窗
  const openServicePopup = async (partner) => {
    currentPartner.value = partner
    
    try {
      // 获取该友伴师的服务信息
      const requestParams = {
        city_code: cityStore.currentCityCode,
        application_id: partner.id
      }
      
      // 添加经纬度参数
      if (latitude.value && longitude.value) {
        requestParams.latitude = parseFloat(latitude.value)
        requestParams.longitude = parseFloat(longitude.value)
      }
      
      const response = await getCityServices(requestParams)
      
      if (response.data && response.data.code === 0) {
        const data = response.data.data
        if (data && data.services && data.services.length > 0) {
          currentPartnerServices.value = data.services
      
        } else {
          currentPartnerServices.value = []
        }
      } else {
        currentPartnerServices.value = []
      }
    } catch (error) {
      console.error('获取服务信息失败:', error)
      currentPartnerServices.value = []
    }
    
    servicePopup.value.open()
  }
  
  // 关闭服务选择弹窗
  const closeServicePopup = () => {
    servicePopup.value.close()
  }
  
  // 跳转到订单提交页面
  const goToSubmit = (item) => {
    console.log('选择服务:', item)
    closeServicePopup()
    
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
    
    // 构建跳转URL，包含所有必要参数
    let url = `/subPackages/order/submit?service_id=${item.service_id}&price_template_id=${item.price_template_id || ''}&companion_id=${currentPartner.value.id}&level_order=${currentPartner.value.level_order || ''}&nickname=${currentPartner.value.name}`
    
    // 如果是从服务详情页跳转过来的，添加原始服务ID
    if (serviceId.value) {
      url += `&original_service_id=${serviceId.value}`
    }
    
    // 跳转到订单提交页面
    uni.navigateTo({
      url: url
    })
  }
  
  // 导航到详情页
  const navigateToDetail = (partnerId) => {
    let url = '/subPackages/py/detail?id=' + partnerId + '&city_code=' + cityStore.currentCityCode
    
    // 添加经纬度参数
    if (latitude.value && longitude.value) {
      url += '&latitude=' + latitude.value + '&longitude=' + longitude.value
    }
    
    uni.navigateTo({
      url: url
    })
  }
   
  // 获取定位权限和位置 - 使用全局store
  const getLocation = async () => {
    try {
      await cityStore.getUserLocation()
      if (cityStore.userLocation) {
        locationPermission.value = true
        console.log('获取位置成功:', cityStore.userLocation)
        
        // 定位成功后刷新数据
        await searchCompanionsData(true)
      } else {
        throw new Error('获取位置失败')
      }
      
    } catch (err) {
      console.error('获取位置失败:', err)
      locationPermission.value = false
      
      // 如果获取位置失败，提示用户去授权
      uni.showModal({
        title: '定位权限',
        content: '需要获取您的位置信息来提供更好的服务，请在设置中开启定位权限',
        confirmText: '去设置',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            // 引导用户去设置页面
            uni.openSetting({
              success: (settingRes) => {
                console.log('设置页面结果:', settingRes)
                // 如果用户授权了定位权限，重新获取位置
                if (settingRes.authSetting['scope.userLocation']) {
                  getLocation()
                }
              }
            })
          }
        }
      })
    }
  }
  
  // 加载城市列表 - 使用全局store
  const loadCityList = async () => {
    await cityStore.loadCityList()
  }
  
  // 搜索伴友师
  const searchCompanionsData = async (isRefresh = false) => {
    if (loading.value) return
    
    loading.value = true
    
    try {
      const params = {
        page: isRefresh ? 1 : currentPage.value,
        page_size: pageSize.value
      }
      
      // 使用全局store的城市代码
      if (cityStore.currentCityCode) {
        params.city_code = cityStore.currentCityCode
      }
      
      // 只有当搜索关键词存在时才添加
      if (search.value && search.value.trim()) {
          params.nickname = search.value.trim()
      }
      
      // 只有当定位成功时才添加经纬度
      if (latitude.value && longitude.value) {
        params.latitude = latitude.value
        params.longitude = longitude.value
      }
      
      // 如果有服务ID，添加到搜索参数中
      if (serviceId.value) {
        params.service_id = serviceId.value
      }
      

      
      console.log('搜索参数:', params)
      
      const response = await searchCompanions(params)
      
      console.log('API完整响应:', response)
      
      if (response.data && response.data.code === 0) {
        const data = response.data.data
        if (data && data.list) {
          const newData = data.list.map(item => ({
            id: item.id,
            name: item.nickname,
            gender: item.gender,
            age: item.age,
            height: item.height,
            weight: item.weight,
            distance: item.distance,
            tags: item.tags || [],
            services: (() => {
              if (typeof item.services === 'string') {
                try {
                  return JSON.parse(item.services)
                } catch (e) {
                  console.error('解析services JSON失败:', e)
                  return []
                }
              }
              return item.services || []
            })(), // 安全解析JSON字符串数组
            avatar: item.avatar ,
            online: item.is_online === 1,
            bookable: item.can_accept_orders === 'Y'
          }))
          
          if (isRefresh) {
            partnersList.value = newData
            currentPage.value = 1
          } else {
            partnersList.value = [...partnersList.value, ...newData]
            currentPage.value++
          }
          
          total.value = data.total || 0
          hasMore.value = newData.length === pageSize.value
          
          console.log('搜索成功，共获取', newData.length, '条数据，总数:', total.value)
          
          // 如果没有数据，显示提示
          if (newData.length === 0 && isRefresh) {
            // uni.showToast({
            //   title: '暂无符合条件的伴友师',
            //   icon: 'none',
            //   duration: 2000
            // })
          }
        } else {
          console.log('API返回数据为空')
          if (isRefresh) {
            partnersList.value = []
            total.value = 0
          }
         
        }
      } else {
        console.error('API返回错误:', response.data)
        const errorMsg = response.data?.message || '搜索失败'
        uni.showToast({
          title: errorMsg,
          icon: 'none',
          duration: 2000
        })
        
        if (isRefresh) {
          partnersList.value = []
          total.value = 0
        }
      }
    } catch (error) {
      console.error('搜索伴友师失败:', error)
      console.error('错误详情:', error.response || error)
      
      let errorMsg = '搜索失败，请重试'
      if (error.response && error.response.data) {
        errorMsg = error.response.data.message || errorMsg
      }
      
      uni.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000
      })
      
      if (isRefresh) {
        partnersList.value = []
        total.value = 0
      }
    } finally {
      loading.value = false
      dataLoaded.value = true // 标记数据已加载完成
    }
  }
  
  // 加载更多
  const loadMore = () => {
    if (!loading.value && hasMore.value) {
      searchCompanionsData(false)
    }
  }
  
  // 下拉刷新
  const onRefresh = async () => {
    isRefreshing.value = true
    await searchCompanionsData(true)
        // 模拟加载时间，确保用户能看到刷新动画
      await new Promise(resolve => setTimeout(resolve, 800))
    isRefreshing.value = false
  }
  
  // 监听搜索输入
  const onSearchInput = () => {
    // 防抖搜索
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      searchCompanionsData(true)
    }, 500)
  }
  
  let searchTimer = null
  
  // 返回按钮处理
  const handleBack = () => {
    uni.navigateBack({
      delta: 1
    })
  }
  
  // 城市选择相关方法 - 使用全局store
  // 选择城市（单选）- 直接生效
  const onCitySelected = async (index) => {
    // 提供触觉反馈
    uni.vibrateShort({
      type: 'light'
    })
    
    // 重新搜索数据
    await searchCompanionsData(true)
  }
  
  
  
  onMounted(async () => {
    // 获取页面参数
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const options = currentPage.options || {}
    
    // 接收service_id参数
    if (options.service_id) {
      serviceId.value = options.service_id
      console.log('接收到的服务ID:', serviceId.value)
    }
    
    // 获取状态栏高度和胶囊按钮信息
    const systemInfo = uni.getSystemInfoSync()
    statusBarHeight.value = systemInfo.statusBarHeight
    
    // 获取胶囊按钮信息（小程序特有）
    // #ifdef MP-WEIXIN
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
    menuButtonInfo.value = menuButtonInfo
    
    // 计算安全区域右边距
    const screenWidth = systemInfo.screenWidth
    const menuButtonRight = menuButtonInfo.right
    safeAreaRight.value = screenWidth - menuButtonRight + 24 // 24rpx的额外间距
    // #endif
    
    // 确保服务等级列表已加载
    await levelStore.fetchServiceLevels()
    
    // 初始化城市数据（获取位置和加载城市列表）
    await cityStore.initCityData()
    
    // 加载初始数据
    await searchCompanionsData(true)
  })
  
  onUnmounted(() => {
    if (searchTimer) {
      clearTimeout(searchTimer)
    }
  })
  </script>
  
  <style lang="scss" scoped>
  @import "@/styles/variables.scss";
  
  .friends-container {
    height: 100vh;
    background-color: #F7F8FA;
    display: flex;
    flex-direction: column;
  }
  
  .header {
    background: linear-gradient(135deg, #FFFFFF 0%, rgba(247, 248, 250, 0.95) 100%);
    padding: 20rpx 24rpx;
    border-bottom: none;
    box-shadow: 0 6rpx 24rpx rgba(130, 160, 216, 0.05);
    border-radius: 0 0 32rpx 32rpx;
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(20rpx);
    -webkit-backdrop-filter: blur(20rpx);
  }
  
  .header-top {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 20rpx;
  }
  
  .back-icon {
    width: 48rpx;
    height: 48rpx;
    padding: 8rpx;
    box-sizing: border-box;
  }
  
  
  
  .search-container {
    width: 350rpx;
    position: relative;
    display: flex;
    align-items: center;
    min-width: 0; /* 防止flex子元素溢出 */
    
    /* 小程序胶囊按钮适配 */
    /* #ifdef MP-WEIXIN */
    box-sizing: border-box;
    /* #endif */
  }
  
  .search-icon {
    position: absolute;
    left: 16rpx;
    top: 50%;
    transform: translateY(-50%);
    width: 28rpx;
    height: 28rpx;
    opacity: 0.5;
  }
  
  .search-input {
    width: 100%;
    padding: 0rpx 16rpx 0rpx 48rpx;
    border: none;
    background: rgba(115, 99, 255, 0.08);
    border-radius: 32rpx;
    font-size: 24rpx;
    color: #1A1A1A;
    height: 64rpx;
    box-sizing: border-box;
    line-height: 64rpx;
    
    &::placeholder {
      color: rgba(115, 99, 255, 0.6);
      font-size: 24rpx;
    }
  }
  

  
  
  
  .main-content {
    flex: 1;
    display: flex;
    overflow: hidden;
    box-sizing: border-box;
  }
  
  .partner-list {
    flex: 1;
    box-sizing: border-box;
  }
  
  .partner-card {
    display: flex;
    padding: 24rpx;
    background: #FFFFFF;
    border-radius: 24rpx;
    margin: 20rpx;
    box-sizing: border-box;
    box-shadow: 0 4rpx 16rpx rgba(115, 99, 255, 0.08);
    border: 1rpx solid rgba(115, 99, 255, 0.05);
  }
  
  .avatar-wrapper {
    position: relative;
    margin-right: 24rpx;
  }
  
  .avatar {
    width: 160rpx;
    height: 200rpx;
    border-radius: 16rpx;
  }
  
  .status-dot {
    position: absolute;
    top: 8rpx;
    right: 8rpx;
    width: 16rpx;
    height: 16rpx;
    background: #4CAF50;
    border-radius: 50%;
    border: 2rpx solid #FFFFFF;
  }
  
  .partner-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .partner-name-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8rpx;
  }
  
  .partner-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #1A1A1A;
    display: flex;
    align-items: center;
    gap: 8rpx;
  }
  
  .gender-icon {
    width: 28rpx;
    height: 28rpx;
    margin-right: 6rpx;
  }
  
  .partner-meta {
    font-size: 22rpx;
    color: #666666;
  
  }
  .partner-meta-distance {
    font-size: 20rpx;
    color: #007BFF;
    display: flex;
    align-items: center;
    gap: 6rpx;
  }
  
  .distance-icon {
    width: 20rpx;
    height: 20rpx;
  }
  .partner-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    margin-bottom: 16rpx;
  }
  
  .tag {
    font-size: 20rpx;
    color: #7363FF;
    background: rgba(115, 99, 255, 0.1);
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
    border: 1rpx solid rgba(115, 99, 255, 0.2);
  }
  
  .more-tags {
    font-size: 20rpx;
    color: #999999;
    background: rgba(153, 153, 153, 0.1);
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
  }
  
  .partner-actions {
    display: flex;
    gap: 12rpx;
  }
  
  .schedule-btn {
    width: auto;
    min-width: 160rpx;
    height: 64rpx;
    border-radius: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: 600;
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
    color: #FFFFFF;
    box-shadow: 0 4rpx 12rpx rgba(115, 99, 255, 0.3);
    padding: 0 32rpx;
    
    &:active {
      transform: scale(0.95);
    }
  }
  

  
  
  
  /* 空状态样式 */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 260rpx 60rpx;
    text-align: center;
  }
  
  .empty-icon {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 32rpx;
    opacity: 0.6;
  }
  
  .empty-text {
    font-size: 32rpx;
    color: #1A1A1A;
    font-weight: 600;
    margin-bottom: 16rpx;
  }
  
  .empty-desc {
    font-size: 24rpx;
    color: #666666;
    line-height: 1.4;
  }
  
  /* 加载状态样式 */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 60rpx;
    text-align: center;
  }
  
  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 6rpx solid #f0f0f0;
    border-top: 6rpx solid #7363ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 32rpx;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .loading-text {
    font-size: 28rpx;
    color: #666666;
    font-weight: 500;
  }
  
  /* 服务选择弹窗样式 */
  .service-popup-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #FFFFFF;
    border-radius: 24rpx 24rpx 0 0;
    overflow: hidden;
  }
  
  .service-popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32rpx;
    border-bottom: 1rpx solid rgba(115, 99, 255, 0.1);
  }
  
  .service-popup-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1A1A1A;
  }
  
  .close-popup-btn {
    padding: 8rpx;
  }
  
  .close-popup-icon {
    width: 32rpx;
    height: 32rpx;
  }
  
  .service-popup-body {
    flex: 1;
    padding: 24rpx 32rpx;
    box-sizing: border-box;
  }
  
  .service-scroll-view {
    height: 600rpx;
    width: 100%;
  }
  
  .service-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    padding-bottom: 20rpx;
  }
  
  .service-item {
    display: flex;
    align-items: center;
  
  
    box-sizing: border-box;
  }
  
  .service-img {
    width: 120rpx;
    height: 120rpx;
    border-radius: 12rpx;
    margin-right: 20rpx;
  }
  
  .service-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  
  .service-title-row {
    display: flex;
    align-items: center;
    gap: 8rpx;
  }
  
  .service-title {
    font-size: 24rpx;
    font-weight: 500;
    color: #1A1A1A;
  }
  
  .service-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    margin-top: 8rpx;
  }
  
  .service-tag {
    font-size: 18rpx;
    color: #7363FF;
    background: rgba(115, 99, 255, 0.1);
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
    border: 1rpx solid rgba(115, 99, 255, 0.2);
  }
  
  .service-bottom-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 8rpx;
  }
  
  .service-price {
    font-size: 24rpx;
    color: #f43f5e;
    font-weight: 600;
  }
  
  .order-btn {
    width: 160rpx;
    height: 64rpx;
    border-radius: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: 600;
    background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
    color: #FFFFFF;
    box-shadow: 0 4rpx 12rpx rgba(115, 99, 255, 0.3);
  }
  
  .empty-service-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 60rpx;
    text-align: center;
  }
  
  .empty-service-icon {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 32rpx;
    opacity: 0.6;
  }
  
  .empty-service-text {
    font-size: 32rpx;
    color: #1A1A1A;
    font-weight: 600;
    margin-bottom: 16rpx;
  }
  
  </style> 