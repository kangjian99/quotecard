import { SchemaType } from "@google/generative-ai";

// 为 Google AI 添加 schema 定义
export const googleAISchema = {
  type: SchemaType.OBJECT,
  properties: {
    theme: {
      type: SchemaType.STRING,
      enum: ['geometric', 'minimalist', 'constructivist', 'bauhaus', 'abstract'],
      description: "设计风格主题"
    },
    svgStyle: {
      type: SchemaType.OBJECT,
      properties: {
        backgroundColor: { type: SchemaType.STRING, description: "HEX格式背景色，如 #FFFFFF" },
        primaryColor: { type: SchemaType.STRING, description: "HEX格式主要图形色，如 #000000" },
        secondaryColor: { type: SchemaType.STRING, description: "HEX格式次要图形色，如 #FFFFFF" },
        patterns: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              type: { 
                type: SchemaType.STRING, 
                enum: ['circle', 'rect', 'line', 'polygon', 'path', 'ellipse', 'polyline', 'arc', 'spiral', 'wave'],
                description: "图形类型"
              },
              x: { type: SchemaType.NUMBER, description: "图形 x 坐标" },
              y: { type: SchemaType.NUMBER, description: "图形 y 坐标" },
              attributes: {
                type: SchemaType.OBJECT,
                properties: {
                  // 基础样式
                  fill: { type: SchemaType.STRING, description: "填充颜色" },
                  stroke: { type: SchemaType.STRING, description: "描边颜色" },
                  strokeWidth: { type: SchemaType.NUMBER, description: "描边宽度" },
                  opacity: { type: SchemaType.NUMBER, description: "透明度 0-1" },
                  
                  // circle 属性
                  r: { type: SchemaType.NUMBER, description: "圆的半径" },
                  cx: { type: SchemaType.NUMBER, description: "圆心x坐标" },
                  cy: { type: SchemaType.NUMBER, description: "圆心y坐标" },
                  
                  // ellipse 属性
                  rx: { type: SchemaType.NUMBER, description: "椭圆X轴半径" },
                  ry: { type: SchemaType.NUMBER, description: "椭圆Y轴半径" },
                  // rect 属性
                  width: { type: SchemaType.NUMBER, description: "矩形宽度" },
                  height: { type: SchemaType.NUMBER, description: "矩形高度" },
                  // line 属性
                  x2: { type: SchemaType.NUMBER, description: "线段终点x坐标" },
                  y2: { type: SchemaType.NUMBER, description: "线段终点y坐标" },
                  // polygon 和 polyline 属性
                  points: { type: SchemaType.STRING, description: "多边形或折线顶点坐标" },
                  // path 属性
                  d: { type: SchemaType.STRING, description: "SVG路径数据" },
                  // arc 属性
                  largearc: { type: SchemaType.BOOLEAN, description: "是否为大圆弧" },
                  sweep: { type: SchemaType.BOOLEAN, description: "圆弧方向" },
                  endx: { type: SchemaType.NUMBER, description: "圆弧终点x坐标" },
                  endy: { type: SchemaType.NUMBER, description: "圆弧终点y坐标" },
                  // spiral 属性
                  turns: { type: SchemaType.NUMBER, description: "螺旋圈数" },
                  spacing: { type: SchemaType.NUMBER, description: "螺旋间距" },
                  // wave 属性
                  amplitude: { type: SchemaType.NUMBER, description: "波浪振幅" },
                  frequency: { type: SchemaType.NUMBER, description: "波浪频率" },
                  wavewidth: { type: SchemaType.NUMBER, description: "波浪宽度" },
                  // 通用样式属性
                  transform: { type: SchemaType.STRING, description: "变换属性" },
                  // 渐变和效果
                  gradient: { 
                    type: SchemaType.OBJECT, 
                    properties: {
                      type: { type: SchemaType.STRING, enum: ['linear', 'radial'], description: "渐变类型" },
                      colors: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: "渐变颜色数组" },
                      stops: { type: SchemaType.ARRAY, items: { type: SchemaType.NUMBER }, description: "渐变停止点" }
                    }
                  },
                  filter: { type: SchemaType.STRING, description: "SVG滤镜效果" }
                },
                required: [
                  // 通用必需属性
                  "fill",
                  "stroke",
                  "strokeWidth",
                  "opacity"
                ],
                description: `必需的基础属性：fill、stroke、strokeWidth、opacity
                rect图形类型需要属性：width、height
                circle图形类型需要属性：r、cx、cy
                ellipse图形类型需要属性：rx、ry
                line图形类型需要属性：x2、y2
                polygon/polyline图形类型需要属性：points
                path图形类型需要属性：d
                arc图形类型需要属性：endx、endy、largearc、sweep
                spiral图形类型需要属性：turns、spacing
                wave类型需要属性：amplitude、frequency、wavewidth`
              }
            },
            required: ["type", "x", "y", "attributes"]
          }
        }
      },
      required: ["backgroundColor", "primaryColor", "secondaryColor", "patterns"]
    },
    typography: {
      type: SchemaType.OBJECT,
      properties: {
        fontFamily: { 
          type: SchemaType.STRING,
          enum: [
            'serif-cn',
            //'sans-serif',
            'kai-cn',
            'elegant-cn'
          ]
        },
        fontSize: { 
          type: SchemaType.NUMBER, 
          minimum: 18,
          maximum: 24,
          description: "字体大小，18~24px之间"
        },
        //lineHeight: { type: SchemaType.NUMBER },
        textColor: { type: SchemaType.STRING }
      },
      required: ["fontFamily", "fontSize", "textColor"]
    },
    explanation: { type: SchemaType.STRING, description: "设计理念解释" }
  },
  required: ["theme", "svgStyle", "typography", "explanation"]
}; 

