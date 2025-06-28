#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
重新设计工作台图标脚本
专门为工作台功能设计更合适的图标
"""

import os
from PIL import Image, ImageDraw, ImageFilter
import math

class GridIconRedesigner:
    def __init__(self, base_path="../static/icons/tabbar"):
        self.base_path = base_path
        self.size = (64, 64)
        self.center = (32, 32)
        
    def create_directory(self, path):
        """创建目录"""
        if not os.path.exists(path):
            os.makedirs(path)
            print(f"✓ 创建目录: {path}")
    
    def draw_workbench_icon(self, draw, color, is_filled=False):
        """绘制工作台图标 - 更符合工作台功能"""
        cx, cy = self.center
        
        if is_filled:
            # 填充版本 - 工作台设计
            # 外框 - 工作台轮廓
            draw.rectangle([cx-20, cy-20, cx+20, cy+20], fill=color, outline=None)
            
            # 内框 - 工作区域
            draw.rectangle([cx-16, cy-16, cx+16, cy+16], fill=(255, 255, 255, 200))
            
            # 工具图标 - 左上角扳手
            self.draw_wrench(draw, cx-8, cy-8, color, 6)
            
            # 工具图标 - 右上角螺丝刀
            self.draw_screwdriver(draw, cx+8, cy-8, color, 6)
            
            # 工具图标 - 左下角锤子
            self.draw_hammer(draw, cx-8, cy+8, color, 6)
            
            # 工具图标 - 右下角齿轮
            self.draw_gear(draw, cx+8, cy+8, color, 6)
            
            # 中心装饰 - 小圆点
            draw.ellipse([cx-2, cy-2, cx+2, cy+2], fill=color)
            
        else:
            # 线框版本 - 工作台设计
            # 外框
            draw.rectangle([cx-20, cy-20, cx+20, cy+20], outline=color, width=2)
            
            # 内框
            draw.rectangle([cx-16, cy-16, cx+16, cy+16], outline=color, width=1)
            
            # 工具图标 - 左上角扳手
            self.draw_wrench(draw, cx-8, cy-8, color, 6, filled=False)
            
            # 工具图标 - 右上角螺丝刀
            self.draw_screwdriver(draw, cx+8, cy-8, color, 6, filled=False)
            
            # 工具图标 - 左下角锤子
            self.draw_hammer(draw, cx-8, cy+8, color, 6, filled=False)
            
            # 工具图标 - 右下角齿轮
            self.draw_gear(draw, cx+8, cy+8, color, 6, filled=False)
            
            # 中心装饰
            draw.ellipse([cx-2, cy-2, cx+2, cy+2], fill=color)
    
    def draw_wrench(self, draw, x, y, color, size, filled=True):
        """绘制扳手图标"""
        if filled:
            # 扳手头部
            draw.ellipse([x-size//2, y-size//2, x+size//2, y+size//2], fill=color)
            # 扳手手柄
            draw.rectangle([x-size//4, y-size//2, x+size//4, y+size//2+size//2], fill=color)
        else:
            # 线框版本
            draw.ellipse([x-size//2, y-size//2, x+size//2, y+size//2], outline=color, width=1)
            draw.rectangle([x-size//4, y-size//2, x+size//4, y+size//2+size//2], outline=color, width=1)
    
    def draw_screwdriver(self, draw, x, y, color, size, filled=True):
        """绘制螺丝刀图标"""
        if filled:
            # 螺丝刀头部
            draw.polygon([(x-size//2, y-size//2), (x+size//2, y-size//2), (x, y+size//2)], fill=color)
            # 螺丝刀手柄
            draw.rectangle([x-size//4, y-size//2, x+size//4, y+size//2], fill=color)
        else:
            # 线框版本
            draw.polygon([(x-size//2, y-size//2), (x+size//2, y-size//2), (x, y+size//2)], outline=color, width=1)
            draw.rectangle([x-size//4, y-size//2, x+size//4, y+size//2], outline=color, width=1)
    
    def draw_hammer(self, draw, x, y, color, size, filled=True):
        """绘制锤子图标"""
        if filled:
            # 锤子头部
            draw.rectangle([x-size//2, y-size//2, x+size//2, y+size//4], fill=color)
            # 锤子手柄
            draw.rectangle([x-size//6, y-size//4, x+size//6, y+size//2], fill=color)
        else:
            # 线框版本
            draw.rectangle([x-size//2, y-size//2, x+size//2, y+size//4], outline=color, width=1)
            draw.rectangle([x-size//6, y-size//4, x+size//6, y+size//2], outline=color, width=1)
    
    def draw_gear(self, draw, x, y, color, size, filled=True):
        """绘制齿轮图标"""
        if filled:
            # 齿轮中心
            draw.ellipse([x-size//3, y-size//3, x+size//3, y+size//3], fill=color)
            # 齿轮齿
            for i in range(6):
                angle = i * math.pi / 3
                gear_x = x + (size//2) * math.cos(angle)
                gear_y = y + (size//2) * math.sin(angle)
                draw.ellipse([gear_x-2, gear_y-2, gear_x+2, gear_y+2], fill=color)
        else:
            # 线框版本
            draw.ellipse([x-size//3, y-size//3, x+size//3, y+size//3], outline=color, width=1)
            for i in range(6):
                angle = i * math.pi / 3
                gear_x = x + (size//2) * math.cos(angle)
                gear_y = y + (size//2) * math.sin(angle)
                draw.ellipse([gear_x-2, gear_y-2, gear_x+2, gear_y+2], fill=color)
    
    def create_workbench_icon(self, color, save_path, is_filled=False):
        """创建工作台图标"""
        # 创建透明背景
        img = Image.new('RGBA', self.size, (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)
        
        # 转换颜色
        if isinstance(color, str) and color.startswith('#'):
            color = tuple(int(color[i:i+2], 16) for i in (1, 3, 5))
        
        # 创建渐变背景（仅激活状态）
        if is_filled:
            self.create_gradient_background(draw, color)
        
        # 绘制工作台图标
        self.draw_workbench_icon(draw, color, is_filled)
        
        # 添加光效（仅激活状态）
        if is_filled:
            self.add_glow_effect(img, color)
        
        # 保存图标
        img.save(save_path, 'PNG')
        print(f"🔧 创建工作台图标: {save_path}")
    
    def create_gradient_background(self, draw, color):
        """创建渐变背景"""
        cx, cy = self.center
        
        # 创建径向渐变效果
        for i in range(15):
            radius = 18 - i
            alpha = int(255 * (1 - i/15) * 0.3)
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
            radius = 26 + i * 2
            alpha = int(80 * (1 - i/3))
            if alpha > 0:
                glow_draw.ellipse([cx-radius, cy-radius, cx+radius, cy+radius], 
                                fill=(color[0], color[1], color[2], alpha))
        
        # 模糊发光层
        glow = glow.filter(ImageFilter.GaussianBlur(radius=1.5))
        
        # 合并到主图像
        img.paste(glow, (0, 0), glow)
    
    def create_workbench_icons(self):
        """创建工作台图标"""
        print("🔧 开始重新设计工作台图标...")
        
        # 创建目录
        self.create_directory(self.base_path)
        
        # 图标配置
        icons_config = [
            {
                'name': 'grid',
                'path': f'{self.base_path}/grid.png',
                'color': '#BFBFBF',
                'filled': False
            },
            {
                'name': 'grid-fill',
                'path': f'{self.base_path}/grid-fill.png',
                'color': '#7363FF',
                'filled': True
            }
        ]
        
        # 生成图标
        success_count = 0
        for icon in icons_config:
            try:
                self.create_workbench_icon(
                    icon['color'], 
                    icon['path'], 
                    icon['filled']
                )
                success_count += 1
            except Exception as e:
                print(f"✗ 创建图标失败 {icon['name']}: {e}")
        
        print(f"\n🔧 工作台图标重新设计完成！成功: {success_count}/{len(icons_config)}")
        print("✨ 新设计特点：")
        print("   • 工作台外框设计，更符合功能定位")
        print("   • 四种工具图标：扳手、螺丝刀、锤子、齿轮")
        print("   • 清晰的工具识别度")
        print("   • 保持与整体设计风格一致")
        print("   • 支持渐变和发光效果")

def main():
    """主函数"""
    designer = GridIconRedesigner()
    designer.create_workbench_icons()

if __name__ == "__main__":
    main() 