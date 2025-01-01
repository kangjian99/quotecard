'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Quote, BookOpen, Brain, Sparkles, FlaskConical, Star, Palette,
  Library, ScrollText, Lightbulb, Infinity, Compass, Heart, 
  Music, Flower, Atom, Microscope, Telescope, Sun, Mountain, 
  Trophy, Brush, PenTool, Frame, Feather, Pen, Book, 
  GraduationCap, Wind, Cloud, Leaf 
} from "lucide-react";
import { StyleConfig } from './types/types_svg';
import { toPng } from 'html-to-image';
import GeometricQuoteCard from './components/GeometricQuoteCard';
import { normalizeColor, isLightColor } from './utils/colorUtils';

interface QuoteCardProps {
  text: string;
  author?: string;
  source?: string;
  styleConfig: StyleConfig;
}

// 添加一个工具函数来获取小一号的字号
type FontSize = 'sm' | 'base' | 'lg' | 'xl' | '2xl';

const getSmallerFontSize = (currentSize: string): FontSize => {
  const sizeMap: Record<string, FontSize> = {
    '2xl': 'xl',
    'xl': 'lg',
    'lg': 'base',
    'base': 'sm',
    'sm': 'sm'  // 改为返回 'sm' 而不是 'xs'
  };
  return sizeMap[currentSize] || 'sm';
};

// 添加 Icons 映射
const Icons = {
  Quote,
  BookOpen,
  Brain,
  Sparkles,
  FlaskConical,
  Star,
  Palette,
};

// 主题图标组
const themeIconSets = {
  literary: [BookOpen, Library, ScrollText, Book, Feather, Pen],
  philosophical: [Brain, Lightbulb, Infinity, Compass, GraduationCap],
  poetic: [Sparkles, Heart, Music, Flower, Wind, Cloud, Leaf],
  scientific: [FlaskConical, Atom, Microscope, Telescope],
  inspirational: [Star, Sun, Mountain, Trophy],
  artistic: [Palette, Brush, PenTool, Frame],
};

// 获取随机图标
const getRandomIcon = (theme: string) => {
  const iconSet = themeIconSets[theme as keyof typeof themeIconSets] || [Quote];
  const randomIndex = Math.floor(Math.random() * iconSet.length);
  return iconSet[randomIndex];
};

// 添加背景色处理函数
const getBackgroundStyle = (color: string) => {
  const baseColor = normalizeColor(color);
  return {
    background: `linear-gradient(135deg, 
      ${baseColor}05 0%, 
      ${baseColor}15 50%, 
      ${baseColor}25 100%
    )`
  };
};

