<template>
  <view class="withdraw-container">
    <!-- 提现记录按钮 -->
    <view class="withdraw-record-btn" @click="goToWithdrawRecord">
      <image src="@/static/icons/profile/mxi.png" class="record-icon" mode="aspectFit" />
      <text class="record-text">提现记录</text>
    </view>
    
    <!-- 提现金额标题 -->
    <view class="title">提现金额</view>
    
    <!-- 金额显示 -->
    <view class="amount-section">
      <view class="amount">
        <text class="currency-symbol">¥</text>
        <view>
            <input 
          type="number" 
          v-model="withdrawAmount" 
          placeholder="" 
          class="amount-input"
          :focus="inputFocus"
          @focus="onInputFocus"
          @blur="onInputBlur"
          confirm-type="done"
          cursor-spacing="20"
        />
        </view>
      </view>
     
    </view>
    <view class="divider"></view>
    <!-- 余额信息 -->
    <view class="balance-info">
      当前余额{{ formatBalance(balanceInfo.available_balance) }}元,<text class="withdraw-all" @click="withdrawAll">全部提现</text>
    </view>
    
    <!-- 确认按钮 -->
    <view class="flex-between"> 
       <view></view>
      <view class="confirm-button" @click="handleConfirm">
      确定
    </view>
    </view>

    <!-- 提现成功弹框 -->
    <u-modal
      title="提现已提交成功"
      :show="showWithdraw"
      content="您的提现请求已成功提交。提现状态会在后台处理后更新，请稍后查看账户余额或联系客服确认。"
      closeOnClickOverlay
      showCancelButton
      @close="() => showWithdraw = false"
    >
      <template #confirmButton>
        <u-button
          text="确定"
          type="success"
          shape="circle"
          @click="handleWithdrawConfirm"
        ></u-button>
      </template>
    </u-modal>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { companionWithdraw } from '@/api/user.js'
import { getCompanionBalanceDetail } from '@/api/order.js'

// 响应式数据
const withdrawAmount = ref('')
const inputFocus = ref(false)
const balanceInfo = ref({
  balance: 0,
  available_balance: 0,
  frozen_balance: 0
})

// 提现成功弹框状态
const showWithdraw = ref(false)

// 输入框获得焦点
const onInputFocus = () => {
  inputFocus.value = true
}

// 输入框失去焦点
const onInputBlur = () => {
  inputFocus.value = false
}

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
    }
  } catch (error) {
    console.error('获取余额详情失败:', error)
  }
}

