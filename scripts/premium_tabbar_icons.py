#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
高级TabBar图标设计脚本
包含渐变、阴影、光效等高级设计元素
"""

import os
from PIL import Image, ImageDraw, ImageFilter
import math

class PremiumTabBarDesigner:
    def __init__(self, base_path="../static/icons"):
        self.base_path = base_path
        self.size = (64, 64)
        self.center = (32, 32)
        
    def create_directory(self, path):
        """创建目录"""
        if not os.path.exists(path):
            os.makedirs(path)
            print(f"✓ 创建目录: {path}")
    
    def create_gradient_icon(self, icon_type, color, save_path, is_filled=False):
        """创建带渐变效果的图标"""
        # 创建主图像
        img = Image.new('RGBA', self.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # 转换颜色
        if isinstance(color, str) and color.startswith('#'):
            color = tuple(int(color[i:i+2], 16) for i in (1, 3, 5))
        
        # 创建渐变背景
        if is_filled:
            self.create_gradient_background(draw, color)
        
        # 绘制图标
        self.draw_premium_icon(draw, icon_type, color, is_filled)
        
        # 添加光效
        if is_filled:
            self.add_glow_effect(img, color)
        
        # 保存图标
        img.save(save_path, 'PNG')
        print(f"✨ 创建高级图标: {save_path}")
    
    def create_gradient_background(self, draw, color):
        """创建渐变背景"""
        cx, cy = self.center
        
        # 创建径向渐变效果
        for i in range(20):
            radius = 20 - i
            alpha = int(255 * (1 - i/20) * 0.3)
            if alpha > 0:
                draw.ellipse([cx-radius, cy-radius, cx+radius, cy+radius], 
                           fill=(color[0], color[1], color[2], alpha))
    
    def add_glow_effect(self, img, color):
        """添加发光效果"""
        # 创建发光层
        glow = Image.new('RGBA', self.size, (0, 0, 0, 0))
        glow_draw = ImageDraw.Draw(glow)
        
        # 绘制发光
        cx, cy = self.center
        for i in range(3):
            radius = 28 + i * 2
            alpha = int(100 * (1 - i/3))
            if alpha > 0:
                glow_draw.ellipse([cx-radius, cy-radius, cx+radius, cy+radius], 
                                fill=(color[0], color[1], color[2], alpha))
        
        # 模糊发光层
        glow = glow.filter(ImageFilter.GaussianBlur(radius=2))
        
        # 合并到主图像
        img.paste(glow, (0, 0), glow)
    
    def draw_premium_icon(self, draw, icon_type, color, is_filled):
        """绘制高级图标"""
        cx, cy = self.center
        
        if icon_type == 'home':
            self.draw_premium_home(draw, color, is_filled)
        elif icon_type == 'discover':
            self.draw_premium_discover(draw, color, is_filled)
        elif icon_type == 'friends':
            self.draw_premium_friends(draw, color, is_filled)
        elif icon_type == 'profile':
            self.draw_premium_profile(draw, color, is_filled)
        elif icon_type == 'grid':
            self.draw_premium_grid(draw, color, is_filled)
        elif icon_type == 'account':
            self.draw_premium_account(draw, color, is_filled)
    
    def draw_premium_home(self, draw, color, is_filled):
        """绘制高级房子图标"""
        cx, cy = self.center
        
        if is_filled:
            # 屋顶 - 带渐变效果
            roof_points = [(cx-18, cy-8), (cx, cy-20), (cx+18, cy-8)]
            draw.polygon(roof_points, fill=color)
            
            # 房身
            house_body = [(cx-16, cy+8), (cx-16, cy-8), (cx+16, cy-8), (cx+16, cy+8)]
            draw.polygon(house_body, fill=color)
            
            # 门 - 带高光
            door_points = [(cx-6, cy+8), (cx-6, cy-2), (cx+6, cy-2), (cx+6, cy+8)]
            draw.polygon(door_points, fill=(255, 255, 255, 180))
            
            # 窗户 - 带高光
            window_rect = [cx-12, cy-4, cx-4, cy+4]
            draw.rectangle(window_rect, fill=(255, 255, 255, 180))
            window_rect2 = [cx+4, cy-4, cx+12, cy+4]
            draw.rectangle(window_rect2, fill=(255, 255, 255, 180))
            
            # 门把手
            draw.ellipse([cx+2, cy+2, cx+4, cy+4], fill=color)
        else:
            # 线框版本 - 更精细的线条
            # 房身
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
    
    def draw_premium_discover(self, draw, color, is_filled):
        """绘制高级发现图标"""
        cx, cy = self.center
        
        if is_filled:
            # 外圆 - 带渐变
            draw.ellipse([cx-20, cy-20, cx+20, cy+20], fill=color)
            
            # 内圆 - 高光效果
            draw.ellipse([cx-16, cy-16, cx+16, cy+16], fill=(255, 255, 255, 200))
            
            # 指针 - 立体效果
            draw.polygon([(cx, cy-12), (cx-4, cy+8), (cx+4, cy+8)], fill=color)
            
            # 中心点 - 高光
            draw.ellipse([cx-2, cy-2, cx+2, cy+2], fill=color)
            
            # 装饰点
            for i in range(4):
                angle = i * math.pi / 2
                x = cx + 14 * math.cos(angle)
                y = cy + 14 * math.sin(angle)
                draw.ellipse([x-1, y-1, x+1, y+1], fill=color)
        else:
            # 线框版本
            draw.ellipse([cx-20, cy-20, cx+20, cy+20], outline=color, width=2)
            draw.ellipse([cx-16, cy-16, cx+16, cy+16], outline=color, width=1)
            draw.polygon([(cx, cy-12), (cx-4, cy+8), (cx+4, cy+8)], fill=color)
            draw.ellipse([cx-2, cy-2, cx+2, cy+2], fill=color)
    
    def draw_premium_friends(self, draw, color, is_filled):
        """绘制高级朋友图标"""
        cx, cy = self.center
        
        if is_filled:
            # 左侧人物
            draw.ellipse([cx-18, cy-12, cx-6, cy+4], fill=color)  # 头
            draw.ellipse([cx-16, cy+4, cx-8, cy+16], fill=color)  # 身体
            
            # 右侧人物
            draw.ellipse([cx+6, cy-12, cx+18, cy+4], fill=color)  # 头
            draw.ellipse([cx+8, cy+4, cx+16, cy+16], fill=color)  # 身体
            
            # 连接线 - 带渐变
            draw.line([(cx-2, cy), (cx+2, cy)], fill=color, width=3)
            
            # 装饰点
            draw.ellipse([cx-1, cy-1, cx+1, cy+1], fill=(255, 255, 255, 200))
        else:
            # 线框版本
            draw.ellipse([cx-18, cy-12, cx-6, cy+4], outline=color, width=2)
            draw.ellipse([cx-16, cy+4, cx-8, cy+16], outline=color, width=2)
            draw.ellipse([cx+6, cy-12, cx+18, cy+4], outline=color, width=2)
            draw.ellipse([cx+8, cy+4, cx+16, cy+16], outline=color, width=2)
            draw.line([(cx-2, cy), (cx+2, cy)], fill=color, width=2)
    
    def draw_premium_profile(self, draw, color, is_filled):
        """绘制高级个人资料图标"""
        cx, cy = self.center
        
        if is_filled:
            # 头部 - 带高光
            draw.ellipse([cx-12, cy-16, cx+12, cy+4], fill=color)
            draw.ellipse([cx-8, cy-12, cx+8, cy-4], fill=(255, 255, 255, 100))
            
            # 身体
            draw.ellipse([cx-16, cy+4, cx+16, cy+20], fill=color)
            
            # 装饰点 - 立体效果
            draw.ellipse([cx-4, cy-8, cx+4, cy], fill=(255, 255, 255, 200))
        else:
            # 线框版本
            draw.ellipse([cx-12, cy-16, cx+12, cy+4], outline=color, width=2)
            draw.ellipse([cx-16, cy+4, cx+16, cy+20], outline=color, width=2)
            draw.ellipse([cx-4, cy-8, cx+4, cy], fill=color)
    
    def draw_premium_grid(self, draw, color, is_filled):
        """绘制高级网格图标"""
        cx, cy = self.center
        
        if is_filled:
            # 九宫格 - 带立体效果
            grid_size = 8
            for i in range(3):
                for j in range(3):
                    x = cx - 12 + i * grid_size
                    y = cy - 12 + j * grid_size
                    # 主体
                    draw.rectangle([x, y, x+6, y+6], fill=color)
                    # 高光
                    draw.rectangle([x, y, x+6, y+2], fill=(255, 255, 255, 100))
        else:
            # 线框版本
            draw.rectangle([cx-16, cy-16, cx+16, cy+16], outline=color, width=2)
            draw.line([(cx-5, cy-16), (cx-5, cy+16)], fill=color, width=1)
            draw.line([(cx+5, cy-16), (cx+5, cy+16)], fill=color, width=1)
            draw.line([(cx-16, cy-5), (cx+16, cy-5)], fill=color, width=1)
            draw.line([(cx-16, cy+5), (cx+16, cy+5)], fill=color, width=1)
    
    def draw_premium_account(self, draw, color, is_filled):
        """绘制高级账户图标"""
        cx, cy = self.center
        
        if is_filled:
            # 头部
            draw.ellipse([cx-10, cy-14, cx+10, cy+6], fill=color)
            
            # 身体
            draw.ellipse([cx-12, cy+6, cx+12, cy+18], fill=color)
            
            # 齿轮装饰 - 更精细
            for i in range(8):
                angle = i * math.pi / 4
                x = cx + 20 * math.cos(angle)
                y = cy - 20 * math.sin(angle)
                draw.ellipse([x-2, y-2, x+2, y+2], fill=color)
            
            # 中心装饰
            draw.ellipse([cx-3, cy-3, cx+3, cy+3], fill=(255, 255, 255, 200))
        else:
            # 线框版本
            draw.ellipse([cx-10, cy-14, cx+10, cy+6], outline=color, width=2)
            draw.ellipse([cx-12, cy+6, cx+12, cy+18], outline=color, width=2)
            for i in range(8):
                angle = i * math.pi / 4
                x = cx + 20 * math.cos(angle)
                y = cy - 20 * math.sin(angle)
                draw.ellipse([x-2, y-2, x+2, y+2], fill=color)
    
    def create_all_premium_icons(self):
        """创建所有高级TabBar图标"""
        print("🌟 开始设计高级TabBar图标...")
        
        # 创建目录
        self.create_directory(f"{self.base_path}/tabbar")
        
        # 图标配置
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
                self.create_gradient_icon(
                    icon['type'], 
                    icon['color'], 
                    icon['path'], 
                    is_filled
                )
                success_count += 1
            except Exception as e:
                print(f"✗ 创建图标失败 {icon['name']}: {e}")
        
        print(f"\n🌟 高级TabBar图标设计完成！成功: {success_count}/{len(icons_config)}")
        print("✨ 高级设计特点：")
        print("   • 渐变背景效果")
        print("   • 发光和阴影效果")
        print("   • 立体感和高光")
        print("   • 精细的线条处理")
        print("   • 现代化的视觉层次")
        print("\n📱 使用方法：")
        print('<image src=\"/static/icons/tabbar/home.png\" class=\"tab-icon\" />')
        print('<image src=\"/static/icons/tabbar/home-fill.png\" class=\"tab-icon\" />')

def main():
    """主函数"""
    designer = PremiumTabBarDesigner()
    designer.create_all_premium_icons()

if __name__ == "__main__":
    main() 