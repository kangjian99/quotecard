// 颜色处理工具函数
export const normalizeColor = (color: string): string => {
  if (!color) return '#000000';
  
  color = color.trim().toLowerCase();
  
  // 移除多余的 # 号
  color = color.replace(/^#+/, '#');
  
  // 如果是带#的格式,优先处理
  if (color.startsWith('#')) {
    // 处理三位十六进制
    if (color.length === 4) {
      const r = color[1];
      const g = color[2];
      const b = color[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return color;
  }
  
    // 处理三位十六进制
    if (color.length === 3 && /^[0-9a-f]{3}$/i.test(color)) {
        const r = color[0];
        const g = color[1];
        const b = color[2];
        return `#${r}${r}${g}${g}${b}${b}`;
    }
      
    // 处理六位十六进制
    if (/^#?[0-9a-f]{6}$/i.test(color)) {
      return color.startsWith('#') ? color : `#${color}`;
    }

  // 常用颜色映射表
  const colorMap: Record<string, string> = {
    'black': '#000000',
    'white': '#FFFFFF',
    'gray': '#808080',
    'red': '#FF0000',
    'green': '#008000',
    'blue': '#0000FF',
    'yellow': '#FFFF00',
    'purple': '#800080',
    'orange': '#FFA500',
    'brown': '#A52A2A',
    'pink': '#FFC0CB',
    'gold': '#FFD700',
    'goldenrod': '#DAA520',
    'silver': '#C0C0C0',
    'navy': '#000080',
    'darkblue': '#00008B',
    'darkred': '#8B0000',
    'darkgreen': '#006400',
    'darkgray': '#A9A9A9',
    'lightgray': '#D3D3D3',
    'transparent': '#FFFFFF'
  };
  
  // 检查颜色名称映射
  if (colorMap[color]) {
    return colorMap[color];
  }
  
  // 处理 RGBA 格式
  if (color.startsWith('rgba')) {
    const matches = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d.]+\)/);
    if (matches) {
      const [_, r, g, b] = matches;
      return `#${Number(r).toString(16).padStart(2, '0')}${Number(g).toString(16).padStart(2, '0')}${Number(b).toString(16).padStart(2, '0')}`;
    }
  }
  
  // 处理 RGB 格式
  if (color.startsWith('rgb')) {
    const matches = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (matches) {
      const [_, r, g, b] = matches;
      return `#${Number(r).toString(16).padStart(2, '0')}${Number(g).toString(16).padStart(2, '0')}${Number(b).toString(16).padStart(2, '0')}`;
    }
  }
  
  return '#000000';
};

// 颜色亮度检查函数
export const isLightColor = (color: string): boolean => {
  const hex = normalizeColor(color).replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq > 128;
};

// 饼图颜色方案
export const CHART_COLORS = [
  '#4A90E2', // 蓝色
  '#50E3C2', // 青色
  '#F5A623', // 橙色
  '#FFD93D', // 黄色
  '#FF5A5F', // 红色
  '#BD10E0', // 紫色
  '#7ED321', // 绿色
  '#417505', // 深绿色
  '#4A4A4A', // 深灰色
  '#B8E986', // 浅绿色
  '#9013FE', // 深紫色
  '#4A154B', // 深紫红色
  '#FF6B6B', // 珊瑚红
  '#54C6EB', // 天蓝色
  '#2E5BFF', // 宝蓝色
];