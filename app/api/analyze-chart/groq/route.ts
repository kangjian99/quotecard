import { NextResponse } from 'next/server';
import { ChartOpenAISchema } from '../../../types/chart';
import { getChartAnalysisPrompt } from '../prompt';
import { ChatGroq } from "@langchain/groq";

export async function POST(request: Request) {
  try {
    const { text, chartType, useSmall = false } = await request.json();

    const prompt = getChartAnalysisPrompt(chartType, text);
    const chosenModel = useSmall ? "gemma2-9b-it" : "llama-3.2-90b-text-preview";
    const model = new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: chosenModel,
      // temperature: 0
    });
    const structuredLlm = model.withStructuredOutput(ChartOpenAISchema, { name: "chartConfig" });
    const completion = await structuredLlm.invoke(prompt);

    console.log(completion);
    return NextResponse.json(completion);
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
