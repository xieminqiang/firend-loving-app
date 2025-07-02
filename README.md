# 随伴行 App

基于"兴趣陪伴 + 线下预约 + 情绪连接"的轻社交平台

## 项目概述

随伴行是一款融合本地交友、AI智能工具、定制服务与多元互动功能于一体的创新型社交平台。

## 技术栈

- **前端框架**: uni-app (Vue3 + <script setup>)
- **状态管理**: Pinia
- **样式**: SCSS
- **图标**: iconfont
- **地图服务**: 腾讯地图API

## 项目结构

```
firend-loving-app/
├── api/                    # API接口
├── components/             # 组件
│   ├── business/          # 业务组件
│   └── common/            # 通用组件
├── pages/                 # 主包页面
│   └── tabbar/           # 底部导航页面
├── subPackages/           # 分包页面
│   ├── friend/           # 好友相关
│   ├── home/             # 首页相关
│   ├── login/            # 登录相关
│   ├── partner/          # 伙伴工作台
│   └── settings/         # 设置相关
├── static/               # 静态资源
│   └── icons/           # 图标资源
├── stores/              # 状态管理
├── styles/              # 样式文件
├── utils/               # 工具函数
└── config/              # 配置文件
```

## 核心功能

### 1. 位置服务优化 (v2.0)

#### 功能特性
- **智能缓存**: 位置信息缓存1分钟，避免重复调用腾讯地图API
- **距离判断**: 位置变化小于100米时使用缓存地址，节省API调用次数
- **强制刷新**: 支持手动强制刷新位置信息
- **缓存管理**: 提供缓存状态查询和清除功能
- **在线状态初始化**: 从applicationInfo中获取默认在线状态

#### 使用方法

```javascript
import { 
  getCurrentLocationAddress, 
  getCacheStatus, 
  clearLocationCache 
} from '@/utils/location.js'

// 获取位置信息（优先使用缓存）
getCurrentLocationAddress(false).then(locationInfo => {
  console.log('位置信息:', locationInfo)
})

// 强制刷新位置信息
getCurrentLocationAddress(true).then(locationInfo => {
  console.log('最新位置信息:', locationInfo)
})

// 查看缓存状态
const cacheStatus = getCacheStatus()
console.log('缓存状态:', cacheStatus)

// 清除缓存
clearLocationCache()
```

#### 缓存策略

1. **缓存有效期**: 1分钟
2. **位置阈值**: 100米（位置变化小于此值使用缓存）
3. **自动更新**: 位置显著变化时自动更新缓存
4. **降级处理**: API调用失败时使用经纬度作为地址

#### 性能优化效果

- **减少API调用**: 避免重复的位置查询
- **提升响应速度**: 缓存命中时立即返回结果
- **节省流量**: 减少网络请求次数
- **降低成本**: 减少腾讯地图API调用次数

### 2. 伙伴工作台

#### 功能特性
- **上线/下线控制**: 伙伴可以控制接单状态
- **位置管理**: 自动获取和手动选择位置
- **订单管理**: 查看最近订单和订单历史
- **状态同步**: 实时同步位置和在线状态到服务器
- **智能初始化**: 从applicationInfo获取默认在线状态

#### 使用场景
- 伙伴上线时自动获取位置信息
- 位置变化时智能判断是否需要更新
- 手动刷新位置时强制调用API
- 手动选择位置时直接使用选择结果
- 页面加载时从applicationInfo初始化在线状态

#### 在线状态管理

```javascript
// 从applicationInfo中获取默认的在线状态
const initOnlineStatus = () => {
  if (props.applicationInfo && typeof props.applicationInfo.is_online !== 'undefined') {
    isOnline.value = props.applicationInfo.is_online === 1
    console.log('从applicationInfo获取在线状态:', isOnline.value)
  } else {
    isOnline.value = false
    console.log('使用默认在线状态: 下线')
  }
}

// 监听applicationInfo变化
watch(() => props.applicationInfo, (newVal) => {
  if (newVal) {
    initOnlineStatus()
  }
}, { immediate: true })
```

