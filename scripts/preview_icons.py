#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
TabBar图标预览脚本
展示设计的精美图标效果
"""

import os
from PIL import Image, ImageDraw, ImageFont

def create_preview():
    """创建图标预览图"""
    print("🎨 创建TabBar图标预览...")
    
    # 图标列表
    icons = [
        ('home', '首页'),
        ('discover', '发现'),
        ('friends', '友伴'),
        ('profile', '我的'),
        ('grid', '工作台'),
        ('account', '账户')
    ]
    
    # 创建预览图
    preview_width = 800
    preview_height = 400
    preview = Image.new('RGBA', (preview_width, preview_height), (255, 255, 255, 255))
    draw = ImageDraw.Draw(preview)
    
    # 标题
    try:
        font = ImageFont.truetype("/System/Library/Fonts/PingFang.ttc", 24)
    except:
        font = ImageFont.load_default()
    
    title = "随伴行 TabBar 图标设计"
    draw.text((20, 20), title, fill=(26, 26, 26), font=font)
    
    # 绘制图标
    x_start = 50
    y_start = 80
    icon_size = 64
    spacing = 120
    
    for i, (icon_name, icon_text) in enumerate(icons):
        x = x_start + (i % 3) * spacing
        y = y_start + (i // 3) * spacing
        
        # 加载图标
        normal_path = f"../static/icons/tabbar/{icon_name}.png"
        fill_path = f"../static/icons/tabbar/{icon_name}-fill.png"
        
        if os.path.exists(normal_path):
            normal_icon = Image.open(normal_path)
            preview.paste(normal_icon, (x, y), normal_icon)
        
        if os.path.exists(fill_path):
            fill_icon = Image.open(fill_path)
            preview.paste(fill_icon, (x + 80, y), fill_icon)
        
        # 添加文字说明
        draw.text((x, y + 70), f"{icon_text}", fill=(102, 102, 102), font=font)
        draw.text((x + 80, y + 70), f"{icon_text}(激活)", fill=(115, 99, 255), font=font)
    
    # 添加说明文字
    info_text = [
        "✨ 设计特点：",
        "• 现代化设计风格，符合Material Design规范",
        "• 清晰的视觉层次，优雅的线条和形状",
        "• 完美的激活状态对比，渐变和光效",
        "• 立体感和高光效果，提升视觉体验",
        "• 64x64像素，支持高分辨率显示"
    ]
    
    y_info = y_start + 280
    for i, text in enumerate(info_text):
        color = (115, 99, 255) if i == 0 else (102, 102, 102)
        draw.text((20, y_info + i * 25), text, fill=color, font=font)
    
    # 保存预览图
    preview_path = "../static/icons/tabbar/preview.png"
    preview.save(preview_path, 'PNG')
    print(f"✓ 预览图已保存: {preview_path}")
    
    # 显示图标信息
    print("\n📱 TabBar图标信息：")
    for icon_name, icon_text in icons:
        normal_path = f"../static/icons/tabbar/{icon_name}.png"
        fill_path = f"../static/icons/tabbar/{icon_name}-fill.png"
        
        normal_size = os.path.getsize(normal_path) if os.path.exists(normal_path) else 0
        fill_size = os.path.getsize(fill_path) if os.path.exists(fill_path) else 0
        
        print(f"  {icon_text}: {icon_name}.png ({normal_size}B) | {icon_name}-fill.png ({fill_size}B)")

if __name__ == "__main__":
    create_preview() 