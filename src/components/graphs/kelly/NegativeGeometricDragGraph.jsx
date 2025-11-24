import React from 'react';
import './KellyGraph.scss';

const NegativeGeometricDragGraph = () => {
  // Generate data points for NGD = 1 - r²
  // r ranges from 0 to 1
  const dataPoints = [];
  for (let r = 0; r <= 1.0; r += 0.01) {
    const ngd = 1 - Math.pow(r, 2);
    dataPoints.push({ r, ngd });
  }
  
  // Graph dimensions
  const width = 400;
  const height = 250;
  const padding = 40;
  const graphWidth = width - 2 * padding;
  const graphHeight = height - 2 * padding;
  
  // Scale
  const minR = 0;
  const maxR = 1.0;
  const rRange = maxR - minR;
  
  const maxNGD = Math.max(...dataPoints.map(d => d.ngd));
  const minNGD = Math.min(...dataPoints.map(d => d.ngd));
  const ngdRange = maxNGD - minNGD;
  
  // Generate path
  const pathData = dataPoints
    .map((point, i) => {
      const x = padding + ((point.r - minR) / rRange) * graphWidth;
      const y = padding + graphHeight - ((point.ngd - minNGD) / ngdRange) * graphHeight;
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');
  
  // Mark key points
  const zeroR = padding + ((0 - minR) / rRange) * graphWidth;
  const zeroNGD = padding + graphHeight - ((1 - minNGD) / ngdRange) * graphHeight;
  
  const oneR = padding + ((1 - minR) / rRange) * graphWidth;
  const oneNGD = padding + graphHeight - ((0 - minNGD) / ngdRange) * graphHeight;
  
  return (
    <div className="kelly-graph">
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Grid */}
        <defs>
          <pattern id="grid6" width="40" height="25" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 25" fill="none" stroke="var(--color-border)" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#grid6)" />
        
        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="var(--color-text)" strokeWidth="2"/>
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--color-text)" strokeWidth="2"/>
        
        {/* Zero line for NGD */}
        <line x1={padding} y1={zeroNGD} x2={width - padding} y2={zeroNGD} stroke="var(--color-text-muted)" strokeWidth="1" strokeDasharray="2,2" opacity="0.5"/>
        
        {/* Graph line */}
        <path d={pathData} fill="none" stroke="var(--color-accent-primary)" strokeWidth="2"/>
        
        {/* Labels */}
        <text x={width / 2} y={height - 10} textAnchor="middle" fill="var(--color-text)" fontSize="12" fontFamily="Inter, sans-serif">
          Compounding Return Rate (r)
        </text>
        <text x={15} y={height / 2} textAnchor="middle" fill="var(--color-text)" fontSize="12" fontFamily="Inter, sans-serif" transform={`rotate(-90, 15, ${height / 2})`}>
          Negative Geometric Drag (NGD)
        </text>
        
        {/* Axis values */}
        <text x={padding} y={height - padding + 20} textAnchor="middle" fill="var(--color-text-muted)" fontSize="10" fontFamily="Inter, sans-serif">0</text>
        <text x={width - padding} y={height - padding + 20} textAnchor="middle" fill="var(--color-text-muted)" fontSize="10" fontFamily="Inter, sans-serif">1</text>
        
        <text x={padding - 5} y={height - padding + 5} textAnchor="end" fill="var(--color-text-muted)" fontSize="9" fontFamily="Inter, sans-serif">0</text>
        <text x={padding - 5} y={padding + 5} textAnchor="end" fill="var(--color-text-muted)" fontSize="9" fontFamily="Inter, sans-serif">1</text>
        
        {/* Title */}
        <text x={width / 2} y={20} textAnchor="middle" fill="var(--color-text)" fontSize="14" fontFamily="Inter, sans-serif" fontWeight="bold">
          Negative Geometric Drag: NGD = 1 - r²
        </text>
      </svg>
      <p className="graph-caption">
        Higher volatility (lower r) increases drag.
      </p>
    </div>
  );
};

export default NegativeGeometricDragGraph;

