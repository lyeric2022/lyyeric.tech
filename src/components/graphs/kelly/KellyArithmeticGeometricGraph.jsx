import React, { useState } from 'react';
import './KellyGraph.scss';

const KellyArithmeticGeometricGraph = () => {
  const [numBets, setNumBets] = useState(20);
  
  // Parameters: 50% chance to win 60%, 50% chance to lose 40%
  const p = 0.5;
  const winMultiplier = 1.6; // Win 60%
  const lossMultiplier = 0.6; // Lose 40%
  
  // Calculate Kelly fraction: f* = (bp - (1-p)) / b
  // b = 1.5 (win 60% vs lose 40%, so b = 0.6/0.4 = 1.5)
  const b = 1.5;
  const kellyFraction = (b * p - (1 - p)) / b; // 0.167 (16.7%)
  
  // Different bet strategies
  const strategies = [
    { 
      label: 'Full Bankroll (100%)', 
      fraction: 1.0, 
      color: 'var(--color-accent-secondary)',
      style: 'dashed'
    },
    { 
      label: 'Kelly (16.7%)', 
      fraction: kellyFraction, 
      color: 'var(--color-accent-primary)',
      style: 'solid'
    }
  ];
  
  // Calculate expected paths for each strategy
  const calculatePath = (fraction) => {
    const path = [{ bet: 0, wealth: 1.0 }];
    let wealth = 1.0;
    
    for (let bet = 1; bet <= numBets; bet++) {
      // Expected logarithmic growth per bet
      const winMultiplierBet = 1 + (winMultiplier - 1) * fraction;
      const lossMultiplierBet = 1 - (1 - lossMultiplier) * fraction;
      
      // Geometric mean (expected log wealth)
      const geometricGrowth = Math.pow(
        Math.pow(winMultiplierBet, p) * Math.pow(lossMultiplierBet, 1 - p),
        1
      );
      
      wealth *= geometricGrowth;
      path.push({ bet, wealth });
    }
    
    return path;
  };
  
  const paths = strategies.map(strategy => ({
    ...strategy,
    data: calculatePath(strategy.fraction)
  }));
  
  // Find min/max for scaling
  const allWealths = paths.flatMap(path => path.data.map(d => d.wealth));
  const minWealth = Math.min(...allWealths, 0.1);
  const maxWealth = Math.max(...allWealths);
  const range = maxWealth - minWealth;
  const paddingAmount = range * 0.1;
  const adjustedMin = Math.max(0.01, minWealth - paddingAmount);
  const adjustedMax = maxWealth + paddingAmount;
  const adjustedRange = adjustedMax - adjustedMin;
  
  // Graph dimensions
  const width = 600;
  const height = 400;
  const padding = 50;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;
  
  // Generate y-axis ticks
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
  
  return (
    <div className="kelly-graph">
      <div className="graph-controls">
        <div className="control-group">
          <label htmlFor="num-bets-kelly-ag">
            Number of Bets: <strong>{numBets}</strong>
          </label>
          <input
            id="num-bets-kelly-ag"
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
          <pattern id="grid-kelly-ag" width="40" height="30" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 30" fill="none" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid-kelly-ag)" />
        
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
        
        {/* Strategy paths */}
        {paths.map((strategy, idx) => {
          const pathData = strategy.data
            .map((point, i) => {
              const x = padding + (point.bet / numBets) * graphWidth;
              const y = padding + graphHeight - ((point.wealth - adjustedMin) / adjustedRange) * graphHeight;
              return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
            })
            .join(' ');
          
          return (
            <path
              key={idx}
              d={pathData}
              fill="none"
              stroke={strategy.color}
              strokeWidth="2.5"
              strokeDasharray={strategy.style === 'dashed' ? "6,4" : "none"}
              opacity="0.9"
            />
          );
        })}
        
        {/* Labels */}
        <text x={width / 2} y={height - 10} textAnchor="middle" fill="var(--color-text)" fontSize="12" fontFamily="Inter, sans-serif">
          Number of Bets
        </text>
        <text x={15} y={height / 2} textAnchor="middle" fill="var(--color-text)" fontSize="12" fontFamily="Inter, sans-serif" transform={`rotate(-90, 15, ${height / 2})`}>
          Wealth (Multiplier)
        </text>
        
        {/* Title */}
        <text x={width / 2} y={20} textAnchor="middle" fill="var(--color-text)" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="bold">
          Full Bankroll vs Kelly: Turning Losses into Gains
        </text>
      </svg>
      
      {/* Legend */}
      <div className="strategy-legend">
        {paths.map((strategy, idx) => (
          <div key={idx} className="legend-item">
            {strategy.style === 'dashed' ? (
              <svg width="20" height="3" style={{ marginRight: '0.5rem' }}>
                <line x1="0" y1="1.5" x2="20" y2="1.5" stroke={strategy.color} strokeWidth="2.5" strokeDasharray="6,4" />
              </svg>
            ) : (
              <div className="legend-color" style={{ backgroundColor: strategy.color }}></div>
            )}
            <span>{strategy.label}</span>
          </div>
        ))}
      </div>
      
      <p className="graph-caption">
        Full bankroll (100%) declines due to geometric drag. Kelly (16.7%) optimizes for geometric growth. 
        After {numBets} bets: full bankroll = {paths[0].data[paths[0].data.length - 1].wealth.toFixed(2)}x, Kelly = {paths[1].data[paths[1].data.length - 1].wealth.toFixed(2)}x.
      </p>
    </div>
  );
};

export default KellyArithmeticGeometricGraph;