export const claudeSchema = {
  type: "object" ,
  title: "SVG Style Configuration",
  properties: {
    theme: {
      type: "string" ,
      enum: ["geometric", "minimalist", "constructivist", "bauhaus", "abstract"],
      description: "设计风格主题"
    },
    svgStyle: {
      type: "object" ,
      properties: {
        backgroundColor: { type: "string" , description: "HEX格式背景色，如 #FFFFFF" },
        primaryColor: { type: "string" , description: "HEX格式主要图形色，如 #000000" },
        secondaryColor: { type: "string" , description: "HEX格式次要图形色，如 #FFFFFF" },
        patterns: {
          type: "array" ,
          items: {
            type: "object" ,
            properties: {
              type: {
                type: "string" ,
                enum: ["circle", "rect", "line", "polygon", "path", "ellipse", "polyline", "arc", "spiral", "wave"],
                description: "图形类型"
              },
              x: { type: "number", description: "图形 x 坐标" },
              y: { type: "number", description: "图形 y 坐标" },
              attributes: {
                type: "object" ,
                properties: {
                  fill: { type: "string", description: "填充颜色" },
                  stroke: { type: "string", description: "描边颜色" },
                  strokeWidth: { type: "number", description: "描边宽度" },
                  opacity: { type: "number", description: "透明度 0-1" },
                  r: { type: "number", description: "圆的半径" },
                  cx: { type: "number", description: "圆心x坐标" },
                  cy: { type: "number", description: "圆心y坐标" },
                  rx: { type: "number", description: "椭圆X轴半径" },
                  ry: { type: "number", description: "椭圆Y轴半径" },
                  width: { type: "number", description: "矩形宽度" },
                  height: { type: "number", description: "矩形高度" },
                  x2: { type: "number", description: "线段终点x坐标" },
                  y2: { type: "number", description: "线段终点y坐标" },
                  points: { type: "string", description: "多边形或折线顶点坐标" },
                  d: { type: "string", description: "SVG路径数据" },
                  largearc: { type: "boolean", description: "是否为大圆弧" },
                  sweep: { type: "boolean", description: "圆弧方向" },
                  endx: { type: "number", description: "圆弧终点x坐标" },
                  endy: { type: "number", description: "圆弧终点y坐标" },
                  turns: { type: "number", description: "螺旋圈数" },
                  spacing: { type: "number", description: "螺旋间距" },
                  amplitude: { type: "number", description: "波浪振幅" },
                  frequency: { type: "number", description: "波浪频率" },
                  wavewidth: { type: "number", description: "波浪宽度" },
                  transform: { type: "string", description: "变换属性" },
                  gradient: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["linear", "radial"], description: "渐变类型" },
                      colors: { type: "array", items: { type: "string" }, description: "渐变颜色数组" },
                      stops: { type: "array", items: { type: "number" }, description: "渐变停止点" }
                    }
                  },
                  filter: { type: "string", description: "SVG滤镜效果" }
                },
                description: `必需的基础属性：fill、stroke、strokeWidth、opacity
                rect图形类型需要属性：width、height
                circle图形类型需要属性：r、cx、cy
                ellipse图形类型需要属性：rx、ry
                line图形类型需要属性：x2、y2
                polygon/polyline图形类型需要属性：points
                path图形类型需要属性：d
                arc图形类型需要属性：endx、endy、largearc、sweep
                spiral图形类型需要属性：turns、spacing
                wave类型需要属性：amplitude、frequency、wavewidth`,
                required: ["fill", "stroke", "strokeWidth", "opacity"]
              },
            },
            required: ["type", "x", "y", "attributes"]
          }
        }
      },
      required: ["backgroundColor", "primaryColor", "secondaryColor", "patterns"]
    },
    typography: {
      type: "object",
      properties: {
        fontFamily: {
          type: "string",
          enum: ["serif-cn", "sans-serif", "kai-cn", "elegant-cn"]
        },
        fontSize: {
          type: "number",
          minimum: 18,
          maximum: 24,
          description: "字体大小，18~24px之间"
        },
        //lineHeight: { type: "number" },
        textColor: { type: "string" }
      },
      required: ["fontFamily", "fontSize", "textColor"]
    },
    explanation: { type: "string", description: "设计理念解释" }
  },
  required: ["theme", "svgStyle", "typography", "explanation"]
} as const; 

// 添加新的SVG样式类型定义
export interface SVGPattern {
  type: 'circle' | 'rect' | 'line' | 'polygon' | 'path' | 
        'ellipse' | 'polyline' | 'arc' | 'spiral' | 'wave';
  x: number;
  y: number;
  attributes: Record<string, any>;
}

export interface SVGStyle {
  backgroundColor: string;
  primaryColor: string;
  secondaryColor: string;
  patterns: SVGPattern[];
}

export interface Typography {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  textColor: string;
}

// 修改现有的 StyleConfig
export interface StyleConfig {
  theme: 'scientific' | 'literary' | 'philosophical' | 'inspirational' | 'poetic' | 'artistic' | 'geometric';
  colorScheme: {
    primary: string;
    secondary: string;
    textColor: string;
  };
  iconStyle: string;
  fontSize: 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  mood: string;
  emphasis: string[];
  fontFamily: string;
  svgStyle?: SVGStyle;
  typography?: Typography;
  explanation?: string;
} 