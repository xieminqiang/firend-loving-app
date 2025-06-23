<template>
  <view class="apply-container">
    <!-- 顶部横幅 -->
    <view class="header-banner">
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
        <view class="banner-icon">
          <view class="icon-circle">
            <text class="icon-emoji">🌸</text>
          </view>
        </view>
        <view class="banner-text">
          <view class="challenge-text">遇见心动的陪伴</view>
          <view class="recruit-title">友伴招募</view>
          <view class="recruit-desc">开启你的陪伴之旅 ✨</view>
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
              <view class="header-left">
                <view class="header-icon">
                  <text class="icon-emoji">👤</text>
                </view>
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
                  <view class="input-decoration"></view>
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
                    <text class="chip-icon">👨</text>
                    <text class="chip-text">男生</text>
                  </view>
                  <view 
                    class="gender-chip" 
                    :class="{ active: formData.gender === 'female' }"
                    @click="selectGender('female')"
                  >
                    <text class="chip-icon">👩</text>
                    <text class="chip-text">女生</text>
                  </view>
                </view>
              </view>

              <!-- 基本信息 -->
              <view class="info-grid">
                <view class="info-item">
                  <text class="info-label">年龄</text>
                  <input 
                    class="info-input" 
                    v-model="formData.age" 
                    type="number"
                    placeholder="18" 
                    placeholder-class="input-placeholder"
                  />
                </view>
                <view class="info-item">
                  <text class="info-label">身高</text>
                  <input 
                    class="info-input" 
                    v-model="formData.height" 
                    type="number"
                    placeholder="165cm" 
                    placeholder-class="input-placeholder"
                  />
                </view>
                <view class="info-item">
                  <text class="info-label">体重</text>
                  <input 
                    class="info-input" 
                    v-model="formData.weight" 
                    type="number"
                    placeholder="50kg" 
                    placeholder-class="input-placeholder"
                  />
                </view>
                <view class="info-item">
                  <text class="info-label">城市</text>
                  <view class="city-selector" @click="selectCity">
                    <text class="city-text">{{ formData.city }}</text>
                    <text class="city-arrow">📍</text>
                  </view>
                </view>
              </view>
            </view>
          </view>

          <!-- 生活照片卡片 -->
          <view class="photo-card modern-card">
            <view class="card-header">
              <view class="header-left">
                <view class="header-icon photo-icon">
                  <text class="icon-emoji">📷</text>
                </view>
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
                  <text class="add-icon">📸</text>
                  <text class="add-text">添加照片</text>
                </view>
                <view class="add-sparkle">✨</view>
              </view>
            </view>
          </view>

          <!-- 服务技能卡片 -->
          <view class="skills-card modern-card">
            <view class="card-header">
              <view class="header-left">
                <view class="header-icon skills-icon">
                  <text class="icon-emoji">💝</text>
                </view>
                <view class="header-text">
                  <text class="card-title">服务技能</text>
                  <text class="card-subtitle">选择你最擅长的陪伴方式</text>
                </view>
              </view>
            </view>
            
            <view class="skills-container">
              <view 
                class="skill-item"
                :class="{ selected: selectedSkills.includes(skill) }"
                v-for="skill in serviceSkills"
                :key="skill"
                @click="toggleSkill(skill)"
              >
                <view class="skill-content">
                  <text class="skill-emoji">{{ getSkillEmoji(skill) }}</text>
                  <text class="skill-name">{{ skill }}</text>
                </view>
                <view class="skill-indicator" v-if="selectedSkills.includes(skill)">
                  <text class="indicator-icon">💖</text>
                </view>
              </view>
            </view>
          </view>

          <!-- 协议说明 -->
          <view class="agreement-section">
            <view class="agreement-box">
              <text class="agreement-text">提交即表示同意</text>
              <text class="agreement-link" @click="viewAgreement">《友伴服务协议》</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 底部固定提交按钮 -->
    <view class="submit-area">
      <view 
        class="submit-btn" 
        :class="{ disabled: isSubmitting }"
        @click="submitApplication"
      >
        <view class="btn-gradient"></view>
        <view class="btn-content">
          <text class="btn-text" v-if="!isSubmitting">开启陪伴之旅</text>
          <text class="btn-text" v-else>提交中...</text>
          <text class="btn-emoji" v-if="!isSubmitting">🚀</text>
          <view class="loading-spinner" v-else></view>
        </view>
        <view class="btn-sparkles" v-if="!isSubmitting">
          <text class="sparkle sparkle-1">✨</text>
          <text class="sparkle sparkle-2">💫</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { createCompanionApplication } from '@/api/user.js'

// 下拉刷新状态
const isRefreshing = ref(false)

// 提交状态
const isSubmitting = ref(false)

// 表单数据
const formData = reactive({
  nickname: '',
  gender: '',
  age: '',
  height: '',
  weight: '',
  city: '深圳市'
})

// 照片数组
const photos = ref([])

