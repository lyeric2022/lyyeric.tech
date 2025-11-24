import React, { useState } from 'react';
import './KellyGraph.scss';

const KellyGraph = () => {
  // Interactive state
  const [p, setP] = useState(0.55); // probability of winning (0 to 1)
  const [b, setB] = useState(1); // net odds
  
  // Calculate Kelly fraction: f* = (bp - (1-p)) / b
  const kellyFraction = Math.max(0, (b * p - (1 - p)) / b);
  
  // Generate data points for the graph
  const dataPoints = [];
  const maxF = Math.min(1.0, 1 / (1 + b)); // Prevent negative multipliers
  for (let f = 0; f <= maxF; f += 0.01) {
    // Expected logarithmic growth: G = p*ln(1+bf) + (1-p)*ln(1-f)
    const winMultiplier = 1 + b * f;
    const lossMultiplier = Math.max(0.001, 1 - f); // Prevent log(0)
    const growth = p * Math.log(winMultiplier) + (1 - p) * Math.log(lossMultiplier);
    dataPoints.push({ f, growth });
  }
  
  // Find max growth point
  const maxGrowth = Math.max(...dataPoints.map(d => d.growth));
  const minGrowth = Math.min(...dataPoints.map(d => d.growth));
  const range = maxGrowth - minGrowth;
  
  // Graph dimensions
  const width = 400;
  const height = 250;
  const padding = 40;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;
  
  // Convert data to SVG path
  const pathData = dataPoints
    .map((point, i) => {
      const x = padding + (point.f / maxF * graphWidth);
      const y = padding + graphHeight - ((point.growth - minGrowth) / range) * graphHeight;
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');
  
  // Kelly fraction point - find the closest data point
  const kellyDataPoint = dataPoints.reduce((closest, current) => {
    return Math.abs(current.f - kellyFraction) < Math.abs(closest.f - kellyFraction) ? current : closest;
  });
  const kellyX = padding + (kellyFraction / maxF * graphWidth);
  const kellyY = padding + graphHeight - ((kellyDataPoint.growth - minGrowth) / range) * graphHeight;
  
  return (
    <div className="kelly-graph">
      <div className="graph-controls">
        <div className="control-group">
          <label htmlFor="win-prob">
            Win Probability (p): <strong>{(p * 100).toFixed(0)}%</strong>
          </label>
          <input
            id="win-prob"
            type="range"
            min="0.51"
            max="0.95"
            step="0.01"
            value={p}
            onChange={(e) => setP(parseFloat(e.target.value))}
          />
        </div>
        <div className="control-group">
          <label htmlFor="odds">
            Payout Ratio (b): <strong>{b.toFixed(2)}</strong>
          </label>
          <input
            id="odds"
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={b}
            onChange={(e) => setB(parseFloat(e.target.value))}
          />
        </div>
      </div>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="25" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 25" fill="none" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />
        
        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--color-text)" strokeWidth="2"/>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--color-text)" strokeWidth="2"/>
        
        {/* Graph line */}
        <path d={pathData} fill="none" stroke="var(--color-accent-primary)" strokeWidth="2"/>
        
        {/* Kelly fraction marker - only show if valid */}
        {kellyFraction > 0 && kellyFraction <= maxF && (
          <>
            <circle cx={kellyX} cy={kellyY} r="5" fill="var(--color-accent-secondary)"/>
            <line x1={kellyX} y1={height - padding} x2={kellyX} y2={kellyY} stroke="var(--color-accent-secondary)" strokeWidth="1" strokeDasharray="3,3" opacity="0.6"/>
          </>
        )}
        
        {/* Labels */}
        <text x={width / 2} y={height - 10} textAnchor="middle" fill="var(--color-text)" fontSize="12" fontFamily="Inter, sans-serif">
          Bet Fraction (f)
        </text>
        <text x={15} y={height / 2} textAnchor="middle" fill="var(--color-text)" fontSize="12" fontFamily="Inter, sans-serif" transform={`rotate(-90, 15, ${height / 2})`}>
          Expected Growth
        </text>
        
        {/* Axis values */}
        <text x={padding} y={height - padding + 20} textAnchor="middle" fill="var(--color-text-muted)" fontSize="10" fontFamily="Inter, sans-serif">0</text>
        <text x={width - padding} y={height - padding + 20} textAnchor="middle" fill="var(--color-text-muted)" fontSize="10" fontFamily="Inter, sans-serif">{maxF.toFixed(2)}</text>
        {kellyFraction > 0 && kellyFraction <= maxF && (
          <text x={kellyX} y={height - padding + 20} textAnchor="middle" fill="var(--color-accent-secondary)" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="bold">
            {kellyFraction.toFixed(2)}
          </text>
        )}
        
        {/* Title */}
        <text x={width / 2} y={20} textAnchor="middle" fill="var(--color-text)" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="bold">
          Kelly Criterion: Expected Growth vs Bet Fraction
        </text>
      </svg>
      <p className="graph-caption">
        Optimal Kelly fraction: <strong>{kellyFraction > 0 ? kellyFraction.toFixed(2) : '0.00'}</strong> ({kellyFraction > 0 ? Math.round(kellyFraction * 100) : 0}% of bankroll). 
        {kellyFraction <= 0 && ' No positive edge—do not bet.'}
      </p>
    </div>
  );
};

export default KellyGraph;

