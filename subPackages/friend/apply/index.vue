<template>
  <view class="apply-container">
    <!-- 顶部横幅 -->
    <view class="header-banner">
      <!-- 返回按钮 -->
      <view class="nav-back" @click="handleBack">
        <image src="@/static/icons/back-simple.png" class="back-icon" mode="aspectFit"></image>
      </view>
      
      <view class="banner-bg">
        <view class="bg-gradient"></view>
        <view class="floating-elements">
          <view class="float-heart float-1">💜</view>
          <view class="float-star float-2">✨</view>
          <view class="float-circle float-3"></view>
          <view class="float-heart float-4">💖</view>
        </view>
      </view>
      <view class="banner-content">
        <!-- <view class="banner-icon">
          <view class="icon-circle">
            <text class="icon-emoji">🌸</text>
          </view>
        </view> -->
        <view class="banner-text">
          <!-- <view class="challenge-text">遇见心动的陪伴</view> -->
          <view class="recruit-title">友伴招募</view>
          <view class="recruit-desc">遇见心动的陪伴，开启你的陪伴之旅 ✨</view>
        </view>
      </view>
    </view>

    <!-- 可滚动内容区域 -->
    <view class="main-content">
      <scroll-view 
        class="scroll-container" 
        scroll-y="true"
     
      >
        <!-- 表单内容 -->
        <view class="form-container">
          <!-- 个人信息卡片 -->
          <view class="info-card modern-card">
            <view class="card-header">
              <view class="header-content">
                <view class="section-indicator"></view>
                <view class="header-text">
                  <text class="card-title">个人信息</text>
                  <text class="card-subtitle">让大家更了解你</text>
                </view>
              </view>
            </view>
            
            <view class="form-content">
              <!-- 昵称 -->
              <view class="input-group">
                <text class="input-label">昵称</text>
                <view class="input-wrapper">
                  <input 
                    class="modern-input" 
                    v-model="formData.nickname" 
                    placeholder="给自己起个好听的昵称吧~" 
                    placeholder-class="input-placeholder"
                  />
                  <view class="input-icon">✨</view>
                </view>
              </view>

              <!-- 性别 -->
              <view class="input-group">
                <text class="input-label">性别</text>
                <view class="gender-selector">
                  <view 
                    class="gender-chip" 
                    :class="{ active: formData.gender === 'male' }"
                    @click="selectGender('male')"
                  >
                    <image src="@/static/icons/friend/male.png" class="gender-icon" mode="aspectFit" />
                    <text class="chip-text">男生</text>
                  </view>
                  <view 
                    class="gender-chip" 
                    :class="{ active: formData.gender === 'female' }"
                    @click="selectGender('female')"
                  >
                    <image src="@/static/icons/friend/female.png" mode="aspectFit" class="gender-icon" />
                    <text class="chip-text">女生</text>
                  </view>
                </view>
              </view>

              <!-- 基本信息 - 水平布局 -->
                <!-- 年龄 -->
                <view class="input-group">
                  <text class="input-label">年龄</text>
                  <view class="input-wrapper">
                    <input 
                      class="modern-input" 
                      v-model="formData.age" 
                      type="number"
                      placeholder="请输入年龄 (18-65岁)" 
                      placeholder-class="input-placeholder"
                    />
                    <view class="input-icon">🎂</view>
                  </view>
                </view>

                <!-- 身高 -->
                <view class="input-group">
                  <text class="input-label">身高</text>
                  <view class="input-wrapper">
                    <input 
                      class="modern-input" 
                      v-model="formData.height" 
                      type="number"
                      placeholder="请输入身高 (单位:cm)" 
                      placeholder-class="input-placeholder"
                    />
                    <view class="input-icon">📏</view>
                  </view>
                </view>

                <!-- 体重 -->
                <view class="input-group">
                  <text class="input-label">体重</text>
                  <view class="input-wrapper">
                    <input 
                      class="modern-input" 
                      v-model="formData.weight" 
                      type="number"
                      placeholder="请输入体重 (单位:kg)" 
                      placeholder-class="input-placeholder"
                    />
                    <view class="input-icon">⚖️</view>
                  </view>
                </view>

                <!-- 申请区域 -->
                <view class="input-group">
                  <text class="input-label">申请区域</text>
                  <view class="input-wrapper">
                    <view class="city-input" @click="showCitySelector">
                      <text class="city-display" v-if="selectedCities.length === 0">请选择服务区域</text>
                      <text class="city-display" v-else>已选{{ selectedCities.length }}个区域</text>
                      <view class="input-icon city-icon">📍</view>
                    </view>
                  </view>
                </view>
                
                <!-- 已选区域展示 -->
                <view class="selected-cities" v-if="selectedCities.length > 0">
                  <view 
                    class="city-tag" 
                    v-for="city in selectedCities" 
                    :key="city"
                    @click="removeCityFromSelection(city)"
                  >
                    <text class="city-tag-text">{{ city }}</text>
                    <text class="city-tag-remove">×</text>
                  </view>
                </view>
            </view>
          </view>

          <!-- 生活照片卡片 -->
          <view class="photo-card modern-card">
            <view class="card-header">
              <view class="header-content">
                <view class="section-indicator"></view>
                <view class="header-text">
                  <text class="card-title">生活照片</text>
                  <text class="card-subtitle">展示最真实美好的你 ✨</text>
                </view>
              </view>
            </view>
            
            <view class="photo-gallery">
              <view 
                class="photo-item" 
                v-for="(photo, index) in photos" 
                :key="index"
                @click="previewPhoto(index)"
              >
                <image :src="photo" class="photo-img" mode="aspectFill" />
                <view class="photo-overlay">
                  <view class="photo-remove" @click.stop="deletePhoto(index)">
                    <text class="remove-text">×</text>
                  </view>
                </view>
              </view>
              <view 
                class="photo-add" 
                v-if="photos.length < 6"
                @click="addPhoto"
              >
                <view class="add-content">
                  <view class="add-icon-circle">
                    <view class="add-plus">+</view>
                  </view>
                  <text class="add-text">添加照片</text>
                </view>

              </view>
            </view>
          </view>

          <!-- 服务技能卡片 -->
          <view class="skills-card modern-card">
            <view class="card-header">
              <view class="header-content">
                <view class="section-indicator"></view>
                <view class="header-text">
                  <text class="card-title">服务技能</text>
                  <text class="card-subtitle">选择你最擅长的陪伴方式</text>
                </view>
              </view>
            </view>
            
            <!-- 加载状态 -->
            <view v-if="servicesLoading" class="services-loading">
              <view class="loading-spinner"></view>
              <text class="loading-text">加载服务技能中...</text>
            </view>
            
            <!-- 无城市选择提示 -->
            <view v-else-if="selectedCities.length === 0" class="no-city-tip">
              <text class="tip-text">请先选择服务区域，然后选择您提供的服务技能</text>
            </view>
            
            <!-- 服务技能列表 -->
            <view v-else-if="skillCategories.length > 0" class="skills-wrapper">
              <view 
                v-for="category in skillCategories" 
                :key="category.id"
                class="category-section"
              >
                <!-- 分类标题 -->
                <view class="category-header">
                  
                  <text class="category-title">{{ category.name }}</text>
            
                </view>
                
                <!-- 该分类下的服务技能 -->
                <view class="skills-container">
                  <view 
                    class="skill-item"
                    :class="{ selected: selectedSkills.includes(service.id) }"
                    v-for="service in category.services"
                    :key="service.id"
                    @click="toggleSkill(service)"
                  >
                    <view class="skill-content">
                      <text class="skill-name">{{ service.name }}</text>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            
            <!-- 暂无服务提示 -->
            <view v-else class="no-services-tip">
              <text class="tip-text">该区域暂无可申请的服务，请选择其他区域</text>
            </view>
          </view>


        </view>

          <view style="height: 100rpx;"></view>
      </scroll-view>
    </view>

    <!-- 底部固定提交按钮 -->
    <view class="submit-area">
      <!-- 协议确认 -->
      <view class="agreement-section">
        <view class="agreement-checkbox" @click="toggleAgreement">
          <view class="checkbox" :class="{ checked: agreementAccepted }">
            <text class="checkbox-icon" v-if="agreementAccepted">✓</text>
          </view>
          <view class="agreement-text-wrapper">
            <text class="agreement-text">我已阅读并同意</text>
            <text class="agreement-link" @click.stop="viewAgreement">《友伴服务协议》</text>
          </view>
        </view>
      </view>
      
      <view 
        class="submit-btn" 
        :class="{ disabled: isSubmitting || !agreementAccepted }"
        @click="submitApplication"
      >
        <view class="btn-gradient"></view>
        <view class="btn-content">
          <text class="btn-text" v-if="!isSubmitting">开启陪伴之旅</text>
          <text class="btn-text" v-else>提交中...</text>
       
        </view>
      
      </view>
    </view>

    <!-- 城市选择弹窗 -->
    <view v-if="showCityPicker" class="city-picker-overlay" @click="hideCitySelector">
      <view class="city-picker-container" @click.stop>
        <view class="city-picker-header">
          <text class="picker-title">选择服务区域</text>
          <text class="picker-subtitle">可选择多个服务区域</text>
          <view class="picker-close" @click="hideCitySelector">
            <text>✕</text>
          </view>
        </view>
        <view class="city-picker-content">
          <!-- 加载状态 -->
          <view v-if="cityLoading" class="loading-container">
            <view class="loading-spinner"></view>
            <text class="loading-text">加载服务区域列表中...</text>
          </view>
          
          <!-- 城市列表 -->
          <view v-else class="city-grid">
            <view 
              v-for="(cityItem, index) in cityList" 
              :key="index"
              :class="['city-item', { 
                active: tempSelectedCities.includes(cityItem.name)
              }]"
              @click="toggleCitySelection(cityItem.name)"
            >
              <text class="city-name">{{ cityItem.name }}</text>
              <view v-if="tempSelectedCities.includes(cityItem.name)" class="city-check">✓</view>
            </view>
          </view>
        </view>
        <view class="picker-footer">
          <view class="selected-count">已选择 {{ tempSelectedCities.length }} 个区域</view>
          <view class="confirm-btn" @click="confirmCitySelection">
            <text>确认选择</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { createCompanionApplication, getServicesByCities } from '@/api/user.js'
