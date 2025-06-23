# 伴 (Loving Company) - uni-app 跨平台应用

## 项目简介
爱伴是一个基于 uni-app 框架开发的跨平台社交应用，支持微信小程序、Android 和 iOS 平台。应用专注于为用户提供友伴交流、内容发现和个人管理功能。

## 技术栈
- **框架**: uni-app (Vue3 + Composition API)
- **UI组件库**: uview-plus
- **状态管理**: 推荐使用 Pinia
- **开发语言**: JavaScript/TypeScript
- **样式**: SCSS + uni.scss
- **图标**: Iconify/MDI 开源图标库

## 项目结构
```
loving-company/
├── pages/                    # 主要页面
│   └── tabbar/              # 底部导航页面
│       ├── home/            # 首页
│       ├── friends/         # 友伴页面
│       ├── discover/        # 发现页面
│       └── profile/         # 个人中心
├── subPackages/             # 分包页面
│   └── settings/            # 设置相关页面
│       └── pages/
│           ├── index/       # 设置首页
│           ├── account/     # 账户设置
│           ├── privacy/     # 隐私设置
│           └── about/       # 关于我们
├── components/              # 组件目录
│   ├── common/             # 通用组件
│   └── business/           # 业务组件
├── api/                    # API接口
├── utils/                  # 工具函数
├── styles/                 # 样式文件
├── static/                 # 静态资源
│   ├── icons/              # 图标资源
│   │   └── friend/         # 友伴页面图标 (PNG格式，64x64像素)
│   │       ├── fire.png    # 推荐图标
│   │       ├── location.png # 位置图标
│   │       ├── heart.png   # 匹配图标
│   │       ├── bookmark.png # 收藏图标
│   │       ├── search.png  # 搜索图标
│   │       ├── message.png # 消息图标
│   │       ├── calendar.png # 日历图标
│   │       ├── star.png    # 星级图标
│   │       ├── male.png    # 男性图标
│   │       ├── female.png  # 女性图标
│   │       └── ...         # 更多图标
│   └── images/             # 其他图片资源
├── scripts/                # 脚本工具
│   └── download_icons.py   # 图标下载脚本
├── docs/                   # 文档目录
│   └── ICONS.md           # 图标使用指南
├── config/                 # 配置文件
├── uni_modules/            # uni-app插件
│   └── uview-plus/         # uview-plus组件库
├── pages.json              # 页面配置
├── manifest.json           # 应用配置
├── uni.scss               # 全局样式变量
├── main.js                # 应用入口
├── requirements.txt        # Python依赖包
└── App.vue                # 应用根组件
```

## 主要功能模块

### 1. 首页 (Home)
- **功能概述**：展示服务推荐、轮播广告、分类导航
- **路径**：`pages/tabbar/home/index`
- **主要特性**：
  - 🏙️ **城市选择**：支持多城市切换，当前支持南昌、北京、上海、广州、深圳
  - 🎠 **轮播Banner**：自动轮播展示重要信息，支持手势滑动和点击切换
  - 📋 **服务分类**：三大类别（服务、娱乐、运动），动态切换展示内容
  - ⭐ **热门推荐**：展示各类别下的优质服务，包含评分、价格、标签等信息
  - 📱 **响应式设计**：适配不同屏幕尺寸，优化用户体验

- **功能详情**：
  - **轮播Banner功能**：
    - 自动轮播（5秒间隔）
    - 支持左右箭头控制
    - 支持触摸滑动切换
    - 底部指示器显示当前位置
    - 渐变遮罩优化文字可读性
  
  - **服务分类功能**：
    - **服务类**：礼仪模特、陪诊服务、探店达人、高级助理、外语翻译、旅行向导、摄影师、心理咨询、私人厨师、形象顾问等
    - **娱乐类**：K歌达人、桌游专家、电影伴侣、游戏高手、街舞达人等
    - **运动类**：健身教练、羽球搭子、舞蹈老师、游泳教练、瑜伽导师等
  
  - **服务卡片功能**：
    - 显示服务图片、标题、描述
    - 展示服务标签和评分
    - 显示价格信息（¥/小时起）
    - 支持点击查看详情
    - 支持一键预约功能