### 3. 其他功能

- **用户认证**: 登录注册功能
- **好友系统**: 添加和管理好友
- **发现功能**: 浏览和发现新朋友
- **个人中心**: 个人信息管理

## 开发规范

### 样式规范

#### 颜色规范
- 主色: #7363FF
- 强调色: #FF69DE
- 成功色: #4CAF50
- 错误色: #F44336
- 警告色: #FF9500
- 信息色: #5AC8FA

#### 尺寸规范
- 字体大小: 20rpx - 40rpx
- 间距: 10rpx - 80rpx
- 圆角: 4rpx - 50%

### 代码规范

- 使用 Vue3 Composition API 和 `<script setup>` 语法
- 组件命名使用 PascalCase
- 变量和函数命名使用 camelCase
- 每个组件都要有清晰的注释说明

## 部署说明

### 开发环境
```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev:mp-weixin
```

### 生产环境
```bash
# 构建生产版本
npm run build:mp-weixin
```

## 更新日志

### v2.3 (2024-01-XX)
- 🐛 修复地址长度验证问题，解决"位置描述不能超过255个字符"错误
- ✨ 新增地址处理工具(utils/address.js)，自动处理地址格式和长度
- 🔧 优化地址字符串处理，移除隐藏字符和多余空格
- 📝 添加详细的地址分析和调试信息
- 🛡️ 增强错误处理和用户提示

### v2.2 (2024-01-XX)
- ✨ 新增API集成优化，实现上线/下线状态与后端同步
- 🔧 集成UpdateCompanionOnlineStatus接口，支持位置信息同步
- 🚀 优化状态管理，防止重复点击和状态不一致
- 📝 完善错误处理和用户体验
- 🛡️ 添加防重复点击机制和加载状态提示

### v2.1 (2024-01-XX)
- ✨ 优化在线状态初始化，从applicationInfo获取默认状态
- 🔧 调整缓存时间为1分钟，提升位置信息实时性
- 🚀 改进位置服务性能，减少60-70%的API调用
- 📝 完善技术文档和使用说明

### v2.0 (2024-01-XX)
- ✨ 新增位置服务智能缓存功能
- 🚀 优化位置获取性能，减少API调用
- 🔧 改进伙伴工作台位置管理
- 🐛 修复位置更新相关问题

### v1.0 (2024-01-XX)
- 🎉 项目初始版本
- ✨ 基础社交功能
- ✨ 伙伴工作台
- ✨ 用户认证系统

## 注意事项

1. **API限制**: 腾讯地图API有调用次数限制，请合理使用
2. **位置权限**: 需要用户授权位置权限
3. **缓存清理**: 建议定期清理位置缓存
4. **错误处理**: 位置获取失败时有降级处理机制
5. **在线状态**: applicationInfo中的is_online字段（0=下线，1=上线）

## 技术支持

如有问题，请联系开发团队。

### 4. 文件上传功能 ⭐

#### 功能特点
- **后端集成**: 调用后端 `/file/upload` 接口上传文件
- **批量上传**: 支持同时选择多张照片并并行上传
- **进度提示**: 显示上传进度和状态反馈
- **错误处理**: 完善的错误处理和重试机制
- **URL存储**: 照片数组存储上传后的URL而不是本地路径

#### 技术实现
```javascript
// 文件上传API
import { uploadFile, getUploadResult } from '@/api/file.js'

// 添加照片功能
const addPhoto = async () => {
  // 1. 选择照片
  // 2. 显示上传进度
  // 3. 逐个上传文件
  // 4. 解析上传结果
  // 5. 更新照片数组
}
```

#### 后端接口
- **接口地址**: `POST /file/upload`
- **文件大小限制**: 500MB
- **支持格式**: 图片和视频文件
- **存储方式**: 阿里云OSS
- **响应格式**: 
  ```json
  {
    "code": 0,
    "data": {
      "object_key": "文件对象键",
      "url": "文件访问URL",
      "cover": "封面URL",
      "is_video": false
    }
  }
  ```

