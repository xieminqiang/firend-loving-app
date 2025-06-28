#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
精美TabBar图标设计脚本
设计师级别的图标生成，采用现代化设计风格
"""

import os
from PIL import Image, ImageDraw, ImageFont
import math

class TabBarIconDesigner:
    def __init__(self, base_path="../static/icons"):
        self.base_path = base_path
        self.size = (64, 64)  # 标准图标尺寸
        self.center = (32, 32)
        
    def create_directory(self, path):
        """创建目录"""
        if not os.path.exists(path):
            os.makedirs(path)
            print(f"✓ 创建目录: {path}")
    
    def draw_rounded_rectangle(self, draw, bbox, radius, fill=None, outline=None, width=1):
        """绘制圆角矩形"""
        x1, y1, x2, y2 = bbox
        
        # 绘制四个圆角
        draw.ellipse([x1, y1, x1 + 2*radius, y1 + 2*radius], fill=fill, outline=outline, width=width)
        draw.ellipse([x2 - 2*radius, y1, x2, y1 + 2*radius], fill=fill, outline=outline, width=width)
        draw.ellipse([x1, y2 - 2*radius, x1 + 2*radius, y2], fill=fill, outline=outline, width=width)
        draw.ellipse([x2 - 2*radius, y2 - 2*radius, x2, y2], fill=fill, outline=outline, width=width)
        
        # 绘制矩形部分
        draw.rectangle([x1 + radius, y1, x2 - radius, y2], fill=fill, outline=outline, width=width)
        draw.rectangle([x1, y1 + radius, x2, y2 - radius], fill=fill, outline=outline, width=width)
    
    def draw_home_icon(self, draw, color, is_filled=False):
        """绘制精美的房子图标"""
        cx, cy = self.center
        
        if is_filled:
            # 填充版本 - 实心设计
            # 房身
            house_body = [(cx-16, cy+8), (cx-16, cy-8), (cx+16, cy-8), (cx+16, cy+8)]
            draw.polygon(house_body, fill=color)
            
            # 屋顶
            roof_points = [(cx-18, cy-8), (cx, cy-20), (cx+18, cy-8)]
            draw.polygon(roof_points, fill=color)
            
            # 门
            door_points = [(cx-6, cy+8), (cx-6, cy-2), (cx+6, cy-2), (cx+6, cy+8)]
            draw.polygon(door_points, fill=(255, 255, 255, 200))
            
            # 窗户
            window_rect = [cx-12, cy-4, cx-4, cy+4]
            draw.rectangle(window_rect, fill=(255, 255, 255, 200))
            window_rect2 = [cx+4, cy-4, cx+12, cy+4]
            draw.rectangle(window_rect2, fill=(255, 255, 255, 200))
        else:
            # 线框版本 - 简约设计
            # 房身轮廓
            house_body = [(cx-16, cy+8), (cx-16, cy-8), (cx+16, cy-8), (cx+16, cy+8)]
            draw.polygon(house_body, outline=color, width=2)
            
            # 屋顶
            roof_points = [(cx-18, cy-8), (cx, cy-20), (cx+18, cy-8)]
            draw.polygon(roof_points, outline=color, width=2)
            
            # 门
            door_rect = [cx-6, cy-2, cx+6, cy+8]
            draw.rectangle(door_rect, outline=color, width=1)
            
            # 窗户
            window_rect = [cx-12, cy-4, cx-4, cy+4]
            draw.rectangle(window_rect, outline=color, width=1)
            window_rect2 = [cx+4, cy-4, cx+12, cy+4]
            draw.rectangle(window_rect2, outline=color, width=1)
    
    def draw_discover_icon(self, draw, color, is_filled=False):
        """绘制精美的发现/指南针图标"""
        cx, cy = self.center
        
        if is_filled:
            # 填充版本
            # 外圆
            draw.ellipse([cx-20, cy-20, cx+20, cy+20], fill=color)
            
            # 内圆
            draw.ellipse([cx-16, cy-16, cx+16, cy+16], fill=(255, 255, 255, 200))
            
            # 指针
            draw.polygon([(cx, cy-12), (cx-4, cy+8), (cx+4, cy+8)], fill=color)
            
            # 中心点
            draw.ellipse([cx-2, cy-2, cx+2, cy+2], fill=color)
        else:
            # 线框版本
            # 外圆
            draw.ellipse([cx-20, cy-20, cx+20, cy+20], outline=color, width=2)
            
            # 内圆
            draw.ellipse([cx-16, cy-16, cx+16, cy+16], outline=color, width=1)
            
            # 指针
            draw.polygon([(cx, cy-12), (cx-4, cy+8), (cx+4, cy+8)], fill=color)
            
            # 中心点
            draw.ellipse([cx-2, cy-2, cx+2, cy+2], fill=color)
    
    def draw_friends_icon(self, draw, color, is_filled=False):
        """绘制精美的朋友/社交图标"""
        cx, cy = self.center
        
        if is_filled:
            # 填充版本 - 双人设计
            # 左侧人物
            draw.ellipse([cx-18, cy-12, cx-6, cy+4], fill=color)  # 头
            draw.ellipse([cx-16, cy+4, cx-8, cy+16], fill=color)  # 身体
            
            # 右侧人物
            draw.ellipse([cx+6, cy-12, cx+18, cy+4], fill=color)  # 头
            draw.ellipse([cx+8, cy+4, cx+16, cy+16], fill=color)  # 身体
            
            # 连接线
            draw.line([(cx-2, cy), (cx+2, cy)], fill=color, width=3)
        else:
            # 线框版本
            # 左侧人物
            draw.ellipse([cx-18, cy-12, cx-6, cy+4], outline=color, width=2)  # 头
            draw.ellipse([cx-16, cy+4, cx-8, cy+16], outline=color, width=2)  # 身体
            
            # 右侧人物
            draw.ellipse([cx+6, cy-12, cx+18, cy+4], outline=color, width=2)  # 头
            draw.ellipse([cx+8, cy+4, cx+16, cy+16], outline=color, width=2)  # 身体
            
            # 连接线
            draw.line([(cx-2, cy), (cx+2, cy)], fill=color, width=2)
    
    def draw_profile_icon(self, draw, color, is_filled=False):
        """绘制精美的个人资料图标"""
        cx, cy = self.center
        
        if is_filled:
            # 填充版本
            # 头部
            draw.ellipse([cx-12, cy-16, cx+12, cy+4], fill=color)
            
            # 身体
            draw.ellipse([cx-16, cy+4, cx+16, cy+20], fill=color)
            
            # 装饰点
            draw.ellipse([cx-4, cy-8, cx+4, cy], fill=(255, 255, 255, 200))
        else:
            # 线框版本
            # 头部
            draw.ellipse([cx-12, cy-16, cx+12, cy+4], outline=color, width=2)
            
            # 身体
            draw.ellipse([cx-16, cy+4, cx+16, cy+20], outline=color, width=2)
            
            # 装饰点
            draw.ellipse([cx-4, cy-8, cx+4, cy], fill=color)
    
    def draw_grid_icon(self, draw, color, is_filled=False):
        """绘制精美的工作台/网格图标"""
        cx, cy = self.center
        
        if is_filled:
            # 填充版本 - 九宫格设计
            grid_size = 8
            for i in range(3):
                for j in range(3):
                    x = cx - 12 + i * grid_size
                    y = cy - 12 + j * grid_size
                    draw.rectangle([x, y, x+6, y+6], fill=color)
        else:
            # 线框版本
            # 外框
            draw.rectangle([cx-16, cy-16, cx+16, cy+16], outline=color, width=2)
            
            # 垂直线
            draw.line([(cx-5, cy-16), (cx-5, cy+16)], fill=color, width=1)
            draw.line([(cx+5, cy-16), (cx+5, cy+16)], fill=color, width=1)
            
            # 水平线
            draw.line([(cx-16, cy-5), (cx+16, cy-5)], fill=color, width=1)
            draw.line([(cx-16, cy+5), (cx+16, cy+5)], fill=color, width=1)
    
    def draw_account_icon(self, draw, color, is_filled=False):
        """绘制精美的账户/用户图标"""
        cx, cy = self.center
        
        if is_filled:
            # 填充版本 - 带齿轮的账户图标
            # 头部
            draw.ellipse([cx-10, cy-14, cx+10, cy+6], fill=color)
            
            # 身体
            draw.ellipse([cx-12, cy+6, cx+12, cy+18], fill=color)
            
            # 齿轮装饰
            gear_radius = 6
            for i in range(8):
                angle = i * math.pi / 4
                x = cx + 20 * math.cos(angle)
                y = cy - 20 * math.sin(angle)
                draw.ellipse([x-2, y-2, x+2, y+2], fill=color)
        else:
            # 线框版本
            # 头部
            draw.ellipse([cx-10, cy-14, cx+10, cy+6], outline=color, width=2)
            
            # 身体
            draw.ellipse([cx-12, cy+6, cx+12, cy+18], outline=color, width=2)
            
            # 齿轮装饰
            gear_radius = 6
            for i in range(8):
                angle = i * math.pi / 4
                x = cx + 20 * math.cos(angle)
                y = cy - 20 * math.sin(angle)
                draw.ellipse([x-2, y-2, x+2, y+2], fill=color)
    
    def create_icon(self, icon_type, color, save_path, is_filled=False):
        """创建单个图标"""
        # 创建透明背景
        img = Image.new('RGBA', self.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # 转换颜色
        if isinstance(color, str) and color.startswith('#'):
            color = tuple(int(color[i:i+2], 16) for i in (1, 3, 5))
        
        # 根据图标类型绘制
        if icon_type == 'home':
            self.draw_home_icon(draw, color, is_filled)
        elif icon_type == 'discover':
            self.draw_discover_icon(draw, color, is_filled)
        elif icon_type == 'friends':
            self.draw_friends_icon(draw, color, is_filled)
        elif icon_type == 'profile':
            self.draw_profile_icon(draw, color, is_filled)
        elif icon_type == 'grid':
            self.draw_grid_icon(draw, color, is_filled)
        elif icon_type == 'account':
            self.draw_account_icon(draw, color, is_filled)
        
        # 保存图标
        img.save(save_path, 'PNG')
        print(f"✓ 创建精美图标: {save_path}")
    
    def create_all_tabbar_icons(self):
        """创建所有TabBar图标"""
        print("🎨 开始设计精美TabBar图标...")
        
        # 创建目录
        self.create_directory(f"{self.base_path}/tabbar")
        
        # 图标配置 - 使用更现代的颜色
        icons_config = [
            # 主要TabBar图标
            {
                'name': 'home',
                'path': f'{self.base_path}/tabbar/home.png',
                'color': '#BFBFBF',
                'type': 'home'
            },
            {
                'name': 'home-fill',
                'path': f'{self.base_path}/tabbar/home-fill.png',
                'color': '#7363FF',
                'type': 'home',
                'filled': True
            },
            {
                'name': 'discover',
                'path': f'{self.base_path}/tabbar/discover.png',
                'color': '#BFBFBF',
                'type': 'discover'
            },
            {
                'name': 'discover-fill',
                'path': f'{self.base_path}/tabbar/discover-fill.png',
                'color': '#7363FF',
                'type': 'discover',
                'filled': True
            },
            {
                'name': 'friends',
                'path': f'{self.base_path}/tabbar/friends.png',
                'color': '#BFBFBF',
                'type': 'friends'
            },
            {
                'name': 'friends-fill',
                'path': f'{self.base_path}/tabbar/friends-fill.png',
                'color': '#7363FF',
                'type': 'friends',
                'filled': True
            },
            {
                'name': 'profile',
                'path': f'{self.base_path}/tabbar/profile.png',
                'color': '#BFBFBF',
                'type': 'profile'
            },
            {
                'name': 'profile-fill',
                'path': f'{self.base_path}/tabbar/profile-fill.png',
                'color': '#7363FF',
                'type': 'profile',
                'filled': True
            },
            # 工作台图标
            {
                'name': 'grid',
                'path': f'{self.base_path}/tabbar/grid.png',
                'color': '#BFBFBF',
                'type': 'grid'
            },
            {
                'name': 'grid-fill',
                'path': f'{self.base_path}/tabbar/grid-fill.png',
                'color': '#7363FF',
                'type': 'grid',
                'filled': True
            },
            {
                'name': 'account',
                'path': f'{self.base_path}/tabbar/account.png',
                'color': '#BFBFBF',
                'type': 'account'
            },
            {
                'name': 'account-fill',
                'path': f'{self.base_path}/tabbar/account-fill.png',
                'color': '#7363FF',
                'type': 'account',
                'filled': True
            }
        ]
        
        # 生成图标
        success_count = 0
        for icon in icons_config:
            try:
                is_filled = icon.get('filled', False)
                self.create_icon(
                    icon['type'], 
                    icon['color'], 
                    icon['path'], 
                    is_filled
                )
                success_count += 1
            except Exception as e:
                print(f"✗ 创建图标失败 {icon['name']}: {e}")
        
        print(f"\n🎨 精美TabBar图标设计完成！成功: {success_count}/{len(icons_config)}")
        print("✨ 图标特点：")
        print("   • 现代化设计风格")
        print("   • 清晰的视觉层次")
        print("   • 优雅的线条和形状")
        print("   • 完美的激活状态对比")
        print("   • 符合Material Design规范")
        print("\n📱 使用方法：")
        print('<image src=\"/static/icons/tabbar/home.png\" class=\"tab-icon\" />')
        print('<image src=\"/static/icons/tabbar/home-fill.png\" class=\"tab-icon\" />')

def main():
    """主函数"""
    designer = TabBarIconDesigner()
    designer.create_all_tabbar_icons()

if __name__ == "__main__":
    main() 