// 服务技能选项
const serviceSkills = ref([
  '陪拍写真', '陪护就医', '陪伴购物', '陪同观影', 
  '礼仪模特', '探店体验', '陪诊服务', '陪伴聊天'
])

// 选中的技能
const selectedSkills = ref([])

// 技能与服务ID的映射关系
const skillToServiceMap = {
  '陪拍写真': 1,
  '陪护就医': 2,
  '陪伴购物': 3,
  '陪同观影': 4,
  '礼仪模特': 5,
  '探店体验': 6,
  '陪诊服务': 7,
  '陪伴聊天': 8
}

// 获取技能对应的emoji
const getSkillEmoji = (skill) => {
  const emojiMap = {
    '陪拍写真': '📸',
    '陪护就医': '🏥',
    '陪伴购物': '🛍️',
    '陪同观影': '🎬',
    '礼仪模特': '👗',
    '探店体验': '🍰',
    '陪诊服务': '💊',
    '陪伴聊天': '💬'
  }
  return emojiMap[skill] || '💝'
}

// 选择性别
const selectGender = (gender) => {
  formData.gender = gender
}

// 选择城市
const selectCity = () => {
  uni.showActionSheet({
    itemList: ['深圳市', '广州市', '上海市', '北京市', '杭州市', '南京市', '苏州市', '成都市', '重庆市', '武汉市', '西安市'],
    success: (res) => {
      const cities = ['深圳市', '广州市', '上海市', '北京市', '杭州市', '南京市', '苏州市', '成都市', '重庆市', '武汉市', '西安市']
      formData.city = cities[res.tapIndex]
    }
  })
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
const toggleSkill = (skill) => {
  const index = selectedSkills.value.indexOf(skill)
  if (index > -1) {
    selectedSkills.value.splice(index, 1)
  } else {
    selectedSkills.value.push(skill)
  }
}

// 查看协议
const viewAgreement = () => {
  uni.showToast({
    title: '协议功能待开发',
    icon: 'none'
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
  
  if (!formData.city.trim()) {
    uni.showToast({ title: '请选择城市', icon: 'none' })
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
    // 构建符合接口要求的数据格式
    const submitData = {
      nickname: formData.nickname.trim(),
      gender: formData.gender === 'male' ? '男' : '女',
      age: parseInt(formData.age),
      height: parseInt(formData.height),
      city: formData.city,
      photos: photos.value,
 
      services: selectedSkills.value.map(skill => ({
        service_id: skillToServiceMap[skill],
        level: 1 // 认证等级固定为1
      }))
    }
    
    console.log('提交数据:', submitData)
    
    // 调用接口
    const response = await createCompanionApplication(submitData)
    
    console.log('接口响应:', response)
    
    // 判断接口是否成功 - 需要 response.data.code == 0
    if (response && response.data && response.data.code === 0) {
      // 提交成功
      uni.showModal({
        title: '申请提交成功 🎉',
        content: '您的友伴入驻申请已成功提交！我们会在3-5个工作日内完成审核，请耐心等待。审核结果将通过消息通知您。',
        showCancel: false,
        confirmText: '我知道了',
        success: () => {
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
  height: 260rpx;
  overflow: hidden;
  flex-shrink: 0;
  border-radius: 0 0 32rpx 32rpx;
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

.banner-content {
  position: relative;
  z-index: 10;
  height: 100%;
  @include flex;
  align-items: center;
  padding: 0 32rpx;
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
  font-size: 42rpx;
  font-weight: 700;
  margin-bottom: 6rpx;
  text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
}

.recruit-desc {
  font-size: 22rpx;
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
  border-radius: 20rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 6rpx 24rpx rgba(115, 99, 255, 0.06);
  border: 1rpx solid rgba(115, 99, 255, 0.08);
  overflow: hidden;
  position: relative;
}

.card-header {
  padding: 24rpx 24rpx 20rpx;
  @include flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  @include flex;
  align-items: center;
}

.header-icon {
  width: 56rpx;
  height: 56rpx;
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 16rpx;
  @include flex-center;
  margin-right: 16rpx;
  box-shadow: 0 3rpx 12rpx rgba(115, 99, 255, 0.25);
}

.header-text {
  flex: 1;
}

.card-title {
  font-size: 30rpx;
  font-weight: 700;
  color: $text-color-primary;
  margin-bottom: 2rpx;
}

.card-subtitle {
  font-size: 22rpx;
  color: $text-color-secondary;
  opacity: 0.8;
  margin-left: 20rpx;
}

/* 表单内容 */
.form-content {
  padding: 0 24rpx 24rpx;
}

.input-group {
  margin-bottom: 24rpx;
}

.input-label {
  font-size: 26rpx;
  font-weight: 600;
  color: $text-color-primary;
  margin-bottom: 12rpx;
  display: block;
}

.input-wrapper {
  position: relative;
}

.modern-input {
  width: 100%;
  height: 88rpx;
  background: #f8f9fe;
  border: 2rpx solid #e9ecf5;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: $text-color-primary;
  transition: all 0.3s;
}

.modern-input:focus {
  border-color: #7363FF;
  background: rgba(115, 99, 255, 0.05);
}

.input-decoration {
  position: absolute;
  top: 50%;
  right: 24rpx;
  transform: translateY(-50%);
  width: 32rpx;
  height: 32rpx;
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.3s;
}

.modern-input:focus + .input-decoration {
  opacity: 1;
}

/* 性别选择器 */
.gender-selector {
  @include flex;
  gap: 16rpx;
}

.gender-chip {
  flex: 1;
  height: 88rpx;
  @include flex-center;
  background: #f8f9fe;
  border: 2rpx solid #e9ecf5;
  border-radius: 16rpx;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  
  &.active {
    border-color: #7363FF;
    background: linear-gradient(135deg, rgba(115, 99, 255, 0.1) 0%, rgba(255, 105, 222, 0.1) 100%);
    transform: scale(1.02);
    box-shadow: 0 4rpx 16rpx rgba(115, 99, 255, 0.2);
  }
}

.chip-icon {
  font-size: 32rpx;
  margin-right: 8rpx;
}

.chip-text {
  font-size: 28rpx;
  color: $text-color-primary;
  font-weight: 500;
  margin-left: 10rpx;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.info-item {
  @include flex-column;
  align-items: center;
  padding: 18rpx 24rpx;
  background: #f8f9fe;
  border-radius: 16rpx;
  border: 2rpx solid #e9ecf5;
  transition: all 0.3s;
}

.info-item:active {
  transform: scale(0.98);
}

.info-label {
  font-size: 24rpx;
  color: $text-color-secondary;
  margin-bottom: 8rpx;
}

.info-input {
  width: 100%;
  text-align: center;
  font-size: 28rpx;
  color: $text-color-primary;
  font-weight: 600;
  background: transparent;
  border: none;
}

.city-selector {
  @include flex-center;
  gap: 8rpx;
}

.city-text {
  font-size: 28rpx;
  color: $text-color-primary;
  font-weight: 600;
}

.city-arrow {
  font-size: 24rpx;
}

/* 照片画廊 */
.photo-gallery {
  padding: 24rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
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
}

.add-content {
  @include flex-column;
  align-items: center;
  z-index: 2;
}

.add-icon {
  font-size: 40rpx;
  margin-bottom: 8rpx;
}

.add-text {
  font-size: 22rpx;
  color: $text-color-secondary;
  font-weight: 500;
}

.add-sparkle {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  font-size: 20rpx;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* 技能容器 */
.skills-container {
  padding: 24rpx;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.skill-item {
  position: relative;
  padding: 20rpx 16rpx;
  background: #f8f9fe;
  border: 2rpx solid #e9ecf5;
  border-radius: 16rpx;
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  overflow: hidden;
  
  &.selected {
    border-color: #7363FF;
    background: linear-gradient(135deg, rgba(115, 99, 255, 0.1) 0%, rgba(255, 105, 222, 0.1) 100%);
    transform: translateY(-2rpx);
    box-shadow: 0 6rpx 18rpx rgba(115, 99, 255, 0.15);
  }
}

.skill-content {
  @include flex;
  align-items: center;
  gap: 12rpx;
}

.skill-emoji {
  font-size: 32rpx;
  flex-shrink: 0;
}

.skill-name {
  font-size: 26rpx;
  color: $text-color-primary;
  font-weight: 500;
  line-height: 1.3;
  flex: 1;
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

/* 协议说明 */
.agreement-section {
  margin-top: 32rpx;
  padding: 32rpx 20rpx;
}

.agreement-box {
  text-align: center;
  margin-bottom: 40rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, rgba(115, 99, 255, 0.05) 0%, rgba(255, 105, 222, 0.05) 100%);
  border-radius: 16rpx;
  border: 1rpx solid rgba(115, 99, 255, 0.1);
}

.agreement-text {
  font-size: 24rpx;
  color: $text-color-secondary;
  margin-right: 8rpx;
}

.agreement-link {
  font-size: 24rpx;
  color: #7363FF;
  text-decoration: underline;
  font-weight: 600;
}

/* 底部固定提交按钮 */
.submit-area {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 24rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, white 100%);
  backdrop-filter: blur(20rpx);
  box-shadow: 0 -8rpx 32rpx rgba(115, 99, 255, 0.08);
  border-top: 1rpx solid rgba(115, 99, 255, 0.1);
  z-index: 100;
}

.submit-btn {
  position: relative;
  height: 88rpx;
  border-radius: 44rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(115, 99, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  
  &.disabled {
    opacity: 0.6;
    transform: none !important;
    box-shadow: 0 4rpx 16rpx rgba(115, 99, 255, 0.2);
    
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
  font-size: 30rpx;
  color: white;
  font-weight: 700;
  letter-spacing: 1rpx;
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
</style>