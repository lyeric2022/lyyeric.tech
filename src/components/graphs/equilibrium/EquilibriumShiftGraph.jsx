import React from 'react';
import './EquilibriumShiftGraph.scss';

const EquilibriumShiftGraph = () => {
  // Graph dimensions
  const width = 500;
  const height = 300;
  const padding = 50;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;
  
  // Calculate equilibrium position over time
  // Starts at unfair position (0.2 - favoring Group A), converges toward fair (0.5)
  // Using exponential convergence: equilibrium(t) = 0.2 + (0.5 - 0.2) * (1 - e^(-2t))
  const calculateEquilibrium = (t) => {
    const unfairStart = 0.2; // Initial unfair equilibrium (favors Group A)
    const fairTarget = 0.5;  // Fair equilibrium (perfect balance)
    return unfairStart + (fairTarget - unfairStart) * (1 - Math.exp(-2 * t));
  };
  
  // Generate convergence curve
  const convergenceCurve = [];
  for (let t = 0; t <= 1; t += 0.01) {
    const equilibriumValue = calculateEquilibrium(t);
    convergenceCurve.push({ t, value: equilibriumValue });
  }
  
  // Convert to SVG coordinates
  const toSVGX = (t) => padding + t * graphWidth;
  const toSVGY = (value) => padding + graphHeight - (value * graphHeight);
  
  // Create path for convergence curve
  const convergencePath = convergenceCurve
    .map((point, i) => {
      const x = toSVGX(point.t);
      const y = toSVGY(point.value);
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');
  
  // Fairness line (target)
  const fairnessY = toSVGY(0.5);
  
  return (
    <div className="equilibrium-graph">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid */}
        <defs>
          <pattern id="grid" width="50" height="30" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 30" fill="none" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid)" />
        
        {/* Axes */}
        <line 
          x1={padding} 
          y1={padding} 
          x2={padding} 
          y2={height - padding} 
          stroke="var(--color-text)" 
          strokeWidth="2"
        />
        <line 
          x1={padding} 
          y1={height - padding} 
          x2={width - padding} 
          y2={height - padding} 
          stroke="var(--color-text)" 
          strokeWidth="2"
        />
        
        {/* Fairness target line (0.5 = perfect fairness) */}
        <line 
          x1={padding} 
          y1={fairnessY} 
          x2={width - padding} 
          y2={fairnessY} 
          stroke="var(--color-accent-primary)" 
          strokeWidth="2"
          strokeDasharray="5,5"
          opacity="0.5"
        />
        <text 
          x={width - padding + 5} 
          y={fairnessY + 4} 
          fill="var(--color-accent-primary)" 
          fontSize="10" 
          fontFamily="Inter, sans-serif"
          fontWeight="500"
        >
          Fair (0.5)
        </text>
        
        {/* Convergence curve */}
        <path 
          d={convergencePath} 
          fill="none" 
          stroke="var(--color-accent-secondary)" 
          strokeWidth="3"
        />
        
        {/* Labels */}
        <text 
          x={width / 2} 
          y={height - 10} 
          textAnchor="middle" 
          fill="var(--color-text)" 
          fontSize="12" 
          fontFamily="Inter, sans-serif"
        >
          Time
        </text>
        <text 
          x={15} 
          y={height / 2} 
          textAnchor="middle" 
          fill="var(--color-text)" 
          fontSize="12" 
          fontFamily="Inter, sans-serif" 
          transform={`rotate(-90, 15, ${height / 2})`}
        >
          Equilibrium Position
        </text>
        
        {/* Axis values */}
        <text 
          x={padding} 
          y={height - padding + 20} 
          textAnchor="middle" 
          fill="var(--color-text-muted)" 
          fontSize="10" 
          fontFamily="Inter, sans-serif"
        >
          t₀
        </text>
        <text 
          x={width - padding} 
          y={height - padding + 20} 
          textAnchor="middle" 
          fill="var(--color-text-muted)" 
          fontSize="10" 
          fontFamily="Inter, sans-serif"
        >
          t₁
        </text>
        <text 
          x={padding - 5} 
          y={padding + 5} 
          textAnchor="end" 
          fill="var(--color-text-muted)" 
          fontSize="10" 
          fontFamily="Inter, sans-serif"
        >
          1.0
        </text>
        <text 
          x={padding - 5} 
          y={height - padding + 5} 
          textAnchor="end" 
          fill="var(--color-text-muted)" 
          fontSize="10" 
          fontFamily="Inter, sans-serif"
        >
          0.0
        </text>
        
        {/* Title */}
        <text 
          x={width / 2} 
          y={20} 
          textAnchor="middle" 
          fill="var(--color-text)" 
          fontSize="14" 
          fontFamily="Inter, sans-serif" 
          fontWeight="bold"
        >
          Convergence Toward Fairer Equilibrium
        </text>
      </svg>
    </div>
  );
};

export default EquilibriumShiftGraph;