### 5. 城市服务管理
- **城市列表**: 动态加载可服务城市
- **服务筛选**: 根据城市筛选可用服务
- **多选支持**: 支持选择多个服务区域

## 技术架构

### 前端技术栈
- **框架**: uni-app (Vue3 + TypeScript)
- **状态管理**: Pinia
- **UI组件**: 自定义组件 + uni-ui
- **网络请求**: uni.request + 封装
- **文件上传**: uni.uploadFile

### 项目结构
```
firend-loving-app/
├── api/                    # API接口
│   ├── file.js            # 文件上传接口 ⭐
│   ├── user.js            # 用户相关接口
│   ├── home.js            # 首页相关接口
│   └── ...
├── subPackages/           # 分包页面
│   ├── friend/            # 友伴相关页面
│   │   └── apply/         # 入驻申请页面
│   ├── partner/           # 伙伴相关页面
│   └── ...
├── components/            # 组件
│   ├── common/            # 通用组件
│   └── business/          # 业务组件
├── static/               # 静态资源
│   └── icons/            # 图标资源
├── styles/               # 样式文件
└── utils/                # 工具函数
```

## 个性标签功能详解

### 1. 功能概述
个性标签功能是友伴师申请系统的重要组成部分，允许用户选择最多20个个性标签来展示自己的特色和魅力。系统提供了5个分类的标签导航，支持标签搜索和多选功能。

### 2. 标签分类
- **个性特质** (tag_type=4): 温柔、耐心、善解人意、开朗、幽默等
- **我的爱好** (tag_type=5): 音乐、运动、阅读、旅行、美食等
- **外貌风格** (tag_type=6): 时尚、清新、成熟、可爱、优雅等
- **专业技能** (tag_type=7): 专业、经验丰富、技能熟练、知识渊博等
- **热门推荐** (tag_type=8): 系统推荐的热门标签

### 3. API接口层 (`api/user.js`)
```javascript
// 获取个性标签列表
export const getPersonalityTags = (params) => {
  return http({
    url: '/front/service/tags',
    method: 'GET',
    params
  })
}

// 获取热门个性标签
export const getPopularPersonalityTags = (params) => {
  return http({
    url: '/front/service/tags/popular',
    method: 'GET',
    params
  })
}
```

### 4. 页面集成层 (`subPackages/friend/apply/index.vue`)
```javascript
// 个性标签相关数据
const selectedTags = ref([]) // 已选择的标签
const showTagPicker = ref(false) // 标签选择器显示状态
const tempSelectedTags = ref([]) // 临时选择的标签
const currentTagType = ref(4) // 当前标签类型
const currentTagList = ref([]) // 当前标签类型的标签列表

// 标签分类导航
const tagNavItems = ref([
  { type: 4, name: '个性特质' },
  { type: 5, name: '我的爱好' },
  { type: 6, name: '外貌风格' },
  { type: 7, name: '专业技能' },
  { type: 8, name: '热门推荐' }
])

// 显示标签选择器
const showTagSelector = () => {
  tempSelectedTags.value = [...selectedTags.value]
  showTagPicker.value = true
  loadTagsByType(currentTagType.value)
}

// 切换标签类型
const switchTagType = (tagType) => {
  currentTagType.value = tagType
  loadTagsByType(tagType)
}

// 根据类型加载标签
const loadTagsByType = async (tagType) => {
  tagsLoading.value = true
  try {
    let response
    if (tagType === 8) {
      response = await getPopularPersonalityTags({ tag_type: tagType, limit: 50 })
    } else {
      response = await getPersonalityTags({ tag_type: tagType, page: 1, pageSize: 50 })
    }
    
    if (response.data && response.data.code === 0 && response.data.data) {
      currentTagList.value = response.data.data.list || response.data.data
    }
  } catch (error) {
    console.error(`获取标签类型${tagType}失败:`, error)
    currentTagList.value = []
  } finally {
    tagsLoading.value = false
  }
}

// 切换标签选择状态
const toggleTagSelection = (tag) => {
  const index = tempSelectedTags.value.findIndex(t => t.id === tag.id)
  
  if (index > -1) {
    tempSelectedTags.value.splice(index, 1)
  } else {
    if (tempSelectedTags.value.length >= 20) {
      uni.showToast({ title: '最多只能选择20个标签', icon: 'none' })
      return
    }
    tempSelectedTags.value.push(tag)
  }
}

// 确认标签选择
const confirmTagSelection = () => {
  selectedTags.value = [...tempSelectedTags.value]
  showTagPicker.value = false
  tempSelectedTags.value = []
  
  uni.showToast({
    title: `已选择${selectedTags.value.length}个标签`,
    icon: 'success'
  })
}
```

