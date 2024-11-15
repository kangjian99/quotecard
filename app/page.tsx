'use client'
import React from 'react'
import ChartGenerator from './components/ChartGenerator';

export default function Home() {
  return (
    <div className="p-6 mt-8">
      <h1 className="text-3xl font-bold text-center mb-2">
        {process.env.NEXT_PUBLIC_APP_NAME || '自然语言内容生成器'}
      </h1>
      <ChartGenerator />
    </div>
  )
} 