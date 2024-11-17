import { SchemaType } from "@google/generative-ai";
import { ChartType as ChartJSType } from 'chart.js'

// 图表类型定义
export type ChartType = ChartJSType;

// 数据点结构
export interface DataPoint {
  x: string | number;
  y: number;
}

// 数据系列结构
export interface Series {
  name: string;
  data: DataPoint[];
}

// 图表数据结构
export interface ChartData {
  series: Series[];
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}

// 图表样式配置
export interface ChartStyle {
  theme: string;
  backgroundColor: string;
  primaryColor: string;
  secondaryColors: string[];
  fontFamily: string;
  fontSize: number;
  showLegend: boolean;
  showGrid: boolean;
  animation: boolean;
}

// AI 分析结果
export interface ChartAnalysis {
  chartType: ChartType;
  data: ChartData;
  style: ChartStyle;
  insights: string[];
  //recommendations: string[];
}

// Google AI Schema
export const chartAISchema = {
  type: SchemaType.OBJECT,
  properties: {
    chartType: {
      type: SchemaType.STRING,
      enum: ['line', 'bar', 'pie', 'scatter'],
      description: "推荐的图表类型"
    },
    data: {
      type: SchemaType.OBJECT,
      properties: {
        series: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              name: { type: SchemaType.STRING },
              data: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.OBJECT,
                  properties: {
                    x: { type: SchemaType.STRING },
                    y: { type: SchemaType.NUMBER }
                  },
                  required: ["x", "y"]
                }
              }
            },
            required: ["name", "data"]
          },
          description: "数据系列，可能多个维度"
        },
        title: { type: SchemaType.STRING },
        xAxisLabel: { type: SchemaType.STRING },
        yAxisLabel: { type: SchemaType.STRING }
      },
      required: ["series"]
    },
    style: {
      type: SchemaType.OBJECT,
      properties: {
        theme: { type: SchemaType.STRING },
        backgroundColor: { type: SchemaType.STRING },
        primaryColor: { type: SchemaType.STRING },
        secondaryColors: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING }
        },
        fontFamily: { type: SchemaType.STRING },
        fontSize: { type: SchemaType.NUMBER },
        showLegend: { type: SchemaType.BOOLEAN },
        showGrid: { type: SchemaType.BOOLEAN },
        animation: { type: SchemaType.BOOLEAN }
      },
      required: ["theme", "backgroundColor", "primaryColor", "secondaryColors", "fontFamily", "fontSize", "showLegend", "showGrid", "animation"]
    },
    insights: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING }
    }
  },
  required: ["chartType", "data", "style"]
};

export interface ChartAnalysisRequest {
  text: string;
  chartType: ChartType;
  useSmall?: boolean;
}

import { z } from 'zod';

export const ChartOpenAISchema = z.object({
  chartType: z.enum(['line', 'bar', 'pie', 'scatter']),
  
  data: z.object({
    series: z.array(z.object({
      name: z.string(),
      data: z.array(z.object({
        x: z.string(),
        y: z.number()
      }))
    })).describe("数据系列，可能多个维度"), 
    title: z.string(),
    xAxisLabel: z.string(),
    yAxisLabel: z.string()
  }).required().describe("数据，包括series, title, xAxisLabel, yAxisLabel"),

  style: z.object({
    theme: z.string(),
    backgroundColor: z.string(),
    primaryColor: z.string(),
    secondaryColors: z.array(z.string()),
    fontFamily: z.enum([
      'serif',
      'sans-serif',
      'monospace',
      'serif-cn',
      'sans-cn',
      'kai-cn'
    ]),
    fontSize: z.number(),
    showLegend: z.boolean(),
    showGrid: z.boolean(),
    animation: z.boolean()
  }).required(),
  
  insights: z.array(z.string()).optional()
}).required();