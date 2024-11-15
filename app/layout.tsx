import './globals.css'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME ||'自然语言内容生成器',
  description: '使用 Next.js 和 Tailwind CSS 构建',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Source+Han+Serif+CN:wght@400;700&family=Ma+Shan+Zheng&family=ZCOOL+KaiXue&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-gray-50">
        <main className="container mx-auto px-4">
          {children}
        </main>
      </body>
    </html>
  )
} 