<template>
	<view class="home-container">
		<!-- 使用v-show避免组件重新创建，保持数据状态 -->
		<view v-show="currentTab === 'home'" class="home-tab-content">
			<!-- 引入真正的home组件，使用懒加载 -->
			<HomeComponent v-if="visitedTabs.has('home')" />
		</view>
   
		<view v-show="currentTab === 'friends'" class="friends-tab-content">
			<!-- 引入友伴组件，使用懒加载 -->
			<FriendsComponent v-if="visitedTabs.has('friends')" />
		</view>

		<view v-show="currentTab === 'discover'" class="discover-tab-content">
			<!-- 引入发现组件，使用懒加载 -->
			<DiscoverComponent 
				v-if="visitedTabs.has('discover')" 
				ref="discoverComponentRef"
			/>
		</view>
                
		<view v-show="currentTab === 'profile'" class="profile-tab-content">
			<!-- 引入个人中心组件，使用懒加载 -->
			<ProfileComponent v-if="visitedTabs.has('profile')" />
		</view>

		<!-- 底部Tabbar -->
		<hm-tabbar 
			:currentTab="currentTab" 
			@tabChange="handleTabChange"
		/>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick} from 'vue'
import hmTabbar from '@/components/hm-tabbar/hm-tabbar.vue'
import HomeComponent from './components/home.vue'
import FriendsComponent from './components/friends.vue'
import DiscoverComponent from './components/discover.vue'
import ProfileComponent from './components/profile.vue'

// 当前选中的tab
const currentTab = ref('home')

// 记录已访问过的tab，用于懒加载
const visitedTabs = reactive(new Set(['home']))

// 组件引用
const discoverComponentRef = ref(null)


// 处理tab切换
const handleTabChange = async (tabName) => {
	// 记录访问过的tab
	visitedTabs.add(tabName)
	
	// 切换tab
	currentTab.value = tabName
	
	console.log(`切换到 ${tabName} tab，已访问的tab:`, Array.from(visitedTabs))
	console.log('当前tab状态:', {
		currentTab: currentTab.value,
		visitedTabs: Array.from(visitedTabs),
		discoverVisited: visitedTabs.has('discover')
	})
	
	// 如果切换到discover tab，调用子组件的显示方法
	if (tabName === 'discover' && discoverComponentRef.value) {
		// 等待DOM更新
		await nextTick()
		// 调用子组件的显示方法
		discoverComponentRef.value.showComponent()
	}
}


// 监听登录成功事件
const handleLoginSuccess = async (data) => {
	console.log('home页面收到登录成功事件:', data)
	// 如果当前在discover tab，刷新discover组件数据
	if (currentTab.value === 'discover' && discoverComponentRef.value) {
		await nextTick()
		discoverComponentRef.value.showComponent()
	}
}

// 页面挂载时初始化
onMounted(() => {
	console.log('页面挂载完成，当前tab:', currentTab.value)
	console.log('已访问的tab:', Array.from(visitedTabs))
	
	// 监听登录成功事件
	uni.$on('loginSuccess', handleLoginSuccess)
})

// 页面卸载时移除事件监听
onUnmounted(() => {
	uni.$off('loginSuccess', handleLoginSuccess)
})

// 页面显示时（从其他页面返回时）


// 暴露一些方法供外部使用（可选）
const refreshCurrentTab = () => {
	console.log('手动刷新当前tab:', currentTab.value)
	// 这里可以触发当前tab的数据刷新
}

const getVisitedTabs = () => {
	return Array.from(visitedTabs)
}

defineExpose({
	refreshCurrentTab,
	getVisitedTabs,
	currentTab,
})
</script>

<style lang="scss" scoped>
.home-container {
	height: 100vh;

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