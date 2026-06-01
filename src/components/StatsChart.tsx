import React from 'react';
import { ChartDataPoint } from '../types';

interface StatsChartProps {
  data: ChartDataPoint[];
}

export default function StatsChart({ data }: StatsChartProps) {
  if (data.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-48 rounded-xl bg-bg-charcoal/50 border border-mt-gray/10 text-mt-gray">
        <p className="text-sm font-mono">Real-time typing metric chart will appear here</p>
        <p className="text-xs font-mono mt-1 opacity-70">Type at least 2 seconds to plot your trajectory</p>
      </div>
    );
  }

  // Dimensions
  const width = 600;
  const height = 180;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max and Min values
  const wpms = data.map(d => d.wpm);
  const maxWpm = Math.max(...wpms, 40); // Baseline max WPM at least 40

  const getCoordinates = () => {
    return data.map((point, index) => {
      const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
      // Invert Y because SVG coordinates start from top-left (0,0)
      const y = paddingTop + chartHeight - (point.wpm / maxWpm) * chartHeight;
      return { x, y, ...point };
    });
  };

  const coords = getCoordinates();

  // Create SVG path for line
  const linePath = coords.reduce((acc, coord, idx) => {
    const command = idx === 0 ? 'M' : 'L';
    return `${acc} ${command} ${coord.x.toFixed(1)} ${coord.y.toFixed(1)}`;
  }, '');

  // Create SVG path for filled gradient area
  const areaPath = coords.length > 0
    ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} L ${coords[0].x.toFixed(1)} ${(paddingTop + chartHeight).toFixed(1)} Z`
    : '';

  // Calculate ticks
  const wpmTicks = [0, Math.round(maxWpm / 2), Math.round(maxWpm)];
  const secondTicks = data.length > 10 
    ? [0, Math.round(data.length / 2), data.length - 1]
    : data.map((_, i) => i);

  return (
    <div className="w-full bg-bg-charcoal/40 border border-mt-gray/10 p-4 rounded-xl shadow-lg relative overflow-hidden" id="stats-chart-wrapper">
      <div className="flex items-center justify-between mb-3 border-b border-mt-gray/15 pb-2">
        <h4 className="text-xs uppercase tracking-wider text-mt-gray font-semibold font-mono">WPM Trajectory Over Time</h4>
        <span className="text-[10px] font-mono text-amber-select bg-amber-select/10 px-2 py-0.5 rounded">
          Peak Speed: {Math.max(...wpms).toFixed(0)} WPM
        </span>
      </div>
      
      <svg className="w-full h-auto overflow-visible select-none" viewBox={`0 0 ${width} ${height}`} id="typing-test-svg-chart">
        <defs>
          <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e2b714" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#e2b714" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y Axis Gridlines and Ticks */}
        {wpmTicks.map((val, idx) => {
          const y = paddingTop + chartHeight - (val / maxWpm) * chartHeight;
          return (
            <g key={`y-grid-${idx}`} className="opacity-30">
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={width - paddingRight} 
                y2={y} 
                className="stroke-mt-gray" 
                strokeWidth="1" 
                strokeDasharray="4,4"
              />
              <text 
                x={paddingLeft - 8} 
                y={y + 4} 
                className="fill-mt-gray font-mono text-[10px] text-right"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* X Axis Gridlines and Ticks */}
        {secondTicks.map((idx) => {
          if (idx >= data.length) return null;
          const point = data[idx];
          const x = paddingLeft + (idx / (data.length - 1)) * chartWidth;
          return (
            <g key={`x-grid-${idx}`} className="opacity-30">
              <line 
                x1={x} 
                y1={paddingTop} 
                x2={x} 
                y2={paddingTop + chartHeight} 
                className="stroke-mt-gray" 
                strokeWidth="0.5" 
                strokeDasharray="2,2"
              />
              <text 
                x={x} 
                y={paddingTop + chartHeight + 16} 
                className="fill-mt-gray font-mono text-[10px]"
                textAnchor="middle"
              >
                {point.second}s
              </text>
            </g>
          );
        })}

        {/* Highlight points where errors happened */}
        {coords.map((coord, idx) => {
          if (coord.errors > 0) {
            return (
              <g key={`error-pt-${idx}`}>
                <circle 
                  cx={coord.x} 
                  cy={coord.y} 
                  r="4" 
                  className="fill-mt-error opacity-40 hover:opacity-100 transition-opacity" 
                />
                <circle 
                  cx={coord.x} 
                  cy={coord.y} 
                  r="2" 
                  className="fill-mt-error" 
                />
              </g>
            );
          }
          return null;
        })}

        {/* Filled Area Gradient */}
        <path 
          d={areaPath} 
          className="fill-[url(#chart-glow)]"
        />

        {/* Trend line */}
        <path 
          d={linePath} 
          className="stroke-amber-select" 
          strokeWidth="2.5" 
          fill="none" 
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Individual data point nodes */}
        {coords.map((coord, idx) => (
          <circle 
            key={`node-pt-${idx}`}
            cx={coord.x} 
            cy={coord.y} 
            r="3" 
            className="fill-amber-select cursor-pointer opacity-0 hover:opacity-100 transition-opacity" 
            title={`WPM: ${coord.wpm.toFixed(1)}`}
          />
        ))}
      </svg>
    </div>
  );
}