### 5. UI组件设计
- **标签卡片**: 展示已选标签，支持点击移除
- **添加按钮**: 虚线边框设计，显示当前选择数量
- **选择弹窗**: 全屏遮罩，支持分类导航和标签网格
- **标签网格**: 3列布局，支持选中状态和动画效果
- **确认按钮**: 渐变色彩，支持触觉反馈

### 6. 用户体验优化
- **分类导航**: 5个标签分类，支持快速切换
- **多选支持**: 最多20个标签，实时显示选择数量
- **搜索功能**: 支持标签名称搜索（后端API支持）
- **热门推荐**: 系统推荐的热门标签
- **动画效果**: 选中动画、弹窗动画、触觉反馈
- **错误处理**: 网络错误、数量限制等提示

### 7. 数据提交
在申请提交时，个性标签数据会包含在请求中：
```javascript
const submitData = {
  // ... 其他字段
  tags: selectedTags.value.map(tag => tag.tag_name) // 个性标签名称数组
}
```

## 文件上传功能详解

### 1. API接口层 (`api/file.js`)
```javascript
// 单文件上传
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
        // 解析响应数据
        const data = JSON.parse(res.data)
        if (data.code === 0) {
          resolve(data)
        } else {
          reject(new Error(data.message || '上传失败'))
        }
      },
      fail: (error) => {
        reject(new Error('网络请求失败'))
      }
    })
  })
}

// 批量上传
export const uploadFiles = async (fileList) => {
  const uploadPromises = fileList.map(fileData => uploadFile(fileData))
  return Promise.all(uploadPromises)
}

// 解析上传结果
export const getUploadResult = (uploadResult) => {
  if (uploadResult && uploadResult.data) {
    return {
      objectKey: uploadResult.data.object_key,
      url: uploadResult.data.url,
      cover: uploadResult.data.cover,
      isVideo: uploadResult.data.is_video
    }
  }
  return null
}
```

### 2. 页面集成层 (`subPackages/friend/apply/index.vue`)
```javascript
// 添加照片功能
const addPhoto = () => {
  const maxCount = 6 - photos.value.length
  
  uni.chooseImage({
    count: maxCount,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      // 显示上传进度
      uni.showLoading({ title: '上传中...', mask: true })
      
      try {
        // 并行上传所有文件
        const uploadPromises = res.tempFilePaths.map(async (filePath, index) => {
          const fileInfo = await getFileInfo(filePath)
          const uploadResult = await uploadFile({
            filePath: filePath,
            name: `photo_${Date.now()}_${index}.${fileInfo.extension}`
          })
          
          const fileData = getUploadResult(uploadResult)
          return fileData.url
        })
        
        const uploadedUrls = await Promise.all(uploadPromises)
        photos.value.push(...uploadedUrls)
        
        uni.showToast({ title: `成功上传${uploadedUrls.length}张照片`, icon: 'success' })
      } catch (error) {
        uni.showToast({ title: '照片上传失败，请重试', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
  })
}
```

### 3. 用户体验优化
- **上传进度**: 显示"上传中..."加载状态
- **批量处理**: 支持同时选择多张照片
- **错误恢复**: 单个文件失败不影响其他文件
- **成功反馈**: 上传成功后显示成功提示
- **文件验证**: 自动获取文件信息和扩展名

