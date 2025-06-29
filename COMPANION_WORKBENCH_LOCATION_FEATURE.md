# 友伴师工作台位置功能改进说明

## 功能概述

本次更新改进了友伴师工作台的位置获取功能，使用 `uni.getLocation` 接口获取位置信息，提供更好的跨平台兼容性。

## 主要改进

### 1. 位置获取方式优化

#### 统一位置接口
- 使用 `uni.getLocation` 获取位置信息，支持多平台
- 简化位置获取逻辑，提高代码可维护性
- 支持微信小程序、App、H5等多个平台

#### 位置信息显示
- 显示经纬度坐标信息
- 预留逆地理编码接口，可后续集成地图服务
- 处理位置获取失败的情况

### 2. 位置缓存管理

#### 缓存机制
```javascript
const locationCache = ref({
  latitude: null,    // 纬度
  longitude: null,   // 经度
  address: ''        // 详细地址（预留）
})
```

#### 缓存更新
- 每次获取位置时自动更新缓存
- 手动选择位置时更新缓存
- 上线时使用缓存的位置信息

### 3. 后端API集成

#### 新增API方法
```javascript
// 更新友伴师上线/下线状态
export const updateCompanionOnlineStatus = (data) => {
  return http({
    url: '/companion/online-status',
    method: 'POST',
    data
  })
}

// 获取友伴师在线状态信息
export const getCompanionOnlineStatus = () => {
  return http({
    url: '/companion/online-status',
    method: 'GET'
  })
}
```

#### API调用时机
- 组件初始化时获取当前状态
- 上线/下线时更新状态
- 位置变化时自动更新服务器

### 4. 用户体验优化

#### 状态管理
- 实时显示在线/下线状态
- 显示位置更新时间
- 提供位置刷新和手动选择功能

#### 错误处理
- 位置获取失败时的友好提示
- 网络错误的重试机制
- 降级处理策略

## 技术实现

### 1. 位置获取流程

```javascript
// 使用uni-app统一接口获取位置
uni.getLocation({
  type: 'gcj02',
  success: (res) => {
    // 更新位置缓存
    locationCache.value.latitude = res.latitude
    locationCache.value.longitude = res.longitude
    
    // 显示位置信息
    currentLocation.value = `经度: ${res.longitude.toFixed(6)}, 纬度: ${res.latitude.toFixed(6)}`
    locationUpdateTime.value = new Date().toLocaleTimeString()
  },
  fail: (err) => {
    // 处理位置获取失败
    uni.showToast({
      title: '获取位置失败',
      icon: 'error'
    })
  }
})
```

### 2. 跨平台兼容性

```javascript
// 支持多个平台的位置获取
// - 微信小程序
// - App (iOS/Android)
// - H5
// - 其他小程序平台
```

### 3. 状态同步

```javascript
// 初始化时获取状态
const initComponentState = async () => {
  const statusRes = await getCompanionOnlineStatus()
  if (statusRes.code === 0 && statusRes.data) {
    isOnline.value = statusRes.data.is_online === 1
    currentLocation.value = statusRes.data.location_text
    // 更新缓存
  }
}
```

## 使用说明

### 1. 位置获取
- 点击"刷新位置"按钮自动获取当前位置
- 使用 `uni.getLocation` 统一接口
- 显示经纬度坐标信息

### 2. 手动选择位置
- 点击"手动选择"按钮打开地图选点
- 支持选择具体位置和地址
- 自动更新位置缓存和服务器

### 3. 上线/下线
- 点击上线/下线按钮切换状态
- 上线时自动获取并更新位置信息
- 状态变化实时同步到服务器

## 注意事项

### 1. 权限要求
- 需要用户授权位置权限
- 各平台需要配置相应的位置权限
- 建议在用户首次使用时引导授权

### 2. 网络依赖
- 位置获取需要设备GPS或网络定位
- 建议添加网络状态检查
- 提供离线模式支持

### 3. 性能优化
- 位置缓存减少重复请求
- 合理的请求频率控制
- 错误重试机制

## 后续优化建议

### 1. 功能增强
- 集成地图服务API进行逆地理编码
- 添加位置历史记录
- 支持常用位置快速选择

### 2. 性能优化
- 位置信息本地存储
- 后台位置更新
- 智能位置缓存

### 3. 用户体验
- 位置获取进度提示
- 更丰富的位置信息显示
- 位置相关推荐功能

### 4. 地图服务集成
- 集成高德地图、腾讯地图等第三方服务
- 提供详细的地址信息
- 支持地址搜索和选择 