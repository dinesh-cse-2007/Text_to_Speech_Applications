import { useEffect, useState } from 'react';

interface WaveformVisualizerProps {
  active: boolean;
  barCount?: number;
}

export function WaveformVisualizer({ active, barCount = 48 }: WaveformVisualizerProps) {
  const [bars, setBars] = useState<number[]>(() => Array(barCount).fill(3));

  useEffect(() => {
    if (!active) {
      setBars(Array(barCount).fill(3));
      return;
    }

    const interval = setInterval(() => {
      setBars((prev) =>
        prev.map(() => Math.random() * 0.85 + 0.15)
      );
    }, 100);

    return () => clearInterval(interval);
  }, [active, barCount]);

  return (
    <div className="flex items-center justify-center gap-[3px] h-20 w-full">
      {bars.map((height, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-gradient-to-t from-cyan-500 to-teal-300 transition-all duration-100 ease-out"
          style={{
            height: `${Math.max(height * 100, 4)}%`,
            opacity: active ? 0.9 : 0.2,
          }}
        />
      ))}
    </div>
  );
}
