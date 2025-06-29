# 位置服务使用说明

## 概述
本项目直接使用腾讯地图API进行位置服务和逆地理编码，提供简单易用的位置获取功能。

## 功能特性
- 获取当前位置（经纬度）
- 根据经纬度获取详细地址
- 自动错误处理和降级方案

## 使用方法

### 1. 获取当前位置和地址
```javascript
import { getCurrentLocationAddress } from '@/utils/location.js'

// 获取当前位置的详细地址
getCurrentLocationAddress()
  .then(locationInfo => {
    console.log('位置信息:', locationInfo)
    // 返回格式: { latitude, longitude, address }
  })
  .catch(err => {
    console.error('获取位置失败:', err)
  })
```

### 2. 根据经纬度获取地址
```javascript
import { getAddressFromLocation } from '@/utils/location.js'

// 根据经纬度获取详细地址
getAddressFromLocation(39.908823, 116.397470)
  .then(address => {
    console.log('详细地址:', address)
  })
  .catch(err => {
    console.error('获取地址失败:', err)
  })
```

## 技术实现

### 腾讯地图API调用
直接使用 `uni.request` 调用腾讯地图逆地理编码API：
```javascript
uni.request({
  url: 'https://apis.map.qq.com/ws/geocoder/v1/',
  method: 'GET',
  data: {
    key: 'YOUR_API_KEY',
    location: `${latitude},${longitude}`,
    output: 'json'
  }
})
```

## 配置说明

### 腾讯地图API密钥
在 `utils/location.js` 中直接配置腾讯地图API密钥：
```javascript
data: {
  key: 'YOUR_TENCENT_MAP_KEY', // 替换为你的腾讯地图API密钥
  location: `${latitude},${longitude}`,
  output: 'json'
}
```

## 错误处理
- 如果获取详细地址失败，会自动返回经纬度信息作为备选
- 网络请求失败时会提供详细的错误信息
- 所有错误都会在控制台输出，便于调试

## 注意事项
1. 确保已配置有效的腾讯地图API密钥
2. 在微信小程序中使用时，需要在 `manifest.json` 中配置位置权限
3. 首次使用时会请求用户授权位置权限
4. 建议在获取位置前先检查用户是否已授权

## 权限配置
在 `manifest.json` 中添加位置权限：
```json
{
  "mp-weixin": {
    "permission": {
      "scope.userLocation": {
        "desc": "用于获取您的位置信息，提供更精准的服务"
      }
    }
  }
}
``` 