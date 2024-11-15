import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from 'next/server';
import { googleAISchema } from '@/app/types/types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: googleAISchema,
      },
    });

    const result = await model.generateContent(
      `分析这段文字的风格和内容，并提供合适的视觉设计参数：${text}`
    );
    
    const response = JSON.parse(result.response.text());
    console.log(response);
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      theme: "literary",
      colorScheme: {
        primary: "#7A645C",
        secondary: "#978A85",
        textColor: "text-gray-700"
      },
      iconStyle: "minimal",
      fontSize: "base",
      mood: "neutral",
      emphasis: [],
      fontFamily: "elegant-cn"
    });
  }
} 