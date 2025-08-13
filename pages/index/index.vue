<template>
	<view class="index-page">
	
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
			userStore.setSwitch(response.data.data.value)
			console.log('开关数据已保存到store:', response.data.data.value)
		}
		
		// 如果 value = 1，则跳转到首页
		if (response.data && response.data.code === 0 ) {

            console.log('跳转到首页')
          if(response.data.data.value === 1){
          
            uni.switchTab({
				url: '/pages/tabbar/home/index'
			})
        
        }else{
            uni.switchTab({
				url: '/pages/tabbar/home/index-page'
			}) 
            }
		}
	} catch (error) {
		console.error('获取首页开关配置失败:', error)
	}
}

// 页面加载时调用
onMounted(() => {
	callFirstSwitch()
})
</script>

<style lang="scss" scoped>
.index-page {

}
</style>