import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { googleAISchema } from '@/app/types/types_svg';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: Request) {
  try {
    const { text, renderMode } = await request.json();
    
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: "你是一个极有想象力的设计师和语言分析师",
      generationConfig: {
        temperature: 1.5,
        responseMimeType: "application/json",
        responseSchema: googleAISchema,
      },
    });

    const prompt = renderMode === 'geometric' 
      ? `请以极简主义设计师的视角分析这段文字，创造一个简洁典雅的Geometric abstraction风格设计方案。要求如下：

         视觉元素：
         • 灵活运用多样几何形状（圆、椭圆、方形、菱形、多边形、扇形、弧线）构建主视觉
         • 可叠加、切割、渐变、穿插等手法创造层次
         • 通过点、线、面的疏密变化营造韵律感
         • 巧妙融入螺旋、波浪、放射状等动态图形
         
         色彩规划：
         • 主色调需呼应文本的情感氛围
         • 搭配2-3个和谐的辅助色
         • 考虑明暗对比和色彩饱和度的变化
         • 可适当使用渐变或透明效果
         
         构图原则：
         • 遵循黄金分割或三分法则
         • 注重画面的呼吸感和留白
         • 确保视觉重心的平衡
         • 创造明确的视觉引导路径
         
         整体风格：
         • 保持克制与简约
         • 追求形式美与意境的统一
         • 让抽象设计与文本主题产生共鸣
         • 注重细节但避免过度装饰

         文本内容：${text}`
      : `分析这段文字的风格和内容，并提供合适的视觉设计参数：${text}`;

    const result = await model.generateContent(prompt);
    
    const response = JSON.parse(result.response.text());
    console.log(response);

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      theme: 'geometric',
      svgStyle: {
        backgroundColor: '#ffffff',
        primaryColor: '#4A90E2',
        secondaryColor: '#F5A623',
        patterns: []
      },
      typography: {
        fontFamily: 'elegant-cn',
        fontSize: 24,
        lineHeight: 1.5,
        textColor: '#333333'
      },
      explanation: '默认几何风格设计'
    });
  }
} 