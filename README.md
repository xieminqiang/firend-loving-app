# 随伴行 uni-app 项目

基于"兴趣陪伴 + 线下预约 + 情绪连接"的轻社交平台移动应用。

## 项目技术栈

- **框架**: uni-app (Vue3 + TypeScript)
- **状态管理**: Pinia
- **样式**: SCSS
- **图标**: 自定义PNG图标系统（设计师级别）
- **平台支持**: 微信小程序、Android、iOS

## 项目结构

```
firend-loving-app/
├── api/                    # API接口
├── components/             # 组件库
│   ├── business/          # 业务组件
│   └── common/            # 通用组件
├── config/                # 配置文件
├── pages/                 # 主要页面
│   └── tabbar/           # 底部导航页面
├── scripts/               # 工具脚本
│   ├── design_tabbar_icons.py        # 精美TabBar图标设计
│   ├── premium_tabbar_icons.py       # 高级TabBar图标设计（渐变+光效）
│   ├── preview_icons.py              # 图标预览生成
│   ├── download_tab_icons.py         # 简单图标生成
│   └── download_iconfont_icons.py    # 完整图标下载系统
├── static/                # 静态资源
│   └── icons/            # 图标文件
│       ├── tabbar/       # 底部导航图标（设计师级别）
│       ├── common/       # 通用图标
│       ├── friend/       # 朋友相关图标
│       ├── profile/      # 个人资料图标
│       └── auth/         # 认证相关图标
├── stores/                # 状态管理
├── styles/                # 样式文件
├── subPackages/           # 分包页面
└── utils/                 # 工具函数
```

## 🎨 精美TabBar图标设计

### 设计特点

- **现代化设计风格**: 符合Material Design规范
- **清晰的视觉层次**: 优雅的线条和形状
- **完美的激活状态对比**: 渐变和光效
- **立体感和高光效果**: 提升视觉体验
- **64x64像素**: 支持高分辨率显示

### 图标列表

| 功能 | 普通状态 | 激活状态 | 设计特色 |
|------|----------|----------|----------|
| 首页 | home.png | home-fill.png | 温馨房子设计，带门窗细节 |
| 发现 | discover.png | discover-fill.png | 指南针设计，带装饰点 |
| 友伴 | friends.png | friends-fill.png | 双人社交设计，带连接线 |
| 我的 | profile.png | profile-fill.png | 个人头像设计，带高光 |
| 工作台 | grid.png | grid-fill.png | 工作台设计，四种工具图标 |
| 账户 | account.png | account-fill.png | 用户+齿轮设计，带装饰 |

### 高级设计版本

我们还提供了带渐变背景和发光效果的高级版本：

- **渐变背景**: 径向渐变效果，增强视觉层次
- **发光效果**: 高斯模糊发光，提升立体感
- **高光处理**: 白色高光，增强质感
- **精细线条**: 优化的线条粗细和间距

### 使用方法

```vue
<!-- 在TabBar中使用 -->
<image src="/static/icons/tabbar/home.png" class="tab-icon" />
<image src="/static/icons/tabbar/home-fill.png" class="tab-icon" />

<!-- 在pages.json中配置 -->
{
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/tabbar/home/index",
        "text": "首页",
        "iconPath": "static/icons/tabbar/home.png",
        "selectedIconPath": "static/icons/tabbar/home-fill.png"
      }
    ]
  }
}
```

## 开发规范

### 图标设计规范

1. **尺寸标准**: 64x64像素，支持@2x和@3x
2. **颜色规范**: 
   - 普通状态: #BFBFBF
   - 激活状态: #7363FF
3. **设计原则**: 简洁、现代、易识别
4. **文件格式**: PNG格式，支持透明背景

### 脚本使用

```bash
# 生成基础精美图标
python3 scripts/design_tabbar_icons.py

# 生成高级图标（渐变+光效）
python3 scripts/premium_tabbar_icons.py

# 生成图标预览
python3 scripts/preview_icons.py

# 下载iconfont图标
python3 scripts/download_iconfont_icons.py
```

## 更新日志

### v1.1.0 - 精美TabBar图标设计
- ✨ 全新设计的TabBar图标系统
- 🎨 现代化设计风格，符合Material Design
- 🌟 高级版本支持渐变和发光效果
- 📱 完美适配各种屏幕分辨率
- 🔧 提供完整的图标设计脚本

### v1.0.0 - 项目初始化
- 🚀 项目基础架构搭建
- 📦 移除uview-plus依赖
- 🎯 建立自定义图标系统
- 📋 完善项目文档

## 开发团队

- **设计师**: AI进化论-花生
- **开发**: 资深Vue3/uni-app工程师
- **产品**: 专注用户体验的产品经理

## 许可证

本项目采用 MIT 许可证。