// 确认提现
  const handleConfirm = async () => {
 
    const amount = parseFloat(withdrawAmount.value)
    
    if (!amount || amount <= 0) {
      uni.showToast({
        title: '请输入有效的提现金额',
        icon: 'none'
      })
      return
    }
  
  // 将可用余额从分转换为元进行比较
  const availableBalanceYuan = balanceInfo.value.available_balance / 100
  
  if (amount > availableBalanceYuan) {
    uni.showToast({
      title: `提现金额不能超过可用余额${formatBalance(balanceInfo.value.available_balance)}元`,
      icon: 'none'
    })
    return
  }
  
  try {
    uni.showLoading({
      title: '提现中...'
    })
    
    // 转换为分
    const withdrawAmountInCents = Math.round(amount * 100)
    
    const result = await companionWithdraw({
      withdraw_amount: withdrawAmountInCents
    })
    
    uni.hideLoading()
    
    if (result.data && result.data.code === 0) {
      uni.showToast({
        title: '提现申请成功',
        icon: 'success'
      })
      
      // 清空输入框
      withdrawAmount.value = ''
      
      // 刷新余额信息
      await fetchBalanceDetail()
      callWechatTransfer(result.data)
   
   
    } else {
      uni.showToast({
        title: result.message || '提现失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('提现失败:', error)
    // uni.showToast({
    //   title: '提现失败，请重试',
    //   icon: 'none'
    // })
  }
}


// 调用微信商户转账
const callWechatTransfer = (result) => {

  // #ifdef MP-WEIXIN
  if (wx.canIUse('requestMerchantTransfer')) {
    wx.requestMerchantTransfer({
      mchId: '1724024386',
      appId: wx.getAccountInfoSync().miniProgram.appId,
      package: result.data.wx_package_info,
      success: (res) => {
        // res.err_msg将在页面展示成功后返回应用时返回ok，并不代表付款成功
        console.log('微信转账成功:', res); 
        showWithdraw.value = true
        // 微信转账成功后，提现成功弹框已经显示，无需额外处理
      },
      fail: (res) => {
        console.log('微信转账失败:', res);
        // uni.showToast({
        //   title: '转账发起失败',
        //   icon: 'none'
        // })
        uni.navigateBack({
              delta: 1
         })
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
  console.log('非微信小程序环境，跳过微信转账调用')
  // #endif
}


// 格式化余额显示（分转元，保持精度）
const formatBalance = (balanceInCents) => {
  if (!balanceInCents && balanceInCents !== 0) return '0.00'
  // 使用字符串操作避免浮点数精度问题
  const balanceStr = balanceInCents.toString()
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

// 全部提现
const withdrawAll = () => {
  const availableBalanceYuan = balanceInfo.value.available_balance / 100
  withdrawAmount.value = availableBalanceYuan.toFixed(2)
}

// 提现成功弹框确认
const handleWithdrawConfirm = () => {
  showWithdraw.value = false
  uni.navigateBack({
    delta: 1
  })
}

// 跳转到提现记录页面
const goToWithdrawRecord = () => {
  uni.navigateTo({
    url: '/subPackages/balance/record'
  })
}

// 组件挂载时获取余额信息
onMounted(() => {
  fetchBalanceDetail()
  // 延迟一下确保页面渲染完成后再聚焦输入框
  setTimeout(() => {
    inputFocus.value = true
  }, 300)
})
</script>

<style lang="scss" scoped>
.withdraw-container {
  height: 100vh;
  background-color: #ffffff;
  padding: 40rpx;
  display: flex;
  flex-direction: column; 
  box-sizing: border-box;
}

.withdraw-record-btn {
  position: absolute;
  top: 0rpx;
  right: 20rpx;
  display: flex;
  align-items: center;

  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.withdraw-record-btn:active {
  transform: scale(0.96);
  background-color: #06a050;
}

.record-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 10rpx;
}

.record-text {
  font-size: 28rpx;
  color: #1a1a1a;
  font-weight: 500;
}

.title { 
  margin-top: 40rpx;
  font-size: 36rpx;
  color: #000000;
  text-align: left;
  margin-bottom: 60rpx;
  font-weight: 500;
}

.amount-section {
  display: flex;
  flex-direction: column;

}

.amount {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.currency-symbol {
  font-size: 50rpx;
  font-weight:700;
  color: #1a1a1a;
  margin-right: 20rpx;
}

.amount-input {
  font-size: 60rpx;
  font-weight:700;
  color: #1a1a1a;
  text-align: left;
  min-width: 200rpx;
  height: 90rpx;
  border: none;
  outline: none;
  background: transparent;
  caret-color: #07c160;
  /* 确保输入框稳定，不会抖动 */
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  /* 禁用默认的输入框动画 */
  -webkit-appearance: none;
  appearance: none;
}

.divider {
  width: 100%;
  margin-top: 10rpx;
  margin-bottom: 40rpx;
  height: 2rpx;
  background-color: #e0e0e0;
}

.balance-info {
  font-size: 28rpx;
  color: #000000;
  text-align: left;
  margin-bottom: 80rpx;
}

.withdraw-all {
  color: #007aff;
  font-weight: 500;
  cursor: pointer;
}

.confirm-button { 
  display: flex;
  justify-content: center;
 
   margin-top: 60rpx;
  background-color: #07c160;
  color: #ffffff;
  padding: 24rpx 0rpx;
  border-radius:8rpx;
  font-size: 32rpx;
  font-weight: 500;
  width: 160rpx;
  box-sizing: border-box;
}
</style>