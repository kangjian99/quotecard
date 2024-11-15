import { z } from 'zod';
import { SchemaType } from "@google/generative-ai";

// 定义颜色方案的 schema
const ColorScheme = z.object({
  primary: z.string(),
  secondary: z.string(),
  textColor: z.string(),
});

// 定义完整的样式配置 schema
export const StyleConfigSchema = z.object({
  theme: z.enum(['scientific', 'literary', 'philosophical', 'inspirational', 'poetic', 'artistic']),
  colorScheme: ColorScheme,
  iconStyle: z.string(),
  fontSize: z.enum(['sm', 'base', 'lg', 'xl', '2xl']),
  mood: z.string(),
  emphasis: z.array(z.string()),
  fontFamily: z.enum([
    'serif-cn',
    //'sans-cn',
    //'classic-cn',
    //'modern-cn',
    'elegant-cn',
    'kai-cn',
  ]),
});

// 导出类型
export type StyleConfig = z.infer<typeof StyleConfigSchema>;

// 为 Google AI 添加 schema 定义
export const googleAISchema = {
  type: SchemaType.OBJECT,
  properties: {
    theme: {
      type: SchemaType.STRING,
      enum: ['scientific', 'literary', 'philosophical', 'inspirational', 'poetic', 'artistic'],
      description: "文本的主题风格"
    },
    colorScheme: {
      type: SchemaType.OBJECT,
      properties: {
        primary: { type: SchemaType.STRING, description: "主要颜色，格式为HEX，避免用红色" },
        secondary: { type: SchemaType.STRING, description: "次要颜色，格式为HEX" },
        textColor: { type: SchemaType.STRING, description: "文本颜色，格式为HEX" }
      },
      required: ["primary", "secondary", "textColor"]
    },
    iconStyle: { type: SchemaType.STRING, description: "图标风格" },
    fontSize: {
      type: SchemaType.STRING,
      enum: ['sm', 'base'],
      description: "字体大小"
    },
    mood: { type: SchemaType.STRING, description: "情感基调" },
    emphasis: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
      description: "需要强调的元素"
    },
    fontFamily: {
      type: SchemaType.STRING,
      enum: ['serif-cn', 'elegant-cn', 'kai-cn'],
      description: "字体系列"
    }
  },
  required: ["theme", "colorScheme", "iconStyle", "fontSize", "mood", "emphasis", "fontFamily"]
}; 