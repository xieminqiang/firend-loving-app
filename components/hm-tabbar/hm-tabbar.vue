<template>
	<view class="hm_tabbar">
		<u-tabbar :value="currentTab" activeColor="#7363FF" inactiveColor="#1A1A1A" :border="false" :fixed="true"
			:placeholder="true" :safeAreaInsetBottom="true">
			<u-tabbar-item v-for="(item,i) in tabList" :key="item.name" :text="item.text" :name="item.name"
			 @click="handTab(item)">
				<template #active-icon>
					<image class="u-page__item__slot-icon" :src="item.selectedIconPath"></image>
				</template>
				<template #inactive-icon>
					<image class="u-page__item__slot-icon" :src="item.iconPath"></image>
				</template>
			</u-tabbar-item>
		</u-tabbar>
	</view>
</template>

<script setup>
import { defineEmits } from 'vue'

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

	// 定义emit事件，用于通知父组件tab切换
	const emit = defineEmits(['tabChange'])

	const handTab = (row) => {
		// 不再跳转页面，而是发送事件通知父组件
		emit('tabChange', row.name)
	}
</script>


	<style lang="scss" scoped>
		.hm_tabbar {
		}
	
		.u-page__item__slot-icon {
			width: 40rpx;
			height: 40rpx;
		}
	
		:deep(.u-tabbar) {
			height: 100rpx;
			// height: 88px !important;
		}
	
		:deep(.u-tabbar-item) {
			// height: 88px;
		}
	
		:deep(.u-tabbar__content) {
			padding: 10rpx 0 34rpx;;
		}
</style>