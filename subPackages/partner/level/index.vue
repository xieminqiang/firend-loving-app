<template>
  <view class="level-container">
    <!-- 主内容区域 -->
    <view class="main-content">
      <scroll-view 
        class="scroll-container" 
        scroll-y="true"
        refresher-enabled="true"
        :refresher-triggered="isRefreshing"
        @refresherrefresh="onRefresh"
        @refresherrestore="onRefreshRestore"
      >
        <!-- 当前等级卡片 -->
        <view class="current-level-card modern-card">
          <view class="level-header">
            <view class="level-info">
              <image 
                :src="currentLevel?.icon_url " 
                class="level-icon" 
                mode="aspectFit" 
              />
              <view class="level-details">
                <text class="level-name">{{ currentLevel?.level_name || '见习' }}陪伴师</text>
                <text class="level-description">成长值：{{ userGrowthValue  }}</text>
              </view>
            </view>
            <view class="commission-rate">
              <text class="rate-label">分成比例</text>
              <text class="rate-value">{{ (currentLevel?.commission_rate || 0.65) * 100 }}%</text>
            </view>
          </view>
        </view>

        <!-- 升级任务卡片 -->
        <view class="upgrade-task-card modern-card">
          <view class="card-header">
            <view class="header-content">
              <view class="section-indicator"></view>
              <view class="header-text">
                <text class="card-title">升级任务</text>
                <text class="card-subtitle">完成成长值要求即可升级</text>
              </view>
            </view>
          </view>
          
          <view class="upgrade-content" v-if="nextLevel">
            <view class="upgrade-path">
              <view class="current-level-item">
                <image 
                  :src="currentLevel?.icon_url || '/static/icons/profile/crown.png'" 
                  class="level-icon-small" 
                  mode="aspectFit" 
                />
                <text class="level-name-small">{{ currentLevel?.level_name || '见习' }}</text>
              </view>
              <view class="upgrade-arrow">
                <text class="arrow-text">→</text>
              </view>
              <view class="next-level-item">
                <image 
                  :src="nextLevel.icon_url" 
                  class="level-icon-small" 
                  mode="aspectFit" 
                />
                <text class="level-name-small">{{ nextLevel.level_name }}</text>
              </view>
            </view>
            
            <view class="upgrade-requirements">
              <text class="requirement-title">升级要求：</text>
              <text class="requirement-text">{{ nextLevel.description }}</text>
            </view>
            
            <view class="progress-section">
              <view class="progress-info">
                <text class="progress-label">当前成长值</text>
                <text class="progress-value">{{ userGrowthValue || 0 }}</text>
              </view>
              <view class="progress-bar">
                <view 
                  class="progress-fill" 
                  :style="{ width: progressPercentage + '%' }"
                ></view>
              </view>
              <view class="progress-target">
                <text class="target-text">目标：{{ nextLevel.min_stars }} 成长值</text>
              </view>
            </view>
          </view>
          
          <view class="max-level-tip" v-else>
            <text class="tip-text">🎉 恭喜！您已达到最高等级</text>
          </view>
        </view>

        <!-- 分成比例卡片 -->
        <view class="commission-card modern-card">
          <view class="card-header">
            <view class="header-content">
              <view class="section-indicator"></view>
              <view class="header-text">
                <text class="card-title">分成比例</text>
                <text class="card-subtitle">当前等级的分成比例</text>
              </view>
            </view>
          </view>
          
          <view class="commission-content">
            <view class="commission-display">
              <text class="commission-value">{{ (currentLevel?.commission_rate || 0.65) * 100 }}%</text>
              <text class="commission-label">平台分成比例</text>
            </view>
            <view class="commission-note">
              <text class="note-text">您将获得订单金额的 {{ (currentLevel?.commission_rate || 0.65) * 100 }}% 作为收入</text>
            </view>
          </view>
        </view>

        <!-- 等级说明卡片 -->
        <view class="level-explanation-card modern-card">
          <view class="card-header">
            <view class="header-content">
              <view class="section-indicator"></view>
              <view class="header-text">
                <text class="card-title">等级说明</text>
                <text class="card-subtitle">成长值与接单金额规则</text>
              </view>
            </view>
          </view>
          
          <view class="explanation-content">
            <text class="explanation-text">
              成长值规则：每接单1元获得1成长值，积累成长值可晋升更高等级，享受更多权益。
            </text>
          </view>
        </view>

        <!-- 等级列表卡片 -->
        <view class="levels-list-card modern-card">
          <view class="card-header">
            <view class="header-content">
              <view class="section-indicator"></view>
              <view class="header-text">
                <text class="card-title">等级列表</text>
                <text class="card-subtitle">所有等级信息</text>
              </view>
            </view>
          </view>
          
          <view class="levels-list">
            <view 
              v-for="level in serviceLevels" 
              :key="level.id"
              class="level-item"
              :class="{ current: level.level_order === currentLevel?.level_order }"
            >
              <view class="level-item-content">
                <image 
                  :src="level.icon_url" 
                  class="level-item-icon" 
                  mode="aspectFit" 
                />
                <view class="level-item-info">
                  <text class="level-item-name">{{ level.level_name }}</text>
                  <text class="level-item-desc">{{ level.description }}</text>
                </view>
                <view class="level-item-commission">
                  {{ level.commission_rate * 100 }}%
                </view>
              </view>
            
            </view>
          </view>
        </view>

        <view style="height: 200rpx;"></view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getApplicatioInfo } from '@/api/user.js'
