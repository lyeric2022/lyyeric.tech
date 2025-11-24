import React from 'react';
import './KellyGraph.scss';

const FractionalKellyGraph = () => {
  const p = 0.6; // probability of winning
  const b = 1; // net odds
  const kellyFraction = (b * p - (1 - p)) / b;
  
  // Different fractional Kelly strategies - more points for smoother curve
  const fractions = [
    { label: '0.1x Kelly', multiplier: 0.1, color: '#9b59b6', showLabel: false },
    { label: '0.25x Kelly', multiplier: 0.25, color: '#4d4dff', showLabel: true },
    { label: '0.5x Kelly', multiplier: 0.5, color: '#0066cc', showLabel: true },
    { label: '0.75x Kelly', multiplier: 0.75, color: '#3498db', showLabel: false },
    { label: 'Full Kelly', multiplier: 1.0, color: '#83bfff', showLabel: true },
    { label: '1.25x Kelly', multiplier: 1.25, color: '#e74c3c', showLabel: false }
  ];
  
  // Generate risk vs growth data for each fractional Kelly
  const allDataPoints = fractions.map(({ multiplier, color, label, showLabel }) => {
    const actualBet = kellyFraction * multiplier;
    
    // Calculate expected logarithmic growth per bet
    const winMultiplier = 1 + b * actualBet;
    const lossMultiplier = 1 - actualBet;
    
    // Ensure we don't go negative (ruin)
    if (lossMultiplier <= 0) {
      return { multiplier, color, label, showLabel, expectedGrowthPerBet: -Infinity, stdDev: Infinity };
    }
    
    const expectedGrowthPerBet = p * Math.log(winMultiplier) + (1 - p) * Math.log(lossMultiplier);
    
    // Calculate variance/risk (standard deviation of outcomes)
    const expectedValue = p * winMultiplier + (1 - p) * lossMultiplier;
    const variance = p * Math.pow(winMultiplier - expectedValue, 2) + (1 - p) * Math.pow(lossMultiplier - expectedValue, 2);
    const stdDev = Math.sqrt(variance);
    
    return { multiplier, color, label, showLabel, expectedGrowthPerBet, stdDev };
  }).filter(d => isFinite(d.expectedGrowthPerBet) && isFinite(d.stdDev)); // Filter out invalid points
  
  // Calculate risk premium metrics (relative to Full Kelly)
  const fullKellyData = allDataPoints.find(d => d.multiplier === 1.0);
  const riskPremiums = allDataPoints.map(data => {
    if (data.multiplier === 1.0) {
      return { ...data, growthRatio: 1.0, safetyRatio: 1.0 };
    }
    const growthRatio = data.expectedGrowthPerBet / fullKellyData.expectedGrowthPerBet;
    const safetyRatio = fullKellyData.stdDev / data.stdDev; // Higher safety ratio = more safe
    return { ...data, growthRatio, safetyRatio };
  });
  
  // Graph dimensions
  const width = 500;
  const height = 350;
  const padding = 50;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;
  
  // Find max and min for scaling (risk on x-axis, growth on y-axis)
  const allRisks = allDataPoints.map(d => d.stdDev);
  const allGrowths = allDataPoints.map(d => d.expectedGrowthPerBet);
  const minRisk = 0;
  const maxRisk = Math.max(...allRisks) * 1.1;
  const minGrowth = Math.min(...allGrowths) * 1.1;
  const maxGrowth = Math.max(...allGrowths) * 1.1;
  const riskRange = maxRisk - minRisk;
  const growthRange = maxGrowth - minGrowth;
  
  // Sort by risk for smooth curve
  const sortedPoints = [...allDataPoints].sort((a, b) => a.stdDev - b.stdDev);
  
  // Generate curve path connecting all points
  const curvePath = sortedPoints
    .map((point, i) => {
      const x = padding + ((point.stdDev - minRisk) / riskRange) * graphWidth;
      const y = padding + graphHeight - ((point.expectedGrowthPerBet - minGrowth) / growthRange) * graphHeight;
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');
  
  return (
    <div className="kelly-graph">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid */}
        <defs>
          <pattern id="grid2" width="40" height="25" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 25" fill="none" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid2)" />
        
        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--color-text)" strokeWidth="2"/>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--color-text)" strokeWidth="2"/>
        
        {/* Efficient frontier curve */}
        <path d={curvePath} fill="none" stroke="var(--color-accent-primary)" strokeWidth="2" opacity="0.6"/>
        
        {/* Data points */}
        {allDataPoints.map((point, i) => {
          const x = padding + ((point.stdDev - minRisk) / riskRange) * graphWidth;
          const y = padding + graphHeight - ((point.expectedGrowthPerBet - minGrowth) / growthRange) * graphHeight;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="5" fill={point.color} stroke="var(--color-background)" strokeWidth="2"/>
              {point.showLabel && (
                <text 
                  x={x + 8} 
                  y={y - 8} 
                  fill={point.color} 
                  fontSize="10" 
                  fontFamily="Inter, sans-serif" 
                  fontWeight="600"
                >
                  {point.label}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Labels */}
        <text x={width / 2} y={height - 10} textAnchor="middle" fill="var(--color-text)" fontSize="12" fontFamily="Inter, sans-serif">
          Risk (Standard Deviation)
        </text>
        <text x={15} y={height / 2} textAnchor="middle" fill="var(--color-text)" fontSize="12" fontFamily="Inter, sans-serif" transform={`rotate(-90, 15, ${height / 2})`}>
          Expected Growth (log per bet)
        </text>
        
        {/* Title */}
        <text x={width / 2} y={20} textAnchor="middle" fill="var(--color-text)" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="bold">
          Fractional Kelly: Risk vs Growth Trade-off
        </text>
      </svg>
      <p className="graph-caption">
        Half Kelly (~75% growth, ~2x safer) sits on a risk-adjusted portion of the curve.
      </p>
    </div>
  );
};

export default FractionalKellyGraph;

