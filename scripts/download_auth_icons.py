#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
下载认证相关图标并转换为PNG格式
"""

import requests
import os
from PIL import Image, ImageDraw
import io

def create_icon_png(icon_name, size=(64, 64), color="#666666"):
    """创建简单的图标PNG文件"""
    img = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # 根据图标名称绘制不同的图标
    if icon_name == "phone":
        # 绘制手机图标
        # 外框
        draw.rounded_rectangle([16, 8, 48, 56], radius=4, outline=color, width=2)
        # 屏幕
        draw.rounded_rectangle([20, 12, 44, 48], radius=2, fill=color)
        # Home键
        draw.ellipse([28, 50, 36, 58], fill=color)
        
    elif icon_name == "code":
        # 绘制验证码图标
        # 方框
        for i in range(4):
            x = 8 + i * 12
            draw.rounded_rectangle([x, 20, x+8, 44], radius=2, outline=color, width=2)
        # 分隔线
        for i in range(3):
            x = 20 + i * 12
            draw.line([x, 32, x+4, 32], fill=color, width=1)
            
    elif icon_name == "wechat":
        # 绘制微信图标
        # 大圆
        draw.ellipse([8, 16, 32, 40], outline=color, width=2)
        # 小圆
        draw.ellipse([24, 20, 44, 40], outline=color, width=2)
        # 眼睛
        draw.ellipse([14, 24, 18, 28], fill=color)
        draw.ellipse([22, 24, 26, 28], fill=color)
        draw.ellipse([30, 26, 34, 30], fill=color)
        draw.ellipse([36, 26, 40, 30], fill=color)
        
    elif icon_name == "qq":
        # 绘制QQ图标
        # 企鹅身体
        draw.ellipse([16, 24, 48, 56], outline=color, width=2)
        # 企鹅头
        draw.ellipse([20, 8, 44, 32], outline=color, width=2)
        # 眼睛
        draw.ellipse([24, 16, 28, 20], fill=color)
        draw.ellipse([36, 16, 40, 20], fill=color)
        # 嘴巴
        draw.arc([28, 20, 36, 28], 0, 180, fill=color, width=2)
        
    elif icon_name == "check":
        # 绘制复选框图标（未选中）
        draw.rounded_rectangle([16, 16, 48, 48], radius=4, outline=color, width=2)
        
    elif icon_name == "check-active":
        # 绘制复选框图标（已选中）
        draw.rounded_rectangle([16, 16, 48, 48], radius=4, fill="#7363FF", outline="#7363FF", width=2)
        # 对勾
        draw.line([24, 32, 28, 36], fill="white", width=3)
        draw.line([28, 36, 40, 24], fill="white", width=3)
        
    return img

def main():
    """主函数"""
    # 确保目录存在
    auth_dir = "static/icons/auth"
    os.makedirs(auth_dir, exist_ok=True)
    
    # 需要创建的图标列表
    icons = [
        "phone",      # 手机号图标
        "code",       # 验证码图标
        "wechat",     # 微信图标
        "qq",         # QQ图标
        "check",      # 复选框（未选中）
        "check-active"  # 复选框（已选中）
    ]
    
    # 创建图标
    for icon_name in icons:
        print(f"创建图标: {icon_name}")
        
        # 创建图标
        img = create_icon_png(icon_name)
        
        # 保存为PNG
        icon_path = os.path.join(auth_dir, f"{icon_name}.png")
        img.save(icon_path, "PNG")
        print(f"已保存: {icon_path}")
    
    print("所有认证图标创建完成！")

if __name__ == "__main__":
    main() 