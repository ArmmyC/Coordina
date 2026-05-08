interface MiniSparklineProps {
  values: number[];
  tone?: "red" | "amber" | "teal" | "green";
}

const strokeByTone = {
  red: "#ef4444",
  amber: "#f59e0b",
  teal: "#07899a",
  green: "#16a34a",
};

export function MiniSparkline({ values, tone = "teal" }: MiniSparklineProps) {
  const width = 90;
  const height = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1 || 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg aria-hidden="true" viewBox={`0 0 ${width} ${height}`} className="h-8 w-24 overflow-visible">
      <polyline points={points} fill="none" stroke={strokeByTone[tone]} strokeLinecap="round" strokeWidth="2" />
      <circle
        cx={width}
        cy={height - ((values[values.length - 1] - min) / range) * (height - 4) - 2}
        r="2.8"
        fill={strokeByTone[tone]}
      />
    </svg>
  );
}
