import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, CandlestickSeries, HistogramSeries, LineSeries, AreaSeries } from 'lightweight-charts';

// Simple Moving Average calculator
const calculateSMA = (data, count) => {
  const avg = (values) => values.reduce((sum, val) => sum + val, 0) / values.length;
  const result = [];
  for (let i = count - 1; i < data.length; i++) {
    const subset = data.slice(i - count + 1, i + 1).map(d => d.close);
    result.push({ time: data[i].time, value: avg(subset) });
  }
  return result;
};

export const TradingViewChart = ({ 
    data = [], 
    backgroundColor = 'transparent',
    textColor = 'rgba(255, 255, 255, 0.9)',
    chartType = 'candlestick' // 'candlestick', 'line', 'area'
}) => {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    if (data.length === 0) return;

    // Create chart instance
    const handleResize = () => {
      chartRef.current?.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: backgroundColor },
        textColor,
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 350,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      }
    });

    chartRef.current = chart;

    // 1. Main Series
    let mainSeries;
    if (chartType === 'candlestick') {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#22c55e', // green-500
        downColor: '#ef4444', // red-500
        borderVisible: false,
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444',
      });
      mainSeries.setData(data.map(d => ({
          time: d.time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close
      })));
    } else if (chartType === 'line') {
      mainSeries = chart.addSeries(LineSeries, {
          color: '#22c55e',
          lineWidth: 2,
          crosshairMarkerVisible: true,
      });
      mainSeries.setData(data.map(d => ({ time: d.time, value: d.close })));
    } else if (chartType === 'area') {
      mainSeries = chart.addSeries(AreaSeries, {
          lineColor: '#22c55e',
          topColor: 'rgba(34, 197, 94, 0.4)',
          bottomColor: 'rgba(34, 197, 94, 0)',
          lineWidth: 2,
      });
      mainSeries.setData(data.map(d => ({ time: d.time, value: d.close })));
    }

    // 2. Volume Series (Histogram)
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#38bdf8', // sky-400
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '', // set as an overlay by setting a blank priceScaleId
    });
    
    // Scale volume slightly smaller
    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.8, // highest point of the series will be at 80% of the chart height
        bottom: 0,
      },
    });

    volumeSeries.setData(data.map(d => ({
        time: d.time,
        value: d.value,
        color: d.close >= d.open ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)' // light green or red based on candle
    })));

    // 3. Moving Average Series
    if (data.length >= 20) {
        const smaData = calculateSMA(data, 20);
        const smaSeries = chart.addSeries(LineSeries, {
            color: '#8b5cf6', // violet-500
            lineWidth: 2,
            crosshairMarkerVisible: false,
            lastValueVisible: false,
            priceLineVisible: false,
        });
        smaSeries.setData(smaData);
    }

    // Fit chart
    chart.timeScale().fitContent();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, backgroundColor, textColor, chartType]);

  if (data.length === 0) {
      return (
          <div className="w-full h-[350px] flex items-center justify-center text-white/20 text-xs uppercase tracking-widest">
              Insufficient Data for Charting
          </div>
      );
  }

  return (
    <div className="relative w-full h-[350px]">
        {/* Simple Legend Overlay */}
        <div className="absolute top-2 left-4 z-10 flex gap-4 text-[10px] uppercase font-bold tracking-widest">
            <span className="text-white">Price</span>
            <span className="text-violet-500">SMA(20)</span>
            <span className="text-sky-400">Vol</span>
        </div>
        <div ref={chartContainerRef} className="w-full h-full [&_a]:hidden" />
    </div>
  );
};
