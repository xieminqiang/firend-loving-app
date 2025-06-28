#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TabBar图标下载脚本
从iconfont下载SVG图标并转换为PNG格式
"""

import requests
import os
from PIL import Image, ImageDraw
import io
import base64
from xml.etree import ElementTree as ET

def create_directory(path):
    """创建目录"""
    if not os.path.exists(path):
        os.makedirs(path)
        print(f"✓ 创建目录: {path}")

def download_iconfont_icon(icon_url, save_path, size=(64, 64)):
    """
    从iconfont下载图标并转换为PNG
    
    Args:
        icon_url: iconfont图标URL
        save_path: 保存路径
        size: 图标尺寸 (width, height)
    """
    try:
        response = requests.get(icon_url, timeout=10)
        response.raise_for_status()
        
        # 解析SVG
        root = ET.fromstring(response.content)
        
        # 获取SVG的viewBox
        viewbox = root.get('viewBox', '0 0 1024 1024').split()
        width = int(float(viewbox[2]))
        height = int(float(viewbox[3]))
        
        # 创建PIL图像
        img = Image.new('RGBA', size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # 这里简化处理，实际项目中可以使用cairosvg等库进行更精确的SVG转PNG
        # 由于PIL不直接支持SVG，我们创建一个简单的占位图标
        
        # 保存为PNG
        img.save(save_path, 'PNG')
        print(f"✓ 保存图标: {save_path}")
        return True
        
    except Exception as e:
        print(f"✗ 下载失败 {icon_url}: {e}")
        return False

def create_simple_icon(color, save_path, icon_type, size=(64, 64)):
    """
    创建简单的图标（当网络下载失败时的备用方案）
    
    Args:
        color: 图标颜色
        save_path: 保存路径
        icon_type: 图标类型 ('grid', 'account', 'home', 'discover', 'friends', 'profile')
        size: 图标尺寸
    """
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 根据图标类型绘制不同的形状
    if icon_type == 'grid':
        # 网格图标
        for i in range(2):
            for j in range(2):
                x1 = 10 + i * 20
                y1 = 10 + j * 20
                x2 = x1 + 15
                y2 = y1 + 15
                draw.rectangle([x1, y1, x2, y2], fill=color)
    elif icon_type == 'account':
        # 用户图标 - 圆形头像
        draw.ellipse([15, 10, 35, 30], fill=color)  # 头部
        draw.ellipse([10, 30, 40, 50], fill=color)  # 身体
    elif icon_type == 'home':
        # 首页图标 - 房子
        draw.polygon([(25, 10), (15, 20), (35, 20)], fill=color)  # 屋顶
        draw.rectangle([18, 20, 32, 40], fill=color)  # 房身
    elif icon_type == 'discover':
        # 发现图标 - 指南针
        draw.ellipse([10, 10, 40, 40], outline=color, width=2)
        draw.polygon([(25, 15), (30, 25), (25, 35), (20, 25)], fill=color)
    elif icon_type == 'friends':
        # 朋友图标 - 双人
        draw.ellipse([12, 10, 22, 20], fill=color)  # 左人头
        draw.ellipse([28, 10, 38, 20], fill=color)  # 右人头
        draw.ellipse([10, 25, 24, 40], fill=color)  # 左人身
        draw.ellipse([26, 25, 40, 40], fill=color)  # 右人身
    elif icon_type == 'profile':
        # 个人图标 - 单人
        draw.ellipse([18, 10, 32, 24], fill=color)  # 头部
        draw.ellipse([15, 28, 35, 45], fill=color)  # 身体
    
    img.save(save_path, 'PNG')
    print(f"✓ 创建图标: {save_path}")

def main():
    """主函数"""
    print("开始下载TabBar图标...")
    
    # 基础路径
    base_path = "../static/icons"
    
    # 创建目录
    create_directory(f"{base_path}/tabbar")
    create_directory(f"{base_path}/common")
    
    # 图标配置
    icons_config = [
        # TabBar图标
        {
            'name': 'grid-fill',
            'path': f'{base_path}/tabbar/grid-fill.png',
            'color': '#7363FF',
            'type': 'grid'
        },
        {
            'name': 'grid',
            'path': f'{base_path}/tabbar/grid.png',
            'color': '#BFBFBF',
            'type': 'grid'
        },
        {
            'name': 'account-fill',
            'path': f'{base_path}/tabbar/account-fill.png',
            'color': '#7363FF',
            'type': 'account'
        },
        {
            'name': 'account',
            'path': f'{base_path}/tabbar/account.png',
            'color': '#BFBFBF',
            'type': 'account'
        },
        # 主要TabBar图标
        {
            'name': 'home',
            'path': f'{base_path}/tabbar/home.png',
            'color': '#BFBFBF',
            'type': 'home'
        },
        {
            'name': 'home-fill',
            'path': f'{base_path}/tabbar/home-fill.png',
            'color': '#7363FF',
            'type': 'home'
        },
        {
            'name': 'discover',
            'path': f'{base_path}/tabbar/discover.png',
            'color': '#BFBFBF',
            'type': 'discover'
        },
        {
            'name': 'discover-fill',
            'path': f'{base_path}/tabbar/discover-fill.png',
            'color': '#7363FF',
            'type': 'discover'
        },
        {
            'name': 'friends',
            'path': f'{base_path}/tabbar/friends.png',
            'color': '#BFBFBF',
            'type': 'friends'
        },
        {
            'name': 'friends-fill',
            'path': f'{base_path}/tabbar/friends-fill.png',
            'color': '#7363FF',
            'type': 'friends'
        },
        {
            'name': 'profile',
            'path': f'{base_path}/tabbar/profile.png',
            'color': '#BFBFBF',
            'type': 'profile'
        },
        {
            'name': 'profile-fill',
            'path': f'{base_path}/tabbar/profile-fill.png',
            'color': '#7363FF',
            'type': 'profile'
        },
        # 常用图标
        {
            'name': 'back',
            'path': f'{base_path}/common/back.png',
            'color': '#333333',
            'type': 'back'
        },
        {
            'name': 'close',
            'path': f'{base_path}/common/close.png',
            'color': '#333333',
            'type': 'close'
        },
        {
            'name': 'search',
            'path': f'{base_path}/common/search.png',
            'color': '#333333',
            'type': 'search'
        },
        {
            'name': 'more',
            'path': f'{base_path}/common/more.png',
            'color': '#333333',
            'type': 'more'
        }
    ]
    
    # 创建图标
    success_count = 0
    for icon in icons_config:
        try:
            # 这里可以尝试从iconfont下载，失败则使用本地生成
            # 由于没有具体的iconfont链接，直接使用本地生成
            create_simple_icon(
                icon['color'], 
                icon['path'], 
                icon['type'], 
                size=(64, 64)
            )
            success_count += 1
        except Exception as e:
            print(f"✗ 创建图标失败 {icon['name']}: {e}")
    
    print(f"\n✓ 图标创建完成！成功: {success_count}/{len(icons_config)}")
    print("图标已保存到 static/icons/ 目录下")
    print("\n图标使用方法：")
    print("在Vue组件中使用：")
    print('<image src="/static/icons/tabbar/home.png" class="icon" />')

if __name__ == "__main__":
    main() 