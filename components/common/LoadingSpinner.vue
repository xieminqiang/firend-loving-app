<template>
  <view class="loading-spinner" v-if="visible">
    <view class="spinner" :class="{ [`spinner-${size}`]: true }">
      <view class="dot" v-for="i in 8" :key="i"></view>
    </view>
    <text class="loading-text" v-if="text">{{ text }}</text>
  </view>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  },
  text: {
    type: String,
    default: ''
  }
})
</script>

<style lang="scss" scoped>
.loading-spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
}

.loading-spinner {
  position: relative;
  width: 64rpx;
  height: 64rpx;
}

.spinner-dot {
  position: absolute;
  top: 0;
  left: 50%;
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #7363FF;
  transform-origin: 0 32rpx;
  animation: spinner-rotate 1.2s infinite linear;

  &:nth-child(1) {
    transform: rotate(0deg) translate(0, -20rpx);
    animation-delay: 0s;
  }
  
  &:nth-child(2) {
    transform: rotate(45deg) translate(0, -20rpx);
    animation-delay: 0.15s;
  }
  
  &:nth-child(3) {
    transform: rotate(90deg) translate(0, -20rpx);
    animation-delay: 0.3s;
  }
  
  &:nth-child(4) {
    transform: rotate(135deg) translate(0, -20rpx);
    animation-delay: 0.45s;
  }
  
  &:nth-child(5) {
    transform: rotate(180deg) translate(0, -20rpx);
    animation-delay: 0.6s;
  }
  
  &:nth-child(6) {
    transform: rotate(225deg) translate(0, -20rpx);
    animation-delay: 0.75s;
  }
  
  &:nth-child(7) {
    transform: rotate(270deg) translate(0, -20rpx);
    animation-delay: 0.9s;
  }
  
  &:nth-child(8) {
    transform: rotate(315deg) translate(0, -20rpx);
    animation-delay: 1.05s;
  }
}

@keyframes spinner-rotate {
  0% { opacity: 1; }
  100% { opacity: 0.2; }
}

.loading-text {
  margin-top: 20rpx;
  font-size: 24rpx;
  color: #666666;
  text-align: center;
}
</style> 