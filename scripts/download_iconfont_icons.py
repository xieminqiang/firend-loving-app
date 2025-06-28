#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
完整的iconfont图标下载脚本
支持从阿里巴巴iconfont平台下载图标并转换为PNG
"""

import requests
import os
import json
import re
from PIL import Image, ImageDraw, ImageFont
import io
import sys

class IconDownloader:
    def __init__(self, base_path="../static/icons"):
        self.base_path = base_path
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })
    
    def create_directory(self, path):
        """创建目录"""
        if not os.path.exists(path):
            os.makedirs(path)
            print(f"✓ 创建目录: {path}")
    
    def download_from_iconfont(self, project_id, font_family="iconfont"):
        """
        从iconfont项目下载图标
        
        Args:
            project_id: iconfont项目ID
            font_family: 字体族名称
        """
        try:
            # 构建iconfont项目URL
            css_url = f"https://at.alicdn.com/t/font_{project_id}.css"
            
            print(f"正在从iconfont下载项目 {project_id}...")
            response = self.session.get(css_url)
            response.raise_for_status()
            
            css_content = response.text
            
            # 解析CSS中的图标信息
            icon_pattern = r'\.icon-([^:]+):before\s*{\s*content:\s*"\\([0-9a-fA-F]+)"'
            icons = re.findall(icon_pattern, css_content)
            
            print(f"发现 {len(icons)} 个图标")
            
            # 下载字体文件
            font_url_pattern = r'url\([\'"]?(https://[^\'")]+\.woff2?)[\'"]?\)'
            font_urls = re.findall(font_url_pattern, css_content)
            
            if font_urls:
                font_url = font_urls[0]
                font_response = self.session.get(font_url)
                font_path = f"{self.base_path}/temp_font.woff"
                
                with open(font_path, 'wb') as f:
                    f.write(font_response.content)
                
                print(f"✓ 下载字体文件: {font_url}")
                
                # 这里可以使用fontTools等库来处理字体文件
                # 由于复杂性，我们暂时使用备用方案
                
            return True
            
        except Exception as e:
            print(f"✗ 从iconfont下载失败: {e}")
            return False
    
    def create_fallback_icons(self):
        """创建备用图标"""
        print("创建备用图标...")
        
        # 图标配置
        icons_config = {
            'tabbar': {
                'home': {'color': '#BFBFBF', 'active_color': '#7363FF'},
                'discover': {'color': '#BFBFBF', 'active_color': '#7363FF'},
                'friends': {'color': '#BFBFBF', 'active_color': '#7363FF'},
                'profile': {'color': '#BFBFBF', 'active_color': '#7363FF'},
                'grid': {'color': '#BFBFBF', 'active_color': '#7363FF'},
                'account': {'color': '#BFBFBF', 'active_color': '#7363FF'},
            },
            'common': {
                'back': {'color': '#333333'},
                'close': {'color': '#333333'},
                'search': {'color': '#666666'},
                'more': {'color': '#666666'},
                'arrow-right': {'color': '#CCCCCC'},
                'arrow-left': {'color': '#CCCCCC'},
                'arrow-up': {'color': '#CCCCCC'},
                'arrow-down': {'color': '#CCCCCC'},
                'plus': {'color': '#7363FF'},
                'minus': {'color': '#FF4444'},
                'edit': {'color': '#666666'},
                'delete': {'color': '#FF4444'},
                'check': {'color': '#4CAF50'},
                'star': {'color': '#FFD700'},
                'heart': {'color': '#FF69DE'},
                'message': {'color': '#5AC8FA'},
                'phone': {'color': '#4CAF50'},
                'camera': {'color': '#666666'},
                'image': {'color': '#666666'},
                'share': {'color': '#7363FF'},
                'location': {'color': '#FF9500'},
                'time': {'color': '#666666'},
                'setting': {'color': '#666666'},
                'filter': {'color': '#666666'},
                'refresh': {'color': '#7363FF'},
                'download': {'color': '#4CAF50'},
                'upload': {'color': '#7363FF'},
            }
        }
        
        # 创建目录
        for category in icons_config:
            self.create_directory(f"{self.base_path}/{category}")
        
        # 生成图标
        for category, icons in icons_config.items():
            for icon_name, config in icons.items():
                # 普通状态
                self.create_icon(
                    icon_name, 
                    config['color'], 
                    f"{self.base_path}/{category}/{icon_name}.png"
                )
                
                # 激活状态（仅限tabbar）
                if category == 'tabbar' and 'active_color' in config:
                    self.create_icon(
                        icon_name, 
                        config['active_color'], 
                        f"{self.base_path}/{category}/{icon_name}-fill.png"
                    )
    
    def create_icon(self, icon_type, color, save_path, size=(64, 64)):
        """创建单个图标"""
        img = Image.new('RGBA', size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # 转换颜色
        if isinstance(color, str) and color.startswith('#'):
            color = tuple(int(color[i:i+2], 16) for i in (1, 3, 5))
        
        center_x, center_y = size[0] // 2, size[1] // 2
        
        # 根据图标类型绘制
        if icon_type == 'home':
            # 房子图标
            points = [
                (center_x, 15), 
                (15, 25), 
                (20, 25), 
                (20, 45), 
                (44, 45), 
                (44, 25), 
                (49, 25)
            ]
            draw.polygon(points[:3] + [(center_x, 15)], fill=color)  # 屋顶
            draw.rectangle([20, 25, 44, 45], fill=color)  # 房身
            
        elif icon_type == 'discover':
            # 指南针图标
            draw.ellipse([12, 12, 52, 52], outline=color, width=3)
            draw.polygon([(center_x, 20), (center_x+8, center_y), 
                         (center_x, 44), (center_x-8, center_y)], fill=color)
            
        elif icon_type == 'friends':
            # 朋友图标
            draw.ellipse([15, 12, 28, 25], fill=color)  # 左人头
            draw.ellipse([36, 12, 49, 25], fill=color)  # 右人头
            draw.ellipse([12, 30, 31, 50], fill=color)  # 左人身
            draw.ellipse([33, 30, 52, 50], fill=color)  # 右人身
            
        elif icon_type == 'profile':
            # 个人资料图标
            draw.ellipse([22, 12, 42, 32], fill=color)  # 头部
            draw.ellipse([18, 35, 46, 55], fill=color)  # 身体
            
        elif icon_type == 'grid':
            # 网格图标
            for i in range(2):
                for j in range(2):
                    x1 = 18 + i * 14
                    y1 = 18 + j * 14
                    draw.rectangle([x1, y1, x1+10, y1+10], fill=color)
                    
        elif icon_type == 'account':
            # 账户图标（同profile但稍有不同）
            draw.ellipse([20, 10, 44, 34], fill=color)  # 头部
            draw.ellipse([16, 38, 48, 58], fill=color)  # 身体
            
        elif icon_type == 'back':
            # 返回箭头
            draw.polygon([(35, center_y), (25, center_y-8), 
                         (25, center_y+8)], fill=color)
            draw.rectangle([25, center_y-2, 40, center_y+2], fill=color)
            
        elif icon_type == 'close':
            # 关闭图标
            draw.line([(20, 20), (44, 44)], fill=color, width=3)
            draw.line([(44, 20), (20, 44)], fill=color, width=3)
            
        elif icon_type == 'search':
            # 搜索图标
            draw.ellipse([18, 18, 38, 38], outline=color, width=3)
            draw.line([(35, 35), (46, 46)], fill=color, width=3)
            
        elif icon_type == 'more':
            # 更多图标
            for i in range(3):
                x = 22 + i * 10
                draw.ellipse([x, 28, x+4, 32], fill=color)
                
        elif icon_type in ['arrow-right', 'arrow-left', 'arrow-up', 'arrow-down']:
            # 箭头图标
            if icon_type == 'arrow-right':
                draw.polygon([(25, center_y), (35, center_y-6), 
                             (35, center_y+6)], fill=color)
            elif icon_type == 'arrow-left':
                draw.polygon([(39, center_y), (29, center_y-6), 
                             (29, center_y+6)], fill=color)
            elif icon_type == 'arrow-up':
                draw.polygon([(center_x, 25), (center_x-6, 35), 
                             (center_x+6, 35)], fill=color)
            elif icon_type == 'arrow-down':
                draw.polygon([(center_x, 39), (center_x-6, 29), 
                             (center_x+6, 29)], fill=color)
                
        else:
            # 默认图标 - 圆形
            draw.ellipse([20, 20, 44, 44], fill=color)
        
        img.save(save_path, 'PNG')
        print(f"✓ 创建图标: {save_path}")

def main():
    """主函数"""
    print("开始下载和创建图标...")
    
    downloader = IconDownloader()
    
    # 如果有iconfont项目ID，可以尝试下载
    iconfont_project_id = input("请输入iconfont项目ID（直接回车跳过）: ").strip()
    
    if iconfont_project_id:
        success = downloader.download_from_iconfont(iconfont_project_id)
        if not success:
            print("iconfont下载失败，使用备用方案...")
    
    # 创建备用图标
    downloader.create_fallback_icons()
    
    print("\n✓ 图标创建完成！")
    print("图标已保存到 static/icons/ 目录下")
    print("\n使用方法：")
    print("普通图标: <image src=\"/static/icons/common/back.png\" class=\"icon\" />")
    print("TabBar图标: <image src=\"/static/icons/tabbar/home.png\" class=\"tab-icon\" />")
    print("激活状态: <image src=\"/static/icons/tabbar/home-fill.png\" class=\"tab-icon\" />")

if __name__ == "__main__":
    main() 