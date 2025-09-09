<template>
  <view class="balance-container">
    <!-- 余额明细按钮 -->
    <view class="balance-details-btn" @click="goToBalanceDetails">
      <image src="@/static/icons/profile/mxi.png" class="details-icon" mode="aspectFit" />
      <text class="details-text">余额明细</text>
    </view>
    
    <image src="@/static/icons/profile/yue.png" class="balance-icon" mode="aspectFit" />
    <view class="balance-text">我的余额</view>
    <view class="balance-amount">
      <text class="currency-symbol">¥</text>
      <text class="amount-number">{{ formatBalance(balanceInfo.available_balance) }}</text>
    </view>
    
    <!-- 提现按钮 -->
    <view class="withdraw-button" @click="goToWithdraw">
      提现
    </view>
  </view>

  <!-- 待确认提现弹框 -->
  <u-popup
    :show="showPendingWithdraw"
    mode="bottom"
    :round="20"
    :closeOnClickOverlay="true"
    @close="closePendingWithdraw"
  >
    <view class="pending-withdraw-popup">
      <view class="popup-header">
        <text class="popup-title">待确认收款</text>
        <text class="popup-close" @click="closePendingWithdraw">×</text>
      </view>
      
      <view class="withdraw-list">
        <view 
          v-for="item in pendingWithdrawList" 
          :key="item.id" 
          class="withdraw-item"
        >
          <view class="withdraw-info">
            <view class="withdraw-time">{{ formatTime(item.created_at) }}</view>
            <view class="withdraw-amount">¥{{ formatAmount(item.amount) }}</view>
          </view>
          <view class="withdraw-actions">
            <view class="confirm-btn" @click="confirmReceipt(item)">
              确认收款
            </view>
          </view>
        </view>
      </view>
    </view>
  </u-popup>

  <!-- 提现成功弹框 -->
  <u-modal
    title="提现已提交成功"
    :show="showWithdrawSuccess"
    content="您的提现请求已成功提交。提现状态会在后台处理后更新，请稍后查看账户余额或联系客服确认。"
    closeOnClickOverlay
    showCancelButton
    @close="() => showWithdrawSuccess = false"
  >
    <template #confirmButton>
      <u-button
        text="确定"
        type="success"
        shape="circle"
        @click="handleWithdrawSuccessConfirm"
      ></u-button>
    </template>
  </u-modal>
</template>

<script setup>
import { ref, onMounted } from 'vue' 
import {
	onShow,
	onLoad
} from '@dcloudio/uni-app';
import { getCompanionBalanceDetail } from '@/api/order.js'
import { getPendingWithdrawList } from '@/api/user.js'

// 响应式数据
const balanceInfo = ref({
  balance: 0,
  available_balance: 0,
  frozen_balance: 0
})

// 待确认提现弹框状态
const showPendingWithdraw = ref(false)
const pendingWithdrawList = ref([])

// 提现成功弹框状态
const showWithdrawSuccess = ref(false)

// 获取余额详情
const fetchBalanceDetail = async () => {
  try {
    const result = await getCompanionBalanceDetail({})
    if (result.data && result.data.code === 0) {
      balanceInfo.value = result.data.data || {
        balance: 0,
        available_balance: 0,
        frozen_balance: 0
      }
      console.log('余额信息:', balanceInfo.value)
    }
  } catch (error) {
    console.error('获取余额详情失败:', error)
  }
}

// 格式化余额显示（分转元，保持精度）
const formatBalance = (balanceInCents) => {
  if (!balanceInCents && balanceInCents !== 0) return '0.00'
  // 使用字符串操作避免浮点数精度问题
  const yuan = Math.floor(balanceInCents / 100)
  const fen = balanceInCents % 100
  
  if (fen === 0) {
    return yuan + '.00'
  } else if (fen < 10) {
    return yuan + '.0' + fen
  } else {
    return yuan + '.' + fen
  }
}

// 格式化金额（分转元）
const formatAmount = (amountInCents) => {
  if (!amountInCents && amountInCents !== 0) return '0.00'
  return (amountInCents / 100).toFixed(2)
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hour = date.getHours().toString().padStart(2, '0')
  const minute = date.getMinutes().toString().padStart(2, '0')
  return `${month}-${day} ${hour}:${minute}`
}

// 跳转到提现页面
const goToWithdraw = () => {
  // 检查是否有待确认的提现记录
  if (pendingWithdrawList.value.length > 0) {
    // 如果有待确认记录，显示弹框
      showPendingWithdraw.value = true
  } else {
    // 没有待确认记录，直接跳转到提现页面
    uni.navigateTo({
      url: '/subPackages/balance/Withdraw'
    })
  } 
  
}

// 跳转到余额明细页面
const goToBalanceDetails = () => {
  uni.navigateTo({
    url: '/subPackages/balance/detail'
  })
}

// 关闭待确认提现弹框
const closePendingWithdraw = () => {
  showPendingWithdraw.value = false
  

}

// 确认收款
const confirmReceipt = (item) => {
  console.log('确认收款:', item)
  callWechatTransferConfirm(item)
}

