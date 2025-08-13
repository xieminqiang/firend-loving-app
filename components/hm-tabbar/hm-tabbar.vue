<template>
	<view class="hm_tabbar">
		<u-tabbar 
			:value="currentTab" 
			activeColor="#7363FF" 
			inactiveColor="#8A8A8A" 
			:border="false" 
			:fixed="true"
			:placeholder="true" 
			:safeAreaInsetBottom="true"
			class="custom-tabbar"
		>
			<u-tabbar-item 
				v-for="item in tabList" 
				:key="item.name" 
				:text="item.text" 
				:name="item.name"
				@click="handTab(item)"
				class="tab-item"
			>
				<template #active-icon>
					<view class="icon-wrapper active">
						<image class="tab-icon" :src="item.selectedIconPath"></image>
					</view>
				</template>
				<template #inactive-icon>
					<view class="icon-wrapper">
						<image class="tab-icon" :src="item.iconPath"></image>
					</view>
				</template>
			</u-tabbar-item>
		</u-tabbar>
	</view>
</template>

<script setup>


	const tabList = [
			{
				"name": "home",
				"pagePath": "pages/tabbar/home/index",
				"text": "首页",
				"iconPath": "/static/icons/tabbar/home.png",
				"selectedIconPath": "/static/icons/tabbar/home-fill.png"
			},
			{
				"name": "friends",
				"pagePath": "pages/tabbar/friends/index",
				"text": "友伴",
				"iconPath": "/static/icons/tabbar/friends.png",
				"selectedIconPath": "/static/icons/tabbar/friends-fill.png"
			},
			{
				"name": "discover",
				"pagePath": "pages/tabbar/discover/index",
				"text": "发现",
				"iconPath": "/static/icons/tabbar/discover.png",
				"selectedIconPath": "/static/icons/tabbar/discover-fill.png"
			},
			{
				"name": "profile",
				"pagePath": "pages/tabbar/profile/index",
				"text": "我的",
				"iconPath": "/static/icons/tabbar/profile.png",
				"selectedIconPath": "/static/icons/tabbar/profile-fill.png"
			}
		]

	const props = defineProps({
		currentTab: {
			type: String,
			default: 'home'
		}
	})



	const handTab = (row) => {
		uni.switchTab({
			url: '/' + row.pagePath
		})
	}
</script>

<style lang="scss" scoped>
	.hm_tabbar {
		.custom-tabbar {
			background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
			box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.08);
			border-radius: 24rpx 24rpx 0 0;
			backdrop-filter: blur(20rpx);
		}
	}

	.icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		
	
	}

	.tab-icon {
		width: 48rpx;
		height: 48rpx;
		
	}

	:deep(.u-tabbar) {
		height: 120rpx;
		padding: 0 20rpx;
	}

	:deep(.u-tabbar-item) {
		height: 120rpx;
		transition: all 0.3s ease;
		
		&:hover {
			transform: translateY(-4rpx);
		}
	}

	:deep(.u-tabbar__content) {
		padding: 16rpx 0;
	}

	:deep(.u-tabbar-item__text) {
		font-size: 24rpx;
		font-weight: 500;
		margin-top: 8rpx;
		transition: all 0.3s ease;
	}

	:deep(.u-tabbar-item--active .u-tabbar-item__text) {
		font-weight: 600;
		color: #7363FF;
		transform: scale(1.05);
	}

	// 添加响应式设计
	@media (max-width: 750rpx) {
		.icon-wrapper {
			width: 70rpx;
			height: 70rpx;
		}
		
		.tab-icon {
			width: 42rpx;
			height: 42rpx;
		}
		
		:deep(.u-tabbar-item__text) {
			font-size: 22rpx;
		}
	}
</style>