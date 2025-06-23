#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
图标下载和转换脚本
支持从多个开源图标库下载SVG图标并转换为PNG格式
"""

import os
import sys
import requests
import json
from pathlib import Path
from PIL import Image
import cairosvg
import io
import time
from urllib.parse import urljoin, urlparse

class IconDownloader:
    def __init__(self, output_dir="static/icons/friend"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
    
    def download_from_iconfont(self, icon_id, name, size=64, color="#333333"):
        """从iconfont下载图标"""
        try:
            # iconfont API URL
            url = f"https://at.alicdn.com/t/font_icon_{icon_id}.svg"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                svg_content = response.text
                return self.convert_svg_to_png(svg_content, name, size, color)
            else:
                print(f"❌ 下载失败: {name} (状态码: {response.status_code})")
                return False
        except Exception as e:
            print(f"❌ 下载出错: {name} - {str(e)}")
            return False
    
    def download_from_iconify(self, icon_name, name, size=64, color="#333333"):
        """从Iconify下载图标"""
        try:
            # Iconify API URL
            url = f"https://api.iconify.design/{icon_name}.svg"
            if color != "#333333":
                url += f"?color={color.replace('#', '%23')}"
            
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                svg_content = response.text
                return self.convert_svg_to_png(svg_content, name, size, color)
            else:
                print(f"❌ 下载失败: {name} (状态码: {response.status_code})")
                return False
        except Exception as e:
            print(f"❌ 下载出错: {name} - {str(e)}")
            return False
    
    def download_from_feather(self, icon_name, name, size=64, color="#333333"):
        """从Feather Icons下载图标"""
        try:
            # Feather Icons CDN
            url = f"https://cdn.jsdelivr.net/npm/feather-icons@4.29.0/icons/{icon_name}.svg"
            response = self.session.get(url, timeout=10)
            
            if response.status_code == 200:
                svg_content = response.text
                # 修改颜色
                if color != "#333333":
                    svg_content = svg_content.replace('stroke="currentColor"', f'stroke="{color}"')
                    svg_content = svg_content.replace('fill="none"', f'fill="{color}"')
                
                return self.convert_svg_to_png(svg_content, name, size, color)
            else:
                print(f"❌ 下载失败: {name} (状态码: {response.status_code})")
                return False
        except Exception as e:
            print(f"❌ 下载出错: {name} - {str(e)}")
            return False
    
    def convert_svg_to_png(self, svg_content, name, size=64, color="#333333"):
        """将SVG转换为PNG"""
        try:
            # 确保SVG有正确的尺寸
            if 'width=' not in svg_content or 'height=' not in svg_content:
                svg_content = svg_content.replace('<svg', f'<svg width="{size}" height="{size}"')
            
            # 转换SVG到PNG
            png_data = cairosvg.svg2png(
                bytestring=svg_content.encode('utf-8'),
                output_width=size,
                output_height=size
            )
            
            # 保存PNG文件
            output_path = self.output_dir / f"{name}.png"
            with open(output_path, 'wb') as f:
                f.write(png_data)
            
            print(f"✅ 成功转换: {name}.png ({size}x{size})")
            return True
            
        except Exception as e:
            print(f"❌ 转换失败: {name} - {str(e)}")
            return False
    
    def batch_download(self, icons_config):
        """批量下载图标"""
        success_count = 0
        total_count = len(icons_config)
        
        print(f"🚀 开始下载 {total_count} 个图标...")
        print("-" * 50)
        
        for config in icons_config:
            name = config['name']
            source = config.get('source', 'iconify')
            icon_id = config.get('icon_id', '')
            size = config.get('size', 64)
            color = config.get('color', '#333333')
            
            print(f"📥 下载中: {name}")
            
            success = False
            if source == 'iconfont':
                success = self.download_from_iconfont(icon_id, name, size, color)
            elif source == 'iconify':
                success = self.download_from_iconify(icon_id, name, size, color)
            elif source == 'feather':
                success = self.download_from_feather(icon_id, name, size, color)
            
            if success:
                success_count += 1
            
            # 避免请求过快
            time.sleep(0.5)
        
        print("-" * 50)
        print(f"🎉 下载完成! 成功: {success_count}/{total_count}")

def main():
    # 创建下载器
    downloader = IconDownloader()
    
    # 友伴页面需要的图标配置
    friends_icons = [
        # 标签栏图标
        {'name': 'fire', 'source': 'iconify', 'icon_id': 'mdi:fire', 'size': 64, 'color': '#82A0D8'},
        {'name': 'location', 'source': 'iconify', 'icon_id': 'mdi:map-marker', 'size': 64, 'color': '#82A0D8'},
        {'name': 'heart', 'source': 'iconify', 'icon_id': 'mdi:heart', 'size': 64, 'color': '#82A0D8'},
        {'name': 'bookmark', 'source': 'iconify', 'icon_id': 'mdi:bookmark', 'size': 64, 'color': '#82A0D8'},
        
        # 筛选图标
        {'name': 'gender', 'source': 'iconify', 'icon_id': 'mdi:gender-male-female', 'size': 64, 'color': '#82A0D8'},
        {'name': 'sort', 'source': 'iconify', 'icon_id': 'mdi:sort', 'size': 64, 'color': '#82A0D8'},
        
        # 性别图标
        {'name': 'female', 'source': 'iconify', 'icon_id': 'mdi:gender-female', 'size': 64, 'color': '#FF6B9A'},
        {'name': 'male', 'source': 'iconify', 'icon_id': 'mdi:gender-male', 'size': 64, 'color': '#4B7BEC'},
        
        # 功能图标
        {'name': 'search', 'source': 'iconify', 'icon_id': 'mdi:magnify', 'size': 64, 'color': '#82A0D8'},
        {'name': 'message', 'source': 'iconify', 'icon_id': 'mdi:message-text', 'size': 64, 'color': '#82A0D8'},
        {'name': 'calendar', 'source': 'iconify', 'icon_id': 'mdi:calendar', 'size': 64, 'color': '#FFFFFF'},
        {'name': 'star', 'source': 'iconify', 'icon_id': 'mdi:star', 'size': 64, 'color': '#FFA726'},
        {'name': 'close', 'source': 'iconify', 'icon_id': 'mdi:close', 'size': 64, 'color': '#666666'},
        {'name': 'check', 'source': 'iconify', 'icon_id': 'mdi:check', 'size': 64, 'color': '#4CAF50'},
        
        # 箭头图标
        {'name': 'chevron-down', 'source': 'iconify', 'icon_id': 'mdi:chevron-down', 'size': 64, 'color': '#82A0D8'},
        
        # 地图图标
        {'name': 'map-pin', 'source': 'iconify', 'icon_id': 'mdi:map-marker', 'size': 64, 'color': '#82A0D8'},
        
        # 排序选项图标
        {'name': 'thumbs-up', 'source': 'iconify', 'icon_id': 'mdi:thumb-up', 'size': 64, 'color': '#82A0D8'},
        {'name': 'bolt', 'source': 'iconify', 'icon_id': 'mdi:lightning-bolt', 'size': 64, 'color': '#82A0D8'},
    ]
    
    # 下载图标
    downloader.batch_download(friends_icons)
    
    print("\n📋 图标使用说明:")
    print("- 所有图标已保存到 static/icons/friend/ 目录")
    print("- 图标尺寸: 64x64 像素")
    print("- 格式: PNG")
    print("- 可以在 Vue 组件中直接使用: /static/icons/friend/图标名.png")

if __name__ == "__main__":
    # 检查依赖
    try:
        import cairosvg
        from PIL import Image
    except ImportError as e:
        print("❌ 缺少依赖包，请先安装:")
        print("pip install cairosvg pillow requests")
        sys.exit(1)
    
    main() 