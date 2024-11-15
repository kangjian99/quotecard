'use client'
import React, { useState } from 'react'
import QuoteCardGenerator from '../QuoteCardGenerator';
import QuoteCardGeneratorSvg from '../QuoteCardGenerator_svg';
import ChartGenerator from '../components/ChartGenerator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Mode = 'quote' | 'geometric' | 'chart';

export default function Home() {
  const [mode, setMode] = useState<Mode>('geometric');

  return (
    <div className="p-6">
      <div className="mb-4">
        <Select value={mode} onValueChange={(value: Mode) => setMode(value)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="选择生成器类型" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="geometric">几何风格引用卡片</SelectItem>
            <SelectItem value="quote">普通引用卡片</SelectItem>
            <SelectItem value="chart">数据图表</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {mode === 'geometric' && <QuoteCardGeneratorSvg />}
      {mode === 'quote' && <QuoteCardGenerator />}
      {mode === 'chart' && <ChartGenerator />}
    </div>
  )
} 