// 调用微信商户转账确认
const callWechatTransferConfirm = (item) => {
  // #ifdef MP-WEIXIN
  if (wx.canIUse('requestMerchantTransfer')) {
    wx.requestMerchantTransfer({
      mchId: '1724024386',
      appId: wx.getAccountInfoSync().miniProgram.appId,
      package: item.package_info, // 使用转账单号
      success: (res) => {
        // res.err_msg将在页面展示成功后返回应用时返回ok，并不代表付款成功
        console.log('微信转账确认成功:', res);
        
        // 从列表中移除已确认的项目
        const index = pendingWithdrawList.value.findIndex(i => i.id === item.id)
        if (index > -1) {
            pendingWithdrawList.value.splice(index, 1)
        }
        
        // 显示提现成功弹框
        showWithdrawSuccess.value = true
        
        // 如果没有更多待确认项目，关闭待确认弹框
        if (pendingWithdrawList.value.length === 0) {
          closePendingWithdraw()
        }
      },
      fail: (res) => {
        console.log('微信转账确认失败:', res);
        // uni.showToast({
        //   title: '确认收款失败',
        //   icon: 'none'
        // })
      },
    });
  } else {
    wx.showModal({
      content: '你的微信版本过低，请更新至最新版本。',
      showCancel: false,
    });
  }
  // #endif
  
  // #ifndef MP-WEIXIN
  console.log('非微信小程序环境，跳过微信转账确认调用')
  // 模拟成功处理（用于非微信环境测试）
  
  // 从列表中移除已确认的项目
  const index = pendingWithdrawList.value.findIndex(i => i.id === item.id)
  if (index > -1) {
    pendingWithdrawList.value.splice(index, 1)
  }
  
  // 显示提现成功弹框
  showWithdrawSuccess.value = true
  
  // 如果没有更多待确认项目，关闭弹框
  if (pendingWithdrawList.value.length === 0) {
    closePendingWithdraw()
  }
  // #endif
}

// 提现成功弹框确认
const handleWithdrawSuccessConfirm = () => {
  showWithdrawSuccess.value = false
}

// 获取待确认提现列表
const fetchPendingWithdrawList = async () => {
  try {
    const result = await getPendingWithdrawList()
    if (result.data && result.data.code === 0) {
      console.log('待确认提现列表:', result.data.data)
      pendingWithdrawList.value = result.data.data.list || []
      
      // 如果有待确认的提现，显示弹框
      if (pendingWithdrawList.value.length > 0) {
        showPendingWithdraw.value = true
      }
    }
  } catch (error) {
    console.error('获取待确认提现列表失败:', error)
  }
}

// 组件挂载时获取余额信息
onMounted(() => {

  
}) 

onShow(() => {

  setTimeout(() => {
    fetchPendingWithdrawList() 
  }, 1000)
  fetchBalanceDetail()
})


</script>

<style lang="scss" scoped>
.balance-container {
  display: flex;
  flex-direction: column;

  align-items: center;
  background: #ffffff;
  height: 100vh; 
}

.balance-icon {
  margin-top: 100rpx;
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 40rpx;
}

.balance-text {
  font-size: 32rpx;
  color: #1a1a1a;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.currency-symbol {
  font-size: 36rpx;
  font-weight: 600;
  color: #1a1a1a;
  margin-right: 8rpx;
}

.amount-number {
  font-size: 60rpx;
  font-weight: 700;
  color: #1a1a1a;
}

.withdraw-button {
  display: flex;
  justify-content: center;
  margin-top: 100rpx;
  background-color: #F8F8F8;
  color: #1a1a1a;
  padding: 20rpx 0rpx;
  border-radius: 8rpx;
  font-size: 32rpx;
  font-weight: 500;
  width: 260rpx;
  box-sizing: border-box;
  cursor: pointer;
  transition: all 0.2s ease;
}

.withdraw-button:active {
  transform: scale(0.96);
  background-color: #06a050;
}

/* 待确认提现弹框样式 */
.pending-withdraw-popup {
  background: #ffffff;
  border-radius: 20rpx 20rpx 0 0;
  padding: 20rpx;
  max-height: 70vh;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1a1a1a;
}

.popup-close {
  font-size: 48rpx;
  color: #000000;
  cursor: pointer;
  padding: 10rpx;
}

.withdraw-list {
  max-height: 50vh;
  overflow-y: auto;
}

.withdraw-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f8f8f8;
}

.withdraw-item:last-child {
  border-bottom: none;
}

.withdraw-info {
  flex: 1;
}

.withdraw-time {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.withdraw-amount {
  font-size: 32rpx;
  font-weight: 600;
  color: #f43f5e;
}

.withdraw-actions {
  margin-left: 20rpx;
}

.confirm-btn {
  background: #07c160;
  color: #ffffff;
  padding: 10rpx 28rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn:active {
  transform: scale(0.96);
  background: #06a050;
}

/* 余额明细按钮样式 */
.balance-details-btn {
  position: absolute;
  top: 0rpx; /* Adjust as needed */
  right: 20rpx; /* Adjust as needed */
  display: flex;
  align-items: center;

  cursor: pointer;
  transition: all 0.2s ease;
}

.balance-details-btn:active {
  transform: scale(0.96);
  background-color: #06a050;
}

.details-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 10rpx;
}

.details-text {
  font-size: 28rpx;
  color: #1a1a1a;
  font-weight: 500;
}
</style>