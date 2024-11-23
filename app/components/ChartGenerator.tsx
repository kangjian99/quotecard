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
  const [useFill, setUseFill] = useState(true);
  const [useAltApi, setUseAltApi] = useState(false);

  const analyzeDataWithAI = async (rawText: string, chartType: ChartType) => {
    try {
      // 根据开关状态决定API端点
      const apiEndpoint = useAltApi
        ? '/api/analyze-chart/groq'
        : '/api/analyze-chart';

      const response = await fetch(apiEndpoint, {
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

      // 定义series的类型
      interface Series {
        name: string;
        data: DataPoint[];
      }

      // 处理重复的series
      analysis.data.series = analysis.data.series.reduce((acc: Series[], current: Series) => {
        const isDuplicate = acc.some(item => 
          item.name === current.name && 
          item.data.length === current.data.length
        );
        if (!isDuplicate) {
          acc.push(current);
        }
        return acc;
      }, [] as Series[]);

      // 检查是否需要转置
      if (analysis.data.series.length >= analysis.data.series[0].data.length * 2) {
        // 创建新的series结构
        const transposedSeries = analysis.data.series[0].data.map((_: DataPoint, dataIndex: number) => {
          return {
            name: analysis.data.series[0].data[dataIndex].x,
            data: analysis.data.series.map((series: Series) => ({
              x: series.name,
              y: series.data[dataIndex]?.y ?? 0
            }))
          };
        });

        analysis.data.series = transposedSeries;
        
        // 交换x轴和y轴的标签
        const tempLabel = analysis.data.xAxisLabel;
        analysis.data.xAxisLabel = analysis.data.yAxisLabel;
        analysis.data.yAxisLabel = tempLabel;
        console.log('转置后的分析结果:', analysis);
      }

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

  // 修改判断是否需要第二Y轴的函数
  const assignYAxis = (datasets: any[]): string[] => {
    // 先检查chartConfig是否存在
    if (!chartConfig) return datasets.map(() => 'y');

    // 只有折线图才考虑使用双Y轴
    if (chartConfig.chartType !== 'line') return datasets.map(() => 'y');

    if (datasets.length < 2) return datasets.map(() => 'y');

    // 计算每个系列的数据范围
    const ranges = datasets.map((dataset, index) => {
      const values = dataset.data.map((d: DataPoint) => d.y);
      const max = Math.max(...values);
      const min = Math.min(...values);
      return {
        index,
        range: max - min,
        max
      };
    });

    // 按范围降序排序
    ranges.sort((a, b) => b.range - a.range);

    // 最大范围作为基准
    const baseRange = ranges[0].range;

    // 找出范围小于基准范围五分之一的系列
    const eligibleForSecondAxis = ranges.filter(r => r.range < baseRange / 5);

    if (eligibleForSecondAxis.length === 0) {
      // 没有系列需要第二Y轴
      return datasets.map(() => 'y');
    }

    // 在符合条件的系列中，选择范围最大的那个
    const secondAxisSeries = eligibleForSecondAxis.reduce((prev, current) => {
      return current.range > prev.range ? current : prev;
    }, eligibleForSecondAxis[0]);

    // 初始化所有系列使用主Y轴
    const yAxisAssignment = datasets.map(() => 'y');

    // 分配第二Y轴
    yAxisAssignment[secondAxisSeries.index] = 'y1';

    return yAxisAssignment;
  };

  // 添加判断是否使用对数轴的函数
  const shouldUseLogScale = (datasets: any[], yAxisAssignment: string[]): boolean => {
    // 获取所有使用第一Y轴的数据
    const firstAxisData = datasets
      .filter((_, index) => yAxisAssignment[index] === 'y')
      .flatMap(dataset => dataset.data.map((d: any) => {
        // 处理数据可能是对象的情况
        const value = typeof d === 'object' ? d.y : d;
        return typeof value === 'number' ? value : 0;
      }))
      .filter(value => value > 0); // 只考虑正数

    if (firstAxisData.length === 0) return false;

    const max = Math.max(...firstAxisData);
    const min = Math.min(...firstAxisData);

    // 如果最大值与最小值的比值超过50，使用对数轴
    return max / min > 50;
  };

  // 更新图表渲染的useEffect部分，以使用新的yAxisAssignment
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
          borderColor: chartConfig.style.secondaryColors?.[index] || chartConfig.style.primaryColor,
          borderWidth: 1.5,
          fill: chartConfig.chartType === 'line' ? useFill : false,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#fff',
          pointBorderWidth: 2,
          pointHoverBorderWidth: 3,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: chartConfig.style.secondaryColors[index] || chartConfig.style.primaryColor,
        };

        return baseConfig;
      });

      // 获取Y轴分配
      const yAxisAssignment = assignYAxis(chartConfig.data.series);

      // 更新datasets的yAxisID
      const updatedDatasets = datasets.map((dataset, index) => ({
        ...dataset,
        yAxisID: yAxisAssignment[index]
      }));

      if (!updatedDatasets || updatedDatasets.length === 0) {
        console.log('No datasets available');
        return;
      }

      // 计算各Y轴的最大值
      const firstAxisData = updatedDatasets.filter(d => d.yAxisID === 'y').flatMap(d => d.data);
      const secondAxisData = updatedDatasets.filter(d => d.yAxisID === 'y1').flatMap(d => d.data);

      const firstAxisMax = getMaxValue(firstAxisData);
      const secondAxisMax = secondAxisData.length > 0 ? getMaxValue(secondAxisData) : 0;

      const newChart = new Chart(canvas, {
        type: chartConfig.chartType,
        plugins: [ChartDataLabels],
        data: {
          labels: chartConfig.data.series[0].data.map(d => d.x),
          datasets: updatedDatasets
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
                pointStyle: chartConfig.chartType === 'bar' ? 'rect' : 'circle',
                padding: 25,
                font: {
                  size: 13,
                  family: "'Inter', sans-serif"
                },
                boxWidth: 8,
                boxHeight: 8,
                generateLabels: function(chart) {
                  const original = Chart.defaults.plugins.legend.labels.generateLabels(chart);
                  original.forEach(label => {
                    if (label.text && typeof label.text === 'string') {
                      const chineseCharCount = (label.text.match(/[\u4e00-\u9fa5]/g) || []).length;
                      if (chineseCharCount > 6) {
                        // 将文本按每6个中文字符进行拆分
                        const regex = /([\u4e00-\u9fa5]{1,6})/g;
                        const parts = label.text.match(regex);
                        if (parts) {
                          // 将拆分后的数组赋值给 label.text
                          (label as any).text = parts;
                        }
                      }
                    }
                  });
                  return original;
                }
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
                  weight: 'bold',
                  family: "'Inter', sans-serif"
                },
                color: 'rgba(0, 0, 0, 0.8)'
              },
              ticks: {
                font: {
                  size: 12,
                  family: "'Inter', sans-serif"
                },
                color: chartConfig.style.primaryColor || 'rgba(0, 0, 0, 0.6)'
              }
            },
            y: {
              type: shouldUseLogScale(chartConfig.data.series, yAxisAssignment) ? 'logarithmic' : 'linear',
              beginAtZero: startFromZero,
              min: startFromZero ? 0 : undefined,
              max: firstAxisMax,
              grid: {
                display: chartConfig.style.showGrid,
                color: 'rgba(0, 0, 0, 0.05)',
              },
              title: {
                display: true,
                text: yAxisAssignment.includes('y1') // 如果存在Y1轴，则Y轴使用对应系列的name
                  ? chartConfig.data.series.find((s, idx) => yAxisAssignment[idx] === 'y')?.name || 'Y轴' 
                  : chartConfig.data.yAxisLabel || chartConfig.data.series[0].name,
                font: {
                  size: 13,
                  weight: 'bold',
                  family: "'Inter', sans-serif"
                },
                color: 'rgba(0, 0, 0, 0.8)'
              },
              ticks: {
                font: {
                  size: 12,
                  family: "'Inter', sans-serif"
                },
                padding: chartConfig.chartType === 'line' ? 12 : 8,
                color: 'rgba(0, 0, 0, 0.6)',
                callback: function(tickValue: string | number) {
                  // 确保tickValue是数字
                  const value = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
                  
                  if (isNaN(value)) return '';
                  
                  if (this.type === 'logarithmic') {
                    const log10 = Math.log10(value);
                    // 只显示10的幂的刻度
                    if (log10 % 1 === 0) {
                      return value.toLocaleString();
                    }
                    return '';
                  }
                  return value;
                }
              }
            },
            ...(secondAxisMax > 0 ? {
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
                  text: chartConfig.data.series.find((s: any, idx: number) => yAxisAssignment[idx] === 'y1')?.name || 'Y1轴',
                  font: {
                    size: 13,
                    weight: 'bold',
                    family: "'Inter', sans-serif"
                  },
                  color: chartConfig.style.secondaryColors?.[2] || 'rgba(0, 0, 0, 0.8)'
                },
                ticks: {
                  font: {
                    size: 12,
                    family: "'Inter', sans-serif"
                  },
                  padding: 12,
                  color: 'rgba(0, 0, 0, 0.6)',
                  callback: function(tickValue: string | number) {
                    // 确保tickValue是数字
                    const value = typeof tickValue === 'number' ? tickValue : parseFloat(tickValue);
                    
                    if (isNaN(value)) return '';
                    
                    if (this.type === 'logarithmic') {
                      const log10 = Math.log10(value);
                      // 只显示10的幂的刻度
                      if (log10 % 1 === 0) {
                        return value.toLocaleString();
                      }
                      return '';
                    }
                    return value;
                  }
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
  }, [chartConfig, startFromZero, useFill]);

  // 添加渐变背景创建函数
  const createGradient = (ctx: CanvasRenderingContext2D, color: string) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    const rgbaColor = hexToRgba(color);
    gradient.addColorStop(0, `rgba(${rgbaColor}, 0.2)`);
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
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2 w-20">
                <Switch
                  id="use-small"
                  checked={useSmall}
                  onCheckedChange={setUseSmall}
                />
                <Label htmlFor="use-small" className="text-sm text-gray-600">
                  ⚡️
                </Label>
              </div>
              <div className="flex items-center space-x-2 w-28">
                <Switch
                  id="use-alt"
                  checked={useAltApi}
                  onCheckedChange={setUseAltApi}
                />
                <Label htmlFor="use-alt" className="text-xs text-gray-600">
                  ALT
                </Label>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2 w-20">
                <Switch
                  id="use-fill"
                  checked={useFill}
                  onCheckedChange={setUseFill}
                />
                <Label htmlFor="use-fill" className="text-sm text-gray-600">
                  填充
                </Label>
              </div>
              <div className="flex items-center space-x-2 w-28">
                  <Switch
                    id="start-from-zero"
                    checked={startFromZero}
                    onCheckedChange={setStartFromZero}
                  />
                  <Label htmlFor="start-from-zero" className="text-sm text-gray-600">
                    Y轴起点0
                </Label>
              </div>
            </div>
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