import { useLevelStore } from '@/stores/level.js'

// 响应式数据
const isRefreshing = ref(false)
const currentLevel = ref(null)
const userGrowthValue = ref(0)

// 获取全局store
const levelStore = useLevelStore()

// 计算属性
const serviceLevels = computed(() => levelStore.sortedServiceLevels)

const nextLevel = computed(() => {
  if (!currentLevel.value || !serviceLevels.value.length) return null
  const currentOrder = currentLevel.value.level_order
  return serviceLevels.value.find(level => level.level_order > currentOrder)
})

const progressPercentage = computed(() => {
  if (!nextLevel.value || !userGrowthValue.value) return 0
  const current = userGrowthValue.value
  const target = nextLevel.value.min_stars
  const percentage = (current / target) * 100
  return Math.min(percentage, 100)
})



const onRefresh = async () => {
  isRefreshing.value = true
  try {
    await loadData()
  } catch (error) {
    console.error('刷新数据失败:', error)
  } finally {
    isRefreshing.value = false
  }
}

const onRefreshRestore = () => {
  isRefreshing.value = false
}

const loadServiceLevels = async () => {
  try {
    // 使用全局store获取服务等级列表
    await levelStore.fetchServiceLevels()
    console.log('服务等级列表加载完成')
  } catch (error) {
    console.error('获取服务等级列表失败:', error)
    uni.showToast({
      title: '获取等级信息失败',
      icon: 'none'
    })
  }
}

const loadUserApplication = async () => {
  try {
    const response = await getApplicatioInfo()

    if (response.data && response.data.code === 0 && response.data.data) {
      const application = response.data
      userGrowthValue.value = application.data.growth_value || 0
      console.log("userGrowthValue.value",userGrowthValue.value)
      // 根据成长值确定当前等级
      const currentLevelOrder = application.data.level_order
      console.log("currentLevelOrder",application)
      currentLevel.value = serviceLevels.value.find(level => level.level_order === currentLevelOrder)
    }
  } catch (error) {
    console.error('获取用户申请信息失败:', error)
  }
}

const getCurrentLevelOrder = (growthValue) => {
  // 根据成长值确定等级
  for (let i = serviceLevels.value.length - 1; i >= 0; i--) {
    const level = serviceLevels.value[i]
    if (growthValue >= level.min_stars) {
      return level.level_order
    }
  }
  return 1 // 默认见习等级
}

const loadData = async () => {
  await loadServiceLevels()
  await loadUserApplication()
}

// 生命周期
onMounted(() => {
  // 加载数据
  loadData()
})
</script>

