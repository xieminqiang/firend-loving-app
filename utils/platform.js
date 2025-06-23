/**
 * 平台判断工具
 */

// 获取当前平台信息
export const getPlatform = () => {
  return uni.getSystemInfoSync().platform
}

// 判断是否为微信小程序
export const isWeChat = () => {
  // #ifdef MP-WEIXIN
  return true
  // #endif
  // #ifndef MP-WEIXIN
  return false
  // #endif
}

// 判断是否为支付宝小程序
export const isAlipay = () => {
  // #ifdef MP-ALIPAY
  return true
  // #endif
  // #ifndef MP-ALIPAY
  return false
  // #endif
}

// 判断是否为H5
export const isH5 = () => {
  // #ifdef H5
  return true
  // #endif
  // #ifndef H5
  return false
  // #endif
}

// 判断是否为App
export const isApp = () => {
  // #ifdef APP-PLUS
  return true
  // #endif
  // #ifndef APP-PLUS
  return false
  // #endif
}

// 判断是否为iOS
export const isIOS = () => {
  const platform = getPlatform()
  return platform === 'ios'
}

// 判断是否为Android
export const isAndroid = () => {
  const platform = getPlatform()
  return platform === 'android'
}

// 获取系统信息
export const getSystemInfo = () => {
  return uni.getSystemInfoSync()
}

// 获取设备信息
export const getDeviceInfo = () => {
  const systemInfo = getSystemInfo()
  return {
    platform: systemInfo.platform,
    system: systemInfo.system,
    version: systemInfo.version,
    model: systemInfo.model,
    brand: systemInfo.brand,
    screenWidth: systemInfo.screenWidth,
    screenHeight: systemInfo.screenHeight,
    windowWidth: systemInfo.windowWidth,
    windowHeight: systemInfo.windowHeight,
    statusBarHeight: systemInfo.statusBarHeight,
    safeArea: systemInfo.safeArea,
    safeAreaInsets: systemInfo.safeAreaInsets
  }
} 