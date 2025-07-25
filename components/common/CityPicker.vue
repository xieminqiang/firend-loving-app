<template>
  <view v-if="visible" class="city-picker-overlay" @click="handleOverlayClick">
    <view class="city-picker-container" @click.stop>
      <view class="city-picker-header">
        <text class="picker-title">请选择服务区域</text>
        <view class="picker-close" @click="handleClose">
          <text>✕</text>
        </view>
      </view>
      <view class="city-picker-content">
        <view class="city-grid">
          <view 
            v-for="(cityItem, index) in cityList" 
            :key="index"
            :class="['city-item', { 
              active: currentCityIndex === index
            }]"
            @click="handleCitySelect(index)"
          >
            <text class="city-name">{{ cityItem.name }}</text>
            <view v-if="currentCityIndex === index" class="city-check">✓</view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useCityStore } from '@/stores/city.js'

// 定义props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// 定义emits
const emit = defineEmits(['update:visible', 'city-selected'])

// 获取全局城市store
const cityStore = useCityStore()

// 计算属性
const cityList = computed(() => cityStore.cityList)
const currentCityIndex = computed(() => cityStore.cityIndex)

// 方法
const handleOverlayClick = () => {
  emit('update:visible', false)
}

const handleClose = () => {
  emit('update:visible', false)
}

const handleCitySelect = (index) => {
  cityStore.selectCity(index)
  emit('city-selected', index)
  emit('update:visible', false)
}
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

/* 自定义城市选择弹窗 */
.city-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8rpx);
  -webkit-backdrop-filter: blur(8rpx);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    transform: translateY(100rpx);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}

.city-picker-container {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 248, 250, 0.95) 100%);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  padding: 40rpx;
  border-radius: 32rpx;
  width: 85%;
  max-width: 640rpx;
  box-shadow: 0 20rpx 60rpx rgba(130, 160, 216, 0.2);
  border: 1rpx solid rgba(130, 160, 216, 0.1);
  animation: slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -30%;
    width: 200rpx;
    height: 200rpx;
    background: radial-gradient(circle, rgba(130, 160, 216, 0.08) 0%, transparent 70%);
    border-radius: 50%;
    z-index: 0;
  }
}

.city-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40rpx;
  position: relative;
  z-index: 1;
}

.picker-title {
  font-size: 30rpx;
  font-weight: 400;
  color: $text-color-primary;
  position: relative;
}

.picker-close {
  width: 56rpx;
  height: 56rpx;
  background: linear-gradient(135deg, rgba(130, 160, 216, 0.1) 0%, rgba(255, 255, 255, 0.8) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: $text-color-secondary;
  font-weight: 600;
  transition: all 0.3s;
  border: 1rpx solid rgba(130, 160, 216, 0.15);
  
  &:active {
    transform: scale(0.9);
    background: linear-gradient(135deg, rgba(130, 160, 216, 0.15) 0%, rgba(255, 255, 255, 0.9) 100%);
  }
}

.city-picker-content {
  position: relative;
  z-index: 1;
}

.city-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.city-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 20rpx;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(247, 248, 250, 0.6) 100%);
  border: 2rpx solid rgba(130, 160, 216, 0.1);
  border-radius: 24rpx;
  position: relative;
  overflow: hidden;
}

.city-item.active {
  background: linear-gradient(135deg, rgba(130, 160, 216, 0.15) 0%, rgba(167, 188, 231, 0.1) 100%);
  border-color: $primary-color;
}

.city-name {
  flex: 1;
  font-size: 26rpx;
  color: $text-color-primary;
  font-weight: 400;
  letter-spacing: 1rpx;
}

.city-item.active .city-name {
  color: $primary-color;
  font-weight: 500;
}

.city-check {
  width: 28rpx;
  height: 28rpx;
  background: linear-gradient(135deg, $primary-color 0%, $highlight-color 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18rpx;
  color: white;
  font-weight: 700;
  box-shadow: 0 3rpx 10rpx rgba(130, 160, 216, 0.25);
  animation: checkBounce 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  margin-left: 16rpx;
  flex-shrink: 0;
}

@keyframes checkBounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style> 