- **交互设计**：
  - 卡片点击有视觉反馈（上移+阴影变化）
  - 按钮点击有动画效果
  - 平滑的过渡动画
  - 优雅的渐变色彩搭配

- **技术实现**：
  - 使用 Vue3 Composition API
  - 响应式数据管理
  - 计算属性动态切换内容
  - 触摸事件处理
  - uni-app 导航API集成

### 2. 友伴 (Friends)
- 功能：好友列表、聊天功能
- 路径：`pages/tabbar/friends/index`
- 特性：支持下拉刷新

### 3. 发现 (Discover)
- 功能：内容发现、热门推荐
- 路径：`pages/tabbar/discover/index`
- 特性：支持下拉刷新

### 4. 个人中心 (Profile)
- 功能：个人信息、设置入口
- 路径：`pages/tabbar/profile/index`

### 5. 设置模块 (Settings)
- 设置首页：`subPackages/settings/pages/index/index`
- 账户设置：`subPackages/settings/pages/account/index`
- 隐私设置：`subPackages/settings/pages/privacy/index`
- 关于我们：`subPackages/settings/pages/about/index`

## 开发规范

### 代码规范
- 使用 Vue3 Composition API 和 `<script setup>` 语法
- 组件命名：PascalCase（如：UserProfile）
- 文件命名：kebab-case（如：user-profile.vue）
- 变量和函数：camelCase（如：getUserInfo）
- 常量：UPPER_SNAKE_CASE（如：API_BASE_URL）

### 图标使用规范

#### 1. 图标来源和管理
项目使用开源图标库（Iconify/MDI）提供高质量图标，通过 Python 脚本自动下载并转换为 PNG 格式：

```bash
# 下载和更新图标
python scripts/download_icons.py
```

#### 2. 图标使用方式
```vue
<template>
  <!-- 基本使用 -->
  <image src="/static/icons/friend/fire.png" class="icon" mode="aspectFit" />
  
  <!-- 动态图标 -->
  <image :src="`/static/icons/friend/${iconName}.png`" class="icon" mode="aspectFit" />
</template>

<style lang="scss" scoped>
.icon {
  width: 32rpx;
  height: 32rpx;
}
</style>
```

#### 3. 图标规范
- **尺寸**: 64x64 像素（标准），32x32 像素（小图标）
- **格式**: PNG
- **命名**: 小写字母 + 连字符（如：chevron-down.png）
- **颜色**: 预设项目主题色，支持自定义

#### 4. 添加新图标
1. 在 `scripts/download_icons.py` 中添加图标配置
2. 运行下载脚本：`python scripts/download_icons.py`
3. 图标自动保存到 `static/icons/friend/` 目录

详细说明请参考：[图标使用指南](docs/ICONS.md)

### 样式规范
- 使用 `uni.scss` 定义全局样式变量
- 响应式布局使用 flex 和百分比
- 充分利用 uview-plus 组件库
- 注意多平台样式兼容性

### 全局样式使用指南

#### 1. 样式变量使用
项目已配置全局样式变量，可在任何 `.vue` 文件中直接使用：

```scss
<style lang="scss" scoped>
// 直接使用全局变量，无需导入
.my-component {
  background-color: $primary-color;
  color: $text-color-primary;
  padding: $spacing-base;
  border-radius: $border-radius-base;
}
</style>
```