// 获取图标颜色
const getIconColor = (baseColor: string): string => {
  const color = normalizeColor(baseColor);
  if (isLightColor(color)) {
    // 如果是浅色，返回加深后的颜色
    const hex = color.replace('#', '');
    const r = Math.max(0, parseInt(hex.slice(0, 2), 16) - 100);
    const g = Math.max(0, parseInt(hex.slice(2, 4), 16) - 100);
    const b = Math.max(0, parseInt(hex.slice(4, 6), 16) - 100);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  return color;
};

const QuoteCard: React.FC<QuoteCardProps> = ({ text, author, source, styleConfig }) => {
  // styleConfig 来自 AI 分析结果
  const {
    theme,
    colorScheme,
    iconStyle,
    fontSize,
    mood,
    emphasis
  } = styleConfig;

  // 根据 AI 返回的参数动态生成样式
  const getThemeStyles = () => {
    return {
      gradient: `from-${colorScheme.primary}-50 to-${colorScheme.secondary}-100`,
      textColor: `text-gray-800 dark:text-gray-200`,
      accentColor: `text-${colorScheme.primary}-500`,
      iconComponent: (Icons as any)[iconStyle] || Icons.Quote,
      fontClass: `text-${fontSize}`,
      // ... 其他样式参数
    };
  };

  const styles = getThemeStyles();
  const IconComponent = styles.iconComponent;

  return (
    <Card className={`w-full max-w-2xl bg-gradient-to-br ${styles.gradient}`}>
      <CardContent className="pt-6 px-6">
        <div className="flex gap-2 items-start">
          <IconComponent className={`${styles.accentColor} flex-shrink-0 mt-1`} size={24} />
          <p className={`${styles.textColor} ${styles.fontClass} leading-relaxed`}>
            {text}
          </p>
        </div>
      </CardContent>
      {(author || source) && (
        <CardFooter className="pb-6 px-6">
          <div className="flex items-center gap-2 w-full justify-end text-gray-600 dark:text-gray-400">
            <IconComponent className="w-4 h-4" />
            <span className="text-sm">
              {author && `——${author}`}
              {source && `《${source}》`}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

const QuoteCardGeneratorSvg = () => {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [source, setSource] = useState('');
  const [candidateCount, setCandidateCount] = useState(2);
  const [styleConfigs, setStyleConfigs] = useState<StyleConfig[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [renderMode, setRenderMode] = useState<'traditional' | 'geometric'>('geometric');
  const [useFixedFormat, setUseFixedFormat] = useState(false);

  // 当文本改变时触发 AI 分析
  useEffect(() => {
    const analyzeText = async () => {
      // 确保所有必填字段都已填写
      if (text.length > 10 && author && source) {  // 修改这里的条件
        setIsAnalyzing(true);
        const analysis = await analyzeTextWithAI(text, renderMode, candidateCount);
        setStyleConfigs(analysis);
        setIsAnalyzing(false);
      }
    };

    const debounceAnalysis = setTimeout(analyzeText, 3000); // 添加防抖
    return () => clearTimeout(debounceAnalysis);
  }, [text, author, source, renderMode, candidateCount]);  // 添加 author 和 source 作为依赖

  // 字号映射函数
  const getFontSizeClass = (size: 'sm' | 'base' | 'lg' | 'xl' | '2xl') => {
    const sizeMap = {
      'sm': 'text-sm',      // 14px
      'base': 'text-base',  // 16px
      'lg': 'text-lg',      // 18px
      'xl': 'text-xl',      // 20px
      '2xl': 'text-2xl'     // 24px
    };
    return sizeMap[size] || 'text-base';
  };

  // 添加图标映射
  const themeIcons = {
    literary: BookOpen,
    philosophical: Brain,
    poetic: Sparkles,
    scientific: FlaskConical,
    inspirational: Star,
    artistic: Palette,
  };

  // 获取当前主题的图标
  const ThemeIcon = styleConfigs.length > 0 ? themeIcons[styleConfigs[0].theme as keyof typeof themeIcons] : null;

  const getFontFamilyClass = (fontFamily: string) => {
    const fontMap = {
      'serif-cn': 'font-serif-cn',
      'sans-cn': 'font-sans-cn',
      'classic-cn': 'font-classic-cn',
      'modern-cn': 'font-modern-cn',
      'elegant-cn': 'font-elegant-cn',
      'artistic-cn': 'font-artistic-cn',
      'kai-cn': 'font-kai-cn'
    };
    return fontMap[fontFamily as keyof typeof fontMap] || 'font-modern-cn';
  };

  const downloadQuoteCard = async (index: number) => {
    const element = document.getElementById(`quote-card-svg-${index}`);
    if (!element) {
      console.error('找不到 SVG 元素');
      return;
    }

    try {
      const dataUrl = await toPng(element, {
        quality: 1.0,  // 最高质量
        pixelRatio: 5, // 提高像素密度
        backgroundColor: '#ffffff',
        skipFonts: true,
        filter: (node) => {
          if (node.tagName === 'STYLE' || node.tagName === 'LINK') {
            const href = node.getAttribute('href') || '';
            return !href.includes('fonts.googleapis.com');
          }
          return true;
        }
      });
      
      const link = document.createElement('a');
      link.download = `quote-${Date.now()}-${index}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('下载图片失败:', err);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-4 flex gap-4 items-center">
          <select
            value={candidateCount}
            onChange={(e) => setCandidateCount(Number(e.target.value))}
            className="p-2 border rounded"
          >
            <option value={1}>生成1个方案</option>
            <option value={2}>生成2个方案</option>
            <option value={3}>生成3个方案</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={useFixedFormat}
              onChange={(e) => setUseFixedFormat(e.target.checked)}
              className="form-checkbox h-4 w-4"
            />
            <span>使用固定格式 (serif-cn, 22px)</span>
          </label>
        </div>

        <div className="space-y-4 mb-8">
          <textarea
            className="w-full p-3 border rounded-md"
            rows={4}
            placeholder="输入引文内容..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex gap-4">
            <input
              className="flex-1 p-2 border rounded-md"
              placeholder="作者"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
            <input
              className="flex-1 p-2 border rounded-md"
              placeholder="来源"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>
        </div>
        
        {isAnalyzing && (
          <div className="text-center text-gray-500 my-4">
            正在分析文本风格...
          </div>
        )}
        
        {styleConfigs.length > 0 && (
          <div className="space-y-8">
            {styleConfigs.map((styleConfig, index) => (
              <div key={index} className="border p-4 rounded-lg">
                <h2 className="text-lg font-medium mb-4">设计方案 {index + 1}</h2>
                <div id={`quote-card-svg-${index}`}>
                  <GeometricQuoteCard
                    text={text}
                    author={author}
                    source={source}
                    svgStyle={styleConfig.svgStyle || {
                      backgroundColor: '#ffffff',
                      primaryColor: styleConfig.colorScheme.primary,
                      secondaryColor: styleConfig.colorScheme.secondary,
                      patterns: []
                    }}
                    typography={styleConfig.typography || {
                      fontFamily: styleConfig.fontFamily,
                      fontSize: 16,
                      lineHeight: 1.5,
                      textColor: styleConfig.colorScheme.textColor
                    }}
                    useFixedFormat={useFixedFormat}
                  />
                </div>
                {styleConfig.explanation && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-700">
                    <h3 className="text-lg font-medium mb-2">设计说明：</h3>
                    <p className="whitespace-pre-line">{styleConfig.explanation}</p>
                  </div>
                )}
                <div className="flex justify-center mt-4">
                  <Button 
                    onClick={() => downloadQuoteCard(index)}
                    variant="default"
                  >
                    下载方案 {index + 1}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

async function analyzeTextWithAI(text: string, renderMode: string, candidateCount: number) {
  try {
    const response = await fetch('/api/analyze_svg', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, renderMode, candidateCount }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    
    // 使用现有的 normalizeColor 函数处理颜色值
    if (data.svgStyle) {
      data.svgStyle.backgroundColor = normalizeColor(data.svgStyle.backgroundColor);
      data.svgStyle.primaryColor = normalizeColor(data.svgStyle.primaryColor);
      data.svgStyle.secondaryColor = normalizeColor(data.svgStyle.secondaryColor);
      
      // 处理图案中的颜色值
      data.svgStyle.patterns = data.svgStyle.patterns.map((pattern: any) => ({
        ...pattern,
        attributes: {
          ...pattern.attributes,
          fill: pattern.attributes.fill ? normalizeColor(pattern.attributes.fill) : undefined,
          stroke: pattern.attributes.stroke ? normalizeColor(pattern.attributes.stroke) : undefined,
        }
      }));
    }
    
    if (data.typography) {
      data.typography.textColor = normalizeColor(data.typography.textColor);
    }
    
    return data;
  } catch (error) {
    console.error('AI Analysis failed:', error);
    return {
      theme: 'geometric',
      svgStyle: {
        backgroundColor: '#ffffff',
        primaryColor: '#4A90E2',
        secondaryColor: '#F5A623',
        patterns: []
      },
      typography: {
        fontFamily: 'serif-cn',
        fontSize: 24,
        lineHeight: 1.5,
        textColor: '#333333'
      },
      explanation: '默认几何风格设计'
    };
  }
}

export default QuoteCardGeneratorSvg;