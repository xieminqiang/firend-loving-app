<template>
  <view class="city-selector" @click="handleClick">
    <image src="@/static/icons/friend/map-pin.png" class="location-icon" mode="aspectFit" />
    <view class="city-select">
      <text>{{ currentCity }}</text>
      <image src="@/static/icons/friend/chevron-down.png" class="select-arrow" mode="aspectFit" />
    </view>
  </view>
</template>

<script setup>
import { computed } from 'vue'
import { useCityStore } from '@/stores/city.js'

// 定义emits
const emit = defineEmits(['click'])

// 获取全局城市store
const cityStore = useCityStore()

// 计算属性
const currentCity = computed(() => cityStore.currentCity)

// 方法
const handleClick = () => {
  emit('click')
}
</script>

<style lang="scss" scoped>
@import "@/styles/variables.scss";

.city-selector {
  position: relative;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(130, 160, 216, 0.1) 0%, rgba(167, 188, 231, 0.06) 100%);
  border-radius: 32rpx;
  padding: 6rpx 12rpx 6rpx 12rpx;
  border: 1rpx solid rgba(130, 160, 216, 0.12);
  box-shadow: 0 2rpx 8rpx rgba(130, 160, 216, 0.08);
  backdrop-filter: blur(10rpx);
  -webkit-backdrop-filter: blur(10rpx);
  transition: all 0.3s;
  
  &:active {
    transform: scale(0.96);
    box-shadow: 0 4rpx 12rpx rgba(130, 160, 216, 0.12);
    background: linear-gradient(135deg, rgba(130, 160, 216, 0.15) 0%, rgba(167, 188, 231, 0.08) 100%);
  }
}

.location-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 6rpx;
  /* PNG图标已经是正确颜色，不需要filter */
}

.city-select {
  display: flex;
  align-items: center;
  padding: 0;
  color: $text-color-primary;
  font-size: 24rpx;
  font-weight: 600;
}

.select-arrow {
  width: 24rpx;
  height: 24rpx;
  margin-left: 6rpx;
  transition: transform 0.3s;
  opacity: 0.8;
  /* PNG图标已经是正确颜色，不需要filter */
}

.city-selector:active .select-arrow {
  transform: rotate(180deg);
}
</style> 