<style lang="scss" scoped>
.level-container {
  height: 100vh;
  background: linear-gradient(135deg, #F7F8FA 0%, #FFFFFF 100%);
  display: flex;
  flex-direction: column;
}



.main-content {
  flex: 1;
  padding: 0 20rpx;
  box-sizing: border-box;
  height: 0; /* 关键：让flex子元素能够正确计算高度 */
}

.scroll-container {
  height: 100%;
  box-sizing: border-box;
  flex: 1;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
}

.modern-card {
  background: #FFFFFF;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.card-header {
  padding: 24rpx 24rpx 0 24rpx;
 
}

.header-content {
  display: flex;
  align-items: flex-start;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.section-indicator {
  width: 6rpx;
  height: 28rpx;
  background: linear-gradient(135deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 3rpx;
  margin-right: 16rpx;
  margin-top: 6rpx;
}

.header-text {
  flex: 1;
}

.card-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 6rpx;
}

.card-subtitle {
  font-size: 22rpx;
  color: #999999;
}

// 当前等级卡片
.current-level-card {
  background: #FFFFFF;
  color: #1A1A1A;
  margin-top: 20rpx;
}

.level-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 24rpx;
}

.level-info {
  display: flex;
  align-items: center;
}

.level-icon {
  width: 100rpx;
  height:100rpx;
  margin-right: 16rpx;
}

.level-details {
  flex: 1;
}

.level-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 6rpx;
  color: #7363FF;
}

.level-description {
  font-size: 22rpx;
  color: #666666;
}

.commission-rate {
  text-align: right;
  color: #7363FF;
}

.rate-label {
  display: block;
  font-size: 22rpx;
  color: #999999;
  margin-bottom: 6rpx;
}

.rate-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #7363FF;
}

// 升级任务卡片
.upgrade-content {
  padding: 24rpx;
}

.upgrade-path {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.current-level-item,
.next-level-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
}

.level-icon-small {
  width: 80rpx;
  height: 80rpx;
  margin-bottom: 8rpx;
}

.level-name-small {
  font-size: 22rpx;
  color: #666666;
}

.upgrade-arrow {
  margin: 0 32rpx;
}

.arrow-text {
  font-size: 28rpx;
  color: #7363FF;
  font-weight: bold;
}

.upgrade-requirements {
  display: flex;
  margin-bottom: 24rpx;
}

.requirement-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #1A1A1A;
 
}

.requirement-text {
  font-size: 24rpx;
  color: #666666;
 
}

.progress-section {
  background: #F7F8FA;
  border-radius: 10rpx;
  padding: 16rpx;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.progress-label {
  font-size: 22rpx;
  color: #666666;
}

.progress-value {
  font-size: 26rpx;
  font-weight: 600;
  color: #7363FF;
}

.progress-bar {
  height: 6rpx;
  background: #E5E5E5;
  border-radius: 3rpx;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #7363FF 0%, #FF69DE 100%);
  border-radius: 4rpx;
  transition: width 0.3s ease;
}

.progress-target {
  text-align: right;
}

.target-text {
  font-size: 20rpx;
  color: #999999;
}

.max-level-tip {
  padding: 32rpx 24rpx;
  text-align: center;
}

.tip-text {
  font-size: 26rpx;
  color: #4CAF50;
  font-weight: 600;
}

// 分成比例卡片
.commission-content {
  padding: 24rpx;
}

.commission-display {
  text-align: center;
  margin-bottom: 16rpx;
}

.commission-value {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
  color: #7363FF;
  margin-bottom: 8rpx;
}

.commission-label {
  font-size: 22rpx;
  color: #666666;
}

.commission-note {
  background: #F7F8FA;
  border-radius: 10rpx;
  padding: 16rpx;
}

.note-text {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.4;
}

// 等级说明卡片
.explanation-content {
  padding: 24rpx;
}

.explanation-text {
  font-size: 24rpx;
  color: #666666;
  line-height: 1.5;
}

// 等级列表卡片
.levels-list {
  padding: 24rpx;
}

.level-item {
  border-bottom: 1rpx solid #F0F0F0;
  padding: 16rpx 0;
}

.level-item:last-child {
  border-bottom: none;
}

.level-item.current {
  background: linear-gradient(135deg, rgba(115, 99, 255, 0.08) 0%, rgba(255, 105, 222, 0.08) 100%);
  border-radius: 10rpx;
  margin: 0 -24rpx;
  padding: 16rpx 24rpx;
}

.level-item-content {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.level-item-icon {
  width: 54rpx;
  height: 54rpx;
  margin-right: 16rpx;
}

.level-item-info {
  flex: 1;
}

.level-item-name {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 4rpx;
}

.level-item-desc {
  font-size: 22rpx;
  color: #666666;
}

.level-item-commission {

  color: #1A1A1A;
  padding: 6rpx 12rpx;

  box-sizing: border-box;
}

.commission-text {
  font-size: 20rpx;
  font-weight: 600;
}

.level-item-range {
  margin-left: 70rpx;
}

.range-text {
  font-size: 22rpx;
  color: #999999;
}
</style> 