#### 2. 主题色彩规范
- **主色调**: `$primary-color` (#82A0D8) - 星湖蓝，用于主按钮、CTA、品牌色
- **辅助主色**: `$primary-hover` (#A7BCE7) - 用于悬浮状态、边框、二级强调
- **强调色**: `$highlight-color` (#FF6F61) - 用于活跃感、情绪点缀、重要提醒
- **成功色**: `$success-color` (#4CAF50) - 成功状态提示
- **警示色**: `$error-color` (#F44336) - 错误、删除、风险提示
- **警告色**: `$warning-color` (#FF9500) - 警告提示

#### 3. 文字颜色规范
- **主文字**: `$text-color-primary` (#1A1A1A) - 正文、重要说明
- **次要文字**: `$text-color-secondary` (#666666) - 标签、时间戳
- **占位符**: `$text-color-placeholder` (#999999) - 输入框占位符
- **禁用文字**: `$text-color-disabled` (#CCCCCC) - 不可操作状态
- **白色文字**: `$text-color-white` (#FFFFFF) - 深色背景上的文字

#### 4. 背景色规范
- **主背景**: `$bg-color-primary` (#FFFFFF) - 卡片、弹窗背景
- **页面背景**: `$bg-color-secondary` (#F7F8FA) - 页面底色
- **三级背景**: `$bg-color-tertiary` (#F0F0F0) - 禁用状态背景

#### 5. 常用工具类
项目提供了丰富的工具类，可直接在模板中使用：

```html
<!-- 布局类 -->
<view class="flex flex-center">居中布局</view>
<view class="flex-between">两端对齐</view>

<!-- 文字颜色类 -->
<text class="text-primary">主要文字</text>
<text class="text-theme-primary">主题色文字</text>

<!-- 背景色类 -->
<view class="bg-white">白色背景</view>
<view class="bg-theme-primary">主题色背景</view>

<!-- 间距类 -->
<view class="p-base m-lg">内边距和外边距</view>

<!-- 圆角类 -->
<view class="rounded-base">圆角</view>

<!-- 阴影类 -->
<view class="shadow-light">轻阴影</view>
```

#### 6. 混入(Mixins)使用
在需要使用混入的组件中导入：

```scss
<style lang="scss" scoped>
@import "@/styles/mixins.scss";

.my-button {
  @include button-primary;
}

.my-card {
  @include card;
}

.ellipsis-text {
  @include ellipsis(2); // 两行省略
}
</style>
```

#### 7. 响应式设计
使用提供的响应式混入：

```scss
.responsive-component {
  @include mobile {
    font-size: $font-size-sm;
  }
  
  @include tablet {
    font-size: $font-size-base;
  }
  
  @include desktop {
    font-size: $font-size-lg;
  }
}
```

### 目录规范
- 新增页面按功能模块分类放置
- 通用组件放在 `components/common/`
- 业务组件放在 `components/business/`
- API接口统一放在 `api/` 目录
- 工具函数放在 `utils/` 目录

## 平台配置

### 微信小程序
- 配置文件：`manifest.json` 中的 `mp-weixin` 节点
- 需要配置 appid
- 注意小程序包体积限制

### Android/iOS App
- 配置文件：`manifest.json` 中的 `app-plus` 节点
- 已配置基础权限
- 支持原生插件扩展

## 开发命令
```bash
# 微信小程序开发
npm run dev:mp-weixin

# H5开发
npm run dev:h5

# App开发
npm run dev:app-plus

# 生产构建
npm run build:mp-weixin
npm run build:h5
npm run build:app-plus
```

## 性能优化建议

### 分包优化
- 主包控制在 2MB 以内
- 非核心功能使用分包加载
- 合理配置分包预加载

### 资源优化
- 图片使用合适格式和尺寸
- 静态资源使用 CDN
- 避免过大的本地资源

### 代码优化
- 避免在页面中使用过多监听器
- 合理使用缓存机制
- 注意内存泄漏问题

## 平台兼容性

### 条件编译
使用 uni-app 条件编译处理平台差异：
```javascript
// #ifdef MP-WEIXIN
// 微信小程序特有代码
// #endif

// #ifdef APP-PLUS
// App端特有代码
// #endif

// #ifdef H5
// H5端特有代码
// #endif
```

### API差异
- 注意各平台API的差异和限制
- 使用 uni-app 统一API
- 特殊功能使用条件编译

## 部署说明

### 微信小程序
1. 在微信开发者工具中导入项目
2. 配置 appid
3. 上传代码并提交审核

### App打包
1. 使用 HBuilderX 云打包
2. 配置证书和签名
3. 生成安装包

## 贡献指南
1. 遵循项目代码规范
2. 提交前进行充分测试
3. 编写清晰的提交信息
4. 更新相关文档

## 联系方式
如有问题或建议，请联系开发团队。

---
*最后更新：2024年*
# firend-loving-app