import { getCityList } from '@/api/home.js'

// 下拉刷新状态
const isRefreshing = ref(false)

// 提交状态
const isSubmitting = ref(false)

// 协议确认状态
const agreementAccepted = ref(false)

// 表单数据
const formData = reactive({
  nickname: '',
  gender: '',
  age: '',
  height: '',
  weight: '',
  city: '深圳市'  // 保留原有字段用于兼容
})

// 城市选择相关数据
const showCityPicker = ref(false)
const selectedCities = ref([]) // 已确认选择的城市
const tempSelectedCities = ref([]) // 临时选择状态（弹窗中的选择）
const cityList = ref([]) // 从API获取城市列表
const cityLoading = ref(false) // 城市加载状态

// 照片数组
const photos = ref([])

// 服务技能相关数据
const serviceSkills = ref([]) // 从接口获取的服务列表
const selectedSkills = ref([]) // 选中的服务ID
const servicesLoading = ref(false) // 服务加载状态

// 服务技能分组数据
const skillCategories = ref([]) // 按分类分组的服务技能

// 加载服务技能列表
const loadServicesByCity = async () => {
  if (selectedCities.value.length === 0) {
    serviceSkills.value = []
    skillCategories.value = []
    return
  }
  
  servicesLoading.value = true
  try {
    // 获取城市代码列表
    const cityCodes = selectedCities.value.map(cityName => {
      const city = cityList.value.find(c => c.name === cityName)
      return city ? city.code : null
    }).filter(code => code !== null)
    
    if (cityCodes.length === 0) {
      console.warn('未找到有效的城市代码')
      serviceSkills.value = []
      skillCategories.value = []
      return
    }
    
    const response = await getServicesByCities(cityCodes)
    
    if (response.data && response.data.code === 0 && response.data.data) {
      serviceSkills.value = response.data.data
      
      // 按分类对服务技能进行分组
      groupServicesByCategory()
      
      console.log('服务技能列表加载成功:', serviceSkills.value)
      console.log('服务技能分组:', skillCategories.value)
    } else {
      console.warn('获取服务技能列表失败')
      serviceSkills.value = []
      skillCategories.value = []
    }
  } catch (error) {
    console.error('获取服务技能列表失败:', error)
    serviceSkills.value = []
    skillCategories.value = []
  } finally {
    servicesLoading.value = false
  }
}

