<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	@import "@/styles/variables.scss";
	@import "@/styles/common.scss";
	
	/* 每个页面公共css */
	page {
		-webkit-overflow-scrolling: touch;
		-ms-overflow-style: none;
		scrollbar-width: none;
		background-color: #f7f8fa;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
		height: 100vh;
		overflow: hidden;
	}
	
	/* 隐藏滚动条 */
	::-webkit-scrollbar {
		display: none;
		width: 0;
		height: 0;
		color: transparent;
	}
	
	/* uni-app页面滚动条隐藏 */
	.uni-page-body {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	
	.uni-page-body::-webkit-scrollbar {
		display: none;
	}
	
	/* 全局滚动区域隐藏滚动条 */
	scroll-view::-webkit-scrollbar {
		display: none;
	}
	
	/* 全局按钮样式重置 */
	button {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
		font-size: inherit;
		color: inherit;
	}
	
	button::after {
		border: none;
	}
	
	/* 全局输入框样式重置 */
	input, textarea {
		font-family: inherit;
	}
	
	/* 优化picker组件样式 */
	.uni-picker-container {
		background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(247, 248, 250, 0.98) 100%) !important;
		backdrop-filter: blur(20rpx) !important;
		-webkit-backdrop-filter: blur(20rpx) !important;
		border-radius: 32rpx 32rpx 0 0 !important;
		box-shadow: 0 -8rpx 32rpx rgba(130, 160, 216, 0.15) !important;
		border: 1rpx solid rgba(130, 160, 216, 0.1) !important;
		border-bottom: none !important;
	}
	
	.uni-picker-header {
		background: linear-gradient(135deg, rgba(130, 160, 216, 0.08) 0%, rgba(255, 255, 255, 0.6) 100%) !important;
		backdrop-filter: blur(10rpx) !important;
		-webkit-backdrop-filter: blur(10rpx) !important;
		border-bottom: 1rpx solid rgba(130, 160, 216, 0.1) !important;
		border-radius: 32rpx 32rpx 0 0 !important;
		padding: 24rpx 32rpx !important;
	}
	
	.uni-picker-action {
		color: #7363FF !important;
		font-weight: 600 !important;
		font-size: 32rpx !important;
		transition: all 0.3s !important;
	}
	
	.uni-picker-action:active {
		opacity: 0.7 !important;
		transform: scale(0.95) !important;
	}
	
	.uni-picker-action.uni-picker-action-confirm {
		background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%) !important;
		color: white !important;
		border-radius: 24rpx !important;
		padding: 12rpx 32rpx !important;
		box-shadow: 0 4rpx 16rpx rgba(115, 99, 255, 0.3) !important;
		border: none !important;
	}
	
	.uni-picker-action.uni-picker-action-cancel {
		color: #666666 !important;
		background: rgba(115, 99, 255, 0.08) !important;
		border-radius: 24rpx !important;
		padding: 12rpx 32rpx !important;
		border: 1rpx solid rgba(115, 99, 255, 0.15) !important;
	}
	
	.uni-picker-content {
		background: rgba(255, 255, 255, 0.95) !important;
		backdrop-filter: blur(10rpx) !important;
		-webkit-backdrop-filter: blur(10rpx) !important;
		padding: 32rpx 0 !important;
	}
	
	.uni-picker-item {
		color: #1A1A1A !important;
		font-size: 36rpx !important;
		font-weight: 500 !important;
		padding: 24rpx 32rpx !important;
		transition: all 0.3s !important;
		border-radius: 16rpx !important;
		margin: 0 32rpx !important;
	}
	
	.uni-picker-item.uni-picker-item-selected {
		background: linear-gradient(135deg, rgba(115, 99, 255, 0.12) 0%, rgba(255, 105, 222, 0.08) 100%) !important;
		color: #7363FF !important;
		font-weight: 700 !important;
		box-shadow: 0 4rpx 16rpx rgba(115, 99, 255, 0.15) !important;
		border: 1rpx solid rgba(115, 99, 255, 0.2) !important;
		transform: scale(1.02) !important;
	}
	
	/* picker遮罩层优化 */
	.uni-mask {
		background: rgba(0, 0, 0, 0.4) !important;
		backdrop-filter: blur(4rpx) !important;
		-webkit-backdrop-filter: blur(4rpx) !important;
	}
	
	/* 城市选择特殊样式 */
	.city-picker-item {
		position: relative !important;
	}
	
	.city-picker-item::before {
		content: '📍' !important;
		position: absolute !important;
		left: 32rpx !important;
		top: 50% !important;
		transform: translateY(-50%) !important;
		font-size: 28rpx !important;
		opacity: 0.6 !important;
	}
	
	.city-picker-item.uni-picker-item-selected::before {
		opacity: 1 !important;
		filter: drop-shadow(0 2rpx 4rpx rgba(115, 99, 255, 0.3)) !important;
	}
	
	/* 动画效果 */
	@keyframes pickerSlideUp {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	
	.uni-picker-container {
		animation: pickerSlideUp 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
	}
</style>
