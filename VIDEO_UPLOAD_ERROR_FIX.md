# 视频上传错误处理修复说明

## 问题描述

在友伴师视频上传功能中，当后端返回业务错误时（如"当前申请状态不允许上传视频"、"当前状态已允许接单了，请刷新页面"），前端没有正确显示错误信息。

## 问题原因

### 1. 后端错误处理机制
后端正确抛出了业务错误：
```go
// 在 companion_service.go 中
if application.Status != user_model.ApplicationStatusPending && application.Status != user_model.ApplicationStatusApproved {
    return errorx.New(6012, "当前申请状态不允许上传视频")
}
if application.CanAcceptOrders == user_model.CanAcceptOrdersYes {
    return errorx.New(6013, "当前状态已允许接单了，请刷新页面")
}
```

### 2. API层错误处理
API层正确捕获并返回错误：
```go
// 在 companion_api.go 中
err := api.UserService.UploadCompanionVideo(c.Request.Context(), uid, &req)
if err != nil {
    r.Error = err
    r.Response()
    return
}
```

### 3. 前端错误处理问题
问题出现在前端的HTTP拦截器中，它只检查HTTP状态码，不检查业务错误码：

**修复前的问题代码**：
```javascript
// config/http.js
if (res.statusCode >= 200 && res.statusCode < 300) {
  // 直接resolve，不检查业务错误码
  resolve(res)
}
```

## 解决方案

### 1. 修改HTTP拦截器
在 `config/http.js` 中添加业务错误码检查：

```javascript
if (res.statusCode >= 200 && res.statusCode < 300) {
  // 检查业务错误码
  if (res.data && res.data.code !== undefined && res.data.code !== 0) {
    // 业务错误，显示错误信息并reject
    uni.showToast({
      icon: 'none',
      title: res.data.msg || '请求失败',
    })
    reject(res)
    return
  }
  resolve(res)
}
```

### 2. 简化前端错误处理
由于业务错误已经在HTTP拦截器中处理，前端组件中的错误处理逻辑可以简化：

**修复前**：
```javascript
const response = await uploadCompanionVideo({
  intro_video_url: videoUrl.value
})

if (response.data && response.data.code === 0) {
  // 成功处理
} else {
  // 错误处理
  uni.showToast({
    title: response.data?.msg || '提交失败',
    icon: 'none'
  })
}
```

**修复后**：
```javascript
try {
  const response = await uploadCompanionVideo({
    intro_video_url: videoUrl.value
  })
  
  // 如果执行到这里，说明请求成功且没有业务错误
  uni.showToast({
    title: '视频提交成功，等待审核',
    icon: 'success'
  })
  
} catch (error) {
  // 网络错误或其他未处理的错误
  if (!error.data) {
    uni.showToast({
      title: '提交失败，请重试',
      icon: 'none'
    })
  }
}
```

## 修复效果

### 修复前
- 后端返回业务错误时，前端不显示错误信息
- 用户无法知道操作失败的原因
- 错误处理逻辑分散在各个组件中

### 修复后
- 后端返回业务错误时，前端自动显示错误信息
- 用户能够清楚了解操作失败的原因
- 错误处理逻辑统一在HTTP拦截器中
- 前端组件代码更简洁

## 测试场景

1. **申请状态不允许上传视频**：
   - 后端返回：`{"code": 6012, "msg": "当前申请状态不允许上传视频"}`
   - 前端显示：Toast提示"当前申请状态不允许上传视频"

2. **已允许接单状态**：
   - 后端返回：`{"code": 6013, "msg": "当前状态已允许接单了，请刷新页面"}`
   - 前端显示：Toast提示"当前状态已允许接单了，请刷新页面"

3. **网络错误**：
   - 网络连接失败时，显示"网络错误，换个网络试试"

4. **成功上传**：
   - 后端返回：`{"code": 0, "msg": "success", "data": "视频上传成功，等待审核"}`
   - 前端显示：Toast提示"视频提交成功，等待审核"

## 注意事项

1. 此修复会影响所有使用 `http` 和 `httpWx` 函数的API调用
2. 确保后端返回的错误格式统一：`{"code": 错误码, "msg": "错误信息"}`
3. 成功响应的格式：`{"code": 0, "msg": "success", "data": 数据}` 