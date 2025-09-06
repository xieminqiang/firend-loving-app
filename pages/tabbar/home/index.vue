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
			<DiscoverComponent v-if="visitedTabs.has('discover')" @playVideo="openVideoPopup" />
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

		<!-- 视频播放弹框 -->
				<u-popup :show="popupShow" mode="center"   :safeAreaInsetBottom="false">
			<view class="video-popup-content">
				<video 
					class="video-player" 
					:src="currentVideoPath" 
					:controls="false" 
					:show-center-play-btn="false"
					:show-fullscreen-btn="false"
					:show-progress="true"
					:enable-progress-gesture="true"
					autoplay>
				</video>
				<!-- 关闭按钮 -->
				<view class="close-btn" @tap="closeVideoPopup">
					<image src="/static/find/close2.png" mode="widthFix" class="close-icon"></image>
				</view>
			</view>
		</u-popup>
  </view>
</template>

<script setup>
import { ref, reactive, onMounted} from 'vue'
import hmTabbar from '@/components/hm-tabbar/hm-tabbar.vue'
import HomeComponent from './components/home.vue'
import FriendsComponent from './components/friends.vue'
import DiscoverComponent from './components/discover.vue'
import ProfileComponent from './components/profile.vue'

// 当前选中的tab
const currentTab = ref('home')

// 记录已访问过的tab，用于懒加载
const visitedTabs = reactive(new Set(['home']))

// 视频弹框相关状态
const popupShow = ref(false)
const currentVideoPath = ref('')

// 处理tab切换
const handleTabChange = (tabName) => {
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
}

// 打开视频弹框
const openVideoPopup = (videoPath) => { 
	console.log('播放视频4:', videoPath)
	currentVideoPath.value = videoPath
	popupShow.value = true
}

// 关闭视频弹框
const closeVideoPopup = () => {
	popupShow.value = false
	currentVideoPath.value = ''
}

// 页面挂载时初始化
onMounted(() => {
	console.log('页面挂载完成，当前tab:', currentTab.value)
	console.log('已访问的tab:', Array.from(visitedTabs))
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
	openVideoPopup,
	closeVideoPopup
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

.video-popup {
	background-color: #fff;
	border-radius: 20rpx;
	overflow: hidden;
	box-sizing: border-box;
    width: 100vw;

	.video-popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;

		.video-popup-title {
			font-size: 32rpx;
			font-weight: 500;
			color: #333;
		}

		.video-popup-close {
			font-size: 40rpx;
			color: #999;
			cursor: pointer;
			padding: 10rpx;
		}
	}

	
} 
	.video-popup-content {
		width: 100vw;
		background: transparent;
		padding: 0;
		margin: 0;
		
		.video-player {
			width: 100vw;
			height: 100vh;
			background: transparent;
			border: none;
			outline: none;
			display: block;
			vertical-align: top;
		}

		.close-btn {
			position: absolute;
			bottom: 40rpx;
			left: 50%;
			transform: translateX(-50%);
			z-index: 1000;
			width: 80rpx;
			height: 80rpx;
			display: flex;
			justify-content: center;
			align-items: center;
			background: rgba(255, 255, 255, 1);
			border-radius: 50%;
			
		}

		.close-icon {
			width: 40rpx;
			height: 40rpx;
		}
	}

	/* 确保u-popup没有默认样式 */
	:deep(.u-popup__content) {
		background-color: transparent !important;
		padding: 0 !important;
		margin: 0 !important;
		border: none !important;
	}

	/* 确保视频元素没有默认样式 */
	:deep(video) {
		background-color: transparent !important;
		border: none !important;
		outline: none !important;
		vertical-align: top !important;
	}
</style> 