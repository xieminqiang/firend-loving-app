<template>
  <view class="friends-container">
    <!-- 顶部区域 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="header-top">
        <CitySelector @click="showCityPicker = true" />
        <view class="search-container" :style="{ paddingRight: safeAreaRight + 'px' }">
          <image src="@/static/icons/friend/search.png" class="search-icon" mode="aspectFit" />
          <input v-model="search" class="search-input" placeholder="搜索友伴" @input="onSearchInput" />
        </view>
      </view>
      
      <!-- 重新设计的筛选栏 -->
      <view class="filter-bar">
        <view class="filter-item" @click="refreshRecommend">
          <text>推荐</text>
          <image src="@/static/icons/friend/tuijian.png" class="recommend-icon" mode="aspectFit" />
        </view>
        <view class="filter-item" @click="openFilterModal('gender')">
          <text>{{ getGenderFilterText }}</text>
          <image src="@/static/icons/friend/chevron-down.png" class="filter-arrow" mode="aspectFit" />
        </view>
        <view class="filter-item" @click="openFilterModal('level')">
          <text>{{ getLevelFilterText }}</text>
          <image src="@/static/icons/friend/chevron-down.png" class="filter-arrow" mode="aspectFit" />
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

    <!-- 筛选弹窗 -->
    <view class="filter-modal" v-if="activeModal" @click="closeModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ getModalTitle }}</text>
          <view class="close-btn" @click="closeModal">
            <image src="@/static/icons/friend/close.png" class="close-icon" mode="aspectFit" />
          </view>
        </view>
        <view class="modal-body">
          <view 
            v-for="option in getFilterOptions" 
            :key="option.value"
            :class="['filter-option', { selected: isOptionSelected(option.value) }]"
            @click="selectOption(option.value)"
          >
            <view class="option-icon" v-if="option.icon">
              <image :src="option.icon" class="option-icon-img" mode="aspectFit" />
            </view>
            <view style="height: 48rpx;" v-else>
          
            </view>
            <text class="option-label">{{ option.label }}</text>
            <view class="option-check" v-if="isOptionSelected(option.value)">
              <image src="@/static/icons/friend/check.png" class="check-icon" mode="aspectFit" />
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="reset-btn" @click="resetFilter">重置</button>
          <button class="apply-btn" @click="applyFilter">确定</button>
        </view>
      </view>
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
                <image :src="item.img" class="service-img" mode="aspectFill" />
                <view class="service-info">
                  <text class="service-title">{{ item.title }}</text>
                  <view class="service-tags">
                    <text v-for="tag in item.tags" :key="tag" class="service-tag">{{ tag }}</text>
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

// 定位相关 - 使用全局store
const latitude = computed(() => cityStore.userLocation?.latitude || null)
const longitude = computed(() => cityStore.userLocation?.longitude || null)
const locationPermission = ref(false)

// 获取全局城市store
const cityStore = useCityStore()

// 城市相关数据 - 使用全局store
const cityList = computed(() => cityStore.cityList)
const selectedCity = computed(() => cityStore.currentCity)

// 筛选相关
const activeModal = ref('')
const genderFilter = ref('all')
const distanceFilter = ref('all')
const levelFilter = ref('all')
const sortFilter = ref('recommend')

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

// 获取筛选显示文本
const getGenderFilterText = computed(() => {
  const texts = {
    all: '性别',
    female: '女生',
    male: '男生'
  }
  return texts[genderFilter.value] || '性别'
})

const getDistanceFilterText = computed(() => {
  const texts = {
    all: '距离',
    '1km': '1km内',
    '3km': '3km内',
    '5km': '5km内',
    '10km': '10km内'
  }
  return texts[distanceFilter.value] || '距离'
})

const getLevelFilterText = computed(() => {
  if (levelFilter.value === 'all') return '级别'
  
  // 从全局缓存的服务等级列表中查找对应的等级名称
  const selectedLevel = levelStore.sortedServiceLevels.find(level => level.level_order.toString() === levelFilter.value)
  return selectedLevel ? selectedLevel.level_name : '级别'
})

const getSortFilterText = computed(() => {
  const texts = {
    distance: '距离',
    rating: '评分',
    new: '最新'
  }
  return texts[sortFilter.value] || '排序'
})

// 获取弹窗标题
const getModalTitle = computed(function() {
  const titles = {
    gender: '选择性别',
    distance: '选择距离',
    level: '选择级别',
    sort: '排序方式'
  }
  return titles[activeModal.value] || ''
})

// 获取筛选选项
const getFilterOptions = computed(function() {
  const options = {
    gender: [
      { value: 'all', label: '不限性别' },
      { value: 'female', label: '女生', icon: '/static/icons/friend/female.png' },
      { value: 'male', label: '男生', icon: '/static/icons/friend/male.png' }
    ],
    level: [
      { value: 'all', label: '不限级别' },
      // 动态生成级别选项，使用全局缓存的服务等级列表
      ...levelStore.sortedServiceLevels.map(level => ({
        value: level.level_order.toString(),
        label: `${level.level_name}`,
        icon: level.icon_url || '/static/icons/friend/star.png'
      }))
    ],
    sort: [
      { value: 'recommend', label: '推荐排序', icon: '/static/icons/friend/thumbs-up.png' },
      { value: 'distance', label: '距离最近', icon: '/static/icons/friend/location.png' },
      { value: 'rating', label: '评分最高', icon: '/static/icons/friend/star.png' },
      { value: 'new', label: '最新加入', icon: '/static/icons/friend/bolt.png' }
    ]
  }
  return options[activeModal.value] || []
})

