<template>
	<view class="home-container">
		<!-- 使用v-show避免组件重新创建，保持数据状态 -->
		<view v-show="currentTab === 'home'" class="home-tab-content">
			<!-- 引入真正的home组件，使用懒加载 -->
			<HomeComponent ref="homeRef" v-if="visitedTabs.has('home')" />
		</view>
   
	
                
		<view v-show="currentTab === 'profile'" class="profile-tab-content">
			<!-- 引入个人中心组件，使用懒加载 -->
			<ProfileComponent ref="profileRef" v-if="visitedTabs.has('profile')" />
		</view>

		<!-- 底部Tabbar -->
		<MqTabbar
			:currentTab="currentTab" 
			@tabChange="handleTabChange"
		/>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, getCurrentInstance, nextTick } from 'vue'
import { onPullDownRefresh, onHide, onShow } from '@dcloudio/uni-app'
import MqTabbar from '@/components/mq-tabbar/mq-tabbar.vue'
import HomeComponent from './components/home.vue'
import { uploadFile, getUploadResult } from '@/api/file.js'
import ProfileComponent from './components/profile.vue'

// 当前选中的tab
const currentTab = ref('home')

// 记录已访问过的tab，用于懒加载
const visitedTabs = reactive(new Set(['home']))

// 刷新状态管理
const isRefreshing = ref(false)

// 处理tab切换
const handleTabChange = (tabName) => {
	// 记录访问过的tab
	visitedTabs.add(tabName)
	
	// 切换tab
	currentTab.value = tabName
	
	console.log(`切换到 ${tabName} tab，已访问的tab:`, Array.from(visitedTabs))
}

// 页面挂载时初始化
onMounted(() => {
	console.log('页面挂载完成，当前tab:', currentTab.value)
	console.log('已访问的tab:', Array.from(visitedTabs))
})

// 页面级下拉刷新处理
onPullDownRefresh(async () => {
	// 防止重复刷新
	if (isRefreshing.value) {
		console.log('刷新操作正在进行中，忽略重复请求')
		uni.stopPullDownRefresh()
		return
	}
	
	isRefreshing.value = true
	console.log('页面级下拉刷新触发，当前tab:', currentTab.value)
	
	// 设置超时保护
	const timeoutPromise = new Promise((_, reject) => {
		setTimeout(() => reject(new Error('刷新超时')), 10000) // 10秒超时
	})
	
	try {
		// 根据当前tab调用相应的刷新方法
		const refreshPromise = (async () => {
			if (currentTab.value === 'home') {
				// 如果home组件已加载，调用其刷新方法
				if (visitedTabs.has('home')) {
					// 通过ref调用子组件的刷新方法
					const homeRef = getCurrentInstance()?.refs?.homeRef
					if (homeRef && homeRef.refreshCurrentTab) {
						await homeRef.refreshCurrentTab()
					}
				}
			} else if (currentTab.value === 'profile') {
				// 如果profile组件已加载，调用其刷新方法
				if (visitedTabs.has('profile')) {
					const profileRef = getCurrentInstance()?.refs?.profileRef
					if (profileRef && profileRef.refreshCurrentTab) {
						await profileRef.refreshCurrentTab()
					}
				}
			}
		})()
		
		// 等待刷新完成或超时
		await Promise.race([refreshPromise, timeoutPromise])
		
		// 模拟加载时间，确保用户能看到刷新动画
		await new Promise(resolve => setTimeout(resolve, 300))
		
		// 显示刷新成功提示
		uni.showToast({
			title: '刷新成功',
			icon: 'success',
			duration: 1500
		})
	} catch (error) {
		console.error('页面级下拉刷新失败:', error)
		uni.showToast({
			title: error.message === '刷新超时' ? '刷新超时，请重试' : '刷新失败，请重试',
			icon: 'error',
			duration: 2000
		})
	} finally {
		// 确保在所有操作完成后停止下拉刷新动画
		// 使用 nextTick 确保 DOM 更新完成
		await nextTick()
		// 添加小延迟确保异步操作完全结束
		setTimeout(() => {
			uni.stopPullDownRefresh()
			isRefreshing.value = false
			console.log('下拉刷新已停止')
		}, 100)
	}
})

// 页面显示时（从其他页面返回时）
onShow(() => {
	console.log('页面显示，当前tab:', currentTab.value)
	// 如果刷新状态异常，强制重置
	if (isRefreshing.value) {
		console.log('检测到异常刷新状态，强制重置')
		forceStopRefresh()
	}
})

// 页面隐藏时
onHide(() => {
	console.log('页面隐藏')
	// 页面隐藏时强制停止刷新
	forceStopRefresh()
})

// 暴露一些方法供外部使用（可选）
const refreshCurrentTab = () => {
	console.log('手动刷新当前tab:', currentTab.value)
	// 这里可以触发当前tab的数据刷新
}

const getVisitedTabs = () => {
	return Array.from(visitedTabs)
}

// 强制停止刷新状态（安全措施）
const forceStopRefresh = () => {
	if (isRefreshing.value) {
		uni.stopPullDownRefresh()
		isRefreshing.value = false
		console.log('强制停止刷新状态')
	}
}

defineExpose({
	refreshCurrentTab,
	getVisitedTabs,
	currentTab,
	forceStopRefresh
})
</script>

<style lang="scss" scoped>
.home-container {
	min-height: 100vh;
	background: #f8f8f8;
	padding-bottom: 120rpx; // 为底部tabbar留出空间
}

// 为不同tab内容添加不同的样式
.home-tab-content {
	/* home组件有自己的完整样式，不需要额外包装 */
	height: 100vh;
	overflow: hidden;
}

.friends-tab-content {
	/* friends组件有自己的完整样式，不需要额外包装 */
	height: 100vh;
	overflow: hidden;
}

.discover-tab-content {
	/* discover组件有自己的完整样式，不需要额外包装 */
	height: 100vh;
	overflow: hidden;
}

.profile-tab-content {
	/* profile组件有自己的完整样式，不需要额外包装 */
	height: 100vh;
	overflow: hidden;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(20rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style> 