// 按分类对服务技能进行分组
const groupServicesByCategory = () => {
  const categoryMap = {}
  
  // 按分类分组
  serviceSkills.value.forEach(service => {
    const categoryId = service.category
    const categoryName = service.category_name || '其他'
    
    if (!categoryMap[categoryId]) {
      categoryMap[categoryId] = {
        id: categoryId,
        name: categoryName,
        services: []
      }
    }
    
    categoryMap[categoryId].services.push(service)
  })
  
  // 转换为数组并按分类ID排序
  skillCategories.value = Object.values(categoryMap).sort((a, b) => a.id - b.id)
}

// 加载城市列表 - 参考首页实现
const loadCityList = async () => {
  cityLoading.value = true
  try {
    const response = await getCityList()
    
    if (response.data && response.data.code === 0 && response.data.data) {
      // 转换API数据格式为组件需要的格式
      cityList.value = response.data.data.map(city => ({
        name: city.name,
        code: city.city_code // 保持字段名一致
      }))
      
      console.log('申请页面区域列表加载成功:', cityList.value)
    } else {
      console.warn('获取区域列表失败')
      cityList.value = []
    }
  } catch (error) {
    console.error('获取区域列表失败:', error)
    cityList.value = []
  } finally {
    cityLoading.value = false
  }
}

// 选择性别
const selectGender = (gender) => {
  formData.gender = gender
}

// 显示城市选择器
const showCitySelector = () => {
  // 初始化临时选择状态为当前已选择的城市
  tempSelectedCities.value = [...selectedCities.value]
  showCityPicker.value = true
}

// 隐藏城市选择器（取消选择）
const hideCitySelector = () => {
  // 重置临时选择状态
  tempSelectedCities.value = []
  showCityPicker.value = false
}

