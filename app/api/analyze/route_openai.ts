import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { zodResponseFormat } from 'openai/helpers/zod';
import { StyleConfigSchema } from '@/app/types/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 注意这里不需要 NEXT_PUBLIC_ 前缀
  //baseURL: "https://burn.hair/v1"
});

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You analyze text style and content to provide visual design parameters in JSON format." 
        },
        {
          role: "user",
          content: `分析这段文字的风格和内容，并提供合适的视觉设计参数：${text}`
        },
      ],
      response_format: zodResponseFormat(StyleConfigSchema, 'styleConfig'),
    });
    console.log(completion.choices[0].message.parsed);
    return NextResponse.json(completion.choices[0].message.parsed);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({
      theme: "literary",
      colorScheme: {
        primary: "#4A90E2",
        secondary: "#F5A623",
        textColor: "text-gray-700"
      },
      iconStyle: "minimal",
      fontSize: "base",
      mood: "neutral",
      emphasis: [],
      fontFamily: "modern-cn"
    });
  }
} 