// 判断选项是否被选中
const isOptionSelected = (value) => {
  const filters = {
    gender: genderFilter,
    distance: distanceFilter,
    level: levelFilter,
    sort: sortFilter
  }
  return filters[activeModal.value].value === value
}

// 选择选项
const selectOption = (value) => {
  const filters = {
    gender: genderFilter,
    distance: distanceFilter,
    level: levelFilter,
    sort: sortFilter
  }
  filters[activeModal.value].value = value
}

// 打开筛选弹窗
const openFilterModal = (modalType) => {
  activeModal.value = modalType
}

// 关闭筛选弹窗
const closeModal = () => {
  activeModal.value = ''
}

// 重置筛选
const resetFilter = () => {
  const filters = {
    gender: genderFilter,
    distance: distanceFilter,
    level: levelFilter,
    sort: sortFilter
  }
  filters[activeModal.value].value = 'all'
}

// 应用筛选
const applyFilter = () => {
  console.log('应用筛选:', {
    gender: genderFilter.value,
    distance: distanceFilter.value,
    level: levelFilter.value,
    sort: sortFilter.value
  })
  closeModal()
  // 重新搜索数据
  searchCompanionsData(true)
}

// 刷新推荐（清除筛选条件）
const refreshRecommend = () => {
  console.log('刷新推荐，清除筛选条件')
  // 清除性别和级别筛选条件
  genderFilter.value = 'all'
  levelFilter.value = 'all'
  // 重新搜索数据
  searchCompanionsData(true)
}

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
        currentPartnerServices.value = data.services.map(service => ({
          title: service.service_name,
          img: "https://sygx-server-bucket-admin.oss-cn-shanghai.aliyuncs.com" + service.service_image_url || '',
          tags: service.service_tags || [],
          price: service.price,
          service_id: service.service_id,
          price_template_id: service.price_template_id || '',
          unit: service.unit,
          min_quantity: service.min_quantity
		
        })) 
	
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
  
  // 跳转到订单提交页面
  uni.navigateTo({
    url: `/subPackages/order/submit?service_id=${item.service_id}&price_template_id=${item.price_template_id || ''}&companion_id=${currentPartner.value.id}&level_order=${currentPartner.value.level_order || ''}&nickname=${currentPartner.value.name}`
  })
}

// 导航到详情页
const navigateToDetail = (partnerId) => {
  let url = '/subPackages/friend/detail?id=' + partnerId + '&city_code=' + cityStore.currentCityCode
  
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
    
    // 添加筛选条件
    if (genderFilter.value !== 'all') {
      params.gender = genderFilter.value === 'female' ? '女' : '男'
    }
    
    if (levelFilter.value !== 'all') {
      // 使用全局缓存的服务等级列表中的level_order
      params.level_order = parseInt(levelFilter.value)
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

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6rpx 0;
  gap: 12rpx;
}

.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  padding: 12rpx 16rpx;
  transition: all 0.2s ease;
  border-radius: 16rpx;
  
  &:active {
    transform: scale(0.95);
    background: rgba(115, 99, 255, 0.1);
  }
}

.filter-item text {
  font-size: 22rpx;
  color: #666666;
  font-weight: 500;
}

.filter-arrow {
  width: 24rpx;
  height: 24rpx;
}

.recommend-icon {
  width: 24rpx;
  height: 24rpx;
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

/* 筛选弹窗样式 */
.filter-modal {
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

.modal-content {
  width: 90%;
  max-width: 600rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
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

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid rgba(115, 99, 255, 0.1);
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.close-btn {
  padding: 8rpx;
}

.close-icon {
  width: 32rpx;
  height: 32rpx;
}

.modal-body {
  padding: 24rpx 32rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.filter-option {
  display: flex;
  align-items: center;
  padding: 20rpx 20rpx;
  gap: 20rpx;
  box-sizing: border-box;
  border-radius: 10rpx;
  &.selected {
    background: rgba(115, 99, 255, 0.05);
  }
}

.option-icon {
  width: 48rpx;
  height: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.option-icon-img {
  width: 40rpx;
  height: 40rpx;
}

.option-label {
  flex: 1;
  font-size: 24rpx;
  color: #1A1A1A;
}

.check-icon {
  width: 32rpx;
  height: 32rpx;
}

.modal-footer {
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  border-top: 1rpx solid rgba(115, 99, 255, 0.1);
}

.reset-btn, .apply-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.reset-btn {
  background: rgba(115, 99, 255, 0.1);
  color: #666666;
}

.apply-btn {
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  color: #FFFFFF;
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