// 切换城市选择状态（临时状态）
const toggleCitySelection = (cityName) => {
  const index = tempSelectedCities.value.indexOf(cityName)
  
  if (index > -1) {
    // 如果已选中，则取消选择
    tempSelectedCities.value.splice(index, 1)
  } else {
    // 如果未选中，直接添加
    tempSelectedCities.value.push(cityName)
  }
  
  // 提供触觉反馈
  uni.vibrateShort({
    type: 'light'
  })
}

// 从选择中移除城市
const removeCityFromSelection = (cityName) => {
  const index = selectedCities.value.indexOf(cityName)
  if (index > -1) {
    selectedCities.value.splice(index, 1)
    
    // 提供触觉反馈
    uni.vibrateShort({
      type: 'light'
    })
  }
}

// 确认城市选择
const confirmCitySelection = async () => {
  if (tempSelectedCities.value.length === 0) {
    uni.showToast({
      title: '请至少选择一个服务区域',
      icon: 'none'
    })
    return
  }
  
  // 将临时选择应用到正式状态
  selectedCities.value = [...tempSelectedCities.value]
  
  // 更新formData中的city字段（取第一个作为主要城市）
  formData.city = selectedCities.value[0]
  
  // 关闭弹窗
  showCityPicker.value = false
  tempSelectedCities.value = []
  
  // 清空之前选择的技能和分类数据
  selectedSkills.value = []
  skillCategories.value = []
  
  // 加载对应城市的服务技能
  await loadServicesByCity()
  

}

// 添加照片
const addPhoto = () => {
  uni.chooseImage({
    count: 6 - photos.value.length,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      photos.value.push(...res.tempFilePaths)
    }
  })
}

// 预览照片
const previewPhoto = (index) => {
  uni.previewImage({
    urls: photos.value,
    current: index
  })
}

// 删除照片
const deletePhoto = (index) => {
  photos.value.splice(index, 1)
}

// 切换技能选择
const toggleSkill = (service) => {
  const serviceId = service.id
  const index = selectedSkills.value.indexOf(serviceId)
  
  if (index > -1) {
    selectedSkills.value.splice(index, 1)
  } else {
    selectedSkills.value.push(serviceId)
  }
  
  // 提供触觉反馈
  uni.vibrateShort({
    type: 'light'
  })
}

// 切换协议同意状态
const toggleAgreement = () => {
  agreementAccepted.value = !agreementAccepted.value
  
  // 提供触觉反馈
  uni.vibrateShort({
    type: 'light'
  })
}

// 查看协议
const viewAgreement = () => {
  uni.showToast({
    title: '协议功能待开发',
    icon: 'none'
  })
}

// 返回上一页
const handleBack = () => {
  uni.navigateBack({
    delta: 1
  })
}

// 下拉刷新处理
const onRefresh = async () => {
  isRefreshing.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 1000))
    uni.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 1500
    })
  } catch (error) {
    uni.showToast({
      title: '刷新失败',
      icon: 'none',
      duration: 1500
    })
  } finally {
    isRefreshing.value = false
  }
}

const onRefreshRestore = () => {
  isRefreshing.value = false
}

// 提交申请
const submitApplication = async () => {
  // 防重复提交
  if (isSubmitting.value) {
    return
  }

  // 检查协议是否已同意
  if (!agreementAccepted.value) {
    uni.showToast({ 
      title: '请先同意友伴服务协议', 
      icon: 'none',
      duration: 2000
    })
    return
  }

  // 表单验证
  if (!formData.nickname.trim()) {
    uni.showToast({ title: '请输入昵称', icon: 'none' })
    return
  }
  
  if (formData.nickname.length > 50) {
    uni.showToast({ title: '昵称不能超过50个字符', icon: 'none' })
    return
  }
  
  if (!formData.gender) {
    uni.showToast({ title: '请选择性别', icon: 'none' })
    return
  }
  
  const age = parseInt(formData.age)
  const height = parseInt(formData.height)
  const weight = parseInt(formData.weight)
  
  if (!age || age < 18 || age > 65) {
    uni.showToast({ title: '年龄必须在18-65岁之间', icon: 'none' })
    return
  }
  
  if (!height || height < 100 || height > 250) {
    uni.showToast({ title: '身高必须在100-250cm之间', icon: 'none' })
    return
  }
  
  if (!weight || weight < 30 || weight > 200) {
    uni.showToast({ title: '请输入合理的体重', icon: 'none' })
    return
  }
  
  if (selectedCities.value.length === 0) {
    uni.showToast({ title: '请至少选择一个服务区域', icon: 'none' })
    return
  }
  
  if (photos.value.length === 0) {
    uni.showToast({ title: '请上传至少一张生活照', icon: 'none' })
    return
  }
  
  if (photos.value.length > 9) {
    uni.showToast({ title: '最多只能上传9张照片', icon: 'none' })
    return
  }
  
  if (selectedSkills.value.length === 0) {
    uni.showToast({ title: '请至少选择一项服务技能', icon: 'none' })
    return
  }
  
  // 提交确认
  uni.showModal({
    title: '确认提交',
    content: '确定要提交入驻申请吗？提交后将进入审核流程。',
    success: async (res) => {
      if (res.confirm) {
        await doSubmit()
      }
    }
  })
}