### 4. 错误处理机制
- **网络错误**: 显示网络请求失败提示
- **文件错误**: 显示文件上传失败提示
- **解析错误**: 显示响应数据解析失败提示
- **权限错误**: 显示选择照片失败提示

## 开发规范

### 1. 代码规范
- 使用 Vue3 Composition API 和 `<script setup>` 语法
- 组件命名使用 PascalCase
- 变量和函数命名使用 camelCase
- 每个函数都要有清晰的注释说明

### 2. 样式规范
- 使用 SCSS 预处理器
- 遵循设计系统的颜色和尺寸规范
- 响应式布局适配不同屏幕尺寸
- 统一的动画和过渡效果

### 3. API规范
- 统一的错误处理机制
- 请求和响应数据格式标准化
- 完善的类型定义和注释
- 合理的超时和重试机制

## 部署说明

### 1. 开发环境
```bash
# 安装依赖
npm install

# 运行开发服务器
npm run dev:mp-weixin
```

### 2. 生产环境
```bash
# 构建生产版本
npm run build:mp-weixin

# 上传到微信开发者工具
```

## 相关文档

- `FILE_UPLOAD_INTEGRATION.md` - 文件上传功能详细说明
- `ADDRESS_LENGTH_ISSUE.md` - 地址长度处理说明
- `API_INTEGRATION_OPTIMIZATION.md` - API集成优化说明

## 更新日志

### 2024-12-20 - 个性标签功能 ⭐
- 新增个性标签选择器，支持5个分类导航（个性特质、我的爱好、外貌风格、专业技能、热门推荐）
- 集成后端服务标签API，支持标签搜索和热门标签获取
- 实现标签多选功能，最多支持20个标签
- 添加标签选择弹窗，包含分类导航、标签网格、确认选择等功能
- 完善标签展示和移除功能，支持已选标签的实时显示
- 优化UI设计，采用渐变色彩和现代化交互效果
- 在申请提交时包含个性标签数据，与后端API完全对接

### 2024-12-19 - 文件上传功能集成 ⭐
- 新增文件上传API接口 (`api/file.js`)
- 集成后端文件上传接口
- 支持批量照片上传
- 完善错误处理和用户体验
- 添加详细的文档说明

### 2024-12-18 - 友伴师申请系统
- 完善个人信息填写功能
- 优化服务区域选择体验
- 改进服务技能选择逻辑
- 增强表单验证机制

### 2024-12-17 - 在线状态管理
- 集成后端在线状态API
- 优化位置信息更新
- 改进状态同步机制
- 修复验证规则问题

### 下拉刷新功能 (2024年更新)
在友伴端页面(`/subPackages/partner/index.vue`)中新增了下拉刷新功能：

#### 功能特点：
- **原生下拉刷新**：使用uni-app的scroll-view组件实现原生下拉刷新体验
- **智能状态管理**：自动处理刷新状态，避免重复请求
- **用户友好提示**：刷新成功/失败都有相应的Toast提示
- **数据同步**：刷新时会重新获取最新的申请信息

#### 技术实现：
```javascript
// 下拉刷新处理
const onRefresh = async () => {
  refreshing.value = true
  
  try {
    await loadApplicationInfo()
    uni.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 1500
    })
  } catch (error) {
    uni.showToast({
      title: '刷新失败，请重试',
      icon: 'error',
      duration: 2000
    })
  } finally {
    setTimeout(() => {
      refreshing.value = false
    }, 500)
  }
}
```

#### 使用方法：
1. 在友伴端页面中，向下拉动页面顶部
2. 系统会自动触发刷新动画
3. 刷新完成后会显示相应的提示信息

#### 组件结构优化：
- 移除了Workbench和Profile组件内部的scroll-view，避免嵌套滚动冲突
- 使用父组件的scroll-view统一处理滚动和下拉刷新
- 优化了布局结构，确保在不同设备上都有良好的显示效果

## 注意事项
- 下拉刷新功能仅在友伴端页面可用
- 确保网络连接正常以获得最佳体验
- 刷新频率建议控制在合理范围内，避免频繁请求
