import React, { useState } from 'react';
import './KellyGraph.scss';

const StrategyComparison = () => {
  const [p, setP] = useState(0.6); // win probability
  const [b, setB] = useState(1); // payout ratio
  const [numBets, setNumBets] = useState(100);

  // Calculate Kelly fraction
  const kellyFraction = Math.max(0, (b * p - (1 - p)) / b);
  
  // Strategies to compare
  const strategies = [
    {
      name: 'Kelly Criterion',
      getBetSize: (bankroll) => bankroll * kellyFraction,
      color: '#4a90e2'
    },
    {
      name: 'Fixed Fractional (5%)',
      getBetSize: (bankroll) => bankroll * 0.05,
      color: '#50c878'
    },
    {
      name: 'Fixed Fractional (10%)',
      getBetSize: (bankroll) => bankroll * 0.10,
      color: '#f39c12'
    },
    {
      name: 'Fixed Bet ($10)',
      getBetSize: () => 10,
      color: '#e74c3c'
    },
    {
      name: 'Conservative (2%)',
      getBetSize: (bankroll) => bankroll * 0.02,
      color: '#9b59b6'
    }
  ];

  // Simulate each strategy
  const simulateStrategy = (strategy, initialBankroll = 1000) => {
    let bankroll = initialBankroll;
    const path = [{ bet: 0, wealth: bankroll }];
    
    for (let i = 1; i <= numBets; i++) {
      const betSize = Math.min(strategy.getBetSize(bankroll), bankroll * 0.99); // Cap at 99% to avoid ruin
      if (betSize <= 0) {
        path.push({ bet: i, wealth: bankroll });
        continue;
      }
      
      const win = Math.random() < p;
      if (win) {
        bankroll = bankroll - betSize + betSize * (1 + b); // Win: lose bet + get bet + profit
      } else {
        bankroll = bankroll - betSize; // Lose: just lose bet
      }
      
      bankroll = Math.max(0, bankroll); // Can't go negative
      path.push({ bet: i, wealth: bankroll });
    }
    
    return path;
  };

  // Run multiple simulations for expected value
  const getExpectedPath = (strategy, simulations = 100) => {
    const paths = [];
    for (let i = 0; i < simulations; i++) {
      paths.push(simulateStrategy(strategy));
    }
    
    // Average across simulations
    const expectedPath = [];
    for (let bet = 0; bet <= numBets; bet++) {
      const avgWealth = paths.reduce((sum, path) => sum + path[bet].wealth, 0) / simulations;
      expectedPath.push({ bet, wealth: avgWealth });
    }
    
    return expectedPath;
  };

  // Calculate metrics for each strategy
  const calculateMetrics = (strategy) => {
    const paths = [];
    for (let i = 0; i < 1000; i++) {
      paths.push(simulateStrategy(strategy));
    }
    
    const finalWealths = paths.map(path => path[path.length - 1].wealth);
    const avgFinal = finalWealths.reduce((a, b) => a + b, 0) / finalWealths.length;
    const stdDev = Math.sqrt(
      finalWealths.reduce((sum, w) => sum + Math.pow(w - avgFinal, 2), 0) / finalWealths.length
    );
    const ruinCount = finalWealths.filter(w => w < 10).length; // Ruin = less than $10
    
    return {
      avgFinal,
      stdDev,
      ruinRate: ruinCount / finalWealths.length,
      cagr: Math.pow(avgFinal / 1000, 1 / (numBets / 52)) - 1 // Assuming weekly bets
    };
  };

  const allMetrics = strategies.map(strategy => ({
    ...strategy,
    ...calculateMetrics(strategy)
  }));

  // Graph dimensions
  const width = 600;
  const height = 350;
  const padding = 50;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;

  // Get all paths for graphing
  const allPaths = strategies.map(strategy => ({
    ...strategy,
    path: getExpectedPath(strategy, 200)
  }));

  // Find min/max for scaling
  const allWealths = allPaths.flatMap(s => s.path.map(p => p.wealth));
  const minWealth = Math.max(0, Math.min(...allWealths) * 0.9);
  const maxWealth = Math.max(...allWealths) * 1.1;
  const wealthRange = maxWealth - minWealth;

  return (
    <div className="kelly-graph">
      <div className="graph-controls">
        <div className="control-group">
          <label htmlFor="win-prob-comp">
            Win Probability (p): <strong>{(p * 100).toFixed(0)}%</strong>
          </label>
          <input
            id="win-prob-comp"
            type="range"
            min="0.51"
            max="0.95"
            step="0.01"
            value={p}
            onChange={(e) => setP(parseFloat(e.target.value))}
          />
        </div>
        <div className="control-group">
          <label htmlFor="odds-comp">
            Payout Ratio (b): <strong>{b.toFixed(2)}</strong>
          </label>
          <input
            id="odds-comp"
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={b}
            onChange={(e) => setB(parseFloat(e.target.value))}
          />
        </div>
        <div className="control-group">
          <label htmlFor="num-bets-comp">
            Number of Bets: <strong>{numBets}</strong>
          </label>
          <input
            id="num-bets-comp"
            type="range"
            min="50"
            max="200"
            step="10"
            value={numBets}
            onChange={(e) => setNumBets(parseInt(e.target.value))}
          />
        </div>
      </div>

      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid */}
        <defs>
          <pattern id="grid-comp" width="40" height="30" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 30" fill="none" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid-comp)" />
        
        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--color-text)" strokeWidth="2"/>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--color-text)" strokeWidth="2"/>
        
        {/* Graph lines */}
        {allPaths.map((strategy, idx) => {
          const pathData = strategy.path
            .map((point, i) => {
              const x = padding + (point.bet / numBets) * graphWidth;
              const y = padding + graphHeight - ((point.wealth - minWealth) / wealthRange) * graphHeight;
              return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
            })
            .join(' ');
          
          return (
            <path
              key={idx}
              d={pathData}
              fill="none"
              stroke={strategy.color}
              strokeWidth="2"
              opacity="0.8"
            />
          );
        })}
        
        {/* Labels */}
        <text x={width / 2} y={height - 10} textAnchor="middle" fill="var(--color-text)" fontSize="12" fontFamily="Inter, sans-serif">
          Number of Bets
        </text>
        <text x={15} y={height / 2} textAnchor="middle" fill="var(--color-text)" fontSize="12" fontFamily="Inter, sans-serif" transform={`rotate(-90, 15, ${height / 2})`}>
          Expected Wealth ($)
        </text>
        
        {/* Title */}
        <text x={width / 2} y={20} textAnchor="middle" fill="var(--color-text)" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="bold">
          Strategy Comparison: Expected Wealth Over Time
        </text>
      </svg>

      {/* Legend */}
      <div className="strategy-legend">
        {allPaths.map((strategy, idx) => (
          <div key={idx} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: strategy.color }}></div>
            <span>{strategy.name}</span>
          </div>
        ))}
      </div>

      {/* Metrics Table */}
      <div className="strategy-metrics">
        <table>
          <thead>
            <tr>
              <th>Strategy</th>
              <th>Avg Final Wealth</th>
              <th>Std Dev</th>
              <th>Ruin Rate</th>
              <th>CAGR</th>
            </tr>
          </thead>
          <tbody>
            {allMetrics.map((strategy, idx) => (
              <tr key={idx}>
                <td><strong>{strategy.name}</strong></td>
                <td>${strategy.avgFinal.toFixed(0)}</td>
                <td>${strategy.stdDev.toFixed(0)}</td>
                <td>{(strategy.ruinRate * 100).toFixed(1)}%</td>
                <td>{(strategy.cagr * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StrategyComparison;

