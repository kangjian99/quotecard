'use client'
import React, { useState, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartAnalysis, ChartType, DataPoint } from '../types/chart';
import { toPng } from 'html-to-image';
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { CHART_COLORS } from '../utils/colorUtils';

Chart.register(ChartDataLabels);

const ChartGenerator = () => {
  const [rawData, setRawData] = useState('');
  const [chartType, setChartType] = useState<ChartType>('line');
  const [chartConfig, setChartConfig] = useState<ChartAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chart, setChart] = useState<Chart | null>(null);
  const [startFromZero, setStartFromZero] = useState(false);
  const [useSmall, setUseSmall] = useState(false);

  const analyzeDataWithAI = async (rawText: string, chartType: ChartType) => {
    try {
      // console.log('发送到AI的原始文本:', rawText);
      
      const response = await fetch('/api/analyze-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: rawText,
          chartType,
          useSmall 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API响应错误:', errorText);
        throw new Error(`API请求失败: ${response.status} ${errorText}`);
      }

      const analysis = await response.json();
      // console.log('AI返回的分析结果:', analysis);

      // 处理重复的series
      analysis.data.series = analysis.data.series.reduce((acc: { name: string; data: DataPoint[] }[], current: { name: string; data: DataPoint[] }, index: number) => {
        const isDuplicate = acc.some(item => 
          item.name === current.name && 
          item.data.length === current.data.length
        );
        if (!isDuplicate) {
          acc.push(current);
        }
        return acc;
      }, [] as { name: string; data: DataPoint[] }[]);

      return analysis;
    } catch (error) {
      console.error('AI分析失败:', error);
      return {
        chartType: chartType,
        data: {
          series: [],
          title: '数据图表',
          xAxisLabel: 'X轴',
          yAxisLabel: 'Y轴'
        },
        style: {
          theme: 'default',
          backgroundColor: '#ffffff',
          primaryColor: '#4A90E2',
          secondaryColors: ['#F5A623', '#50E3C2', '#FF5A5F'],
          fontFamily: 'sans-serif',
          fontSize: 14,
          showLegend: true,
          showGrid: true,
          animation: true
        },
        insights: ['数据分析失败'],
        recommendations: ['请检查数据格式是否正确']
      };
    }
  };

  // 添加新的处理函数
  const handleAnalyze = async () => {
    if (rawData.length === 0) {
      return;
    }
    setIsAnalyzing(true);
    const analysis = await analyzeDataWithAI(rawData, chartType);
    
    // 强制使用用户选择的图表类型
    //analysis.chartType = chartType;
    
    setChartConfig(analysis);
    setIsAnalyzing(false);
  };

  // 修改图表类型选择的处理函数
  const handleChartTypeChange = (value: ChartType) => {
    setChartType(value);
    
    // 如果已有图表配置，直接更新图表类型
    if (chartConfig) {
      const updatedConfig = {
        ...chartConfig,
        chartType: value
      };
      setChartConfig(updatedConfig);
    }
  };

  // 渲染图表
  useEffect(() => {
    if (chartConfig && document.getElementById('chart-canvas')) {
      if (chart) {
        chart.destroy();
      }

      const canvas = document.getElementById('chart-canvas') as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;

      const datasets = chartConfig.chartType === 'pie' ? [{
        label: chartConfig.data.series[0].name,
        data: chartConfig.data.series[0].data.map(d => d.y),
        backgroundColor: chartConfig.data.series[0].data.map((_, i) => 
          CHART_COLORS[i % CHART_COLORS.length]
        ),
        borderColor: '#fff',
        borderWidth: 2,
      }] : chartConfig.data.series.map((series, index) => {
        const baseConfig = {
          label: series.name,
          data: series.data.map(d => d.y),
          backgroundColor: chartConfig.chartType === 'line' ? 
            createGradient(ctx, chartConfig.style.secondaryColors[index] || chartConfig.style.primaryColor) :
            chartConfig.style.secondaryColors[index] || chartConfig.style.primaryColor,
          borderColor: chartConfig.style.secondaryColors[index] || chartConfig.style.primaryColor,
          borderWidth: 1.5,
          fill: false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBorderWidth: 3,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: chartConfig.style.secondaryColors[index] || chartConfig.style.primaryColor,
        };

        // 先创建临时数据集来判断是否需要第二Y轴
        const tempDatasets = chartConfig.data.series.map(s => ({
          data: s.data.map(d => d.y)
        }));

        const useSecondAxis = needsSecondYAxis(tempDatasets);
        console.log('Use second axis:', useSecondAxis);

        return {
          ...baseConfig,
          yAxisID: useSecondAxis && index === 1 ? 'y1' : 'y'
        };
      });

      // 分别计算两个轴的最大值
      const firstAxisData = datasets[0].data;
      const secondAxisData = datasets.length > 1 ? datasets[1].data : [];
      const firstAxisMax = getMaxValue(firstAxisData);
      const secondAxisMax = datasets.length > 1 ? getMaxValue(secondAxisData) : 0;

      const newChart = new Chart(canvas, {
        type: chartConfig.chartType,
        plugins: [ChartDataLabels],
        data: {
          labels: chartConfig.data.series[0].data.map(d => d.x),
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          datasets: {
            bar: {
              barPercentage: 0.6,
              categoryPercentage: 0.8
            }
          },
          animation: {
            duration: 1000,
            easing: 'easeInOutQuart'
          },
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: {
              position: 'right',
              align: 'center',
              labels: {
                usePointStyle: true,
                padding: 25,
                font: {
                  size: 13,
                  family: "'Inter', sans-serif"
                },
                boxWidth: 8,
                boxHeight: 8
              }
            },
            tooltip: {
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              titleColor: '#000',
              bodyColor: '#666',
              bodyFont: {
                size: 13,
                family: "'Inter', sans-serif"
              },
              padding: 12,
              borderColor: 'rgba(0, 0, 0, 0.1)',
              borderWidth: 1,
              displayColors: true,
              usePointStyle: true,
            },
            datalabels: chartConfig.chartType === 'pie' ? {
              color: '#333',
              font: {
                size: 12,
                weight: 'bold',
                family: "'Inter', sans-serif"
              },
              padding: 6,
              align: 'end',
              anchor: 'end',
              offset: 10,
              formatter: (value: unknown, context) => {
                // 确保数据集存在且是数组
                const dataArray = context.dataset.data;
                if (!Array.isArray(dataArray)) return '';

                // 计算总和，确保只处理数字
                const total = dataArray.reduce((acc: number, cur: unknown) => {
                  const numValue = typeof cur === 'object' && cur !== null 
                    ? (cur as { y?: number }).y || 0  // 处理对象类型
                    : typeof cur === 'number' 
                      ? cur 
                      : 0;
                  return acc + numValue;
                }, 0);

                // 确保 value 是数字
                const numValue = typeof value === 'object' && value !== null
                  ? (value as { y?: number }).y || 0
                  : typeof value === 'number'
                    ? value
                    : 0;

                // 计算百分比
                const percentage = total > 0 ? ((numValue / total) * 100).toFixed(1) : '0.0';
                return `${numValue} (${percentage}%)`;
              },
              labels: {
                title: {
                  color: '#333'
                }
              }
            } : chartConfig.chartType === 'line' ? {
              color: 'rgba(0,0,0,0.65)',
              backgroundColor: 'rgba(255, 255, 255, 0.55)',
              borderRadius: 1,
              font: {
                size: 11,
                //weight: 'bold',
                family: "'Inter', sans-serif"
              },
              padding: { top: 4, bottom: 4, left: 6, right: 6 },
              align: 'top',
              offset: 8,
              formatter: (value: unknown) => {
                // 确保value是数字
                const numValue = typeof value === 'object' && value !== null
                  ? (value as { y?: number }).y || 0
                  : typeof value === 'number'
                    ? value
                    : 0;
                return numValue.toString();
              }
            } : {
              display: false
            },
          },
          scales: chartConfig.chartType !== 'pie' ? {
            x: {
              grid: {
                display: chartConfig.style.showGrid,
                color: 'rgba(0, 0, 0, 0.05)',
              },
              title: {
                display: true,
                text: chartConfig.data.xAxisLabel || '',
                font: {
                  size: 13,
                  family: "'Inter', sans-serif"
                }
              },
              ticks: {
                font: {
                  size: 12,
                  family: "'Inter', sans-serif"
                },
                color: 'rgba(0, 0, 0, 0.6)'
              }
            },
            y: {
              beginAtZero: startFromZero,
              min: startFromZero ? 0 : undefined,
              max: firstAxisMax,
              grid: {
                display: chartConfig.style.showGrid,
                color: 'rgba(0, 0, 0, 0.05)',
              },
              title: {
                display: true,
                text: chartConfig.data.yAxisLabel || chartConfig.data.series[0].name,
                font: {
                  size: 13,
                  family: "'Inter', sans-serif"
                }
              },
              ticks: {
                font: {
                  size: 12,
                  family: "'Inter', sans-serif"
                },
                padding: chartConfig.chartType === 'line' ? 12 : 8,
                color: 'rgba(0, 0, 0, 0.6)'
              }
            },
            ...(needsSecondYAxis(datasets) ? {
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                grid: {
                  drawOnChartArea: false,
                },
                beginAtZero: startFromZero,
                min: startFromZero ? 0 : undefined,
                max: secondAxisMax,
                title: {
                  display: true,
                  text: chartConfig.data.series[1].name,
                  font: {
                    size: 13,
                    family: "'Inter', sans-serif"
                  }
                },
                ticks: {
                  font: {
                    size: 12,
                    family: "'Inter', sans-serif"
                  },
                  padding: 12,
                  color: 'rgba(0, 0, 0, 0.6)'
                }
              }
            } : {})
          } : undefined,
          layout: {
            padding: {
              top: 30,
              right: 20,
              bottom: chartConfig.chartType === 'pie' ? 30 : 20,
              left: 20
            }
          }
        }
      });
      
      setChart(newChart);
    }
  }, [chartConfig, startFromZero]);

  // 添加渐变背景创建函数
  const createGradient = (ctx: CanvasRenderingContext2D, color: string) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    const rgbaColor = hexToRgba(color);
    gradient.addColorStop(0, `rgba(${rgbaColor}, 0.4)`);
    gradient.addColorStop(1, `rgba(${rgbaColor}, 0.0)`);
    return gradient;
  };

  // 添加颜色转换辅助函数
  const hexToRgba = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : 
      '0, 0, 0';
  };

  // 下载图表
  const downloadChart = () => {
    if (!chart) return;
    
    try {
      const canvas = chart.canvas;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // 保存当前状态
      ctx.save();
      
      // 填充白色背景
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 获取图片数据
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      
      // 恢复原始状态
      ctx.restore();
      
      const link = document.createElement('a');
      link.download = `chart-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('下载图表失败:', err);
    }
  };

  const getMaxValue = (data: number[]) => {
    const max = Math.max(...data);
    
    // 增加10%空间并取整
    const maxWithPadding = max * 1.1;
    
    if (maxWithPadding >= 100000) {
      // 大于等于10万的数字取整到5000
      return Math.ceil(maxWithPadding / 5000) * 5000;
    } else if (maxWithPadding >= 10000) {
      // 大于等于1万的数字取整到1000
      return Math.ceil(maxWithPadding / 1000) * 1000;
    } else if (maxWithPadding >= 1000) {
      // 大于等于1000的数字取整到100
      return Math.ceil(maxWithPadding / 100) * 100;
    } else if (maxWithPadding >= 100) {
      // 大于等于100的数字取整到10
      return Math.ceil(maxWithPadding / 10) * 10;
    } else if (maxWithPadding >= 10) {
      // 大于等于10的数字取整到5
      return Math.ceil(maxWithPadding / 5) * 5;
    } else {
      // 小于10的数字直接取整到下一个整数
      return Math.ceil(max);
    }
  };

  // 添加判断是否需要第二Y轴的函数
  const needsSecondYAxis = (datasets: any[]) => {
    // 先检查chartConfig是否存在
    if (!chartConfig) return false;
    
    // 只有折线图才考虑使用双Y轴
    if (chartConfig.chartType !== 'line') return false;
    
    if (datasets.length < 2) return false;
    
    // 计算每个系列的最大值
    const maxValues = datasets.map(dataset => 
      Math.max(...dataset.data.map((d: number) => d))
    );
    console.log('Series max values:', maxValues);
    
    // 计算最大值之间的比例
    const ratio = Math.max(...maxValues) / Math.min(...maxValues);
    console.log('Value ratio:', ratio);
    
    // 如果比例超过5倍,建议使用第二Y轴
    return ratio > 5;
  };

  return (
    <div className="min-h-screen pt-2 pb-12">
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="mb-4 flex gap-4 items-center">
          <Select
            value={chartType}
            onValueChange={handleChartTypeChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择图表类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">折线图</SelectItem>
              <SelectItem value="bar">柱状图</SelectItem>
              <SelectItem value="pie">饼图</SelectItem>
              {/*<SelectItem value="area">折线图(填充)</SelectItem>*/}
              <SelectItem value="scatter">散点图</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="start-from-zero"
              checked={startFromZero}
              onCheckedChange={setStartFromZero}
            />
            <Label htmlFor="start-from-zero" className="text-sm text-gray-600">
              Y轴从0开始
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="use-small"
              checked={useSmall}
              onCheckedChange={setUseSmall}
            />
            <Label htmlFor="use-small" className="text-sm text-gray-600">
              quick
            </Label>
          </div>

          <Button 
            onClick={handleAnalyze}
            disabled={rawData.length === 0 || isAnalyzing}
          >
            {isAnalyzing ? '分析中...' : '分析数据'}
          </Button>
        </div>

        <div className="space-y-4 mb-8">
          <textarea
            className="w-full p-3 border rounded-md"
            rows={8}
            placeholder="以自然语言输入包含数据的文字..."
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
          />
        </div>
        
        {isAnalyzing && (
          <div className="text-center text-gray-500 my-4">
            正在分析数据...
          </div>
        )}
        
        {chartConfig && (
          <div className="space-y-6">
            <div 
              id="chart-container" 
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
              style={{ 
                height: '400px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <div 
                style={{
                  position: 'relative',
                  height: '100%',
                  flex: '1',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                }}
              >
                <canvas id="chart-canvas"></canvas>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
              <div>
                <h3 className="text-base font-medium mb-2">数据洞察:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {chartConfig.insights.map((insight, i) => (
                    <li key={i}>{insight}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button onClick={downloadChart}>
                下载图表
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartGenerator;
