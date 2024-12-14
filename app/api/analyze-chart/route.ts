import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { chartAISchema, ChartAnalysis } from '../../types/chart';
import { getChartAnalysisPrompt } from './prompt';

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GOOGLE_API_KEY_ALT 
      ? Math.random() > 0.5 
        ? process.env.GOOGLE_API_KEY!
        : process.env.GOOGLE_API_KEY_ALT
      : process.env.GOOGLE_API_KEY!;
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const { text, chartType, useSmall = false } = await request.json();
    const model = genAI.getGenerativeModel({
      model: useSmall ? "gemini-1.5-flash-8b" : "gemini-2.0-flash-exp",
      systemInstruction: "你是一个出色的数据分析师与图表设计师，严禁编造不存在的数据",
      generationConfig: {
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
        responseSchema: chartAISchema,
      },
    });

    const prompt = getChartAnalysisPrompt(chartType, text);

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
