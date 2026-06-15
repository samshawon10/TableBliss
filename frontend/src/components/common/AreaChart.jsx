const AreaChart = ({ data, height = 120, color = '#8b5cf6', gradientId = 'areaGradient' }) => {
  if (!data || data.length === 0) return <div className="flex items-center justify-center" style={{ height }}><p className="text-gray-400 text-xs">No data</p></div>;

  const values = data.map(d => d.value || d.count || 0);
  const maxVal = Math.max(...values, 1);
  const width = data.length * 50;
  const padding = { top: 10, bottom: 20, left: 0, right: 0 };
  const chartW = Math.max(width, 200);
  const chartH = height;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * (chartW - padding.left - padding.right);
    const y = padding.top + (1 - (d.value || d.count || 0) / maxVal) * (chartH - padding.top - padding.bottom);
    return `${x},${y}`;
  });

  const areaBottom = chartH - padding.bottom;
  const areaPoints = `0,${areaBottom} ${points.join(' ')} ${chartW},${areaBottom}`;
  const linePoints = points.join(' ');

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((pct, i) => (
        <line key={i} x1={padding.left} y1={padding.top + (1 - pct) * (chartH - padding.top - padding.bottom)} x2={chartW - padding.right} y2={padding.top + (1 - pct) * (chartH - padding.top - padding.bottom)}
          stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4,4" className="dark:opacity-30" />
      ))}
      {/* Area fill */}
      <polygon points={areaPoints} fill={`url(#${gradientId})`} />
      {/* Line */}
      <polyline points={linePoints} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {data.map((d, i) => {
        const [x, y] = points[i].split(',');
        return <circle key={i} cx={x} cy={y} r="3" fill={color} stroke="white" strokeWidth="2" />;
      })}
      {/* Labels */}
      {data.map((d, i) => {
        const x = padding.left + (i / (data.length - 1 || 1)) * (chartW - padding.left - padding.right);
        const label = d.label || d._id || '';
        return (
          <text key={i} x={x} y={chartH - 4} textAnchor="middle" className="text-[9px] fill-gray-400" fontSize="9">
            {label.length > 4 ? label.slice(0, 4) : label}
          </text>
        );
      })}
    </svg>
  );
};

export default AreaChart;