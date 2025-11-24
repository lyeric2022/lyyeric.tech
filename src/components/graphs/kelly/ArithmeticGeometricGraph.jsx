import React, { useState } from 'react';
import './KellyGraph.scss';

const ArithmeticGeometricGraph = () => {
  const [numBets, setNumBets] = useState(10);
  
  // Parameters: 50% chance to win 60%, 50% chance to lose 40%
  const p = 0.5;
  const winMultiplier = 1.6;
  const lossMultiplier = 0.6;
  
  // Calculate arithmetic mean
  const arithmeticMean = (p * winMultiplier + (1 - p) * lossMultiplier);
  
  // Calculate geometric mean
  const geometricMean = Math.pow(Math.pow(winMultiplier, p) * Math.pow(lossMultiplier, 1 - p), 1);
  
  // Simulate paths
  const simulatePaths = (numPaths = 100) => {
    const paths = [];
    for (let i = 0; i < numPaths; i++) {
      let wealth = 1.0;
      const path = [{ bet: 0, wealth: 1.0 }];
      
      for (let bet = 1; bet <= numBets; bet++) {
        const win = Math.random() < p;
        wealth = win ? wealth * winMultiplier : wealth * lossMultiplier;
        path.push({ bet, wealth });
      }
      
      paths.push(path);
    }
    return paths;
  };
  
  const paths = simulatePaths(100);
  
  // Calculate arithmetic and geometric expected paths
  const arithmeticPath = [];
  const geometricPath = [];
  let arithmeticWealth = 1.0;
  let geometricWealth = 1.0;
  
  for (let bet = 0; bet <= numBets; bet++) {
    arithmeticPath.push({ bet, wealth: arithmeticWealth });
    geometricPath.push({ bet, wealth: geometricWealth });
    arithmeticWealth *= arithmeticMean;
    geometricWealth *= geometricMean;
  }
  
  // Find min/max for scaling - use actual data ranges, not simulated paths
  const arithmeticWealths = arithmeticPath.map(p => p.wealth);
  const geometricWealths = geometricPath.map(p => p.wealth);
  const minWealth = Math.min(...geometricWealths, ...arithmeticWealths);
  const maxWealth = Math.max(...arithmeticWealths);
  const range = maxWealth - minWealth;
  
  // Add small padding (2%) instead of 10%
  const paddingAmount = range * 0.02;
  const adjustedMin = Math.max(0, minWealth - paddingAmount);
  const adjustedMax = maxWealth + paddingAmount;
  const adjustedRange = adjustedMax - adjustedMin;
  
  // Generate y-axis tick values
  const generateYTicks = () => {
    const ticks = [];
    const numTicks = 6;
    for (let i = 0; i <= numTicks; i++) {
      const value = adjustedMin + (adjustedRange / numTicks) * i;
      ticks.push(value);
    }
    return ticks;
  };
  
  const yTickValues = generateYTicks();
  
  // Graph dimensions
  const width = 600;
  const height = 400;
  const padding = 50;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;
  
  // Arithmetic mean path
  const arithmeticPathData = arithmeticPath
    .map((point, i) => {
      const x = padding + (point.bet / numBets) * graphWidth;
      const y = padding + graphHeight - ((point.wealth - adjustedMin) / adjustedRange) * graphHeight;
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');
  
  // Geometric mean path
  const geometricPathData = geometricPath
    .map((point, i) => {
      const x = padding + (point.bet / numBets) * graphWidth;
      const y = padding + graphHeight - ((point.wealth - adjustedMin) / adjustedRange) * graphHeight;
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');
  
  return (
    <div className="kelly-graph">
      <div className="graph-controls">
        <div className="control-group">
          <label htmlFor="num-bets-ag">
            Number of Bets: <strong>{numBets}</strong>
          </label>
          <input
            id="num-bets-ag"
            type="range"
            min="5"
            max="100"
            step="1"
            value={numBets}
            onChange={(e) => setNumBets(parseInt(e.target.value))}
          />
        </div>
      </div>
      
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid */}
        <defs>
          <pattern id="grid-ag" width="40" height="30" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 30" fill="none" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid-ag)" />
        
        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--color-text)" strokeWidth="2"/>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--color-text)" strokeWidth="2"/>
        
        {/* Y-axis ticks and labels */}
        {yTickValues.map((value, i) => {
          const y = padding + graphHeight - ((value - adjustedMin) / adjustedRange) * graphHeight;
          return (
            <g key={`y-${i}`}>
              <line x1={padding - 5} y1={y} x2={padding} y2={y} stroke="var(--color-text)" strokeWidth="1"/>
              <text 
                x={padding - 10} 
                y={y + 4} 
                textAnchor="end" 
                fill="var(--color-text-muted)" 
                fontSize="9" 
                fontFamily="Inter, sans-serif"
              >
                {value.toFixed(2)}x
              </text>
            </g>
          );
        })}
        
        {/* Arithmetic mean path */}
        <path
          d={arithmeticPathData}
          fill="none"
          stroke="var(--color-accent-secondary)"
          strokeWidth="2.5"
          strokeDasharray="6,4"
          opacity="0.9"
        />
        
        {/* Geometric mean path */}
        <path
          d={geometricPathData}
          fill="none"
          stroke="var(--color-accent-primary)"
          strokeWidth="2.5"
          opacity="0.9"
        />
        
        {/* Labels */}
        <text x={width / 2} y={height - 10} textAnchor="middle" fill="var(--color-text)" fontSize="12" fontFamily="Inter, sans-serif">
          Number of Bets
        </text>
        <text x={15} y={height / 2} textAnchor="middle" fill="var(--color-text)" fontSize="12" fontFamily="Inter, sans-serif" transform={`rotate(-90, 15, ${height / 2})`}>
          Wealth (Multiplier)
        </text>
        
        {/* Title */}
        <text x={width / 2} y={20} textAnchor="middle" fill="var(--color-text)" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="bold">
          Arithmetic vs Geometric Mean: Wealth Over Time
        </text>
      </svg>
      
      {/* Legend */}
      <div className="strategy-legend">
        <div className="legend-item">
          <svg width="20" height="3" style={{ marginRight: '0.5rem' }}>
            <line x1="0" y1="1.5" x2="20" y2="1.5" stroke="var(--color-accent-secondary)" strokeWidth="2.5" strokeDasharray="6,4" />
          </svg>
          <span>Arithmetic Mean (overestimates)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: 'var(--color-accent-primary)' }}></div>
          <span>Geometric Mean (actual experience)</span>
        </div>
      </div>
      
      <p className="graph-caption">
        Arithmetic mean: {((arithmeticMean - 1) * 100).toFixed(1)}% per bet. Geometric mean: {((geometricMean - 1) * 100).toFixed(1)}% per bet. 
        After {numBets} bets: arithmetic = {arithmeticPath[arithmeticPath.length - 1].wealth.toFixed(2)}x, geometric = {geometricPath[geometricPath.length - 1].wealth.toFixed(2)}x.
      </p>
    </div>
  );
};

export default ArithmeticGeometricGraph;

