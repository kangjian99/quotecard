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
import { StyleConfig } from './types/types';
import { toPng } from 'html-to-image';

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
// 添加颜色格式化工具函数
const normalizeColor = (color: string): string => {
  color = color.trim();
  if (!color) return '#000000';
  
  // 移除多余的 # 号
  color = color.replace(/^#+/, '#');
  
  // 如果没有 # 号但是是有效的 hex 值，添加 #
  if (!color.startsWith('#') && /^[0-9A-Fa-f]{6}$/.test(color)) {
    color = '#' + color;
  }
  
  // 确保返回有效的颜色值
  return /^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#000000';
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

// 添加颜色对比度检查函数
const isLightColor = (color: string): boolean => {
  // 移除 # 号并确保是有效的6位十六进制颜色值
  const hex = normalizeColor(color).replace('#', '');
  
  // 正确使用 slice 获取 RGB 值
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  // 计算亮度 (基于 YIQ 颜色空间)
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  return yiq > 128;
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

const QuoteCardGenerator = () => {
  const [text, setText] = useState('');
  const [author, setAuthor] = useState('');
  const [source, setSource] = useState('');
  const [styleConfig, setStyleConfig] = useState<StyleConfig | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 当文本改变时触发 AI 分析
  useEffect(() => {
    const analyzeText = async () => {
      // 确保所有必填字段都已填写
      if (text.length > 10 && author && source) {  // 修改这里的条件
        setIsAnalyzing(true);
        const analysis = await analyzeTextWithAI(text);
        setStyleConfig(analysis);
        setIsAnalyzing(false);
      }
    };

    const debounceAnalysis = setTimeout(analyzeText, 3000); // 添加防抖
    return () => clearTimeout(debounceAnalysis);
  }, [text, author, source]);  // 添加 author 和 source 作为依赖

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
  const ThemeIcon = styleConfig?.theme ? themeIcons[styleConfig.theme as keyof typeof themeIcons] : null;

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

  const downloadQuoteCard = async () => {
    const element = document.getElementById('quote-card');
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        quality: 0.95,
        backgroundColor: '#fff',
        skipFonts: true,
        filter: (node) => {
          if (node.tagName === 'LINK' && 
              node.getAttribute('rel') === 'stylesheet') {
            return false;
          }
          return true;
        }
      });
      
      const link = document.createElement('a');
      link.download = `quote-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('下载图片失败:', err);
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto p-4 max-w-2xl">
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
        
        {styleConfig && (
          <>
            <Card 
              id="quote-card"
              className="w-full max-w-2xl mx-auto my-6 relative overflow-hidden"
              style={{
                ...getBackgroundStyle(styleConfig.colorScheme.primary),
              }}
            >
              {/* 只保留角落装饰 */}
              <div 
                className="absolute top-0 left-0 w-16 h-16 pointer-events-none"
                style={{
                  borderLeft: `2px solid ${getIconColor(styleConfig.colorScheme.primary)}10`,
                  borderTop: `2px solid ${getIconColor(styleConfig.colorScheme.primary)}10`,
                }}
              />
              <div 
                className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none"
                style={{
                  borderRight: `2px solid ${getIconColor(styleConfig.colorScheme.primary)}10`,
                  borderBottom: `2px solid ${getIconColor(styleConfig.colorScheme.primary)}10`,
                }}
              />
              
              <CardContent className="pt-6 px-6">
                <div className="flex gap-2 items-start">
                  <Quote 
                    className="flex-shrink-0 mt-1" 
                    size={18}
                    style={{ color: getIconColor(styleConfig.colorScheme.primary), transform: 'rotate(180deg)' }}
                  />
                  
                  <div className="leading-relaxed space-y-2">
                    {text.split('\n').filter(Boolean).map((paragraph, index) => (
                      <p 
                        key={index}
                        className={`
                          ${getFontSizeClass(styleConfig.fontSize)} 
                          ${getFontFamilyClass(styleConfig.fontFamily)}
                          text-gray-700 dark:text-gray-200
                          text-justify
                          tracking-wider
                          leading-relaxed
                        `}
                      >
                        {paragraph.trim()}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="pb-6 px-6">
                <div className="flex items-center gap-2 w-full justify-end">
                  {styleConfig.theme && (
                    <>
                      {React.createElement(getRandomIcon(styleConfig.theme), {
                        className: "w-4 h-4",
                        style: { color: getIconColor(styleConfig.colorScheme.primary) }
                      })}
                    </>
                  )}
                  
                  {/* 作者和来源 */}
                  <span 
                    className={`
                      ${getFontSizeClass(getSmallerFontSize(styleConfig.fontSize))}
                      ${getFontFamilyClass(styleConfig.fontFamily)}
                      text-gray-700 dark:text-gray-200
                      tracking-wider
                    `}
                  >
                    ——{author}
                    {source && `《${source}》`}
                  </span>
                </div>
              </CardFooter>
            </Card>
            
            <div className="flex justify-center mt-4">
              <Button 
                onClick={downloadQuoteCard}
                variant="default"
              >
                下载图片
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

async function analyzeTextWithAI(text: string) {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch (error) {
    console.error('AI Analysis failed:', error);
    return {
      theme: 'literary',
      colorScheme: {
        primary: '#4A90E2',
        secondary: '#F5A623',
        textColor: 'text-gray-700'
      },
      iconStyle: 'feather',
      fontSize: 'base',
      mood: 'neutral',
      emphasis: [],
      fontFamily: 'modern-cn'
    };
  }
}

export default QuoteCardGenerator;