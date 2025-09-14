<template>
  <view class="container">
    <!-- 主要内容区域 -->
    <view class="content">
      
      <!-- Logo和标题区域 -->
      <view class="header-section">
        <view class="logo-container">
          <image :src="$imgBaseUrl +'/img/cum/logo_small_01.jpeg'" class="logo" mode="aspectFill"></image>
         
        </view>
        <view class="title-container">
          <view class="main-title">欢迎来到随伴行</view>
       
        </view>
      </view>

      <!-- 登录按钮区域 -->
      <view class="login-section">
        <button 
          class="login-button" 
          open-type="getPhoneNumber"
          @getphonenumber="getPhoneNumber">
          <text class="button-text">手机号快捷登录</text>
        </button>
      </view>


    </view>
  </view>

  <!-- 服务协议弹窗 -->
  <uni-popup ref="popup" :safeArea="false" type="center" @change="onPopupChange">
    <view class="popup-container">
      <view class="popup-header">
        <view class="popup-title">服务协议</view>
      </view>
      <view class="popup-content">
        <text class="popup-text">
          请您认真阅读<text class="highlight-text" @click="showUserAgreement">《平台服务协议》</text>、<text class="highlight-text" @click="showPrivacyPolicy">《隐私政策》</text>的全部条款，接受后可开始使用我们的服务
        </text>
      </view>
      <view class="popup-buttons flex-between">
        <view class="popup-btn btn-cancel flex-center" @click="handleCancel">不同意</view>
        <view class="popup-btn btn-confirm flex-center" @click="handleConfirm">同意并继续</view>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref } from 'vue'
import { wxLogin } from '@/api/user.js'
import { useUserStore } from '@/stores/user.js'
import { useLevelStore } from '@/stores/level.js'
import { onLoad } from '@dcloudio/uni-app'

const userStore = useUserStore()
const levelStore = useLevelStore()
const popup = ref(null)
const isPopupOpen = ref(true)
const hasAgreed = ref(false)

onLoad(async () => {
  // 获取系统信息设置状态栏高度
  const systemInfo = uni.getSystemInfoSync()
  console.log('系统信息:', systemInfo)
  
  // 延迟显示协议弹窗
  setTimeout(() => {
    if (popup.value) {
      popup.value.open()
    } 
  }, 500)
})


// 取消协议
const handleCancel = () => {
  popup.value.close()
  setTimeout(() => {
    uni.navigateBack({
      delta: 1
    })
  }, 300)
}

// 确认协议
const handleConfirm = () => {
  hasAgreed.value = true
  popup.value.close()
 
}

const onPopupChange = (e) => {
  isPopupOpen.value = e.show
}

// 显示用户协议
const showUserAgreement = () => {
  uni.navigateTo({
    url: '/subPackages/login/agreement'
  })
}

// 显示隐私政策
const showPrivacyPolicy = () => {
  uni.navigateTo({
    url: '/subPackages/login/policy'
  })
}

// 微信登录
const wechatLogin = () => {
  uni.showToast({
    title: '微信登录开发中',
    icon: 'none'
  })
}

// 手机号登录
const getPhoneNumber = async (e) => {
  console.log('getPhoneNumber event:', e)
  
  // if (!hasAgreed.value) {
  //   uni.showToast({
  //     title: '请先同意服务协议',
  //     icon: 'none'
  //   })
  //   if (popup.value) {
  //     popup.value.open()
  //   }
  //   return
  // }

  const res = e.detail
  if (!res.code) {
    uni.showToast({
      title: '授权失败，请重试',
      icon: 'none'
    })
    return
  }

  try {
    // 获取微信登录code
    const loginRes = await uni.login({ provider: 'weixin' })
    
    uni.showLoading({
      title: '登录中...',
      mask: true
    })

    // 调用登录接口
    const result = await wxLogin({
      login_code: loginRes.code,
      phone_code: res.code
    })

    uni.hideLoading()

    if (result.data && result.data.code === 0) {
      // 保存用户信息
      userStore.setUserInfo(result.data.data.token)
      
      // 保存token
    
	        userStore.setToken(result.data.data.token.access_token)
	    

      // 清除等级列表缓存，确保获取用户相关的等级信息
      levelStore.clearServiceLevels()
      
      // 发送登录成功事件，通知其他页面刷新数据
      uni.$emit('loginSuccess', {
        userInfo: result.data.data
      })
      
      uni.showToast({
        title: '登录成功',
        icon: 'success'
      })

      // 延迟跳转到首页
      setTimeout(() => { 
		  
       uni.navigateBack({
       	delta: 1 // 返回的页面数，默认值为1，即返回上一级页面
       });
      }, 1500)
    } else {
      uni.showToast({
        title: result.data?.msg || '登录失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('登录失败:', error)
    uni.showToast({
      title: '登录失败，请重试',
      icon: 'none'
    })
  }
}
</script>

<style lang="scss" scoped>
// 通用布局样式
.container {
  min-height: 100vh;
  background: #FFFFFF;
  position: relative;
  overflow: hidden;
}


.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx 60rpx;
  position: relative;
  min-height: 100vh;
}

.header-section {
  text-align: center;
  margin-bottom: 100rpx;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 20;
}

.logo-container {
  position: relative;

}

.logo {
  width: 140rpx;
  height: 140rpx;


}




.title-container {
  text-align: center;
}

.main-title {
  font-size: 40rpx;
  font-weight: 700;
  margin-bottom: 20rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  color: #1A1A1A;
  letter-spacing: 2rpx;
}

.subtitle {
  font-size: 30rpx;
  opacity: 0.9;
  line-height: 1.6;
  max-width: 500rpx;
  color: #666;
  font-weight: 400;
}


.login-section {
  width: 100%;
  max-width: 600rpx;
  margin-bottom: 60rpx;
  position: relative;
  z-index: 20;
}

.login-button {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  color: #FFFFFF;
  border-radius: 28rpx;
  font-size: 34rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 12rpx 40rpx rgba(115, 99, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0.0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.login-button:active {
  transform: scale(0.98) translateY(2rpx);
  background: linear-gradient(135deg, #5a52e6 0%, #e55ac7 100%);
  box-shadow: 0 8rpx 24rpx rgba(115, 99, 255, 0.4);
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
  transition: left 0.8s ease;
}

.login-button:active::before {
  left: 100%;
}

.button-text {
  color: white;
  font-weight: 600;
  text-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}



// 弹窗样式
.popup-container {
  width: 600rpx;
  background: white;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.2);
}

.popup-header {
  padding: 40rpx 32rpx 20rpx;
  text-align: center;
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
}

.popup-title {
  font-size: 36rpx;
  font-weight: 600;
  color: white;
}

.popup-content {
  padding: 32rpx;
}

.popup-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
  text-align: center;
}

.highlight-text {
  color: #7363FF;
  font-weight: 600;
}

.popup-buttons {
  display: flex;
  padding: 0 32rpx 32rpx;
  gap: 24rpx;
}

.popup-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #F7F8FA;
  color: #666666;
  border: 1rpx solid #E5E5E5;
}

.btn-confirm {
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  color: #FFFFFF;
  border: none;
}

.popup-btn:active {
  transform: scale(0.98);
}

// 通用flex布局类
.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style> 