// 执行提交
const doSubmit = async () => {
  isSubmitting.value = true
  
  try {
    // 获取城市代码列表并转换为字符串数组
    const serviceAreaCodes = selectedCities.value.map(cityName => {
      const city = cityList.value.find(c => c.name === cityName)
      return city ? String(city.code) : null // 转换为字符串
    }).filter(code => code !== null)
    
    if (serviceAreaCodes.length === 0) {
      uni.showToast({
        title: '服务区域数据异常，请重新选择',
        icon: 'none'
      })
      return
    }
    
    // 构建符合接口要求的数据格式
    const submitData = {
      nickname: formData.nickname.trim(),
      gender: formData.gender === 'male' ? '男' : '女',
      age: parseInt(formData.age),
      height: parseInt(formData.height),
      weight: parseInt(formData.weight),
      service_areas: serviceAreaCodes, // 服务区域代码字符串数组
      services: selectedSkills.value, // 服务ID数组
      can_accept_orders: 'N', // 不允许接单
      photos: photos.value
    }
    
    console.log('提交数据:', submitData)
    
    // 调用接口
    const response = await createCompanionApplication(submitData)
    
    console.log('接口响应:', response)
    
    // 判断接口是否成功 - 需要 response.data.code == 0
    if (response && response.data && response.data.code === 0) {
      // 提交成功 - 直接入驻成功
      const successMessage =  '恭喜您！入驻申请已通过，您已成功成为友伴师。'
                            
      
      uni.showModal({
        title: '入驻成功 🎉',
        content: successMessage,
        showCancel: false,
        confirmText: '我知道了',
        success: () => {
          // 发送事件通知个人中心页面刷新申请信息
          uni.$emit('applicationStatusChanged', {
            status: 'approved',
            message: '入驻申请已通过'
          })
          
          // 返回上一页
          uni.navigateBack()
        }
      })
    } else {
      // 接口返回失败
      const errorMsg = (response && response.data && response.data.message) || '提交失败，请稍后重试'
      
      uni.showModal({
        title: '提交失败',
        content: errorMsg,
        showCancel: false,
        confirmText: '我知道了'
      })
    }
    
  } catch (error) {
    console.error('提交失败:', error)
    
    // 根据错误类型显示不同的提示信息
    let errorMessage = '提交失败，请稍后重试'
    
    if (error && error.message) {
      if (error.message.includes('网络')) {
        errorMessage = '网络连接异常，请检查网络后重试'
      } else if (error.message.includes('参数')) {
        errorMessage = '提交信息有误，请检查后重试'
      } else if (error.message.includes('重复')) {
        errorMessage = '您已提交过申请，请勿重复提交'
      } else {
        errorMessage = error.message
      }
    }
    
    uni.showModal({
      title: '提交失败',
      content: errorMessage,
      showCancel: false,
      confirmText: '我知道了'
    })
  } finally {
    isSubmitting.value = false
  }
}

// 组件挂载时加载城市列表
onMounted(async () => {
  await loadCityList()
})
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";
@import "@/styles/mixins.scss";

.apply-container {
  height: 100vh;
  background: linear-gradient(180deg, #f8f9fe 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
}

/* 顶部横幅 - 氛围感设计 */
.header-banner {
  position: relative;
   padding-bottom: 60rpx;
   bosx-sizing: border-box;
  overflow: hidden;
  flex-shrink: 0;
  border-radius: 0 0 32rpx 32rpx;
}

/* 返回按钮 */
.nav-back {
  position: absolute;


  margin-top: 60rpx;
  box-sizing: border-box;
  left: 24rpx;
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 30rpx;
  @include flex-center;
  backdrop-filter: blur(20rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.4);
  z-index: 100;

  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  
  &:active {
    transform: scale(0.92);
    background: rgba(255, 255, 255, 0.4);
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
  }
}
.banner-content {
  position: relative;
  z-index: 10;
  height: 100%;

  padding: 0 32rpx 0 120rpx; /* 左侧留出返回按钮的空间 */
  margin-top: 70rpx;
 
}
.back-icon {
  width: 32rpx;
  height: 32rpx;
  filter: brightness(0) invert(1);
}

.banner-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.float-heart, .float-star {
  position: absolute;
  font-size: 24rpx;
  animation: float-up 4s ease-in-out infinite;
}

.float-circle {
  position: absolute;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  animation: float-rotate 6s linear infinite;
}

.float-1 { top: 15%; left: 15%; animation-delay: 0s; }
.float-2 { top: 25%; right: 20%; animation-delay: 1s; }
.float-3 { top: 40%; left: 70%; animation-delay: 2s; }
.float-4 { bottom: 30%; right: 15%; animation-delay: 3s; }

@keyframes float-up {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
  50% { transform: translateY(-20rpx) rotate(10deg); opacity: 1; }
}

@keyframes float-rotate {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.2); }
  100% { transform: rotate(360deg) scale(1); }
}



