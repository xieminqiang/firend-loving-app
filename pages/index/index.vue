<template>
	<view class="index-page">
		<view class="logo-container">
			<image :src="$imgBaseUrl +'/img/cum/logo_small_01.jpeg'" class="logo" mode="aspectFill"></image>
			<text class="logo-text">随伴行</text>
		</view>
	</view>
</template>

<script setup>
import { onMounted } from 'vue'
import { getFirstSwitch } from '@/api/home.js'
import { useUserStore } from '@/stores/user.js'

// 获取用户store实例
const userStore = useUserStore()

// 调用接口
const callFirstSwitch = async () => {  

	try {
		const response = await getFirstSwitch() 
      
		console.log('首页开关配置:', response.data)
		
		
	
		// 保存开关数据到store
		if (response.data && response.data.code === 0 && response.data.data) {
				// userStore.setSwitch(1)
			userStore.setSwitch(response.data.data.value) 
			console.log('开关数据已保存到store:', response.data.data.value)
		}
		
	
		if (response.data && response.data.code === 0 ) {

            
          if(response.data.data.value === 1 ){
          
            uni.reLaunch({
				url: '/pages/tabbar/home/index'
			})
        
        }  else{ 
			uni.reLaunch({
				url: '/pages/tabbar/page/page'
			}) 
            }
		}
	} catch (error) {
		console.error('获取首页开关配置失败:', error)
	}
}
import {
	onShow,
	onLoad
} from '@dcloudio/uni-app'; 
onShow(() => { 
	// userStore.setSwitch(1)
	// uni.reLaunch({
	// 				url: '/pages/tabbar/home/index'
	// 			})
  // 页面显示时，如果已登录则获取订单数量 

	userStore.setSwitch(2)
	const accountInfo = uni.getAccountInfoSync();  

	
	const currentVersion = accountInfo.miniProgram.envVersion 
		console.log('当前小程序版本号:', currentVersion)
		callFirstSwitch()
	 // if (currentVersion == "release" || currentVersion == "develop") {
		//  callFirstSwitch()
	 // } else { 
		//   userStore.setSwitch(2) 
		//  uni.reLaunch({
		//  	url: '/pages/tabbar/page/page'
		//  })
		
	 // }
})
// 页面加载时调用
onMounted(() => {  

	// userStore.setSwitch(2)
	// const accountInfo = uni.getAccountInfoSync();
	// const currentVersion = accountInfo.miniProgram.envVersion 
	// console.log('当前小程序版本号:', currentVersion)
	//  if (currentVersion == "release" || currentVersion == "develop") {
	// 	 callFirstSwitch()
	//  } else { 
	// 	  userStore.setSwitch(2) 
	// 	 uni.reLaunch({
	// 	 	url: '/pages/tabbar/page/page'
	// 	 })
		
	//  }
	 
	// console.log('当前小程序版本号:', currentVersion)
	// console.log('当前小程序版本号111:', accountInfo.miniProgram.envVersion) 
	
})
</script>

<style lang="scss" scoped>
.index-page {
	position: relative;
	width: 100%;
	height: 100vh;
	display: flex;
	justify-content: center;

	
	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image: url('https://sbx-server.oss-cn-shenzhen.aliyuncs.com/img/cum/home_bg.png');
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		z-index: -1;
	} 
	.logo-container {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-top: -200rpx;
	}
	.logo {
		width: 140rpx;
		height: 140rpx;
		border-radius: 20rpx;
		margin-bottom: 20rpx;
	}
	.logo-text {
	
		font-size: 32rpx;
		font-weight: bold;
		text-align: center;
		color: transparent;
		background-clip: text;
		background-image: linear-gradient(180deg, rgba(115, 99, 255, 1) 0%, rgba(255, 105, 222, 1) 100%);
	}
}
</style>