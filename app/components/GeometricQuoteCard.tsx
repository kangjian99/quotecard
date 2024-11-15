import React from 'react';
import { Quote } from 'lucide-react';

// 导入 SVGPattern 接口
import { SVGPattern as Pattern, SVGStyle, Typography } from '../types/types_svg';
import { normalizeColor } from '../utils/colorUtils';

interface GeometricQuoteProps {
  text: string;
  author?: string;
  source?: string;
  svgStyle: SVGStyle;
  typography: Typography;
  useFixedFormat?: boolean;
}

const GeometricQuoteCard: React.FC<GeometricQuoteProps> = ({
  text,
  author,
  source,
  svgStyle,
  typography,
  useFixedFormat = false
}) => {
  const width = 672; // 修改为 max-w-2xl 的宽度
  const minHeight = 300; // 初始高度设为宽度的一半

  // 如果启用固定格式，覆盖传入的排版设置
  if (useFixedFormat) {
    typography.fontFamily = 'serif-cn';
    typography.fontSize = 22;
  }

  typography.lineHeight = 1.5;

  // 如果背景色和文字颜色都接近白色，将文字改为深色
  const bgColor = normalizeColor(svgStyle.backgroundColor);
  const textColor = normalizeColor(typography.textColor);
  if ((bgColor === '#ffffff' || /^#f[a-f]f[a-f]{3}$/.test(bgColor)) &&
      (textColor === '#ffffff' || /^#f[a-f]f[a-f]{3}$/.test(textColor))) {
    typography.textColor = '#333333';
  }

  const renderPattern = (pattern: Pattern, index: number) => {
    // 添加控制台输出
    console.log('Pattern:', {
      type: pattern.type,
      x: pattern.x,
      y: pattern.y,
      attributes: pattern.attributes,
      index
    });

    const processAttributes = (attrs: Record<string, any>) => {
      const newAttrs = { ...attrs };
      
      // 添加对 polygon 类型的特殊处理
      if (pattern.type === 'polygon' && newAttrs.d) {
        // 将 path 的 d 属性转换为 polygon 的 points 属性
        const points = newAttrs.d
          .replace(/[M,L]/g, '')  // 移除 M 和 L
          .trim()
          .split(' ')
          .filter(Boolean)
          .join(',');
        newAttrs.points = points;
        delete newAttrs.d;
      }

      // 处理填充色
      if (newAttrs.fill) {
        newAttrs.fill = normalizeColor(newAttrs.fill);
      }
      
      // 处理描边色
      if (newAttrs.stroke) {
        newAttrs.stroke = normalizeColor(newAttrs.stroke);
      }

      // 如果填充色和描边都是白色，调整为主色
      if (newAttrs.fill === '#ffffff' || newAttrs.fill === '#FFFFFF') {
        newAttrs.fill = normalizeColor(svgStyle.primaryColor) || '#666666';  // 使用主色或默认灰色
      }
      if (newAttrs.stroke === '#ffffff' || newAttrs.stroke === '#FFFFFF') {
        newAttrs.stroke = normalizeColor(svgStyle.primaryColor) || '#666666';
      }

      // 将布尔值转换为字符串 '0' 或 '1'
      if (typeof newAttrs.largearc === 'boolean') {
        newAttrs.largearc = newAttrs.largearc ? '1' : '0';
      }
      if (typeof newAttrs.sweep === 'boolean') {
        newAttrs.sweep = newAttrs.sweep ? '1' : '0';
      }

      // 移除 transform 属性，因为我们已经使用 cx 和 cy 设置位置
      //delete newAttrs.transform;

      // 处理 rect 类型
      if (pattern.type === 'rect') {
        if (newAttrs.width && !newAttrs.height) {
          newAttrs.height = newAttrs.width; // 如果缺少 height，设置为与 width 相同
          console.log('补充 rect height:', newAttrs.height);
        } else if (!newAttrs.width && newAttrs.height) {
          newAttrs.width = newAttrs.height; // 如果缺少 width，设置为与 height 相同
          console.log('补充 rect width:', newAttrs.width);
        } else if (!newAttrs.width && !newAttrs.height) {
          newAttrs.width = 50;  // 如果都缺少，设置默认值
          newAttrs.height = 50;
          console.log('补充 rect 默认尺寸:', newAttrs.width, newAttrs.height);
        }
      }

      return newAttrs;
    };

    const baseAttributes = {
      ...processAttributes(pattern.attributes),
      //opacity: 0.5,
      filter: 'blur(1px)',
    };
    console.log('Processed attributes:', baseAttributes);

    switch (pattern.type) {
      case 'circle':
        return <circle 
          key={index} 
          cx={pattern.x} 
          cy={pattern.y} 
          r={pattern.attributes.r}  // 确保有 r 属性
          {...baseAttributes} 
        />;
      case 'rect':
        return <rect 
          key={index} 
          x={pattern.x} 
          y={pattern.y} 
          width={pattern.attributes.width}
          height={pattern.attributes.height}
          {...baseAttributes} 
        />;
      case 'line':
        return <line 
          key={index} 
          x1={pattern.x} 
          y1={pattern.y} 
          x2={pattern.attributes.x2}
          y2={pattern.attributes.y2}
          {...baseAttributes} 
        />;
      case 'polygon':
        return <polygon 
          key={index} 
          points={pattern.attributes.points}  // 使用 points 属性
          {...baseAttributes} 
        />;
      case 'path':
        return <path 
          key={index} 
          d={pattern.attributes.d} 
          {...baseAttributes} 
        />;
      case 'ellipse':
        return <ellipse 
          key={index} 
          cx={pattern.x} 
          cy={pattern.y} 
          rx={pattern.attributes.rx}
          ry={pattern.attributes.ry}
          {...baseAttributes} 
        />;
      case 'polyline':
        return <polyline 
          key={index} 
          points={pattern.attributes.points} 
          {...baseAttributes} 
        />;
      case 'arc':
        // 确保所有值都有默认值，并且 largeArc 和 sweep 是有效的标志值
        const arcPath = `M ${pattern.x} ${pattern.y} A ${
          pattern.attributes.rx || 0
        } ${
          pattern.attributes.ry || 0
        } 0 ${
          pattern.attributes.largearc === true ? '1' : '0'
        } ${
          pattern.attributes.sweep === true ? '1' : '0'
        } ${
          pattern.attributes.endx || pattern.x
        } ${
          pattern.attributes.endy || pattern.y
        }`;
        
        return <path 
          key={index} 
          d={arcPath} 
          {...baseAttributes} 
        />;
      case 'spiral':
        const spiralPath = generateSpiralPath(
          pattern.x, 
          pattern.y, 
          pattern.attributes.turns || 3, 
          pattern.attributes.spacing || 10
        );
        return <path 
          key={index} 
          d={spiralPath} 
          {...baseAttributes} 
        />;
      case 'wave':
        const wavePath = generateWavePath(
          pattern.x, 
          pattern.y, 
          pattern.attributes.amplitude || 20, 
          pattern.attributes.frequency || 0.02, 
          pattern.attributes.wavewidth || 100  // 使用小写的 wavewidth
        );
        return <path 
          key={index} 
          d={wavePath} 
          {...baseAttributes} 
        />;
      default:
        return null;
    }
  };

  const getFontFamilyClass = (fontFamily: string): string => {
    const fontMap = {
      'serif-cn': '"Noto Serif SC", serif',
      'kai-cn': '"LXGW WenKai", cursive',
      'sans-serif': '"Noto Sans SC", sans-serif',
      'elegant-cn': '"Source Han Serif CN", "Noto Serif SC", serif'
    } as const;

    return fontMap[fontFamily as keyof typeof fontMap] || fontMap['serif-cn'];
  };

  const processText = (text: string, width: number, fontSize: number) => {
    const paragraphs = text.split('\n').filter(Boolean);
    const lines: string[] = [];
    const maxWidth = width * 0.8;
    const charsPerLine = Math.floor(maxWidth / (fontSize * 1.2));

    paragraphs.forEach(paragraph => {
      let currentLine = '';
      const chars = paragraph.split('');

      chars.forEach(char => {
        if (currentLine.length >= charsPerLine) {
          lines.push(currentLine);
          currentLine = char;
        } else {
          currentLine += char;
        }
      });

      if (currentLine) {
        lines.push(currentLine);
      }
      lines.push('');
    });

    return lines.filter(line => line !== '');
  };

  const textLines = processText(text, width, typography.fontSize);
  const lineHeight = typography.fontSize * typography.lineHeight;
  const totalTextHeight = textLines.length * lineHeight;
  
  // 计算实际需要的高度（文本高度 + 上下边距）
  const height = Math.max(minHeight, totalTextHeight + 200); // 为上下边距总和

  return (
    <div className="flex justify-center w-full">
      <svg 
        id="quote-card-svg"
        width="100%" 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        style={{ maxWidth: '672px' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={width} height={height} fill={normalizeColor(svgStyle.backgroundColor)} />
        
        {/* 装饰图案放在最底层 */}
        <g className="patterns" style={{ opacity: 0.4 }}>
              {svgStyle.patterns.slice(0, 6).map((pattern: any, index: number) => renderPattern(pattern, index))}
        </g>

        {/* 添加白色半透明遮罩层 */}
        <rect 
          width={width} 
          height={height} 
          fill="white" 
          opacity="0.5"
        />

        {/* 左上角反引号 */}
        <foreignObject x="40" y="40" width="24" height="24">
          <Quote 
            size={18}
            color={normalizeColor(svgStyle.primaryColor) || '#666666'}
            strokeWidth={1.5}
            style={{ transform: 'rotate(180deg)' }}
          />
        </foreignObject>

        {/* 文本内容放在最上层 */}
        <g>
          {textLines.map((line, index) => (
            <text
              key={index}
              x="100"
              y={100 + (index * lineHeight)}
              textAnchor="start"
              style={{
                fontFamily: getFontFamilyClass(typography.fontFamily),
                fontSize: `${typography.fontSize}px`,
                fill: typography.textColor,
                letterSpacing: '0.15em', // 添加字间距
              }}
            >
              {line}
            </text>
          ))}
        </g>

        {/* 作者和来源 */}
        {(author || source) && (
          <text
            x={width - 50}
            y={100 + totalTextHeight + 40}
            textAnchor="end"
            style={{
              fontFamily: getFontFamilyClass(typography.fontFamily),
              fontSize: `${typography.fontSize * 0.9}px`,
              fill: typography.textColor
            }}
          >
            {author && `—— ${author}`}
            {source && `《${source}》`}
          </text>
        )}
      </svg>
    </div>
  );
};

export default GeometricQuoteCard;

// 添加辅助函数用于生成复杂路径
const generateSpiralPath = (centerX: number, centerY: number, turns: number, spacing: number) => {
  let path = `M ${centerX} ${centerY}`;
  for (let i = 0; i <= turns * 2 * Math.PI; i += 0.1) {
    const r = spacing * i;
    const x = centerX + r * Math.cos(i);
    const y = centerY + r * Math.sin(i);
    path += ` L ${x} ${y}`;
  }
  return path;
};

const generateWavePath = (startX: number, startY: number, amplitude: number, frequency: number, width: number) => {
  let path = `M ${startX} ${startY}`;
  for (let x = 0; x <= width; x++) {
    const y = startY + amplitude * Math.sin(x * frequency);
    path += ` L ${startX + x} ${y}`;
  }
  return path;
};