.banner-icon {
  margin-right: 24rpx;
}

.icon-circle {
  width: 100rpx;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  @include flex-center;
  backdrop-filter: blur(20rpx);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
}

.icon-emoji {
  font-size: 40rpx;
}

.banner-text {
  flex: 1;
  color: white;
 
}

.challenge-text {
  font-size: 24rpx;
  font-weight: 500;
  margin-bottom: 6rpx;
  opacity: 0.9;
  letter-spacing: 1rpx;
}

.recruit-title {
  font-size: 36rpx;
  font-weight: 500;
  margin-bottom: 6rpx;
  text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);
}

.recruit-desc {
  font-size: 20rpx;
  opacity: 0.8;
}

/* 可滚动内容区域 */
.main-content {
  flex: 1;
  overflow: hidden;
}

.scroll-container {
  width: 100%;
  height: 100%;
}

/* 表单容器 */
.form-container {
  padding: 24rpx 20rpx 180rpx;
}

/* 现代卡片样式 */
.modern-card {
  background: white;
  border-radius: 18rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 18rpx rgba(115, 99, 255, 0.06);
  border: 1rpx solid rgba(115, 99, 255, 0.08);
  overflow: hidden;
  position: relative;
}

.card-header {
  padding: 26rpx 20rpx 20rpx;
  @include flex;
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
  @include flex;
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

/* 表单内容 */
.form-content {
  padding: 20rpx 20rpx 20rpx;
}

.input-group {
  @include flex;
  align-items: center;
  margin-bottom: 20rpx;
  gap: 20rpx;
}

.input-label {
  font-size: 24rpx;
  font-weight: 500;
  color: #1A1A1A;
  width: 110rpx;
  flex-shrink: 0;
  text-align: left;
}

.input-wrapper {
  position: relative;
  flex: 1;
}

.modern-input {
  width: 100%;
  height: 80rpx;
  background: #f8f9fe;
  border: 2rpx solid #e9ecf5;
  border-radius: 14rpx;
  padding: 0 20rpx;
  font-size: 26rpx;
  color: #1A1A1A;
  transition: all 0.3s;
}

.modern-input:focus {
  border-color: #7363FF;
  background: rgba(115, 99, 255, 0.05);
}

/* 移除旧的装饰样式，使用新的图标设计 */

/* 性别选择器 - 水平布局优化 */
.gender-selector {
  @include flex;
  gap: 16rpx;
  width: 100%;
}

.gender-chip {
  flex: 1;
  height: 80rpx;
  @include flex-center;
  background: #f8f9fe;
  border: 2rpx solid #e9ecf5;
  border-radius: 14rpx;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
  overflow: hidden;
  
  /* 添加微妙的渐变背景 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 249, 254, 0.8) 100%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  
  &.active {
    border-color: #7363FF;
    background: linear-gradient(135deg, rgba(115, 99, 255, 0.1) 0%, rgba(255, 105, 222, 0.1) 100%);
    transform: translateY(-2rpx);
    box-shadow: 0 6rpx 20rpx rgba(115, 99, 255, 0.25);
    
    &::before {
      opacity: 1;
    }
    
    .gender-icon {
      transform: scale(1.1);
    }
    
    .chip-text {
      color: #7363FF;
      font-weight: 500;
    }
  }
  
  &:active {
    transform: scale(0.98);
  }
}

.gender-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 10rpx;
  transition: transform 0.3s ease;
  position: relative;
  z-index: 2;
}

.chip-text {
  font-size: 24rpx;
  color: #1A1A1A;
  font-weight: 400;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
}

/* 统一水平布局 - 所有输入项使用相同的input-group样式 */

/* 输入框图标 */
.input-icon {
  position: absolute;
  top: 50%;
  right: 24rpx;
  transform: translateY(-50%);
  font-size: 28rpx;
  opacity: 0.7;
  transition: all 0.3s ease;
  z-index: 2;
}

.modern-input:focus + .input-icon {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

/* 城市选择器样式 */
.city-input {
  width: 100%;
  height: 80rpx;
  background: #f8f9fe;
  border: 2rpx solid #e9ecf5;
  border-radius: 14rpx;
  padding: 0 20rpx;
  @include flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s;
  position: relative;
  
  &:active {
    transform: scale(0.98);
    border-color: #7363FF;
    background: rgba(115, 99, 255, 0.05);
  }
}

.city-display {
  font-size: 26rpx;
  color: #1A1A1A;
  font-weight: 400;
  flex: 1;
}

.city-icon {
  position: static !important;
  transform: none !important;
  font-size: 24rpx;
  opacity: 0.8;
}

/* 照片画廊 */
.photo-gallery {
  padding: 20rpx;
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
  opacity: 1;
}

.photo-remove {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  width: 40rpx;
  height: 40rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  @include flex-center;
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
  @include flex-center;
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
    box-shadow: 0 6rpx 20rpx rgba(115, 99, 255, 0.4);
  }
}

.add-content {
  @include flex-column;
  align-items: center;
  z-index: 2;
}

.add-icon-circle {
  width: 60rpx;
  height: 60rpx;
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 50%;
  @include flex-center;
  margin-bottom: 12rpx;
  box-shadow: 0 4rpx 16rpx rgba(115, 99, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.add-plus {
  font-size: 32rpx;
  color: white;
  font-weight: 300;
  line-height: 1;
}

.add-text {
  font-size: 24rpx;
  color: #666666;
  font-weight: 600;
  letter-spacing: 0.5rpx;
}



/* 服务技能整体容器 */
.skills-wrapper {
  padding: 20rpx;
}

/* 分类区块 */
.category-section {
  margin-bottom: 32rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

/* 分类标题 */
.category-header {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
  padding: 0 4rpx;
}

.category-indicator {
  width: 4rpx;
  height: 24rpx;
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 2rpx;
  margin-right: 12rpx;
}

.category-title {
  font-size: 26rpx;
  font-weight: 500;
  color: #1A1A1A;
  flex: 1;
}

.category-count {
  font-size: 22rpx;
  color: #999999;
  background: rgba(115, 99, 255, 0.08);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

/* 技能容器 - 改为三列布局 */
.skills-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.skill-item {
  position: relative;
  padding: 20rpx 12rpx;
  background: #f8f9fe;
  border: 2rpx solid #e9ecf5;
  border-radius: 14rpx;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  overflow: hidden;
 
  
  &.selected {
    border-color: #7363FF;
    background: linear-gradient(135deg, rgba(115, 99, 255, 0.1) 0%, rgba(255, 105, 222, 0.1) 100%);
    transform: translateY(-1rpx);
    box-shadow: 0 4rpx 14rpx rgba(115, 99, 255, 0.15);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.skill-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.skill-name {
  font-size: 22rpx;
  color: #1A1A1A;
  font-weight: 400;
  line-height: 1.3;
  text-align: center;
  word-break: break-all;
}

.skill-indicator {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 28rpx;
  height: 28rpx;
  @include flex-center;
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 50%;
  animation: heart-beat 1s ease-in-out infinite;
}

.indicator-icon {
  font-size: 14rpx;
}

@keyframes heart-beat {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* 协议确认 - 底部样式 */
.agreement-section {
  margin-bottom: 0rpx;
}

.agreement-checkbox {
  display: flex;
  align-items: center;
  padding: 20rpx 8rpx;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid rgba(115, 99, 255, 0.3);
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10rpx);
  
  &.checked {
    background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
    border-color: #7363FF;
    box-shadow: 0 4rpx 12rpx rgba(115, 99, 255, 0.3);
    transform: scale(1.05);
  }
}

.checkbox-icon {
  font-size: 20rpx;
  color: white;
  font-weight: 700;
  animation: checkBounce 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.agreement-text-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.agreement-text {
  font-size: 24rpx;
  color: #666666;
  margin-right: 8rpx;
}

.agreement-link {
  font-size: 24rpx;
  color: #7363FF;
  font-weight: 500;
  transition: color 0.3s ease;
  
  &:active {
    color: #FF69DE;
  }
}

/* 底部固定提交按钮 */
.submit-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, white 100%);
  backdrop-filter: blur(20rpx);
  box-shadow: 0 -8rpx 32rpx rgba(115, 99, 255, 0.08);
  border-top: 1rpx solid rgba(115, 99, 255, 0.1);
  z-index: 100;
}

.submit-btn {
  position: relative;
  height: 80rpx;
  border-radius: 40rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 20rpx rgba(115, 99, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  
  &.disabled {
    opacity: 0.6;
    transform: none !important;
    box-shadow: 0 3rpx 12rpx rgba(115, 99, 255, 0.2);
    
    .btn-gradient {
      background: linear-gradient(135deg, #a0a0a0 0%, #808080 100%);
    }
  }
}

.submit-btn:active:not(.disabled) {
  transform: scale(0.98);
  box-shadow: 0 6rpx 20rpx rgba(115, 99, 255, 0.4);
}

.btn-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  transition: background 0.3s;
}

.btn-content {
  position: relative;
  z-index: 2;
  height: 100%;
  @include flex-center;
  gap: 12rpx;
}

.btn-text {
  font-size: 26rpx;
  color: white;
  font-weight: 500;
  letter-spacing: 0.5rpx;
}

.btn-emoji {
  font-size: 26rpx;
  animation: rocket-fly 2s ease-in-out infinite;
}

.loading-spinner {
  width: 32rpx;
  height: 32rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.3);
  border-top: 3rpx solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.btn-sparkles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.sparkle {
  position: absolute;
  color: rgba(255, 255, 255, 0.8);
  animation: btn-sparkle 2s ease-in-out infinite;
}

.sparkle-1 {
  top: 16rpx;
  left: 20%;
  font-size: 18rpx;
  animation-delay: 0s;
}

.sparkle-2 {
  bottom: 16rpx;
  right: 20%;
  font-size: 16rpx;
  animation-delay: 1s;
}

@keyframes rocket-fly {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4rpx); }
}

@keyframes btn-sparkle {
  0%, 100% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.input-placeholder {
  color: $text-color-placeholder;
  font-size: 26rpx;
}

/* 已选城市标签样式 */
.selected-cities {
  margin-top: 20rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  padding: 0 20rpx 0 0; /* 右侧留白保持对齐 */
}

.city-tag {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(115, 99, 255, 0.1) 0%, rgba(255, 105, 222, 0.1) 100%);
  border: 1rpx solid rgba(115, 99, 255, 0.2);
  border-radius: 20rpx;
  padding: 8rpx 16rpx;
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
    background: linear-gradient(135deg, rgba(115, 99, 255, 0.15) 0%, rgba(255, 105, 222, 0.15) 100%);
  }
}

.city-tag-text {
  font-size: 22rpx;
  color: #7363FF;
  font-weight: 500;
  margin-right: 8rpx;
}

.city-tag-remove {
  font-size: 24rpx;
  color: rgba(115, 99, 255, 0.6);
  font-weight: 600;
  width: 24rpx;
  height: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

/* 城市选择弹窗样式 - 参考首页设计 */
.city-picker-overlay {
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

.city-picker-container {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 248, 250, 0.95) 100%);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  padding: 32rpx;
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

.city-picker-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32rpx;
  position: relative;
  padding-bottom: 24rpx;
  border-bottom: 1rpx solid rgba(115, 99, 255, 0.1);
}

.picker-title {
  font-size: 30rpx;
  font-weight: 400;
  color: #1A1A1A;
  margin-bottom: 8rpx;
}

.picker-subtitle {
  font-size: 22rpx;
  color: #666666;
  opacity: 0.8;
  margin-bottom: 16rpx;
}

.picker-close {
  position: absolute;
  top: -8rpx;
  right: 0;
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
  
  &:active {
    transform: scale(0.9);
    background: linear-gradient(135deg, rgba(115, 99, 255, 0.15) 0%, rgba(255, 255, 255, 0.9) 100%);
  }
}

.city-picker-content {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 24rpx;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  text-align: center;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid rgba(115, 99, 255, 0.1);
  border-top: 6rpx solid #7363FF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 24rpx;
  color: #666666;
  font-weight: 500;
}

.city-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.city-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 16rpx;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(247, 248, 250, 0.6) 100%);
  border: 1rpx solid rgba(115, 99, 255, 0.1);
  border-radius: 20rpx;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  
  &.active {
    border-color: #7363FF;
    background: linear-gradient(135deg, rgba(115, 99, 255, 0.15) 0%, rgba(255, 105, 222, 0.1) 100%);

  
    
    .city-name {
      color: #7363FF;
      font-weight: 500;
    }
  }
  
  &.disabled {
    opacity: 0.4;
    background: rgba(248, 249, 254, 0.5);
    border-color: rgba(115, 99, 255, 0.05);
    
    .city-name {
      color: #cccccc;
    }
  }
  
  &:active:not(.disabled) {
    transform: scale(0.98);
  }
}

.city-name {
  flex: 1;
  font-size: 26rpx;
  color: #1A1A1A;
  font-weight: 400;
  letter-spacing: 0.5rpx;
  transition: all 0.3s ease;
}

.city-check {
  width: 24rpx;
  height: 24rpx;
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16rpx;
  color: white;
  font-weight: 700;
  box-shadow: 0 2rpx 8rpx rgba(115, 99, 255, 0.3);
  animation: checkBounce 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  margin-left: 12rpx;
  flex-shrink: 0;
}

@keyframes checkBounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* 服务加载状态样式 */
.services-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 40rpx;
  text-align: center;
}

.no-city-tip, .no-services-tip {
  padding: 60rpx 40rpx;
  text-align: center;
}

.tip-text {
  font-size: 24rpx;
  color: #999999;
  line-height: 1.5;
}

.picker-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20rpx;
  border-top: 1rpx solid rgba(115, 99, 255, 0.1);
}

.selected-count {
  font-size: 24rpx;
  color: #666666;
  font-weight: 500;
}

.confirm-btn {
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  color: white;
  border-radius: 24rpx;
  padding: 12rpx 32rpx;
  font-size: 24rpx;
  font-weight: 600;
  box-shadow: 0 6rpx 20rpx rgba(115, 99, 255, 0.3);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.95);
    box-shadow: 0 4rpx 16rpx rgba(115, 99, 255, 0.4);
  }
}
</style>