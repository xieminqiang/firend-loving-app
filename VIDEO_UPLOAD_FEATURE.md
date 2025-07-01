# 友伴师视频上传功能实现说明

## 功能概述

在友伴师工作台中，当用户点击上线按钮时，如果`can_accept_orders`为"N"（不允许接单），系统会弹出视频上传弹框，要求用户上传自我介绍视频进行审核。

## 功能特点

### 1. 智能触发
- 只有当`can_accept_orders`为"N"时才显示视频上传弹框
- 如果已有视频且审核通过，直接允许上线
- 如果视频审核中或未通过，需要重新上传

### 2. 视频要求
- **时长限制**: 3-60秒
- **文件大小**: 不超过500MB
- **格式要求**: MP4格式
- **内容要求**: 自我介绍视频，展示专业能力和个人魅力

### 3. 审核状态显示
- **待审核**: 橙色标签，显示"您的视频正在审核中，请耐心等待"
- **已通过**: 绿色标签，显示"视频审核已通过，可以正常上线接单"
- **已拒绝**: 红色标签，显示"视频审核未通过，请重新上传"

## 技术实现

### 1. 前端组件结构

#### Workbench.vue 组件
- 主要工作台组件，包含上线/下线功能
- 集成视频上传弹框
- 处理视频选择和上传逻辑

#### 视频上传弹框
- 模态弹框设计，支持点击遮罩关闭
- 视频预览功能，支持播放控制
- 上传进度显示
- 状态管理和错误处理

### 2. API接口

#### 文件上传接口
```javascript
// api/file.js
export const uploadFile = (fileData) => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: http.baseURL + '/file/upload',
      filePath: fileData.filePath,
      name: 'file',
      header: {
        'Authorization': uni.getStorageSync('token') || ''
      },
      success: (res) => {
        // 处理上传结果
      }
    })
  })
}
```

#### 视频提交接口
```javascript
// api/user.js
export const uploadCompanionVideo = (data) => {
  return http({
    url: '/front/companion/video/upload',
    method: 'POST',
    data
  })
}
```

### 3. 后端接口

#### 视频上传接口
- **地址**: `POST /api/v1/companion/video/upload`
- **参数**: `{ "intro_video_url": "视频URL" }`
- **功能**: 更新用户的自我介绍视频URL和审核状态

## 使用流程

### 1. 触发条件
用户点击上线按钮时，系统检查：
```javascript
if (newStatus && hasValidApplicationInfo.value && props.applicationInfo.can_accept_orders === 'N') {
  // 检查是否已有视频且已通过审核
  if (!props.applicationInfo.intro_video_url || props.applicationInfo.video_review_status !== 'approved') {
    // 显示视频上传弹框
    showVideoUploadModal.value = true
    return
  }
}
```

### 2. 视频选择
用户点击上传区域，调用`uni.chooseVideo`选择视频：
```javascript
uni.chooseVideo({
  sourceType: ['album', 'camera'],
  maxDuration: 60,
  camera: 'back',
  success: async (res) => {
    // 验证视频时长和大小
    // 上传视频文件
  }
})
```

### 3. 文件上传
选择视频后，先上传到文件服务器：
```javascript
const uploadResult = await uploadFile({
  filePath: filePath,
  name: `intro_video_${Date.now()}.${fileInfo.extension}`
})
```

### 4. 提交审核
获得视频URL后，调用视频提交接口：
```javascript
const response = await uploadCompanionVideo({
  intro_video_url: videoUrl.value
})
```

### 5. 状态更新
提交成功后，发送事件通知父组件刷新数据：
```javascript
uni.$emit('applicationStatusChanged', {
  type: 'video_uploaded',
  message: '视频已提交审核'
})
```

## 样式设计

### 1. 弹框设计
- **背景**: 半透明黑色遮罩，支持模糊效果
- **容器**: 圆角设计，渐变背景，毛玻璃效果
- **动画**: 淡入和滑入动画，提升用户体验

### 2. 状态标签
- **待审核**: 橙色渐变背景
- **已通过**: 绿色渐变背景
- **已拒绝**: 红色渐变背景

### 3. 视频预览
- **尺寸**: 300rpx高度，自适应宽度
- **控制**: 支持播放、暂停、全屏等控制
- **操作**: 重新选择、删除视频按钮

### 4. 上传进度
- **进度条**: 渐变色彩，带动画效果
- **文字**: 显示上传百分比
- **动画**: 闪烁效果，提升视觉反馈

## 错误处理

### 1. 文件验证
- 视频时长检查（3-60秒）
- 文件大小检查（500MB限制）
- 格式验证（MP4）

### 2. 网络错误
- 上传失败重试机制
- 网络错误提示
- 加载状态管理

### 3. 用户操作
- 取消上传处理
- 删除视频确认
- 重复提交防护

## 事件通信

### 1. 组件间通信
使用uni-app的事件系统进行组件间通信：
```javascript
// 发送事件
uni.$emit('applicationStatusChanged', eventData)

// 监听事件
uni.$on('applicationStatusChanged', handleEvent)

// 移除监听
uni.$off('applicationStatusChanged', handleEvent)
```

### 2. 事件类型
- `video_uploaded`: 视频上传成功
- `status_changed`: 状态变化
- `error_occurred`: 错误发生

## 性能优化

### 1. 文件处理
- 压缩视频文件
- 异步上传处理
- 进度反馈机制

### 2. 内存管理
- 及时清理临时文件
- 组件卸载时清理事件监听
- 避免内存泄漏

### 3. 用户体验
- 防重复点击
- 加载状态提示
- 错误信息友好化

## 测试建议

### 1. 功能测试
- 视频选择功能
- 文件上传流程
- 状态更新验证
- 错误处理测试

### 2. 兼容性测试
- 不同设备测试
- 不同网络环境
- 不同视频格式

### 3. 性能测试
- 大文件上传测试
- 并发上传测试
- 内存使用监控

## 注意事项

1. **权限要求**: 需要相机和相册访问权限
2. **网络要求**: 上传大文件需要稳定的网络连接
3. **存储限制**: 注意设备存储空间
4. **审核时间**: 视频审核需要一定时间，请用户耐心等待

## 未来优化

1. **视频压缩**: 自动压缩大文件
2. **断点续传**: 支持网络中断后继续上传
3. **预览优化**: 支持视频编辑功能
4. **批量上传**: 支持多个视频上传 