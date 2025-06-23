#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
创建通用图标
"""

import os
from PIL import Image, ImageDraw

def create_arrow_left_icon(size=(64, 64), color="#666666"):
    """创建左箭头图标"""
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 箭头路径点
    points = [
        (40, 16),  # 右上
        (32, 16),  # 左上角
        (24, 32),  # 左中心（箭头尖）
        (32, 48),  # 左下角
        (40, 48),  # 右下
        (36, 32),  # 右中心
    ]
    
    # 绘制箭头
    draw.polygon(points, fill=color)
    
    return img

def create_logo_icon(size=(64, 64)):
    """创建Logo图标"""
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 绘制心形Logo
    # 左半心
    draw.ellipse([16, 20, 32, 36], fill="white")
    # 右半心
    draw.ellipse([32, 20, 48, 36], fill="white")
    # 下半部分
    draw.polygon([(24, 36), (40, 36), (32, 48)], fill="white")
    
    return img

def main():
    """主函数"""
    # 创建左箭头图标
    print("创建左箭头图标...")
    arrow_left = create_arrow_left_icon()
    arrow_left.save("static/icons/common/arrow-left.png", "PNG")
    print("已保存: static/icons/common/arrow-left.png")
    
    # 创建Logo
    print("创建Logo...")
    logo = create_logo_icon()
    logo.save("static/logo.png", "PNG")
    print("已保存: static/logo.png")
    
    print("通用图标创建完成！")

if __name__ == "__main__":
    main() 