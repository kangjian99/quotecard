import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { chartAISchema, ChartAnalysis, DataPoint } from '../../types/chart';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY_ALT 
      ? Math.random() > 0.5 
        ? process.env.GOOGLE_API_KEY!
        : process.env.GOOGLE_API_KEY_ALT
      : process.env.GOOGLE_API_KEY!;
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const { text, chartType } = await request.json();
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: "你是一个出色的数据分析师与图表设计师",
      generationConfig: {
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseSchema: chartAISchema,
      },
    });

    const prompt = `分析用户提供内容中的数据并生成图表配置方案，要求如下:

期望图表类型为: ${chartType || '自动推荐'}

请分析数据特征并提供:
1. 最适合的图表类型和配置
2. 数据处理建议
3. 视觉样式方案
4. 关键数据洞察
5. 图表优化建议

要求:
- 根据数据特征选择合适的图表类型
- 提供清晰的数据标签和图例
- 选择协调的配色方案
- 确保图表可读性和美观性
- 突出关键数据特征和趋势

用户提供内容:
${text}
`;

    const result = await model.generateContent(prompt);
    const response = JSON.parse(result.response.text()) as ChartAnalysis;
    console.log(response);
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      chartType: 'line',
      data: {
        series: [],
        title: '数据图表',
        xAxisLabel: 'X轴',
        yAxisLabel: 'Y轴'
      },
      style: {
        theme: 'default',
        backgroundColor: '#ffffff',
        primaryColor: '#4A90E2',
        secondaryColors: ['#F5A623', '#50E3C2', '#FF5A5F'],
        fontFamily: 'sans-serif',
        fontSize: 14,
        showLegend: true,
        showGrid: true,
        animation: true
      },
      insights: ['暂无数据分析'],
      recommendations: ['请提供有效的数据']
    });
  }
}
