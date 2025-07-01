# 视频状态显示功能实现说明

## 功能概述

在友伴师工作台的视频上传弹框中，当用户已有上传的视频时，系统会显示视频的审核状态，包括状态标签和相应的描述信息。

## 功能特点

### 1. 智能状态显示
- **有视频时**: 显示视频预览、审核状态标签和描述
- **无视频时**: 显示上传区域和上传要求

### 2. 审核状态分类
- **待审核 (pending)**: 橙色标签，显示"您的视频正在审核中，请耐心等待"
- **已通过 (approved)**: 绿色标签，显示"视频审核已通过，可以正常上线接单"
- **已拒绝 (rejected)**: 红色标签，显示"视频审核未通过，请重新上传"

### 3. 视频操作功能
- **重新上传**: 点击"重新上传"按钮可以替换当前视频
- **删除视频**: 点击"删除视频"按钮可以删除当前视频
- **视频预览**: 支持播放控制、全屏、进度条等完整功能

## 技术实现

### 1. 条件渲染逻辑
```vue
<!-- 视频状态显示 -->
<view class="video-status-section" v-if="applicationInfo && applicationInfo.intro_video_url">
  <view class="status-badge" :class="getStatusBadgeClass(applicationInfo.video_review_status)">
    <text class="status-text">{{ getVideoStatusText(applicationInfo.video_review_status) }}</text>
  </view>
  <text class="status-desc">{{ getVideoStatusDesc(applicationInfo.video_review_status) }}</text>
</view>

<!-- 视频预览区域 -->
<view class="video-preview-section">
  <!-- 已有视频时显示预览 -->
  <view v-if="applicationInfo && applicationInfo.intro_video_url" class="video-preview">
    <!-- 视频播放器 -->
  </view>
  
  <!-- 无视频时显示上传区域 -->
  <view v-else class="video-upload-area">
    <!-- 上传提示 -->
  </view>
</view>
```

### 2. 状态处理方法
```javascript
// 获取视频状态文本
const getVideoStatusText = (status) => {
  switch (status) {
    case 'pending': return '待审核'
    case 'approved': return '已通过'
    case 'rejected': return '已拒绝'
    default: return '未知状态'
  }
}

// 获取视频状态描述
const getVideoStatusDesc = (status) => {
  switch (status) {
    case 'pending': return '您的视频正在审核中，请耐心等待'
    case 'approved': return '视频审核已通过，可以正常上线接单'
    case 'rejected': return '视频审核未通过，请重新上传'
    default: return '请上传自我介绍视频'
  }
}

// 获取状态标签样式类
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'pending': return 'status-pending'
    case 'approved': return 'status-approved'
    case 'rejected': return 'status-rejected'
    default: return ''
  }
}
```

### 3. 视频操作功能
```javascript
// 删除视频
const deleteVideo = () => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除当前视频吗？删除后需要重新上传。',
    success: async (res) => {
      if (res.confirm) {
        // 调用删除接口
        const response = await uploadCompanionVideo({
          intro_video_url: ''
        })
        
        if (response.data && response.data.code === 0) {
          // 发送事件通知父组件刷新数据
          uni.$emit('applicationStatusChanged', {
            type: 'video_deleted',
            message: '视频删除成功'
          })
        }
      }
    }
  })
}

// 重新上传视频
const selectVideo = () => {
  // 重置当前选择的视频URL
  videoUrl.value = ''
  
  uni.chooseVideo({
    // 视频选择配置
    success: async (res) => {
      // 验证视频时长和大小
      // 上传视频文件
      // 提交审核
      // 通知父组件刷新
    }
  })
}
```

## 样式设计

### 1. 状态标签样式
```scss
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  margin-bottom: 12rpx;
  font-size: 24rpx;
  font-weight: 600;
  
  &.status-pending {
    background: linear-gradient(135deg, rgba(255, 149, 0, 0.1) 0%, rgba(255, 149, 0, 0.2) 100%);
    color: #FF9500;
    border: 1rpx solid rgba(255, 149, 0, 0.3);
  }
  
  &.status-approved {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.2) 100%);
    color: #4CAF50;
    border: 1rpx solid rgba(76, 175, 80, 0.3);
  }
  
  &.status-rejected {
    background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.2) 100%);
    color: #F44336;
    border: 1rpx solid rgba(244, 67, 54, 0.3);
  }
}
```

### 2. 视频预览样式
```scss
.video-preview {
  position: relative;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 20rpx;
}

.preview-video {
  width: 100%;
  height: 300rpx;
  object-fit: cover;
  background: #000000;
}

.video-actions {
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  display: flex;
  gap: 12rpx;
}
```

## 用户体验优化

### 1. 状态反馈
- 不同状态使用不同颜色的标签，直观显示审核进度
- 提供详细的状态描述，帮助用户了解当前情况

### 2. 操作便利性
- 支持重新上传，无需删除后重新选择
- 删除操作有确认提示，防止误操作
- 视频预览支持完整的播放控制

### 3. 视觉设计
- 使用渐变背景和毛玻璃效果
- 状态标签采用圆角设计，视觉效果友好
- 视频预览区域有阴影效果，层次分明

## 数据流程

1. **显示弹框**: 检查 `applicationInfo.intro_video_url` 是否存在
2. **状态显示**: 根据 `applicationInfo.video_review_status` 显示对应状态
3. **视频操作**: 重新上传或删除时调用相应接口
4. **数据刷新**: 操作完成后发送事件通知父组件刷新数据

## 注意事项

1. **状态同步**: 确保视频状态与后端数据保持同步
2. **错误处理**: 网络异常时提供友好的错误提示
3. **性能优化**: 视频预览使用压缩版本，避免加载过慢
4. **兼容性**: 支持不同平台的视频播放功能 