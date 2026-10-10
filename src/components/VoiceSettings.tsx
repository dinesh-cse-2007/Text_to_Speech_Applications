import { Sliders, Gauge, Music2, Volume2 } from 'lucide-react';

interface VoiceSettingsProps {
  rate: number;
  pitch: number;
  volume: number;
  onRateChange: (v: number) => void;
  onPitchChange: (v: number) => void;
  onVolumeChange: (v: number) => void;
}

function Slider({
  icon: Icon,
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-medium">
          <Icon className="w-4 h-4 text-cyan-400" />
          {label}
        </div>
        <span className="text-slate-400 text-xs font-mono tabular-nums bg-slate-800/60 px-2 py-0.5 rounded">
          {value.toFixed(1)}x
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-700 accent-cyan-400
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400
          [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-cyan-400/40
          [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-125"
      />
    </div>
  );
}

export function VoiceSettings({
  rate,
  pitch,
  volume,
  onRateChange,
  onPitchChange,
  onVolumeChange,
}: VoiceSettingsProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-slate-200 text-sm font-semibold">
        <Sliders className="w-4 h-4 text-cyan-400" />
        Voice Settings
      </div>
      <Slider
        icon={Gauge}
        label="Speed"
        value={rate}
        min={0.5}
        max={2}
        step={0.1}
        onChange={onRateChange}
      />
      <Slider
        icon={Music2}
        label="Pitch"
        value={pitch}
        min={0}
        max={2}
        step={0.1}
        onChange={onPitchChange}
      />
      <Slider
        icon={Volume2}
        label="Volume"
        value={volume}
        min={0}
        max={1}
        step={0.1}
        onChange={onVolumeChange}
      />
    </div>
  );
}
